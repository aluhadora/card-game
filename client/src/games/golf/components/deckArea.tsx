import React from "react";
import { GameStates, MoveTypes } from "../../../constants";
import { CardData, MoveData } from "../types";
import Card from "../../../components/card"

type DeckCardProps = {
    state: any;
    playerMove: (move: MoveData) => void;
    playerId: string;
}

type DiscardPileProps = {
    selectedCard: CardData | null;
    state: any;
    playerMove: (move: MoveData) => void;
}

type DeckAreaProps = DeckCardProps & DiscardPileProps;

function DeckCard({ state, playerMove, playerId }) {
    const active = state.currentPlayerId === playerId;

    const cardClick = () => {
        if (!active) return;

        playerMove({ moveType: state.gameState === GameStates.FirstCard 
            ? MoveTypes.DrawFromDeck 
            : MoveTypes.DeclineSelected }); 
    };

    return <div>
            <Card id="deck-card" active={state.currentPlayerId === playerId} onClick={cardClick}/>
            <span>Remaining: {state.remainingCards}</span>
        </div>
}

function DiscardPile( { state, playerMove, selectedCard } : DiscardPileProps) {
    const card = state.discardPile.slice(-1)[0]; 

    const selectDiscard = () => {
        if (!state || state.gameState === GameStates.Opening) return; 

        if (selectedCard) {
            playerMove({ moveType: MoveTypes.DeclineSelected }); 
            return;
        }

        if (state.gameState === GameStates.SecondCard) return;

        playerMove({ moveType: MoveTypes.SelectFromDiscard }); 
    };

    return <Card id="discard-pile" className="discard-pile" card={card} onClick={selectDiscard} renderBackForNull={false} />
}

export default function DeckArea({ state, playerMove, playerId, selectedCard } : DeckAreaProps) {
    if (state.gameState === GameStates.GameOver) return null;

    return <div className="deck-area" style={{ opacity: state.currentPlayerId === playerId ? 1 : 0.5 }}>
        <DeckCard state={state} playerMove={playerMove} playerId={playerId} />
        <DiscardPile state={state} playerMove={playerMove} selectedCard={selectedCard}/>
    </div>
    
}