import GolfGame from "./golf/golfGameState.js";
import { Participant } from "./types.js";

export default class RoomState {
    hostId: string;
    roomstate: string;
    roomId: string;
    players: Participant[];
    gameState: GolfGame;
    
    joinHost(data : { hostId: string, pin: string}) {
        this.hostId = data.hostId;
        this.roomId = data.pin;
        this.players = []; 
        this.roomstate = "Lobby";
        this.gameState = new GolfGame();
    }

    joinNewPlayer(data : { playerId: string, nickname: string, socketId: string, playerSecret: string }) {
        this.players.push({
            playerId: data.playerId,
            nickname: data.nickname,
            socketIds: [data.socketId],
            playerSecret: data.playerSecret
        });
    }

    joinPlayer(data : { playerId: string, nickname: string, socketId: string, playerSecret: string, roomId: string }) {
        if (!data.roomId) {
            console.error("No room exists to join.");
            return;
        }

        const player = this.players.find(player => player.playerId === data.playerId);

        console.log("Joining player:", data.nickname, "with ID:", data.playerId, "in room:", data.roomId, this.players);
        if (player && player.playerSecret === data.playerSecret) {
            if (!player.socketIds) player.socketIds = [];
            player.socketIds.push(data.socketId);
            console.log(`Player ${data.nickname} rejoined the room.`);
        } else if (player) {
            console.error(`Player ${data.nickname} failed to rejoin: invalid secret.`);
            return;
        } else if (this.roomstate === "Lobby") {
            this.joinNewPlayer(data);
            console.log(`New player ${data.nickname} joined the room.`);
        } else {
            console.error(`Player ${data.nickname} cannot rejoin: room is not in Lobby state.`);
            return;
        }

        this.gameState.addPlayer(data);
    }

    startGame(data : any) {
        if (this.roomstate !== "Lobby") {
            console.error("Cannot start game, room is not in Lobby state.");
            return;
        }
        this.roomstate = "Running";
        return this.gameState.startGame(data);
    }

    playerMove(data : any) {
        if (this.roomstate !== "Running") {
            console.error("Cannot make a move, game is not running.");
            return;
        }
        if (!this.players.find(player => player.playerId === data.playerId)) {
            console.error(`Player ${data.playerId} is not in the room.`);
            return;
        }
    
        return this.gameState.playerMove(data);
    }
}