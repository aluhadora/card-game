class Deck {
    constructor() {
        const cardNames = ["spade_1", "spade_2", "spade_3", "spade_4", "spade_5", "spade_6", "spade_7", "spade_8", "spade_9", "spade_10", "spade_jack", "spade_queen", "spade_king",
            "heart_1", "heart_2", "heart_3", "heart_4", "heart_5", "heart_6", "heart_7", "heart_8", "heart_9", "heart_10", "heart_jack", "heart_queen", "heart_king",
            "club_1", "club_2", "club_3", "club_4", "club_5", "club_6", "club_7", "club_8", "club_9", "club_10", "club_jack", "club_queen", "club_king",
            "diamond_1", "diamond_2", "diamond_3", "diamond_4", "diamond_5", "diamond_6", "diamond_7", "diamond_8", "diamond_9", "diamond_10", "diamond_jack", "diamond_queen", "diamond_king"
        ];
        const deck = cardNames.map((name) => ({ name, score: this.scoreCard(name) }));
        
        // shuffle the deck
        this.shuffledDeck = deck.sort(() => Math.random() - 0.5);
    }

    scoreCard(cardName) {
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

export default class GarbageGameState {
    constructor() {
        this.players = {};
        this.gameState = "";
        this.currentPlayerId = null;
        this.discards = [];
        this.deck = new Deck(); // Initialize the deck
    }

    visibleState() {
        return {
            currentPlayerId: this.currentPlayerId,
            gameState: this.gameState,
            players: this.players,
            discardPile: this.discards,
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
            };
        } else {
            console.log(`Player ${playerName} is already in the game. and has rejoined`);
        }
    }

    startGame() {
        this.gameState = "FirstCard";
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

    recalculateScore() {
        const currentPlayer = this.players[this.currentPlayerId];
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

    advancePlayer() {
        const allPlayers = Object.values(this.players);
        const currentPlayer = allPlayers.find(player => player.id === this.currentPlayerId);
        const currentIndex = currentPlayer.index;
        const nextIndex = (currentIndex + 1) % allPlayers.length || 0;

        console.log("NextIndex", nextIndex);
        const nextPlayer = allPlayers.find(player => player.index === nextIndex);
        this.currentPlayerId = nextPlayer.id;
        this.gameState = "FirstCard";
    }

    playerMove(moveData) {
        if (moveData.playerId !== this.currentPlayerId) {
            console.error(`It's not player ${moveData.playerId}'s turn! Current player is ${this.currentPlayerId}.`);
            return this.visibleState(); 
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

        } else if (this.gameState === "FirstCard") {
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