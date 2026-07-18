import { GameStates, MoveTypes } from "./constants";
import { MoveContext, MoveData } from "./types";

export default class MoveValidator {

    validateMove(moveData : MoveData, context : MoveContext) : boolean {
        const endGameAction = moveData.moveType === MoveTypes.NewBoard || moveData.moveType === MoveTypes.CloseGame;
        if (context.gameState === GameStates.Completed && endGameAction) {
            return true;
        }
        if (endGameAction) {
            console.log(`MoveValidator: Allowing end game action ${moveData.moveType} in completed game state.`);
            return false;
        }
        if (moveData.moveType === MoveTypes.AutoFillPencilHints || moveData.moveType === MoveTypes.AutoSolve || moveData.moveType === MoveTypes.CheckAnswers || moveData.moveType === MoveTypes.ClearBoard) {
            return true;
        }
        
        const [row, col] = moveData.cellAddress;
        const cell = context.board[row][col];
        if (cell.readonly) {
            console.log(`MoveValidator: Move ${moveData.moveType} is invalid because cell at ${row},${col} is readonly.`);
            return false;
        }

        return true;
    }
}