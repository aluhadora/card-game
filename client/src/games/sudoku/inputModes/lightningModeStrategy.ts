import { Cell, MoveData } from "../types";
import { InputModeStrategy } from "./inputModeStrategy";
import { InputProps } from "./inputModeStrategyHandler";
import { InputMode, MoveTypes } from "../constants";

export class LightningModeStrategy implements InputModeStrategy {
    
    setCell(selectedNumber: number | null, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string) {
        if (selectedNumber !== null && selectedNumber !== 0) {
            playerMove({ moveType: MoveTypes.SetCellValue, cellAddress, value: selectedNumber, playerId });
        } else if (selectedNumber === 0) {
            playerMove({ moveType: MoveTypes.ClearCell, cellAddress, value: null, playerId });
        }
    }

    handleCellClick(inputProps: InputProps, _cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string): void {
        const { selectedNumber } = inputProps;

        inputProps.setDragging(true);

        this.setCell(selectedNumber, cellAddress, playerMove, playerId);
    }

    handleNumberClick(inputProps: InputProps, number: number, _playerMove: (move: MoveData) => void, _playerId: string): void {
        const { setSelectedNumber } = inputProps;
        setSelectedNumber(number);
    }

    onMouseEnterCell(_inputProps: InputProps, _cell: Cell, _cellAddress: [number, number], _playerMove: (move: MoveData) => void, _playerId: string): void {
    }

    handleClearButtonPress(inputProps: InputProps, _selectedCell: [number, number] | null, _playerMove: (move: MoveData) => void, _playerId: string): void {
        inputProps.setInputMode(InputMode.LightningHint);
    }
}