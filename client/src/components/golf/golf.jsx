import { useEffect, useRef, useState } from "react";
import DeckArea from "./deckArea";
import PlayerArea from "./playerArea";
import AnimationCard from "./animationCard";

function players(gameState, playerId) {
    const players = Object.values(gameState.players);
    const index = gameState.players[playerId]?.index;

    return [...players.slice(index), ...players.slice(0, index)];
}

function AnimationHandler({ animateCard, setAnimateCard, setAnimationRefs }) {
    const deckRef = useRef();
    const discardRef = useRef();
    const selectedCardRef = useRef();


    useEffect(() => {

        const move = (from, to, refs) => {
            setAnimateCard({
                from: from,
                to: to,
                card: refs.card,
                onAnimationComplete: refs.onAnimationComplete
            });
        }

        const toDiscard = (refs)  => {
            console.log("toDiscard called", refs.discardRef.current?.getBoundingClientRect(), refs.from);
            move(refs.from, refs.discardRef.current?.getBoundingClientRect(), refs);
        };

        const toSelected = (refs) => {
            move(refs.from, refs.selectedCardRef.current?.getBoundingClientRect(), refs);
        };

        const fromSelected = (refs) => {
            console.log("fromSelected called", refs.selectedCardRef.current?.getBoundingClientRect(), refs.to);
            move(refs.selectedCardRef.current?.getBoundingClientRect(), refs.to, refs);
        }

        setAnimationRefs({ deckRef, discardRef, selectedCardRef, toDiscard, fromSelected, toSelected});
    }, [setAnimateCard, setAnimationRefs]);
    
    if (!animateCard) return null;

    const completeAnimation = (animation) => {
        setAnimateCard(null);

        if (animation.onAnimationComplete) {
            animation.onAnimationComplete();
        }
    }

    return <AnimationCard from={animateCard.from} to={animateCard.to} onComplete={() => completeAnimation(animateCard)} card={animateCard.card} />
}

export default function Golf({ gameState, playerMove, playerId }) {
    const [selectedCard, setSelectedCard] = useState(null);
    const [animateCard, setAnimateCard] = useState(null);
    const [animationRefs, setAnimationRefs] = useState({ deckRef: null, discardRef: null });
    
    useEffect(() => {
        if (gameState && gameState.gameState !== "FirstCard") {
            setSelectedCard(gameState.discardPile.slice(-1)[0] || null);
        }
    }, [gameState]);
    
    if (!gameState) return null;

    return (
        <div className="game-board">
            <h3 onClick={() => setAnimateCard(b => !b)}>Current Player: {gameState.players[gameState.currentPlayerId].nickname}</h3>
            <h3>State: {gameState.gameState}| Animated: {animateCard ? "Y" : "F"}</h3>
            <DeckArea state={gameState} playerMove={playerMove} playerId={playerId} selectedCard={selectedCard} setSelectedCard={setSelectedCard} animateCard={setAnimateCard} animationRefs={animationRefs}/>
            <div className='players-area'>
                {players(gameState, playerId).map((player, index) => (
                    <PlayerArea player={player} key={index} playerMove={playerMove} isUs={player.id === playerId} active={gameState.currentPlayerId === player.id} selectedCard={selectedCard} setSelectedCard={setSelectedCard} gameState={gameState.gameState} animationRefs={animationRefs}/>
                ))}
            </div>
            {/* {animateCard && <AnimationCard animateCard={animateCard} completeAnimation={() => setAnimateCard(null)} />} */}
            <AnimationHandler animateCard={animateCard} setAnimateCard={setAnimateCard} setAnimationRefs={setAnimationRefs} animationRefs={animationRefs} />
        </div>
    );
}