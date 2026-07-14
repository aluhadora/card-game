import { DifficultyLevel } from "../constants";
import { Cell } from "../types";

export interface BoardStrategy {
    generateBoard(difficultyLevel: DifficultyLevel): Cell[][];
}