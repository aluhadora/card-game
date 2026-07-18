import { MoveContext, MoveData } from "../types";
import { GameStates } from "../constants";

export default function closeGameMove(_moveData: MoveData, context: MoveContext): MoveContext {
    return { ...context, gameState: GameStates.GameOver };
}
