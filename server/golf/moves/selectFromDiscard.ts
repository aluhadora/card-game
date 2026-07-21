import { MoveContext, MoveData } from "../types";

export default function selectFromDiscard({ player }: MoveData, { discards }: MoveContext) {
    const selectedCard = discards.pop();
    if (!selectedCard) {
        console.error("No card to draw from discard pile!");
        return;
    }

    player.selectedCard = selectedCard;

    // The discard's top card is already face-up; just glide it over.
    return {
        delta: {
            from: "discard-pile",
            to: `p${player.id}-selected`,
            card: selectedCard,
            type: "translate",
            duration: 700
        }
    };
}
