export type CardData = {
    name: string;
}

export type AnimationDelta = {
    from: string;
    to: string;
    card: CardData | null;
}