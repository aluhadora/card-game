import { Card, Player } from "./types";

function areAllMyRowMatesEqual(i: number, hand: (Card | null)[]): boolean {
    if (!hand[i] || scoreCard(hand[i]) <= 0) return false;

    const row = Math.floor(i / 3);

    return hand[i].rank === hand[row * 3]?.rank
        && hand[i].rank === hand[row * 3 + 1]?.rank
        && hand[i].rank === hand[row * 3 + 2]?.rank;
}

function areAllMyColumnMatesEqual(i: number, hand: (Card | null)[]): boolean {
    if (!hand[i] || scoreCard(hand[i]) <= 0) return false;

    const column = i % 3;

    return hand[i].rank === hand[column]?.rank
        && hand[i].rank === hand[column + 3]?.rank
        && hand[i].rank === hand[column + 6]?.rank;
}

function scoreCard(card: Card | null): number {
    if (!card) return 0;
    if (card.name.startsWith("joker")) return -2;
    const value = card.name.split("_")[1];
    if (value === "jack") return 10;
    if (value === "queen") return -2;
    if (value === "king") return 0;
    return parseInt(value);
}

export default function calculateScore(player: Player) {
    const hand = player.playArea;

    let score = hand.reduce((acc, card) => {
        if (card) {
            return acc + scoreCard(card);
        }
        return acc;
    }, 0);

    for (let i = 0; i <= 9; i++) {
        // card i is in a row of identical cards or i is in a column of identical cards zero out it's score
        if (areAllMyRowMatesEqual(i, hand) || areAllMyColumnMatesEqual(i, hand)) {
            score -= scoreCard(hand[i]);
        }
    }

    return score;
}

