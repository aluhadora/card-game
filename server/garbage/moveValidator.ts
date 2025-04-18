import { GameStates } from "./constants";
import { MoveContext, MoveData } from "./types";

export default class MoveValidator {

    validatePlayerTurn({ playerId }: MoveData, { gameState, currentPlayerId }: MoveContext) : boolean {
        if (gameState === GameStates.Opening) return true;

        if (currentPlayerId !== playerId) {
            console.error(`It's not player ${playerId}'s turn! Current player is ${currentPlayerId}.`);
            return false;
        }
        return true;
    }

    validateMove(moveData : MoveData, context : MoveContext) : boolean {
        return this.validatePlayerTurn(moveData, context);
    }
}