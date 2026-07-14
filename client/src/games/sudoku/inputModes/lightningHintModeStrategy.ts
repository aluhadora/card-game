import { InputMode, MoveTypes } from "../constants";
import { Cell, MoveData } from "../types";
import { InputModeStrategy } from "./inputModeStrategy";
import { InputProps } from "./inputModeStrategyHandler";

export class LightningHintModeStrategy implements InputModeStrategy {
    
    handleCellClick(inputProps: InputProps, cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string): void {
        const { selectedNumber, setDragging, setDragClearing } = inputProps;

        console.log("LightningHintModeStrategy handleCellClick", cellAddress, cell.value, selectedNumber);
        console.log("Setting dragging to true");
        setDragging(true);

        if (selectedNumber !== null && cell.value === null) {
            setDragClearing(cell.hints.some(hint => hint.value === selectedNumber));
            playerMove({ moveType: MoveTypes.ToggleHint, cellAddress, value: selectedNumber, playerId });
        } else if (selectedNumber === 0 && cell.value === null) {
            // Clear all hints in the cell
            cell.hints.forEach(hint => {
                playerMove({ moveType: MoveTypes.ToggleHint, cellAddress, value: hint.value, playerId });
            });
        } else if (cell.value !== null) {
            playerMove({ moveType: MoveTypes.ClearCell, cellAddress, value: null, playerId });
        }
    }

    handleNumberClick(inputProps: InputProps, number: number, _playerMove: (move: MoveData) => void, _playerId: string): void {
        const { setSelectedNumber } = inputProps;
        setSelectedNumber(number);
    }

    onMouseEnterCell(inputProps: InputProps, cell: Cell, cellAddress: [number, number], playerMove: (move: MoveData) => void, playerId: string): void {
        const { selectedNumber, dragging, dragClearing } = inputProps;

        if (!dragging || selectedNumber === null || cell.value !== null) return;

        if (selectedNumber === 0) {
            // Clear all hints in the cell
            cell.hints.forEach(hint => {
                playerMove({ moveType: MoveTypes.ToggleHint, cellAddress, value: hint.value, playerId });
            });
            return;
        }

        if (dragClearing === cell.hints.some(hint => hint.value === selectedNumber)) {
            playerMove({ moveType: MoveTypes.ToggleHint, cellAddress, value: selectedNumber, playerId });
        }
    }

    handleClearButtonPress(inputProps: InputProps, _selectedCell: [number, number] | null, _playerMove: (move: MoveData) => void, _playerId: string): void {
        inputProps.setInputMode(InputMode.Lightning);
    }
}