import React, { useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════
   FRACTION PIZZA MAKER
   Build a pizza by selecting the right fraction of slices.
   Visual fraction learning with pizza pies!
   ═══════════════════════════════════════════════════════════ */

let _ac = null;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.13) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  click: () => tone(500, 0.05, 'triangle', 0.1),
  correct: () => { tone(523, 0.1); setTimeout(() => tone(659, 0.1), 70); setTimeout(() => tone(784, 0.15), 140); },
  wrong: () => tone(250, 0.2, 'sawtooth', 0.08),
  finish: () => { [523, 659, 784, 880, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.2), i * 90)); },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const TOPPINGS = [
  { name: 'Pepperoni', color: '#dc2626', emoji: '🔴' },
  { name: 'Mushroom', color: '#78716c', emoji: '🍄' },
  { name: 'Olive', color: '#1e293b', emoji: '⚫' },
  { name: 'Pepper', color: '#16a34a', emoji: '🟢' },
  { name: 'Pineapple', color: '#eab308', emoji: '🟡' },
];

const FRACTION_LABELS = {
  '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
  '1/6': '⅙', '5/6': '⅚', '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
  '2/4': '²⁄₄', '2/6': '²⁄₆', '3/6': '³⁄₆', '4/6': '⁴⁄₆',
  '2/8': '²⁄₈', '4/8': '⁴⁄₈', '6/8': '⁶⁄₈',
};

function generateRound(difficulty) {
  const denominators = difficulty <= 3 ? [2, 4] : difficulty <= 6 ? [2, 3, 4, 6] : [2, 3, 4, 6, 8];
  const denom = denominators[randInt(0, denominators.length - 1)];
  let numer = randInt(1, denom - 1);
  const topping = TOPPINGS[randInt(0, TOPPINGS.length - 1)];
  const fracKey = `${numer}/${denom}`;
  const label = FRACTION_LABELS[fracKey] || `${numer}/${denom}`;

  const questionTypes = [
    { prompt: `Add ${topping.emoji} ${topping.name} to ${label} of the pizza`, type: 'select_slices' },
    { prompt: `The order says ${label} ${topping.name}. How many slices?`, type: 'select_slices' },
    { prompt: `A customer wants ${numer} out of ${denom} slices with ${topping.emoji}`, type: 'select_slices' },
  ];

  const qt = questionTypes[randInt(0, questionTypes.length - 1)];

  return {
    ...qt,
    numerator: numer,
    denominator: denom,
    fractionLabel: label,
    fractionKey: fracKey,
    topping,
    teks: denom <= 4 ? '3.3A' : '3.3C',
  };
}

const TOTAL_ROUNDS = 10;

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,255,0.05)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(0,245,255,0.1)', marginBottom: 12 }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0d1b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00f5ff', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const PizzaSlice = ({ index, total, selected, topping, onClick, showResult, isTarget }) => {
  const angle = (360 / total);
  const startAngle = index * angle - 90;
  const endAngle = startAngle + angle;
  const r = 110;
  const cx = 130, cy = 130;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = angle > 180 ? 1 : 0;

  const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;
  const toppingX = cx + r * 0.6 * Math.cos(midRad);
  const toppingY = cy + r * 0.6 * Math.sin(midRad);

  const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

  let fill = '#fbbf24';
  if (selected) fill = topping?.color || '#dc2626';
  if (showResult && selected && isTarget) fill = '#22c55e';
  if (showResult && selected && !isTarget) fill = '#ef4444';
  if (showResult && !selected && isTarget) fill = '#22c55e44';

  return (
    <g onClick={onClick} style={{ cursor: showResult ? 'default' : 'pointer' }}>
      <path d={path} fill={fill} stroke="#92400e" strokeWidth="2" opacity={selected ? 1 : 0.7} />
      {selected && topping && (
        <text x={toppingX} y={toppingY} textAnchor="middle" dominantBaseline="central" fontSize="16">
          {topping.emoji}
        </text>
      )}
    </g>
  );
};

const FractionPizza = () => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');

  const [round, setRound] = useState(0);
  const [puzzle, setPuzzle] = useState(() => generateRound(1));
  const [selectedSlices, setSelectedSlices] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [streak, setStreak] = useState(0);

  const targetCount = puzzle.numerator;

  const toggleSlice = (idx) => {
    if (submitted) return;
    SFX.click();
    setSelectedSlices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleCheck = () => {
    if (submitted) return;
    setSubmitted(true);
    const correct = selectedSlices.size === targetCount;
    setIsCorrect(correct);

    setAnsweredQuestions(prev => [...prev, {
      question: puzzle.prompt,
      correctAnswer: `${puzzle.numerator}/${puzzle.denominator} = ${puzzle.numerator} slices`,
      studentAnswer: `${selectedSlices.size}/${puzzle.denominator} = ${selectedSlices.size} slices`,
      correct,
      teks: puzzle.teks,
    }]);

    if (correct) {
      SFX.correct();
      setScore(s => s + 100);
      setStreak(s => s + 1);
    } else {
      SFX.wrong();
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      SFX.finish();
      setGameOver(true);
      saveGameResult('fraction-pizza', {
        score, total: TOTAL_ROUNDS * 100,
        percentage: Math.round((score / (TOTAL_ROUNDS * 100)) * 100),
        teksStandards: [...new Set(answeredQuestions.map(q => q.teks))],
        questions: answeredQuestions,
      }, { sid, aid, cid });
      return;
    }
    setRound(r => r + 1);
    setPuzzle(generateRound(round + 2));
    setSelectedSlices(new Set());
    setSubmitted(false);
    setIsCorrect(null);
  };

  const handleRetry = () => {
    setSelectedSlices(new Set());
    setSubmitted(false);
    setIsCorrect(null);
  };

  const resetGame = () => {
    setRound(0); setPuzzle(generateRound(1));
    setSelectedSlices(new Set()); setSubmitted(false);
    setIsCorrect(null); setScore(0); setGameOver(false);
    setShowReview(false); setAnsweredQuestions([]);
    setStreak(0);
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview questions={answeredQuestions} score={score} total={TOTAL_ROUNDS * 100} gameName="Fraction Pizza Maker" onClose={() => setShowReview(false)} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
          <button onClick={resetGame} style={btnS('#22c55e')}>Play Again</button>
          <Link to="/games" style={{ ...btnS('#6366f1'), textDecoration: 'none' }}>Back to Games</Link>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const pct = Math.round((score / (TOTAL_ROUNDS * 100)) * 100);
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#7c2d12,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",system-ui,sans-serif' }}>
        <div style={{ background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)', maxWidth: 420, width: '92%', color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🍕</div>
          <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#f97316' }}>{pct >= 80 ? 'Pizza Master Chef!' : pct >= 50 ? 'Good Cooking!' : 'Keep Practicing!'}</h2>
          <QBotBubble msg="Delicious fractions! QBot wants a slice! 🤖🍕" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#f97316' }}>{score}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Score</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{pct}%</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Accuracy</div></div>
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#7c2d12,#0f172a)', color: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: '#f97316' }}>🍕 FRACTION PIZZA</div>
        <div style={{ textAlign: 'right' }}><div style={{ fontSize: 16, fontWeight: 900, color: '#f97316' }}>{score}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div></div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}><div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#f97316,#eab308)', transition: 'width 0.4s' }} /></div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Order {round + 1} / {TOTAL_ROUNDS}</span>
          <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>{puzzle.teks}</span>
          {streak >= 2 && <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>🔥 {streak} streak</span>}
        </div>

        {/* Order prompt */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, marginBottom: 4 }}>🧾 ORDER</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>
            {puzzle.prompt}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 6 }}>
            The pizza has <strong style={{ color: '#fbbf24' }}>{puzzle.denominator}</strong> equal slices.
            Tap <strong style={{ color: '#fbbf24' }}>{puzzle.numerator}</strong> of them.
          </div>
        </div>

        {/* Pizza */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <svg width="260" height="260" viewBox="0 0 260 260">
              {/* Pizza base */}
              <circle cx="130" cy="130" r="115" fill="#92400e" />
              <circle cx="130" cy="130" r="112" fill="#fbbf24" opacity="0.3" />

              {/* Slices */}
              {Array.from({ length: puzzle.denominator }).map((_, i) => {
                const isTarget = i < puzzle.numerator;
                return (
                  <PizzaSlice
                    key={i} index={i} total={puzzle.denominator}
                    selected={selectedSlices.has(i)}
                    topping={puzzle.topping}
                    onClick={() => toggleSlice(i)}
                    showResult={submitted}
                    isTarget={isTarget}
                  />
                );
              })}

              {/* Center */}
              <circle cx="130" cy="130" r="12" fill="#92400e" stroke="#78350f" strokeWidth="2" />
            </svg>

            {/* Fraction display */}
            <div style={{
              position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(15,23,42,0.9)', borderRadius: 10, padding: '4px 14px',
              border: `2px solid ${submitted ? (isCorrect ? '#22c55e' : '#ef4444') : '#f97316'}44`,
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: submitted ? (isCorrect ? '#22c55e' : '#ef4444') : '#f97316' }}>
                {selectedSlices.size}/{puzzle.denominator}
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 6 }}>
                (need {puzzle.fractionLabel})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          {!submitted && (
            <>
              <button onClick={handleCheck} disabled={selectedSlices.size === 0}
                style={{ ...btnS(selectedSlices.size === 0 ? '#475569' : '#f97316'), opacity: selectedSlices.size === 0 ? 0.5 : 1 }}>
                Serve Pizza! 🍕
              </button>
              {selectedSlices.size > 0 && (
                <button onClick={() => setSelectedSlices(new Set())} style={btnS('#475569')}>Clear</button>
              )}
            </>
          )}
          {submitted && isCorrect && (
            <button onClick={handleNext} style={btnS('#22c55e')}>
              {round + 1 >= TOTAL_ROUNDS ? 'See Results' : 'Next Order →'}
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
                ✅ Perfect! {puzzle.fractionLabel} = {puzzle.numerator} out of {puzzle.denominator} slices!
              </div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444' }}>
                ❌ You selected {selectedSlices.size} slices, but {puzzle.fractionLabel} means {puzzle.numerator} slices.
              </div>
            )}
          </div>
        )}

        {/* Visual hint */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#64748b' }}>
            Tap slices to add {puzzle.topping.emoji} toppings. Tap again to remove.
          </div>
        )}
      </div>

      <style>{`@keyframes fadeUp { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
};

function btnS(bg) { return { padding: '12px 28px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, textAlign: 'center' }; }
export default FractionPizza;
