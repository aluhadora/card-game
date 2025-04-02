import DeckArea from "./deckArea";
import PlayerArea from "./playerArea";

export default function Golf({ gameState, playerMove, playerId }) {
    return (
        <div className="game-board">
            <h3>Current Player: {gameState.players[gameState.currentPlayerId].nickname}</h3>
            <DeckArea state={gameState} playerMove={playerMove} playerId={playerId} />
            <div className='players-area'>
                {Object.values(gameState.players).map((player, index) => (
                    <PlayerArea player={player} key={index} playerMove={playerMove} isUs={player.id === playerId} active={gameState.currentPlayerId === player.id} />
                ))}
            </div>
        </div>
    );
}