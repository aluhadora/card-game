import { Server, Socket } from 'socket.io';
import RoomState from '../roomState.ts';
import type {
    ChatMessagePayload,
} from './types.ts';
import type { StartGamePayload, RoomJoinPayload, BasePlayerMovePayload } from '../types.d.ts';

export default class RoomSocketManager {
    private io: Server;
    private readonly rooms: Record<string, RoomState>;

    constructor(io?: Server) {
        this.io = io as Server;
        this.rooms = {};
    }

    public setIo(io: Server) {
        this.io = io;
    }

    public attach() {
        if (!this.io) {
            throw new Error('Socket server has not been initialized');
        }

        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected:', socket.id);

            socket.on('player-joined', (data: RoomJoinPayload) => this.handlePlayerJoined(socket, data));
            socket.on('start-game', (data: StartGamePayload) => this.handleStartGame(socket, data));
            socket.on('send-chat-message', (data: ChatMessagePayload) => this.handleSendChatMessage(socket, data));
            socket.on('player-move', (data: BasePlayerMovePayload) => this.handlePlayerMove(socket, data));

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    public getRoom(pin: string) {
        return this.rooms[pin];
    }

    private handlePlayerJoined(socket: Socket, data: RoomJoinPayload) {
        let room = this.rooms[data.pin];

        if (!room) {
            this.rooms[data.pin] = new RoomState();
            room = this.rooms[data.pin];
            room.joinHost({ hostId: data.playerId, pin: data.pin });
            console.log(`Host created room ${data.pin} with ID ${socket.id}`);
        }

        console.log('Player joining room:', data.pin, 'with ID:', socket.id, data);
        room.joinPlayer({
            pin: data.pin,
            roomId: data.pin,
            socketId: socket.id,
            playerId: data.playerId,
            playerSecret: data.playerSecret,
            nickname: data.nickname,
        });

        socket.join(data.pin);
        this.io.to(data.pin).emit('room-joined', {
            name: data.nickname,
            playerId: data.playerId,
            players: Object.values(room.gameState.players),
        });
        socket.to(data.pin).emit('room-joined', {
            name: data.nickname,
            playerId: data.playerId,
            players: Object.values(room.gameState.players),
        });
    }

    private handleStartGame(socket: Socket, data: StartGamePayload) {
        const room = this.rooms[data.pin];
        if (!room) {
            console.error(`Room ${data.pin} does not exist.`);
            return;
        }

        const initialGameState = room.startGame(data);
        this.io.to(data.pin).emit('game-started', initialGameState);
        socket.to(data.pin).emit('game-started', initialGameState);
        console.log(`Game started in room ${data.pin}. ${JSON.stringify(data)}`);
    }

    private handleSendChatMessage(socket: Socket, data: ChatMessagePayload) {
        console.log('Chat message received:', data);
        const roomState = this.rooms[data.pin];
        if (!roomState) return;

        const player = roomState.players.find((p) => p.socketIds.includes(socket.id));
        if (!player) return;

        console.log(`Chat message received in room ${data.pin} from player ${player.nickname}:`, data);
        this.io.to(data.pin).emit('message-received', {
            playerId: player.playerId,
            nickname: player.nickname,
            message: data.message,
        });
    }

    private handlePlayerMove(socket: Socket, data: BasePlayerMovePayload) {
        const room = this.rooms[data.pin as string];
        if (!room) {
            console.error(`Room ${data.pin} does not exist.`);
            return;
        }

        console.log(`Player move received in room ${data.pin} from player ${socket.id}:`, data);
        const delta = room.playerMove({
            ...data,
        });

        this.io.to(data.pin as string).emit('player-move', { ...data, ...delta });
        if (delta?.gameState === 'GameOver') {
            this.io.to(data.pin as string).emit('game-over', delta);
            console.log(`Game over in room ${data.pin}`);
            delete this.rooms[data.pin as string];
        }
    }
}
