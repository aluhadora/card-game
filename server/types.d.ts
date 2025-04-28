export type Participant = {
    playerId: string;
    nickname: string;
    socketIds: string[];
    playerSecret: string;
}

export type Game = {
    playerMove(data: any): any;
    startGame(data: any): any;
    addPlayer(data: { playerId: string; nickname: string; socketId: string; playerSecret: string; roomId: string; }): any;
}