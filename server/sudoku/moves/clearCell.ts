import { ConfirmedStatus } from "../constants";
import { MoveContext, MoveData } from "../types";

export default function clearCell(moveData: MoveData, context: MoveContext): MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    if (cell.value !== null) {
        cell.value = null;
        cell.confirmed = ConfirmedStatus.Unconfirmed;
        cell.createdBy = null;
    } else {
        cell.hints = [];
    }

    return context;
}
