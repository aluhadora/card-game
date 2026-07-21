import React from "react";
import { GameState, MoveData } from "../games/golf/types";
import GarbageGame from "../games/garbage/components/garbageGame";
import GolfGame from "../games/golf/components/golfGame";
import Sudoku from "../games/sudoku/components/sudoku";
import { GameTypes } from "../constants";
import { AnimationDelta } from "../games/common/types";

type GameBoardProps = {
    state: GameState | null;
    playerId: string;
    playerMove: (move: MoveData) => void;
    started: boolean;
    animationDeltas?: Array<AnimationDelta> | null;
    setAnimationDeltas?: (deltas: Array<AnimationDelta>) => void;
};

export default function GameBoard({
    playerMove,
    state,
    playerId,
    started,
    animationDeltas,
    setAnimationDeltas,
}: GameBoardProps) {
    if (!started) return null;

    if (!state) {
        return <div>Loading game state...</div>;
    }

    if (state.gameType === GameTypes.Golf) {
        return (
            <GolfGame
                gameState={state}
                playerMove={playerMove}
                playerId={playerId}
                animationDeltas={animationDeltas}
                setAnimationDeltas={setAnimationDeltas}
            />
        );
    } else if (state.gameType === GameTypes.Garbage) {
        return (
            <GarbageGame
                gameState={state}
                playerMove={playerMove}
                playerId={playerId}
            />
        );
    } else if (state.gameType === GameTypes.Sudoku) {
        return (
            <Sudoku
                gameState={state}
                playerMove={playerMove}
                playerId={playerId}
            />
        );
    }

    return <div>Unknown game type: {state.gameType}</div>;
}
