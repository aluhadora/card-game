import { expect, test } from '@jest/globals';
import calculateScore from '../server/golf/scoreService';

test('a row of the jacks zeros out the score', () => {
    const player = {
        id: '1',
        selectedCard: null,
        playArea: [
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 10, name: 'Jack of Diamonds', rank: 'J' },
            { score: 10, name: 'Jack of Clubs', rank: 'J' },
            { score: 1, name: 'Ace of Hearts', rank: 'A' },
            { score: 2, name: '2 of Diamonds', rank: '2' },
            { score: 3, name: '3 of Clubs', rank: '3' },
            { score: 4, name: '4 of Hearts', rank: '4' },
            { score: 5, name: '5 of Diamonds', rank: '5' },
            { score: 6, name: '6 of Clubs', rank: '6' },
        ],
        score: 0,
        nickname: '',
        index: 0,
    };

    const score = calculateScore(player);
    expect(score).toBe(21);  
});

test('a column of the jacks zeros out the score', () => {
    const player = {
        id: '1',
        selectedCard: null,
        playArea: [
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 1, name: 'Ace of Diamonds', rank: 'A' },
            { score: 2, name: '2 of Clubs', rank: '2' },
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 3, name: '3 of Diamonds', rank: '3' },
            { score: 4, name: '4 of Clubs', rank: '4' },
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 5, name: '5 of Diamonds', rank: '5' },
            { score: 6, name: '6 of Clubs', rank: '6' },
        ],
        score: 0,
        nickname: '',
        index: 0,
    };

    const score = calculateScore(player);
    expect(score).toBe(21);  
});

test('a row with jacks and 10s does not zero out the score', () => {
    const player = {
        id: '1',
        selectedCard: null,
        playArea: [
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 10, name: 'Jack of Diamonds', rank: 'J' },
            { score: 10, name: '10 of Clubs', rank: '10' },
            { score: 1, name: 'Ace of Hearts', rank: 'A' },
            { score: 2, name: '2 of Diamonds', rank: '2' },
            { score: 3, name: '3 of Clubs', rank: '3' },
            { score: 4, name: '4 of Hearts', rank: '4' },
            { score: 5, name: '5 of Diamonds', rank: '5' },
            { score: 6, name: '6 of Clubs', rank: '6' },
        ],
        score: 0,
        nickname: '',
        index: 0,
    };

    const score = calculateScore(player);
    expect(score).toBe(51);  
});

test('a column and a row with jacks zeros out the score without duplication', () => {
    const player = {
        id: '1',
        selectedCard: null,
        playArea: [
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 10, name: 'Jack of Diamonds', rank: 'J' },
            { score: 10, name: 'Jack of Clubs', rank: 'J' },
            { score: 10, name: 'Jack of Hearts', rank: 'J' },
            { score: 2, name: '2 of Diamonds', rank: '2' },
            { score: 3, name: '3 of Clubs', rank: '3' },
            { score: 10, name: 'Jack of Clubs', rank: 'J' },
            { score: 5, name: '5 of Diamonds', rank: '5' },
            { score: 6, name: '6 of Clubs', rank: '6' },
        ],
        score: 0,
        nickname: '',
        index: 0,
    };

    const score = calculateScore(player);
    expect(score).toBe(16);  
});