import GarbageGameState from "./garbageGameState.js";

export default class RoomState {
    joinHost(data) {
        this.hostId = data.hostId;
        this.roomId = data.pin;
        this.players = [{playerId: data.hostId, nickname: data.nickname}]; 
        this.roomstate = "Lobby";
        this.gameState = new GarbageGameState();
        this.joinPlayer(data);
    }

    joinPlayer(data) {
        if (!data.roomId) {
            console.error("No room exists to join.");
            return;
        }
        if (this.roomstate !== "Lobby") {
            console.error("Cannot join player, room is not in Lobby state.");
            return;
        }
        if (!this.players.find(player => player.playerId === data.playerId)) {
            this.players.push({playerId: data.playerId, nickname: data.nickname});
        } else {
            console.warn(`Player ${data.nickname} is already in the room.`);
        }
    
        this.gameState.addPlayer(data);
    }

    startGame() {
        if (this.roomstate !== "Lobby") {
            console.error("Cannot start game, room is not in Lobby state.");
            return;
        }
        this.roomstate = "Running";
        return this.gameState.startGame();
    }

    playerMove(data) {
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