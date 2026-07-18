import { InputHandlerProps } from "../inputModes/inputHandler";
import { Cell, MoveData } from "../types";
import { SudokuGameState } from "./sudoku";
import styles from "./cellsComponents.module.css";
import { CellHint } from "./cellHints";
import { useEffect, useState } from "react";

export type CellProps = {
    inputProps: InputHandlerProps;
    cell: Cell;
    playerId: string;
    playerMove: (move: MoveData) => void;
    cellAddress: [number, number];
};

function ValuedCell({
    inputProps,
    cell,
    playerId,
    playerMove,
    cellAddress,
}: CellProps) {
    const cellStyle = {
        color: determineCellForegroundColor(cell, playerId),
    };
    return (
        <CellBase
            inputProps={inputProps}
            cell={cell}
            playerId={playerId}
            playerMove={playerMove}
            cellAddress={cellAddress}
            cellStyle={cellStyle}
        >
            {cell.value}
        </CellBase>
    );
}

function HintedCell({
    inputProps,
    cell,
    playerId,
    playerMove,
    cellAddress,
}: CellProps) {
    return (
        <CellBase
            inputProps={inputProps}
            cell={cell}
            playerId={playerId}
            playerMove={playerMove}
            cellAddress={cellAddress}
        >
            {cell.hints.map((hint) => (
                // filter other's hints optionally
                <CellHint
                    key={hint.value}
                    value={hint.value}
                    createdBy={hint.createdBy}
                    playerId={playerId}
                    inputProps={inputProps}
                />
            ))}
        </CellBase>
    );
}

function ReadonlyCell({
    inputProps,
    cell,
    cellAddress,
}: {
    inputProps: InputHandlerProps;
    cell: Cell;
    cellAddress: [number, number];
}) {
    const cellStyle = {
        fontWeight: "bold",
    };

    return (
        <CellBase
            inputProps={inputProps}
            cell={cell}
            playerId={""}
            playerMove={() => {}}
            cellAddress={cellAddress}
            cellStyle={cellStyle}
        >
            {cell.value}
        </CellBase>
    );
}

function isCellMatch(
    cellAddressA: [number, number] | null,
    cellAddressB?: [number, number],
) {
    if (!cellAddressA) return false;
    return (
        cellAddressA[0] === cellAddressB?.[0] &&
        cellAddressA[1] === cellAddressB?.[1]
    );
}

function isCellNeighbor(
    cellAddressA: [number, number] | null,
    cellAddressB: [number, number],
) {
    if (isCellMatch(cellAddressA, cellAddressB)) return false;
    if (!cellAddressA) return false;

    if (cellAddressA[0] === cellAddressB[0]) return true;
    if (cellAddressA[1] === cellAddressB[1]) return true;
    return (
        Math.floor(cellAddressA[0] / 3) === Math.floor(cellAddressB[0] / 3) &&
        Math.floor(cellAddressA[1] / 3) === Math.floor(cellAddressB[1] / 3)
    );
}
function determineCellForegroundColor(cell: Cell, playerId: string): string {
    const isCreatedByCurrentPlayer = cell.createdBy === playerId; // this gets replaced by player.color
    return isCreatedByCurrentPlayer ? "blue" : "green";
}

function determineCellBackgroundColor(
    inputProps: InputHandlerProps,
    cell: Cell,
    cellAddress: [number, number],
): string {
    const isDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    const cellSelected = isCellMatch(inputProps.selectedCell, cellAddress);
    const cellHovered = isCellMatch(inputProps.hoveredCell, cellAddress);
    const cellNeighborHovered = isCellNeighbor(
        inputProps.hoveredCell,
        cellAddress,
    );
    const cellNeighborSelected = isCellNeighbor(
        inputProps.selectedCell,
        cellAddress,
    );

    if (cellSelected) return "lightblue";
    if (cell.value !== null && inputProps.selectedNumber === cell.value)
        return "lightblue";
    if (cellHovered) return isDarkMode ? "whitesmoke" : "lightgrey";
    if (cellNeighborHovered || cellNeighborSelected)
        return isDarkMode ? "#dedfe4ff" : "#dedfe4c0";

    return "white";
}

function CellBase({
    inputProps,
    cell,
    playerId,
    playerMove,
    cellAddress,
    cellStyle,
    children,
}: {
    inputProps: InputHandlerProps;
    cell: Cell;
    playerId: string;
    playerMove: (move: MoveData) => void;
    cellAddress: [number, number];
    cellStyle?: React.CSSProperties;
    children?: React.ReactNode;
}) {
    const [showGroupFinished, setShowGroupFinished] = useState(false);
    const cellSelected = isCellMatch(inputProps.selectedCell, cellAddress);

    useEffect(() => {
        if (!showGroupFinished) return;

        const timer = setTimeout(() => {
            setShowGroupFinished(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [showGroupFinished]);


    const style = {
        ...(cellStyle ?? {}),
        backgroundColor: determineCellBackgroundColor(
            inputProps,
            cell,
            cellAddress,
        ),
    };

    const innerCellStyle = {
        width: "100%",
        height: "100%",
        boxSizing: "border-box" as const,
        border: cellSelected ? "2px solid blue" : "1px solid darkgrey",
    };

    const mouseEnter = () => {
        inputProps.inputHandler.onMouseEnterCell(
            inputProps,
            cell,
            cellAddress,
            playerMove,
            playerId,
        );
    };

    const handleMouseDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        inputProps.inputHandler.handleCellClick(
            inputProps,
            cell,
            cellAddress,
            playerMove,
            playerId,
        );
    };

    const mouseUp = () => {
        inputProps.inputHandler.onMouseUp(inputProps);
    };

    return (
        <div
            style={style}
            onPointerDown={handleMouseDown}
            onPointerUp={mouseUp}
            onPointerEnter={mouseEnter}
            className={`${styles.cell} ${showGroupFinished ? styles.groupFinished : ""}`}
        >
            <div style={innerCellStyle}>{children}</div>
        </div>
    );
}

function CellComponent({
    inputProps,
    cell,
    playerId,
    playerMove,
    cellAddress,
}: CellProps) {
    if (cell.readonly) {
        return (
            <ReadonlyCell
                inputProps={inputProps}
                cell={cell}
                cellAddress={cellAddress}
            />
        );
    } else if (cell.value !== null) {
        return (
            <ValuedCell
                inputProps={inputProps}
                cell={cell}
                playerId={playerId}
                playerMove={playerMove}
                cellAddress={cellAddress}
            />
        );
    } else if (cell.hints.length > 0) {
        return (
            <HintedCell
                inputProps={inputProps}
                cell={cell}
                playerId={playerId}
                playerMove={playerMove}
                cellAddress={cellAddress}
            />
        );
    } else {
        return (
            <CellBase
                inputProps={inputProps}
                cell={cell}
                playerId={playerId}
                playerMove={playerMove}
                cellAddress={cellAddress}
            />
        );
    }
}

export function CellGroup({
    inputProps,
    gameState,
    groupIndex,
    playerId,
    playerMove,
}: {
    inputProps: InputHandlerProps;
    gameState: SudokuGameState;
    groupIndex: number;
    playerId: string;
    playerMove: (move: MoveData) => void;
}) {
    const groupRow = Math.floor(groupIndex / 3);
    const groupCol = groupIndex % 3;

    const groupCells = gameState.board
        .slice(groupRow * 3, groupRow * 3 + 3)
        .map((row) => row.slice(groupCol * 3, groupCol * 3 + 3));

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                border: "1px solid black",
                margin: "0px",
            }}
        >
            {groupCells.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: "flex" }}>
                    {row.map((cell, colIndex) => {
                        return (
                            <CellComponent
                                key={colIndex}
                                inputProps={inputProps}
                                cell={cell}
                                playerId={playerId}
                                playerMove={playerMove}
                                cellAddress={[
                                    rowIndex + groupRow * 3,
                                    colIndex + groupCol * 3,
                                ]}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
