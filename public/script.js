const socket = io();
let room = "";
let myRole = ""; // "liebre" o "perro"
let myTurn = false;
let selectedPiece = null;

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");

// Crea las 11 celdas del tablero
function createBoard() {
    boardElement.innerHTML = ""; // Limpia antes de crear
    for (let i = 0; i < 11; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", () => handleCellClick(i));
        boardElement.appendChild(cell);
    }
}

function joinGame() {
    room = document.getElementById("roomInput").value;
    if (room) socket.emit("joinRoom", room);
}

function restartGame() {
    socket.emit("restartGame", room);
}

// Controla clics en el tablero
function handleCellClick(index) {
    if (!myTurn) return;

    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    const symbol = cell.classList.contains("liebre") ? "liebre" :
                   cell.classList.contains("perro") ? "perro" : null;

    // Si el jugador selecciona su propia pieza
    if (!selectedPiece && symbol === myRole) {
        selectedPiece = index;
        cell.style.border = "2px solid green";
    }
    // Si ya seleccionó una pieza y quiere mover
    else if (selectedPiece !== null) {
        socket.emit("move", {
            room,
            from: selectedPiece,
            to: index
        });
        clearSelection();
    }
}

function clearSelection() {
    selectedPiece = null;
    document.querySelectorAll(".cell").forEach(cell => {
        cell.style.border = "none";
    });
}

// Evento: asignar rol
socket.on("assignRole", (role) => {
    myRole = role;
    myTurn = role === "liebre"; // Empieza la liebre
    statusElement.innerText = `Eres: ${role}`;
    createBoard();
});

// Evento: actualizar tablero
socket.on("updateBoard", ({ board, currentTurn }) => {
    document.querySelectorAll(".cell").forEach((cell, index) => {
        cell.classList.remove("liebre", "perro");
        if (board[index] === "liebre") cell.classList.add("liebre");
        else if (board[index] === "perro") cell.classList.add("perro");
    });

    myTurn = (myRole === currentTurn);
    statusElement.innerText = myTurn ? "Tu turno" : "Turno del rival";
});

// Evento: mensaje general
socket.on("message", (msg) => {
    alert(msg);
});

// Evento: empate o victoria
socket.on("gameOver", ({ winner }) => {
    if (winner === "empate") {
        alert("¡Empate!");
    } else {
        alert(`¡Ganó ${winner}!`);
    }
    myTurn = false;
});