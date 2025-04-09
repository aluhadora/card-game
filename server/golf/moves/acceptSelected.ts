import MoveData from "../moveData";

export default function acceptSelected({cardIndex, player, discards, actions} : MoveData) {
    if (!player.selectedCard) {
        console.error("No selected card to accept!");
        return;
    }

    const currentCardInSlot = player.playArea[cardIndex];
    player.playArea[cardIndex] = player.selectedCard; // Place the accepted card in the player's play area

    discards.push(currentCardInSlot || actions.draw()); // Add the new card to the discard pile
    
    player.selectedCard = null; // Clear the selected card
    
    actions.recalculateScore();
    actions.advancePlayer();

    return { deltas: [{ 
        from: `p${player.id}-selected`, 
        to: `p${player.id}-${cardIndex}`, 
        card: player.playArea[cardIndex] 
    }, {
        from: `p${player.id}-${cardIndex}`, 
        to: `discard-pile`, 
        card: discards.slice(-1)[0] 
    }]};
}