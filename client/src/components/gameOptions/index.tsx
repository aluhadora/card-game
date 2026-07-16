import { GameType, GameTypes } from "../../constants";
import type { GameSettings, PlayersMap } from "../types";
import GolfOptions from "./golfOptions";
import SudokuOptions from "./sudokuOptions";

export default function GameOptions({
    gameType,
    gameSettings,
    setGameSettings,
    players,
}: {
    gameType: GameType;
    gameSettings: GameSettings;
    setGameSettings: (settings: GameSettings) => void;
    players: PlayersMap;
}) {
    switch (gameType) {
        case GameTypes.Golf:
            return (
                <GolfOptions
                    gameSettings={gameSettings}
                    setGameSettings={setGameSettings}
                    players={players}
                />
            );
        case GameTypes.Sudoku:
            return (
                <SudokuOptions
                    gameSettings={gameSettings}
                    setGameSettings={setGameSettings}
                />
            );
        default:
            return null;
    }
}
