// public/game.js

const socket = io();
let room = "";
let playerType = ""; // "hare" o "dog"
let myTurn = false;
let boardState = Array(15).fill(null); // 5 columnas x 3 filas

function joinGame() {
    room = document.getElementById("roomInput").value;
    if (room) socket.emit("joinRoom", room);
}

// Mapeamos símbolos a emojis o letras
const symbols = {
    hare: "🐇",
    dog: "🐶"
};

function renderBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let i = 0; i < 15; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;

        if (boardState[i]) {
            cell.classList.add(boardState[i]);
            cell.innerText = symbols[boardState[i]];
        }

        cell.addEventListener("click", () => handleMove(i));

        board.appendChild(cell);
    }
}

function handleMove(index) {
    if (!myTurn) return alert("No es tu turno");
    socket.emit("makeMove", { room, index });
}

socket.on("assignPlayer", (type) => {
    playerType = type;
    myTurn = type === "hare"; // La liebre empieza primero
    document.getElementById("status").innerText = `Eres ${symbols[playerType]}`;
});

socket.on("updateBoard", ({ board, currentTurn }) => {
    boardState = board;
    myTurn = currentTurn === playerType;
    renderBoard();

    document.getElementById("status").innerText = myTurn
        ? "Tu turno"
        : "Turno del oponente";
});

socket.on("roomFull", () => {
    alert("La sala está llena.");
});

socket.on("waitingForPlayer", () => {
    document.getElementById("status").innerText = "Esperando a otro jugador...";
});

socket.on("gameOver", ({ winner }) => {
    const message = winner === "draw" ? "¡Empate!" : `Ganó ${symbols[winner]}`;
    alert(message);
});

// Render inicial vacío
renderBoard();