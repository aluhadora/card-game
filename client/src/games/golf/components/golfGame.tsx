import { useState } from "react";
import Golf from "./golf";
import Golf3d from "../components3d/golf";
import OptionsDrawer, { MenuButton } from "./optionsDrawer";
import { GameState, MoveData } from "../types";
import { AnimationDelta } from "../../common/types";

export type GolfGameProps = {
    gameState: GameState | null;
    playerMove: (move: MoveData) => void;
    playerId: string;
    animationDeltas?: Array<AnimationDelta> | null;
    setAnimationDeltas?: (deltas: Array<AnimationDelta>) => void;
};

const RENDER_3D_KEY = "golf_render3d";

function loadRender3d(): boolean {
    return localStorage.getItem(RENDER_3D_KEY) === "true";
}

/**
 * Client-side meta board for the golf game. Owns the "Render in 3D"
 * preference (persisted to localStorage) and its options drawer, then
 * delegates to either the DOM `Golf` component or the R3F `Golf3d`
 * component. Both children ignore whichever props they don't need.
 */
export default function GolfGame(props: GolfGameProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [render3d, setRender3dState] = useState<boolean>(loadRender3d());

    const setRender3d = (value: boolean) => {
        localStorage.setItem(RENDER_3D_KEY, String(value));
        setRender3dState(value);
    };

    return (
        <>
            <MenuButton onClick={() => setDrawerOpen(true)} />
            <OptionsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                render3d={render3d}
                setRender3d={setRender3d}
            />
            {render3d ? <Golf3d {...props} /> : <Golf {...props} />}
        </>
    );
}
