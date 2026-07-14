import React, { useEffect, useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import * as uuid from "uuid";
import { GameTypes } from "../constants";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { ThemeProvider } from "@emotion/react";

type PlayersMap = Record<string, { playerId?: string; nickname?: string; socketIds?: string[]; playerSecret?: string }>;

type RoomJoinedEvent = {
    name: string;
    playerId: string;
    players: PlayersMap;
};

type ConnectionManagerProps = {
    gameId: string;
    setGameId: (id: string) => void;
    joinGame: (nickname: string, playerId: string, playerSecret: string) => void;
    players: RoomJoinedEvent[];
    playerId: string | null;
    connected: boolean;
    started: boolean;
    startGame: (settings: { decks: number; gameType: string }) => void;
};

type InitialHeaderProps = {
    gameId: string;
    setGameId: (id: string) => void;
    joinGame: (nickname: string, playerId: string, playerSecret: string) => void;
    nickname: string;
    setNickname: (n: string) => void;
};

function InitialHeader({ gameId, setGameId, joinGame, nickname, setNickname }: InitialHeaderProps) {
    const [playerId, setPlayerId] = useState<string>(localStorage.getItem("playerId") || uuid.v4()); // Use uuid.v4() for generating a new player ID if not present
    const [playerSecret, setPlayerSecret] = useState<string>(localStorage.getItem("playerSecret") || uuid.v4()); // Use uuid.v4() for generating a new player secret if not present

    return <div>
        <FormGroup>
            <FormControlLabel control={<TextField variant="outlined" size="small" value={gameId} onChange={e => setGameId(e.target.value)} />} label="Game ID: " labelPlacement="start" />
            <FormControlLabel control={<TextField variant="outlined" size="small" value={nickname} onChange={e => setNickname(e.target.value)} />} label="Nickname: " labelPlacement="start" />
            <FormControlLabel control={<TextField variant="outlined" size="small" value={playerId} onChange={e => setPlayerId(e.target.value)} />} label="Player ID: " labelPlacement="start" />
            <FormControlLabel control={<TextField variant="outlined" size="small" value={playerSecret} onChange={e => setPlayerSecret(e.target.value)} />} label="Secret: " labelPlacement="start" />
            <Button style={{ marginTop: 10 }} variant="contained" onClick={() => joinGame(nickname, playerId, playerSecret)}>Join Game</Button>
        </FormGroup>
    </div>
}

function PlayerDisplay({ player }: { player: { nickname?: string } }) {
    return <div>
        <h4>{player.nickname}</h4>
    </div>
}

function LobbyHeader({ gameId, players, startGame, nickname }: { gameId: string; players: PlayersMap; startGame: () => void; nickname: string }) {
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
            <TextField variant="outlined" size="small" value={url} style={{ width: "400px" }} slotProps={{ input: { readOnly: true } }} />
            <p>Scan the QR code to join:</p>
            <QRCodeSVG value={url} />
        </div>
    </div>
}

function PostConnectionHeader({ gameId, players, startGame, started, nickname }: { gameId: string; players: PlayersMap | undefined; startGame: (settings: { decks: number; gameType: string }) => void; started: boolean; nickname: string }) {
    const [gameSettings, setGameSettings] = useState<{ decks: number; gameType: string }>({ decks: 1, gameType: GameTypes.Golf });

    useEffect(() => {
        if (!players) return;
        setGameSettings(settings => ({ ...settings, decks: Math.round(Object.keys(players).length / 1) }));
    }, [players]);

    if (started || !players) return null;

    return (
        // <ThemeProvider theme={{ palette: { mode: "dark",  } }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "automatic" }}>
            <LobbyHeader gameId={gameId} players={players} startGame={() => startGame(gameSettings)} nickname={nickname} />
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <FormControlLabel control={
                    <TextField variant="outlined" size="small" select value={gameSettings.gameType} onChange={e => setGameSettings({ ...gameSettings, gameType: e.target.value })}>
                        {Object.values(GameTypes).map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </TextField>
                } label="Game Type: " labelPlacement="start" />
                <FormControlLabel control={
                    <TextField variant="outlined" size="small" type="number" slotProps={{ htmlInput: { min: 1, max: 10 } }} value={gameSettings.decks} onChange={e => setGameSettings({ ...gameSettings, decks: parseInt(e.target.value) })} />
                } label={`Number of Decks (recommended: ${Object.keys(players).length}):`} labelPlacement="start" />
            </div>

        </div>
        // </ThemeProvider>
    );
}

export default function ConnectionManager({ gameId, setGameId, joinGame, players, playerId, connected, started, startGame }: ConnectionManagerProps) {
    const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");

    if (!connected) return <InitialHeader gameId={gameId} setGameId={setGameId} joinGame={joinGame} nickname={nickname} setNickname={setNickname} />;
    const latestPlayers = players && players.length ? players[players.length - 1].players : undefined;
    return <PostConnectionHeader gameId={gameId} players={latestPlayers} startGame={startGame} started={started} nickname={nickname} />;
}