let adminPlayersList = []; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải danh sách cầu thủ
    loadPlayers();

    // 2. KHỞI TẠO DROPDOWN MÙA THẺ
    const itemsList = document.querySelector(".select-items");
    const customSelect = document.getElementById("season-selector");
    const selectedBox = customSelect.querySelector(".select-selected");
    const hiddenInput = document.getElementById("a-season");

    // Đổ dữ liệu từ mảng FO4_SEASONS vào HTML
    if (itemsList && typeof FO4_SEASONS !== 'undefined') {
        itemsList.innerHTML = ''; 
        FO4_SEASONS.forEach(s => {
            itemsList.innerHTML += `<div data-value="${s.id}"><img src="${s.img}" width="25"> ${s.name}</div>`;
        });
    }

    // Gắn sự kiện click mở menu
    if (selectedBox && itemsList) {
        selectedBox.addEventListener("click", function(e) {
            e.stopPropagation(); 
            itemsList.classList.toggle("select-hide");
        });

        // Gắn sự kiện chọn từng item (Phải dùng Event Delegation để bắt được các thẻ div vừa tạo ra)
        itemsList.addEventListener("click", function(e) {
            // Tìm thẻ div chứa data-value gần nhất mà người dùng vừa click
            const optionDiv = e.target.closest('div[data-value]'); 
            if (optionDiv) {
                const value = optionDiv.getAttribute("data-value");
                selectedBox.innerHTML = optionDiv.innerHTML; 
                hiddenInput.value = value;
                itemsList.classList.add("select-hide");
            }
        });

        // Bấm ra ngoài thì đóng
        document.addEventListener("click", function(e) {
            if (!customSelect.contains(e.target)) {
                itemsList.classList.add("select-hide");
            }
        });
    }

    // 3. XỬ LÝ LƯU/CẬP NHẬT
    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        if (!hiddenInput.value) {
            alert("Vui lòng chọn mùa thẻ!");
            return;
        }

        const id = document.getElementById('a-id').value;
        const player = {
            id: id,
            name: document.getElementById('a-name').value,
            season: hiddenInput.value, 
            position: document.getElementById('a-pos').value,
            ovr: document.getElementById('a-ovr').value,
            salary: document.getElementById('a-salary').value,
            price: document.getElementById('a-price').value
        };

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
                cancelEdit(); 
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

// 4. CÁC HÀM XỬ LÝ BẢNG
async function loadPlayers() {
    try {
        const res = await fetch('admin_api.php?action=list');
        adminPlayersList = await res.json(); 
        
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

function editPlayer(id) {
    const p = adminPlayersList.find(player => player.id == id);
    if (!p) return;

    document.getElementById('a-id').value = p.id;
    document.getElementById('a-name').value = p.name;
    document.getElementById('a-pos').value = p.position;
    document.getElementById('a-ovr').value = p.ovr;
    document.getElementById('a-salary').value = p.salary;
    document.getElementById('a-price').value = p.price;

    const hiddenInput = document.getElementById('a-season');
    const selectedBox = document.querySelector(".select-selected");
    hiddenInput.value = p.season;
    
    if (typeof FO4_SEASONS !== 'undefined') {
        const seasonData = FO4_SEASONS.find(s => s.id === p.season);
        if (seasonData) {
            selectedBox.innerHTML = `<img src="${seasonData.img}" width="25"> ${seasonData.name}`;
        } else {
            selectedBox.innerHTML = p.season;
        }
    }

    document.getElementById('btn-save').innerText = '🔄 Cập Nhật';
    document.getElementById('btn-save').style.background = '#007bff';
    document.getElementById('btn-cancel').style.display = 'block';
    
    window.scrollTo(0, 0);
}

function cancelEdit() {
    document.getElementById('admin-form').reset();
    document.getElementById('a-id').value = '';
    document.getElementById('a-season').value = '';
    
    const selectedBox = document.querySelector(".select-selected");
    if (selectedBox) selectedBox.innerHTML = 'Chọn mùa thẻ';
    
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