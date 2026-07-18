import { MoveContext, MoveData } from "../types";
import { ConfirmedStatus } from "../constants";

export default function checkAnswers(_moveData: MoveData, context: MoveContext): MoveContext {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = context.board[row][col];
            if (cell.value !== null && cell.value !== context.puzzleSolution[row][col]) {
                cell.confirmed = ConfirmedStatus.Incorrect;
            }
        }
    }

    return context;
}
