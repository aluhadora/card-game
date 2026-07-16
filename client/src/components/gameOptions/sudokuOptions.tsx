import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import {
    GameMode,
    GameModes,
    SudokuGameSettings,
    DifficultyLevel,
    DifficultyLevels,
} from "../../games/sudoku/constants";
import Checkbox from "@mui/material/Checkbox";
import { useEffect } from "react";

export type SudokuOptionsProps = {
    gameSettings: SudokuGameSettings;
    setGameSettings: (settings: SudokuGameSettings) => void;
};

export default function SudokuOptions({
    gameSettings,
    setGameSettings,
}: SudokuOptionsProps) {
    useEffect(() => {
        if (!gameSettings.gameMode) {
            setGameSettings({
                ...gameSettings,
                gameMode: GameModes.Cooperative,
                difficultyLevel: DifficultyLevels.Easy,
                allowAutoPencil: false,
                autoCheckAnswers: false,
            });
        }
    }, [gameSettings, setGameSettings]);

    return (
        <>
            <FormControlLabel
                control={
                    <TextField
                        variant="outlined"
                        size="small"
                        select
                        value={gameSettings.gameMode}
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
                        value={gameSettings.difficultyLevel}
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
                        checked={gameSettings.allowAutoPencil}
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
                        checked={gameSettings.autoCheckAnswers}
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
