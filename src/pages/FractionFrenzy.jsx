import React, { useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   FRACTION FRENZY — Compare, order & find equivalent fractions
   Visual fraction models + interactive questions
   TEKS 3.3D, 3.3E, 3.3G
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  correct: () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 80); setTimeout(() => tone(784, 0.15), 160); },
  wrong: () => tone(200, 0.3, 'sawtooth', 0.06),
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 90)); },
  pop: () => tone(600, 0.06, 'sine', 0.08),
};

const pick = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const COLORS = { filled: '#60a5fa', empty: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.2)' };

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function simplify(n, d) { const g = gcd(Math.abs(n), Math.abs(d)); return [n / g, d / g]; }
function fracStr(n, d) { const [sn, sd] = simplify(n, d); return sd === 1 ? `${sn}` : `${sn}/${sd}`; }
function fracVal(n, d) { return n / d; }

/* ── Visual fraction bar ── */
function FractionBar({ numerator, denominator, width = 180, height = 32, label = true, color = COLORS.filled }) {
  const sliceW = width / denominator;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={width} height={height} style={{ display: 'block' }}>
        {Array.from({ length: denominator }, (_, i) => (
          <rect key={i} x={i * sliceW + 1} y={1} width={sliceW - 2} height={height - 2}
            rx={3} fill={i < numerator ? color : COLORS.empty}
            stroke={COLORS.border} strokeWidth={1} />
        ))}
      </svg>
      {label && <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{numerator}/{denominator}</div>}
    </div>
  );
}

/* ── Visual fraction circle (pie) ── */
function FractionPie({ numerator, denominator, size = 80, color = COLORS.filled }) {
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const slices = [];
  for (let i = 0; i < denominator; i++) {
    const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
    const d = denominator === 1
      ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    slices.push(
      <path key={i} d={d} fill={i < numerator ? color : COLORS.empty} stroke={COLORS.border} strokeWidth={1} />
    );
  }
  return (
    <svg width={size} height={size} style={{ display: 'block' }}>
      {slices}
    </svg>
  );
}

/* ── Equivalent fraction sets ── */
const EQUIV_GROUPS = [
  [[1, 2], [2, 4], [3, 6], [4, 8]],
  [[1, 3], [2, 6]],
  [[2, 3], [4, 6]],
  [[1, 4], [2, 8]],
  [[3, 4], [6, 8]],
  [[1, 6], [1, 6]],
  [[2, 8], [1, 4]],
  [[3, 8]],
  [[5, 8]],
  [[7, 8]],
];

const DENOMS = [2, 3, 4, 6, 8];

const DIFFICULTY = {
  easy:   { label: 'Fraction Friend', emoji: '🌱', rounds: 8,  types: ['compare_same_denom', 'compare_same_num', 'equivalent_visual', 'identify_fraction'] },
  medium: { label: 'Fraction Pro',    emoji: '🔥', rounds: 10, types: ['compare_same_denom', 'compare_same_num', 'equivalent_visual', 'equivalent_pick', 'order_fractions', 'identify_fraction', 'explain_equiv'] },
  hard:   { label: 'Fraction Master', emoji: '💎', rounds: 12, types: ['compare_same_denom', 'compare_same_num', 'equivalent_visual', 'equivalent_pick', 'order_fractions', 'identify_fraction', 'explain_equiv', 'equiv_missing', 'compare_mixed'] },
};

const QBOT = {
  start: ["Fraction Frenzy time! 🍕🤖", "Let's master fractions together! 🔢", "QBot loves fractions — let's go! ⭐"],
  correct: ["Perfect! You know your fractions! 🍕", "Correct! QBot is proud! ⭐", "Great fraction skills! 🎉", "QBot approves! 🤖✅"],
  wrong: ["Not quite — look at the model carefully! 🔍", "Close! Think about the size of each piece! 🍕", "Compare the shaded parts! 💪"],
  win: ["Fraction Master achieved! 🏆🍕", "You've conquered fractions! 🌟", "Incredible! 🤖🎉"],
};

function generateQuestion(diff) {
  const qType = pick(diff.types);

  switch (qType) {
    case 'compare_same_denom': {
      const d = pick(DENOMS);
      let a = randInt(1, d - 1), b = randInt(1, d - 1);
      while (a === b) b = randInt(1, d - 1);
      const ans = a > b ? `${a}/${d}` : `${b}/${d}`;
      return {
        prompt: `Which fraction is greater?`,
        visual: (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <FractionBar numerator={a} denominator={d} />
            <div style={{ fontSize: 18, fontWeight: 900, color: '#64748b' }}>vs</div>
            <FractionBar numerator={b} denominator={d} />
          </div>
        ),
        correctAnswer: ans,
        options: shuffle([`${a}/${d}`, `${b}/${d}`, 'They are equal']),
        explanation: `Both have the same denominator (${d}), so compare numerators: ${Math.max(a, b)} > ${Math.min(a, b)}. So ${ans} is greater.`,
        teks: '3.3D',
      };
    }
    case 'compare_same_num': {
      const n = randInt(1, 3);
      let d1 = pick(DENOMS.filter(d => d > n)), d2 = pick(DENOMS.filter(d => d > n && d !== d1));
      if (!d2) d2 = d1 + 2;
      const ans = d1 < d2 ? `${n}/${d1}` : `${n}/${d2}`;
      return {
        prompt: `Which fraction is greater?`,
        visual: (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <FractionPie numerator={n} denominator={d1} />
            <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{n}/{d1}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#64748b' }}>vs</div>
            <FractionPie numerator={n} denominator={d2} />
            <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0' }}>{n}/{d2}</div>
          </div>
        ),
        correctAnswer: ans,
        options: shuffle([`${n}/${d1}`, `${n}/${d2}`, 'They are equal']),
        explanation: `Same numerator (${n}), so the one with the SMALLER denominator is BIGGER (bigger slices). ${Math.min(d1, d2)} < ${Math.max(d1, d2)}, so ${ans} is greater.`,
        teks: '3.3D',
      };
    }
    case 'compare_mixed': {
      const d1 = pick(DENOMS), d2 = pick(DENOMS);
      const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
      const v1 = n1 / d1, v2 = n2 / d2;
      let ans;
      if (Math.abs(v1 - v2) < 0.001) ans = 'They are equal';
      else ans = v1 > v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
      return {
        prompt: `Which fraction is greater?`,
        visual: (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <FractionBar numerator={n1} denominator={d1} />
            <div style={{ fontSize: 18, fontWeight: 900, color: '#64748b' }}>vs</div>
            <FractionBar numerator={n2} denominator={d2} />
          </div>
        ),
        correctAnswer: ans,
        options: shuffle([`${n1}/${d1}`, `${n2}/${d2}`, 'They are equal']),
        explanation: Math.abs(v1 - v2) < 0.001
          ? `${n1}/${d1} = ${n2}/${d2} — they are equivalent fractions!`
          : `${n1}/${d1} = ${(v1 * 100).toFixed(0)}% and ${n2}/${d2} = ${(v2 * 100).toFixed(0)}%. So ${ans} is greater.`,
        teks: '3.3D',
      };
    }
    case 'equivalent_visual': {
      const group = pick(EQUIV_GROUPS.filter(g => g.length >= 2));
      const [n1, d1] = group[0], [n2, d2] = group[1];
      return {
        prompt: `Are these fractions equivalent (equal)?`,
        visual: (
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <FractionBar numerator={n1} denominator={d1} color="#60a5fa" />
            <div style={{ fontSize: 18, fontWeight: 900, color: '#64748b' }}>=?</div>
            <FractionBar numerator={n2} denominator={d2} color="#34d399" />
          </div>
        ),
        correctAnswer: 'Yes',
        options: ['Yes', 'No'],
        explanation: `${n1}/${d1} and ${n2}/${d2} cover the SAME amount — they are equivalent! Multiply both parts of ${n1}/${d1} by ${n2 / n1}: ${n1}×${n2 / n1}/${d1}×${n2 / n1} = ${n2}/${d2}.`,
        teks: '3.3E',
      };
    }
    case 'equivalent_pick': {
      const group = pick(EQUIV_GROUPS.filter(g => g.length >= 2));
      const [n1, d1] = group[0];
      const [n2, d2] = group[1];
      const wrongOptions = [];
      let tries = 0;
      while (wrongOptions.length < 2 && tries < 20) {
        const wd = pick(DENOMS);
        const wn = randInt(1, wd - 1);
        if (Math.abs(wn / wd - n1 / d1) > 0.01 && !wrongOptions.includes(`${wn}/${wd}`)) {
          wrongOptions.push(`${wn}/${wd}`);
        }
        tries++;
      }
      while (wrongOptions.length < 2) wrongOptions.push(`${randInt(1, 5)}/${randInt(3, 8)}`);
      return {
        prompt: `Which fraction is equivalent to ${n1}/${d1}?`,
        visual: <div style={{ display: 'flex', justifyContent: 'center' }}><FractionBar numerator={n1} denominator={d1} width={200} /></div>,
        correctAnswer: `${n2}/${d2}`,
        options: shuffle([`${n2}/${d2}`, ...wrongOptions]),
        explanation: `${n1}/${d1} = ${n2}/${d2}. Multiply numerator and denominator by ${n2 / n1}: ${n1}×${n2 / n1} = ${n2}, ${d1}×${n2 / n1} = ${d2}.`,
        teks: '3.3E',
      };
    }
    case 'explain_equiv': {
      const group = pick(EQUIV_GROUPS.filter(g => g.length >= 2));
      const [n1, d1] = group[0], [n2, d2] = group[1];
      const multiplier = n2 / n1;
      const correctExpl = `Multiply top and bottom by ${multiplier}`;
      return {
        prompt: `Why is ${n1}/${d1} = ${n2}/${d2}?`,
        visual: (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <FractionPie numerator={n1} denominator={d1} color="#60a5fa" />
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>=</div>
            <FractionPie numerator={n2} denominator={d2} color="#34d399" />
          </div>
        ),
        correctAnswer: correctExpl,
        options: shuffle([
          correctExpl,
          `Add ${multiplier} to top and bottom`,
          `The numerators are the same`,
          `Subtract from the denominator`,
        ]),
        explanation: `${n1}/${d1} = ${n2}/${d2} because ${n1} × ${multiplier} = ${n2} and ${d1} × ${multiplier} = ${d2}. Multiplying both parts by the same number gives an equivalent fraction.`,
        teks: '3.3G',
      };
    }
    case 'identify_fraction': {
      const d = pick(DENOMS);
      const n = randInt(1, d);
      const wrongOpts = [];
      while (wrongOpts.length < 3) {
        const wn = randInt(1, 8), wd = pick(DENOMS);
        const s = `${wn}/${wd}`;
        if (s !== `${n}/${d}` && !wrongOpts.includes(s)) wrongOpts.push(s);
      }
      return {
        prompt: `What fraction is shown?`,
        visual: <div style={{ display: 'flex', justifyContent: 'center' }}><FractionBar numerator={n} denominator={d} width={200} label={false} /></div>,
        correctAnswer: `${n}/${d}`,
        options: shuffle([`${n}/${d}`, ...wrongOpts]),
        explanation: `${n} out of ${d} equal parts are shaded = ${n}/${d}.`,
        teks: '3.3E',
      };
    }
    case 'order_fractions': {
      const d = pick(DENOMS.filter(x => x >= 4));
      const vals = shuffle(Array.from({ length: d - 1 }, (_, i) => i + 1)).slice(0, 3).sort((a, b) => a - b);
      const ordered = vals.map(v => `${v}/${d}`).join(', ');
      const options = shuffle([
        ordered,
        vals.reverse().map(v => `${v}/${d}`).join(', '),
        shuffle(vals).map(v => `${v}/${d}`).join(', '),
      ]);
      if (!options.includes(ordered)) options[0] = ordered;
      return {
        prompt: `Order from least to greatest: ${shuffle([...vals]).map(v => `${v}/${d}`).join(', ')}`,
        visual: (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {vals.sort(() => Math.random() - 0.5).map((v, i) => (
              <FractionPie key={i} numerator={v} denominator={d} size={60} />
            ))}
          </div>
        ),
        correctAnswer: vals.sort((a, b) => a - b).map(v => `${v}/${d}`).join(', '),
        options: shuffle([...new Set(options)]).slice(0, 3),
        explanation: `Same denominator (${d}), so order by numerator: ${vals.sort((a, b) => a - b).join(' < ')}. Answer: ${vals.sort((a, b) => a - b).map(v => `${v}/${d}`).join(', ')}.`,
        teks: '3.3D',
      };
    }
    case 'equiv_missing': {
      const group = pick(EQUIV_GROUPS.filter(g => g.length >= 2));
      const [n1, d1] = group[0], [n2, d2] = group[1];
      const askNum = Math.random() > 0.5;
      const prompt = askNum
        ? `${n1}/${d1} = ?/${d2}. What is the missing numerator?`
        : `${n1}/${d1} = ${n2}/?. What is the missing denominator?`;
      const correct = askNum ? n2 : d2;
      return {
        prompt,
        visual: (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
            <FractionBar numerator={n1} denominator={d1} color="#60a5fa" />
            <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>=</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#e2e8f0' }}>
              {askNum ? '?' : n2}/{askNum ? d2 : '?'}
            </div>
          </div>
        ),
        correctAnswer: correct,
        options: shuffle([correct, correct + 1, correct - 1 > 0 ? correct - 1 : correct + 2, correct + 3]).map(String),
        explanation: askNum
          ? `${n1}/${d1} = ${n2}/${d2}. The multiplier is ${d2 / d1}, so ${n1} × ${d2 / d1} = ${n2}.`
          : `${n1}/${d1} = ${n2}/${d2}. The multiplier is ${n2 / n1}, so ${d1} × ${n2 / n1} = ${d2}.`,
        teks: '3.3E',
      };
    }
    default:
      return generateQuestion({ ...diff, types: ['compare_same_denom'] });
  }
}

/* ── Main Component ── */
export default function FractionFrenzy() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');

  const [difficulty, setDifficulty] = useState(null);
  const [diff, setDiff] = useState(null);
  const [question, setQuestion] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT.start));
  const [showHowTo, setShowHowTo] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const lockRef = useRef(false);
  const advanceTimeoutRef = useRef(null);

  const newRound = useCallback((d) => {
    const q = generateQuestion(d);
    setQuestion(q);
    setSelectedOpt(null);
    setFeedback(null);
    lockRef.current = false;
    SFX.pop();
  }, []);

  const startGame = useCallback((level) => {
    const d = DIFFICULTY[level];
    setDifficulty(level);
    setDiff(d);
    setRoundIdx(0);
    setScore(0);
    setTotalRounds(d.rounds);
    setGameOver(false);
    setHistory([]);
    setStreak(0);
    setQbotMsg(pick(QBOT.start));
    newRound(d);
  }, [newRound]);

  const submitAnswer = useCallback((answer) => {
    if (lockRef.current || !question) return;
    lockRef.current = true;
    setSelectedOpt(answer);
    const correct = String(answer) === String(question.correctAnswer);

    if (correct) {
      SFX.correct();
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ correct: true, msg: question.explanation });
      setQbotMsg(pick(QBOT.correct));
    } else {
      SFX.wrong();
      setStreak(0);
      setFeedback({ correct: false, msg: question.explanation });
      setQbotMsg(pick(QBOT.wrong));
    }

    setHistory(prev => [...prev, {
      question: question.prompt,
      correctAnswer: String(question.correctAnswer),
      studentAnswer: String(answer),
      correct,
    }]);

    const doAdvance = () => {
      advanceTimeoutRef.current = null;
      const nextIdx = roundIdx + 1;
      if (nextIdx >= totalRounds) {
        setGameOver(true);
        setQbotMsg(pick(QBOT.win));
        SFX.win();
        saveGameResult({ gameName: 'Fraction Frenzy', score: score + (correct ? 1 : 0), total: totalRounds, assignmentId, classId });
      } else {
        setRoundIdx(nextIdx);
        newRound(diff);
      }
    };

    advanceTimeoutRef.current = setTimeout(doAdvance, 2800);
  }, [question, roundIdx, totalRounds, score, diff, assignmentId, classId, newRound]);

  const handleNext = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (!feedback || !diff) return;
    const nextIdx = roundIdx + 1;
    if (nextIdx >= totalRounds) {
      setGameOver(true);
      setQbotMsg(pick(QBOT.win));
      SFX.win();
      saveGameResult({ gameName: 'Fraction Frenzy', score: score + (feedback.correct ? 1 : 0), total: totalRounds, assignmentId, classId });
    } else {
      setRoundIdx(nextIdx);
      newRound(diff);
    }
  }, [feedback, roundIdx, totalRounds, score, diff, assignmentId, classId, newRound]);

  if (showReview) return <GameReview gameName="Fraction Frenzy" results={history} onBack={() => setShowReview(false)} />;

  if (!difficulty) {
    return (
      <div style={pageStyle}>
        <Link to="/games" style={backLink}>← Games</Link>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 4, textAlign: 'center', marginTop: 8 }}>🍕 Fraction Frenzy</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center', maxWidth: 360 }}>
          Compare, order & find equivalent fractions with visual models!
        </div>
        <QBotBubble msg="Let's dive into fractions! Can you tell which is bigger, or find equivalent pairs? Use the visual models to help! 🤖🍕" />
        <div style={{ maxWidth: 400, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>How It Works</div>
          <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>🍕 QBot shows you <strong style={{ color: '#60a5fa' }}>fraction bars</strong> or <strong style={{ color: '#34d399' }}>pie models</strong>.</div>
            <div style={{ marginBottom: 8 }}>⚖️ Compare fractions — which is <strong style={{ color: '#fbbf24' }}>greater</strong>? Are they <strong style={{ color: '#c084fc' }}>equivalent</strong>?</div>
            <div style={{ marginBottom: 8 }}>🔢 Find missing numerators or denominators to make fractions equal.</div>
            <div>📊 Order fractions from least to greatest and explain why!</div>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>Choose Your Level</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460, width: '100%' }}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <button type="button" key={key} onPointerUp={() => startGame(key)} style={{ ...btnStyle('linear-gradient(135deg,#f59e0b,#d97706)'), minWidth: 130, padding: '14px 16px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 4, flex: '1 1 auto' }}>
              <div style={{ fontSize: 26 }}>{d.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{d.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'center', lineHeight: 1.3 }}>
                {key === 'easy' && 'Compare & identify'}
                {key === 'medium' && '+ Equivalence & ordering'}
                {key === 'hard' && 'All + missing values'}
              </div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>{d.rounds} questions</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : 1;

  return (
    <div style={{ ...pageStyle, padding: '10px 12px 24px' }}>
      {showHowTo && (
        <div style={overlayBg}>
          <div style={overlayBox}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, textAlign: 'center' }}>🍕 How to Play</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>1. Look at the fraction models (bars or pies).</div>
              <div style={{ marginBottom: 8 }}>2. Read the question — compare, identify, or find equivalents.</div>
              <div style={{ marginBottom: 8 }}>3. Use the visuals to count shaded parts.</div>
              <div>4. Pick the correct answer!</div>
            </div>
            <button type="button" onPointerUp={() => setShowHowTo(false)} style={{ ...btnStyle('linear-gradient(135deg,#f59e0b,#d97706)'), width: '100%', marginTop: 16 }}>Got it!</button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Link to="/games" style={backLink}>← Games</Link>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>🍕 Fraction Frenzy</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{diff.emoji} {diff.label}</span>
          <button type="button" onPointerUp={() => setShowHowTo(true)} style={helpBtn}>?</button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 500, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>
          <span>Question {roundIdx + 1} / {totalRounds}</span>
          <span>Score: {score}</span>
          {streak >= 2 && <span style={{ color: '#f59e0b' }}>🔥 {streak} streak</span>}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${((roundIdx + (feedback ? 1 : 0)) / totalRounds) * 100}%`, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ maxWidth: 500, width: '100%', marginBottom: 8 }}><QBotBubble msg={qbotMsg} /></div>

      {question && (
        <>
          {question.visual && (
            <div style={{ maxWidth: 500, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px 8px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              {question.visual}
            </div>
          )}

          <div style={{ maxWidth: 500, width: '100%', background: 'rgba(245,158,11,0.08)', borderRadius: 14, padding: '12px 16px', marginBottom: 12, border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.5 }}>{question.prompt}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400, width: '100%' }}>
            {question.options.map((opt, i) => {
              const isCorrect = String(opt) === String(question.correctAnswer);
              const isSelected = selectedOpt === opt;
              let bg, border, color;
              if (feedback) {
                if (isCorrect) { bg = 'rgba(34,197,94,0.2)'; border = '2px solid #22c55e'; color = '#22c55e'; }
                else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid #ef4444'; color = '#ef4444'; }
                else { bg = 'rgba(255,255,255,0.03)'; border = '1px solid rgba(255,255,255,0.06)'; color = '#64748b'; }
              } else { bg = 'rgba(245,158,11,0.08)'; border = '1px solid rgba(245,158,11,0.2)'; color = '#e2e8f0'; }
              return (
                <button type="button" key={i} onPointerUp={() => !feedback && submitAnswer(opt)} disabled={!!feedback}
                  style={{ padding: '14px 16px', minHeight: 48, borderRadius: 12, cursor: feedback ? 'default' : 'pointer', fontSize: 14, fontWeight: 800, textAlign: 'center', background: bg, border, color, WebkitTapHighlightColor: 'transparent', transition: 'all 0.2s ease' }}>
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div style={{ maxWidth: 500, width: '100%', marginTop: 12 }}>
              <div style={{ padding: '10px 16px', borderRadius: 12, marginBottom: 10, background: feedback.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${feedback.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, textAlign: 'center', fontSize: 12, fontWeight: 700, color: feedback.correct ? '#22c55e' : '#ef4444', lineHeight: 1.5, animation: 'fadeIn 0.3s ease' }}>
                {feedback.correct ? '✓ ' : '✗ '}{feedback.msg}
              </div>
              <button type="button" onPointerUp={handleNext} style={{ ...btnStyle('linear-gradient(135deg,#f59e0b,#d97706)'), width: '100%', maxWidth: 500 }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {gameOver && (
        <div style={overlayBg}>
          <div style={{ ...overlayBox, maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🍕</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score === totalRounds ? 'Fraction Master!' : score >= totalRounds * 0.7 ? 'Great Fraction Work!' : 'Keep Practicing!'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1, 2, 3].map(s => <span key={s} style={{ fontSize: 28, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{score}</div><div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>CORRECT</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{totalRounds - score}</div><div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>MISSED</div></div>
            </div>
            <QBotBubble msg={qbotMsg} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button type="button" onPointerUp={() => startGame(difficulty)} style={btnStyle('linear-gradient(135deg,#f59e0b,#d97706)')}>Play Again</button>
              <button type="button" onPointerUp={() => setDifficulty(null)} style={btnStyle('linear-gradient(135deg,#475569,#334155)')}>Change Level</button>
              <button type="button" onPointerUp={() => setShowReview(true)} style={btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)')}>Review</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        button:active { transform: scale(0.96); opacity: 0.85; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(245,158,11,0.06)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(245,158,11,0.12)' }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a8a,#1e1b4b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #f59e0b', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#fcd34d', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const pageStyle = { minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', overflowY: 'auto' };
const backLink = { position: 'absolute', top: 16, left: 16, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 };
function btnStyle(bg) { return { padding: '14px 22px', minHeight: 48, background: bg, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, WebkitTapHighlightColor: 'transparent' }; }
const helpBtn = { width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#fbbf24', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const overlayBg = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' };
const overlayBox = { background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' };
