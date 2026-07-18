import { InputMode } from "../constants";
import { Cell, MoveData } from "../types";
import { InputModeStrategy } from "./inputModeStrategy";
import { LightningHintModeStrategy } from "./lightningHintModeStrategy";
import { LightningModeStrategy } from "./lightningModeStrategy";
import { StandardHintModeStrategy } from "./standardHintModeStrategy";
import { StandardModeStrategy } from "./standardModeStrategy";

export type InputHandlerProps = {
    inputMode: InputMode;
    setInputMode: (mode: InputMode) => void;
    selectedNumber: number | null;
    selectedCell: [number, number] | null;
    setSelectedNumber: (num: number | null) => void;
    setSelectedCell: (cell: [number, number] | null) => void;
    hoveredCell: [number, number] | null;
    setHoveredCell: (cell: [number, number] | null) => void;
    dragging: boolean;
    setDragging: (dragging: boolean) => void;
    dragClearing: boolean;
    setDragClearing: (dragClearing: boolean) => void;
    showRemainingNumbers: boolean;
    setShowRemainingNumbers: (show: boolean) => void;
    inputHandler: InputModeStrategyHandler;
};

export class InputModeStrategyHandler implements InputModeStrategy {
    inputModeDictionary: { [key: string]: InputModeStrategy };
    inputMode: InputMode;

    constructor(inputMode: InputMode) {
        this.inputModeDictionary = {};
        this.inputModeDictionary[InputMode.Standard] =
            new StandardModeStrategy();
        this.inputModeDictionary[InputMode.StandardHint] =
            new StandardHintModeStrategy();
        this.inputModeDictionary[InputMode.Lightning] =
            new LightningModeStrategy();
        this.inputModeDictionary[InputMode.LightningHint] =
            new LightningHintModeStrategy();
        this.inputMode = inputMode;
    }

    inputStrategy(): InputModeStrategy {
        return this.inputModeDictionary[this.inputMode];
    }

    handleCellClick(
        inputProps: InputHandlerProps,
        cell: Cell,
        cellAddress: [number, number],
        playerMove: (move: MoveData) => void,
        playerId: string,
    ) {
        this.inputStrategy().handleCellClick(
            inputProps,
            cell,
            cellAddress,
            playerMove,
            playerId,
        );
    }

    handleNumberClick(
        inputProps: InputHandlerProps,
        number: number,
        playerMove: (move: MoveData) => void,
        playerId: string,
    ) {
        this.inputStrategy().handleNumberClick(
            inputProps,
            number,
            playerMove,
            playerId,
        );
    }

    onMouseEnterCell(
        inputProps: InputHandlerProps,
        cell: Cell,
        cellAddress: [number, number],
        playerMove: (move: MoveData) => void,
        playerId: string,
    ): void {
        inputProps.setHoveredCell(cellAddress);

        this.inputStrategy().onMouseEnterCell(
            inputProps,
            cell,
            cellAddress,
            playerMove,
            playerId,
        );
    }

    onMouseUp(inputProps: InputHandlerProps) {
        inputProps.setDragging(false);
    }

    handleExitBoard(inputProps: InputHandlerProps): void {
        inputProps.setHoveredCell(null);
    }

    handleClearButtonPress(
        inputProps: InputHandlerProps,
        selectedCell: [number, number] | null,
        playerMove: (move: MoveData) => void,
        playerId: string,
    ): void {
        this.inputStrategy().handleClearButtonPress(
            inputProps,
            selectedCell,
            playerMove,
            playerId,
        );
    }
}
