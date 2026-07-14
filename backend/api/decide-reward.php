<?php
require dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST 요청만 지원합니다.'], 405);
}

$input = body();
$requestId = (int) ($input['request_id'] ?? 0);
$decision = $input['decision'] ?? '';
$pin = (string) ($input['pin'] ?? '');

if ($requestId < 1 || !in_array($decision, ['approved', 'rejected'], true)) {
    respond(['error' => '요청 ID와 처리 결과를 확인하세요.'], 422);
}
verifyParentPin($config, $pin);

$db->beginTransaction();
try {
    $stmt = $db->prepare("SELECT rr.id, rr.status, r.id AS reward_id, r.name, r.cost
        FROM reward_requests rr
        JOIN rewards r ON r.id = rr.reward_id
        WHERE rr.id = ?");
    $stmt->execute([$requestId]);
    $request = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        $db->rollBack();
        respond(['error' => '보상 요청을 찾을 수 없습니다.'], 404);
    }
    if ($request['status'] !== 'pending') {
        $db->rollBack();
        respond(['error' => '이미 처리된 요청입니다.'], 409);
    }

    if ($decision === 'approved' && points($db) < (int) $request['cost']) {
        $db->rollBack();
        respond(['error' => '현재 포인트가 부족합니다.'], 409);
    }

    $update = $db->prepare('UPDATE reward_requests SET status = ?, decided_at = ? WHERE id = ? AND status = ?');
    $update->execute([$decision, date(DATE_ATOM), $requestId, 'pending']);
    if ($update->rowCount() !== 1) {
        throw new RuntimeException('요청 상태 변경 실패');
    }

    if ($decision === 'approved') {
        $duplicate = $db->prepare("SELECT COUNT(*) FROM point_ledger
            WHERE reference_type = 'reward_request' AND reference_id = ?");
        $duplicate->execute([$requestId]);
        if ((int) $duplicate->fetchColumn() > 0) {
            throw new RuntimeException('중복 포인트 차감 감지');
        }

        $ledger = $db->prepare("INSERT INTO point_ledger
            (amount, reason, reference_type, reference_id, created_at)
            VALUES (?, ?, 'reward_request', ?, ?)");
        $ledger->execute([
            -((int) $request['cost']),
            $request['name'] . ' 사용',
            $requestId,
            date(DATE_ATOM),
        ]);
    }

    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    respond(['error' => '보상 요청 처리에 실패했습니다.'], 500);
}

respond([
    'request_id' => $requestId,
    'status' => $decision,
    'points' => points($db),
]);
