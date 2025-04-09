import Card from "../card";

function OtherPlayerInfo({ player, selectedCard=null }) {
    return (
        <div className="player-info">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h6>{player.nickname}:{player.score}</h6>
            <Card id={`p${player.id}-selected`} card={selectedCard} renderBackForNull={false} className="small" /> 
        </div>
    </div>
    );

}

function PlayerInfo({ player, isUs, active, selectedCard }) {
    if (!isUs) return OtherPlayerInfo({ player, selectedCard}); // For other players, just show their info without interaction   
    return (
        <div className="player-info">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "5em" }}>
            <p>Name: {player.nickname}</p>
            <p>Score: {player.score || 0}</p>
        </div>
        
        {isUs && active && <span><Card id={`p${player.id}-selected`} card={selectedCard} renderBackForNull={false} className={!isUs ? "small" : ""}/>Selected</span>}
    </div>
    );
}

export default function PlayerArea({ player, gameState, playerMove, active, isUs, selectedCard }) {
    // 3 by 3 grid of cards

    const cardClick = (move) => {
        if (gameState === "Opening" || gameState.gameState === "Opening") {
            playerMove(move); // Accepting the first two cards in opening state
            return;
        }

        if (!active || !isUs) return;

        playerMove({ moveType: "acceptSelected", cardIndex: move.cardIndex });
    }

    return (
        <div className={"player-area " + (active ? " active" : "")} id={player.id} style={{ opacity: (isUs && gameState.gameState !== "GameOver") ? 1 : 0.5 }}>
            <PlayerInfo player={player} isUs={isUs} active={active} selectedCard={selectedCard} />
            <div className="player-cards">
                <table>
                    <tbody>
                    {player.playArea.map((card, index) => {
                        if (index % 3 === 0) {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Card id={`p${player.id}-${index}`} onClick={e => cardClick({acceptCard: true, cardIndex: index}, e)} card={card} active={active && isUs} className={!isUs ? "small" : ""} />
                                    </td>
                                    <td>
                                        <Card id={`p${player.id}-${index+1}`} onClick={e => cardClick({acceptCard: true, cardIndex: index + 1}, e)} card={player.playArea[index + 1]} active={active && isUs} className={!isUs ? "small" : ""} />
                                    </td>
                                    <td>
                                        <Card id={`p${player.id}-${index+2}`} onClick={e => cardClick({acceptCard: true, cardIndex: index + 2}, e)} card={player.playArea[index + 2]} active={active && isUs} className={!isUs ? "small" : ""} />
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