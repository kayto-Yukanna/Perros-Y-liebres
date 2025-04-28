const express = require("express");
const http = require("http");
const { server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const rooms = {}; // Guardar el estado de cada sala

io.on("connection", (socket) => {
    console.log("Un jugador se ha conectado");

    socket.on("joinRoom", (roomId) => {
        if (!rooms[roomId]) {
            rooms[roomId] = {
                players: [],
                gameState: null
            };
        }

        const room = rooms[roomId];

        if (room.players.length >= 2) {
            socket.emit("roomFull", "La sala está llena.");
            return;
        }

        room.players.push(socket.id);
        socket.join(roomId);
        socket.emit("joinedRoom", roomId);

        // Asignar rol
        const role = room.players.length === 1 ? "liebre" : "cazadores";
        socket.emit("assignRole", role);

        // Iniciar juego si hay dos jugadores
        if (room.players.length === 2) {
            room.gameState = crearEstadoInicial();
            io.to(roomId).emit("startGame", room.gameState);
        }
    });

    socket.on("move", ({ roomId, from, to }) => {
        const room = rooms[roomId];
        if (!room || !room.gameState) return;

        // Lógica para actualizar el estado del juego aquí
        const valido = moverPieza(room.gameState, from, to);
        if (valido) {
            io.to(roomId).emit("gameStateUpdate", room.gameState);
            const ganador = verificarGanador(room.gameState);
            if (ganador) {
                io.to(roomId).emit("gameOver", ganador);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("Un jugador se ha desconectado");
        // Limpieza de salas o reacciones si es necesario
    });
});

function crearEstadoInicial() {
    return {
        tablero: [
            "C", "C", "C", " ", "L", // ejemplo: C = cazador, L = liebre, " " = vacío
        ],
        turno: "liebre"
    };
}

function moverPieza(gameState, from, to) {
    const pieza = gameState.tablero[from];
    if (pieza === " " || gameState.tablero[to] !== " ") return false;

    // Aquí va la lógica de validación del movimiento dependiendo del rol y las reglas
    gameState.tablero[to] = pieza;
    gameState.tablero[from] = " ";
    gameState.turno = gameState.turno === "liebre" ? "cazadores" : "liebre";
    return true;
}

function verificarGanador(gameState) {
    // Aquí se analiza si alguien ganó
    return null;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});     
