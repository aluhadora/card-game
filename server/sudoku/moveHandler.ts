import {  MoveTypes } from "./constants";
import MoveValidator from "./moveValidator";
import { Cell, MoveContext, MoveData } from "./types";


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

    // Clear hints of this value from row, column, and 3x3 group
    const value = moveData.value;
    
    // Clear from row
    for (let c = 0; c < 9; c++) {
        clearHint(context.board[row][c], value);
    }
    
    // Clear from column
    for (let r = 0; r < 9; r++) {
        clearHint(context.board[r][col], value);
    }
    
    // Clear from 3x3 group
    const groupRow = Math.floor(row / 3) * 3;
    const groupCol = Math.floor(col / 3) * 3;
    for (let r = groupRow; r < groupRow + 3; r++) {
        for (let c = groupCol; c < groupCol + 3; c++) {
            clearHint(context.board[r][c], value);
        }
    }
    
    return context;
}

function clearHint(cell: Cell, value: number | null) {
    if (value === null) {
        cell.hints = [];
    } else {
        const existingHintIndex = cell.hints.findIndex(hint => hint.value === value);
        if (existingHintIndex !== -1) {
            cell.hints.splice(existingHintIndex, 1);
        }
    }
}

function clearHintMove(moveData: MoveData, context: MoveContext) : MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];
    clearHint(cell, moveData.value);
    return context;
}

function addHintMove(moveData: MoveData, context: MoveContext) : MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];
    if (allowAddHint(moveData.cellAddress, moveData.value!, context)) {
        addHint(cell, moveData.value!, moveData.playerId);
    }
    return context;
}

function allowAddHint(cellAddress: [number, number], value: number, context: MoveContext): boolean {
    // Check if value exists in row
    const [row, col] = cellAddress;
    for (let c = 0; c < 9; c++) {
        if (context.board[row][c].value === value) {
            return false;
        }
    }

    // Check if value exists in column
    for (let r = 0; r < 9; r++) {
        if (context.board[r][col].value === value) {
            return false;
        }
    }

    // Check if value exists in 3x3 group
    const groupRow = Math.floor(row / 3) * 3;
    const groupCol = Math.floor(col / 3) * 3;
    for (let r = groupRow; r < groupRow + 3; r++) {
        for (let c = groupCol; c < groupCol + 3; c++) {
            if (context.board[r][c].value === value) {
                return false;
            }
        }
    }

    return true;
}

function addHint(cell: Cell, value: number, playerId: string) {
    // Check if value already exists in hints
    const existingHintIndex = cell.hints.findIndex(hint => hint.value === value && hint.createdBy === playerId);
    if (existingHintIndex === -1) {
        cell.hints.push({ value: value, createdBy: playerId });
    }
}

function toggleHint(moveData: MoveData, context: MoveContext) : MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    const existingHintIndex = cell.hints.findIndex(hint => hint.value === moveData.value);
    if (existingHintIndex !== -1) {

        cell.hints.splice(existingHintIndex, 1);
    } else {
        const value = moveData.value!;
        
        // Check if value exists in row
        let valueInRow = false;
        for (let c = 0; c < 9; c++) {
            if (context.board[row][c].value === value) {
                valueInRow = true;
                break;
            }
        }
        
        // Check if value exists in column
        let valueInCol = false;
        for (let r = 0; r < 9; r++) {
            if (context.board[r][col].value === value) {
                valueInCol = true;
                break;
            }
        }
        
        // Check if value exists in 3x3 group
        let valueInGroup = false;
        const groupRow = Math.floor(row / 3) * 3;
        const groupCol = Math.floor(col / 3) * 3;
        for (let r = groupRow; r < groupRow + 3; r++) {
            for (let c = groupCol; c < groupCol + 3; c++) {
                if (context.board[r][c].value === value) {
                    valueInGroup = true;
                    break;
                }
            }
            if (valueInGroup) break;
        }
        
        // Only push hint if value doesn't exist in row, column, or group
        if (!valueInRow && !valueInCol && !valueInGroup) {
            cell.hints.push({ value: value, createdBy: moveData.playerId });
        }

    }

    return context;
}

function newBoardMove(moveData: MoveData, context: MoveContext) : MoveContext {
    return context.newBoard();
}

function closeGameMove(moveData: MoveData, context: MoveContext) : MoveContext {
    return context.closeGame();
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
        this.moveDictionary[MoveTypes.ClearHint] = clearHintMove;
        this.moveDictionary[MoveTypes.AddHint] = addHintMove;
        this.moveDictionary[MoveTypes.NewBoard] = newBoardMove;
        this.moveDictionary[MoveTypes.CloseGame] = closeGameMove;
    }

    handleMove(moveData : MoveData, context : MoveContext) : MoveContext | undefined {
        if (!this.moveValidator.validateMove(moveData, context)) return;
        
        return this.moveDictionary[moveData.moveType](moveData, context);
    }
}