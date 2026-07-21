import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { AnimationDelta, CardData } from "../../common/types";
import { useAnimationRegistry } from "./animationRegistry";
import { animationTime } from "../../../logic/animationConfiguration";
import { getCardTexture } from "./cardTextureCache";

type AnimationHandler3dProps = {
    animationDeltas: Array<AnimationDelta> | null;
    setAnimationDeltas: (deltas: Array<AnimationDelta>) => void;
};

type ActiveAnim = {
    id: number;
    from: THREE.Vector3;
    to: THREE.Vector3;
    card: CardData | null;
    startTime: number;
};

/**
 * Approximates the CSS `cubic-bezier(0.4, 0.0, 0.2, 1)` easing used by the
 * DOM animation handler so the 3D scene has the same feel.
 */
function easeStandard(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type AnimatedCardProps = {
    anim: ActiveAnim;
    onComplete: (id: number) => void;
};

function AnimatedCard({ anim, onComplete }: AnimatedCardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const doneRef = useRef(false);

    // If we know the card face, show it face-up (matches the CardComponent
    // convention of a Math.PI Y-rotation revealing the front). Otherwise
    // travel face-down.
    const texturePath = anim.card?.name
        ? `/images/cards/${anim.card.name}.png`
        : "/images/cards/back.png";
    const faceTexture = getCardTexture(texturePath);
    const backTexture = getCardTexture("/images/cards/back.png");

    const rotation = useMemo<[number, number, number]>(
        () => (anim.card ? [0, Math.PI, 0] : [0, 0, 0]),
        [anim.card],
    );

    useFrame(() => {
        const mesh = meshRef.current;
        if (doneRef.current || !mesh) return;
        const elapsed = performance.now() - anim.startTime;
        const t = Math.min(1, elapsed / animationTime);
        mesh.position.lerpVectors(anim.from, anim.to, easeStandard(t));
        if (t >= 1) {
            doneRef.current = true;
            onComplete(anim.id);
        }
    });

    return (
        <mesh ref={meshRef} position={anim.from} rotation={rotation} castShadow>
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
 * Consumes queued animation deltas and plays them in parallel as tweened
 * card meshes moving between registered anchor points. Mirrors the DOM
 * `AnimationHandler` semantics: any deltas that arrive while a batch is
 * running are picked up on the next effect run.
 */
export default function AnimationHandler3d({
    animationDeltas,
    setAnimationDeltas,
}: AnimationHandler3dProps) {
    const registry = useAnimationRegistry();
    const [active, setActive] = useState<ActiveAnim[]>([]);
    const runningRef = useRef(false);
    const nextIdRef = useRef(0);

    useEffect(() => {
        if (runningRef.current) return;
        if (!animationDeltas || animationDeltas.length === 0) return;

        const now = performance.now();
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
            newActive.push({
                id: nextIdRef.current++,
                from: fromSlot.getWorldPos(),
                to: toSlot.getWorldPos(),
                card: delta.card,
                startTime: now,
            });
        }

        if (newActive.length === 0) {
            setAnimationDeltas([]);
            return;
        }

        runningRef.current = true;
        setActive(newActive);
    }, [animationDeltas, registry, setAnimationDeltas]);

    const handleComplete = (id: number) => {
        setActive((prev) => {
            const next = prev.filter((a) => a.id !== id);
            if (next.length === 0 && runningRef.current) {
                runningRef.current = false;
                // Drop the deltas we just played; anything that arrived during
                // the batch stays queued and triggers the next effect run.
                setAnimationDeltas([]);
            }
            return next;
        });
    };

    return (
        <>
            {active.map((a) => (
                <AnimatedCard key={a.id} anim={a} onComplete={handleComplete} />
            ))}
        </>
    );
}
