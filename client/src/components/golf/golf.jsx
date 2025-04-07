import DeckArea from "./deckArea";
import PlayerArea from "./playerArea";
import AnimationHandler from "./animationHandler";

function players(gameState, playerId) {
    const players = Object.values(gameState.players);
    const index = gameState.players[playerId]?.index || 0;

    return [...players.slice(index), ...players.slice(0, index)];
}

export default function Golf({ gameState, playerMove, playerId }) {

    if (!gameState) return null;

    const sortedPlayers = players(gameState, playerId);
    const active = playerId => (gameState.gameState != "GameOver" && gameState.currentPlayerId === playerId) || (gameState.gameState === "Opening" && gameState.players[playerId].playArea.filter(card => card !== null).length < 2);

    return (
        <div className="game-board">
            {/* <h3>State: {gameState.gameState}| Animated: {animateCard ? "Y" : "F"}</h3> */}
            <div>
                <DeckArea state={gameState} playerMove={playerMove} playerId={playerId} selectedCard={sortedPlayers[0].selectedCard}/>
                <PlayerArea
                    player={sortedPlayers[0]}
                    gameState={gameState}
                    playerMove={playerMove}
                    isUs={true}
                    selectedCard={sortedPlayers[0].selectedCard}
                    active={active(playerId)}
                />
            </div>
            <div className="other-players-area">
                {sortedPlayers.filter(player => player.id !== playerId).map((player, index) => (
                    <PlayerArea
                        player={player}
                        key={index}
                        playerMove={playerMove}
                        isUs={false}
                        gameState={gameState}
                        selectedCard={player.selectedCard}
                        active={active(player.id)}
                    />
                ))}
            </div>
        </div>
    );
}