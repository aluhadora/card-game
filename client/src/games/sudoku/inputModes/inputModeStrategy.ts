import { Cell, MoveData } from "../types";
import { InputHandlerProps } from "./inputHandler";

export interface InputModeStrategy {
    handleClearButtonPress(inputProps: InputHandlerProps, selectedCell: [number, number] | null, playerMove: (move: MoveData) => void, playerId: string): unknown;
    onMouseEnterCell(inputProps: InputHandlerProps, cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string): void;
    handleCellClick(inputProps: InputHandlerProps, cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string) : void;
    handleNumberClick(inputProps: InputHandlerProps, number: number, playerMove: (move: MoveData) => void, playerId: string): void;
}