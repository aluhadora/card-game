import { useEffect, useState } from "react";
import styles from "./sudoku.module.css";
import { InputMode, GameState, GameStates, MoveTypes } from "../constants";

import { Cell, MoveData, Player } from "../types";
import {
    InputModeStrategyHandler,
    InputHandlerProps,
} from "../inputModes/inputHandler";
import { CellGroup } from "./cellsComponents";
import OptionsDrawer, { MenuButton } from "./optionsDrawer";
import { InputModeSelector, NumberRow } from "./inputControls";

export type SudokuGameState = {
    board: Cell[][];
    players: Record<string, Player>;
    gameState: GameState;
};

export type SudokuProps = {
    gameState: SudokuGameState;
    playerId: string;
    playerMove: (move: MoveData) => void;
};

function SudokuBoard({
    inputProps,
    gameState,
    playerId,
    playerMove,
}: SudokuProps & { inputProps: InputHandlerProps }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                userSelect: "none",
                touchAction: "none",
            }}
            onMouseLeave={() =>
                inputProps.inputHandler.handleExitBoard(inputProps)
            }
        >
            {[0, 1, 2].map((groupRow) => (
                <div key={groupRow} style={{ display: "flex" }}>
                    {[0, 1, 2].map((groupCol) => {
                        const groupIndex = groupRow * 3 + groupCol;
                        return (
                            <CellGroup
                                key={groupIndex}
                                inputProps={inputProps}
                                gameState={gameState}
                                groupIndex={groupIndex}
                                playerId={playerId}
                                playerMove={playerMove}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function GameCompleteRow({
    gameState,
    playerMove,
    playerId,
}: {
    gameState: SudokuGameState;
    playerMove: (move: MoveData) => void;
    playerId: string;
}) {
    if (gameState.gameState !== GameStates.Completed) return null;

    return (
        <div className={styles.gameCompleteRow}>
            <button
                onClick={() =>
                    playerMove({
                        moveType: MoveTypes.NewBoard,
                        playerId,
                        cellAddress: [0, 0],
                        value: null,
                    })
                }
            >
                New Board
            </button>
            <button
                onClick={() =>
                    playerMove({
                        moveType: MoveTypes.CloseGame,
                        playerId,
                        cellAddress: [0, 0],
                        value: null,
                    })
                }
            >
                Close Game
            </button>
        </div>
    );
}

function numberIsComplete(board: Cell[][], number: number): boolean {
    return board.flat().filter((cell) => cell.value === number).length === 9;
}

function FinaleFanfare({ gameState }: { gameState: SudokuGameState }) {
    if (gameState.gameState !== GameStates.Completed) return null;

    return (
        <>
            <div className={styles.firework}></div>
            <div className={styles.block}></div>
        </>
    );
}

function getSettingFromLocalStorage<T>(key: string, defaultValue: T): T {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
        return defaultValue;
    }
    try {
        return JSON.parse(storedValue) as T;
    }
    catch {
        return defaultValue;
    }
}

function setAndPersistSettingInLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

export default function Sudoku({
    gameState,
    playerId,
    playerMove,
}: SudokuProps) {
    // How the input modes work:
    // Standard: Player selects a cell, then either types a number, or clicks it in the number row
    // Lightning: Player selects a number, then clicks a cell to fill it in
    // Standard Hint: Player selects a cell, then either types a number, or clicks it in the number row to add a hint
    // Lightning Hint: Player selects a number, then clicks a cell to add a hint
    const [inputMode, setInputMode] = useState<InputMode>(
        getSettingFromLocalStorage("sudoku_inputMode", InputMode.Standard)
    );

    const setAndPersistInputMode = (mode: InputMode) => {
        setAndPersistSettingInLocalStorage("sudoku_inputMode", mode);
        setInputMode(mode);
    };

    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
        null,
    );
    const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(
        null,
    );
    const [dragging, setDragging] = useState<boolean>(false);
    const [dragClearing, setDragClearing] = useState<boolean>(false);
    const [lastMove, setLastMove] = useState<MoveData | null>(null);
    const [showRemainingNumbers, setShowRemainingNumbers] = useState<boolean>(
        getSettingFromLocalStorage("sudoku_showRemainingNumbers", true)
    );

    const setAndPersistShowRemainingNumbers = (show: boolean) => {
        setAndPersistSettingInLocalStorage("sudoku_showRemainingNumbers", show);
        setShowRemainingNumbers(show);
    }

    const handlePlayerMove = (move: MoveData) => {
        setLastMove(move);
        playerMove(move);
    };

    const [drawerOpen, setDrawerOpen] = useState(false);

    const inputHandler = new InputModeStrategyHandler(inputMode);

    const inputProps: InputHandlerProps = {
        inputMode,
        setInputMode: setAndPersistInputMode,
        selectedNumber,
        setSelectedNumber,
        selectedCell,
        setSelectedCell,
        hoveredCell,
        setHoveredCell,
        dragging,
        setDragging,
        dragClearing,
        setDragClearing,
        showRemainingNumbers,
        setShowRemainingNumbers: setAndPersistShowRemainingNumbers,
        inputHandler: inputHandler,
    };

    useEffect(() => {
        inputHandler.inputMode = inputMode;
    }, [inputMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                inputHandler.handleNumberClick(
                    inputProps,
                    num,
                    handlePlayerMove,
                    playerId,
                );
            } else if (
                e.key === "Backspace" ||
                e.key === "Delete" ||
                e.key === " "
            ) {
                inputHandler.handleClearButtonPress(
                    inputProps,
                    selectedCell,
                    handlePlayerMove,
                    playerId,
                );
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputMode, selectedCell, selectedNumber]); // include any state the handler reads

    useEffect(() => {
        if (
            !lastMove ||
            lastMove.moveType !== MoveTypes.SetCellValue ||
            !selectedNumber
        ) {
            return;
        }

        const value = lastMove.value;

        if (numberIsComplete(gameState.board, value || 0)) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const orderedNumbers = [
                ...numbers.slice(value!),
                ...numbers.slice(0, value!),
            ];
            const nextNonCompleteNumber = orderedNumbers.find(
                (num) => !numberIsComplete(gameState.board, num),
            );
            setSelectedNumber(nextNonCompleteNumber || null);
        }
    }, [lastMove, gameState.board]);

    if (gameState.gameState === GameStates.GameOver) {
        return <div>Game Over! Thanks for playing!</div>;
    }

    return (
        <>
            <MenuButton onClick={() => setDrawerOpen(true)} />
            <OptionsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                inputProps={inputProps}
                playerMove={handlePlayerMove}
                playerId={playerId}
            />
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    overscrollBehavior:
                        "none" /* Prevents pull-to-refresh & bounce */,
                    touchAction:
                        "none" /* Prevents pinch-zoom and double-tap zoom */,
                    userSelect: "none",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ position: "relative", width: "fit-content" }}>
                        <FinaleFanfare gameState={gameState} />
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <h1>Sudoku</h1>
                            <SudokuBoard
                                inputProps={inputProps}
                                gameState={gameState}
                                playerId={playerId}
                                playerMove={handlePlayerMove}
                            />
                            <InputModeSelector
                                gameState={gameState}
                                inputProps={inputProps}
                            />
                            <NumberRow
                                inputProps={inputProps}
                                gameState={gameState}
                                playerMove={handlePlayerMove}
                                playerId={playerId}
                                showRemainingNumbers={showRemainingNumbers}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.gameCompleteOverlay}>
                    <GameCompleteRow
                        gameState={gameState}
                        playerMove={handlePlayerMove}
                        playerId={playerId}
                    />
                </div>
            </div>
        </>
    );
}
