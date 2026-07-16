import { InputMode, MoveTypes } from "../constants";
import { Cell, MoveData } from "../types";
import { InputModeStrategy } from "./inputModeStrategy";
import { InputHandlerProps } from "./inputHandler";

export class LightningHintModeStrategy implements InputModeStrategy {
    handleCellClick(
        inputProps: InputHandlerProps,
        cell: Cell,
        cellAddress: [number, number],
        playerMove: (move: MoveData) => void,
        playerId: string,
    ): void {
        const { selectedNumber, setDragging, setDragClearing } = inputProps;

        setDragging(true);

        if (selectedNumber && cell.value === null) {
            setDragClearing(
                cell.hints.some((hint) => hint.value === selectedNumber),
            );
            playerMove({
                moveType: MoveTypes.ToggleHint,
                cellAddress,
                value: selectedNumber,
                playerId,
            });
        } else if (selectedNumber === 0 && cell.value === null) {
            playerMove({
                moveType: MoveTypes.ClearHint,
                cellAddress,
                value: null,
                playerId,
            });
        } else if (cell.value !== null) {
            playerMove({
                moveType: MoveTypes.ClearCell,
                cellAddress,
                value: null,
                playerId,
            });
        }
    }

    handleNumberClick(
        inputProps: InputHandlerProps,
        number: number,
        _playerMove: (move: MoveData) => void,
        _playerId: string,
    ): void {
        const { setSelectedNumber } = inputProps;
        setSelectedNumber(number);
    }

    onMouseEnterCell(
        inputProps: InputHandlerProps,
        cell: Cell,
        cellAddress: [number, number],
        playerMove: (move: MoveData) => void,
        playerId: string,
    ): void {
        const { selectedNumber, dragging, dragClearing } = inputProps;

        if (!dragging || selectedNumber === null || cell.value !== null) return;

        if (selectedNumber === 0) {
            // Clear all hints in the cell
            cell.hints.forEach((hint) => {
                playerMove({
                    moveType: MoveTypes.ToggleHint,
                    cellAddress,
                    value: hint.value,
                    playerId,
                });
            });
            return;
        }

        if (dragClearing) {
            playerMove({
                moveType: MoveTypes.ClearHint,
                cellAddress,
                value: selectedNumber,
                playerId,
            });
        } else {
            playerMove({
                moveType: MoveTypes.AddHint,
                cellAddress,
                value: selectedNumber,
                playerId,
            });
        }
    }

    handleClearButtonPress(
        inputProps: InputHandlerProps,
        _selectedCell: [number, number] | null,
        _playerMove: (move: MoveData) => void,
        _playerId: string,
    ): void {
        inputProps.setInputMode(InputMode.Lightning);
    }
}
