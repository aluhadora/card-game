import { useEffect, useState } from "react";
import Card from "../card";

export default function AnimationCard({ card, from, to, duration = 250, onComplete }) {

    console.log("AnimationCard from", from, "to", to, "duration", duration, "card", card);

    const initialStyle = {
        position: 'fixed',
        left: from?.left,
        top: from?.top,
        transition: `transform ${duration}ms ease-in-out`,
        transform: `translate(0px, 0px)`, 
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
        }, 0);

        return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }, [from, to]);

    const handleTransitionEnd = () => {
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