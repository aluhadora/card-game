import { GameStates } from "./constants";
import { MoveData } from "./types";

export default class MoveValidator {

    validateOpeningStatePlayerMove({gameState, player, cardIndex, playerId} : MoveData) : boolean {
        if (gameState !== GameStates.Opening) return true;

        if (!player) return false;

        if (player.playArea[cardIndex] !== null) {
            console.error(`Card index ${cardIndex} is already occupied for player ${playerId}.`);
            return false;
        }

        console.log(`Player ${playerId} accepted card at index ${cardIndex}.`);
        console.log(`Player has ${player.playArea.filter(card => card !== null).length} accepted cards.`);
        if (player.playArea.filter(card => card !== null).length >= 2) {
            console.error(`Player ${playerId} has already accepted two cards. Cannot accept more.`);
            return false;
        }

        return true;
    }

    validatePlayerTurn({gameState, playerId, currentPlayerId} : MoveData) : boolean {
        if (gameState === GameStates.Opening) return true;

        if (currentPlayerId !== playerId) {
            console.error(`It's not player ${playerId}'s turn! Current player is ${currentPlayerId}.`);
            return false;
        }
        return true;
    }

    validateMove(moveData : MoveData) {
        return this.validateOpeningStatePlayerMove(moveData)
            && this.validatePlayerTurn(moveData);
    }
}