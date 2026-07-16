import { GameStates, MoveTypes } from "./constants";
import { MoveContext, MoveData } from "./types";

export default class MoveValidator {

    validateMove(moveData : MoveData, context : MoveContext) : boolean {
        const endGameAction = moveData.moveType in [MoveTypes.NewBoard, MoveTypes.CloseGame];
        if (context.gameState === GameStates.Completed) {
            return endGameAction;
        }
        if (endGameAction) {
            return false;
        }
        
        const [row, col] = moveData.cellAddress;
        const cell = context.board[row][col];
        if (cell.readonly) {
            return false;
        }

        return true;
    }
}