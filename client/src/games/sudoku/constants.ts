export const MoveTypes = {
    ClearCell: "ClearCell",
    SetCellValue: "SetCellValue",
    ToggleHint: "ToggleHint",
    ConfirmCellValue: "ConfirmCellValue",
} as const;

export type MoveType = typeof MoveTypes[keyof typeof MoveTypes];

export const DifficultyLevels = {
    Easy: "Easy",
    Medium: "Medium",
    Hard: "Hard",
    Expert: "Expert",
} as const;

export type DifficultyLevel = typeof DifficultyLevels[keyof typeof DifficultyLevels];

export const InputMode = {
    Standard: "Standard",
    StandardHint: "StandardHint",
    Erase: "Erase",
    Lightning: "Lightning",
    LightningHint: "LightningHint",
} as const;

export type InputMode = typeof InputMode[keyof typeof InputMode];