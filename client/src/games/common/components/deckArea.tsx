import React from "react";
import Card from "./card"
import { CardData } from "../types";

type DeckCardProps = {
    remainingCards: number;
    active: boolean;
    deckClick: () => void;
}

type DiscardPileProps = {
    discardPile: CardData[];
    discardClick: () => void;
}

type DeckAreaProps = DeckCardProps & DiscardPileProps;

function DeckCard({ remainingCards, active, deckClick } : DeckCardProps) {
    return <div>
            <Card id="deck-card" active={active} onClick={deckClick}/>
            <span>Remaining: {remainingCards}</span>
        </div>
}

function DiscardPile( { discardPile, discardClick } : DiscardPileProps) {
    const card = discardPile.slice(-1)[0]; 

    return <Card id="discard-pile" className="discard-pile" card={card} onClick={discardClick} renderBackForNull={false} />
}

export default function DeckArea({ remainingCards, discardPile, active, deckClick, discardClick } : DeckAreaProps) {
    return <div className="deck-area" style={{ opacity: active ? 1 : 0.5 }}>
        <DeckCard remainingCards={remainingCards} deckClick={deckClick} active={active} />
        <DiscardPile discardPile={discardPile} discardClick={discardClick} />
    </div>
    
}