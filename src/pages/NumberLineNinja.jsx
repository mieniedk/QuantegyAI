import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════
   NUMBER LINE NINJA — with QBot Ninja & explanations
   ═══════════════════════════════════════════════════════════ */

const TOTAL_ROUNDS = 12;
const TOLERANCE = 0.06;
const CLOSE_TOLERANCE = 0.12;

/* ── Sound ── */
let _ac = null;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.13) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  place: () => tone(500, 0.08, 'triangle', 0.1),
  perfect: () => { tone(523, 0.1); setTimeout(() => tone(659, 0.1), 80); setTimeout(() => tone(784, 0.18), 160); },
  close: () => { tone(440, 0.1); setTimeout(() => tone(523, 0.12), 80); },
  wrong: () => { tone(300, 0.15, 'sawtooth', 0.1); setTimeout(() => tone(240, 0.2, 'sawtooth', 0.08), 100); },
  levelUp: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15, 'sine', 0.12), i * 70)); },
  slash: () => { tone(800, 0.05, 'sawtooth', 0.06); setTimeout(() => tone(1200, 0.08, 'sawtooth', 0.05), 40); },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

/* ── QBot dialogue ── */
const NINJA_GREETINGS = [
  "Let's go! QBot believes in you! 🤖",
  "Place it right on the number line! 🎯",
  "Trust your math skills! ⭐",
  "QBot is here to help — you got this! 💪",
];
const NINJA_PERFECT = [
  "PERFECT! QBot is impressed! 🎯",
  "Bullseye! You nailed it! ⭐",
  "Flawless placement! QBot is so proud! 🤖",
  "Dead center! Incredible precision! 💫",
];
const NINJA_CLOSE = [
  "Almost there! Keep going, you're so close! 💪",
  "So close! Your skills are growing! 📈",
  "Good aim! Just a tiny bit off! 🎯",
];
const NINJA_WRONG = [
  "Not quite — but that's OK! Let QBot show you! 📖",
  "Don't worry — every mistake is a lesson. Watch closely! 🔍",
  "Every mistake is a chance to learn. Here's how it works! 🧠",
];
const NINJA_TIPS = [
  "💡 Tip: The halfway point is your anchor!",
  "💡 Tip: Count the tick marks to estimate!",
  "💡 Tip: Think about which two ticks your number is between!",
];

function pickRandom(arr) { return arr[randInt(0, arr.length - 1)]; }

/* ── Explanation generators ── */
function explainFraction(q, placement) {
  const fracMap = { 0.25: ['¼', '1 out of 4'], 0.5: ['½', '1 out of 2'], 0.75: ['¾', '3 out of 4'], 0.333: ['⅓', '1 out of 3'], 0.667: ['⅔', '2 out of 3'], 0.2: ['⅕', '1 out of 5'], 0.4: ['⅖', '2 out of 5'], 0.6: ['⅗', '3 out of 5'], 0.8: ['⅘', '4 out of 5'] };
  const info = fracMap[q.answer] || [q.answerLabel, ''];
  const steps = [
    { icon: '📏', text: `The number line goes from 0 to 1.` },
    { icon: '🍕', text: `${info[0]} means ${info[1]} equal parts.` },
  ];
  if (q.answer === 0.5) steps.push({ icon: '📍', text: `½ is exactly in the MIDDLE of 0 and 1.` });
  else if (q.answer === 0.25) steps.push({ icon: '📍', text: `¼ is halfway between 0 and ½.` });
  else if (q.answer === 0.75) steps.push({ icon: '📍', text: `¾ is halfway between ½ and 1.` });
  else if (q.answer === 0.333) steps.push({ icon: '📍', text: `⅓ is to the LEFT of ½ — about 1/3 of the way.` });
  else if (q.answer === 0.667) steps.push({ icon: '📍', text: `⅔ is to the RIGHT of ½ — about 2/3 of the way.` });
  else steps.push({ icon: '📍', text: `${info[0]} sits at the ${Math.round(q.answer * 100)}% mark on the line.` });
  return steps;
}

function explainWholeNumber(q) {
  const target = q.answer;
  const mid = q.rangeMin + (q.rangeMax - q.rangeMin) / 2;
  const steps = [
    { icon: '📏', text: `The line goes from ${q.rangeMin} to ${q.rangeMax}.` },
    { icon: '🔢', text: `The halfway point is ${mid}.` },
  ];
  if (target < mid) steps.push({ icon: '👈', text: `${target} is LESS than ${mid}, so it goes on the LEFT half.` });
  else if (target > mid) steps.push({ icon: '👉', text: `${target} is MORE than ${mid}, so it goes on the RIGHT half.` });
  else steps.push({ icon: '📍', text: `${target} is exactly at the MIDDLE!` });
  const offset = target - q.rangeMin;
  const pct = Math.round((offset / (q.rangeMax - q.rangeMin)) * 100);
  steps.push({ icon: '🎯', text: `${target} is ${offset} above ${q.rangeMin} — about ${pct}% of the way across.` });
  return steps;
}

function explainRounding(q) {
  const mid = q.rangeMin + 50;
  const steps = [
    { icon: '📏', text: `${q.answerLabel} is between ${q.rangeMin} and ${q.rangeMax}.` },
    { icon: '⚖️', text: `The halfway point between them is ${mid}.` },
  ];
  if (q.answer > mid) steps.push({ icon: '👉', text: `${q.answerLabel} > ${mid}, so it's CLOSER to ${q.rangeMax}.` });
  else if (q.answer < mid) steps.push({ icon: '👈', text: `${q.answerLabel} < ${mid}, so it's CLOSER to ${q.rangeMin}.` });
  else steps.push({ icon: '📍', text: `${q.answerLabel} is exactly at ${mid} — we round UP!` });
  steps.push({ icon: '✅', text: `${q.answerLabel} rounds to ${q.roundTo} (nearest hundred).` });
  return steps;
}

function explainCompare(q) {
  const steps = [
    { icon: '📏', text: `Place both values on the number line.` },
  ];
  if (q.rangeMax <= 1) {
    steps.push({ icon: '📍', text: `${q.answerLabel} ≈ ${Math.round(q.answer * 100)}% | ${q.answerLabel2} ≈ ${Math.round(q.answer2 * 100)}%` });
  } else {
    steps.push({ icon: '📍', text: `${q.answerLabel} is at position ${q.answer} | ${q.answerLabel2} is at position ${q.answer2}` });
  }
  if (q.answer > q.answer2) {
    steps.push({ icon: '👉', text: `${q.answerLabel} is further RIGHT → ${q.answerLabel} > ${q.answerLabel2}` });
  } else if (q.answer < q.answer2) {
    steps.push({ icon: '👉', text: `${q.answerLabel2} is further RIGHT → ${q.answerLabel2} > ${q.answerLabel}` });
  }
  steps.push({ icon: '💡', text: `On a number line, values to the RIGHT are always GREATER!` });
  return steps;
}

function getExplanation(q, placement) {
  if (q.isCompare) return explainCompare(q);
  if (q.roundTo) return explainRounding(q);
  if (q.rangeMax <= 1) return explainFraction(q, placement);
  return explainWholeNumber(q);
}

/* ── Question generators ── */
function genFractionQ() {
  const fracs = [
    { val: 0.25, label: '¼' }, { val: 0.5, label: '½' }, { val: 0.75, label: '¾' },
    { val: 0.333, label: '⅓' }, { val: 0.667, label: '⅔' },
    { val: 0.2, label: '⅕' }, { val: 0.4, label: '⅖' }, { val: 0.6, label: '⅗' }, { val: 0.8, label: '⅘' },
  ];
  const f = fracs[randInt(0, fracs.length - 1)];
  return { prompt: `Place ${f.label} on the number line`, rangeMin: 0, rangeMax: 1, answer: f.val, answerLabel: f.label, teks: '3.3A', ticks: [0, 0.25, 0.5, 0.75, 1], tickLabels: { 0: '0', 0.25: '¼', 0.5: '½', 0.75: '¾', 1: '1' } };
}
function genWholeNumberQ() {
  const base = randInt(0, 8) * 100; const target = base + randInt(1, 9) * 10 + randInt(0, 9);
  const ticks = []; for (let t = base; t <= base + 100; t += 25) ticks.push(t);
  const tickLabels = {}; ticks.forEach(t => { tickLabels[t] = String(t); });
  return { prompt: `Place ${target} on the number line`, rangeMin: base, rangeMax: base + 100, answer: target, answerLabel: String(target), teks: '3.2D', ticks, tickLabels };
}
function genRoundingQ() {
  const n = randInt(100, 950); const roundedHundred = Math.round(n / 100) * 100;
  const base = Math.floor(n / 100) * 100;
  const ticks = [base, base + 25, base + 50, base + 75, base + 100];
  const tickLabels = {}; ticks.forEach(t => { tickLabels[t] = String(t); });
  return { prompt: `Place ${n} — which hundred is it closest to?`, rangeMin: base, rangeMax: base + 100, answer: n, answerLabel: String(n), roundTo: roundedHundred, teks: '3.2C', ticks, tickLabels };
}
function genCompareQ() {
  const base = randInt(1, 8) * 100; const a = base + randInt(10, 90); const b = base + randInt(10, 90);
  const ticks = [base, base + 25, base + 50, base + 75, base + 100];
  const tickLabels = {}; ticks.forEach(t => { tickLabels[t] = String(t); });
  return { prompt: `Place both ${a} and ${b} — which is greater?`, rangeMin: base, rangeMax: base + 100, answer: a, answer2: b, answerLabel: String(a), answerLabel2: String(b), teks: '3.2D', isCompare: true, ticks, tickLabels };
}
function genFractionCompareQ() {
  const pairs = [[{val:0.25,label:'¼'},{val:0.5,label:'½'}],[{val:0.333,label:'⅓'},{val:0.5,label:'½'}],[{val:0.25,label:'¼'},{val:0.75,label:'¾'}],[{val:0.333,label:'⅓'},{val:0.667,label:'⅔'}],[{val:0.2,label:'⅕'},{val:0.4,label:'⅖'}],[{val:0.5,label:'½'},{val:0.75,label:'¾'}]];
  const pair = pairs[randInt(0, pairs.length - 1)];
  const [a, b] = Math.random() > 0.5 ? pair : [pair[1], pair[0]];
  return { prompt: `Place ${a.label} and ${b.label} — which is greater?`, rangeMin: 0, rangeMax: 1, answer: a.val, answer2: b.val, answerLabel: a.label, answerLabel2: b.label, teks: '3.3A', isCompare: true, ticks: [0, 0.25, 0.5, 0.75, 1], tickLabels: { 0: '0', 0.25: '¼', 0.5: '½', 0.75: '¾', 1: '1' } };
}
function genFractionFromZeroQ() {
  const denoms = [2, 4, 8];
  const d = denoms[randInt(0, denoms.length - 1)];
  const n = randInt(1, d - 1);
  const val = n / d;
  const labelMap = { '1/2': '½', '1/4': '¼', '2/4': '²⁄₄', '3/4': '¾', '1/8': '⅛', '2/8': '²⁄₈', '3/8': '⅜', '4/8': '⁴⁄₈', '5/8': '⅝', '6/8': '⁶⁄₈', '7/8': '⅞' };
  const label = labelMap[`${n}/${d}`] || `${n}/${d}`;
  const ticks = [0];
  for (let i = 1; i < d; i++) ticks.push(i / d);
  ticks.push(1);
  const tickLabels = { 0: '0', 1: '1' };
  if (d <= 4) ticks.forEach(t => { if (t > 0 && t < 1) { const num = Math.round(t * d); tickLabels[t] = `${num}/${d}`; } });
  return { prompt: `Place ${label} as a distance from 0`, rangeMin: 0, rangeMax: 1, answer: val, answerLabel: label, teks: '3.7A', ticks, tickLabels };
}
function buildRounds() {
  return shuffle([genFractionQ, genFractionQ, genFractionFromZeroQ, genWholeNumberQ, genWholeNumberQ, genRoundingQ, genRoundingQ, genCompareQ, genFractionCompareQ, genFractionFromZeroQ, genWholeNumberQ, genRoundingQ, genCompareQ]).slice(0, TOTAL_ROUNDS).map(fn => fn());
}

/* ═══════════════════════════════════════════════════════════ */
const NumberLineNinja = () => {
  const [searchParams] = useSearchParams();
  const { returnUrl, goBack } = useGameReturn();
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');

  const [rounds, setRounds] = useState(() => buildRounds());
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [placement2, setPlacement2] = useState(null);
  const [placingSecond, setPlacingSecond] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ninjaMsg, setNinjaMsg] = useState(pickRandom(NINJA_GREETINGS));
  const [showExplanation, setShowExplanation] = useState(false);
  const [stars, setStars] = useState([]);

  const lineRef = useRef(null);
  const q = rounds[currentRound];
  const normalizedAnswer = (q.answer - q.rangeMin) / (q.rangeMax - q.rangeMin);
  const normalizedAnswer2 = q.answer2 != null ? (q.answer2 - q.rangeMin) / (q.rangeMax - q.rangeMin) : null;

  const spawnStars = () => {
    const newStars = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: randInt(20, 80), y: randInt(10, 50),
      rot: randInt(-30, 30), size: randInt(14, 22),
    }));
    setStars(newStars);
    setTimeout(() => setStars([]), 1200);
  };

  const getPositionFromEvent = useCallback((e) => {
    if (!lineRef.current) return null;
    const rect = lineRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (submitted) return;
    SFX.place();
    const pos = getPositionFromEvent(e);
    if (pos === null) return;
    setIsDragging(true);
    if (q.isCompare && placement !== null && !placingSecond) { setPlacingSecond(true); setPlacement2(pos); }
    else if (q.isCompare && placingSecond) { setPlacement2(pos); }
    else { setPlacement(pos); }
  }, [submitted, getPositionFromEvent, q, placement, placingSecond]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || submitted) return;
    const pos = getPositionFromEvent(e);
    if (pos === null) return;
    if (q.isCompare && placingSecond) setPlacement2(pos);
    else setPlacement(pos);
  }, [isDragging, submitted, getPositionFromEvent, q, placingSecond]);

  const handlePointerUp = useCallback(() => { setIsDragging(false); }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    return () => { window.removeEventListener('mousemove', handlePointerMove); window.removeEventListener('mouseup', handlePointerUp); window.removeEventListener('touchmove', handlePointerMove); window.removeEventListener('touchend', handlePointerUp); };
  }, [handlePointerMove, handlePointerUp]);

  const handleSubmit = () => {
    if (submitted || placement === null) return;
    if (q.isCompare && placement2 === null) return;
    SFX.slash();
    setSubmitted(true);
    const dist1 = Math.abs(placement - normalizedAnswer);
    let dist2 = 0;
    if (q.isCompare && normalizedAnswer2 !== null) dist2 = Math.abs(placement2 - normalizedAnswer2);
    const maxDist = q.isCompare ? Math.max(dist1, dist2) : dist1;
    let res;
    if (maxDist <= TOLERANCE) {
      res = 'perfect'; SFX.perfect();
      setScore(s => s + 100);
      setStreak(s => { const ns = s + 1; if (ns > bestStreak) setBestStreak(ns); return ns; });
      setNinjaMsg(pickRandom(NINJA_PERFECT));
      spawnStars();
    } else if (maxDist <= CLOSE_TOLERANCE) {
      res = 'close'; SFX.close();
      setScore(s => s + 50);
      setStreak(s => { const ns = s + 1; if (ns > bestStreak) setBestStreak(ns); return ns; });
      setNinjaMsg(pickRandom(NINJA_CLOSE));
    } else {
      res = 'wrong'; SFX.wrong();
      setStreak(0);
      setNinjaMsg(pickRandom(NINJA_WRONG));
    }
    setResult(res);
    setShowExplanation(true);

    const actualValue = q.rangeMin + placement * (q.rangeMax - q.rangeMin);
    setAnsweredQuestions(prev => [...prev, {
      question: q.prompt,
      correctAnswer: q.answerLabel + (q.answerLabel2 ? ` & ${q.answerLabel2}` : ''),
      studentAnswer: q.rangeMax <= 1 ? actualValue.toFixed(2) : Math.round(actualValue).toString(),
      correct: res === 'perfect' || res === 'close',
      teks: q.teks,
    }]);
  };

  const handleNext = () => {
    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setGameOver(true); SFX.levelUp();
      saveGameResult('number-line-ninja', { score, total: TOTAL_ROUNDS * 100, percentage: Math.round((score / (TOTAL_ROUNDS * 100)) * 100), teksStandards: [...new Set(answeredQuestions.map(a => a.teks))], questions: answeredQuestions }, { sid, aid, cid });
      return;
    }
    setCurrentRound(r => r + 1);
    setPlacement(null); setPlacement2(null); setPlacingSecond(false);
    setSubmitted(false); setResult(null); setShowExplanation(false);
    setNinjaMsg(streak >= 3 ? `🔥 ${streak}-hit combo! You're on fire!` : pickRandom([...NINJA_GREETINGS, ...NINJA_TIPS]));
  };

  const resetGame = () => {
    setRounds(buildRounds()); setCurrentRound(0); setScore(0);
    setStreak(0); setBestStreak(0); setGameOver(false);
    setShowReview(false); setAnsweredQuestions([]);
    setPlacement(null); setPlacement2(null); setPlacingSecond(false);
    setSubmitted(false); setResult(null); setShowExplanation(false);
    setNinjaMsg(pickRandom(NINJA_GREETINGS));
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview questions={answeredQuestions} score={score} total={TOTAL_ROUNDS * 100} gameName="Number Line Ninja" onClose={() => setShowReview(false)} />
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
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', border: pct >= 80 ? '3px solid #22c55e' : '2px solid rgba(255,255,255,0.1)', maxWidth: 420, width: '92%', color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '🎯'}</div>
          <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#22c55e' }}>{pct >= 80 ? 'Number Line Pro!' : pct >= 50 ? 'Great Effort!' : 'Keep Practicing!'}</h2>
          <NinjaQBot msg={pct >= 80 ? "QBot is SO proud of you! Amazing work! 🤖⭐" : "QBot says keep going — you're getting better! 💪"} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, marginBottom: 24 }}>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>{score}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Score</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{pct}%</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Accuracy</div></div>
            <div><div style={{ fontSize: 24, fontWeight: 900, color: '#8b5cf6' }}>{bestStreak}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Best Streak</div></div>
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

  const resultColor = result === 'perfect' ? '#22c55e' : result === 'close' ? '#fbbf24' : result === 'wrong' ? '#ef4444' : null;
  const progressPct = (currentRound / TOTAL_ROUNDS) * 100;
  const explanation = submitted ? getExplanation(q, placement) : [];

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: FONT, position: 'relative', overflow: 'hidden' }}>
      {/* Floating ninja stars */}
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'fixed', left: `${s.x}%`, top: `${s.y}%`,
          fontSize: s.size, transform: `rotate(${s.rot}deg)`,
          animation: 'starFly 1s ease-out forwards', pointerEvents: 'none', zIndex: 50,
        }}>⭐</div>
      ))}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        )}
        <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: 1.5, color: '#22c55e' }}>🤖 NUMBER LINE NINJA</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#22c55e' }}>{score}</div>
          <div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div>
        </div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}><div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg,#22c55e,#10b981)', transition: 'width 0.4s' }} /></div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '12px 16px' }}>
        {/* QBot Ninja */}
        <NinjaQBot msg={ninjaMsg} streak={streak} />

        {/* Round info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Round {currentRound + 1} / {TOTAL_ROUNDS}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 700 }}>{q.teks}</span>
            {streak >= 2 && <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700, animation: 'pulse 0.6s ease infinite' }}>🔥 {streak} combo!</span>}
          </div>
        </div>

        {/* Question */}
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.4 }}>{q.prompt}</div>
          {q.isCompare && !submitted && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>
              {!placement ? `Tap the line to place ${q.answerLabel}` : !placingSecond ? `Good! Now tap to place ${q.answerLabel2}` : `Drag to adjust ${q.answerLabel2}`}
            </div>
          )}
          {!q.isCompare && !submitted && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>Tap or drag on the number line</div>}
        </div>

        {/* Number Line */}
        <div style={{ position: 'relative', padding: '36px 24px 56px', userSelect: 'none' }}>
          <div ref={lineRef} onMouseDown={handlePointerDown} onTouchStart={handlePointerDown}
            style={{ position: 'relative', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)', cursor: submitted ? 'default' : 'crosshair' }}>

            {q.ticks.map(t => {
              const norm = (t - q.rangeMin) / (q.rangeMax - q.rangeMin);
              return (
                <div key={t} style={{ position: 'absolute', left: `${norm * 100}%`, top: -8, transform: 'translateX(-50%)' }}>
                  <div style={{ width: 2, height: 22, background: 'rgba(255,255,255,0.25)', margin: '0 auto' }} />
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textAlign: 'center', marginTop: 4, whiteSpace: 'nowrap' }}>{q.tickLabels[t] || ''}</div>
                </div>
              );
            })}

            {/* Player marker 1 */}
            {placement !== null && (
              <div style={{ position: 'absolute', left: `${placement * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', zIndex: 10, transition: isDragging ? 'none' : 'left 0.15s' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: submitted ? (result === 'perfect' || result === 'close' ? '#22c55e' : '#ef4444') : '#3b82f6', border: '3px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff', animation: submitted ? (result === 'perfect' ? 'bounceIn 0.4s ease' : '') : '' }}>
                  {q.isCompare ? '1' : '🤖'}
                </div>
              </div>
            )}

            {/* Player marker 2 */}
            {q.isCompare && placement2 !== null && (
              <div style={{ position: 'absolute', left: `${placement2 * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', zIndex: 10, transition: isDragging ? 'none' : 'left 0.15s' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: submitted ? (result === 'perfect' || result === 'close' ? '#22c55e' : '#ef4444') : '#f59e0b', border: '3px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>2</div>
              </div>
            )}

            {/* Correct answer */}
            {submitted && (
              <div style={{ position: 'absolute', left: `${normalizedAnswer * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', zIndex: 5, animation: 'popIn 0.3s ease' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e33', border: '2px dashed #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#22c55e' }}>✓</div>
                <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#22c55e', whiteSpace: 'nowrap' }}>{q.answerLabel}</div>
              </div>
            )}
            {submitted && normalizedAnswer2 !== null && (
              <div style={{ position: 'absolute', left: `${normalizedAnswer2 * 100}%`, top: '50%', transform: 'translate(-50%,-50%)', zIndex: 5, animation: 'popIn 0.3s ease' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#22c55e33', border: '2px dashed #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#22c55e' }}>✓</div>
                <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#22c55e', whiteSpace: 'nowrap' }}>{q.answerLabel2}</div>
              </div>
            )}

            <div style={{ position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>◀</div>
            <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>▶</div>
          </div>
        </div>

        {/* Result badge */}
        {submitted && (
          <div style={{ textAlign: 'center', marginBottom: 8, animation: 'fadeSlideUp 0.3s ease' }}>
            <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 10, background: resultColor + '15', border: `2px solid ${resultColor}33`, fontSize: 14, fontWeight: 800, color: resultColor }}>
              {result === 'perfect' && '🎯 PERFECT STRIKE! +100'}
              {result === 'close' && '⚔️ Close slash! +50'}
              {result === 'wrong' && '🛡️ Blocked! Check below'}
            </div>
          </div>
        )}

        {/* Step-by-step explanation */}
        {showExplanation && explanation.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 16px',
            border: `1px solid ${resultColor}22`, marginBottom: 12, animation: 'fadeSlideUp 0.4s ease',
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: resultColor, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              📖 How it works:
            </div>
            {explanation.map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6,
                animation: `fadeSlideUp 0.3s ease ${i * 0.1}s both`,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{step.icon}</span>
                <span style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{step.text}</span>
              </div>
            ))}
            {q.roundTo && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700 }}>
                  📌 {q.answerLabel} rounds to {q.roundTo}
                </span>
              </div>
            )}
            {q.isCompare && (
              <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>
                  {q.answer > q.answer2 ? `${q.answerLabel} > ${q.answerLabel2}` : q.answer < q.answer2 ? `${q.answerLabel2} > ${q.answerLabel}` : 'They are equal!'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
          {!submitted && (
            <button onClick={handleSubmit} disabled={placement === null || (q.isCompare && placement2 === null)}
              style={{ ...btnS(placement === null ? '#475569' : '#22c55e'), opacity: placement === null ? 0.5 : 1 }}>
              {q.isCompare ? (placement === null ? 'Place first value' : placement2 === null ? `Now place ${q.answerLabel2}` : '🤖 QBot Check!') : '🤖 QBot Check!'}
            </button>
          )}
          {submitted && (
            <button onClick={handleNext} style={btnS('#3b82f6')}>
              {currentRound + 1 >= TOTAL_ROUNDS ? '🏆 See Results' : 'Next Challenge →'}
            </button>
          )}
        </div>

        {q.isCompare && !submitted && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, fontSize: 11, color: '#94a3b8' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#3b82f6', verticalAlign: 'middle', marginRight: 4 }} />{q.answerLabel}</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#f59e0b', verticalAlign: 'middle', marginRight: 4 }} />{q.answerLabel2}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn { 0%{transform:translate(-50%,-50%) scale(0);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.2)} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }
        @keyframes fadeSlideUp { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes bounceIn { 0%{transform:translate(-50%,-50%) scale(0.3)} 50%{transform:translate(-50%,-50%) scale(1.15)} 100%{transform:translate(-50%,-50%) scale(1)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes starFly { 0%{opacity:1;transform:rotate(0) scale(1)} 100%{opacity:0;transform:rotate(360deg) scale(0) translateY(-60px)} }
        @keyframes ninjaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      `}</style>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
};

/* ── QBot Component ── */
const NinjaQBot = ({ msg, streak }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(34,197,94,0.06)', borderRadius: 14,
    padding: '10px 14px', border: '1px solid rgba(34,197,94,0.12)',
    animation: 'fadeSlideUp 0.3s ease',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #14532d, #052e16)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '2px solid #22c55e', position: 'relative',
      animation: 'ninjaFloat 2s ease infinite', overflow: 'hidden',
    }}>
      <img src={qbotImg} alt="QBot" style={{ width: 32 }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#86efac', lineHeight: 1.4 }}>{msg}</div>
      {streak >= 3 && <div style={{ fontSize: 10, color: '#fbbf24', fontWeight: 700, marginTop: 2 }}>⚡ Power Level: {streak}x 🔥</div>}
    </div>
  </div>
);

const BG = 'linear-gradient(135deg, #0f172a 0%, #052e16 50%, #0f172a 100%)';
const FONT = '"Inter", "Segoe UI", system-ui, sans-serif';
function btnS(bg) { return { padding: '12px 28px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, textAlign: 'center' }; }

export default NumberLineNinja;
