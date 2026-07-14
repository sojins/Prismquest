<?php
require dirname(__DIR__) . '/bootstrap.php';

$missionRequests = $db->query("SELECT mr.id, mr.request_date, mr.status, mr.requested_at,
    m.id AS mission_id, m.title, m.points
    FROM mission_requests mr
    JOIN missions m ON m.id = mr.mission_id
    WHERE mr.status = 'pending'
    ORDER BY mr.requested_at ASC")
    ->fetchAll(PDO::FETCH_ASSOC);
foreach ($missionRequests as &$request) {
    $request['id'] = (int) $request['id'];
    $request['mission_id'] = (int) $request['mission_id'];
    $request['points'] = (int) $request['points'];
}
unset($request);

$rewardRequests = $db->query("SELECT rr.id, rr.status, rr.requested_at,
    r.id AS reward_id, r.name, r.cost
    FROM reward_requests rr
    JOIN rewards r ON r.id = rr.reward_id
    WHERE rr.status = 'pending'
    ORDER BY rr.requested_at ASC")
    ->fetchAll(PDO::FETCH_ASSOC);
foreach ($rewardRequests as &$request) {
    $request['id'] = (int) $request['id'];
    $request['reward_id'] = (int) $request['reward_id'];
    $request['cost'] = (int) $request['cost'];
}
unset($request);

respond([
    'points' => points($db),
    'mission_requests' => $missionRequests,
    'reward_requests' => $rewardRequests,
]);
