import { CardComponent } from "./cardComponent";
import { CardData } from "../../common/types";
import { AnchorPoint } from "./animationRegistry";
import { getCardTexture } from "./cardTextureCache";

type DiscardPileProps = {
    discardPile: CardData[];
    discardClick: () => void;
    position: [number, number, number];
};

export function CardPile({
    position,
    discardPile,
    discardClick,
}: DiscardPileProps) {
    const baseTexture = getCardTexture("/images/cards/card-base.png");
    // Anchor at the top of the pile — or the base surface when empty — so
    // cards animate to where the next card will actually land.
    const topZ =
        discardPile.length > 0
            ? position[2] + 0.05 + (0.05 * discardPile.length) / 2
            : position[2] + 0.05;
    const topPos: [number, number, number] = [position[0], position[1], topZ];

    return (
        <group
            onClick={(e) => {
                // R3F fires the group's onClick once per raycast hit
                // inside it, so a click on the pile that also touches the
                // top-card mesh would otherwise dispatch the move twice.
                e.stopPropagation();
                discardClick();
            }}
        >
            <mesh receiveShadow position={position}>
                <meshStandardMaterial map={baseTexture} />
                <boxGeometry args={[2, 3, 0.05 * discardPile.length]} />
            </mesh>
            <AnchorPoint id="discard-pile" position={topPos} />
            {discardPile.length > 0 && (
                <CardComponent
                    position={topPos}
                    cardData={discardPile[discardPile.length - 1]}
                    anchorId="discard-pile"
                />
            )}
        </group>
    );
}
