import { GameSettings } from "../../components/types";
import { GameType } from "../../constants";
import { DifficultyLevel, MoveType, GameState, GameMode, ConfirmedStatus } from "./constants";

export type Hint = {
    value: number;
    createdBy: string;
};

export type Cell = {
    value: number | null;
    readonly: boolean;
    confirmed: ConfirmedStatus | unknown | null;
    hints: Hint[];
    createdBy: string | null;
};

export type MoveData = {
    moveType: MoveType;
    cellAddress: [number, number];
    value: number | null;
    playerId: string;
};

export type MoveContext = {
    board: Cell[][];
    gameState: GameState;
};

export type StartSudokuGame = {
    difficultyLevel: DifficultyLevel;
    gameType: "sudoku";
};

export type Player = {
    playerId: string;
    name: string;
    color: string;
};

export interface SudokuGameSettings extends GameSettings {
    gameType: GameType;
    gameMode?: GameMode;
    difficultyLevel?: DifficultyLevel;
    allowAutoPencil?: boolean;
    autoCheckAnswers?: boolean;
}
