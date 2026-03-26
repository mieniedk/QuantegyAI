import React, { useState, useEffect, useRef } from 'react';
import { useGameSocket } from '../contexts/SocketContext';

/* ═══════════════════════════════════════════════════════════════
   LIVE GAME PLAYER — student joins a teacher's live game via PIN
   Real-time via WebSocket (Socket.IO) with localStorage fallback.
   ═══════════════════════════════════════════════════════════════ */

const LIVE_KEY = 'allen-ace-live-game';
const COLORS = ['#2563eb', '#dc2626', '#059669', '#ea580c'];
const SHAPES = ['◆', '▲', '●', '■'];

export default function LiveGamePlayer({ studentId, studentName }) {
  const [pin, setPin] = useState('');
  const [joined, setJoined] = useState(false);
  const [phase, setPhase] = useState('lobby');
  const [playerId, setPlayerId] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLimit, setTimeLimit] = useState(20);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [scores, setScores] = useState({});
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);
  const timerStartRef = useRef(null);
  const gs = useGameSocket();

  // WebSocket event listeners
  useEffect(() => {
    if (!gs.connected || !joined) return;

    const onJoined = ({ pin: p, playerId: pid, players: pl }) => {
      setPlayerId(pid);
      setPlayers(pl || []);
      setPlayerCount(pl?.length || 0);
    };
    const onPlayerJoined = ({ players: pl }) => {
      setPlayers(pl || []);
      setPlayerCount(pl?.length || 0);
    };
    const onPlayerLeft = ({ players: pl }) => {
      setPlayers(pl || []);
      setPlayerCount(pl?.length || 0);
    };
    const onQuestion = ({ index, total, question: q, options, timeLimit: tl }) => {
      setPhase('question');
      setQuestionIndex(index);
      setTotalQuestions(total);
      setQuestion({ question: q, options });
      setTimeLimit(tl || 20);
      setSelected(null);
      setAnswered(false);
      setShowAnswer(false);
      setCorrect(null);
      timerStartRef.current = Date.now();
    };
    const onReveal = ({ correct: c, scores: sc, answers }) => {
      setPhase('reveal');
      setShowAnswer(true);
      setCorrect(c);
      setScores(sc || {});
    };
    const onFinished = ({ scores: sc }) => {
      setPhase('finished');
      setScores(sc || {});
    };
    const onEnded = ({ scores: sc }) => {
      setPhase('finished');
      setScores(sc || {});
    };
    const onError = ({ error: e }) => {
      setError(e);
    };

    gs.on('game:joined', onJoined);
    gs.on('game:player-joined', onPlayerJoined);
    gs.on('game:player-left', onPlayerLeft);
    gs.on('game:question', onQuestion);
    gs.on('game:reveal', onReveal);
    gs.on('game:finished', onFinished);
    gs.on('game:ended', onEnded);
    gs.on('game:error', onError);

    return () => {
      gs.off('game:joined', onJoined);
      gs.off('game:player-joined', onPlayerJoined);
      gs.off('game:player-left', onPlayerLeft);
      gs.off('game:question', onQuestion);
      gs.off('game:reveal', onReveal);
      gs.off('game:finished', onFinished);
      gs.off('game:ended', onEnded);
      gs.off('game:error', onError);
    };
  }, [gs.connected, gs.on, gs.off, joined]);

  const handleJoin = () => {
    setError('');
    const trimmedPin = pin.trim();
    if (trimmedPin.length < 4) { setError('Enter a valid PIN.'); return; }

    if (gs.connected) {
      const pid = studentId || `p-${Date.now()}`;
      const pname = studentName || `Player`;
      gs.joinGame(trimmedPin, pname, pid);
      setPlayerId(pid);
      setJoined(true);
      setPhase('lobby');
    } else {
      // Fallback to localStorage
      try {
        const g = JSON.parse(localStorage.getItem(LIVE_KEY));
        if (!g || g.pin !== trimmedPin) { setError('Game not found. Check the PIN.'); return; }
        const pid = studentId || `p-${Date.now()}`;
        const pname = studentName || `Player ${(g.players || []).length + 1}`;
        if (!(g.players || []).find(p => p.id === pid)) {
          g.players = [...(g.players || []), { id: pid, name: pname }];
          localStorage.setItem(LIVE_KEY, JSON.stringify(g));
        }
        setPlayerId(pid);
        setJoined(true);
        setPhase('lobby');
        setPlayerCount(g.players.length);
      } catch (err) {
        console.warn('Join game failed:', err);
        setError('Error joining game.');
      }
    }
  };

  const handleAnswer = (option) => {
    if (answered || !question) return;
    setSelected(option); setAnswered(true);

    if (gs.connected) {
      const elapsed = (Date.now() - (timerStartRef.current || Date.now())) / 1000;
      const timeLeft = Math.max(0, timeLimit - elapsed);
      gs.submitAnswer(pin.trim(), playerId, option, timeLeft);
    } else {
      try {
        const g = JSON.parse(localStorage.getItem(LIVE_KEY));
        if (!g) return;
        const elapsed = (Date.now() - (g.questionStartedAt || Date.now())) / 1000;
        const timeLeft = Math.max(0, 15 - elapsed);
        g.answers = { ...(g.answers || {}), [playerId]: { answer: option, timeLeft } };
        localStorage.setItem(LIVE_KEY, JSON.stringify(g));
      } catch (err) {
        console.warn('Offline answer save failed:', err);
      }
    }
  };

  // ─── JOIN SCREEN ───
  if (!joined) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎮</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Live Game</h2>
        <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Enter the PIN shown on your teacher's screen.</p>
        {!gs.connected && <div style={{ color: '#f59e0b', fontSize: 11, marginBottom: 8, fontWeight: 600 }}>Offline mode — same-device only</div>}
        <input value={pin} onChange={e => setPin(e.target.value)} placeholder="Game PIN" maxLength={6}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          style={{ width: 200, textAlign: 'center', padding: '14px 20px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 24, fontWeight: 900, letterSpacing: 4, marginBottom: 12 }} />
        {error && <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{error}</div>}
        <div>
          <button type="button" onClick={handleJoin} disabled={pin.length < 4} style={{
            padding: '12px 32px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: pin.length >= 4 ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e2e8f0',
            color: pin.length >= 4 ? '#fff' : '#94a3b8', fontWeight: 900, fontSize: 16,
          }}>Join Game</button>
        </div>
      </div>
    );
  }

  // ─── LOBBY ───
  if (phase === 'lobby') {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⏳</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>You're in!</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>Waiting for the teacher to start the game...</p>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 16 }}>{playerCount} player{playerCount !== 1 ? 's' : ''} in lobby</div>
      </div>
    );
  }

  // ─── FINISHED ───
  if (phase === 'finished') {
    const myScore = (scores || {})[playerId] || 0;
    const sorted = Object.entries(scores || {}).sort((a, b) => b[1] - a[1]);
    const myRank = sorted.findIndex(([id]) => id === playerId) + 1;
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>Game Over!</h2>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#2563eb', marginBottom: 4 }}>{myScore.toLocaleString()} pts</div>
        <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          {myRank > 0 ? `${medals[myRank - 1] || `#${myRank}`} out of ${sorted.length} players` : ''}
        </div>
        <div style={{ maxWidth: 320, margin: '0 auto', textAlign: 'left' }}>
          {sorted.slice(0, 5).map(([id, score], i) => {
            const name = players.find(p => p.id === id)?.name || id;
            const isMe = id === playerId;
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: isMe ? '#eff6ff' : 'transparent', marginBottom: 4 }}>
                <span style={{ fontWeight: isMe ? 800 : 600, fontSize: 14, color: '#0f172a' }}>{medals[i] || `${i + 1}.`} {name}</span>
                <span style={{ fontWeight: 900, fontSize: 14, color: '#2563eb' }}>{score.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── REVEAL ───
  if (showAnswer && question) {
    const isCorrect = selected === correct;
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>{isCorrect ? '🎉' : '😅'}</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: isCorrect ? '#059669' : '#dc2626' }}>
          {isCorrect ? 'Correct response submitted' : answered ? 'Response not correct this round' : 'Timer ended before submission'}
        </h2>
        <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>The answer was <strong>{correct}</strong></div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 12 }}>Waiting for next question...</div>
      </div>
    );
  }

  // ─── ANSWERED ───
  if (answered) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Answer locked in!</h2>
        <p style={{ color: '#64748b', fontSize: 13 }}>Waiting for the timer to end...</p>
      </div>
    );
  }

  // ─── QUESTION ───
  if (question) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ textAlign: 'center', fontSize: 14, color: '#64748b', fontWeight: 700, marginBottom: 8 }}>Q{questionIndex + 1}/{totalQuestions}</div>
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 16, padding: '0 8px' }}>{question.question}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {question.options.map((opt, i) => (
            <button key={i} type="button" onClick={() => handleAnswer(opt)} style={{
              padding: '20px 14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: COLORS[i], color: '#fff', fontWeight: 900, fontSize: 22, textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 16, opacity: 0.7 }}>{SHAPES[i]}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Waiting...</div>;
}
