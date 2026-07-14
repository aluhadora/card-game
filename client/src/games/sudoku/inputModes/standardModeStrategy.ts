import { MoveTypes } from "../constants";
import { Cell, MoveData } from "../types";
import { InputModeStrategy } from "./inputModeStrategy";
import { InputProps } from "./inputModeStrategyHandler";

export class StandardModeStrategy implements InputModeStrategy {
    handleCellClick(inputProps: InputProps, _cell: Cell, cellAddress: [number, number], _playerMove: (move: MoveData) => void, _playerId: string): void {
        const { setSelectedCell } = inputProps;

        setSelectedCell(cellAddress);
    }

    handleNumberClick(inputProps: InputProps, number: number, playerMove: (move: MoveData) => void, playerId: string): void {
        const { selectedCell } = inputProps;

        if (selectedCell !== null && number) {
            playerMove({ moveType: MoveTypes.SetCellValue, cellAddress: selectedCell, value: number, playerId });
        } else if (selectedCell !== null) {
            playerMove({ moveType: MoveTypes.ClearCell, cellAddress: selectedCell, value: null, playerId });
        }
    }
    onMouseEnterCell(): void {
    }

    handleClearButtonPress(_inputProps: InputProps, selectedCell: [number, number] | null, playerMove: (move: MoveData) => void, playerId: string): void {
        if (selectedCell === null) return;

        playerMove({ moveType: MoveTypes.ClearCell, cellAddress: selectedCell, value: null, playerId });
    }

}