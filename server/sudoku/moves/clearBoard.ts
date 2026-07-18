import { ConfirmedStatus } from "../constants";
import { MoveContext, MoveData } from "../types";

export default function clearBoard(_moveData: MoveData, context: MoveContext): MoveContext {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = context.board[row][col];
            if (!cell.readonly) {
                cell.value = null;
                cell.createdBy = "null";
                cell.confirmed = ConfirmedStatus.Unconfirmed;
                cell.hints = [];
            }
        }
    }

    return context;
}
