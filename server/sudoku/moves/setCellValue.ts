import { ConfirmedStatus } from "../constants";
import { MoveContext, MoveData } from "../types";
import checkAnswers from "./checkAnswers";
import { clearHint } from "./helpers";

export default function setCellValue(moveData: MoveData, context: MoveContext): MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    cell.value = moveData.value;
    cell.createdBy = moveData.playerId;
    cell.confirmed = ConfirmedStatus.Unconfirmed;

    const value = moveData.value;

    for (let c = 0; c < 9; c++) {
        clearHint(context.board[row][c], value);
    }

    for (let r = 0; r < 9; r++) {
        clearHint(context.board[r][col], value);
    }

    const groupRow = Math.floor(row / 3) * 3;
    const groupCol = Math.floor(col / 3) * 3;
    for (let r = groupRow; r < groupRow + 3; r++) {
        for (let c = groupCol; c < groupCol + 3; c++) {
            clearHint(context.board[r][c], value);
        }
    }

    if (context.settings?.autoCheckAnswers) {
        checkAnswers(moveData, context);
    }

    return context;
}
