import { GameType } from "../constants";

export interface BaseSocketPayload {
    pin: string;
}

export interface ChatMessagePayload extends BaseSocketPayload {
    message: string;
    gameType?: GameType;
}

export interface CancelGamePayload extends BaseSocketPayload {
    playerId?: string;
}

export interface VoteCancelPayload extends BaseSocketPayload {
    playerId?: string;
    vote: boolean;
}

export interface RoomJoinedEvent {
    name: string;
    playerId: string;
    players: unknown[];
}

export interface MessageReceivedEvent {
    playerId: string;
    nickname: string;
    message: string;
}
