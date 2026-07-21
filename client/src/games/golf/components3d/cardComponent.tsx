import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CardData } from "../../common/types";
import { useFrame } from "@react-three/fiber";
import { getCardTexture } from "./cardTextureCache";

export type CardProps = {
    position?: [number, number, number];
    cardData: CardData | null;
    cardClick?: () => void;
};

function flippingAnimation(
    delta: number,
    rotation: [number, number, number],
    setRotation: React.Dispatch<React.SetStateAction<[number, number, number]>>,
    active: boolean,
) {
    const setYRotation = (newY: number) => {
        setRotation(([x, _y, z]) => [x, newY, z]);
    };

    if (active && rotation[1] < Math.PI) {
        setYRotation(rotation[1] + delta * 5);
    } else if (!active && rotation[1] > 0) {
        setYRotation(rotation[1] - delta * 5);
    } else {
        setYRotation(active ? Math.PI : 0);
    }
}

export function CardComponent({ position, cardData, cardClick }: CardProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(cardData !== null);
    const [rotation, setRotation] = useState<[number, number, number]>([
        0, 0, 0,
    ]);
    const texturePath = cardData?.name
        ? `/images/cards/${cardData.name}.png`
        : "/images/cards/card-base.png";
    const texture = getCardTexture(texturePath);
    const baseTexture = getCardTexture("/images/cards/back.png");

    // Keep the flip state in sync with whatever card data is currently
    // assigned to this slot. Without this, when the server pushes a state
    // where the slot transitions from empty (null) to a real card, `active`
    // stays false and the card never flips face-up — the animated overlay
    // finishes and the underlying card sits face-down, which looks like
    // the screen "flashed" past the reveal.
    useEffect(() => {
        setActive(cardData !== null);
    }, [cardData]);

    useFrame((_state, delta) =>
        flippingAnimation(delta, rotation, setRotation, active),
    );

    return (
        <mesh
            position={position}
            rotation={rotation}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            onClick={() => {
                cardClick?.();
            }}
            // scale={active ? 1.5 : 1}
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
