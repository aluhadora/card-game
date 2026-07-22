import { CardData } from "../../common/types";
import { GameStates, MoveTypes } from "../constants";
import { GameState, MoveData, Player } from "../types";
import { CardComponent } from "./cardComponent";
import { AnchorPoint } from "./animationRegistry";

type PlayerInfoProps = {
    player: Player;
    isUs?: boolean;
    position: [number, number, number];
    scale?: number;
    active?: boolean;
    selectedCard: CardData | null;
};

type PlayerAreaProps = PlayerInfoProps & {
    gameState: GameState;
    playerMove: (move: MoveData) => void;
};

export default function PlayerArea({
    position,
    scale,
    isUs,
    active,
    playerMove,
    player,
    selectedCard,
    gameState,
}: PlayerAreaProps) {
    const cards = [];

    const cardClick = (index: number) => {
        console.log("Card clicked", { index, gameState, selectedCard });
        if (gameState.gameState === GameStates.Opening) {
            playerMove({ moveType: MoveTypes.OpeningMove, cardIndex: index }); // Accepting the first two cards in opening state
            return;
        }

        if (!isUs || !active) return;

        playerMove({ moveType: MoveTypes.AcceptSelected, cardIndex: index });
    };

    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
            const index = j * 3 + i;
            const slotPos: [number, number, number] = [
                -3 + i * 3,
                1 - j * 4,
                0.2,
            ];
            cards.push(
                <AnchorPoint
                    key={`anchor-${i}-${j}`}
                    id={`p${player.id}-${index}`}
                    position={slotPos}
                />,
            );
            cards.push(
                <CardComponent
                    key={`${i}-${j}`}
                    position={slotPos}
                    cardData={player.playArea[index] || null}
                    cardClick={() => cardClick(index)}
                    anchorId={`p${player.id}-${index}`}
                />,
            );
        }
    }

    const selectedPos: [number, number, number] = [
        position[0],
        position[1] + 5,
        0.2,
    ];

    return (
        <group scale={scale ?? 1}>
            <mesh position={position} receiveShadow>
                <meshStandardMaterial color="green" />
                <planeGeometry args={[10, 20]} />
                {cards}
            </mesh>
            <mesh position={[position[0], position[1] + 5, 0.1]} receiveShadow>
                <meshStandardMaterial color="white" />
                <planeGeometry args={[2, 3]} />
            </mesh>
            <AnchorPoint id={`p${player.id}-selected`} position={selectedPos} />
            {selectedCard && (
                <CardComponent
                    position={selectedPos}
                    cardData={selectedCard}
                    anchorId={`p${player.id}-selected`}
                />
            )}
        </group>
    );
}
