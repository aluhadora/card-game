import { Game } from "../types";
import { GameStates } from "./constants.ts";
import MoveHandler from "./moveHandler.ts";
import { Card, Player, MoveData, MoveContext, MoveContextActions } from "./types";

class Deck {
    shuffledDeck : Card[];

    constructor(numberOfDecks = 1) {
        const cardNames = ["spade_1", "spade_2", "spade_3", "spade_4", "spade_5", "spade_6", "spade_7", "spade_8", "spade_9", "spade_10", "spade_jack", "spade_queen", "spade_king",
            "heart_1", "heart_2", "heart_3", "heart_4", "heart_5", "heart_6", "heart_7", "heart_8", "heart_9", "heart_10", "heart_jack", "heart_queen", "heart_king",
            "club_1", "club_2", "club_3", "club_4", "club_5", "club_6", "club_7", "club_8", "club_9", "club_10", "club_jack", "club_queen", "club_king",
            "diamond_1", "diamond_2", "diamond_3", "diamond_4", "diamond_5", "diamond_6", "diamond_7", "diamond_8", "diamond_9", "diamond_10", "diamond_jack", "diamond_queen", "diamond_king",
            "joker_black", "joker_red"
        ];

        const decks : Card[] = [];
        for (let i = 0; i < numberOfDecks; i++) {
            decks.push(...cardNames.map(name => ({ name, score: this.scoreCard(name) })));
        }

        // shuffle the deck
        this.shuffledDeck = decks.sort(() => Math.random() - 0.5);
        this.draw = this.draw.bind(this);
    }

    scoreCard(cardName : string) : number {
        if (cardName.startsWith("joker")) return -2;

        const value = cardName.split("_")[1];
        if (value === "jack") {
            return 10;
        } else if (value === "queen" || value === "joker") {
            return -2;
        } else if (value === "king") {
            return 0;
        } else {
            return parseInt(value);
        }
    }

    draw() : Card {
        const card = this.shuffledDeck.pop();

        if (!card) {
            console.error("No cards left in the deck to draw from!");
            return { name: "", score: 0 };
        }

        return card;
    }

    length () {
        return this.shuffledDeck.length;
    }
    
}

export default class GolfGame implements Game {
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
        this.deck = new Deck(); // Initialize the deck
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
            gameType: "golf",
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
                playArea: [null, null, null, null, null, null, null, null, null],
                score: 0,
                index: 0,
                selectedCard: null
            };
        } else {
            console.log(`Player ${playerName} is already in the game. and has rejoined`);
        }
    }

    startGame(settings : {decks: number}) {
        const allPlayers = this.allPlayers();
        this.gameState = GameStates.Opening;
        this.deck = new Deck(settings?.decks || 1); // Reset the deck for a new game
        let index = 0;
        allPlayers.forEach((player : any) => {
            player.index = index++;
        });
        this.currentPlayerId = allPlayers.find((player : any) => player.index === 0)?.id || null;

        const firstCard = this.deck.draw();

        if (firstCard) this.discards.push(firstCard); // Draw the first card from the deck to start the discard pile

        return this.visibleState();
    }

    scoreCard(card : Card | null) : number {
        return card?.score || 0;
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

    advanceGameState(state : string) {
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

    playerMove(moveData : MoveData) : any | undefined {
        const actions : MoveContextActions = {
            draw: this.deck.draw,
            recalculateScore: this.recalculateScore.bind(this),
            advancePlayer: this.advancePlayer.bind(this),
            gameState: this.advanceGameState.bind(this),
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