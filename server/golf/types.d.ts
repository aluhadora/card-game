export type MoveHandlerFunction = (args: MoveData) => any;

export type Player = {
    id: string;
    selectedCard: Card | null;
    playArea: (Card | null)[];
    score: number;
    nickname: string;
    index: number,
}

export type Card = {
    score: number;
    name: string;
}

export type MoveData = {
    moveType: string;
    playerId: string;
    cardIndex: number;
    discards: Card[];
    gameState: string;
    actions: any;
    player: Player;
}