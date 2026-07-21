import { useRef, useState } from "react";
import * as THREE from "three";
import { CardData } from "../../common/types";
import { getCardTexture } from "./cardTextureCache";
import { useIsAnchorBusy } from "./animationRegistry";

export type CardProps = {
    position?: [number, number, number];
    cardData: CardData | null;
    cardClick?: () => void;
    /**
     * When set, this card hides itself while the named anchor is in the
     * animation handler's busy set — i.e. while an overlay is currently
     * playing an animation to/from this anchor. Prevents the static
     * steady-state card from ghosting behind the animated overlay.
     */
    anchorId?: string;
};

/**
 * A static card mesh anchored to a slot. The card face angle is derived
 * directly from `cardData` so the component snaps to the correct
 * orientation whenever the data changes — no local flip animation, no
 * post-commit rotation sync that could flash the wrong texture for a
 * frame.
 *
 * All reveal/translate/flip motion for cards is played by
 * `AnimationHandler3d` as short-lived overlay meshes that render in front
 * of these static ones and hand off silently when they finish.
 */
export function CardComponent({
    position,
    cardData,
    cardClick,
    anchorId,
}: CardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const busy = useIsAnchorBusy(anchorId);

    const texturePath = cardData?.name
        ? `/images/cards/${cardData.name}.png`
        : "/images/cards/card-base.png";
    const texture = getCardTexture(texturePath);
    const baseTexture = getCardTexture("/images/cards/back.png");

    const rotation: [number, number, number] = cardData
        ? [0, Math.PI, 0]
        : [0, 0, 0];

    return (
        <mesh
            position={position}
            rotation={rotation}
            visible={!busy}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            onClick={() => cardClick?.()}
            ref={meshRef}
            castShadow
        >
            <boxGeometry args={[2, 3, 0.05]} />

            <meshStandardMaterial
                attach="material-0"
                map={texture}
                color={hovered ? "hotpink" : "white"}
            />
            <meshStandardMaterial attach="material-1" color="red" />
            <meshStandardMaterial attach="material-2" color="orange" />
            <meshStandardMaterial attach="material-3" color="yellow" />
            <meshStandardMaterial
                attach="material-4"
                color="white"
                map={baseTexture}
            />
            <meshStandardMaterial
                attach="material-5"
                color="white"
                map={texture}
            />
        </mesh>
    );
}
