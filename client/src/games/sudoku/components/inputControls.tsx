import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import { SudokuGameState } from "./sudoku";
import { InputHandlerProps } from "../inputModes/inputHandler";
import { GameStates, InputMode } from "../constants";
import pencilIcon from "../../../../public/images/icons/pencil.svg";
import eraserIcon from "../../../../public/images/icons/eraser.svg";
import { Cell, MoveData } from "../types";
import styles from "./inputControls.module.css";

function numberIsComplete(board: Cell[][], number: number): boolean {
    return board.flat().filter((cell) => cell.value === number).length === 9;
}

function LightningErasingSelector({
    inputProps,
}: {
    inputProps: InputHandlerProps;
}) {
    const { inputMode, selectedNumber, setSelectedNumber } = inputProps;

    if (!(
        inputMode === InputMode.Lightning ||
        inputMode === InputMode.LightningHint
    )) {
        return null;
    }

    return (
        <FormControlLabel
            className={`${styles.inputCheckbox} ${selectedNumber === 0 ? styles.active : ""}`}

            control={
                <Checkbox
                    checked={selectedNumber === 0}
                    onChange={(e) =>
                        e.target.checked
                            ? setSelectedNumber(0)
                            : setSelectedNumber(null)
                    }
                />
            }
            label={
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <img
                        src={eraserIcon}
                        alt="Erasing"
                        style={{ height: "20px", width: "20px" }}
                    />
                    <span>Erasing</span>
                </div>
            }
        />
    );
}

export function InputModeSelector({
    gameState,
    inputProps,
}: {
    gameState: SudokuGameState;
    inputProps: InputHandlerProps;
}) {
    if (gameState.gameState === GameStates.Completed) return null;

    const { inputMode, setInputMode, setSelectedCell, setSelectedNumber } =
        inputProps;
    const lightningMode =
        inputMode === InputMode.Lightning ||
        inputMode === InputMode.LightningHint;
    const hintMode =
        inputMode === InputMode.StandardHint ||
        inputMode === InputMode.LightningHint;

    const changeMode = (lightning: boolean, hint: boolean) => {
        if (lightning && !hint) {
            setInputMode(InputMode.Lightning);
            setSelectedCell(null);
        } else if (lightning && hint) {
            setInputMode(InputMode.LightningHint);
            setSelectedCell(null);
        } else if (!lightning && hint) {
            setInputMode(InputMode.StandardHint);
            setSelectedNumber(null);
        } else {
            setInputMode(InputMode.Standard);
            setSelectedNumber(null);
        }
    };

    return (
        <FormGroup
            row
            style={{
                width: "auto",
                maxWidth: "100%",
                display: "flex",
                justifyContent: "center",
                gap: "0px",
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <FormControlLabel
                className={`${styles.inputCheckbox} ${hintMode ? styles.active : ""}`}
                style={{
                    marginLeft: "10px",
                }}
                control={
                    <Checkbox
                        checked={hintMode}
                        onChange={(e) =>
                            changeMode(lightningMode, e.target.checked)
                        }
                    />
                }
                label={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <img
                            src={pencilIcon}
                            alt="Notes mode"
                            style={{ height: "20px", width: "20px" }}
                        />
                        <span>Notes Mode</span>
                    </div>
                }
            />
            <LightningErasingSelector inputProps={inputProps} />
        </FormGroup>
    );
}

export function NumberRow({
    inputProps,
    playerMove,
    playerId,
    gameState,
}: {
    inputProps: InputHandlerProps;
    playerMove: (move: MoveData) => void;
    playerId: string;
    gameState: SudokuGameState;
}) {
    if (gameState.gameState === GameStates.Completed) return null;
    const isLightningMode =
        inputProps.inputMode === InputMode.Lightning ||
        inputProps.inputMode === InputMode.LightningHint;

    return (
        <div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
                .filter((i) => !isLightningMode || i !== 0)
                .map((number) => (
                    <button
                        key={number}
                        onClick={() =>
                            inputProps.inputHandler.handleNumberClick(
                                inputProps,
                                number,
                                playerMove,
                                playerId,
                            )
                        }
                        className={`${styles.numberButton} ${
                            inputProps.selectedNumber === number
                                ? `${styles.active}`
                                : ""
                        } ${number === 0 ? styles.zeroButton : ""}`}
                    >
                        <div
                            style={{
                                opacity: numberIsComplete(
                                    gameState.board,
                                    number,
                                )
                                    ? 0.1
                                    : 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ fontSize: "20px", color: "blue" }}>
                                {number === 0 ? (
                                    <div className={styles.eraserIcon}></div>
                                ) : (
                                    number
                                )}
                            </div>
                            <div style={{ fontSize: "9px" }}>
                                {9 -
                                    gameState.board
                                        .flat()
                                        .filter((cell) => cell.value === number)
                                        .length}
                            </div>
                        </div>
                    </button>
                ))}
        </div>
    );
}
