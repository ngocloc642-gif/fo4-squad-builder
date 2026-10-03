let allPlayers = []; // Lưu trữ mảng gốc từ data.json
let selectedSlot = null; // Lưu vị trí slot đang được chọn trên sân bóng

// Bắt sự kiện chọn vị trí trên sân bóng
document.querySelectorAll(".slot").forEach(slot => {
    slot.addEventListener("click", () => {
        document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected-slot"));
        slot.classList.add("selected-slot");
        selectedSlot = slot;
    });
});

function renderPlayers(players) {
    const playerList = document.getElementById("player-list");
    playerList.innerHTML = ""; // Xóa danh sách cũ

    if (players.length === 0) {
        playerList.innerHTML = "<p>Không tìm thấy cầu thủ phù hợp!</p>";
        return;
    }

    players.forEach(player => {
        const card = document.createElement("div");
        card.className = "player-card";

        const name = document.createElement("h3");
        name.textContent = player.name;
        card.appendChild(name);

        [
            ["Mùa thẻ", player.season],
            ["OVR", player.ovr],
            ["Lương", player.salary],
            ["Giá", player.price]
        ].forEach(([label, value]) => {
            const paragraph = document.createElement("p");
            paragraph.textContent = `${label}: ${value}`;
            card.appendChild(paragraph);
        });
        // Bấm vào cầu thủ để xếp vào vị trí đã chọn trên sân bóng
        card.addEventListener("click", () => {
            if (!selectedSlot) {
                alert("Vui lòng nhấp chọn 1 vị trí (ST, LW, RW...) trên sân bóng trước!");
                return;
            }
            const nameSpan = selectedSlot.querySelector(".player-name");
            nameSpan.textContent = player.name;
            nameSpan.style.color = "#00ffcc";
            nameSpan.style.fontWeight = "bold";
        });

        playerList.appendChild(card);
    });
}

// Hàm lọc kết hợp cả Tên, Mùa thẻ và Lương
function applyFilters() {
    const keyword = document.getElementById("search-input").value.toLowerCase();
    const selectedSeason = document.getElementById("season-select").value;
    const maxSalary = parseFloat(document.getElementById("max-salary-input").value);

    const filtered = allPlayers.filter(player => {
        const matchesName = player.name.toLowerCase().includes(keyword);
        const matchesSeason = selectedSeason === "" || player.season === selectedSeason;
        const matchesSalary = isNaN(maxSalary) || player.salary <= maxSalary;

        return matchesName && matchesSeason && matchesSalary;
    });

    renderPlayers(filtered);
}

// Lấy dữ liệu từ file JSON
fetch("data.json")
    .then(response => response.json())
    .then(players => {
        allPlayers = players;
        renderPlayers(allPlayers);
    })
    .catch(error => console.error("Lỗi khi đọc data.json:", error));

// Gán sự kiện lọc tự động khi nhập/chọn
document.getElementById("search-input").addEventListener("input", applyFilters);
document.getElementById("season-select").addEventListener("change", applyFilters);
document.getElementById("max-salary-input").addEventListener("input", applyFilters);