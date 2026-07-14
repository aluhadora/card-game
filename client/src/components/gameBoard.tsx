import React from "react";
import { GameState, MoveData } from "../games/golf/types";
import GarbageGame from "../games/garbage/components/garbageGame";
import Golf from "../games/golf/components/golf";
import Sudoku from "../games/sudoku/components/sudoku";
import { GameTypes } from "../constants";

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

    if (state.gameType === GameTypes.Golf) {
        return <Golf gameState={state} playerMove={playerMove} playerId={playerId} />;
    } else if (state.gameType === GameTypes.Garbage) {
        return <GarbageGame gameState={state} playerMove={playerMove} playerId={playerId} />
    } else if (state.gameType === GameTypes.Sudoku) {
        return <Sudoku gameState={state} playerMove={playerMove} playerId={playerId} />;
    }

    return <div>Unknown game type: {state.gameType}</div>;
}
