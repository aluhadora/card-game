import React from "react";
import { GameState, MoveData } from "../games/golf/types";
import GarbageGame from "../games/garbage/components/garbageGame";
import Golf from "../games/golf/components/golf";

type GameBoardProps = {
    state: GameState | null;
    playerId: string;
    playerMove: (move: MoveData) => void;
    started: boolean;
}

export default function GameBoard({playerMove, state, playerId, started} : GameBoardProps) {
    if (!started) return null;

    if (!state) {
        return <div>Loading game state...</div>;
    }

    if (state.gameType === "golf") {
        return <Golf gameState={state} playerMove={playerMove} playerId={playerId} />;
    }

    return <GarbageGame gameState={state} playerMove={playerMove} playerId={playerId} />
}