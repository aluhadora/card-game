export type Participant = {
    playerId: string;
    nickname: string;
    socketIds: string[];
    playerSecret: string;
}

export interface Game {
    players: Record<string, unknown>;
    visibleState(extraData?: Record<string, unknown>): Record<string, unknown>;
    playerMove(data: BasePlayerMovePayload): Record<string, unknown> | undefined;
    startGame(data: StartGamePayload): Record<string, unknown>;
    addPlayer(data: AddPlayerPayload): void;
}

export interface BaseSocketPayload {
  pin: string;
}

export interface StartGamePayload extends BaseSocketPayload {
  gameType?: string;
}

export interface RoomJoinPayload extends BaseSocketPayload {
  playerId: string;
  playerSecret: string;
  nickname: string;
  gameType?: string;
  socketId: string;
  roomId: string;
}

export interface AddPlayerPayload extends BaseSocketPayload {
  playerId: string;
  playerSecret: string;
  nickname: string;
  socketId: string;
  roomId: string;
}

export interface BasePlayerMovePayload extends BaseSocketPayload {
  playerId: string;
}