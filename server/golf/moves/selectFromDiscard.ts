import MoveData from "../moveData";

export default function selectFromDiscard({ discards, player } : MoveData) {
    const selectedCard = discards.pop(); // Draw the top card from the discard pile
    if (!selectedCard) {
        console.error("No card to draw from discard pile!");
        return;
    }

    player.selectedCard = selectedCard;
    
    return { 
        delta: { 
            from: "discard-pile", 
            to: `p${player.id}-selected`, 
            card: selectedCard 
        }};
}