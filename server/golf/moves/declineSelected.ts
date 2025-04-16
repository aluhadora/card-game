import { GameStates } from "../constants";
import { MoveContext, MoveData } from "../types";

export default function declineSelected({ player } : MoveData, { actions, gameState, discards } : MoveContext) {
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

    return { 
        delta: { 
            from: `p${player.id}-selected`, 
            to: `discard-pile`, 
            card: discards.slice(-1)[0] }};
}