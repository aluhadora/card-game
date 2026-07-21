import { Canvas } from "@react-three/fiber";
import PlayerArea from "./playerArea";
import Base from "./base";
import { Deck } from "./deck";
import { Stats } from "@react-three/drei";
import { CardPile } from "./cardPile";
import { GameState, MoveData, Player } from "../types";
import { GameStates, MoveTypes } from "../constants";
import { CardData, AnimationDelta } from "../../common/types";
import { AnimationRegistryProvider } from "./animationRegistry";
import AnimationHandler3d from "./animationHandler3d";
// Side-effect import: eagerly loads every card texture into the synchronous
// cache used by the 3D card components. Kicks off before the Canvas mounts
// so texture reads never block on Suspense (which would blank the scene).
import "./cardTextureCache";

function players(gameState: GameState, playerId: string): Player[] {
    const players = Object.values(gameState.players);
    const index = gameState.players[playerId]?.index || 0;

    return [...players.slice(index), ...players.slice(0, index)];
}

type GolfProps = {
    gameState: GameState | null;
    playerMove: (move: MoveData) => void;
    playerId: string;
    animationDeltas?: Array<AnimationDelta> | null;
    setAnimationDeltas?: React.Dispatch<
        React.SetStateAction<Array<AnimationDelta>>
    >;
    applyPendingState?: () => void;
};

function isActive(gameState: GameState, playerId: string): boolean {
    if (gameState.gameState === GameStates.GameOver) return false;

    if (gameState.gameState === GameStates.Opening) {
        return (
            gameState?.players[playerId]?.playArea.filter(
                (card) => card !== null,
            ).length < 2
        );
    }

    return gameState.currentPlayerId === playerId;
}

function GameOverHeader({ gameState }: { gameState: GameState | null }) {
    if (gameState?.gameState !== GameStates.GameOver) return null;

    return (
        <div>
            Game Over! Thanks for playing!
            <br />
            {Object.values(gameState.players).map((player) => (
                <div key={player.id}>
                    {player.nickname}: {player.score} points
                </div>
            ))}
        </div>
    );
}

function discardClick(
    gameState: GameState,
    playerMove: (move: MoveData) => void,
    selectedCard: CardData | null,
) {
    console.log("Discard clicked", { gameState, selectedCard });
    if (!gameState || gameState.gameState === GameStates.Opening) return;

    if (selectedCard) {
        playerMove({ moveType: MoveTypes.DeclineSelected });
        return;
    }

    if (gameState.gameState === GameStates.SecondCard) return;

    playerMove({ moveType: MoveTypes.SelectFromDiscard });
}

function deckClick(
    gameState: GameState,
    playerMove: (move: MoveData) => void,
    playerId: string,
) {
    const active = gameState.currentPlayerId === playerId;

    if (!gameState || gameState.gameState === GameStates.Opening || !active)
        return;

    playerMove({
        moveType:
            gameState.gameState === GameStates.FirstCard
                ? MoveTypes.DrawFromDeck
                : MoveTypes.DeclineSelected,
    });
}

export default function Golf3d({
    gameState,
    playerMove,
    playerId,
    animationDeltas,
    setAnimationDeltas,
    applyPendingState,
}: GolfProps) {
    if (!gameState) return;

    const sortedPlayers = players(gameState, playerId);

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                top: 0,
                left: 0,
                position: "absolute",
            }}
        >
            <Canvas
                style={{ height: "100vh", width: "100vw" }}
                camera={{ position: [0, 0, 20], far: 1000 }}
            >
                <AnimationRegistryProvider>
                    <ambientLight />
                    {/* <pointLight position={[10, 10, 100]} intensity={5000} /> */}
                    <Base />
                    <PlayerArea
                        position={[-20, 0, 0]}
                        isUs={true}
                        active={isActive(gameState!, playerId)}
                        playerMove={playerMove}
                        player={sortedPlayers[0]}
                        selectedCard={sortedPlayers[0].selectedCard}
                        gameState={gameState}
                    />
                    {/* <PlayerArea position={[5, 0, 0]} scale={0.5} /> */}
                    <Deck
                        position={[-8, 5, 0]}
                        remainingCards={52}
                        active={isActive(gameState!, playerId)}
                        deckClick={() =>
                            deckClick(gameState!, playerMove, playerId)
                        }
                    />
                    <CardPile
                        position={[-5, 5, 0]}
                        discardPile={gameState?.discardPile || []}
                        discardClick={() =>
                            discardClick(
                                gameState!,
                                playerMove,
                                sortedPlayers[0].selectedCard,
                            )
                        }
                    />
                    {setAnimationDeltas && (
                        <AnimationHandler3d
                            animationDeltas={animationDeltas ?? []}
                            setAnimationDeltas={setAnimationDeltas}
                            applyPendingState={applyPendingState}
                        />
                    )}
                    {/* <OrbitControls /> */}
                    <Stats />
                </AnimationRegistryProvider>
            </Canvas>
        </div>
    );
}
