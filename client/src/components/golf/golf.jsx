import { useEffect, useState } from "react";
import DeckArea from "./deckArea";
import PlayerArea from "./playerArea";
import AnimationHandler from "./animationHandler";

function players(gameState, playerId) {
    const players = Object.values(gameState.players);
    const index = gameState.players[playerId]?.index || 0;

    return [...players.slice(index), ...players.slice(0, index)];
}

export default function Golf({ gameState, playerMove, playerId }) {
    const [selectedCard, setSelectedCard] = useState(null);
    const [animateCard, setAnimateCard] = useState(null);
    const [animationRefs, setAnimationRefs] = useState({ deckRef: null, discardRef: null });
    
    useEffect(() => {
        if (gameState && gameState.gameState != "Opening" && gameState.gameState !== "FirstCard" && playerId === gameState.currentPlayerId) {
            setSelectedCard(gameState.discardPile.slice(-1)[0] || null);
        }
    }, [playerId, gameState]);
    
    if (!gameState) return null;

    const sortedPlayers = players(gameState, playerId);

    return (
        <div className="game-board">
            {/* <h3>State: {gameState.gameState}| Animated: {animateCard ? "Y" : "F"}</h3> */}
            <div>
                <DeckArea state={gameState} playerMove={playerMove} playerId={playerId} selectedCard={selectedCard} setSelectedCard={setSelectedCard} animateCard={setAnimateCard} animationRefs={animationRefs}/>
                <PlayerArea
                    player={sortedPlayers[0]}
                    gameState={gameState}
                    playerMove={playerMove}
                    isUs={true}
                    selectedCard={selectedCard}
                    setSelectedCard={setSelectedCard}
                    animationRefs={animationRefs}
                    active={gameState.currentPlayerId === playerId || gameState.gameState === "Opening"}
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
                        selectedCard={selectedCard}
                        setSelectedCard={setSelectedCard}
                        animationRefs={animationRefs}
                        active={gameState.currentPlayerId === player.id || gameState.gameState === "Opening"}
                    />
                ))}
            </div>
            {/* <div className='players-area'>
                {players(gameState, playerId).map((player, index) => (
                    <PlayerArea player={player} key={index} playerMove={playerMove} isUs={player.id === playerId} gameState={gameState} active={gameState.currentPlayerId === player.id || gameState.gameState === "Opening"} selectedCard={selectedCard} setSelectedCard={setSelectedCard} animationRefs={animationRefs}/>
                ))}
            </div> */}
            <AnimationHandler animateCard={animateCard} setAnimateCard={setAnimateCard} setAnimationRefs={setAnimationRefs} animationRefs={animationRefs} />
        </div>
    );
}