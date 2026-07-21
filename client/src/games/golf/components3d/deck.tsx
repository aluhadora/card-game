import { CardComponent } from "./cardComponent";
import { AnchorPoint } from "./animationRegistry";
import { getCardTexture } from "./cardTextureCache";

type DeckCardProps = {
    remainingCards: number;
    active: boolean;
    deckClick: () => void;
    position: [number, number, number];
};

export function Deck({
    position,
    remainingCards,
    active,
    deckClick,
}: DeckCardProps) {
    const baseTexture = getCardTexture("/images/cards/back.png");
    const topZ = position[2] + 0.05 + (0.05 * remainingCards) / 2;
    const topPos: [number, number, number] = [position[0], position[1], topZ];

    return (
        <group onClick={deckClick}>
            <mesh receiveShadow position={position}>
                <meshStandardMaterial map={baseTexture} />
                <boxGeometry args={[2, 3, 0.05 * remainingCards]} />
            </mesh>
            <AnchorPoint id="deck-card" position={topPos} />
            <CardComponent position={topPos} cardData={null} />
        </group>
    );
}
