import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import styles from "./optionsDrawer.module.css";

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

type OptionsDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    render3d: boolean;
    setRender3d: (value: boolean) => void;
};

export default function OptionsDrawer({
    isOpen,
    onClose,
    render3d,
    setRender3d,
}: OptionsDrawerProps) {
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
                        style={{ marginLeft: "10px" }}
                        control={
                            <Checkbox
                                checked={render3d}
                                onChange={(e) => setRender3d(e.target.checked)}
                            />
                        }
                        label="Render in 3D"
                    />
                </div>
            </div>
        </>
    );
}
