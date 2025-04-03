export default function Card({ card, onClick, style, className, active }) {
    if (!card) card = {imageName: "back", value: 0};
    if (card.name) card.imageName = card.name; // For backward compatibility with old card objects  
    if (!card.imageName) {
        card = { imageName: card, value: 0 }; // Fallback for string input
    }

    const cardName = card.imageName;
    return <div className={"card" + (className ? " " + className : "") + ( active ? " active" : "")} 
        style={{backgroundImage: `url(/images/cards/${cardName}.png)`, ...style}}
        onClick={onClick}>
        {/* <span className="card-value">{card.value > 0 ? card.value : "?"}</span> */}
    </div>
}