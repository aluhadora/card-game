import { GameStates, MoveTypes } from "./constants";
import clearCell from "./moves/clearCell";
import setCellValue from "./moves/setCellValue";
import toggleHint from "./moves/toggleHint";
import clearHintMove from "./moves/clearHint";
import addHintMove from "./moves/addHint";
import newBoardMove from "./moves/newBoard";
import closeGameMove from "./moves/closeGame";
import autoFillPencilHintsMove from "./moves/autoFillPencilHints";
import autoSolveMove from "./moves/autoSolve";
import checkAnswers from "./moves/checkAnswers";
import MoveValidator from "./moveValidator";
import { MoveContext, MoveData } from "./types";
import clearBoard from "./moves/clearBoard";

export default class MoveHandler {
    moveValidator: MoveValidator;
    moveDictionary: Record<string, (moveData: MoveData, context: MoveContext) => MoveContext>;

    constructor() {
        this.moveValidator = new MoveValidator();
        this.moveDictionary = {};
        this.moveDictionary[MoveTypes.ClearCell] = clearCell;
        this.moveDictionary[MoveTypes.SetCellValue] = setCellValue;
        this.moveDictionary[MoveTypes.ToggleHint] = toggleHint;
        this.moveDictionary[MoveTypes.ClearHint] = clearHintMove;
        this.moveDictionary[MoveTypes.AddHint] = addHintMove;
        this.moveDictionary[MoveTypes.NewBoard] = newBoardMove;
        this.moveDictionary[MoveTypes.CloseGame] = closeGameMove;
        this.moveDictionary[MoveTypes.AutoFillPencilHints] = autoFillPencilHintsMove;
        this.moveDictionary[MoveTypes.AutoSolve] = autoSolveMove;
        this.moveDictionary[MoveTypes.CheckAnswers] = checkAnswers;
        this.moveDictionary[MoveTypes.ClearBoard] = clearBoard;
    }

    handleMove(moveData: MoveData, context: MoveContext): MoveContext | undefined {
        if (!this.moveValidator.validateMove(moveData, context)) {
            console.log(`Invalid move attempted by player ${moveData.playerId}:`, moveData);
            return;
        }

        return this.moveDictionary[moveData.moveType](moveData, context);
    }
}

