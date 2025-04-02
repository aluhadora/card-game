export default function Card({ card, onClick, style, className, active }) {
    console.log("Card", card);
    if (!card) card = {imageName: "back", value: 0};
    if (card.name) card.imageName = card.name; // For backward compatibility with old card objects  
    if (!card.imageName) {
        card = { imageName: card, value: 0 }; // Fallback for string input
        console.warn("Card imageName not found, using 'back' as default", card);
    }

    const cardName = card.imageName;
    console.log("Card Name:", cardName);
    return <div className={"card" + (className ? " " + className : "") + ( active ? " active" : "")} 
        style={{backgroundImage: `url(/images/cards/${cardName}.png)`, ...style}}
        onClick={onClick}>
        {/* <span className="card-value">{card.value > 0 ? card.value : "?"}</span> */}
    </div>
}