import { MoveContext, MoveData } from "../types";

/**
 * Timing budget for the compound "accept selected" choreography.
 *
 * The user-facing sequence is:
 *   1. Selected card slides to a staging spot next to the target slot.
 *   2. (If the target slot was unrevealed) the slot's card flips face-up.
 *   3. Selected card slides into the slot while the displaced card is
 *      pushed out along the way to the discard pile — both simultaneously.
 *
 * Each of these phases is a discrete animation delta with an explicit
 * `delay` so the client animation handler can play them as one continuous
 * routine without the server having to control the client's clock.
 */
const APPROACH_MS = 500;
const REVEAL_MS = 400;
const PUSH_MS = 500;

export default function acceptSelected({ cardIndex, player }: MoveData, { discards, actions }: MoveContext) {
    if (!player.selectedCard) {
        console.error("No selected card to accept!");
        return;
    }

    const currentCardInSlot = player.playArea[cardIndex];
    const acceptedCard = player.selectedCard;
    const wasRevealed = currentCardInSlot !== null;
    // For unrevealed slots the rules discard a freshly-drawn card in the
    // slot's place; treat that as "what was hiding there" for the reveal.
    const displacedCard = currentCardInSlot || actions.draw();

    player.playArea[cardIndex] = acceptedCard;
    discards.push(displacedCard);
    player.selectedCard = null;

    actions.recalculateScore(null);
    actions.advancePlayer();

    const selectedAnchor = `p${player.id}-selected`;
    const slotAnchor = `p${player.id}-${cardIndex}`;
    const neighborAnchor = `${slotAnchor}-neighbor`;
    const discardAnchor = "discard-pile";

    const deltas: any[] = [
        // Phase 1: selected card slides in to the staging spot.
        {
            from: selectedAnchor,
            to: neighborAnchor,
            card: acceptedCard,
            type: "translate",
            delay: 0,
            duration: APPROACH_MS
        }
    ];

    let pushStart = APPROACH_MS;

    if (!wasRevealed) {
        // Phase 2: the "hidden" card at the slot flips to reveal itself.
        deltas.push({
            from: slotAnchor,
            to: slotAnchor,
            card: displacedCard,
            type: "flip",
            delay: APPROACH_MS,
            duration: REVEAL_MS
        });
        pushStart += REVEAL_MS;
    }

    // Phase 3 (parallel): selected slots in, displaced card is pushed to
    // the discard pile.
    deltas.push({
        from: neighborAnchor,
        to: slotAnchor,
        card: acceptedCard,
        type: "translate",
        delay: pushStart,
        duration: PUSH_MS
    });
    deltas.push({
        from: slotAnchor,
        to: discardAnchor,
        card: displacedCard,
        type: "translate",
        delay: pushStart,
        duration: PUSH_MS
    });

    return { deltas };
}
