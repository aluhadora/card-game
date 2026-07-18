import { MoveContext, MoveData } from "../types";

export default function toggleHint(moveData: MoveData, context: MoveContext): MoveContext {
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