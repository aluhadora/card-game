import Card from "../card";

export default function PlayerArea({ player, gameState, playerMove, active, isUs, selectedCard, setSelectedCard, animationRefs }) {
    // 3 by 3 grid of cards

    const cardClick = (move, e) => {
        console.log("Card Clicked: ", move, gameState, active, isUs);
        if (gameState === "Opening") {
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
            <div className="player-info">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "5em" }}>
                    <h2>Name: {player.nickname}</h2>
                    <p>Score: {player.score || 0}</p>
                </div>
                
                {isUs && active && <span><Card cardRef={animationRefs.selectedCardRef} card={selectedCard} renderBackForNull={false} />Selected Card</span>}
            </div>
            <div className="player-cards">
                <table>
                    <tbody>
                    {player.playArea.map((card, index) => {
                        if (index % 3 === 0) {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Card onClick={e => cardClick({acceptCard: true, cardIndex: index}, e)} card={card} active={active && isUs} />
                                    </td>
                                    <td>
                                        <Card onClick={e => cardClick({acceptCard: true, cardIndex: index + 1}, e)} card={player.playArea[index + 1]} active={active && isUs} />
                                    </td>
                                    <td>
                                        <Card onClick={e => cardClick({acceptCard: true, cardIndex: index + 2}, e)} card={player.playArea[index + 2]} active={active && isUs} />
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