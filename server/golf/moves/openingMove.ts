import { GameStates } from "../constants";
import { MoveContext, MoveData } from "../types";

export default function openingMove({ cardIndex, player }: MoveData, { actions }: MoveContext) {
    player.playArea[cardIndex] = actions.draw();

    actions.gameState(GameStates.FirstCard);

    actions.recalculateScore(player);

    // Reveal the newly-drawn card in place: no translation, just a flip
    // from face-down to face-up at the slot the player tapped.
    return {
        delta: {
            from: `p${player.id}-${cardIndex}`,
            to: `p${player.id}-${cardIndex}`,
            card: player.playArea[cardIndex],
            type: "flip",
            duration: 700
        }
    };
}
