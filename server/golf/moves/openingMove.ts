import { GameStates } from "../constants";
import MoveData from "../moveData";

export default function openingMove({ actions, cardIndex, player } : MoveData) {
    player.playArea[cardIndex] = actions.draw(); // Place the accepted card in the player's play area

    actions.gameState(GameStates.FirstCard);

    actions.recalculateScore(player); // Recalculate score after the move

    return { 
        delta: { 
            from: `p${player.id}-${cardIndex}`, 
            to: `p${player.id}-${cardIndex}`, 
            card: player.playArea[cardIndex] } };
}