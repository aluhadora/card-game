import { DifficultyLevel, MoveType } from "./constants";

export type Hint = {
    value: number;
    createdBy: string;
}

export type Cell = {
    value: number | null;
    readonly: boolean;
    confirmed: boolean;
    hints: Hint[];
    createdBy: string | null;
}

export type MoveData = {
    moveType: MoveType;
    cellAddress: [number, number];
    value: number | null;
    playerId: string;
}

export type MoveContext = {
    board: Cell[][];
}

export type StartSudokuGame = {
    difficultyLevel: DifficultyLevel;
    gameType: "sudoku";
}

export type Player = {
    playerId: string;
    name: string;
    color: string;
}