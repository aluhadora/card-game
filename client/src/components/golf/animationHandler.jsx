import { useEffect, useRef } from "react";
import AnimationCard from "./animationCard";

export default function AnimationHandler({ animateCard, setAnimateCard, setAnimationRefs }) {
    const deckRef = useRef();
    const discardRef = useRef();
    const selectedCardRef = useRef();

    useEffect(() => {

        const move = (from, to, refs) => {
            setAnimateCard({
                from: from,
                to: to,
                card: refs.card,
                onAnimationComplete: refs.onAnimationComplete
            });
        }

        const toDiscard = (refs)  => {
            console.log("toDiscard called", refs.discardRef.current?.getBoundingClientRect(), refs.from);
            move(refs.from, refs.discardRef.current?.getBoundingClientRect(), refs);
        };

        const toSelected = (refs) => {
            move(refs.from, refs.selectedCardRef.current?.getBoundingClientRect(), refs);
        };

        const fromSelected = (refs) => {
            console.log("fromSelected called", refs.selectedCardRef.current?.getBoundingClientRect(), refs.to);
            move(refs.selectedCardRef.current?.getBoundingClientRect(), refs.to, refs);
        }

        setAnimationRefs({ deckRef, discardRef, selectedCardRef, toDiscard, fromSelected, toSelected});
    }, [setAnimateCard, setAnimationRefs]);
    
    if (!animateCard) return null;

    const completeAnimation = (animation) => {
        setAnimateCard(null);

        if (animation.onAnimationComplete) {
            animation.onAnimationComplete();
        }
    }

    return <AnimationCard from={animateCard.from} to={animateCard.to} onComplete={() => completeAnimation(animateCard)} card={animateCard.card} />
}