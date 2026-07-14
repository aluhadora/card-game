import { MoveContext, MoveData } from "./types";

export default class MoveValidator {

    validateMove(moveData : MoveData, context : MoveContext) : boolean {
        const [row, col] = moveData.cellAddress;
        const cell = context.board[row][col];
        if (cell.readonly) {
            return false;
        }

        return true;
    }
}