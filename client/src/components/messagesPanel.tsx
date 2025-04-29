import React, { useEffect, useState } from "react";

type PlayerJoinedMessage = {
    playerJoined: {
            playerId: string;
            name: string;
    };
}


function PlayerJoinedMessage({ message }: { message: PlayerJoinedMessage }) {
    return (
        <div className="message player-joined">
            Player {message.playerJoined.name} has joined the game.
        </div>
    );
}

type PlayerMovedMessage = {
    playerMoved: {
            playerId: string;
            moveType: string;
            cardIndex?: number;
    };
}

function PlayerMovedMessage({ message }: { message: PlayerMovedMessage }) {
    return (
        <div className="message player-moved">
            {message.playerMoved.playerId} made a move: {message.playerMoved.moveType}
            {message.playerMoved.cardIndex !== undefined && ` (Card Index: ${message.playerMoved.cardIndex})`}
        </div>
    );
}

type ChatMessage = {
    messageReceived: {
            playerId: string;
            message: string;
            nickname: string;
    };
}

function ChatMessage({ message }: { message: any }) {
    return (
        <div className="message chat-message">
            <span className="player">{message.messageReceived.nickname}: </span>
            <span className="content">{message.messageReceived.message}</span>
        </div>
    );
}

type GameStartedMessage = { 
    gameStarted: any;
}

function GameStartedMessage({ message } : { message: GameStartedMessage}) {
    return (
        <div className="message player-moved">
            Game has started
        </div>
    );
}

function Message({ message }: { message: any }) {
    if (message.playerJoined) {
        return <PlayerJoinedMessage message={message} />;
    } else if (message.playerMoved) {
        return <PlayerMovedMessage message={message} />;
    } else if (message.messageReceived) {
        return <ChatMessage message={message} />;
    } else if (message.gameStarted) {
        return <GameStartedMessage message={message} />;
    }

    return (
        <div className="message">
            {JSON.stringify(message)}
        </div>
    );
}

function Panel({ messages, sendMessage, showMessages }: { messages: any[]; sendMessage: (message: string) => void; showMessages: boolean }) {
    const [messageText, setMessageText] = useState<string>("");

    if (!showMessages) return null;

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        
        setMessageText("");

        sendMessage(event.currentTarget.value);
    }

    return (
        <div className="messages-panel">
            <div className="messages-list">
                {messages.map((message, index) => (
                        <Message key={index} message={message} />
                ))}
            </div>
                    
            <input type="text" value={messageText} placeholder="Type a message..." className="message-input" onChange={e => setMessageText(e.target.value)} onKeyUp={handleKeyUp}/>
        </div>
    );
}

export default function MessagesPanel({ messages, sendMessage }: { messages: any[]; sendMessage: (message: string) => void }) {
    const [showMessages, setShowMessages] = useState<boolean>(false);
    const [viewedMessages, setViewedMessages] = useState<any[]>(messages);

    if (!messages || messages.length === 0) return null;
    useEffect(() => {
        if (showMessages) {
            setViewedMessages(messages);
        }
        console.log(messages);
    });
    return (
        <>
            <div className={`messages-button ${showMessages ? "open" : "closed"} ${messages.length === viewedMessages.length ?"read" : "unread"}`} onClick={() => setShowMessages(!showMessages)}>
                ❯
            </div>
            <Panel messages={messages} sendMessage={sendMessage} showMessages={showMessages} />
        </>
    );
}
