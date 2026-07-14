const CARD_NAMES = [
    "spade_1", "spade_2", "spade_3", "spade_4", "spade_5", "spade_6", "spade_7", "spade_8", "spade_9", "spade_10", "spade_jack", "spade_queen", "spade_king",
    "heart_1", "heart_2", "heart_3", "heart_4", "heart_5", "heart_6", "heart_7", "heart_8", "heart_9", "heart_10", "heart_jack", "heart_queen", "heart_king",
    "club_1", "club_2", "club_3", "club_4", "club_5", "club_6", "club_7", "club_8", "club_9", "club_10", "club_jack", "club_queen", "club_king",
    "diamond_1", "diamond_2", "diamond_3", "diamond_4", "diamond_5", "diamond_6", "diamond_7", "diamond_8", "diamond_9", "diamond_10", "diamond_jack", "diamond_queen", "diamond_king",
];

export type CardBase = {
    name: string;
    rank: string;
};

export default class Deck {
    shuffledDeck: CardBase[];

    constructor(numberOfDecks = 1, includeJokers = false) {
        const names = includeJokers ? [...CARD_NAMES, "joker_black", "joker_red"] : [...CARD_NAMES];

        const decks: CardBase[] = [];
        for (let i = 0; i < numberOfDecks; i++) {
            decks.push(...names.map(name => ({
                name,
                rank: name.split("_")[1],
            })));
        }

        this.shuffledDeck = decks.sort(() => Math.random() - 0.5);
        this.draw = this.draw.bind(this);
    }

    draw(): CardBase {
        const card = this.shuffledDeck.pop();
        if (!card) {
            console.error("No cards left in the deck to draw from!");
            return { name: "", rank: "" };
        }
        return card;
    }

    length(): number {
        return this.shuffledDeck.length;
    }
}
