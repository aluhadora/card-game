import { useEffect, useState } from "react";
import Card from "../card";
import { animationTime } from "../../logic/animationConfiguration";

export default function AnimationCard({ animateCard, card, from, to, duration = animationTime }) {

    const initialStyle = {
        position: 'absolute',
        left: from?.left,
        top: from?.top,
        width: from?.width,
        height: from?.height,
        transition: animateCard ? `transform ${duration}ms ease-in-out` : 'none',
        transform: `translate(0px, 0px)`, 
        display: 'none',
        opacity: 0,
        zIndex: 1000 // Ensure it's on top
    };

    const [style, setStyle] = useState(initialStyle);

    useEffect(() => {
        setStyle({
            position: 'fixed',
            left: from?.left,
            top: from?.top,
            width: from?.width,
            height: from?.height,
            transition: 'none',
            transform: `translate(0px, 0px)`, 
            // display: animateCard ? 'block' : 'none',
            display: 'block',
            opacity: 0,
            zIndex: 1000 // Ensure it's on top
        })

        // Trigger the animation after the component mounts
        const timeout = setTimeout(() => {
            const scale = to?.width && from?.width ? to.width / from.width : 1;
            setTimeout(() => {
                setStyle((prevStyle) => ({
                    ...prevStyle,
                    transform: `translate(0px, 0px) scale(1)`, 
                    transition: 'none',
                    display: 'block',
                    opacity: 0,
                    zIndex: -1000,
                }));
            }, duration);

            if (animateCard) {
                setStyle((prevStyle) => ({
                    ...prevStyle,
                    left: from?.left,
                    top: from?.top,
                    width: from?.width,
                    height: from?.height,
                    transition: animateCard ? `transform ${duration}ms ease-in-out` : 'none',
                    transform: `translate(${to?.left - from?.left}px, ${to?.top - from?.top}px) scale(${scale})`,
                    display: 'block',
                    opacity: 1
                }));
            }

        }, 0);

        return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }, [from, to, animateCard, duration]);

    return (
        <div
            className="animation-card"
            style={style}
        >
            <Card card={card} />
        </div>
    );
}