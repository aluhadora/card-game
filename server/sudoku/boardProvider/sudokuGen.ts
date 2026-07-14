import { DifficultyLevel } from "../constants";
import { Cell } from "../types";
import { BoardStrategy } from "./boardStrategy";
import { getSudoku } from "sudoku-gen";

export class SudokuGen implements BoardStrategy {
    generateBoard(difficultyLevel: DifficultyLevel): Cell[][] {
        const { puzzle } = getSudoku(difficultyLevel as any);
        return puzzle.split("").map((value) => ({
            value: value === "-" ? null : parseInt(value),
            readonly: value !== "-",
            confirmed: false,
            hints: [],
            createdBy: null,
        })).reduce((rows, cell, index) => {
            if (index % 9 === 0) rows.push([]);
            rows[rows.length - 1].push(cell);
            return rows;
        }, [] as Cell[][]);
    }
}