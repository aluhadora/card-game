import { useState } from "react";

function InitialHeader({ gameId, setGameId, joinGame, nickname, setNickname }) {
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
            <button onClick={() => joinGame(nickname)}>Join Game</button>
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
    if (!players || !players.length) return <div>Loading...</div>;

    return <div>
        <h2>Connected to Game: {gameId} as {nickname}</h2>
        {Object.values(players[0].players).map((player, index) => (
            <PlayerDisplay player={player} key={index} />
        ))}
        <button onClick={startGame}>Start Game</button>
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