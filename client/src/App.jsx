import { useState } from 'react';
import './App.css'
import io from 'socket.io-client';
import ConnectionManager from './components/connectionManager';
import { animationTime } from './logic/animationConfiguration';
import MessagesPanel from './components/messagesPanel';
import GameBoard from './components/gameBoard';
import AnimationHandler from './games/common/components/animationHandler';

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

    const updateQuery = (newParams) => {
        const newUrl = `${window.location.pathname}?${newParams.toString()}`;
        window.history.pushState({}, '', newUrl);
    };
  
    const [animationDeltas, setAnimationDeltas] = useState([]);

    const addPlayer = (playerData) => {
        setMessages(messages => [...messages, {playerJoined: playerData}]);

        const existingPlayer = players.find(player => player.id === playerData.id);
        if (existingPlayer) {
            return; 
        }

        setPlayers(players => [...players, playerData]);
    }

    const startGame = (settings) => {
        socket.emit("start-game", { pin: gameId, ...settings });
    }

    const gameStarted = (data) => {
        setMessages(messages => [...messages, {gameStarted: data}]);
        setDeltas([data]); // Store the initial state
        setStarted(true);
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
        
        setDeltas([data.gameState]); 
        
        return data;
    }

    const joinGame = async (nickname, playerId, playerSecret) => {
        if (!gameId || !gameId.trim().length) {
            console.error("Game ID is not set. Cannot start game.");
            return;
        }

        const newParams = new URLSearchParams();
        newParams.set('pin', gameId);
        updateQuery(newParams);

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
        socket.on('message-received', messageReceived);

        setConnected(true);
        setSocket(socket);

        const state = await getRoomState();
        if (state && state.roomstate !== "Lobby") setStarted(true);

        socket.on('disconnect', () => {
            console.log("Disconnected from server");
            setConnected(false);
        });
    }

    const setState = state => {
        console.log("Setting state:", state);
        setDeltas([state]);
    }

    const playerMoved = state => {
        console.log("Player moved:", state);
        if (state.delta) {
            console.log("Handling animation delta:", state.delta);
            setAnimationDeltas(deltas => [...deltas, state.delta]);
            setTimeout(() => setState(state), animationTime + 50); 
        } else if (state.deltas) {
            console.log("Handling multiple deltas:", state.deltas);
            setAnimationDeltas(deltas => [...deltas, ...state.deltas]);
            setTimeout(() => setState(state), animationTime*state.deltas.length + 50); 
        } else {
            console.log("Skipping animation");
            setState(state); // Store the new state
        }

        setMessages(messages => [...messages, {playerMoved: state}]);
    }

    const sendMessage = (message) => {
        console.log("Sending message:", message);
        socket.emit("send-chat-message", { pin: gameId, playerId: playerId, message: message });
    }

    const messageReceived = (message) => {
        setMessages(messages => [...messages, {messageReceived: message}]);
    }

    const playerMove = moveData => {
        console.log("Moving", moveData);
        socket.emit("player-move", {...moveData, playerId: playerId, pin: gameId });
    }

    return (
        <div>
            <ConnectionManager gameId={gameId} setGameId={setGameId} joinGame={joinGame} players={players} playerId={playerId} connected={connected} started={started} startGame={startGame} />
            <GameBoard playerMove={playerMove} players={players} state={deltas[0]} playerId={playerId} started={started} />
            <AnimationHandler animationDeltas={animationDeltas} setAnimationDeltas={setAnimationDeltas} />
            <MessagesPanel messages={messages} sendMessage={sendMessage} />
        </div>
    )
}