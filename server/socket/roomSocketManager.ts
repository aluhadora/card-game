import { Server, Socket } from 'socket.io';
import RoomState from '../roomState.ts';
import type {
    ChatMessagePayload,
    CancelGamePayload,
    VoteCancelPayload,
} from './types.ts';
import type { StartGamePayload, BasePlayerMovePayload, RoomJoinPayload } from '../types.d.ts';

export default class RoomSocketManager {
    private io: Server;
    private readonly rooms: Record<string, RoomState>;
    private votes: Record<string, { yes: Set<string>; no: Set<string>; timer?: NodeJS.Timeout; required: number; timeoutMs: number }>; 

    constructor(io?: Server) {
        this.io = io as Server;
        this.rooms = {};
        this.votes = {};
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
            socket.on('cancel-game', (data: CancelGamePayload) => this.handleCancelGame(socket, data));
            socket.on('vote-cancel', (data: VoteCancelPayload) => this.handleVoteCancel(socket, data));

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

    private getPlayerBySocket(room: RoomState, socketId: string) {
        return room.players.find((p) => p.socketIds && p.socketIds.includes(socketId));
    }

    private handleCancelGame(socket: Socket, data: CancelGamePayload) {
        const pin = data.pin;
        const room = this.rooms[pin];
        if (!room) return;

        const totalPlayers = room.players.length || 0;
        // If single player, immediately exit
        if (totalPlayers <= 1) {
            this.io.to(pin).emit('exiting', { pin });
            setTimeout(() => delete this.rooms[pin], 1000);
            return;
        }

        // If a vote is already in progress, ignore
        if (this.votes[pin]) return;

        const required = Math.floor(totalPlayers / 2) + 1; // More than half of the players must vote yes to cancel
        const yes = new Set<string>();
        const no = new Set<string>();

        // mark initiator's vote as yes if we can map to player
        const initiator = this.getPlayerBySocket(room, socket.id);
        if (initiator) yes.add(initiator.playerId);

        const timeoutMs = 2 * 60 * 1000; // 2 minutes

        const timer = setTimeout(() => {
            // vote failed, revert
            delete this.votes[pin];
            this.io.to(pin).emit('vote-failed', { pin });
        }, timeoutMs);

        this.votes[pin] = { yes, no, timer, required, timeoutMs };

        this.io.to(pin).emit('vote-started', { pin, required, yesCount: yes.size, noCount: no.size, totalPlayers, timeoutMs });
    }

    private handleVoteCancel(socket: Socket, data: VoteCancelPayload) {
        const pin = data.pin;
        const voteState = this.votes[pin];
        const room = this.rooms[pin];
        if (!voteState || !room) return;

        const player = this.getPlayerBySocket(room, socket.id);
        if (!player) return;

        // remove from both sets first
        voteState.yes.delete(player.playerId);
        voteState.no.delete(player.playerId);

        if (data.vote) voteState.yes.add(player.playerId);
        else voteState.no.add(player.playerId);

        const yesCount = voteState.yes.size;
        const noCount = voteState.no.size;

        this.io.to(pin).emit('vote-update', { pin, yesCount, noCount, required: voteState.required, totalPlayers: room.players.length });

        if (yesCount >= voteState.required) {
            // cancel the room
            if (voteState.timer) clearTimeout(voteState.timer);
            delete this.votes[pin];
            this.io.to(pin).emit('exiting', { pin });
            setTimeout(() => delete this.rooms[pin], 1000);
        }
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
