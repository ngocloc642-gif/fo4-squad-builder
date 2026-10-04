<?php
// Cho phép các nguồn khác gọi API (CORS) và định dạng kết quả trả về là JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Thông tin kết nối CSDL (Cấu hình mặc định của XAMPP)
$host = 'localhost';
$db   = 'fo4_squad_builder';
$user = 'root';
$pass = '';

try {
    // Kết nối MySQL bằng PDO
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Lấy toàn bộ cầu thủ
    $stmt = $pdo->query("SELECT * FROM players");
    $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ép kiểu dữ liệu số nguyên (vì PDO mặc định trả về chuỗi)
    foreach ($players as &$p) {
        $p['id'] = (int)$p['id'];
        $p['ovr'] = (int)$p['ovr'];
        $p['salary'] = (int)$p['salary'];
        $p['price'] = (int)$p['price'];
    }

    // Trả về JSON cho Frontend
    echo json_encode($players);

} catch(PDOException $e) {
    // Nếu có lỗi, trả về thông báo lỗi
    echo json_encode(["error" => "Lỗi kết nối CSDL: " . $e->getMessage()]);
}
?>