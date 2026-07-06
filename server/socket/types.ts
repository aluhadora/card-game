export interface BaseSocketPayload {
    pin: string;
}

export interface ChatMessagePayload extends BaseSocketPayload {
    message: string;
    gameType?: string;
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
