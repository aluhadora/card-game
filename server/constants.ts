export const GameTypes = {
    Golf: "Golf",
    Garbage: "Garbage",
    Sudoku: "Sudoku",
} as const;

export type GameType = typeof GameTypes[keyof typeof GameTypes];