export default class MoveValidator {
    constructor(golfGame) {
        this.golfGame = golfGame;
    }

    validateOpeningStatePlayerMove(moveData) {
        if (this.gameState !== "Opening") {
            return true;
        }

        const player = this.players[moveData.playerId];
        if (!player) {
            console.error(`Player ${moveData.playerId} not found!`);
            return false;
        }

        // Accept the first two cards drawn by the player
        if (!moveData.cardIndex || !moveData.acceptCard) {
            console.error(`Invalid move data: ${JSON.stringify(moveData)}. Player ${moveData.playerId} must accept the first two cards drawn.`);
            return false;
        }

        if (player.playArea[moveData.cardIndex] !== null) {
            console.error(`Card index ${moveData.cardIndex} is already occupied for player ${moveData.playerId}.`);
            return false;
        }

        if (player.playArea.filter(card => card !== null).length >= 2) {
            console.error(`Player ${moveData.playerId} has already accepted two cards. Cannot accept more.`);
            return false;
        }
    }

    validatePlayerTurn(moveData) {
        if (this.golfGame.gameState === "Opening") return true;

        if (this.golfGame.currentPlayerId !== moveData.playerId) {
            console.error(`It's not player ${moveData.playerId}'s turn! Current player is ${this.golfGame.currentPlayerId}.`);
            return false;
        }
        return true;
    }

    validateMove(moveData) {
        let isValid = true;

        isValid &= this.validateOpeningStatePlayerMove(moveData);
        isValid &= this.validatePlayerTurn(moveData);

        return isValid;
    }
}