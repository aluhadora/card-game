import { AddPlayerPayload, BasePlayerMovePayload, Game, Player, StartGamePayload } from "../types";
import { GameTypes } from "../constants";
import { BoardStrategy } from "./boardProvider/boardStrategy";
import { SudokuGen } from "./boardProvider/sudokuGen";
import MoveHandler from "./moveHandler";
import { Cell, MoveContext, MoveData, Puzzle, StartSudokuGame, SudokuGameSettings } from "./types";
import { GameState, GameStates, DifficultyLevels, DifficultyLevel, GameModes } from "./constants";

export default class SudokuGame implements Game {
    players: Record<string, Player>;
    board: (Cell)[][];
    moveHandler: MoveHandler;
    boardStrategy: BoardStrategy;
    puzzle: Puzzle;
    gameState: GameState;
    settings: SudokuGameSettings;

    constructor() {
        this.players = {};
        this.board = Array.from({ length: 9 }, () => Array(9).fill({} as Cell));
        this.moveHandler = new MoveHandler();
        this.boardStrategy = new SudokuGen();
        this.gameState = GameStates.Playing;
        this.puzzle = {
            board: this.board,
            solution: Array.from({ length: 9 }, () => Array(9).fill(0)),
            difficultyLevel: DifficultyLevels.Easy,
        };
        this.settings = {
            gameType: GameTypes.Sudoku,
            gameMode: GameModes.Cooperative,
            difficultyLevel: DifficultyLevels.Easy,
            allowAutoPencil: false,
            autoCheckAnswers: false,
            pin: "",
        };
    }

    allowLateJoin(): boolean {
        return true;
    }
    
    visibleState(extraData?: Record<string, unknown>): Record<string, unknown> {
        return {
            players: this.players,
            board: this.board,
            gameType: GameTypes.Sudoku,
            gameState: this.gameState,
            newBoard: this.newBoard.bind(this),
            puzzleSolution: this.puzzle.solution,
            settings: this.settings,
            ...extraData
        };
    }

    handleGameFinished(context: MoveContext): MoveContext {
        if (this.gameState === GameStates.GameOver) {
            return context;
        }

        if (context.board.some(row => row.some(cell => cell.value === null))) {
            this.gameState = GameStates.Playing;
        } else if (context.board.every((row, rowIndex) => row.every((cell, colIndex) => cell.value === this.puzzle.solution[rowIndex][colIndex]))) {
            this.gameState = GameStates.Completed;
        }

        return {
            ...context,
            gameState: this.gameState,
        };
    }

    playerMove(data: MoveData): MoveContext | undefined {
        const context = this.moveHandler.handleMove(data, this.visibleState() as MoveContext) ;
        return this.handleGameFinished(context || this.visibleState() as MoveContext);
    }

    newBoard(settings: SudokuGameSettings | undefined | null): MoveContext {
        this.puzzle = this.boardStrategy.generateBoard(settings?.difficultyLevel || DifficultyLevels.Easy);
        this.board = this.puzzle.board;
        this.gameState = GameStates.Playing;

        return this.visibleState() as MoveContext;
    }

    startGame(settings: SudokuGameSettings): Record<string, unknown> {
        this.settings = settings;
        return this.newBoard(settings);
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