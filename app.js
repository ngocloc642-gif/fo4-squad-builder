let allPlayers = [];

function renderPlayers(players) {
	const playerList = document.getElementById("player-list");
	playerList.innerHTML = "";

	players.forEach((player) => {
		const card = document.createElement("div");
		card.className = "player-card";

		const name = document.createElement("h3");
		name.textContent = player.name;
		card.appendChild(name);

		[
			["Mùa thẻ", player.season],
			["OVR", player.ovr],
			["Lương", player.salary],
			["Giá", player.price],
		].forEach(([label, value]) => {
			const paragraph = document.createElement("p");
			paragraph.textContent = `${label}: ${value}`;
			card.appendChild(paragraph);
		});

		playerList.appendChild(card);
	});
}

fetch("data.json")
	.then((response) => response.json())
	.then((players) => {
		allPlayers = players;
		renderPlayers(allPlayers);
	})
	.catch((error) => console.error("Lỗi khi đọc data.json:", error));

document.getElementById("search-input").addEventListener("input", (event) => {
	const keyword = event.target.value.toLowerCase();
	const filteredPlayers = allPlayers.filter((player) =>
		player.name.toLowerCase().includes(keyword)
	);
	renderPlayers(filteredPlayers);
});
