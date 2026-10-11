<?php
require_once 'db.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

// 1. LẤY DANH SÁCH CẦU THỦ
if ($action === 'list') {
    $stmt = $pdo->query("SELECT * FROM players ORDER BY id DESC");
    $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($players);
    exit;
}

// 2. THÊM CẦU THỦ (Nhận dữ liệu từ Form)
if ($action === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = $data['name'] ?? '';
    $season = $data['season'] ?? '';
    $position = $data['position'] ?? '';
    $ovr = $data['ovr'] ?? 0;
    $salary = $data['salary'] ?? 0;
    $avatar_url = $data['avatar_url'] ?? ''; // Lấy link ảnh

    // Câu lệnh INSERT chuẩn: 6 cột tương ứng 6 dấu ?
    $stmt = $pdo->prepare("INSERT INTO players (name, season, position, ovr, salary, avatar_url) VALUES (?, ?, ?, ?, ?, ?)");
    
    if ($stmt->execute([$name, $season, $position, $ovr, $salary, $avatar_url])) {
        echo json_encode(["status" => "success", "message" => "Đã thêm cầu thủ vào Database!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi khi lưu vào Database!"]);
    }
    exit;
}

// 3. XÓA CẦU THỦ
if ($action === 'delete') {
    $id = $_GET['id'] ?? 0;
    $stmt = $pdo->prepare("DELETE FROM players WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi khi xóa cầu thủ!"]);
    }
    exit;
}

// 4. SỬA (CẬP NHẬT) CẦU THỦ
if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $id = $data['id'] ?? 0;
    $name = $data['name'] ?? '';
    $season = $data['season'] ?? '';
    $position = $data['position'] ?? '';
    $ovr = $data['ovr'] ?? 0;
    $salary = $data['salary'] ?? 0;
    $avatar_url = $data['avatar_url'] ?? '';

    // Câu lệnh UPDATE chuẩn: 6 cột và 1 ID ở cuối
    $stmt = $pdo->prepare("UPDATE players SET name=?, season=?, position=?, ovr=?, salary=?, avatar_url=? WHERE id=?");
    
    if ($stmt->execute([$name, $season, $position, $ovr, $salary, $avatar_url, $id])) {
        echo json_encode(["status" => "success", "message" => "Đã cập nhật thông tin cầu thủ!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Lỗi khi cập nhật!"]);
    }
    exit;
}
?>