import { DifficultyLevel } from "../constants";
import { Cell, Puzzle } from "../types";

export interface BoardStrategy {
    generateBoard(difficultyLevel: DifficultyLevel): Puzzle;
}