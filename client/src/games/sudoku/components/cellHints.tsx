import { InputHandlerProps } from "../inputModes/inputHandler";
import { Cell, MoveData } from "../types";
import styles from "./cellHints.module.css";

export type CellProps = {
    inputProps: InputHandlerProps;
    cell: Cell;
    playerId: string;
    playerMove: (move: MoveData) => void;
    cellAddress: [number, number];
};

export function CellHint({
    value,
    createdBy,
    playerId,
    inputProps,
}: {
    value: number;
    createdBy: string;
    playerId: string;
    inputProps: InputHandlerProps;
}) {
    // position for hint will fill in the relevant position inside the cell
    // for example
    // 1 |   | 3
    // 4 | 5 |
    //   | 8 | 9

    const row = Math.floor((value - 1) / 3);
    const col = (value - 1) % 3;

    const hintStyle = {
        top: `${row * 13}px`,
        left: `${col * 13}px`,
        backgroundColor: determineCellHintBackgroundColor(inputProps, value),
        color: createdBy === playerId ? "blue" : "green",
    };
    return (
        <div className={styles.cellHint} style={hintStyle}>
            {value}
        </div>
    );
}

function determineCellHintBackgroundColor(
    inputProps: InputHandlerProps,
    value: number,
) {
    const cellValueSelected = inputProps.selectedNumber === value;

    if (cellValueSelected) return "lightblue";

    return "transparent";
}
