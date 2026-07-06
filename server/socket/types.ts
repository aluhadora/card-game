export interface BaseSocketPayload {
  pin: string;
}

export interface ChatMessagePayload extends BaseSocketPayload {
  message: string;
  gameType?: string;
}

export interface PlayerMovePayload extends BaseSocketPayload {
  moveType?: string;
  cardIndex?: number;
  [key: string]: unknown;
}

export interface GolfPlayerMovePayload extends PlayerMovePayload {
  moveType: string;
  cardIndex: number;
}

export interface GarbagePlayerMovePayload extends PlayerMovePayload {
  moveType: string;
  cardIndex: number;
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
