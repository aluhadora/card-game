import { Cell, MoveData } from "../types";
import { InputModeStrategy } from "./inputModeStrategy";
import { InputHandlerProps } from "./inputHandler";
import { InputMode, MoveTypes } from "../constants";

export class LightningModeStrategy implements InputModeStrategy {
    
    setCell(selectedNumber: number | null, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string) {
        if (selectedNumber !== null && selectedNumber !== 0) {
            playerMove({ moveType: MoveTypes.SetCellValue, cellAddress, value: selectedNumber, playerId });
        } else if (selectedNumber === 0) {
            playerMove({ moveType: MoveTypes.ClearCell, cellAddress, value: null, playerId });
        }
    }

    handleCellClick(inputProps: InputHandlerProps, _cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string): void {
        const { selectedNumber } = inputProps;

        if (_cell)
        inputProps.setDragging(true);

        this.setCell(selectedNumber, cellAddress, playerMove, playerId);
    }

    handleNumberClick(inputProps: InputHandlerProps, number: number, _playerMove: (move: MoveData) => void, _playerId: string): void {
        const { setSelectedNumber } = inputProps;
        setSelectedNumber(number);
    }

    onMouseEnterCell(_inputProps: InputHandlerProps, _cell: Cell, _cellAddress: [number, number], _playerMove: (move: MoveData) => void, _playerId: string): void {
    }

    handleClearButtonPress(inputProps: InputHandlerProps, _selectedCell: [number, number] | null, _playerMove: (move: MoveData) => void, _playerId: string): void {
        inputProps.setInputMode(InputMode.LightningHint);
    }
}