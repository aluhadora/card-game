import { GameStates } from "../constants";
import MoveData from "../moveData";

export default function drawFromDeck({player, actions} : MoveData) {
    const drawnCard = actions.draw();
    if (!drawnCard) {
        console.error("No card to draw from deck!");
        return;
    }

    if (player.selectedCard) {
        console.warn("Player already has a selected card. Cannot draw another one.");
        return;
    }

    player.selectedCard = drawnCard;
    actions.gameState(GameStates.SecondCard);

    return { 
        delta: { 
            from: "deck-card", 
            to: `p${player.id}-selected`, 
            card: drawnCard 
        }};
}