import { Game, StartGamePayload } from "../types";
import { GameStates } from "./constants.ts";
import { GameTypes } from "../constants.ts";
import MoveHandler from "./moveHandler.ts";
import { Card, Player, MoveData, MoveContext, MoveContextActions } from "./types";
import Deck from "../deck/deck.ts";

export default class GarbageGame implements Game {
    players: Record<string, Player>;
    gameState: string;
    currentPlayerId : string | null;
    discards: Card[];
    deck: Deck;
    moveHandler : MoveHandler;

    constructor() {
        this.players = {};
        this.gameState = "";
        this.currentPlayerId = null;
        this.discards = [];
        this.deck = new Deck(1); // Initialize the deck
        this.moveHandler = new MoveHandler();
    }

    allPlayers() : Player[] {
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
            gameType: GameTypes.Garbage,
            ...extraData
        };
    }

    addPlayer(playerData : any) {
        const playerId = playerData.playerId || playerData.id;
        const playerName = playerData.nickname || playerData.name;

        if (!this.players[playerId]) {
            this.players[playerId] = {
                id: playerId,
                nickname: playerName,
                playArea: [null, null, null, null, null, null, null, null, null, null],
                score: 0,
                index: 0,
                selectedCard: null
            };
        } else {
            console.log(`Player ${playerName} is already in the game. and has rejoined`);
        }
    }

    startGame(settings : StartGamePayload & { decks: number}) {
        const allPlayers = this.allPlayers();
        this.gameState = GameStates.Opening;
        this.deck = new Deck(settings?.decks || 1); // Reset the deck for a new game
        let index = 0;
        allPlayers.forEach((player : any) => {
            player.index = index++;
        });
        this.currentPlayerId = allPlayers.find((player : any) => player.index === 0)?.id || null;

        const firstCard = this.deck.draw();

        this.discards.push(firstCard); // Draw the first card from the deck to start the discard pile

        return this.visibleState();
    }

    scoreCard(card: Card | null): number {
        if (!card) return 0;
        const value = card.name.split("_")[1];
        if (value === "jack" || value === "queen") return -1;
        if (value === "king") return 0;
        return parseInt(value);
    }

    recalculateScore(player : Player | null) {
        const currentPlayer = player || this.players[this.currentPlayerId || 0];
        const hand = currentPlayer.playArea.map(card => this.scoreCard(card));
        
        let score = hand.reduce((acc, card) => {
            if (card) {
                return acc + card;
            }
            return acc;
        }, 0);

        // Zero out rows of same score
        for (let i = 0; i <= 2; i++) {
            if (hand[i*3] && hand[i*3] > 0 && (hand[i*3] === hand[i*3+1] && hand[i*3] === hand[i*3+2])) {
                score -= 3 * hand[i*3];
            }
        }

        // Zero out columns of same score
        for (let i = 0; i <= 2; i++) {
            if (hand[i] && hand[i] > 0 && (hand[i] === hand[i+3] && hand[i] === hand[i+6])) {
                score -= 3 * hand[i];
            }
        }

        currentPlayer.score = score;
    }

    totalUnrevealedCards() : number {
        return this.allPlayers().reduce((acc : number, player : Player) => {
            return acc + player.playArea.filter(card => card === null).length;
        }, 0);
    }

    advancePlayer() {
        const allPlayers = this.allPlayers();
        const currentPlayer = allPlayers.find((player : Player) => player.id === this.currentPlayerId) || null;

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
        if (allPlayers.every(player => player.roundOver)) {
            this.gameState = GameStates.GameOver;
            console.log("Game Over! All players have completed their rounds.");

            // Reveal all remaining cards
            allPlayers.forEach(player => {
                player.playArea = player.playArea.map(card => card || this.deck.draw()); // Draw new cards for any empty slots
                this.recalculateScore(player);
            });
            console.log("Game Over! Scores:", this.players);
            return;
        }

        if (nextPlayer?.roundOver) {
            this.advancePlayer();
            return;
        }

        this.currentPlayerId = nextPlayer?.id || "";

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

    playerMove(moveData : MoveData) : any | undefined {
        const actions : MoveContextActions = {
            draw: this.deck.draw,
            advancePlayer: this.advancePlayer.bind(this),
        };

        const context : MoveContext = {
            gameState: this.gameState,
            players: this.players,
            currentPlayerId: this.currentPlayerId || "",
            discards: this.discards,
            actions: actions
        }

        const delta = this.moveHandler.handleMove({...moveData, player: this.players[moveData.playerId]}, context);

        return this.visibleState(delta);
    }
}