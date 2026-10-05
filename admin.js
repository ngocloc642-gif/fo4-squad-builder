document.addEventListener('DOMContentLoaded', () => {
    // Gọi hàm load danh sách ngay khi vào trang
    loadPlayers();

    // Bắt sự kiện Gửi Form Thêm Cầu Thủ
    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault(); // Ngăn trình duyệt load lại trang

        // Gom dữ liệu từ các ô input
        const player = {
            name: document.getElementById('a-name').value,
            season: document.getElementById('a-season').value,
            position: document.getElementById('a-pos').value,
            ovr: document.getElementById('a-ovr').value,
            salary: document.getElementById('a-salary').value,
            price: document.getElementById('a-price').value
        };

        try {
            // Gửi dữ liệu qua admin_api.php bằng phương thức POST
            const res = await fetch('admin_api.php?action=add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player)
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                alert("✅ " + data.message);
                document.getElementById('admin-form').reset(); // Xóa trắng form
                loadPlayers(); // Load lại bảng danh sách mới nhất
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối đến máy chủ!');
        }
    });
});

// Hàm lấy dữ liệu cầu thủ từ Database và in ra bảng
async function loadPlayers() {
    try {
        const res = await fetch('admin_api.php?action=list');
        const players = await res.json();
        
        const tbody = document.getElementById('admin-table-body');
        tbody.innerHTML = ''; // Xóa dữ liệu cũ

        players.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.season}</td>
                    <td>${p.position}</td>
                    <td style="color:#ffd700; font-weight:bold;">${p.ovr}</td>
                    <td>${p.salary}</td>
                    <td><button class="btn-del" onclick="deletePlayer(${p.id})">Xóa</button></td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Lỗi khi tải danh sách:', err);
    }
}

// Hàm Xóa Cầu thủ
async function deletePlayer(id) {
    if (confirm("⚠️ Bạn có chắc chắn muốn xóa cầu thủ này không?")) {
        try {
            const res = await fetch(`admin_api.php?action=delete&id=${id}`);
            const data = await res.json();
            
            if (data.status === 'success') {
                loadPlayers(); // Load lại bảng sau khi xóa
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Lỗi khi xóa cầu thủ!');
        }
    }
}