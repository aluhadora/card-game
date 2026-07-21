export type CardData = {
    name: string;
}

/**
 * How the animation handler should interpret a delta:
 * - `translate`: straight-line move between two anchors. Card orientation is
 *   fixed for the whole flight (face-up if `card` is known, face-down otherwise).
 * - `flip`: no translation; card rotates from face-down to face-up in place.
 *   Used for revealing a slot's hidden card.
 * - `revealTranslate`: translation plus a flip along the way. Card starts
 *   face-down at `from` and lands face-up at `to`.
 */
export type AnimationType = 'translate' | 'flip' | 'revealTranslate';

export type AnimationDelta = {
    from: string;
    to: string;
    card: CardData | null;
    /** Defaults to `translate` when omitted. */
    type?: AnimationType;
    /** Milliseconds into the current batch at which this delta starts. */
    delay?: number;
    /** Milliseconds this delta takes. Defaults to the global animation time. */
    duration?: number;
}
