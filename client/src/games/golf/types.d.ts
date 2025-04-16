export type Player = {
    id: string;
    selectedCard: CardData | null;
    playArea: (CardData | null)[];
    score: number;
    nickname: string;
    index: number,
}

export type CardData = {
    score: number;
    name: string;
}

export type MoveData = {
    moveType: string;
    cardIndex?: number | undefined;
}

export type GameState = {
    currentPlayerId: string | null;
    gameState: string;
    players: Record<string, Player>;
    discardPile: CardData[];
    remainingCards: number;
    deckLength: number;
    totalUnrevealedCards: number;
}

export type AnimationDelta = {
    from: { left: number; top: number; width: number; height: number };
    to: { left: number; top: number; width: number; height: number };
    card: CardData | null;
}