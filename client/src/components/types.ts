import { GameType } from "../constants";

export interface GameSettings {
    gameType: GameType;
}

export type Player = {
    playerId?: string;
    nickname?: string;
    socketIds?: string[];
    playerSecret?: string;
};

export type PlayersMap = Record<string, Player>;
