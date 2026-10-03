function renderPlayers(players) {
	const playerList = document.getElementById("player-list");

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
	.then((players) => renderPlayers(players))
	.catch((error) => console.error("Lỗi khi đọc data.json:", error));
