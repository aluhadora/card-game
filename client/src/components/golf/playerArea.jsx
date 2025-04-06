import Card from "../card";

function OtherPlayerInfo({ player, selectedCard=null }) {
    return (
        <div className="player-info">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h6>{player.nickname}:{player.score}</h6>
            <Card card={selectedCard} renderBackForNull={false} className="small" /> 
        </div>
    </div>
    );

}

function PlayerInfo({ player, isUs, active, selectedCard, animationRefs }) {
    if (!isUs) return OtherPlayerInfo({ player }); // For other players, just show their info without interaction   
    return (
        <div className="player-info">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "5em" }}>
            <p>Name: {player.nickname}</p>
            <p>Score: {player.score || 0}</p>
        </div>
        
        {isUs && active && <span><Card cardRef={animationRefs.selectedCardRef} card={selectedCard} renderBackForNull={false} className={!isUs ? "small" : ""}/>Selected</span>}
    </div>
    );
}

export default function PlayerArea({ player, gameState, playerMove, active, isUs, selectedCard, setSelectedCard, animationRefs }) {
    // 3 by 3 grid of cards

    const cardClick = (move, e) => {
        console.log("Card Clicked: ", move, gameState, gameState === "Opening", active, isUs, playerMove);
        if (gameState === "Opening" || gameState.gameState === "Opening") {
            playerMove(move); // Accepting the first two cards in opening state
            return;
        }

        const bounds = e.target.getBoundingClientRect();
        if (!active || !isUs || !selectedCard) return;

        const animationFromHandComplete = () => {
            playerMove(move);
            setSelectedCard(null);
        }

        const animationFromSelectedComplete = () => {
            animationRefs.toDiscard({...animationRefs, from: bounds, card: player.playArea[move.cardIndex], onAnimationComplete: animationFromHandComplete });
        }

        animationRefs.fromSelected({...animationRefs, card: selectedCard, to: bounds, onAnimationComplete: animationFromSelectedComplete});
    }

    return (
        <div className={"player-area " + (active ? " active" : "")} id={player.id} style={{ opacity: isUs ? 1 : 0.5 }}>
            <PlayerInfo player={player} isUs={isUs} active={active} selectedCard={selectedCard} animationRefs={animationRefs} />
            <div className="player-cards">
                <table>
                    <tbody>
                    {player.playArea.map((card, index) => {
                        if (index % 3 === 0) {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Card onClick={e => cardClick({acceptCard: true, cardIndex: index}, e)} card={card} active={active && isUs} className={!isUs ? "small" : ""} />
                                    </td>
                                    <td>
                                        <Card onClick={e => cardClick({acceptCard: true, cardIndex: index + 1}, e)} card={player.playArea[index + 1]} active={active && isUs} className={!isUs ? "small" : ""} />
                                    </td>
                                    <td>
                                        <Card onClick={e => cardClick({acceptCard: true, cardIndex: index + 2}, e)} card={player.playArea[index + 2]} active={active && isUs} className={!isUs ? "small" : ""} />
                                    </td>
                                </tr>
                            );
                        }})}
                    </tbody>
                </table>
            </div>
        </div>
    )
}