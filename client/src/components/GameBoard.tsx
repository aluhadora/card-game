import React from "react";
import { GameState, MoveData } from "../games/golf/types";
import Golf from "../games/golf/components/golf";

type GameBoardProps = {
    state: GameState | null;
    playerId: string;
    playerMove: (move: MoveData) => void;
}

export default function GameBoard({state, playerId, playerMove} : GameBoardProps) {
    if (!state) {
        return <div>Loading game state...</div>;
    }

    return <Golf gameState={state} playerMove={playerMove} playerId={playerId} />   
}