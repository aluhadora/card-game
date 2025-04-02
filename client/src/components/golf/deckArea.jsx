import Card from "../card"

export default function DeckArea({ state, playerMove, playerId }) {
    return <div className="deck-area" style={{ opacity: state.currentPlayerId === playerId ? 1 : 0.5 }}>
        <Card active={state.currentPlayerId === playerId} onClick={() => playerMove({acceptCard: false})}/><Card card={state.discardPile.slice(-1)[0].name  }/>
    </div>
    
}