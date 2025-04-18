import { useEffect, useState } from "react";
import Card from "./card";
import { animationTime } from "../../../logic/animationConfiguration";
import React from "react";
import { AnimationDelta, CardData } from "../types";

type AnimationCardProps = {
    animateCard: AnimationDelta | null;
    card: CardData | null;
    from?: { left: number; top: number; width: number; height: number } | null;
    to?: { left: number; top: number; width: number } | null;
    duration?: number;
}

export default function AnimationCard({ animateCard, card, from, to, duration = animationTime } : AnimationCardProps) {

    const initialStyle : React.CSSProperties = {
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
            transform: `translate(0px, 0px) scale(1)`, 
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
                    transform: `translate(${(to?.left || 0) - (from?.left || 0)}px, ${(to?.top || 0) - (from?.top || 0)}px) scale(${scale})`,
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
            <Card card={card} className={(from?.width || 0) > 25 ? "" : "small"}/>
        </div>
    );
}