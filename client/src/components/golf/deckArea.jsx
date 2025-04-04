import Card from "../card"

function DeckCard({ state, playerMove, playerId, animationRefs }) {
    const active = state.currentPlayerId === playerId;

    const cardClick = (e) => {
        if (!active) return;
        const bounds = e.target.getBoundingClientRect();

        if (state.gameState === "FirstCard") {
            animationRefs.toSelected({...animationRefs, from: bounds, onAnimationComplete: () => playerMove({ acceptCard: false })});
        } else {
            playerMove({ acceptCard: false }); 
        }
    };

    return <Card cardRef={animationRefs.deckRef} active={state.currentPlayerId === playerId} onClick={cardClick}/>
}

function DiscardPile( { state, playerMove, selectedCard, setSelectedCard, animationRefs } ) {

    let card = state.discardPile.slice(selectedCard ? -2 : -1)[0]; 

    const selectDiscard = (e) => {
        const bounds = e.target.getBoundingClientRect();
        
        if (state.gameState === "FirstCard") {
            if (selectedCard) {
                animationRefs.fromSelected({...animationRefs, to: bounds, selectedCard, onAnimationComplete: () => setSelectedCard(null)});
            } else {
                animationRefs.toSelected({...animationRefs, from: bounds, card, onAnimationComplete: () => setSelectedCard(card)});
            }
        } else {
            setSelectedCard(null);
            playerMove({ acceptCard: false });
        }
    };

    
    if (state.discardPile.length === 0 || state.discardPile.length === 1 && selectedCard) {
        card = null;
    }


    return <Card className="discard-pile" card={card} onClick={selectDiscard} cardRef={animationRefs.discardRef} renderBackForNull={false} />
}

export default function DeckArea({ state, playerMove, playerId, selectedCard, setSelectedCard, animationRefs }) {
    console.log("DeckArea");
    return <div className="deck-area" style={{ opacity: state.currentPlayerId === playerId ? 1 : 0.5 }}>
        <DeckCard state={state} playerMove={playerMove} playerId={playerId} animationRefs={animationRefs}/><DiscardPile animationRefs={animationRefs} state={state} playerMove={playerMove} selectedCard={selectedCard} setSelectedCard={setSelectedCard}/>
    </div>
    
}