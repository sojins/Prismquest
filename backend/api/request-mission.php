<?php
require dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST 요청만 지원합니다.'], 405);
}

$input = body();
$missionIds = $input['mission_ids'] ?? [];
if (!is_array($missionIds) || count($missionIds) === 0) {
    respond(['error' => '요청할 미션을 하나 이상 선택하세요.'], 422);
}

$missionIds = array_values(array_unique(array_map('intval', $missionIds)));
$today = date('Y-m-d');
$now = date(DATE_ATOM);

$checkMission = $db->prepare('SELECT id FROM missions WHERE id = ? AND enabled = 1');
$checkExisting = $db->prepare("SELECT id, status FROM mission_requests
    WHERE mission_id = ? AND request_date = ? ORDER BY id DESC LIMIT 1");
$insert = $db->prepare("INSERT INTO mission_requests
    (mission_id, request_date, status, requested_at) VALUES (?, ?, 'pending', ?)");

$created = [];
$skipped = [];
$db->beginTransaction();
try {
    foreach ($missionIds as $missionId) {
        $checkMission->execute([$missionId]);
        if (!$checkMission->fetchColumn()) {
            $skipped[] = ['mission_id' => $missionId, 'reason' => '존재하지 않는 미션'];
            continue;
        }

        $checkExisting->execute([$missionId, $today]);
        $existing = $checkExisting->fetch(PDO::FETCH_ASSOC);
        if ($existing && in_array($existing['status'], ['pending', 'approved'], true)) {
            $skipped[] = ['mission_id' => $missionId, 'reason' => '이미 요청되었거나 승인된 미션'];
            continue;
        }

        $insert->execute([$missionId, $today, $now]);
        $created[] = (int) $db->lastInsertId();
    }
    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    respond(['error' => '미션 요청 저장에 실패했습니다.'], 500);
}

respond([
    'created_request_ids' => $created,
    'skipped' => $skipped,
], count($created) > 0 ? 201 : 200);
