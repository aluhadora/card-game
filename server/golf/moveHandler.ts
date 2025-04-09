import acceptSelected from "./moves/acceptSelected";
import declineSelected from "./moves/declineSelected";
import drawFromDeck from "./moves/drawFromDeck";
import MoveData from "./moveData";
import openingMove from "./moves/openingMove";
import selectFromDiscard from "./moves/selectFromDiscard";
import { GameStates, MoveTypes } from "./constants";


export default class MoveHandler {
    // moveDictionary is a dictionary from string to function handling a moveType

    moveDictionary: Record<string, (moveData: MoveData) => {} | undefined>;

    constructor() {
        this.moveDictionary = {};
        this.moveDictionary[MoveTypes.OpeningMove] = openingMove;
        this.moveDictionary[MoveTypes.DrawFromDeck] = drawFromDeck;
        this.moveDictionary[MoveTypes.SelectFromDiscard] = selectFromDiscard;
        this.moveDictionary[MoveTypes.AcceptSelected] = acceptSelected;
        this.moveDictionary[MoveTypes.DeclineSelected] = declineSelected;
    }

    handleMove(moveData : MoveData) : {} | undefined {
        if (moveData.gameState === GameStates.Opening) {
            return this.moveDictionary[MoveTypes.OpeningMove](moveData);
        }

        return this.moveDictionary[moveData.moveType](moveData);
    }
}