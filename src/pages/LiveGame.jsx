import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import { getClassesByTeacher } from '../utils/storage';
import { GAMES_CATALOG } from '../data/games';
import { TEKS_STANDARDS } from '../data/teks';
import { useGameSocket } from '../contexts/SocketContext';

/* ═══════════════════════════════════════════════════════════════
   LIVE GAME MODE — Kahoot-style multiplayer quiz
   Teacher projects questions; students answer on their devices.
   Real-time via WebSocket (Socket.IO) with localStorage fallback.
   ═══════════════════════════════════════════════════════════════ */

const LIVE_KEY = 'allen-ace-live-game';
const QUESTION_TIME = 15;
const COLORS = ['#2563eb', '#dc2626', '#059669', '#ea580c'];
const SHAPES = ['◆', '▲', '●', '■'];

function generatePin() { return String(Math.floor(100000 + Math.random() * 900000)); }

function generateQuestions(grade, teks, count = 10) {
  const questions = [];
  const ops = {
    'grade3': [
      { q: (a, b) => `${a} × ${b}`, a: (a, b) => a * b, gen: () => [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1] },
      { q: (a, b) => `${a} + ${b}`, a: (a, b) => a + b, gen: () => [Math.floor(Math.random() * 500) + 100, Math.floor(Math.random() * 500) + 100] },
      { q: (a, b) => `${a} - ${b}`, a: (a, b) => a - b, gen: () => { const b = Math.floor(Math.random() * 200) + 50; return [b + Math.floor(Math.random() * 300) + 50, b]; } },
      { q: (a, b) => `${a * b} ÷ ${b}`, a: (a, b) => a, gen: () => [Math.floor(Math.random() * 10) + 1, Math.floor(Math.random() * 10) + 1] },
    ],
    'grade4': [
      { q: (a, b) => `${a} × ${b}`, a: (a, b) => a * b, gen: () => [Math.floor(Math.random() * 12) + 2, Math.floor(Math.random() * 100) + 10] },
      { q: (a, b) => `${a} + ${b}`, a: (a, b) => a + b, gen: () => [Math.floor(Math.random() * 5000) + 1000, Math.floor(Math.random() * 5000) + 1000] },
      { q: (a, b) => `What is ${a}% of ${b}?`, a: (a, b) => (a / 100) * b, gen: () => [{ 10: 10, 25: 25, 50: 50 }[['10', '25', '50'][Math.floor(Math.random() * 3)]] || 10, Math.floor(Math.random() * 20) * 10 + 20] },
    ],
    'grade5': [
      { q: (a, b) => `${a} × ${b}`, a: (a, b) => a * b, gen: () => [Math.floor(Math.random() * 99) + 10, Math.floor(Math.random() * 99) + 10] },
      { q: (a, b) => `${a} ÷ ${b}`, a: (a, b) => a / b, gen: () => { const b = Math.floor(Math.random() * 12) + 2; return [b * (Math.floor(Math.random() * 50) + 5), b]; } },
    ],
  };

  const pool = ops[grade] || ops['grade3'];

  for (let i = 0; i < count; i++) {
    const op = pool[Math.floor(Math.random() * pool.length)];
    const [a, b] = op.gen();
    const correct = op.a(a, b);
    const wrongSet = new Set();
    while (wrongSet.size < 3) {
      const offset = Math.floor(Math.random() * 20) - 10;
      const wrong = correct + (offset === 0 ? (Math.random() > 0.5 ? 1 : -1) : offset);
      if (wrong !== correct && wrong >= 0) wrongSet.add(wrong);
    }
    const options = [correct, ...wrongSet].sort(() => Math.random() - 0.5);
    questions.push({ id: i, question: op.q(a, b) + ' = ?', correct, options, teks: teks || '' });
  }
  return questions;
}

export default function LiveGame() {
  const username = localStorage.getItem('quantegy-teacher-user');
  const classes = username ? getClassesByTeacher(username) : [];
  const navigate = useNavigate();
  const gs = useGameSocket();

  const [phase, setPhase] = useState('setup');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('grade3');
  const [numQuestions, setNumQuestions] = useState(10);
  const [gamePin, setGamePin] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [players, setPlayers] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [answerCount, setAnswerCount] = useState(0);
  const timerRef = useRef(null);

  // WebSocket event listeners
  useEffect(() => {
    if (!gs.connected) return;

    const onPlayerJoined = ({ players: pl }) => {
      setPlayers(pl || []);
    };
    const onAnswerReceived = ({ answerCount: ac, totalPlayers }) => {
      setAnswerCount(ac);
    };
    const onReveal = ({ correct, scores: sc, answers: ans }) => {
      clearInterval(timerRef.current);
      setShowAnswer(true);
      setScores(sc || {});
      setAnswers(ans || {});
      setPhase('reveal');
    };
    const onFinished = ({ scores: sc }) => {
      clearInterval(timerRef.current);
      setScores(sc || {});
      setPhase('finished');
    };
    const onEnded = ({ scores: sc }) => {
      clearInterval(timerRef.current);
      setScores(sc || {});
      setPhase('finished');
    };

    gs.on('game:player-joined', onPlayerJoined);
    gs.on('game:player-left', ({ players: pl }) => setPlayers(pl || []));
    gs.on('game:answer-received', onAnswerReceived);
    gs.on('game:reveal', onReveal);
    gs.on('game:finished', onFinished);
    gs.on('game:ended', onEnded);

    return () => {
      gs.off('game:player-joined', onPlayerJoined);
      gs.off('game:answer-received', onAnswerReceived);
      gs.off('game:reveal', onReveal);
      gs.off('game:finished', onFinished);
      gs.off('game:ended', onEnded);
    };
  }, [gs.connected, gs.on, gs.off]);

  const startGame = () => {
    const pin = generatePin();
    const qs = generateQuestions(selectedGrade, '', numQuestions);
    setGamePin(pin); setQuestions(qs); setPhase('lobby'); setPlayers([]); setScores({});
    if (gs.connected) {
      gs.createGame(pin, qs, selectedGrade);
    }
    // Keep localStorage as fallback
    const game = { pin, phase: 'lobby', questions: qs, currentQ: 0, players: [], answers: {}, scores: {}, grade: selectedGrade };
    localStorage.setItem(LIVE_KEY, JSON.stringify(game));
  };

  const launchQuestion = useCallback(() => {
    setShowAnswer(false);
    setAnswers({});
    setAnswerCount(0);
    setTimer(QUESTION_TIME);
    setPhase('question');

    if (gs.connected) {
      gs.startQuestion(gamePin);
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); revealAnswer(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [currentQ, gamePin, gs.connected]);

  const revealAnswer = () => {
    clearInterval(timerRef.current);
    setShowAnswer(true);

    if (gs.connected) {
      gs.revealAnswer(gamePin);
    } else {
      // Fallback: local scoring
      const correct = questions[currentQ]?.correct;
      setScores(prev => ({ ...prev }));
      setPhase('reveal');
    }
  };

  const nextQuestion = () => {
    const next = currentQ + 1;
    if (next >= questions.length) {
      if (gs.connected) gs.endGame(gamePin);
      setPhase('finished');
      return;
    }
    setCurrentQ(next);
    setShowAnswer(false); setAnswers({}); setAnswerCount(0); setTimer(QUESTION_TIME);
    setPhase('question');

    if (gs.connected) {
      gs.nextQuestion(gamePin);
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); revealAnswer(); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    if (gs.connected) gs.endGame(gamePin);
    localStorage.removeItem(LIVE_KEY);
    setPhase('setup');
  };

  const q = questions[currentQ];
  const answeredCount = gs.connected ? answerCount : Object.keys(answers).length;
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const getPlayerName = (id) => {
    const p = players.find(pl => pl.id === id);
    return p ? p.name : id;
  };

  /* ── SETUP ── */
  if (phase === 'setup') {
    return (
      <TeacherLayout>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>🎮 Live Game Mode</h1>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 24 }}>Project on your board — students join and compete in real time!</p>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4, display: 'block' }}>Grade Level</span>
              <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} style={inputStyle}>
                <option value="grade3">Grade 3</option>
                <option value="grade4">Grade 4</option>
                <option value="grade5">Grade 5</option>
              </select>
            </label>

            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4, display: 'block' }}>Number of Questions</span>
              <select value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} style={inputStyle}>
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </label>

            <button type="button" onClick={startGame} style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 900, fontSize: 18,
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
            }}>🚀 Create Game</button>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  /* ── LOBBY ── */
  if (phase === 'lobby') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e3a8a,#7c3aed)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#fff' }}>
        <style>{`
          @keyframes livePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.8, marginBottom: 8 }}>Join at your device</div>
        <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 20 }}>Go to the student portal → Live Game → Enter PIN</div>

        <div style={{ background: '#fff', color: '#1e3a8a', borderRadius: 20, padding: '24px 48px', fontSize: 56, fontWeight: 900, letterSpacing: 8, marginBottom: 24, animation: 'livePulse 2s infinite', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {gamePin}
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
          {players.length === 0 ? 'Waiting for players...' : `${players.length} player${players.length > 1 ? 's' : ''} joined`}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600, marginBottom: 24 }}>
          {players.map((p, i) => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 10, fontWeight: 700, fontSize: 14, animation: `fadeUp 0.3s ${i * 0.05}s both` }}>
              {p.name}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => launchQuestion()} disabled={players.length === 0} style={{
            padding: '14px 36px', borderRadius: 12, border: 'none', cursor: players.length > 0 ? 'pointer' : 'default',
            background: players.length > 0 ? '#fff' : 'rgba(255,255,255,0.2)', color: players.length > 0 ? '#1e3a8a' : '#fff',
            fontWeight: 900, fontSize: 18, opacity: players.length > 0 ? 1 : 0.5,
          }}>▶ Start Game</button>
          <button type="button" onClick={endGame} style={{ padding: '14px 24px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    );
  }

  /* ── QUESTION / REVEAL ── */
  if (phase === 'question' || phase === 'reveal') {
    return (
      <div style={{ minHeight: '100vh', background: '#1e293b', display: 'flex', flexDirection: 'column', padding: 0 }}>
        <style>{`
          @keyframes timerPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
          @keyframes correctPop { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ color: '#94a3b8', fontSize: 14, fontWeight: 700 }}>Q{currentQ + 1}/{questions.length}</div>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: timer <= 5 ? '#dc2626' : timer <= 10 ? '#ca8a04' : '#059669',
            color: '#fff', fontWeight: 900, fontSize: 24,
            animation: timer <= 5 && !showAnswer ? 'timerPulse 0.5s infinite' : 'none',
          }}>{showAnswer ? '✓' : timer}</div>
          <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>{answeredCount}/{players.length} answered</div>
        </div>

        {/* Question */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 24px' }}>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 900, textAlign: 'center', marginBottom: 40, maxWidth: 700 }}>
            {q?.question}
          </div>

          {/* Answer grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 700, width: '100%' }}>
            {(q?.options || []).map((opt, i) => {
              const isCorrect = opt === q.correct;
              const bg = showAnswer ? (isCorrect ? '#059669' : 'rgba(255,255,255,0.05)') : COLORS[i];
              return (
                <div key={i} style={{
                  padding: '24px 20px', borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', gap: 14,
                  opacity: showAnswer && !isCorrect ? 0.3 : 1,
                  animation: showAnswer && isCorrect ? 'correctPop 0.3s ease' : 'none',
                  transition: 'opacity 0.3s',
                }}>
                  <span style={{ fontSize: 28, opacity: 0.7 }}>{SHAPES[i]}</span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{opt}</span>
                </div>
              );
            })}
          </div>

          {showAnswer && (
            <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              {currentQ < questions.length - 1 ? (
                <button type="button" onClick={nextQuestion} style={{
                  padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: '#2563eb', color: '#fff', fontWeight: 900, fontSize: 18,
                }}>Next Question →</button>
              ) : (
                <button type="button" onClick={() => { if (gs.connected) gs.endGame(gamePin); setPhase('finished'); }} style={{
                  padding: '14px 40px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', fontWeight: 900, fontSize: 18,
                }}>🏆 See Results</button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── FINISHED / PODIUM ── */
  if (phase === 'finished') {
    const podium = sortedScores.slice(0, 3);
    const rest = sortedScores.slice(3);
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1e3a8a,#7c3aed)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, color: '#fff' }}>
        <style>{`
          @keyframes podiumIn { from { transform: translateY(40px) scale(0.8); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          @keyframes confetti { 0% { transform: translateY(-10px) rotate(0); } 100% { transform: translateY(100vh) rotate(720deg); } }
        `}</style>

        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 32 }}>Game Over!</h1>

        {/* Podium */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', marginBottom: 32 }}>
          {[1, 0, 2].map((rank, i) => {
            const entry = podium[rank];
            if (!entry) return null;
            const heights = [160, 200, 120];
            return (
              <div key={rank} style={{
                textAlign: 'center', animation: `podiumIn 0.5s ${rank * 0.2}s both`,
              }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{medals[rank]}</div>
                <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>{getPlayerName(entry[0])}</div>
                <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>{entry[1].toLocaleString()} pts</div>
                <div style={{
                  width: 100, height: heights[rank], borderRadius: '12px 12px 0 0',
                  background: rank === 0 ? 'linear-gradient(to bottom,#fbbf24,#f59e0b)' : rank === 1 ? 'linear-gradient(to bottom,#94a3b8,#64748b)' : 'linear-gradient(to bottom,#f97316,#ea580c)',
                }} />
              </div>
            );
          })}
        </div>

        {/* Full leaderboard */}
        {rest.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, maxWidth: 400, width: '100%', marginBottom: 24 }}>
            {rest.map(([id, score], i) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < rest.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{i + 4}. {getPlayerName(id)}</span>
                <span style={{ fontWeight: 900, fontSize: 14 }}>{score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => { endGame(); startGame(); }} style={{
            padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: '#fff', color: '#1e3a8a', fontWeight: 900, fontSize: 15,
          }}>🔄 Play Again</button>
          <button type="button" onClick={endGame} style={{
            padding: '12px 28px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)',
            background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>← Back</button>
        </div>
      </div>
    );
  }

  return null;
}

const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' };
