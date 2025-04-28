import DeckArea from "../../common/components/deckArea";
import PlayerArea from "./playerArea";
import { GameStates, MoveTypes } from "../constants";
import React from "react";
import { GameState, MoveData, Player } from "../types";
import { CardData } from "../../common/types";

function players(gameState : GameState, playerId : string) : Player[] {
    const players = Object.values(gameState.players);
    const index = gameState.players[playerId]?.index || 0;

    return [...players.slice(index), ...players.slice(0, index)];
}

type GarbageGameProps = {
    gameState: GameState | null;
    playerMove: (move: MoveData) => void;
    playerId: string;
}

function isActive(gameState : GameState, playerId : string) : boolean {
    if (gameState.gameState === GameStates.GameOver) return false;

    return gameState.currentPlayerId === playerId;
}

function GameOverHeader({gameState} : {gameState: GameState | null}) {
    if (gameState?.gameState !== GameStates.GameOver) return null;

    return <div>
        Game Over! Thanks for playing!
        <br />
        {Object.values(gameState.players).map(player => (
            <div key={player.id}>
                {player.nickname}: {player.score} points
            </div>
        ))}
    </div>;
}


function discardClick(playerMove: (move: MoveData) => void, selectedCard: CardData | null) {

    if (selectedCard) {
        playerMove({ moveType: MoveTypes.DeclineSelected }); 
        return;
    }

    playerMove({ moveType: MoveTypes.SelectFromDiscard });
}

function deckClick (gameState: GameState, playerMove: (move: MoveData) => void, playerId: string) {
    const active = gameState.currentPlayerId === playerId;

    if (!gameState || !active) return;

    playerMove({ moveType: MoveTypes.DrawFromDeck}); 
}

function GarbageDeckArea({ state, playerMove, playerId, selectedCard }) {
    if (!state) return null;

    return (
        <DeckArea
            discardClick={() => discardClick(playerMove, selectedCard)}
            deckClick={() => deckClick(state, playerMove, playerId)}
            remainingCards={state.remainingCards}
            discardPile={state.discardPile}
            active={isActive(state, playerId)}
        />
    );
}

export default function GarbageGame({ gameState, playerMove, playerId } : GarbageGameProps) {
    if (!gameState) return null;

    const sortedPlayers = players(gameState, playerId);

    return (
        <div>
            <GameOverHeader gameState={gameState} />
            <div className="game-board">
                <div>
                    <GarbageDeckArea state={gameState} playerMove={playerMove} playerId={playerId} selectedCard={sortedPlayers[0].selectedCard}/>
                    <PlayerArea
                        player={sortedPlayers[0]}
                        gameState={gameState}
                        playerMove={playerMove}
                        isUs={true}
                        selectedCard={sortedPlayers[0].selectedCard}
                        active={isActive(gameState, playerId)}
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
                            active={isActive(gameState, player.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}