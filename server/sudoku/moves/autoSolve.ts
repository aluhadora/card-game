import { ConfirmedStatus } from "../constants";
import { MoveContext, MoveData } from "../types";

export default function autoSolveMove(_moveData: MoveData, context: MoveContext): MoveContext {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = context.board[row][col];
            if (cell.value === null) {
                cell.value = context.puzzleSolution[row][col];
                cell.createdBy = "system";
                cell.confirmed = ConfirmedStatus.Confirmed;
                cell.hints = [];
            }
        }
    }

    return context;
}
