import { useState } from 'react'
import './App.css'
import io from 'socket.io-client';
import ConnectionManager from './components/connectionManager';
import Golf from './components/golf/golf';

export default function App() {

    const [gameId, setGameId ] = useState("");
    const [messages, setMessages] = useState([]);
    const [playerId, setPlayerId] = useState(null);
    const [connected, setConnected] = useState(false);
    const [players, setPlayers] = useState([]);
    const [started, setStarted] = useState(false);
    const [socket, setSocket] = useState(null);
    const [deltas, setDeltas] = useState([]); // For tracking game state changes if needed

    const addPlayer = (playerData) => {
        setMessages(messages => [...messages, playerData]);
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

    const joinGame = (nickname) => {
        console.log("server url", import.meta.env.VITE_SERVER_URL);
        console.log("Joining game with ID:", gameId);
        const socket = io(import.meta.env.VITE_SERVER_URL || "/");
        socket.on("connect", () => setPlayerId(socket.id));

        socket.emit("player-joined", { pin: gameId, nickname: nickname });
        socket.on('room-joined', data => addPlayer(data));
        socket.on('game-started', gameStarted);
        socket.on('player-move', playerMoved);
        setConnected(true);
        setSocket(socket);
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
    return <Golf gameState={state} playerMove={playerMove} playerId={playerId} />
}