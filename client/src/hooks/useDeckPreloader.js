import useImagePreloader from "./useImagePreloader";

function allImages() {
    const suits = ['club', 'diamond', 'heart', 'spade'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

    const cardImages = suits.flatMap(suit =>
        ranks.map(rank => `/images/cards/${suit}_${rank}.png`)
    );

    const miscImages = [
        '/images/cards/joker_black.png',
        '/images/cards/joker_red.png',
        '/images/cards/back.png',
    ];

    return [...cardImages, ...miscImages];
}

export default function useDeckPreloader() {
    const { imagesPreloaded } = useImagePreloader(allImages());

    return { imagesPreloaded };
}