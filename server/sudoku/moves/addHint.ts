import { MoveContext, MoveData } from "../types";
import { allowAddHint, addHint } from "./helpers";

export default function addHintMove(moveData: MoveData, context: MoveContext): MoveContext {
    const [row, col] = moveData.cellAddress;
    const cell = context.board[row][col];

    if (allowAddHint(moveData.cellAddress, moveData.value!, context)) {
        addHint(cell, moveData.value!, moveData.playerId);
    }

    return context;
}
