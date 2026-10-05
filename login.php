<?php
require_once 'db.php';

// Nhận dữ liệu JSON từ Frontend gửi lên
$input = json_decode(file_get_contents("php://input"), true);

$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!"]);
    exit();
}

// Kiểm tra tài khoản trong CSDL
$stmt = $pdo->prepare("SELECT id, username, password, fullname, role FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    // Đăng nhập thành công, không trả về mật khẩu
    unset($user['password']);
    
    echo json_encode([
            "status" => "success",
            "message" => "Đăng nhập thành công!",
            "role" => $user['role'], // Dành cho admin_login.html kiểm tra
            "user" => [              // Dành cho app.js lưu thông tin hiển thị (USER)
                "fullname" => $user['fullname'],
                "username" => $user['username'],
                "role" => $user['role']
            ]
        ]);
} else {
    echo json_encode(["status" => "error", "message" => "Tên đăng nhập hoặc mật khẩu không chính xác!"]);
}
?>