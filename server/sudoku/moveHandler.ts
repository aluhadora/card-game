import {  MoveTypes } from "./constants";
import MoveValidator from "./moveValidator";
import { MoveContext, MoveData } from "./types";


function clearCell(moveData: MoveData, context: MoveContext) : MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    if (cell.value !== null) {
        cell.value = null;
        cell.createdBy = null;
    } else {
        cell.hints = [];
    }

    return context;
}

function setCellValue(moveData: MoveData, context: MoveContext) : MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    cell.value = moveData.value;
    cell.createdBy = moveData.playerId;
    return context;
}

function toggleHint(moveData: MoveData, context: MoveContext) : MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    const existingHintIndex = cell.hints.findIndex(hint => hint.value === moveData.value);
    if (existingHintIndex !== -1) {
        cell.hints.splice(existingHintIndex, 1);
    } else {
        cell.hints.push({ value: moveData.value!, createdBy: moveData.playerId });
    }
    
    return context;
}

export default class MoveHandler {
    moveValidator: MoveValidator;
    moveDictionary: Record<string, (moveData: MoveData, context : MoveContext) => MoveContext>;

    constructor() {
        this.moveValidator = new MoveValidator();
        this.moveDictionary = {};
        this.moveDictionary[MoveTypes.ClearCell] = clearCell;
        this.moveDictionary[MoveTypes.SetCellValue] = setCellValue;
        this.moveDictionary[MoveTypes.ToggleHint] = toggleHint;
    }

    handleMove(moveData : MoveData, context : MoveContext) : MoveContext | undefined {
        if (!this.moveValidator.validateMove(moveData, context)) return;
        
        return this.moveDictionary[moveData.moveType](moveData, context);
    }
}