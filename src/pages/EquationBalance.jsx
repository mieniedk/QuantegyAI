import React, { useState, useCallback, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import qbotImg from '../assets/qbot.svg';
import useGameReturn from '../hooks/useGameReturn';

/* ═══════════════════════════════════════════════════════════
   EQUATION BALANCE
   A visual scale — tap number tiles to place on left or right
   side until both sides are equal. Algebraic reasoning (3.5B).
   ═══════════════════════════════════════════════════════════ */

const NAV_HEIGHT = 44;
const BOTTOM_BAR = 56;

let _ac = null;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.13) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  place: () => tone(440, 0.06, 'triangle', 0.1),
  remove: () => tone(330, 0.06, 'triangle', 0.08),
  balanced: () => {
    tone(523, 0.15); setTimeout(() => tone(659, 0.15), 90);
    setTimeout(() => tone(784, 0.2), 180); setTimeout(() => tone(1047, 0.25), 280);
  },
  wrong: () => { tone(300, 0.15, 'sawtooth', 0.1); setTimeout(() => tone(220, 0.2, 'sawtooth', 0.08), 100); },
  finish: () => { [523, 659, 784, 880, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2), i * 90)); },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function generatePuzzle(difficulty) {
  if (difficulty <= 3) {
    const a = randInt(2, 9), b = randInt(2, 9);
    const target = a + b;
    const tiles = [a, b];
    for (let i = 0; i < 3; i++) tiles.push(randInt(1, 9));
    return {
      leftFixed: [a], rightTarget: target, tiles: tiles.sort(() => Math.random() - 0.5),
      equation: `${a} + ? = ${target}`, answer: b,
      prompt: `Make both sides equal ${target}`,
      teks: '3.5B',
    };
  } else if (difficulty <= 6) {
    const a = randInt(3, 9), b = randInt(2, 9);
    const product = a * b;
    const tiles = [b];
    for (let i = 0; i < 4; i++) tiles.push(randInt(1, 9));
    return {
      leftFixed: [], rightTarget: product, leftLabel: `${a} × ?`,
      multiplier: a,
      tiles: tiles.sort(() => Math.random() - 0.5),
      equation: `${a} × ? = ${product}`, answer: b,
      prompt: `Find the missing factor: ${a} × ? = ${product}`,
      teks: '3.5B',
    };
  } else {
    const a = randInt(10, 30), b = randInt(5, 20), c = randInt(5, 20);
    const target = a + b;
    const tiles = [a, b, c];
    for (let i = 0; i < 3; i++) tiles.push(randInt(3, 25));
    return {
      leftFixed: [], rightTarget: target,
      tiles: tiles.sort(() => Math.random() - 0.5),
      equation: `? + ? = ${target}`, answer: target,
      prompt: `Pick tiles that add up to ${target}`,
      teks: '3.5B',
    };
  }
}

const TOTAL_ROUNDS = 10;

const EquationBalance = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');
  const { returnUrl, goBack, isEmbedded } = useGameReturn();

  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState(() => generatePuzzle(1));
  const [leftSide, setLeftSide] = useState([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isBalanced, setIsBalanced] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [tiltAngle, setTiltAngle] = useState(0);

  const leftTotal = (puzzle.leftFixed || []).reduce((s, v) => s + v, 0)
    + leftSide.reduce((s, v) => s + v, 0);
  const effectiveLeft = puzzle.multiplier ? (leftSide.length === 1 ? puzzle.multiplier * leftSide[0] : 0) : leftTotal;
  const rightTotal = puzzle.rightTarget;

  // Heavier side tilts down: left heavier → left down (negative rotation); right heavier → right down (positive rotation)
  const diff = effectiveLeft - rightTotal;
  const computedTilt = Math.max(-15, Math.min(15, -diff * 2));

  const addTile = (val, idx) => {
    if (submitted) return;
    SFX.place();
    if (puzzle.multiplier && leftSide.length >= 1) return;
    setLeftSide(prev => [...prev, val]);
  };

  const removeTile = (idx) => {
    if (submitted) return;
    SFX.remove();
    setLeftSide(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    setAttempts(a => a + 1);
    const balanced = effectiveLeft === rightTotal;
    setIsBalanced(balanced);

    setAnsweredQuestions(prev => [...prev, {
      question: puzzle.equation,
      correctAnswer: String(puzzle.answer),
      studentAnswer: puzzle.multiplier ? String(leftSide[0] || '?') : String(effectiveLeft),
      correct: balanced,
      teks: puzzle.teks,
    }]);

    if (balanced) {
      SFX.balanced();
      setScore(s => s + 100);
    } else {
      SFX.wrong();
    }
  };

  const handleNext = () => {
    const nextRound = round + 1;
    if (nextRound >= TOTAL_ROUNDS) {
      SFX.finish();
      setGameOver(true);
      saveGameResult('equation-balance', {
        score, total: TOTAL_ROUNDS * 100,
        percentage: Math.round((score / (TOTAL_ROUNDS * 100)) * 100),
        teksStandards: ['3.5B'],
        questions: answeredQuestions,
      }, { sid, aid, cid });
      return;
    }
    setRound(nextRound);
    setPuzzle(generatePuzzle(nextRound + 1));
    setLeftSide([]);
    setSubmitted(false);
    setIsBalanced(null);
  };

  const handleRetry = () => {
    setLeftSide([]);
    setSubmitted(false);
    setIsBalanced(null);
  };

  const resetGame = () => {
    setRound(0); setPuzzle(generatePuzzle(1));
    setLeftSide([]); setScore(0); setAttempts(0);
    setSubmitted(false); setIsBalanced(null);
    setGameOver(false); setShowReview(false);
    setAnsweredQuestions([]);
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview
          questions={answeredQuestions}
          score={score}
          total={TOTAL_ROUNDS * 100}
          gameTitle="Equation Balance"
          onPlayAgain={resetGame}
          continueUrl={returnUrl || undefined}
          continueLabel="Continue"
          onBack={isEmbedded ? undefined : () => navigate('/games')}
          backLabel="Back"
        />
      </div>
    );
  }

  const progress = (round / TOTAL_ROUNDS) * 100;
  const activeTilt = submitted ? (isBalanced ? 0 : computedTilt) : computedTilt;
  const hasBottomBar = !!returnUrl;
  const pct = gameOver ? Math.round((score / (TOTAL_ROUNDS * 100)) * 100) : 0;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(135deg,#0f172a,#1e1b4b,#0f172a)', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      {/* ── Top nav bar ── */}
      <div style={{
        flexShrink: 0, height: NAV_HEIGHT, padding: '0 16px', boxSizing: 'border-box',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!isEmbedded && <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>{'\u2190'} Back</Link>}
        <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: '#8b5cf6' }}>{'\u2696\uFE0F'} EQUATION BALANCE</div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 16, fontWeight: 900, color: '#8b5cf6' }}>{score}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div></div>
      </div>

      {/* ── Progress bar ── */}
      {!gameOver && (
        <div style={{ flexShrink: 0, height: 3, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#8b5cf6,#6366f1)', transition: 'width 0.4s' }} />
        </div>
      )}

      {/* ── Scrollable game area ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {gameOver ? (
          /* ── Game Over screen ── */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: 20 }}>
            <div style={{ background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)', maxWidth: 420, width: '92%', color: '#fff' }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>{'\u2696\uFE0F'}</div>
              <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#8b5cf6' }}>{pct >= 80 ? 'Balance Master!' : pct >= 50 ? 'Good Balance!' : 'Keep Trying!'}</h2>
              <QBotBubble msg="You balanced them all! QBot is proud!" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
                <div><div style={{ fontSize: 24, fontWeight: 900, color: '#8b5cf6' }}>{score}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Score</div></div>
                <div><div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{pct}%</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Accuracy</div></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={resetGame} style={btnS('#6366f1')}>Play Again</button>
                <button onClick={() => setShowReview(true)} style={btnS('#6366f1')}>Review Answers</button>
                {!returnUrl && !isEmbedded && <Link to="/games" style={{ ...btnS('#475569'), textDecoration: 'none', display: 'block' }}>Back</Link>}
              </div>
            </div>
          </div>
        ) : (
          /* ── Active game ── */
          <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px' }}>
            <div style={{ textAlign: 'center', marginBottom: 6, fontSize: 11, color: '#64748b' }}>Round {round + 1} / {TOTAL_ROUNDS}</div>

            {/* Prompt */}
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{puzzle.prompt}</div>
            </div>

            {/* Balance visual */}
            <div style={{ position: 'relative', height: 200, marginBottom: 16 }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '30px solid #475569' }} />
              <div style={{
                position: 'absolute', bottom: 28, left: '10%', right: '10%', height: 6,
                background: submitted && isBalanced ? 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)' : '#64748b',
                borderRadius: 3, transform: `rotate(${activeTilt}deg)`, transformOrigin: 'center',
                transition: 'transform 0.4s ease, background 0.3s ease',
                boxShadow: submitted && isBalanced ? '0 0 12px rgba(34,197,94,0.6)' : 'none',
              }}>
                <div style={{ position: 'absolute', left: -10, top: -70, width: 120, minHeight: 60, borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: `2px solid ${submitted && isBalanced ? '#22c55e' : '#3b82f6'}44`, display: 'flex', flexWrap: 'wrap', gap: 4, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
                  {(puzzle.leftFixed || []).map((v, i) => (
                    <div key={`fixed-${i}`} style={{ padding: '4px 10px', borderRadius: 6, background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 800 }}>{v}</div>
                  ))}
                  {puzzle.leftLabel && leftSide.length === 0 && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6' }}>{puzzle.leftLabel}</div>
                  )}
                  {leftSide.map((v, i) => (
                    <button key={i} onClick={() => removeTile(i)} style={{ padding: '4px 10px', borderRadius: 6, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 800, border: 'none', cursor: submitted ? 'default' : 'pointer' }}>{v}</button>
                  ))}
                  {leftSide.length === 0 && !puzzle.leftLabel && (puzzle.leftFixed || []).length === 0 && (
                    <div style={{ fontSize: 11, color: '#64748b' }}>Tap tiles {'\u2193'}</div>
                  )}
                  <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 16, fontWeight: 900, color: '#3b82f6' }}>
                    {effectiveLeft || '?'}
                  </div>
                </div>
                <div style={{ position: 'absolute', right: -10, top: -70, width: 120, minHeight: 60, borderRadius: 12, background: 'rgba(234,179,8,0.1)', border: `2px solid ${submitted && isBalanced ? '#22c55e' : '#eab308'}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#eab308' }}>{rightTotal}</div>
                  <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 16, fontWeight: 900, color: '#eab308' }}>{rightTotal}</div>
                </div>
                <div style={{ position: 'absolute', left: '50%', top: -45, transform: 'translateX(-50%)', fontSize: 24, fontWeight: 900, color: submitted ? (isBalanced ? '#22c55e' : '#ef4444') : '#475569' }}>
                  {submitted ? (isBalanced ? '=' : '\u2260') : '=?'}
                </div>
              </div>
            </div>

            {/* Available tiles */}
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Tap a tile to place it on the left side</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {puzzle.tiles.map((val, idx) => (
                  <button key={idx} onClick={() => addTile(val, idx)} disabled={submitted}
                    style={{
                      width: 48, height: 48, borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,255,255,0.12)',
                      color: '#e2e8f0', fontSize: 18, fontWeight: 800,
                      cursor: submitted ? 'default' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Game actions (no Continue here — it lives in the bottom bar) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 16 }}>
              {!submitted && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={handleCheck} disabled={leftSide.length === 0} style={{ ...btnS(leftSide.length === 0 ? '#475569' : '#8b5cf6'), opacity: leftSide.length === 0 ? 0.5 : 1 }}>Check Balance {'\u2696\uFE0F'}</button>
                  {leftSide.length > 0 && <button onClick={() => { setLeftSide([]); }} style={btnS('#475569')}>Clear</button>}
                  <button onClick={handleNext} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, cursor: 'pointer' }}>Skip</button>
                </div>
              )}
              {submitted && isBalanced && (
                <button onClick={handleNext} style={btnS('#22c55e')}>{round + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Equation \u2192'}</button>
              )}
              {submitted && !isBalanced && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button onClick={handleRetry} style={btnS('#f59e0b')}>Try Again</button>
                  <button onClick={handleNext} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'transparent', color: '#64748b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, cursor: 'pointer' }}>Skip</button>
                </div>
              )}
            </div>

            {submitted && isBalanced && (
              <div style={{
                textAlign: 'center', marginTop: 20, padding: '20px 24px', borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(22,163,74,0.15) 100%)',
                border: '2px solid rgba(34,197,94,0.6)', boxShadow: '0 0 30px rgba(34,197,94,0.3)',
                animation: 'balanceCelebrate 0.6s ease',
              }}>
                <div style={{ fontSize: 48, marginBottom: 8, animation: 'balancePop 0.5s ease 0.2s both' }}>{'\u2696\uFE0F\u2728'}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e', textShadow: '0 0 20px rgba(34,197,94,0.5)', marginBottom: 4 }}>
                  PERFECTLY BALANCED!
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#86efac' }}>You nailed it! +100 points</div>
              </div>
            )}
            {submitted && !isBalanced && (
              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, fontWeight: 700, color: '#ef4444', animation: 'fadeUp 0.3s ease' }}>
                Not balanced — try different tiles!
              </div>
            )}

            {/* Spacer so content isn't hidden behind bottom bar */}
            {hasBottomBar && <div style={{ height: BOTTOM_BAR + 8 }} />}
          </div>
        )}
      </div>

      {/* ── Bottom bar: Continue / Review (non-overlapping) ── */}
      {hasBottomBar && (
        <div style={{
          flexShrink: 0, height: BOTTOM_BAR, padding: '0 16px', boxSizing: 'border-box',
          display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        }}>
          {gameOver && (
            <button type="button" onClick={() => setShowReview(true)} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(245,158,11,0.2)', color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10,
            }}>Review</button>
          )}
          <LoopContinueButton fixed={false} onClick={goBack} label="Continue \u2192" />
        </div>
      )}

      <style>{`
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes balanceCelebrate { 0%{opacity:0;transform:scale(0.9);box-shadow:none} 50%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1);box-shadow:0 0 30px rgba(34,197,94,0.3)} }
        @keyframes balancePop { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
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

function btnS(bg) { return { padding: '12px 24px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, textAlign: 'center' }; }
export default EquationBalance;
