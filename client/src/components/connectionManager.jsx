import { useState } from "react";
import { QRCodeSVG } from 'qrcode.react';

function InitialHeader({ gameId, setGameId, joinGame, nickname, setNickname }) {
    const [playerId, setPlayerId] = useState(localStorage.getItem("playerId") || crypto.randomUUID());
    const [playerSecret, setPlayerSecret] = useState(localStorage.getItem("playerSecret") || crypto.randomUUID());
    

    return <div>
        <div>
            <label>
                Game ID: 
                <input type='text' placeholder='Enter Game ID' value={gameId} onChange={e => setGameId(e.target.value)} />
            </label>
        </div>
        <div>
            <label>
                Nickname: 
                <input type='text' placeholder='Enter Name' value={nickname} onChange={e => setNickname(e.target.value)} />
            </label>
        </div>
        <div>
            <label>
                PlayerId: 
                <input type='text' placeholder='Enter Player ID' value={playerId} onChange={e => setPlayerId(e.target.value)} />
            </label>
        </div>
        <div>
            <label>
                Secret: 
                <input type='text' placeholder='Enter Secret' value={playerSecret} onChange={e => setPlayerSecret(e.target.value)} />
            </label>
        </div>
        <div>
            <button onClick={() => joinGame(nickname, playerId, playerSecret)}>Join Game</button>
        </div>
    </div>
}

function PlayerDisplay({ player }) {
    console.log("player display:", player);
    return <div>
        <h4>{player.nickname}</h4>
    </div>
}

function StartedHeader({ gameId, nickname }) {
    return <div>
        <h4>Connected to Game: {gameId} as {nickname}</h4>
    </div>
}

function LobbyHeader({ gameId, players, startGame, nickname }) {
    console.log("Players:", players);
    console.log("Players[0]:", players[0]);
    const url = `https://card-game-494d77369b6f.herokuapp.com/?pin=${gameId}`
    if (!players || !players.length) return <div>Loading...</div>;

    return <div>
        <span>Connected to Game: {gameId} as {nickname}</span>
        {Object.values(players[0].players).map((player, index) => (
            <PlayerDisplay player={player} key={index} />
        ))}
        <button onClick={startGame}>Start Game</button>
        <div>
            <h3>Share this Game ID:</h3>
            <input type="text" value={url} readOnly style={{ width: "200px" }} />
            <p>Scan the QR code to join:</p>
            <QRCodeSVG value={url}/>
        </div>
    </div>
}

function PostConnectionHeader({ gameId, players, startGame, started, nickname }) {
    if (started) return <StartedHeader gameId={gameId} nickname={nickname} />;
    return <LobbyHeader gameId={gameId} players={players} startGame={startGame} nickname={nickname} />;
}

function Header({ gameId, setGameId, connected, joinGame, players, startGame, started }) {
    const [nickname, setNickname] = useState("");

    if (!connected) return <InitialHeader gameId={gameId} setGameId={setGameId} joinGame={joinGame} nickname={nickname} setNickname={setNickname} />;
    return <PostConnectionHeader gameId={gameId} players={players} startGame={startGame} started={started} nickname={nickname} />;
}

export default function ConnectionManager({ gameId, setGameId, joinGame, players, connected, started, startGame }) {
    return <div>
        <Header gameId={gameId} setGameId={setGameId} joinGame={joinGame} players={players} connected={connected} started={started} startGame={startGame} />
    </div>
}