let allPlayers = [];
let squadState = {};
let activeSlotId = null;
let selectedPos = "";
let selectedSeason = "";
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

document.addEventListener("DOMContentLoaded", () => {
    init();
    updateUIAuth(); // Cập nhật UI đăng nhập & phân quyền Admin
    setupEventListeners();
});

// 1. Hàm cập nhật trạng thái hiển thị tên, nút Đăng xuất & Tab Admin
function updateUIAuth() {
    const userDisplayName = document.getElementById("user-display-name");
    const btnLogout = document.getElementById("btn-logout");
    const tabAdmin = document.getElementById("tab-admin");

    if (currentUser) {
        const roleTag = currentUser.role ? `(${currentUser.role.toUpperCase()})` : '';
        if (userDisplayName) userDisplayName.innerText = `Xin chào, ${currentUser.fullname} ${roleTag}`;
        if (btnLogout) btnLogout.style.display = "inline-block";

        // Chỉ hiển thị Nút Admin nếu người dùng có quyền admin
        if (tabAdmin) {
            const isAdmin = currentUser.role && currentUser.role.toLowerCase() === "admin";
            tabAdmin.style.display = isAdmin ? "inline-block" : "none";
        }
    } else {
        if (userDisplayName) userDisplayName.innerText = "";
        if (btnLogout) btnLogout.style.display = "none";
        if (tabAdmin) tabAdmin.style.display = "none";
    }
}

// Tải dữ liệu cầu thủ từ CSDL qua admin_api.php
async function init() {
    try {
        const response = await fetch("admin_api.php?action=list");
        if (!response.ok) throw new Error("Không thể lấy dữ liệu từ máy chủ");
        
        allPlayers = await response.json();
        console.log("Đã tải thành công database:", allPlayers);

        // Hiển thị danh sách ra Tab Tra Cứu ngay khi vào trang
        renderSearchList(allPlayers);
    } catch (error) {
        console.error("Lỗi đọc dữ liệu database:", error);
    }
    
    // Render bộ lọc mùa thẻ bên User
    const seasonContainer = document.getElementById('user-season-filter');
    if (seasonContainer && typeof FO4_SEASONS !== 'undefined') {
        seasonContainer.innerHTML = ''; // Xóa sạch khung trước khi vẽ
        FO4_SEASONS.forEach(s => {
            seasonContainer.innerHTML += `
                <span class="badge-season" data-season="${s.id}" style="display:inline-flex; align-items:center; gap:5px; cursor: pointer;">
                    <img src="${s.img}" style="width:25px; height:20px; object-fit:contain;"> ${s.name}
                </span>
            `;
        });
    }
}

function setupEventListeners() {
    // Các phần tử chuyển Tab
    const tabSearch = document.getElementById("tab-search");
    const tabSquad = document.getElementById("tab-squad");
    const tabAdmin = document.getElementById("tab-admin");

    const viewSearch = document.getElementById("view-search");
    const viewSquad = document.getElementById("view-squad");
    const viewAdmin = document.getElementById("view-admin");

    // --- XỬ LÝ CHUYỂN TAB ĐỘI HÌNH VÀ KIỂM TRA ĐĂNG NHẬP ---
    tabSquad?.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (!currentUser) {
            document.getElementById("auth-modal").style.display = "flex";
            return;
        }

        tabSquad.classList.add("active");
        tabSearch?.classList.remove("active");
        tabAdmin?.classList.remove("active");

        if (viewSearch) viewSearch.style.display = "none";
        if (viewAdmin) viewAdmin.style.display = "none";
        if (viewSquad) viewSquad.style.display = "block";
    });

    // --- XỬ LÝ CHUYỂN LẠI TAB TRA CỨU ---
    tabSearch?.addEventListener("click", (e) => {
        e.preventDefault();
        tabSearch.classList.add("active");
        tabSquad?.classList.remove("active");
        tabAdmin?.classList.remove("active");

        if (viewSquad) viewSquad.style.display = "none";
        if (viewAdmin) viewAdmin.style.display = "none";
        if (viewSearch) viewSearch.style.display = "block";
    });

    // --- XỬ LÝ CHUYỂN SANG TAB QUẢN TRỊ (ADMIN) ---
    tabAdmin?.addEventListener("click", (e) => {
        e.preventDefault();
        tabAdmin.classList.add("active");
        tabSearch?.classList.remove("active");
        tabSquad?.classList.remove("active");

        if (viewSearch) viewSearch.style.display = "none";
        if (viewSquad) viewSquad.style.display = "none";
        if (viewAdmin) viewAdmin.style.display = "block";
    });

    // --- XỬ LÝ SỰ KIỆN LƯU CẦU THỦ MỚI TỪ FORM ADMIN ---
    document.getElementById("form-add-player")?.addEventListener("submit", async function (e) {
        e.preventDefault();

        const playerData = {
            name: document.getElementById("p-name")?.value || "",
            season: document.getElementById("p-season")?.value || "",
            position: document.getElementById("p-position")?.value || "",
            ovr: parseInt(document.getElementById("p-ovr")?.value) || 0,
            salary: parseInt(document.getElementById("p-salary")?.value) || 0,
            avatar_url: document.getElementById("p-avatar")?.value || "" 
        };

        try {
            const res = await fetch("admin_api.php?action=add", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(playerData)
            });

            const result = await res.json();
            if (result.status === "success") { 
                alert("✅ " + result.message);
                this.reset(); 
                init(); 
            } else {
                alert("❌ Lỗi: " + result.message);
            }
        } catch (err) {
            console.error("Lỗi chi tiết:", err);
            alert("❌ Lỗi kết nối máy chủ admin_api.php!");
        }
    });

    // --- CÁC SỰ KIỆN XỬ LÝ MODAL ĐĂNG NHẬP / ĐĂNG KÝ ---
    document.getElementById("btn-close-auth-modal")?.addEventListener("click", () => {
        document.getElementById("auth-modal").style.display = "none";
    });

    document.getElementById("link-show-register")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("form-login-box").style.display = "none";
        document.getElementById("form-register-box").style.display = "block";
    });

    document.getElementById("link-show-login")?.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("form-register-box").style.display = "none";
        document.getElementById("form-login-box").style.display = "block";
    });

    document.getElementById("btn-submit-login")?.addEventListener("click", async () => {
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        try {
            const res = await fetch("login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.status === "success") {
                alert(data.message);
                currentUser = data.user;
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                updateUIAuth();
                document.getElementById("auth-modal").style.display = "none";
                tabSquad.click(); 
            } else {
                alert(data.message);
            }
        } catch (err) { alert("Lỗi kết nối máy chủ!"); }
    });

    document.getElementById("btn-submit-register")?.addEventListener("click", async () => {
        const fullname = document.getElementById("reg-fullname").value;
        const username = document.getElementById("reg-username").value;
        const password = document.getElementById("reg-password").value;
        if (!password.includes('@')) {
            alert("⚠️ Đăng ký thất bại: Mật khẩu bắt buộc phải chứa ký tự @ để bảo mật!");
            return; 
        }
        try {
            const res = await fetch("register.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname, username, password })
            });
            const data = await res.json();
            alert(data.message);
            if (data.status === "success") document.getElementById("link-show-login").click();
        } catch (err) { alert("Lỗi đăng ký!"); }
    });

    document.getElementById("btn-logout")?.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        currentUser = null;
        updateUIAuth();
        alert("Đã đăng xuất!");
        tabSearch.click(); 
    });

    // --- BỘ LỌC VỊ TRÍ (DẠNG NÚT BẤM) ---
    document.querySelectorAll(".btn-pos").forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.classList.contains("active")) {
                btn.classList.remove("active");
                selectedPos = "";
            } else {
                document.querySelectorAll(".btn-pos").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedPos = btn.dataset.pos || "";
            }
            applySearchFilters();
        });
    });

    // --- BỘ LỌC MÙA THẺ (EVENT DELEGATION) ---
    const filterContainer = document.getElementById('user-season-filter');
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            const badge = e.target.closest(".badge-season");
            if (!badge) return; 

            if (badge.classList.contains("active")) {
                badge.classList.remove("active");
                selectedSeason = "";
            } else {
                document.querySelectorAll(".badge-season").forEach(b => b.classList.remove("active"));
                badge.classList.add("active");
                selectedSeason = badge.dataset.season || "";
            }
            applySearchFilters(); 
        });
    }

    document.getElementById("btn-apply-filter")?.addEventListener("click", applySearchFilters);
    document.getElementById("search-input")?.addEventListener("input", applySearchFilters);
    document.getElementById("btn-reset-filter")?.addEventListener("click", () => {
        const input = document.getElementById("search-input");
        if (input) input.value = "";
        selectedPos = "";
        selectedSeason = "";
        document.querySelectorAll(".btn-pos").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".badge-season").forEach(b => b.classList.remove("active"));
        renderSearchList(allPlayers);
    });

    // --- MỞ POP-UP CHỌN CẦU THỦ KHI NHẤN DẤU + TRÊN SÂN ---
    document.querySelectorAll(".squad-card-slot").forEach(slot => {
        slot.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-remove-player")) return;

            activeSlotId = slot.dataset.slotId;
            const posName = slot.dataset.pos || activeSlotId;

            const modalTargetPos = document.getElementById("modal-target-pos");
            const modalSearchInput = document.getElementById("modal-search-input");
            const playerModal = document.getElementById("player-modal");

            if (modalTargetPos) modalTargetPos.innerText = posName;
            if (modalSearchInput) modalSearchInput.value = ""; 

            const availablePlayers = getAvailablePlayersForSlot(posName, "");
            renderModalPlayers(availablePlayers);
            
            if (playerModal) playerModal.style.display = "flex";
        });
    });

    // --- Ô TÌM KIẾM TRONG POP-UP MODAL ---
    document.getElementById("modal-search-input")?.addEventListener("input", (e) => {
        const kw = e.target.value.toLowerCase().trim();
        
        const activeSlotElem = document.querySelector(`.squad-card-slot[data-slot-id="${activeSlotId}"]`);
        const posName = activeSlotElem ? (activeSlotElem.dataset.pos || activeSlotId) : "";

        const availablePlayers = getAvailablePlayersForSlot(posName, kw);
        renderModalPlayers(availablePlayers);
    });
}

// Render danh sách ở Tab Tra Cứu
function renderSearchList(players) {
    const container = document.getElementById("player-list");
    if (!container) return;
    container.innerHTML = "";

    if (!players || players.length === 0) {
        container.innerHTML = "<p style='color:#aaa;'>Chưa có cầu thủ nào trong database.</p>";
        return;
    }

    players.forEach(p => {
        const item = document.createElement("div");
        item.style.cssText = "background: #222; padding: 12px; border-radius: 6px; border: 1px solid #444; margin-bottom: 8px; display: flex; align-items: center; gap: 15px;";
        
        const avatarUrl = p.avatar_url ? p.avatar_url : "https://fo4.garena.vn/wp-content/uploads/2020/09/fo4-logo.png";

        item.innerHTML = `
            <div style="flex-shrink: 0;">
                <img src="${avatarUrl}" alt="Avatar" style="width: 60px; height: 60px; object-fit: contain; background: #333; border-radius: 4px;">
            </div>
            <div style="flex-grow: 1;">
                <div style="font-weight: bold; color: #fff; font-size: 16px;">${p.name}</div>
                <div style="font-size: 13px; color: #aaa;">Mùa thẻ: ${p.season}</div>
                <div style="font-size: 13px; color: #ffd700;">OVR: ${p.ovr} | Vị trí: ${p.position || 'N/A'}</div>
                <div style="font-size: 13px; color: #00ffcc;">Lương: ${p.salary}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// HÀM LỌC CẦU THỦ THÔNG MINH CHO MODAL
function getAvailablePlayersForSlot(slotPos, keyword = "") {
    const currentSquadNames = Object.values(squadState)
        .filter(p => p !== null && p !== undefined)
        .map(p => p.name);

    return allPlayers.filter(p => {
        const matchKw = keyword === "" || 
                        (p.name && p.name.toLowerCase().includes(keyword)) ||
                        (p.season && p.season.toLowerCase().includes(keyword));

        const notInSquad = !currentSquadNames.includes(p.name);

        let matchGK = true;
        if (slotPos === "GK") {
            matchGK = (p.position && p.position.includes("GK"));
        } else {
            matchGK = (!p.position || !p.position.includes("GK"));
        }

        return matchKw && notInSquad && matchGK;
    });
}

function renderModalPlayers(players) {
    const modalPlayerList = document.getElementById("modal-player-list");
    if (!modalPlayerList) return;

    modalPlayerList.innerHTML = "";
    if (!players || players.length === 0) {
        modalPlayerList.innerHTML = "<p style='color:#aaa; text-align:center;'>Không tìm thấy cầu thủ phù hợp.</p>";
        return;
    }

    players.forEach(p => {
        const item = document.createElement("div");
        item.className = "modal-player-item";
        item.style.cssText = "background: #1a1a1a; border: 1px solid #333; padding: 10px; border-radius: 5px; cursor: pointer; margin-bottom: 6px;";
        item.innerHTML = `
            <div style="font-weight: bold; color: #fff; font-size: 14px;">${p.name}</div>
            <div style="font-size: 12px; color: #ffd700;">OVR: ${p.ovr} | Mùa: ${p.season}</div>
            <div style="font-size: 12px; color: #00ffcc;">Vị trí: ${p.position || 'N/A'} | Lương: ${p.salary}</div>
        `;

        item.addEventListener("click", () => {
            selectPlayerForSlot(activeSlotId, p);
            const playerModal = document.getElementById("player-modal");
            if (playerModal) playerModal.style.display = "none";
        });

        modalPlayerList.appendChild(item);
    });
}

function applySearchFilters() {
    const kw = document.getElementById("search-input")?.value.toLowerCase() || "";
    
    const minOvr = parseFloat(document.getElementById("min-ovr")?.value) || 0;
    const maxOvr = parseFloat(document.getElementById("max-ovr")?.value) || 999;

    const minSalary = parseFloat(document.getElementById("min-salary")?.value) || 0;
    const maxSalary = parseFloat(document.getElementById("max-salary-input")?.value) || 999;

    const filtered = allPlayers.filter(p => {
        const matchName = p.name ? p.name.toLowerCase().includes(kw) : false;
        const matchPos = !selectedPos || (p.position && p.position.includes(selectedPos));
        const matchSeason = !selectedSeason || p.season === selectedSeason;
        
        const matchOvr = p.ovr >= minOvr && p.ovr <= maxOvr;
        const matchSalary = p.salary >= minSalary && p.salary <= maxSalary;
        
        // ĐÃ XÓA BIẾN matchPrice BỊ LỖI Ở ĐÂY!
        return matchName && matchPos && matchSeason && matchOvr && matchSalary;
    });

    renderSearchList(filtered);
}

function selectPlayerForSlot(slotId, player) {
    if (!slotId) return;
    squadState[slotId] = player;

    const slotElem = document.querySelector(`.squad-card-slot[data-slot-id="${slotId}"]`);
    if (!slotElem) return;

    const plusBox = slotElem.querySelector(".plus-box");
    const cardContent = slotElem.querySelector(".card-content");

    if (plusBox) plusBox.style.display = "none";

    if (cardContent) {
        const avatarImg = player.avatar_url ? `<img src="${player.avatar_url}" style="width:40px; height:40px; object-fit:contain; display:block; margin: 0 auto;">` : '';

        cardContent.innerHTML = `
            <div class="btn-remove-player" onclick="removePlayerFromSlot('${slotId}', event)">&times;</div>
            <div class="player-filled-ovr" style="color: #ffd700; font-weight: bold;">${player.ovr}</div>
            ${avatarImg}
            <div class="player-filled-name" style="color: #fff; font-size: 12px; margin-top: 2px;">${player.name}</div>
            <div class="player-filled-season" style="color: #aaa; font-size: 10px;">${player.season}</div>
        `;
    }

    updateSquadStats();
}

window.removePlayerFromSlot = function(slotId, e) {
    if (e) e.stopPropagation();
    delete squadState[slotId];

    const slotElem = document.querySelector(`.squad-card-slot[data-slot-id="${slotId}"]`);
    if (!slotElem) return;

    const plusBox = slotElem.querySelector(".plus-box");
    const cardContent = slotElem.querySelector(".card-content");

    if (plusBox) plusBox.style.display = "flex";
    if (cardContent) cardContent.innerHTML = "";

    updateSquadStats();
};

function updateSquadStats() {
    let totalValue = 0;
    let totalSalary = 0;
    let totalHeight = 0;
    let count = 0;

    Object.values(squadState).forEach(p => {
        if (p) {
            totalSalary += Number(p.salary) || 0;
            totalHeight += Number(p.height) || 180;
            count++;
        }
    });

    const avgHeight = count > 0 ? Math.round(totalHeight / count) : 0;

    const elValue = document.getElementById("stat-value");
    const elHeight = document.getElementById("stat-height");
    const elCurrSalary = document.getElementById("curr-salary");
    const elCtrlSalary = document.getElementById("ctrl-salary");
    const elCount = document.getElementById("stat-count");

    if (elValue) elValue.innerText = totalValue > 0 ? totalValue.toLocaleString() + " đ" : "0 đ";
    if (elHeight) elHeight.innerText = avgHeight + " cm";
    if (elCurrSalary) elCurrSalary.innerText = totalSalary;
    if (elCtrlSalary) elCtrlSalary.innerText = totalSalary;
    if (elCount) elCount.innerText = count;
}

// Bắt sự kiện double-click vào dấu chấm bí mật
document.addEventListener('DOMContentLoaded', function() {
    const secretDot = document.getElementById('secret-admin');
    
    if (secretDot) {
        secretDot.addEventListener('dblclick', function() {
            window.location.href = 'admin.html';
        });
    }
});

// =======================================================
// FIX LỖI NÚT X VÀ THÊM TÍNH NĂNG NHẤN RA NGOÀI ĐỂ ĐÓNG
// =======================================================
document.addEventListener("click", function(e) {
    const modal = document.getElementById("player-modal");
    if (!modal || modal.style.display === "none") return;

    // 1. Nếu người dùng bấm vào nút X (nhận diện qua text hoặc class)
    if (e.target.innerText === "x" || e.target.innerText === "×" || e.target.innerText === "X" || (e.target.className && typeof e.target.className === 'string' && e.target.className.includes("close"))) {
        modal.style.display = "none";
    }

    // 2. Nếu người dùng bấm ra ngoài khoảng đen xung quanh bảng
    if (e.target === modal) {
        modal.style.display = "none";
    }
});