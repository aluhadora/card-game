import React from "react";
import Card from "../../common/components/card";
import { GameState, MoveData, Player } from "../types";
import { GameStates, MoveTypes } from "../constants";
import { CardData } from "../../common/types";


type PlayerInfoProps = {
    player: Player;
    isUs?: boolean;
    active?: boolean;
    selectedCard: CardData | null;
}


type CardRowProps = {
    player: Player;
    cardClick: (index: number) => void;
    active: boolean;
    isUs: boolean;
}

type CardProps = CardRowProps & {
    index: number;
}


type PlayerAreaProps = PlayerInfoProps & {
    gameState: GameState;
    playerMove: (move: MoveData) => void;
}


function OtherPlayerInfo({ player, selectedCard } : PlayerInfoProps) {
    return (
        <div className="player-info">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h6>{player.nickname}:{player.score}</h6>
            <Card id={`p${player.id}-selected`} card={selectedCard} renderBackForNull={false} className="small" /> 
        </div>
    </div>
    );

}

function PlayerInfo({ player, isUs, active, selectedCard } : PlayerInfoProps) {
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

function PlayerAreaCard({ player, index, cardClick, active, isUs } : CardProps) {
    return (
        <td>
            <Card id={`p${player.id}-${index}`} 
                onClick={() => cardClick(index)} 
                card={player.playArea[index] || null} 
                active={active && isUs} 
                className={!isUs ? "small" : ""} 
            />
        </td>
    );
}

function PlayerAreaRows({ player, cardClick, active, isUs } : CardRowProps) {
    return player.playArea.map((_, index) => {
        if (index % 5 !== 0) return null;

        return (
            <tr key={index}>
                <PlayerAreaCard player={player} index={index} cardClick={cardClick} active={active} isUs={isUs} />
                <PlayerAreaCard player={player} index={index+1} cardClick={cardClick} active={active} isUs={isUs} />
                <PlayerAreaCard player={player} index={index+2} cardClick={cardClick} active={active} isUs={isUs} />
                <PlayerAreaCard player={player} index={index+3} cardClick={cardClick} active={active} isUs={isUs} />
                <PlayerAreaCard player={player} index={index+4} cardClick={cardClick} active={active} isUs={isUs} />
            </tr>
        );
    });
}

export default function PlayerArea({ player, gameState, playerMove, active, isUs, selectedCard } : PlayerAreaProps) {

    const cardClick = (index : number) => {
        if (!active || !isUs || !selectedCard) return;

        playerMove({ moveType: MoveTypes.AcceptSelected, cardIndex: index });
    }

    return (
        <div className={"player-area " + (active ? " active" : "")} id={player.id} style={{ opacity: (isUs && gameState.gameState !== GameStates.GameOver) ? 1 : 0.5 }}>
            <PlayerInfo player={player} isUs={isUs} active={active} selectedCard={selectedCard} />
            <div className="player-cards">
                <table>
                    <tbody>
                        <PlayerAreaRows player={player} cardClick={cardClick} active={active || false} isUs={isUs || false} />
                    </tbody>
                </table>
            </div>
        </div>
    )
}