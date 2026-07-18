import { Cell, MoveContext } from "../types";

export function clearHint(cell: Cell, value: number | null): void {
    if (value === null || value === 0 || value === undefined) {
        cell.hints = [];
    } else {
        const existingHintIndex = cell.hints.findIndex(hint => hint.value === value);
        if (existingHintIndex !== -1) {
            cell.hints.splice(existingHintIndex, 1);
        }
    }
}

export function allowAddHint(cellAddress: [number, number], value: number, context: MoveContext): boolean {
    const [row, col] = cellAddress;
    for (let c = 0; c < 9; c++) {
        if (context.board[row][c].value === value) {
            return false;
        }
    }

    for (let r = 0; r < 9; r++) {
        if (context.board[r][col].value === value) {
            return false;
        }
    }

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

export function addHint(cell: Cell, value: number, playerId: string): void {
    const existingHintIndex = cell.hints.findIndex(hint => hint.value === value && hint.createdBy === playerId);
    if (existingHintIndex === -1) {
        cell.hints.push({ value, createdBy: playerId });
    }
}

export function getPossibleValues(row: number, col: number, context: MoveContext): number[] {
    const possibleValues = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let c = 0; c < 9; c++) {
        const value = context.board[row][c].value;
        if (value !== null) {
            possibleValues.delete(value);
        }
    }

    for (let r = 0; r < 9; r++) {
        const value = context.board[r][col].value;
        if (value !== null) {
            possibleValues.delete(value);
        }
    }

    const groupRow = Math.floor(row / 3) * 3;
    const groupCol = Math.floor(col / 3) * 3;
    for (let r = groupRow; r < groupRow + 3; r++) {
        for (let c = groupCol; c < groupCol + 3; c++) {
            const value = context.board[r][c].value;
            if (value !== null) {
                possibleValues.delete(value);
            }
        }
    }

    return Array.from(possibleValues);
}
