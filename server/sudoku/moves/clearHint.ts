import { MoveContext, MoveData } from "../types";
import { clearHint } from "./helpers";

export default function clearHintMove(moveData: MoveData, context: MoveContext): MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];
    clearHint(cell, moveData.value);
    return context;
}
