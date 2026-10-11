let adminPlayersList = []; 

document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();

    // ==========================================
    // 1. KHỞI TẠO CÁC CUSTOM DROPDOWN
    // ==========================================
    const seasonItemsList = document.querySelector("#season-selector .select-items");
    const seasonSelectBox = document.querySelector("#season-selector .select-selected");
    const seasonHiddenInput = document.getElementById("a-season");

    if (seasonItemsList && typeof FO4_SEASONS !== 'undefined') {
        seasonItemsList.innerHTML = ''; 
        FO4_SEASONS.forEach(s => {
            seasonItemsList.innerHTML += `<div data-value="${s.id}"><img src="${s.img}" width="25"> ${s.name}</div>`;
        });
    }

    const posItemsList = document.querySelector("#pos-selector .select-items");
    const posSelectBox = document.querySelector("#pos-selector .select-selected");
    const posHiddenInput = document.getElementById("a-pos");

    function closeAllSelects(exceptBox) {
        if (seasonItemsList && seasonSelectBox !== exceptBox) seasonItemsList.classList.add("select-hide");
        if (posItemsList && posSelectBox !== exceptBox) posItemsList.classList.add("select-hide");
    }

    function setupCustomSelect(selectBox, itemsList, hiddenInput) {
        if (!selectBox || !itemsList) return;

        selectBox.addEventListener("click", function(e) {
            e.stopPropagation(); 
            closeAllSelects(this); 
            itemsList.classList.toggle("select-hide"); 
        });

        itemsList.addEventListener("click", function(e) {
            const optionDiv = e.target.closest('div[data-value]'); 
            if (optionDiv) {
                const value = optionDiv.getAttribute("data-value");
                selectBox.innerHTML = optionDiv.innerHTML; 
                hiddenInput.value = value;
                itemsList.classList.add("select-hide");
            }
        });
    }

    // Kích hoạt click cho 2 menu
    setupCustomSelect(seasonSelectBox, seasonItemsList, seasonHiddenInput);
    setupCustomSelect(posSelectBox, posItemsList, posHiddenInput);

    document.addEventListener("click", function() {
        closeAllSelects(null);
    });

    // ==========================================
    // 2. LƯU / CẬP NHẬT DỮ LIỆU (Khớp 100% với HTML)
    // ==========================================
    document.getElementById('admin-form').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        if (!seasonHiddenInput.value) { alert("Vui lòng chọn mùa thẻ!"); return; }
        if (!posHiddenInput.value) { alert("Vui lòng chọn vị trí!"); return; }

        // Bắt chính xác các ID đang có trong file admin.html
        const id = document.getElementById('a-id').value;
        
        const player = {
            id: id,
            name: document.getElementById('a-name').value,
            season: seasonHiddenInput.value, 
            position: posHiddenInput.value,
            ovr: document.getElementById('a-ovr').value,
            salary: document.getElementById('a-salary').value,
            avatar_url: document.getElementById('p-avatar').value // Riêng ảnh là p-avatar
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
}); // <--- Đóng thẻ DOMContentLoaded ở đây

async function loadPlayers() {
    try {
        const res = await fetch('admin_api.php?action=list');
        adminPlayersList = await res.json(); 
        
        const tbody = document.getElementById('admin-table-body');
        if(!tbody) return;
        tbody.innerHTML = ''; 

        adminPlayersList.forEach(p => {
            const avatarImg = p.avatar_url ? `<img src="${p.avatar_url}" style="width:30px; height:30px; object-fit:contain; background:#333; border-radius:4px; margin-right:10px; vertical-align:middle;">` : '';

            tbody.innerHTML += `
                <tr>
                    <td>${avatarImg}<strong>${p.name}</strong></td>
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

window.editPlayer = function(id) { 
    const p = adminPlayersList.find(player => player.id == id);
    if (!p) return;

    // Đổ dữ liệu vào chính xác các ID trong HTML khi bấm Sửa
    document.getElementById('a-id').value = p.id;
    document.getElementById('a-name').value = p.name;
    document.getElementById('a-ovr').value = p.ovr;
    document.getElementById('a-salary').value = p.salary;
    document.getElementById('p-avatar').value = p.avatar_url || ''; 

    const seasonHidden = document.getElementById('a-season');
    const seasonBox = document.querySelector("#season-selector .select-selected");
    if (seasonHidden) seasonHidden.value = p.season;
    if (typeof FO4_SEASONS !== 'undefined' && seasonBox) {
        const sData = FO4_SEASONS.find(s => s.id === p.season);
        seasonBox.innerHTML = sData ? `<img src="${sData.img}" width="25"> ${sData.name}` : p.season;
    }

    const posHidden = document.getElementById('a-pos');
    const posBox = document.querySelector("#pos-selector .select-selected");
    if (posHidden) posHidden.value = p.position;
    if (posBox) posBox.innerHTML = p.position;

    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.innerText = '🔄 Cập Nhật';
        btnSave.style.background = '#007bff';
    }
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) btnCancel.style.display = 'block';
    
    window.scrollTo(0, 0);
};

window.cancelEdit = function() {
    const form = document.getElementById('admin-form');
    if (form) form.reset();
    
    document.getElementById('a-id').value = '';
    
    const seasonHidden = document.getElementById('a-season');
    const seasonBox = document.querySelector("#season-selector .select-selected");
    if (seasonHidden) seasonHidden.value = '';
    if (seasonBox) seasonBox.innerHTML = 'Chọn mùa thẻ';

    const posHidden = document.getElementById('a-pos');
    const posBox = document.querySelector("#pos-selector .select-selected");
    if (posHidden) posHidden.value = '';
    if (posBox) posBox.innerHTML = 'Chọn vị trí';
    
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        btnSave.innerText = '➕ Thêm Cầu Thủ';
        btnSave.style.background = '#28a745';
    }
    const btnCancel = document.getElementById('btn-cancel');
    if (btnCancel) btnCancel.style.display = 'none';
};

window.deletePlayer = async function(id) {
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
};