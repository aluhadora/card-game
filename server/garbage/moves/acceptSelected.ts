import { MoveContext, MoveData } from "../types";

export default function acceptSelected({cardIndex, player} : MoveData, { discards, actions } : MoveContext) {
    if (!player.selectedCard) {
        console.error("No selected card to accept!");
        return;
    }

    if (player.selectedCard.score < 0) {
        console.error("Cannot accept a card with negative score!");
        return;
    }

    const currentCardInSlot = player.playArea[cardIndex];

    player.playArea[cardIndex] = player.selectedCard; // Place the accepted card in the player's play area

    player.selectedCard = currentCardInSlot || actions.draw(); // Select the current card
    
    for (let i = 0; i < player.playArea.length; i++) {
        if (player.playArea[i] === null || player.playArea[i]?.score === 0) continue;

        if (player.playArea[i]?.score != i + 1) {
            player.roundOver = true;
            actions.advancePlayer();
        }
    }

    return { deltas: [{ 
        from: `p${player.id}-selected`, 
        to: `p${player.id}-${cardIndex}`, 
        card: player.playArea[cardIndex] 
    }, {
        from: `p${player.id}-${cardIndex}`, 
        to: `p${player.id}-selected`, 
        card: player.selectedCard 
    }]};
}