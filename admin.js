let adminPlayersList = []; // Biến toàn cục để lưu danh sách cầu thủ hiện tại

document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();

    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const id = document.getElementById('a-id').value;
        const player = {
            id: id, // Nếu form đang ở chế độ thêm mới thì id này rỗng
            name: document.getElementById('a-name').value,
            season: document.getElementById('a-season').value,
            position: document.getElementById('a-pos').value,
            ovr: document.getElementById('a-ovr').value,
            salary: document.getElementById('a-salary').value,
            price: document.getElementById('a-price').value
        };

        // Nếu có ID thì là chức năng Cập nhật (update), không có ID thì là Thêm mới (add)
        const actionUrl = id ? 'admin_api.php?action=update' : 'admin_api.php?action=add';

        try {
            const res = await fetch(actionUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(player)
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                alert("✅ " + data.message);
                cancelEdit(); // Reset form về trạng thái Thêm mới
                loadPlayers(); 
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối đến máy chủ!');
        }
    });
});

async function loadPlayers() {
    try {
        const res = await fetch('admin_api.php?action=list');
        adminPlayersList = await res.json(); // Lưu vào biến toàn cục để lát lấy dữ liệu đem đi sửa
        
        const tbody = document.getElementById('admin-table-body');
        tbody.innerHTML = ''; 

        adminPlayersList.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.season}</td>
                    <td>${p.position}</td>
                    <td style="color:#ffd700; font-weight:bold;">${p.ovr}</td>
                    <td>${p.salary}</td>
                    <td>
                        <button style="background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 5px;" onclick="editPlayer(${p.id})">Sửa</button>
                        <button class="btn-del" onclick="deletePlayer(${p.id})">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error('Lỗi khi tải danh sách:', err);
    }
}

// Hàm được gọi khi bấm nút "Sửa" trên bảng
function editPlayer(id) {
    // Tìm cầu thủ trong danh sách dựa vào ID
    const p = adminPlayersList.find(player => player.id == id);
    if (!p) return;

    // Đổ dữ liệu lên form
    document.getElementById('a-id').value = p.id;
    document.getElementById('a-name').value = p.name;
    document.getElementById('a-season').value = p.season;
    document.getElementById('a-pos').value = p.position;
    document.getElementById('a-ovr').value = p.ovr;
    document.getElementById('a-salary').value = p.salary;
    document.getElementById('a-price').value = p.price;

    // Đổi giao diện form sang trạng thái Cập nhật
    document.getElementById('btn-save').innerText = '🔄 Cập Nhật';
    document.getElementById('btn-save').style.background = '#007bff';
    document.getElementById('btn-cancel').style.display = 'block';
    
    // Cuộn trang lên trên cùng để dễ nhập liệu
    window.scrollTo(0, 0);
}

// Hàm Hủy sửa (Khôi phục form về trạng thái Thêm mới)
function cancelEdit() {
    document.getElementById('admin-form').reset();
    document.getElementById('a-id').value = '';
    
    document.getElementById('btn-save').innerText = '➕ Thêm Cầu Thủ';
    document.getElementById('btn-save').style.background = '#28a745';
    document.getElementById('btn-cancel').style.display = 'none';
}

async function deletePlayer(id) {
    if (confirm("⚠️ Bạn có chắc chắn muốn xóa cầu thủ này không?")) {
        try {
            const res = await fetch(`admin_api.php?action=delete&id=${id}`);
            const data = await res.json();
            
            if (data.status === 'success') {
                loadPlayers();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Lỗi khi xóa cầu thủ!');
        }
    }
}