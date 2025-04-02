import express from 'express';
const app = express();
// import {router} from './routes/router.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import RoomState from './roomState.js';


// app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve(__dirname, '../client/build')));

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, '../client/build')));

var rooms = {};

io.on('connection', socket => {

    //Player Join Room
    socket.on('player-joined', (data) => {
        let room = rooms[data.pin];
        if (!room) {
            rooms[data.pin] = new RoomState();
            room = rooms[data.pin];
            room.joinHost({ hostId: socket.id, pin: data.pin, roomstate: "Lobby" });
            console.log(`Host created room ${data.pin} with ID ${socket.id}`);
        }
        
        console.log("Player joining room:", data.pin, "with ID:", socket.id);
        room.joinPlayer({roomId: data.pin, playerId: socket.id, nickname: data.nickname});
        socket.join(data.pin);
        io.to(data.pin).emit('room-joined', { name: data.nickname, id: socket.id, players: room.gameState.players });
    })

    socket.on('start-game', (data) => {
        if (rooms[data.pin]) {
            const initialGameState = rooms[data.pin].startGame();
            io.to(data.pin).emit('game-started', initialGameState);
            socket.to(data.pin).emit('game-started', initialGameState);
            console.log(`Game started in room ${data.pin}`);
        } else {
            console.error(`Room ${data.pin} does not exist.`);
        }
    });
 
    socket.on('player-move', (data) => {
        const delta = rooms[data.pin].playerMove({
            playerId: socket.id,
            ...data
        });
        io.to(`${data.pin}`).emit('player-move', {...data, ...delta })
    });
});

app.get('/api/rooms/:pin', (req, res) => {
    const pin = req.params.pin;
    if (rooms[pin]) {
        res.status(200).json({
            roomstate: rooms[pin].roomstate,
            players: rooms[pin].players,
            gameState: rooms[pin].gameState
        });
    } else {
        res.status(404).json({ message: "Room not found" });
    }
});

// All other GET requests not handled before will return our React app
app.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});