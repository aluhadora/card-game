import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import {
    GameMode,
    GameModes,
    DifficultyLevels,
    DifficultyLevel,
} from "../../games/sudoku/constants";
import Checkbox from "@mui/material/Checkbox";
import { SudokuGameSettings } from "../../games/sudoku/types";

export type SudokuOptionsProps = {
    gameSettings: SudokuGameSettings;
    setGameSettings: (settings: SudokuGameSettings) => void;
};

export default function SudokuOptions({
    gameSettings,
    setGameSettings,
}: SudokuOptionsProps) {
    return (
        <>
            <FormControlLabel
                control={
                    <TextField
                        variant="outlined"
                        size="small"
                        select
                        value={gameSettings.gameMode ?? GameModes.Cooperative}
                        style={{ minWidth: 150 }}
                        onChange={(e) =>
                            setGameSettings({
                                ...gameSettings,
                                gameMode: e.target.value as GameMode,
                            })
                        }
                    >
                        {Object.values(GameModes).map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>
                }
                label="Game Mode: "
                labelPlacement="start"
            />
            <FormControlLabel
                control={
                    <TextField
                        variant="outlined"
                        size="small"
                        select
                        value={
                            gameSettings.difficultyLevel ??
                            DifficultyLevels.Easy
                        }
                        style={{ minWidth: 150 }}
                        onChange={(e) =>
                            setGameSettings({
                                ...gameSettings,
                                difficultyLevel: e.target
                                    .value as DifficultyLevel,
                            })
                        }
                    >
                        {Object.values(DifficultyLevels).map((level) => (
                            <MenuItem key={level} value={level}>
                                {level}
                            </MenuItem>
                        ))}
                    </TextField>
                }
                label="Difficulty Level: "
                labelPlacement="start"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={gameSettings.allowAutoPencil ?? false}
                        onChange={(e) =>
                            setGameSettings({
                                ...gameSettings,
                                allowAutoPencil: e.target.checked,
                            })
                        }
                    />
                }
                label="Allow Auto Pencil: "
                labelPlacement="end"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={gameSettings.autoCheckAnswers ?? false}
                        onChange={(e) =>
                            setGameSettings({
                                ...gameSettings,
                                autoCheckAnswers: e.target.checked,
                            })
                        }
                    />
                }
                label="Auto Check Answers: "
                labelPlacement="end"
            />
        </>
    );
}
