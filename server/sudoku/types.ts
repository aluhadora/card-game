import { BasePlayerMovePayload, StartGamePayload } from "../types";
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

export type MoveData = BasePlayerMovePayload & {
    moveType: MoveType;
    cellAddress: [number, number];
    value: number | null;
}

export type MoveContext = {
    board: Cell[][];
}

export type StartSudokuGame = StartGamePayload & {
    difficultyLevel: DifficultyLevel;
}