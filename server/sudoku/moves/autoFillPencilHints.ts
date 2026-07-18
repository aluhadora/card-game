import { MoveContext, MoveData } from "../types";
import { getPossibleValues } from "./helpers";

export default function autoFillPencilHintsMove(_moveData: MoveData, context: MoveContext): MoveContext {
    if (!context.settings?.allowAutoPencil) {
        return context;
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = context.board[row][col];
            if (cell.value === null) {
                const possibleValues = getPossibleValues(row, col, context);
                cell.hints = possibleValues.map(value => ({ value, createdBy: "system" }));
            }
        }
    }

    return context;
}
