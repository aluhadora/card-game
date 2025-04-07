import { useEffect, useState } from "react";
import AnimationCard from "./animationCard";

export default function AnimationHandler({animationDeltas, setAnimationDeltas }) {
    const [animateCard, setAnimateCard] = useState(null);


    useEffect(() => {
        if (!animationDeltas || animationDeltas.length === 0) return;
        const firstDelta = animationDeltas[0];
        const from = document.querySelector(`#${firstDelta.from}`)?.getBoundingClientRect();
        const to = document.querySelector(`#${firstDelta.to}`)?.getBoundingClientRect();

        if (!from || !to) {
            console.error("AnimationHandler: from or to element not found", { from, to }, firstDelta);
            setAnimationDeltas(animationDeltas.slice(1)); // Remove the first delta and continue
            return;
        }
        setAnimateCard({
            from: from,
            to: to,
            card: firstDelta.card
        });
        setTimeout(() => {
            setAnimateCard(null);
            setAnimationDeltas(animationDeltas.slice(1));
        }, 250);

    }, [setAnimateCard, animationDeltas, setAnimationDeltas]);
    
    if (!animateCard) return null;

    const completeAnimation = (animation) => {
        setAnimateCard(null);

        if (animation.onAnimationComplete) {
            animation.onAnimationComplete();
        }
    }

    return <AnimationCard from={animateCard.from} to={animateCard.to} onComplete={() => completeAnimation(animateCard)} card={animateCard.card} />
}