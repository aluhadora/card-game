import { useEffect, useState } from "react";
import { InputMode } from "../constants";
import { Cell, MoveData, Player } from "../types";
import { InputModeStrategyHandler, InputProps } from "../inputModes/inputModeStrategyHandler";
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from "@mui/material/FormGroup";

export type SudokuGameState = {
    board: Cell[][];
    players: Record<string, Player>;
}

export type SudokuProps = {
    gameState: SudokuGameState;
    playerId: string;
    playerMove: (move: MoveData) => void;
}

export type CellProps = {
    inputProps: InputProps;
    cell: Cell;
    playerId: string;
    playerMove: (move: MoveData) => void;
    cellAddress: [number, number];
}

const standardCellStyle = {
    border: "1px solid darkgrey",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "30px",
    position: "relative" as const,
}

function ValuedCell({ inputProps, cell, playerId, playerMove, cellAddress }: CellProps) {
    const isCreatedByCurrentPlayer = cell.createdBy === playerId;
    const cellStyle = {
        ...standardCellStyle,
        color: isCreatedByCurrentPlayer ? "blue" : "black",
    };
    return (
        <CellBase inputProps={inputProps} cell={cell} playerId={playerId} playerMove={playerMove} cellAddress={cellAddress} cellStyle={cellStyle}>
            {cell.value}
        </CellBase>
    );
}

function HintedCell({ inputProps, cell, playerId, playerMove, cellAddress }: CellProps) {
    const cellStyle = {
        ...standardCellStyle,
    };
    return (
        <CellBase inputProps={inputProps} cell={cell} playerId={playerId} playerMove={playerMove} cellAddress={cellAddress} cellStyle={cellStyle}>
            {cell.hints.map((hint) => (<CellHint key={hint.value} value={hint.value} inputProps={inputProps} cell={cell} cellAddress={cellAddress} />))}
        </CellBase>
    );
}

function ReadonlyCell({ inputProps, cell, cellAddress }: { inputProps: InputProps, cell: Cell, cellAddress: [number, number] }) {
    const cellStyle = {
        ...standardCellStyle,
        fontWeight: "bold",
    };

    return (
        <CellBase inputProps={inputProps} cell={cell} playerId={""} playerMove={() => { }} cellAddress={cellAddress} cellStyle={cellStyle}>
            {cell.value}
        </CellBase>
    );
}

function CellHint({ value, inputProps, cell, cellAddress }: { value: number, inputProps: InputProps, cell: Cell, cellAddress: [number, number] }) {
    // position for hint will fill in the relevant position inside the cell
    // for example
    // 1 |   | 3
    // 4 | 5 | 
    //   | 8 | 9

    const row = Math.floor((value - 1) / 3);
    const col = (value - 1) % 3;

    const hintStyle = {
        fontSize: "10px",
        color: "gray",
        margin: "2px",
        position: "absolute" as const,
        top: `${row * 13}px`,
        left: `${col * 13}px`,
        backgroundColor: determineCellHintBackgroundColor(inputProps, value),
    };
    return (
        <div style={hintStyle}>
            {value}
        </div>
    );
}

function isCellMatch(cellAddressA: [number, number] | null, cellAddressB?: [number, number]) {
    if (!cellAddressA) return false;
    return cellAddressA[0] === cellAddressB?.[0] && cellAddressA[1] === cellAddressB?.[1];
}

function isCellNeighbor(cellAddressA: [number, number] | null, cellAddressB: [number, number]) {
    if (isCellMatch(cellAddressA, cellAddressB)) return false;
    if (!cellAddressA) return false;

    if (cellAddressA[0] === cellAddressB[0]) return true;
    if (cellAddressA[1] === cellAddressB[1]) return true;
    return Math.floor(cellAddressA[0] / 3) === Math.floor(cellAddressB[0] / 3) && Math.floor(cellAddressA[1] / 3) === Math.floor(cellAddressB[1] / 3);
}

function determineCellHintBackgroundColor(inputProps: InputProps, value: number) {
    const cellValueSelected = inputProps.selectedNumber === value;

    if (cellValueSelected) return "lightblue";

    return "transparent";
}


function determineCellBackgroundColor(inputProps: InputProps, cell: Cell, cellAddress: [number, number]) {
    const cellSelected = isCellMatch(inputProps.selectedCell, cellAddress);
    const cellHovered = isCellMatch(inputProps.hoveredCell, cellAddress);
    const cellNeighborHovered = isCellNeighbor(inputProps.hoveredCell, cellAddress);
    const cellNeighborSelected = isCellNeighbor(inputProps.selectedCell, cellAddress);

    if (cellSelected) return "lightblue";
    if (cell.value !== null && inputProps.selectedNumber === cell.value) return "lightblue";
    if (cellHovered) return "lightgrey";
    if (cellNeighborHovered || cellNeighborSelected) return "#dedfe4c0";

    return "white";
}

function CellBase({ inputProps, cell, playerId, playerMove, cellAddress, cellStyle, children }: { inputProps: InputProps, cell: Cell, playerId: string, playerMove: (move: MoveData) => void, cellAddress: [number, number], cellStyle?: React.CSSProperties, children?: React.ReactNode }) {
    const handleClick = () => {
        if (cell.readonly) return;
        console.log("CellBase handleClick", cellAddress, cell.value, inputProps.inputMode);
        inputProps.inputHandler.handleCellClick(inputProps, cell, cellAddress, playerMove, playerId);
    };

    const cellSelected = isCellMatch(inputProps.selectedCell, cellAddress);

    const style = {
        ...standardCellStyle,
        ...(cellStyle ?? {}),
        backgroundColor: determineCellBackgroundColor(inputProps, cell, cellAddress),
    };

    const innerCellStyle = {
        width: "100%",
        height: "100%",
        boxSizing: "border-box" as const,
        border: cellSelected ? "2px solid blue" : "1px solid darkgrey",
    }

    const mouseEnter = () => {
        inputProps.inputHandler.onMouseEnterCell(inputProps, cell, cellAddress, playerMove, playerId);

    }

    return (
        <div style={style} onMouseDown={handleClick} onMouseUp={() => inputProps.inputHandler.onMouseUp(inputProps)} onMouseEnter={mouseEnter}>
            <div style={innerCellStyle}>
                {children}
            </div>
        </div>
    );
}

function CellComponent({ inputProps, cell, playerId, playerMove, cellAddress }: CellProps) {
    if (cell.readonly) {
        return <ReadonlyCell inputProps={inputProps} cell={cell} cellAddress={cellAddress} />;
    } else if (cell.value !== null) {
        return <ValuedCell inputProps={inputProps} cell={cell} playerId={playerId} playerMove={playerMove} cellAddress={cellAddress} />;
    } else if (cell.hints.length > 0) {
        return <HintedCell inputProps={inputProps} cell={cell} playerId={playerId} playerMove={playerMove} cellAddress={cellAddress} />;
    } else {
        return <CellBase inputProps={inputProps} cell={cell} playerId={playerId} playerMove={playerMove} cellAddress={cellAddress} cellStyle={standardCellStyle} />;
    }
}

function CellGroup({ inputProps, gameState, groupIndex, playerId, playerMove }: { inputProps: InputProps, gameState: SudokuGameState, groupIndex: number, playerId: string, playerMove: (move: MoveData) => void }) {
    const groupRow = Math.floor(groupIndex / 3);
    const groupCol = groupIndex % 3;

    const groupCells = gameState.board.slice(groupRow * 3, groupRow * 3 + 3).map(row => row.slice(groupCol * 3, groupCol * 3 + 3));

    return (
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid black", margin: "0px" }}>
            {groupCells.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex" }}>
                    {row.map((cell, colIndex) => {
                        return <CellComponent key={colIndex} inputProps={inputProps} cell={cell} playerId={playerId} playerMove={playerMove} cellAddress={[rowIndex + groupRow * 3, colIndex + groupCol * 3]} />;
                    })}
                </div>
            ))}
        </div>
    );
}

function SudokuBoard({ inputProps, gameState, playerId, playerMove }: SudokuProps & { inputProps: InputProps }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", userSelect: "none" }} onMouseLeave={() => inputProps.inputHandler.handleExitBoard(inputProps)}>
            {[0, 1, 2].map(groupRow => (
                <div key={groupRow} style={{ display: "flex" }}>
                    {[0, 1, 2].map(groupCol => {
                        const groupIndex = groupRow * 3 + groupCol;
                        return <CellGroup key={groupIndex} inputProps={inputProps} gameState={gameState} groupIndex={groupIndex} playerId={playerId} playerMove={playerMove} />;
                    })}
                </div>
            ))}
        </div>
    );
}

function NumberRow({ inputProps, playerMove, playerId }: { inputProps: InputProps, playerMove: (move: MoveData) => void, playerId: string }) {
    return (
        <div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(number => (
                <button key={number} onClick={() => inputProps.inputHandler.handleNumberClick(inputProps, number, playerMove, playerId)} style={{ backgroundColor: inputProps.selectedNumber === number ? "lightblue" : "white" }}>
                    {number}
                </button>
            ))}
        </div>
    );
}

function InputModeSelector({ inputProps }: { inputProps: InputProps }) {
    const { inputMode, setInputMode, setSelectedCell, setSelectedNumber } = inputProps;
    const lightningMode = inputMode === InputMode.Lightning || inputMode === InputMode.LightningHint;
    const hintMode = inputMode === InputMode.StandardHint || inputMode === InputMode.LightningHint;

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
    }

    return (
        <FormGroup row>
            <FormControlLabel control={<Checkbox checked={lightningMode} onChange={(e) => changeMode(e.target.checked, hintMode)} />} label="Lightning Mode" />
            <FormControlLabel control={<Checkbox checked={hintMode} onChange={(e) => changeMode(lightningMode, e.target.checked)} />} label="Hint Mode" />
        </FormGroup>
    );
}


export default function Sudoku({ gameState, playerId, playerMove }: SudokuProps) {
    // How the input modes work:
    // Standard: Player selects a cell, then either types a number, or clicks it in the number row
    // Lightning: Player selects a number, then clicks a cell to fill it in
    // Standard Hint: Player selects a cell, then either types a number, or clicks it in the number row to add a hint
    // Lightning Hint: Player selects a number, then clicks a cell to add a hint
    const [inputMode, setInputMode] = useState<InputMode>(
        (localStorage.getItem("sudoku_inputMode") as InputMode) ?? InputMode.Standard
    );

    const setAndPersistInputMode = (mode: InputMode) => {
        localStorage.setItem("sudoku_inputMode", mode);
        setInputMode(mode);
    };
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);
    const [dragging, setDragging] = useState<boolean>(false);
    const [dragClearing, setDragClearing] = useState<boolean>(false);

    const inputHandler = new InputModeStrategyHandler(inputMode);

    const inputProps: InputProps = {
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
        console.log("Input mode changed to", inputMode);
        inputHandler.inputMode = inputMode;
        console.log("InputHandler inputMode is now", inputHandler.inputMode);
    }, [inputMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log("Key pressed:", e.key);

            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                inputHandler.handleNumberClick(inputProps, num, playerMove, playerId);
            } else if (e.key === "Backspace" || e.key === "Delete" || e.key === " " ) {
                inputHandler.handleClearButtonPress(inputProps, selectedCell, playerMove, playerId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [inputMode, selectedCell, selectedNumber]); // include any state the handler reads

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>Sudoku</h1>
            <SudokuBoard inputProps={inputProps} gameState={gameState} playerId={playerId} playerMove={playerMove} />
            <InputModeSelector inputProps={inputProps} />
            <NumberRow inputProps={inputProps} playerMove={playerMove} playerId={playerId} />
        </div>
    );
}