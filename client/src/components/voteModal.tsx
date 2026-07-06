import React, { useEffect, useState, useRef } from 'react';

type VoteModalProps = {
    socket?: any;
    gameId?: string;
    onDismiss?: () => void;
};

export default function VoteModal({ socket, gameId, onDismiss }: VoteModalProps) {
    const [visible, setVisible] = useState(false);
    const [yesCount, setYesCount] = useState(0);
    const [noCount, setNoCount] = useState(0);
    const [required, setRequired] = useState(0);
    const [totalPlayers, setTotalPlayers] = useState(0);
    const [timeLeftMs, setTimeLeftMs] = useState(0);
    const [hasVoted, setHasVoted] = useState(false);
    const [myVote, setMyVote] = useState<boolean | null>(null);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!socket) return;

        const onVoteStarted = (payload: any) => {
            if (gameId && payload.pin !== gameId) return;
            setVisible(true);
            setRequired(payload.required || 1);
            setYesCount(payload.yesCount || 0);
            setNoCount(payload.noCount || 0);
            setTotalPlayers(payload.totalPlayers || 0);
            setTimeLeftMs(payload.timeoutMs || 0);

            if (timerRef.current) window.clearInterval(timerRef.current);
            const end = Date.now() + (payload.timeoutMs || 0);
            timerRef.current = window.setInterval(() => {
                const left = Math.max(0, end - Date.now());
                setTimeLeftMs(left);
                if (left <= 0 && timerRef.current) {
                    window.clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }, 1000) as any;
        };

        const onVoteUpdate = (payload: any) => {
            if (gameId && payload.pin !== gameId) return;
            setYesCount(payload.yesCount || 0);
            setNoCount(payload.noCount || 0);
            setRequired(payload.required || required);
            setTotalPlayers(payload.totalPlayers || totalPlayers);
        };

        const onVoteFailed = (payload: any) => {
            if (gameId && payload.pin !== gameId) return;
            setVisible(false);
            setHasVoted(false);
            setMyVote(null);
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (onDismiss) onDismiss();
        };

        const onExiting = (payload: any) => {
            if (gameId && payload.pin !== gameId) return;
            // navigate to home (server will already instruct)
            window.location.href = `/?pin=${payload.pin}`;
        };

        socket.on('vote-started', onVoteStarted);
        socket.on('vote-update', onVoteUpdate);
        socket.on('vote-failed', onVoteFailed);
        socket.on('exiting', onExiting);

        return () => {
            socket.off('vote-started', onVoteStarted);
            socket.off('vote-update', onVoteUpdate);
            socket.off('vote-failed', onVoteFailed);
            socket.off('exiting', onExiting);
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [socket, gameId]);

    const castVote = (vote: boolean) => {
        if (!socket || !gameId) return;
        socket.emit('vote-cancel', { pin: gameId, vote });
        setHasVoted(true);
        setMyVote(vote);
    };

    const dismiss = () => {
        setVisible(false);
        if (onDismiss) onDismiss();
    };

    if (!visible) return null;

    return (
        <div className="vote-modal" style={{ position: 'fixed', left: 0, right:0, top:0, bottom:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.4)'}}>
            <div style={{ background:'#333', padding:20, borderRadius:8, minWidth:320 }}>
                <h3>Cancel Game Vote</h3>
                <p><strong>Yes:</strong> {yesCount} / {required} required</p>
                <p><strong>No:</strong> {noCount} / {totalPlayers}</p>
                <p><strong>Time left:</strong> {Math.ceil(timeLeftMs/1000)}s</p>
                <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                    <button onClick={() => castVote(true)} disabled={hasVoted && myVote === true}>Yes</button>
                    <button onClick={() => castVote(false)} disabled={hasVoted && myVote === false}>No</button>
                    <button onClick={dismiss}>Dismiss</button>
                </div>
            </div>
        </div>
    );
}

