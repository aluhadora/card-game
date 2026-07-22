import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { AnimationDelta, AnimationType, CardData } from "../../common/types";
import {
    useAnimationBusyUpdater,
    useAnimationRegistry,
} from "./animationRegistry";
import { animationTime } from "../../../logic/animationConfiguration";
import { getCardTexture } from "./cardTextureCache";

type AnimationHandler3dProps = {
    animationDeltas: Array<AnimationDelta> | null;
    setAnimationDeltas: (
        updater:
            | Array<AnimationDelta>
            | ((prev: Array<AnimationDelta>) => Array<AnimationDelta>),
    ) => void;
    /**
     * The local player's id. Used to decide which anchors belong to
     * "us" (rendered at scale 1) vs. another player's play area
     * (rendered at scale 0.6 to match the shrunken `PlayerArea` group).
     */
    playerId: string;
    /**
     * Called synchronously when the last overlay in a batch finishes.
     * The parent (`App`) has already stored the pending game state in a
     * ref by the time this fires, so calling this here batches the state
     * commit together with the busy-clear and overlay unmount into a
     * single React paint — no flash-of-old/blank state at hand-off.
     */
    applyPendingState?: () => void;
};

type ActiveAnim = {
    id: number;
    from: THREE.Vector3;
    to: THREE.Vector3;
    card: CardData | null;
    type: AnimationType;
    /** Absolute performance.now() at which this delta should start moving. */
    startTime: number;
    duration: number;
    /** Anchor IDs whose static cards should hide for this delta's window. */
    anchors: string[];
    startScale?: number;
    endScale?: number;
};

/** Approximates the CSS `cubic-bezier(0.4, 0.0, 0.2, 1)` easing. */
function easeStandard(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Lift overlay meshes slightly toward the camera so they render on top of
 * the static `CardComponent`s at the same anchor point without z-fighting.
 */
const OVERLAY_Z_OFFSET = 0.2;

type AnimatedCardProps = {
    anim: ActiveAnim;
    onComplete: (id: number, anchors: string[]) => void;
};

function AnimatedCard({ anim, onComplete }: AnimatedCardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const doneRef = useRef(false);

    const texturePath = anim.card?.name
        ? `/images/cards/${anim.card.name}.png`
        : "/images/cards/back.png";
    const faceTexture = getCardTexture(texturePath);
    const backTexture = getCardTexture("/images/cards/back.png");

    // Initial orientation depends on the animation type:
    // - `flip` / `revealTranslate`: start face-down (the animation itself
    //   rotates the card to face-up over its duration).
    // - `translate`: hold face-up if the card is known, otherwise face-down.
    const initialRotation = useMemo<[number, number, number]>(() => {
        if (anim.type === "flip" || anim.type === "revealTranslate") {
            return [0, 0, 0];
        }
        return anim.card ? [0, Math.PI, 0] : [0, 0, 0];
    }, [anim.type, anim.card]);

    useFrame(() => {
        const mesh = meshRef.current;
        if (doneRef.current || !mesh) return;

        const now = performance.now();

        // Delay window: keep the mesh hidden so it doesn't leak a static
        // face-up copy at the source position while waiting to run.
        if (now < anim.startTime) {
            mesh.visible = false;
            return;
        }
        mesh.visible = true;

        const elapsed = now - anim.startTime;
        const t = Math.min(1, elapsed / anim.duration);
        const eased = easeStandard(t);

        if (anim.type === "flip") {
            mesh.position.copy(anim.from);
        } else {
            mesh.position.lerpVectors(anim.from, anim.to, eased);
        }

        if (anim.type === "flip" || anim.type === "revealTranslate") {
            mesh.rotation.y = eased * Math.PI;
        }

        if (
            anim.startScale !== undefined &&
            anim.endScale !== undefined &&
            anim.startScale !== anim.endScale
        ) {
            mesh.scale.setScalar(
                anim.startScale + (anim.endScale - anim.startScale) * eased,
            );
        }

        if (t >= 1) {
            doneRef.current = true;
            onComplete(anim.id, anim.anchors);
        }
    });

    return (
        <mesh
            ref={meshRef}
            position={anim.from}
            rotation={initialRotation}
            visible={false}
            castShadow
        >
            <boxGeometry args={[2, 3, 0.05]} />
            <meshStandardMaterial attach="material-0" map={faceTexture} />
            <meshStandardMaterial attach="material-1" color="red" />
            <meshStandardMaterial attach="material-2" color="orange" />
            <meshStandardMaterial attach="material-3" color="yellow" />
            <meshStandardMaterial
                attach="material-4"
                color="white"
                map={backTexture}
            />
            <meshStandardMaterial
                attach="material-5"
                color="white"
                map={faceTexture}
            />
        </mesh>
    );
}

/**
 * Anchors on another player's play area render at 0.6 (matching the
 * `<group scale={0.6}>` wrapper in `golf.tsx` for other players).
 * Everything else — the deck, the discard pile, and our own play area —
 * renders at scale 1.
 *
 * Player anchor IDs are of the form `p{playerId}-*` (e.g. `p42-3`,
 * `p42-selected`, `p42-3-neighbor`). Shared anchors like `deck-card` and
 * `discard-pile` are not player-prefixed.
 */
function scaleForAnchor(anchor: string, ourPlayerId: string): number {
    if (anchor.startsWith(`p${ourPlayerId}-`)) return 1;
    if (anchor.startsWith("p")) return 0.6;
    return 1;
}

function startScale(anim: AnimationDelta, ourPlayerId: string): number {
    return scaleForAnchor(anim.from, ourPlayerId);
}

function endScale(anim: AnimationDelta, ourPlayerId: string): number {
    return scaleForAnchor(anim.to, ourPlayerId);
}

/**
 * Consumes queued animation deltas and plays them according to their
 * declared `type`, honouring per-delta `delay` and `duration` so the
 * server can describe compound choreographies (approach → flip → push).
 *
 * On batch completion (the last overlay reaching t=1), this handler
 * atomically:
 *   1. clears the busy set for that delta's anchors (unhides underlying),
 *   2. unmounts the overlay mesh, and
 *   3. applies the parent-provided pending game state.
 * Because React 18 batches all `setState` calls made in a single event
 * handler, all three land in one commit — the underlying steady-state
 * card re-renders with its new `cardData` (face-up) at exactly the frame
 * the overlay disappears, with no gap that could reveal a stale/blank
 * intermediate state.
 *
 * Deltas that arrive mid-batch are queued and picked up on the next run.
 */
export default function AnimationHandler3d({
    animationDeltas,
    setAnimationDeltas,
    playerId,
    applyPendingState,
}: AnimationHandler3dProps) {
    const registry = useAnimationRegistry();
    const { markBusy, clearBusy } = useAnimationBusyUpdater();
    const [active, setActive] = useState<ActiveAnim[]>([]);
    const runningRef = useRef(false);
    const consumedCountRef = useRef(0);
    const activeCountRef = useRef(0);
    const nextIdRef = useRef(0);
    const busyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Clean up any pending busy-toggle timers on unmount.
    useEffect(
        () => () => {
            busyTimersRef.current.forEach(clearTimeout);
            busyTimersRef.current = [];
        },
        [],
    );

    useEffect(() => {
        if (runningRef.current) return;
        if (!animationDeltas || animationDeltas.length === 0) return;

        const now = performance.now();
        const overlayOffset = new THREE.Vector3(0, 0, OVERLAY_Z_OFFSET);
        const newActive: ActiveAnim[] = [];

        for (const delta of animationDeltas) {
            const fromSlot = registry.get(delta.from);
            const toSlot = registry.get(delta.to);
            if (!fromSlot || !toSlot) {
                console.error("AnimationHandler3d: slot not found", {
                    from: delta.from,
                    to: delta.to,
                });
                continue;
            }
            const delay = delta.delay ?? 0;
            const duration = delta.duration ?? animationTime;
            const anchors = [delta.from, delta.to];

            newActive.push({
                id: nextIdRef.current++,
                from: fromSlot.getWorldPos().add(overlayOffset),
                to: toSlot.getWorldPos().add(overlayOffset),
                card: delta.card,
                type: delta.type ?? "translate",
                startTime: now + delay,
                duration,
                anchors,
                startScale: startScale(delta, playerId),
                endScale: endScale(delta, playerId),
            });

            // Hide the static cards at this delta's endpoints only while
            // the overlay is actually in flight. Clear-busy is deliberately
            // NOT scheduled here — the `onComplete` handler below clears it
            // in the same synchronous event as the overlay unmount and the
            // pending state application, so all three land in one commit.
            if (delay === 0) {
                markBusy(anchors);
            } else {
                busyTimersRef.current.push(
                    setTimeout(() => markBusy(anchors), delay),
                );
            }
        }

        consumedCountRef.current = animationDeltas.length;

        if (newActive.length === 0) {
            setAnimationDeltas((prev) => prev.slice(consumedCountRef.current));
            return;
        }

        runningRef.current = true;
        activeCountRef.current = newActive.length;
        setActive(newActive);
    }, [animationDeltas, registry, setAnimationDeltas, markBusy, playerId]);

    const handleComplete = (id: number, anchors: string[]) => {
        // Clear busy for this delta's anchors and remove the overlay in the
        // same synchronous handler so React 18 batches them together. If
        // this is the LAST active overlay in the batch, also apply the
        // parent's pending game state and drop the consumed deltas — again
        // in the same batch — so the underlying `CardComponent`s render
        // with their new `cardData` in the exact same commit that the
        // overlay disappears and its busy anchors clear.
        clearBusy(anchors);
        activeCountRef.current = Math.max(0, activeCountRef.current - 1);
        setActive((prev) => prev.filter((a) => a.id !== id));

        if (activeCountRef.current === 0 && runningRef.current) {
            runningRef.current = false;
            setAnimationDeltas((prevDeltas) =>
                prevDeltas.slice(consumedCountRef.current),
            );
            busyTimersRef.current = [];
            applyPendingState?.();
        }
    };

    return (
        <>
            {active.map((a) => (
                <AnimatedCard key={a.id} anim={a} onComplete={handleComplete} />
            ))}
        </>
    );
}
