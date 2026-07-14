<?php
require dirname(__DIR__) . '/bootstrap.php';

$today = date('Y-m-d');

$missions = $db->query("SELECT id, title, points FROM missions WHERE enabled = 1 ORDER BY id")
    ->fetchAll(PDO::FETCH_ASSOC);
$requestStmt = $db->prepare("SELECT mission_id, status FROM mission_requests WHERE request_date = ? ORDER BY id DESC");
$requestStmt->execute([$today]);
$statuses = [];
foreach ($requestStmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    if (!array_key_exists($row['mission_id'], $statuses)) {
        $statuses[$row['mission_id']] = $row['status'];
    }
}
foreach ($missions as &$mission) {
    $mission['id'] = (int) $mission['id'];
    $mission['points'] = (int) $mission['points'];
    $mission['status'] = $statuses[$mission['id']] ?? null;
}
unset($mission);

$rewards = $db->query("SELECT id, name, cost FROM rewards WHERE enabled = 1 ORDER BY id")
    ->fetchAll(PDO::FETCH_ASSOC);
$rewardStatusRows = $db->query("SELECT reward_id, status FROM reward_requests ORDER BY id DESC")
    ->fetchAll(PDO::FETCH_ASSOC);
$rewardStatuses = [];
foreach ($rewardStatusRows as $row) {
    if (!array_key_exists($row['reward_id'], $rewardStatuses)) {
        $rewardStatuses[$row['reward_id']] = $row['status'];
    }
}
foreach ($rewards as &$reward) {
    $reward['id'] = (int) $reward['id'];
    $reward['cost'] = (int) $reward['cost'];
    $reward['status'] = $rewardStatuses[$reward['id']] ?? null;
}
unset($reward);

$ledger = $db->query("SELECT id, amount, reason, reference_type, reference_id, created_at
    FROM point_ledger ORDER BY id DESC LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);
foreach ($ledger as &$entry) {
    $entry['id'] = (int) $entry['id'];
    $entry['amount'] = (int) $entry['amount'];
    $entry['reference_id'] = $entry['reference_id'] === null ? null : (int) $entry['reference_id'];
}
unset($entry);

respond([
    'date' => $today,
    'points' => points($db),
    'missions' => $missions,
    'rewards' => $rewards,
    'ledger' => $ledger,
]);
