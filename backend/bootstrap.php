<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = require __DIR__ . '/config.php';
$dataDir = dirname($config['db_path']);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0775, true);
}

$db = new PDO('sqlite:' . $config['db_path']);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('PRAGMA foreign_keys = ON');

$db->exec("CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    points INTEGER NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
)");
$db->exec("CREATE TABLE IF NOT EXISTS mission_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL,
    request_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TEXT NOT NULL,
    decided_at TEXT,
    FOREIGN KEY (mission_id) REFERENCES missions(id)
)");
$db->exec("CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1
)");
$db->exec("CREATE TABLE IF NOT EXISTS reward_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reward_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    requested_at TEXT NOT NULL,
    decided_at TEXT,
    FOREIGN KEY (reward_id) REFERENCES rewards(id)
)");
$db->exec("CREATE TABLE IF NOT EXISTS point_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_type TEXT,
    reference_id INTEGER,
    created_at TEXT NOT NULL
)");

$missionCount = (int) $db->query('SELECT COUNT(*) FROM missions')->fetchColumn();
if ($missionCount === 0) {
    $stmt = $db->prepare('INSERT INTO missions (id, title, points) VALUES (?, ?, ?)');
    foreach ([[1,'수학 20분',2],[2,'영어 20분',2],[3,'독서 15분',1],[4,'방 정리',1],[5,'내일 준비물 챙기기',1]] as $row) {
        $stmt->execute($row);
    }
}

$rewardCount = (int) $db->query('SELECT COUNT(*) FROM rewards')->fetchColumn();
if ($rewardCount === 0) {
    $stmt = $db->prepare('INSERT INTO rewards (id, name, cost) VALUES (?, ?, ?)');
    foreach ([[1,'아이프리 1판',10],[2,'아이프리 2판',25],[3,'용산 원정권',50]] as $row) {
        $stmt->execute($row);
    }
}

function body(): array {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw ?: '{}', true);
    return is_array($decoded) ? $decoded : [];
}

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function points(PDO $db): int {
    return (int) $db->query('SELECT COALESCE(SUM(amount), 0) FROM point_ledger')->fetchColumn();
}

function verifyParentPin(array $config, string $pin): void {
    if (!password_verify($pin, $config['parent_pin_hash'])) {
        respond(['error' => '부모 PIN이 올바르지 않습니다.'], 403);
    }
}
