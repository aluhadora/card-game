import { Cell, MoveData } from "../types";
import { InputProps } from "./inputModeStrategyHandler";

export interface InputModeStrategy {
    handleClearButtonPress(inputProps: InputProps, selectedCell: [number, number] | null, playerMove: (move: MoveData) => void, playerId: string): unknown;
    onMouseEnterCell(inputProps: InputProps, cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string): void;
    handleCellClick(inputProps: InputProps, cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string) : void;
    handleNumberClick(inputProps: InputProps, number: number, playerMove: (move: MoveData) => void, playerId: string): void;
}