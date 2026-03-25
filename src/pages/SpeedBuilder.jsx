import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════
   SPEED BUILDER
   Build the target number using base-ten blocks!
   Click hundreds flats, tens rods, and ones cubes.
   Beat the clock for bonus points.
   ═══════════════════════════════════════════════════════════ */

let _ac = null;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.13) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  click: () => tone(600, 0.04, 'triangle', 0.1),
  remove: () => tone(400, 0.04, 'triangle', 0.06),
  correct: () => { tone(523, 0.1); setTimeout(() => tone(659, 0.1), 70); setTimeout(() => tone(784, 0.15), 140); },
  wrong: () => tone(250, 0.2, 'sawtooth', 0.08),
  tick: () => tone(800, 0.02, 'sine', 0.04),
  finish: () => { [523, 659, 784, 880, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2), i * 90)); },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function generateTarget() {
  const h = randInt(1, 9);
  const t = randInt(0, 9);
  const o = randInt(0, 9);
  const val = h * 100 + t * 10 + o;
  return { value: val, hundreds: h, tens: t, ones: o };
}

const TOTAL_ROUNDS = 10;
const TIME_PER_ROUND = 15;

const BLOCK_STYLES = {
  hundreds: { color: '#3b82f6', label: 'Hundreds', icon: '🟦', size: 56, unit: 100 },
  tens: { color: '#22c55e', label: 'Tens', icon: '🟩', size: 40, unit: 10 },
  ones: { color: '#f59e0b', label: 'Ones', icon: '🟨', size: 28, unit: 1 },
};

const SpeedBuilder = () => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');

  const [round, setRound] = useState(0);
  const [target, setTarget] = useState(() => generateTarget());
  const [blocks, setBlocks] = useState({ hundreds: 0, tens: 0, ones: 0 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_ROUND);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [totalTimeBonus, setTotalTimeBonus] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (submitted || gameOver) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        if (t <= 5) SFX.tick();
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [round, submitted, gameOver]);

  const currentValue = blocks.hundreds * 100 + blocks.tens * 10 + blocks.ones;

  const addBlock = (type) => {
    if (submitted) return;
    SFX.click();
    setBlocks(prev => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const removeBlock = (type) => {
    if (submitted || blocks[type] <= 0) return;
    SFX.remove();
    setBlocks(prev => ({ ...prev, [type]: prev[type] - 1 }));
  };

  const handleCheck = useCallback(() => {
    if (submitted) return;
    clearInterval(timerRef.current);
    setSubmitted(true);
    const correct = currentValue === target.value;
    setIsCorrect(correct);

    const timeBonus = correct ? timeLeft * 5 : 0;
    const baseScore = correct ? 100 : 0;

    setAnsweredQuestions(prev => [...prev, {
      question: `Build ${target.value}`,
      correctAnswer: `${target.hundreds}H ${target.tens}T ${target.ones}O`,
      studentAnswer: `${blocks.hundreds}H ${blocks.tens}T ${blocks.ones}O`,
      correct,
      teks: '3.2A',
    }]);

    if (correct) {
      SFX.correct();
      setScore(s => s + baseScore + timeBonus);
      setTotalTimeBonus(tb => tb + timeBonus);
    } else {
      SFX.wrong();
    }
  }, [submitted, currentValue, target, timeLeft, blocks]);

  // Auto-submit when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleCheck();
  }, [timeLeft, submitted, handleCheck]);

  const handleNext = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      SFX.finish();
      setGameOver(true);
      saveGameResult('speed-builder', {
        score, total: TOTAL_ROUNDS * 100 + TOTAL_ROUNDS * TIME_PER_ROUND * 5,
        percentage: Math.round((score / (TOTAL_ROUNDS * 175)) * 100),
        teksStandards: ['3.2A'],
        questions: answeredQuestions,
      }, { sid, aid, cid });
      return;
    }
    setRound(r => r + 1);
    setTarget(generateTarget());
    setBlocks({ hundreds: 0, tens: 0, ones: 0 });
    setTimeLeft(TIME_PER_ROUND);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const handleRetry = () => {
    setBlocks({ hundreds: 0, tens: 0, ones: 0 });
    setTimeLeft(TIME_PER_ROUND);
    setSubmitted(false);
    setIsCorrect(null);
  };

  const resetGame = () => {
    setRound(0); setTarget(generateTarget());
    setBlocks({ hundreds: 0, tens: 0, ones: 0 });
    setScore(0); setTimeLeft(TIME_PER_ROUND);
    setSubmitted(false); setIsCorrect(null);
    setGameOver(false); setShowReview(false);
    setAnsweredQuestions([]); setTotalTimeBonus(0);
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview questions={answeredQuestions} score={score} total={TOTAL_ROUNDS * 175} gameName="Speed Builder" onClose={() => setShowReview(false)} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={resetGame} style={btnS('#22c55e')}>Play Again</button>
          <Link to="/games" style={{ ...btnS('#6366f1'), textDecoration: 'none' }}>Back to Games</Link>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const pct = Math.round((score / (TOTAL_ROUNDS * 175)) * 100);
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#422006,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",system-ui,sans-serif' }}>
        <div style={{ background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)', maxWidth: 420, width: '92%', color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🧱</div>
          <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>{pct >= 70 ? 'Master Builder!' : pct >= 40 ? 'Good Building!' : 'Keep Building!'}</h2>
          <QBotBubble msg="Speed building champion! QBot is amazed! 🤖🏗️" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{score}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Score</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>{answeredQuestions.filter(q => q.correct).length}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Correct</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#3b82f6' }}>+{totalTimeBonus}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Time Bonus</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={resetGame} style={btnS('#22c55e')}>Play Again</button>
            <button onClick={() => setShowReview(true)} style={btnS('#6366f1')}>Review Answers</button>
            <Link to="/games" style={{ ...btnS('#475569'), textDecoration: 'none', display: 'block' }}>Back to Games</Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = (round / TOTAL_ROUNDS) * 100;
  const timerPct = (timeLeft / TIME_PER_ROUND) * 100;
  const timerColor = timeLeft <= 3 ? '#ef4444' : timeLeft <= 7 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#422006,#0f172a)', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: '#f59e0b' }}>🧱 SPEED BUILDER</div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 16, fontWeight: 900, color: '#f59e0b' }}>{score}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div></div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}><div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#f59e0b,#eab308)', transition: 'width 0.4s' }} /></div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px' }}>
        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Round {round + 1}/{TOTAL_ROUNDS}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', width: `${timerPct}%`, borderRadius: 3, background: timerColor, transition: 'width 1s linear, background 0.3s' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 900, color: timerColor, minWidth: 30, textAlign: 'right' }}>{timeLeft}s</span>
        </div>

        {/* Target number */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Build this number:</div>
          <div style={{
            fontSize: 52, fontWeight: 900, letterSpacing: 4,
            background: 'linear-gradient(135deg,#f59e0b,#eab308)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>{target.value}</div>
        </div>

        {/* Block workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
          {(['hundreds', 'tens', 'ones']).map(type => {
            const cfg = BLOCK_STYLES[type];
            const count = blocks[type];
            return (
              <div key={type} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                padding: '12px 8px', textAlign: 'center',
                border: `2px solid ${cfg.color}22`,
              }}>
                <div style={{ fontSize: 10, color: cfg.color, fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>{cfg.label}</div>
                {/* Visual blocks */}
                <div style={{ minHeight: 70, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'flex-end', marginBottom: 8 }}>
                  {Array.from({ length: count }).map((_, i) => (
                    <div key={i} style={{
                      width: type === 'hundreds' ? 32 : type === 'tens' ? 8 : 14,
                      height: type === 'hundreds' ? 32 : type === 'tens' ? 32 : 14,
                      borderRadius: type === 'ones' ? 3 : 2,
                      background: cfg.color,
                      opacity: 0.8,
                      animation: 'blockPop 0.2s ease',
                    }} />
                  ))}
                  {count === 0 && <div style={{ fontSize: 20, opacity: 0.2 }}>{cfg.icon}</div>}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: cfg.color, marginBottom: 8 }}>{count}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button onClick={() => removeBlock(type)} disabled={count === 0 || submitted} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 18, cursor: count === 0 || submitted ? 'default' : 'pointer', opacity: count === 0 ? 0.3 : 1 }}>−</button>
                  <button onClick={() => addBlock(type)} disabled={submitted} style={{ width: 32, height: 32, borderRadius: 8, background: cfg.color + '22', border: `1px solid ${cfg.color}44`, color: cfg.color, fontSize: 18, cursor: submitted ? 'default' : 'pointer', fontWeight: 800 }}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current total */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Your number: </span>
          <span style={{
            fontSize: 28, fontWeight: 900,
            color: currentValue === target.value ? '#22c55e' : '#f1f5f9',
            transition: 'color 0.2s',
          }}>{currentValue}</span>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
            ({blocks.hundreds}×100 + {blocks.tens}×10 + {blocks.ones}×1)
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
          {!submitted && (
            <button onClick={handleCheck} style={btnS(currentValue === 0 ? '#475569' : '#f59e0b')}>
              Check! ⚡
            </button>
          )}
          {submitted && isCorrect && (
            <button onClick={handleNext} style={btnS('#22c55e')}>
              {round + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Number →'}
            </button>
          )}
          {submitted && !isCorrect && (
            <button onClick={handleRetry} style={btnS('#f59e0b')}>Try Again 🔄</button>
          )}
        </div>

        {submitted && (
          <div style={{ textAlign: 'center', marginTop: 12, animation: 'fadeUp 0.3s ease' }}>
            {isCorrect ? (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                ✅ Perfect! {target.hundreds} hundreds + {target.tens} tens + {target.ones} ones = {target.value}
                {timeLeft > 0 && <span style={{ color: '#3b82f6', marginLeft: 6 }}>+{timeLeft * 5} time bonus!</span>}
              </div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
                ❌ Not quite — you built {currentValue} but the target is {target.value}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blockPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,255,0.05)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(0,245,255,0.1)', marginBottom: 12 }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0d1b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00f5ff', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

function btnS(bg) { return { padding: '12px 28px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, textAlign: 'center' }; }
export default SpeedBuilder;
