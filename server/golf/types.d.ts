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
    player: Player;
}

export type MoveContext = {
    gameState: string;
    currentPlayerId: string;
    discards: Card[];
    actions: MoveContextActions;
    players: Record<string, Player>;
}

export type MoveContextActions = { 
    gameState: (state: string) => void;
    advancePlayer: () => void;
    recalculateScore: (player?: Player) => void;
    draw: () => Card;
}