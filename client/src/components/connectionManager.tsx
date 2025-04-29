import { use, useEffect, useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import * as uuid from "uuid";
import React from "react";

function InitialHeader({ gameId, setGameId, joinGame, nickname, setNickname }) {
    const [playerId, setPlayerId] = useState(localStorage.getItem("playerId") || uuid.v4()); // Use uuid.v4() for generating a new player ID if not present
    const [playerSecret, setPlayerSecret] = useState(localStorage.getItem("playerSecret") || uuid.v4()); // Use uuid.v4() for generating a new player secret if not present

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
    return <div>
        <h4>{player.nickname}</h4>
    </div>
}

function LobbyHeader({ gameId, players, startGame, nickname }) {
    const url = `${window.location.origin}/?pin=${gameId}`
    if (!players || !Object.keys(players).length) return <div>Loading...</div>;

    return <div>
        <span>Connected to Game: {gameId} as {nickname}</span>
        {Object.values(players).map((player, index) => (
            <PlayerDisplay player={player} key={index} />
        ))}
        <button onClick={startGame}>Start Game</button>
        <div>
            <h3>Share this Game ID:</h3>
            <input type="text" value={url} readOnly style={{ width: "200px" }} />
            <p>Scan the QR code to join:</p>
            <QRCodeSVG value={url} />
        </div>
    </div>
}

function PostConnectionHeader({ gameId, players, startGame, started, nickname }) {
    const [gameSettings, setGameSettings] = useState({ decks: 1, gameType: "golf" });

    useEffect(() => {
        if (!players) return;
        setGameSettings(settings => ({ ...settings, decks: Math.round(Object.keys(players).length / 1)}));
    }, [players]);

    if (started || !players) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <LobbyHeader gameId={gameId} players={players} startGame={() => startGame(gameSettings)} nickname={nickname} />
            <div>
                <div>
                    <label>
                        Game Type:
                        <select value={gameSettings.gameType} onChange={e => setGameSettings({ ...gameSettings, gameType: e.target.value })}>
                            <option value="golf">Golf</option>
                            <option value="garbage">Garbage</option>
                        </select>
                    </label>
                </div>
                <div>
                    <label>
                        Number of Decks (recommended min: {Math.round(Object.keys(players).length / 1)}):
                        <input type='number' min={1} max={10} value={gameSettings.decks} onChange={e => setGameSettings({ ...gameSettings, decks: parseInt(e.target.value) })} />
                    </label>
                </div>
            </div>

        </div>
    );
}

export default function ConnectionManager({ gameId, setGameId, joinGame, players, connected, started, startGame }) {
    const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");

    if (!connected) return <InitialHeader gameId={gameId} setGameId={setGameId} joinGame={joinGame} nickname={nickname} setNickname={setNickname} />;
    return <PostConnectionHeader gameId={gameId} players={players.slice(-1)[0]?.players} startGame={startGame} started={started} nickname={nickname} />;
}