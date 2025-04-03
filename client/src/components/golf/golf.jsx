import DeckArea from "./deckArea";
import PlayerArea from "./playerArea";

function players(gameState, playerId) {
    const players = Object.values(gameState.players);
    const index = gameState.players[playerId]?.index;

    console.log("players ordering", gameState, playerId, index);

    return [...players.slice(index), ...players.slice(0, index)];
}

export default function Golf({ gameState, playerMove, playerId }) {
    console.log("Golf", gameState, playerMove, playerId, players);
    return (
        <div className="game-board">
            <h3>Current Player: {gameState.players[gameState.currentPlayerId].nickname}</h3>
            <DeckArea state={gameState} playerMove={playerMove} playerId={playerId} />
            <div className='players-area'>
                {players(gameState, playerId).map((player, index) => (
                    <PlayerArea player={player} key={index} playerMove={playerMove} isUs={player.id === playerId} active={gameState.currentPlayerId === player.id} />
                ))}
            </div>
        </div>
    );
}