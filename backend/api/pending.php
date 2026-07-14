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

respond([
    'points' => points($db),
    'mission_requests' => $missionRequests,
]);
