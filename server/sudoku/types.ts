import { BasePlayerMovePayload, Player, StartGamePayload } from "../types";
import { DifficultyLevel, GameMode, GameState, MoveType } from "./constants";

export type Hint = {
    value: number;
    createdBy: string;
}

export type Puzzle = {
    board: Cell[][];
    solution: number[][];
    difficultyLevel: DifficultyLevel;
};

export type Cell = {
    value: number | null;
    readonly: boolean;
    confirmed: boolean;
    hints: Hint[];
    createdBy: string | null;
}

export type MoveData = BasePlayerMovePayload & {
    moveType: MoveType;
    cellAddress: [number, number];
    value: number | null;
}

export type MoveContext = {
    newBoard(): MoveContext;
    closeGame(): MoveContext;
    autoPencilBoard(): MoveContext;
    autoSolveBoard(): MoveContext;
    board: Cell[][];
    gameState: GameState;
}

export type StartSudokuGame = StartGamePayload & {
    difficultyLevel: DifficultyLevel;
}

export type SudokuPlayer = Player & { 
    color: string;
}

export interface SudokuGameSettings extends StartGamePayload {
    gameMode: GameMode;
    difficultyLevel: DifficultyLevel;
    allowAutoPencil: boolean;
    autoCheckAnswers: boolean;
}
