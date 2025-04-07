import MoveValidator from "./moveValidator.js";

class Deck {
    constructor(numberOfDecks = 1) {
        const cardNames = ["spade_1", "spade_2", "spade_3", "spade_4", "spade_5", "spade_6", "spade_7", "spade_8", "spade_9", "spade_10", "spade_jack", "spade_queen", "spade_king",
            "heart_1", "heart_2", "heart_3", "heart_4", "heart_5", "heart_6", "heart_7", "heart_8", "heart_9", "heart_10", "heart_jack", "heart_queen", "heart_king",
            "club_1", "club_2", "club_3", "club_4", "club_5", "club_6", "club_7", "club_8", "club_9", "club_10", "club_jack", "club_queen", "club_king",
            "diamond_1", "diamond_2", "diamond_3", "diamond_4", "diamond_5", "diamond_6", "diamond_7", "diamond_8", "diamond_9", "diamond_10", "diamond_jack", "diamond_queen", "diamond_king",
            "joker_black", "joker_red"
        ];

        const decks = [];
        for (let i = 0; i < numberOfDecks; i++) {
            decks.push(...cardNames.map(name => ({ name, score: this.scoreCard(name) })));
        }

        // shuffle the deck
        this.shuffledDeck = decks.sort(() => Math.random() - 0.5);
    }

    scoreCard(cardName) {
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

    draw() {
        return this.shuffledDeck.pop() || null; // Return null if the deck is empty
    }

    length () {
        return this.shuffledDeck.length;
    }
}

export default class GolfGame {
    constructor() {
        this.players = {};
        this.gameState = "";
        this.currentPlayerId = null;
        this.discards = [];
        this.deck = new Deck(); // Initialize the deck
        this.moveValidator = new MoveValidator(this);
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
            ...extraData
        };
    }

    addPlayer(playerData) {
        const playerId = playerData.playerId || playerData.id;
        const playerName = playerData.nickname || playerData.name;

        if (!this.players[playerId]) {
            this.players[playerId] = {
                id: playerId,
                nickname: playerName,
                playArea: [null, null, null, null, null, null, null, null, null],
                score: 0,
                index: null,
                selectedCard: null
            };
        } else {
            console.log(`Player ${playerName} is already in the game. and has rejoined`);
        }
    }

    startGame() {
        this.gameState = "Opening";
        let index = 0;
        Object.values(this.players).forEach(player => {
            player.index = index++;
        });
        this.currentPlayerId = Object.values(this.players).find(player => player.index === 0).id;
        this.discards.push(this.deck.draw()); // Draw the first card from the deck to start the discard pile
        return this.visibleState();
    }

    scoreCard(cardName) {
        if (!cardName) return 0;
        if (cardName.score !== undefined) return cardName.score;

        if (!cardName) return 0;

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

    recalculateScore(player = null) {
        const currentPlayer = player || this.players[this.currentPlayerId];
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

    totalUnrevealedCards() {
        return Object.values(this.players).reduce((acc, player) => {
            return acc + player.playArea.filter(card => card === null).length;
        }, 0);
    }

    advancePlayer() {
        const allPlayers = Object.values(this.players);
        const currentPlayer = allPlayers.find(player => player.id === this.currentPlayerId);

        if (currentPlayer.selectedCard) {
            console.warn(`Player ${currentPlayer.nickname} has not cleared their selected card. Cannot advance player.`);
        }

        const currentIndex = currentPlayer.index;
        const nextIndex = (currentIndex + 1) % allPlayers.length || 0;

        const nextPlayer = allPlayers.find(player => player.index === nextIndex);
        this.currentPlayerId = nextPlayer.id;
        this.gameState = "FirstCard";

        // If the next player has no cards left, we need to check if the game is over
        if (nextPlayer.playArea.every(card => card !== null) || this.deck.length() <= this.totalUnrevealedCards()) {
            this.gameState = "GameOver";

            // Reveal all remaining cards
            Object.values(this.players).forEach(player => {
                player.playArea = player.playArea.map(card => card || this.deck.draw()); // Draw new cards for any empty slots
                this.recalculateScore(player);
            });
            console.log("Game Over! Scores:", this.players);
        }
    }

    openingStatePlayerMove(moveData) {
        const player = this.players[moveData.playerId];
        
        player.playArea[moveData.cardIndex] = this.deck.draw(); // Place the accepted card in the player's play area
        
        if (Object.values(this.players).every(player => player.playArea.filter(card => card !== null).length >= 2)) {
            this.gameState = "FirstCard";
        }

        this.recalculateScore(player); // Recalculate score after the move

        return this.visibleState({ delta: { from: `p${player.id}-${moveData.cardIndex}`, to: `p${player.id}-${moveData.cardIndex}`, card: player.playArea[moveData.cardIndex] } });
    }

    playerMove(moveData) {
        if (!this.moveValidator.validateMove(moveData)) {
            console.error("Invalid move data:", moveData);
            return this.visibleState(); // Return the current state if the move is invalid
        }

        if (this.gameState === "Opening") {
            return this.openingStatePlayerMove(moveData); // Handle opening state moves separately
        }   

        const currentPlayer = this.players[this.currentPlayerId];
        if (moveData.acceptCard) {
            const currentCardInSlot = currentPlayer.playArea[moveData.cardIndex];
                
            currentPlayer.playArea[moveData.cardIndex] = this.discards.pop(); // Place the accepted card in the player's play area
            if (currentCardInSlot) {
                this.discards.push(currentCardInSlot); // Return the replaced card to the discard pile
            } else {
                this.discards.push(this.deck.draw());
            }

            this.recalculateScore();
            this.advancePlayer();
        } else if (moveData.drawFromDeck) {
            // Player drew a card from the deck
            const drawnCard = this.deck.draw();
            if (!drawnCard) {
                console.error("No card to draw from deck!");
                return this.visibleState();
            }

            if (currentPlayer.selectedCard) {
                console.warn("Player already has a selected card. Cannot draw another one.");
                return this.visibleState();
            }

            currentPlayer.selectedCard = drawnCard;
            this.gameState = "SecondCard";
            return this.visibleState({ delta: { from: "deck-card", to: `p${currentPlayer.id}-selected`, card: drawnCard }});
        } else if (moveData.selectFromDiscard) {
            // Player selected a card from the discard pile
            const selectedCard = this.discards.pop(); // Draw the top card from the discard pile
            if (!selectedCard) {
                console.error("No card to draw from discard pile!");
                return this.visibleState();
            }

            currentPlayer.selectedCard = selectedCard; // Store the selected card for animation
            return this.visibleState({ delta: { from: "discard-pile", to: `p${currentPlayer.id}-selected`, card: selectedCard }});
        } else if (moveData.acceptSelectedCard) {
            // Player accepted the selected card
            if (!currentPlayer.selectedCard) {
                console.error("No selected card to accept!");
                return this.visibleState();
            }

            const currentCardInSlot = currentPlayer.playArea[moveData.cardIndex];
            currentPlayer.playArea[moveData.cardIndex] = currentPlayer.selectedCard; // Place the accepted card in the player's play area
            if (currentCardInSlot) {
                this.discards.push(currentCardInSlot); // Return the replaced card to the discard pile
            } else {
                this.discards.push(this.deck.draw());
            }
            
            currentPlayer.selectedCard = null; // Clear the selected card
            this.recalculateScore();
            this.advancePlayer();
            return this.visibleState({ deltas: [{ 
                from: `p${currentPlayer.id}-selected`, 
                to: `p${currentPlayer.id}-${moveData.cardIndex}`, 
                card: currentPlayer.playArea[moveData.cardIndex] 
            }, {
                from: `p${currentPlayer.id}-${moveData.cardIndex}`, 
                to: `discard-pile`, 
                card: this.discards.slice(-1)[0] 
            }]});
        } else if (moveData.declineSelectedCard) {
            // Player declined the selected card
            if (!currentPlayer.selectedCard) {
                console.error("No selected card to decline!");
                return this.visibleState();
            }

            this.discards.push(currentPlayer.selectedCard);
            currentPlayer.selectedCard = null;
            if (this.gameState !== "FirstCard") {
                this.recalculateScore();
                this.advancePlayer();
            }
            return this.visibleState({ delta: { from: `p${currentPlayer.id}-selected`, to: `discard-pile`, card: currentPlayer.selectedCard }});
        } else if (this.gameState === "FirstCard") {
            console.warn("I'm hoping this doesn't happen anymore")
            // Player declined the card, draw a new one
            const newCard = this.deck.draw();
            this.discards.push(newCard);
            this.gameState = "SecondCard";
        } else {
            this.advancePlayer();
        }

        return this.visibleState();
    }
}