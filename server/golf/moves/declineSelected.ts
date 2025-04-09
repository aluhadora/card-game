import { GameStates } from "../constants";
import MoveData from "../moveData";

export default function declineSelected({player, actions, gameState, discards} : MoveData) {
    if (!player.selectedCard) {
        console.error("No selected card to decline!");
        return;
    }

    discards.push(player.selectedCard);
    player.selectedCard = null;

    if (gameState !== GameStates.FirstCard) {
        actions.recalculateScore();
        actions.advancePlayer();
    }

    return { delta: { from: `p${player.id}-selected`, to: `discard-pile`, card: player.selectedCard }};
}