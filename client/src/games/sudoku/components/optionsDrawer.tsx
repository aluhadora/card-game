import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import styles from "./optionsDrawer.module.css";
import { InputHandlerProps } from "../inputModes/inputHandler";
import { InputMode, MoveTypes } from "../constants";
import pencilIcon from "../../../../public/images/icons/pencil.svg";
import { MoveData } from "../types";

export function MenuButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            className={styles.menuButton}
            onClick={onClick}
            title="Open options"
        >
            ☰
        </button>
    );
}

export default function OptionsDrawer({
    isOpen,
    onClose,
    inputProps,
    playerMove,
    playerId,
}: {
    isOpen: boolean;
    onClose: () => void;
    inputProps: InputHandlerProps;
    playerMove: (move: MoveData) => void;
    playerId: string;
}) {
    const { inputMode, setInputMode, setSelectedCell, setSelectedNumber } =
        inputProps;
    const lightningMode =
        inputMode === InputMode.Lightning ||
        inputMode === InputMode.LightningHint;
    const hintMode =
        inputMode === InputMode.StandardHint ||
        inputMode === InputMode.LightningHint;

    const handleLightningModeChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (event.target.checked && hintMode) {
            setInputMode(InputMode.LightningHint);
            setSelectedCell(null);
        } else if (event.target.checked && !hintMode) {
            setInputMode(InputMode.Lightning);
            setSelectedCell(null);
        } else if (!event.target.checked && hintMode) {
            setInputMode(InputMode.StandardHint);
            setSelectedNumber(null);
        } else {
            setInputMode(InputMode.Standard);
            setSelectedNumber(null);
        }
    };

    return (
        <>
            {isOpen && (
                <div className={styles.drawerOverlay} onClick={onClose} />
            )}
            <div
                className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <h2>Options</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            padding: 0,
                        }}
                    >
                        ✕
                    </button>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <FormControlLabel
                        className={styles.optionCheckbox}
                        style={{
                            marginLeft: "10px",
                        }}
                        control={
                            <Checkbox
                                checked={lightningMode}
                                onChange={handleLightningModeChange}
                            />
                        }
                        label="Lightning Mode"
                    />
                    <button
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "235px",
                            marginLeft: "10px",
                        }}
                        onClick={() => {
                            playerMove({
                                moveType: MoveTypes.AutoFillPencilHints,
                                cellAddress: [0, 0],
                                value: null,
                                playerId: playerId,
                            });
                        }}
                    >
                        <img
                            src={pencilIcon}
                            alt="Notes mode"
                            style={{ height: "20px", width: "20px" }}
                        />
                        <span>Auto fill pencil hints</span>
                    </button>
                    <button
                        style={{
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            width: "235px",
                            marginLeft: "10px",
                        }}
                        onClick={() => {
                            playerMove({
                                moveType: MoveTypes.AutoSolve,
                                cellAddress: [0, 0],
                                value: null,
                                playerId: playerId,
                            });
                        }}
                    >
                        <span>Auto solve board</span>
                    </button>
                </div>
            </div>
        </>
    );
}
