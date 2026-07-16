import { DifficultyLevel } from "../constants";
import { Cell, Puzzle } from "../types";
import { BoardStrategy } from "./boardStrategy";
import { getSudoku } from "sudoku-gen";

export class SudokuGen implements BoardStrategy {
    convertPuzzleStringToBoard(puzzleString: string): Cell[][] {
        return puzzleString.split("").map((value) => ({
            value: value === "-" ? null : parseInt(value),
            readonly: value !== "-",
            confirmed: false,
            hints: [],
            createdBy: null,
        })).reduce((rows, cell, index) => {
            if (index % 9 === 0) rows.push([]);
            rows[rows.length - 1].push(cell);
            return rows;
        }, [] as Cell[][]);}

    generateBoard(difficultyLevel: DifficultyLevel): Puzzle {
        const { puzzle, solution, difficulty } = getSudoku(difficultyLevel.toLocaleLowerCase() as any);

        return {
            board: this.convertPuzzleStringToBoard(puzzle),
            solution: solution.split("").map((value) => parseInt(value)).reduce((rows, value, index) => {
                if (index % 9 === 0) rows.push([]);
                rows[rows.length - 1].push(value);
                return rows;
            }, [] as number[][]),
            difficultyLevel: difficultyLevel,
        };
    }
}