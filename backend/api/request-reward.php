<?php
require dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'POST 요청만 지원합니다.'], 405);
}

$input = body();
$rewardId = (int) ($input['reward_id'] ?? 0);
if ($rewardId < 1) {
    respond(['error' => '보상을 선택하세요.'], 422);
}

$stmt = $db->prepare('SELECT id, name, cost FROM rewards WHERE id = ? AND enabled = 1');
$stmt->execute([$rewardId]);
$reward = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$reward) {
    respond(['error' => '보상을 찾을 수 없습니다.'], 404);
}

if (points($db) < (int) $reward['cost']) {
    respond(['error' => '포인트가 부족합니다.'], 409);
}

$existing = $db->prepare("SELECT COUNT(*) FROM reward_requests WHERE reward_id = ? AND status = 'pending'");
$existing->execute([$rewardId]);
if ((int) $existing->fetchColumn() > 0) {
    respond(['error' => '이미 승인 대기 중인 보상입니다.'], 409);
}

$insert = $db->prepare("INSERT INTO reward_requests (reward_id, status, requested_at) VALUES (?, 'pending', ?)");
$insert->execute([$rewardId, date(DATE_ATOM)]);

respond([
    'request_id' => (int) $db->lastInsertId(),
    'reward' => [
        'id' => (int) $reward['id'],
        'name' => $reward['name'],
        'cost' => (int) $reward['cost'],
    ],
], 201);
