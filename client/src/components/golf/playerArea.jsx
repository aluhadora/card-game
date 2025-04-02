import Card from "../card";

export default function PlayerArea({ player, playerMove, active, isUs }) {
    // 3 by 3 grid of cards

    return (
        <div className={"player-area " + (active ? " active" : "")} id={player.id} style={{ opacity: isUs ? 1 : 0.5 }}>
            <div className="player-info">
                <h2>{player.nickname}</h2>
                <p>{player.score || 0}</p>
            </div>
            <div className="player-cards">
                <table>
                    <tbody>
                    {player.playArea.map((card, index) => {
                        if (index % 3 === 0) {
                            return (
                                <tr key={index}>
                                    <td>
                                        <Card onClick={() => playerMove({acceptCard: true, cardIndex: index})} card={card} active={active && isUs} />
                                    </td>
                                    <td>
                                        <Card onClick={() => playerMove({acceptCard: true, cardIndex: index + 1})} card={player.playArea[index + 1]} active={active && isUs} />
                                    </td>
                                    <td>
                                        <Card onClick={() => playerMove({acceptCard: true, cardIndex: index + 2})} card={player.playArea[index + 2]} active={active && isUs} />
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