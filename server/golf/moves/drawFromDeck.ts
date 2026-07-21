import { GameStates } from "../constants";
import { MoveContext, MoveData } from "../types";

export default function drawFromDeck({ player }: MoveData, { actions }: MoveContext) {
    if (player.selectedCard) {
        console.warn("Player already has a selected card. Cannot draw another one.");
        return;
    }

    const drawnCard = actions.draw();
    if (!drawnCard) {
        console.error("No card to draw from deck!");
        return;
    }

    player.selectedCard = drawnCard;
    actions.gameState(GameStates.SecondCard);

    // Card starts face-down on top of the deck, flips as it travels, and
    // lands face-up in the player's selected slot.
    return {
        delta: {
            from: "deck-card",
            to: `p${player.id}-selected`,
            card: drawnCard,
            type: "revealTranslate",
            duration: 800
        }
    };
}
