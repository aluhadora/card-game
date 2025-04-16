import React from "react";

type Card = {
    imageName?: string | undefined;
    value?: number | undefined;
    name?: string | undefined;
}

type CardProps = {
    card?: Card | null;
    onClick?: () => void;
    style?: React.CSSProperties;
    className?: string | null;
    active?: boolean | null;
    renderBackForNull?: boolean | null;
    id?: string | undefined;
};

export default function Card({ card, onClick, style, className, active, renderBackForNull = true, id } : CardProps) {
    if (!card) card = {imageName: renderBackForNull ? "back" : "card-base", value: 0};
    else if (card.name) card.imageName = card.name; 

    const cardName = card.imageName;
    return <div id={id} className={"card" + (className ? " " + className : "") + ( active ? " active" : "")}
        style={{backgroundImage: `url(/images/cards/${cardName}.png)`, ...style}}
        onClick={onClick}>
    </div>
}