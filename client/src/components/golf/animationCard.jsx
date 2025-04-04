import { useEffect, useState } from "react";
import Card from "../card";

export default function AnimationCard({ card, from, to, duration = 500, onComplete }) {
    const [isAnimating, setIsAnimating] = useState(false);

    console.log("AnimationCard from", from, "to", to, "duration", duration, "card", card);
    // to = to.current.getBoundingClientRect();
    // from = from.current.getBoundingClientRect();

    const initialStyle = {
        position: 'fixed',
        left: from?.left,
        top: from?.top,
        transition: `transform ${duration}ms ease-in-out`,
        transform: `translate(0px, 0px)`, // Start at the initial position
        zIndex: 1000 // Ensure it's on top
    };

    const [style, setStyle] = useState(initialStyle);

    useEffect(() => {
        // Trigger the animation after the component mounts
        const timeout = setTimeout(() => {
            setStyle((prevStyle) => ({
                ...prevStyle,
                transform: `translate(${to?.left - from?.left}px, ${to?.top - from?.top}px)`
            }));
            setIsAnimating(true);
        }, 0);

        return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }, [from, to]);

    const handleTransitionEnd = () => {
        console.log("AnimationCard transition ended", onComplete);
        if (onComplete) onComplete();
    };

    return (
        <div
            className="animation-card"
            style={style}
            onTransitionEnd={handleTransitionEnd}
        >
            <Card card={card} />
        </div>
    );
}