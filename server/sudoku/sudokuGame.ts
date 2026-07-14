import { AddPlayerPayload, BasePlayerMovePayload, Game, Player, StartGamePayload } from "../types";
import { GameTypes } from "../constants";
import { BoardStrategy } from "./boardProvider/boardStrategy";
import { SudokuGen } from "./boardProvider/sudokuGen";
import MoveHandler from "./moveHandler";
import { Cell, MoveContext, MoveData, StartSudokuGame } from "./types";

export default class SudokuGame implements Game {
    players: Record<string, Player>;
    board: (Cell)[][];
    moveHandler: MoveHandler;
    boardStrategy: BoardStrategy;

    constructor() {
        this.players = {};
        this.board = Array.from({ length: 9 }, () => Array(9).fill({} as Cell));
        this.moveHandler = new MoveHandler();
        this.boardStrategy = new SudokuGen();
    }
    
    visibleState(extraData?: Record<string, unknown>): Record<string, unknown> {
        return {
            players: this.players,
            board: this.board,
            gameType: GameTypes.Sudoku,
            ...extraData
        };
    }

    playerMove(data: MoveData): MoveContext | undefined {
        const context = this.visibleState() as MoveContext;

        return this.moveHandler.handleMove(data, context);
    }

    startGame(data: StartSudokuGame): Record<string, unknown> {
        this.board = this.boardStrategy.generateBoard(data.difficultyLevel || "easy");

        return this.visibleState();
    }

    addPlayer(data: AddPlayerPayload): void {
        const playerId = data.playerId;
        const playerName = data.nickname;
        
        if (!this.players[playerId]) {
            this.players[playerId] = {
                playerId: playerId,
                nickname: playerName,
            };
        } else {
            console.log(`Player ${playerName} is already in the game. and has rejoined`);
        }
    }
}