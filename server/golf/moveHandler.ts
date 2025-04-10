import acceptSelected from "./moves/acceptSelected";
import declineSelected from "./moves/declineSelected";
import drawFromDeck from "./moves/drawFromDeck";
import openingMove from "./moves/openingMove";
import selectFromDiscard from "./moves/selectFromDiscard";
import { GameStates, MoveTypes } from "./constants";
import MoveValidator from "./moveValidator";
import { MoveData } from "./types";


export default class MoveHandler {
    moveValidator: MoveValidator;
    moveDictionary: Record<string, (moveData: MoveData) => {} | undefined>;

    constructor() {
        this.moveValidator = new MoveValidator();
        this.moveDictionary = {};
        this.moveDictionary[MoveTypes.OpeningMove] = openingMove;
        this.moveDictionary[MoveTypes.DrawFromDeck] = drawFromDeck;
        this.moveDictionary[MoveTypes.SelectFromDiscard] = selectFromDiscard;
        this.moveDictionary[MoveTypes.AcceptSelected] = acceptSelected;
        this.moveDictionary[MoveTypes.DeclineSelected] = declineSelected;
    }

    handleMove(moveData : MoveData) : {} | undefined {
        if (!this.moveValidator.validateMove(moveData)) return;

        if (moveData.gameState === GameStates.Opening) {
            return this.moveDictionary[MoveTypes.OpeningMove](moveData);
        }

        return this.moveDictionary[moveData.moveType](moveData);
    }
}