<?php
require_once 'db.php';

$input = json_decode(file_get_contents("php://input"), true);

$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');
$fullname = trim($input['fullname'] ?? '');

if (empty($username) || empty($password) || empty($fullname)) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ thông tin!"]);
    exit();
}

// Kiểm tra tên đăng nhập đã tồn tại chưa
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);

if ($stmt->fetch()) {
    echo json_encode(["status" => "error", "message" => "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!"]);
    exit();
}

// Mã hóa mật khẩu an toàn
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

// Thêm tài khoản mới (Mặc định role = 'user')
$insert_stmt = $pdo->prepare("INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, 'user')");

if ($insert_stmt->execute([$username, $hashed_password, $fullname])) {
    echo json_encode(["status" => "success", "message" => "Đăng ký tài khoản thành công! Vui lòng đăng nhập."]);
} else {
    echo json_encode(["status" => "error", "message" => "Có lỗi xảy ra, không thể tạo tài khoản!"]);
}
?>