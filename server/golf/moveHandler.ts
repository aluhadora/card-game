import acceptSelected from "./moves/acceptSelected";
import declineSelected from "./moves/declineSelected";
import drawFromDeck from "./moves/drawFromDeck";
import openingMove from "./moves/openingMove";
import selectFromDiscard from "./moves/selectFromDiscard";
import { GameStates, MoveTypes } from "./constants";
import MoveValidator from "./moveValidator";
import { MoveContext, MoveData } from "./types";


export default class MoveHandler {
    moveValidator: MoveValidator;
    moveDictionary: Record<string, (moveData: MoveData, context : MoveContext) => {} | undefined>;

    constructor() {
        this.moveValidator = new MoveValidator();
        this.moveDictionary = {};
        this.moveDictionary[MoveTypes.OpeningMove] = openingMove;
        this.moveDictionary[MoveTypes.DrawFromDeck] = drawFromDeck;
        this.moveDictionary[MoveTypes.SelectFromDiscard] = selectFromDiscard;
        this.moveDictionary[MoveTypes.AcceptSelected] = acceptSelected;
        this.moveDictionary[MoveTypes.DeclineSelected] = declineSelected;
    }

    handleMove(moveData : MoveData, context : MoveContext) : {} | undefined {
        if (!this.moveValidator.validateMove(moveData, context)) return;

        if (context.gameState === GameStates.Opening) {
            return this.moveDictionary[MoveTypes.OpeningMove](moveData, context);
        }

        return this.moveDictionary[moveData.moveType](moveData, context);
    }
}