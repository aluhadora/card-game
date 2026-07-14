import { AddPlayerPayload, Game } from "../types";
import { GameStates } from "./constants.ts";
import MoveHandler from "./moveHandler.ts";
import calculateScore from "./scoreService.ts";
import { Card, Player, MoveData, MoveContext, MoveContextActions, StartGolfGamePayload } from "./types";
import Deck from "../deck/deck.ts";

export default class GolfGame implements Game {
    players: Record<string, Player>;
    gameState: string;
    currentPlayerId: string | null;
    discards: Card[];
    deck: Deck;
    moveHandler: MoveHandler;

    constructor() {
        this.players = {};
        this.gameState = "";
        this.currentPlayerId = null;
        this.discards = [];
        this.deck = new Deck(1, true); // Initialize the deck
        this.moveHandler = new MoveHandler();
    }

    allPlayers(): Player[] {
        return Object.values(this.players);
    }

    visibleState(extraData = {}) {
        return {
            currentPlayerId: this.currentPlayerId,
            gameState: this.gameState,
            players: this.players,
            discardPile: this.discards,
            remainingCards: this.deck.length() - this.totalUnrevealedCards(),
            deckLength: this.deck.length(),
            totalUnrevealedCards: this.totalUnrevealedCards(),
            gameType: "golf",
            ...extraData
        };
    }

    addPlayer(playerData: AddPlayerPayload) {
        const playerId = playerData.playerId;// || playerData.id;
        const playerName = playerData.nickname;// || playerData.name;

        if (!this.players[playerId]) {
            this.players[playerId] = {
                id: playerId,
                nickname: playerName,
                playArea: [null, null, null, null, null, null, null, null, null],
                score: 0,
                index: 0,
                selectedCard: null
            };
        } else {
            console.log(`Player ${playerName} is already in the game. and has rejoined`);
        }
    }

    startGame(settings: StartGolfGamePayload) {
        const allPlayers = this.allPlayers();
        this.gameState = GameStates.Opening;
        this.deck = new Deck(settings?.decks || 1, true); // Reset the deck for a new game
        let index = 0;
        allPlayers.forEach((player: Player) => {
            player.index = index++;
        });
        this.currentPlayerId = allPlayers.find((player: Player) => player.index === 0)?.id || null;

        const firstCard = this.deck.draw();

        if (firstCard) this.discards.push(firstCard); // Draw the first card from the deck to start the discard pile

        return this.visibleState();
    }

    scoreCard(card: Card | null): number {
        if (!card) return 0;
        if (card.name.startsWith("joker")) return -2;
        const value = card.name.split("_")[1];
        if (value === "jack") return 10;
        if (value === "queen") return -2;
        if (value === "king") return 0;
        return parseInt(value);
    }

    recalculateScore(player: Player | null) {
        const currentPlayer = player || this.players[this.currentPlayerId || 0];

        const score = calculateScore(currentPlayer);
        currentPlayer.score = score;
    }

    totalUnrevealedCards(): number {
        return this.allPlayers().reduce((acc: number, player: Player) => {
            return acc + player.playArea.filter(card => card === null).length;
        }, 0);
    }

    advancePlayer() {
        const allPlayers = this.allPlayers();
        const currentPlayer = allPlayers.find((player: Player) => player.id === this.currentPlayerId) || null;

        if (!currentPlayer) {
            console.warn("No current player found. Cannot advance player.");
            return;
        }

        if (currentPlayer.selectedCard) {
            console.warn(`Player ${currentPlayer.nickname} has not cleared their selected card. Cannot advance player.`);
        }

        const currentIndex = currentPlayer.index;
        const nextIndex = (currentIndex + 1) % allPlayers.length || 0;

        const nextPlayer = allPlayers.find(player => player.index === nextIndex);
        this.currentPlayerId = nextPlayer?.id || "";
        this.gameState = GameStates.FirstCard;

        // If the next player has no cards left, we need to check if the game is over
        if (nextPlayer?.playArea.every(card => card !== null) || this.deck.length() <= this.totalUnrevealedCards()) {
            this.gameState = GameStates.GameOver;

            // Reveal all remaining cards
            allPlayers.forEach(player => {
                player.playArea = player.playArea.map(card => card || this.deck.draw()); // Draw new cards for any empty slots
                this.recalculateScore(player);
            });
            console.log("Game Over! Scores:", this.players);
        }
    }

    advanceGameState(state: string) {
        console.log("Moving to state", state);
        if (this.gameState === GameStates.Opening) {
            if (this.allPlayers().every(player => player.playArea.filter(card => card !== null).length >= 2)) {
                console.log("Advancing", this.allPlayers());
                this.gameState = GameStates.FirstCard;
            }
        } else {
            this.gameState = state;
        }
        return this.visibleState();
    }

    playerMove(moveData: MoveData): any | undefined {
        const actions: MoveContextActions = {
            draw: this.deck.draw,
            recalculateScore: this.recalculateScore.bind(this),
            advancePlayer: this.advancePlayer.bind(this),
            gameState: this.advanceGameState.bind(this),
        };

        const context: MoveContext = {
            gameState: this.gameState,
            players: this.players,
            currentPlayerId: this.currentPlayerId || "",
            discards: this.discards,
            actions: actions
        }

        const delta = this.moveHandler.handleMove({ ...moveData, player: this.players[moveData.playerId] }, context);

        return this.visibleState(delta);
    }
}