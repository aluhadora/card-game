import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import { GameSettings, PlayersMap } from "../types";

export interface GolfGameSettings extends GameSettings {
    decks?: number;
}

export type GolfOptionsProps = {
    gameSettings: GolfGameSettings;
    setGameSettings: (settings: GolfGameSettings) => void;
    players: PlayersMap;
};

export default function GolfOptions({
    gameSettings,
    setGameSettings,
    players,
}: GolfOptionsProps) {
    return (
        <FormControlLabel
            control={
                <TextField
                    variant="outlined"
                    size="small"
                    type="number"
                    slotProps={{ htmlInput: { min: 1, max: 10 } }}
                    value={gameSettings.decks}
                    onChange={(e) =>
                        setGameSettings({
                            ...gameSettings,
                            decks: parseInt(e.target.value),
                        })
                    }
                />
            }
            label={`Number of Decks (recommended: ${Object.keys(players).length}):`}
            labelPlacement="start"
        />
    );
}
