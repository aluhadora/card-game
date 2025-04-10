import { GameStates, MoveTypes } from "../../constants";
import Card from "../card"

function DeckCard({ state, playerMove, playerId }) {
    const active = state.currentPlayerId === playerId;

    const cardClick = () => {
        if (!active) return;

        if (state.gameState === GameStates.FirstCard) {
            playerMove({ moveType: MoveTypes.DrawFromDeck}); 
        } else {
            playerMove({ moveType: "declineSelected" }); 
        }
    };

    return <div>
            <Card id="deck-card" active={state.currentPlayerId === playerId} onClick={cardClick}/>
            <span>Remaining: {state.remainingCards}</span>
        </div>
}

function DiscardPile( { state, playerMove, selectedCard } ) {

    let card = state.discardPile.slice(-1)[0]; 

    const selectDiscard = () => {
        if (!state || state.gameState === "Opening") return; 

        if (selectedCard) {
            playerMove({ moveType: "declineSelected" }); 
            return;
        }

        if (state.gameState === "SecondCard") return;

        playerMove({ moveType: "selectFromDiscard" }); 
        return;
    };

    return <Card id="discard-pile" className="discard-pile" card={card} onClick={selectDiscard} renderBackForNull={false} />
}

export default function DeckArea({ state, playerMove, playerId, selectedCard }) {

    if (state.gameState === "GameOver") return null;

    return <div className="deck-area" style={{ opacity: state.currentPlayerId === playerId ? 1 : 0.5 }}>
        <DeckCard state={state} playerMove={playerMove} playerId={playerId} />
        <DiscardPile state={state} playerMove={playerMove} selectedCard={selectedCard}/>
    </div>
    
}