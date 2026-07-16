export const MoveTypes = {
    ClearCell: "ClearCell",
    SetCellValue: "SetCellValue",
    ToggleHint: "ToggleHint",
    ConfirmCellValue: "ConfirmCellValue",
    ClearHint: "ClearHint",
    AddHint: "AddHint",
    NewBoard: "NewBoard",
    CloseGame: "CloseGame",
    AutoFillPencilHints: "AutoFillPencilHints",
    AutoSolve: "AutoSolve",
} as const;

export type MoveType = (typeof MoveTypes)[keyof typeof MoveTypes];

export const DifficultyLevels = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
    Expert: "Expert",
} as const;

export type DifficultyLevel =
    (typeof DifficultyLevels)[keyof typeof DifficultyLevels];

export const GameStates = {
    Playing: "Playing",
    Paused: "Paused",
    Completed: "Completed",
    GameOver: "GameOver",
} as const;

export type GameState = (typeof GameStates)[keyof typeof GameStates];

export const InputMode = {
    Standard: "Standard",
    StandardHint: "StandardHint",
    Erase: "Erase",
    Lightning: "Lightning",
    LightningHint: "LightningHint",
} as const;

export type InputMode = (typeof InputMode)[keyof typeof InputMode];

export const GameModes = {
    Cooperative: "Cooperative",
    Versus: "Versus",
    VersusBlitz: "VersusBlitz",
} as const;

export type GameMode = (typeof GameModes)[keyof typeof GameModes];
