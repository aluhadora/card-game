import React, { useEffect, useState } from "react";
import styles from "./sudoku.module.css";
import { InputMode, GameState, GameStates, MoveTypes } from "../constants";
import { Cell, MoveData, Player } from "../types";
import {
    InputModeStrategyHandler,
    InputHandlerProps,
} from "../inputModes/inputHandler";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import { CellGroup } from "./cellsComponents";

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

function NumberRow({
    inputProps,
    playerMove,
    playerId,
}: {
    inputProps: InputHandlerProps;
    playerMove: (move: MoveData) => void;
    playerId: string;
}) {
    const buttonStyle = {
        color: "black",
        margin: "0px",
        width: "20px",
        height: "30px",
        alignContent: "center",
        justifyContent: "center",
        paddingTop: "6px",
        display: "inline-flex",
    };

    return (
        <div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
                <button
                    key={number}
                    onClick={() =>
                        inputProps.inputHandler.handleNumberClick(
                            inputProps,
                            number,
                            playerMove,
                            playerId,
                        )
                    }
                    style={{
                        ...buttonStyle,
                        backgroundColor:
                            inputProps.selectedNumber === number
                                ? "lightblue"
                                : "white",
                    }}
                >
                    {number}
                </button>
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
    // if (gameState.gameState !== GameStates.Completed) return null;

    return (
        <div>
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

function InputModeSelector({ inputProps }: { inputProps: InputHandlerProps }) {
    const { inputMode, setInputMode, setSelectedCell, setSelectedNumber } =
        inputProps;
    const lightningMode =
        inputMode === InputMode.Lightning ||
        inputMode === InputMode.LightningHint;
    const hintMode =
        inputMode === InputMode.StandardHint ||
        inputMode === InputMode.LightningHint;

    const changeMode = (lightning: boolean, hint: boolean) => {
        if (lightning && !hint) {
            setInputMode(InputMode.Lightning);
            setSelectedCell(null);
        } else if (lightning && hint) {
            setInputMode(InputMode.LightningHint);
            setSelectedCell(null);
        } else if (!lightning && hint) {
            setInputMode(InputMode.StandardHint);
            setSelectedNumber(null);
        } else {
            setInputMode(InputMode.Standard);
            setSelectedNumber(null);
        }
    };

    return (
        <FormGroup row>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={lightningMode}
                        onChange={(e) => changeMode(e.target.checked, hintMode)}
                    />
                }
                label="Lightning Mode"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={hintMode}
                        onChange={(e) =>
                            changeMode(lightningMode, e.target.checked)
                        }
                    />
                }
                label="Hint Mode"
            />
        </FormGroup>
    );
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
        (localStorage.getItem("sudoku_inputMode") as InputMode) ??
            InputMode.Standard,
    );

    const setAndPersistInputMode = (mode: InputMode) => {
        localStorage.setItem("sudoku_inputMode", mode);
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
                    playerMove,
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
                    playerMove,
                    playerId,
                );
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputMode, selectedCell, selectedNumber]); // include any state the handler reads

    if (gameState.gameState === GameStates.GameOver) return null;
    return (
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
            }}
        >
            <div>
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
                        playerMove={playerMove}
                    />
                    <InputModeSelector inputProps={inputProps} />
                    <NumberRow
                        inputProps={inputProps}
                        playerMove={playerMove}
                        playerId={playerId}
                    />
                </div>

                <GameCompleteRow
                    gameState={gameState}
                    playerMove={playerMove}
                    playerId={playerId}
                />
            </div>
        </div>
    );
}
