import { BasePlayerMovePayload, StartGamePayload } from "../types";

export type Player = {
    id: string;
    selectedCard: Card | null;
    playArea: (Card | null)[];
    score: number;
    nickname: string;
    index: number,
}

export type Card = {
    name: string;
    rank: string;
}

export type MoveData = BasePlayerMovePayload & {
    moveType: string;
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
    recalculateScore: (player: Player | null) => void;
    draw: () => Card;
}

export interface StartGolfGamePayload extends StartGamePayload {
    players: Array<{
        playerId: string;
        nickname: string;
        playerSecret: string;
    }>;
    gameType: 'golf';
    decks: number;
}