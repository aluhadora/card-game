import { useState } from 'react';
import './App.css'
import io from 'socket.io-client';
import ConnectionManager from './components/connectionManager';
import Golf from './components/golf/golf';

export default function App() {

    const params = new URLSearchParams(window.location.search);
    const searchTerm = params.get('pin');
    const [gameId, setGameId ] = useState(searchTerm || ""); 
    const [messages, setMessages] = useState([]);
    const [playerId, setPlayerId] = useState(null);
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState([]);
    const [started, setStarted] = useState(false);
    const [socket, setSocket] = useState(null);
    const [deltas, setDeltas] = useState([]); // For tracking game state changes if needed

    const addPlayer = (playerData) => {
        setMessages(messages => [...messages, playerData]);
        // Check if the player already exists
        const existingPlayer = players.find(player => player.id === playerData.id);
        if (existingPlayer) {
            console.log("Player already exists:", existingPlayer);
            return; // Player already exists, do not add again
        }
        setPlayers(players => [...players, playerData]);
    }

    const startGame = () => {
        socket.emit("start-game", { pin: gameId });
    }

    const gameStarted = (data) => {
        setMessages(messages => [...messages, data]);
        setDeltas([data]); // Store the initial state
        setStarted(true);
        console.log("Game has started!");
    }

    const getRoomState = async () => {
        const url = `${import.meta.env.VITE_HTTP_SERVER_URL || "/"}api/rooms/${gameId}`;
        console.log("Fetching room state from:", url);
        
        const response = await fetch(url);
        if (!response.ok) {
            console.log("Failed to fetch room state, response not ok:", response);
            throw new Error("Room not found or error in fetching state.");
        }

        const data = await response.json();
        console.log("roomstate", data);
        
        setDeltas([data.gameState]); 
        console.log("Fetched room state:", data);
        
        return data;
    }

    const joinGame = async (nickname, playerId, playerSecret) => {
        const serverUrl = import.meta.env.VITE_SERVER_URL || "/";
        console.log("server url", serverUrl);
        console.log("Joining game with ID:", gameId);

        localStorage.setItem("playerId", playerId);
        localStorage.setItem("playerSecret", playerSecret);
        localStorage.setItem("nickname", nickname);

        const socket = io(serverUrl);
        socket.on("connect", () => setPlayerId(playerId));

        socket.emit("player-joined", { pin: gameId, playerId: playerId, playerSecret: playerSecret, nickname: nickname });
        socket.on('room-joined', data => addPlayer(data));
        socket.on('game-started', gameStarted);
        socket.on('player-move', playerMoved);
        setConnected(true);
        setSocket(socket);

        const state = await getRoomState();
        if (state && state.roomstate !== "Lobby") {
            console.log("Game is not in Lobby state, starting game...");
            setStarted(true);
        } else {
            console.log("Game is in Lobby state, waiting for start...", state);
        }
    }

    const playerMoved = delta => {
        console.log("Player moved:", delta);
        setDeltas([delta]); // Store the new state
        setMessages(messages => [...messages, delta]);
    }

    const playerMove = moveData => {
        console.log("Moving", moveData);
        socket.emit("player-move", {...moveData, playerId: playerId, pin: gameId });
    }

    return (
        <div>
            <ConnectionManager gameId={gameId} setGameId={setGameId} joinGame={joinGame} players={players} playerId={playerId} connected={connected} started={started} startGame={startGame} />
            {started && <GameBoard playerMove={playerMove} players={players} state={deltas[0]} playerId={playerId} />}
        </div>
    )
}

function GameBoard({playerMove, state, playerId}) {
    if (!state) {
        return <div>Loading game state...</div>;
    }
    if (state.gameState === "GameOver") {
        console.log("Game Over state detected", state);
        return <div>
            Game Over! Thanks for playing!
            <br />
            {Object.values(state.players).map(player => (
                <div key={player.id}>
                    {player.nickname}: {player.score} points
                </div>
            ))}
            <Golf gameState={state} playerId={playerId} />
        </div>;
    }
    return <Golf gameState={state} playerMove={playerMove} playerId={playerId} />
}