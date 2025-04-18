export type CardData = {
    score: number;
    name: string;
}

export type AnimationDelta = {
    from: { left: number; top: number; width: number; height: number };
    to: { left: number; top: number; width: number; height: number };
    card: CardData | null;
}