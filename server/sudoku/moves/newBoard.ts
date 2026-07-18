import { MoveContext, MoveData } from "../types";

export default function newBoardMove(_moveData: MoveData, context: MoveContext): MoveContext {
    console.log("Creating new board...");
    return context.newBoard();
}
