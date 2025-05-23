import express from 'express';
const app = express();
// import {router} from './routes/router.js';
import bodyParser from 'body-parser';
import http from 'http';
import path from 'path';
const __dirname = path.resolve();
import { Server } from 'socket.io';
import RoomState from './roomState.js';


// app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, './client/dist')));

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: ["http://localhost:5173", "http://192.168.50.200:5173"], methods: ["GET", "POST"] },
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Or your specific origin
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT"); // Or your allowed methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Or your allowed headers
    next();
});

// Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, '../client/build')));

var rooms = {};

io.on('connection', socket => {

    try {
        socket.on('player-joined', (data) => {
            let room = rooms[data.pin];
            if (!room) {
                rooms[data.pin] = new RoomState.default();
                room = rooms[data.pin];
                room.joinHost({ roomId: data.pin, playerId: data.playerId, nickname: data.nickname, socketId: socket.id, playerSecret: data.playerSecret });
                console.log(`Host created room ${data.pin} with ID ${socket.id}`);
            }

            console.log("Player joining room:", data.pin, "with ID:", socket.id, data);
            room.joinPlayer({ roomId: data.pin, socketId: socket.id, ...data });
            socket.join(data.pin);
            io.to(data.pin).emit('room-joined', { name: data.nickname, playerId: data.playerId, players: room.gameState.players });
            socket.to(data.pin).emit('room-joined', { name: data.nickname, playerId: data.playerId, players: room.gameState.players });
        })

        socket.on('start-game', (data) => {
            if (rooms[data.pin]) {
                const initialGameState = rooms[data.pin].startGame(data);
                io.to(data.pin).emit('game-started', initialGameState);
                socket.to(data.pin).emit('game-started', initialGameState);
                console.log(`Game started in room ${data.pin}.  ${JSON.stringify(data)}`);
            } else {
                console.error(`Room ${data.pin} does not exist.`);
            }
        });

        socket.on('send-chat-message', (data) => {
            console.log("Chat message received:", data);
            const roomState = rooms[data.pin];
            if (!roomState) return;

            const player = roomState.players.find(p => p.socketIds.includes(socket.id));
            if (!player) return;

            console.log(`Chat message received in room ${data.pin} from player ${player.nickname}:`, data);
            io.to(data.pin).emit('message-received', { playerId: player.playerId, nickname: player.nickname, message: data.message });
        })


        socket.on('player-move', (data) => {
            console.log(`Player move received in room ${data.pin} from player ${socket.id}:`, data);
            const delta = rooms[data.pin].playerMove({
                playerId: socket.id,
                ...data
            });
            io.to(data.pin).emit('player-move', { ...data, ...delta })
            if (delta.gameState === "GameOver") {
                io.to(data.pin).emit('game-over', delta);
                console.log(`Game over in room ${data.pin}`);
                rooms[data.pin] = undefined;
            }
        });
    } catch (error) {
        console.error("Error in socket connection:", error);
        socket.emit('error', { message: "An error occurred while connecting.", error });
        return;
    }
    //Player Join Room

});

app.get('/api/rooms/:pin', (req, res) => {
    const pin = req.params.pin;
    if (rooms[pin]) {
        res.status(200).json({
            roomstate: rooms[pin].roomstate,
            players: rooms[pin].players.map(player => ({
                id: player.playerId,
                nickname: player.nickname,
            })),
            gameState: rooms[pin].gameState.visibleState(),
            gameType: rooms[pin].gameType,
        });
    } else {
        res.status(404).json({ message: "Room not found" });
    }
});

// All other GET requests not handled before will return our React app
app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, './client/dist', 'index.html'));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on ${PORT}`);
});