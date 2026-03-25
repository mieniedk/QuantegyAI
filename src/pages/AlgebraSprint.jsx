import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import { TEKS_STANDARDS } from '../data/teks';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';
import { sanitizeHtml } from '../utils/sanitize';
import { formatMathHtml } from '../utils/mathFormat';

/* ══════════════════════════════════════════════════════════════════════════
   ALGEBRA I QUESTION GENERATORS – organized by TEKS
   Each generator returns { question, choices, correct, teks }
   ══════════════════════════════════════════════════════════════════════════ */

const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (a) => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=ri(0,i);[b[i],b[j]]=[b[j],b[i]];} return b; };

const withChoices = (correct, makeFake, count = 4) => {
  const set = new Set([String(correct)]);
  let attempts = 0;
  while (set.size < count && attempts < 50) { set.add(String(makeFake())); attempts++; }
  return shuffle([...set]);
};

const GENERATORS = {
  // ── A.3A  Slope ──
  'A.3A': () => {
    const x1 = ri(-5, 5), y1 = ri(-8, 8), dx = pick([-4,-3,-2,-1,1,2,3,4]);
    const m = pick([-3,-2,-1,0,1,2,3,4]);
    const x2 = x1+dx, y2 = y1+m*dx;
    const ans = m === 0 ? '0' : String(m);
    return {
      question: `What is the slope of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`,
      choices: withChoices(ans, () => String(ri(-5,5))),
      correct: ans, teks: 'A.3A',
    };
  },

  // ── A.5A  Solve linear equation ──
  'A.5A': () => {
    const x = ri(-8, 8);
    const a = pick([2,3,4,5,6,-2,-3]);
    const b = ri(-10, 10);
    const c = a * x + b;
    return {
      question: `Solve: ${a}x + ${b >= 0 ? b : `(${b})`} = ${c}`,
      choices: withChoices(String(x), () => String(ri(-10,10))),
      correct: String(x), teks: 'A.5A',
    };
  },

  // ── A.5B  Solve linear inequality ──
  'A.5B': () => {
    const x = ri(1, 8);
    const a = pick([2,3,4,5]);
    const rhs = a * x;
    const sym = pick(['>', '<', '≥', '≤']);
    const flip = { '>': `x ${sym} ${x}`, '<': `x ${sym} ${x}`, '≥': `x ${sym} ${x}`, '≤': `x ${sym} ${x}` };
    const ans = `x ${sym} ${x}`;
    return {
      question: `Solve: ${a}x ${sym} ${rhs}`,
      choices: withChoices(ans, () => `x ${pick(['>','<','≥','≤'])} ${ri(-5,10)}`),
      correct: ans, teks: 'A.5B',
    };
  },

  // ── A.5C  Systems ──
  'A.5C': () => {
    const x = ri(-4, 6), y = ri(-4, 6);
    const a1=ri(1,3),b1=pick([-2,-1,1,2]),c1=a1*x+b1*y;
    const a2=pick([-2,-1,1,2]),b2=ri(1,3),c2=a2*x+b2*y;
    return {
      question: `Solve the system:\n${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}\nWhat is x?`,
      choices: withChoices(String(x), () => String(ri(-6,8))),
      correct: String(x), teks: 'A.5C',
    };
  },

  // ── A.7A  Vertex of quadratic ──
  'A.7A': () => {
    const h = ri(-5, 5), k = ri(-8, 8);
    const a = pick([-2,-1,1,2]);
    const sign = h >= 0 ? `−${h}` : `+${-h}`;
    return {
      question: `What is the vertex of y = ${a === 1 ? '' : a === -1 ? '−' : a}(x${sign})² + ${k}?`,
      choices: withChoices(`(${h}, ${k})`, () => `(${ri(-5,5)}, ${ri(-8,8)})`),
      correct: `(${h}, ${k})`, teks: 'A.7A',
    };
  },

  // ── A.8A  Solve quadratic (square roots) ──
  'A.8A': () => {
    const r = ri(1, 9);
    const n = r * r;
    return {
      question: `Solve: x² = ${n}`,
      choices: withChoices(`±${r}`, () => { const f=ri(1,12); return pick([`±${f}`, String(f), String(-f)]); }),
      correct: `±${r}`, teks: 'A.8A',
    };
  },

  // ── A.10A  Add/subtract polynomials ──
  'A.10A': () => {
    const a=ri(1,6), b=ri(-9,9), c=ri(1,6), d=ri(-9,9);
    const op = pick(['+','−']);
    const rA = op === '+' ? a+c : a-c;
    const rB = op === '+' ? b+d : b-d;
    const ans = `${rA}x ${rB >= 0 ? `+ ${rB}` : `− ${-rB}`}`;
    return {
      question: `Simplify: (${a}x + ${b}) ${op} (${c}x + ${d})`,
      choices: withChoices(ans, () => `${ri(-8,8)}x ${pick(['+','−'])} ${ri(0,15)}`),
      correct: ans, teks: 'A.10A',
    };
  },

  // ── A.10E  Factor trinomial ──
  'A.10E': () => {
    const p = ri(-6, 6), q = ri(-6, 6);
    if (p === 0 || q === 0) return GENERATORS['A.10E']();
    const b = p + q, c = p * q;
    const sP = p > 0 ? `+${p}` : String(p);
    const sQ = q > 0 ? `+${q}` : String(q);
    const correct = p === q ? `(x${sP})²` : `(x${sP})(x${sQ})`;
    return {
      question: `Factor: x² ${b >= 0 ? `+ ${b}` : `− ${-b}`}x ${c >= 0 ? `+ ${c}` : `− ${-c}`}`,
      choices: withChoices(correct, () => { const r1=ri(-6,6),r2=ri(-6,6); const s1=r1>0?`+${r1}`:String(r1); const s2=r2>0?`+${r2}`:String(r2); return `(x${s1})(x${s2})`; }),
      correct, teks: 'A.10E',
    };
  },

  // ── A.11B  Exponent laws ──
  'A.11B': () => {
    const type = pick(['product','quotient','power']);
    if (type === 'product') {
      const a=ri(2,6), b=ri(2,6);
      return {
        question: `Simplify: x${sup(a)} · x${sup(b)}`,
        choices: withChoices(`x${sup(a+b)}`, () => `x${sup(ri(2,15))}`),
        correct: `x${sup(a+b)}`, teks: 'A.11B',
      };
    } else if (type === 'quotient') {
      const a=ri(5,10), b=ri(1,4);
      return {
        question: `Simplify: x${sup(a)} ÷ x${sup(b)}`,
        choices: withChoices(`x${sup(a-b)}`, () => `x${sup(ri(1,12))}`),
        correct: `x${sup(a-b)}`, teks: 'A.11B',
      };
    } else {
      const a=ri(2,4), b=ri(2,3);
      return {
        question: `Simplify: (x${sup(a)})${sup(b)}`,
        choices: withChoices(`x${sup(a*b)}`, () => `x${sup(ri(2,15))}`),
        correct: `x${sup(a*b)}`, teks: 'A.11B',
      };
    }
  },

  // ── A.12B  Evaluate function notation ──
  'A.12B': () => {
    const m = pick([2,3,4,5,-1,-2,-3]);
    const b = ri(-8, 8);
    const xv = ri(-5, 5);
    const ans = m * xv + b;
    return {
      question: `f(x) = ${m}x ${b >= 0 ? `+ ${b}` : `− ${-b}`}. Find f(${xv}).`,
      choices: withChoices(String(ans), () => String(ri(-30,30))),
      correct: String(ans), teks: 'A.12B',
    };
  },

  // ── A.2B  Write linear equation ──
  'A.2B': () => {
    const m = pick([-3,-2,-1,1,2,3,4]);
    const b = ri(-8, 8);
    const ans = `y = ${m}x ${b >= 0 ? `+ ${b}` : `− ${-b}`}`;
    return {
      question: `Write the equation: slope = ${m}, y-intercept = ${b}`,
      choices: withChoices(ans, () => `y = ${ri(-4,5)}x ${pick(['+','−'])} ${ri(0,10)}`),
      correct: ans, teks: 'A.2B',
    };
  },

  // ── A.6A  Quadratic domain/range ──
  'A.6A': () => {
    const k = ri(-5, 5);
    const opens = pick(['up','down']);
    const ans = opens === 'up' ? `y ≥ ${k}` : `y ≤ ${k}`;
    return {
      question: `What is the range of f(x) = ${opens === 'down' ? '−' : ''}(x−2)² + ${k}?`,
      choices: withChoices(ans, () => `y ${pick(['≥','≤','>','<'])} ${ri(-8,8)}`),
      correct: ans, teks: 'A.6A',
    };
  },

  // ── A.9A  Exponential domain/range ──
  'A.9A': () => {
    const a = pick([1,2,3,5]);
    const b = pick([2,3,5]);
    return {
      question: `What is the range of f(x) = ${a}·${b}^x?`,
      choices: withChoices('y > 0', () => pick(['y ≥ 0','All reals','y < 0','y > 1'])),
      correct: 'y > 0', teks: 'A.9A',
    };
  },

  // ── A.2A  Linear domain/range ──
  'A.2A': () => {
    const m = ri(-5,5), b = ri(-8,8);
    const askDomain = pick([true, false]);
    return {
      question: `What is the ${askDomain ? 'domain' : 'range'} of y = ${m}x + ${b}?`,
      choices: withChoices('All reals', () => pick([`x ≥ ${ri(-5,5)}`,`y > ${ri(-5,5)}`,`{${ri(-5,5)}}`,'{0}'])),
      correct: 'All reals', teks: 'A.2A',
    };
  },
};

const sup = (n) => {
  const map = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
  return String(n).split('').map(c => map[c] || c).join('');
};

/* ── Explanation generators by TEKS ── */
const EXPLANATIONS = {
  'A.3A': (q) => {
    const m = q.question.match(/\((-?\d+),\s*(-?\d+)\)\s*and\s*\((-?\d+),\s*(-?\d+)\)/);
    if (m) return `Use the slope formula: m = (y₂ − y₁)/(x₂ − x₁) = (${m[4]} − ${m[2]})/(${m[3]} − ${m[1]}) = ${q.correct}.`;
    if (q.question.includes('y =')) return `In slope-intercept form y = mx + b, the coefficient of x is the slope. So m = ${q.correct}.`;
    return `Calculate the slope using the slope formula m = (y₂ − y₁)/(x₂ − x₁) = ${q.correct}.`;
  },
  'A.5A': (q) => {
    return `To solve a linear equation, isolate x by performing inverse operations on both sides. Undo addition/subtraction first, then multiplication/division. The answer is x = ${q.correct}.`;
  },
  'A.5B': (q) => {
    return `Solve the inequality like an equation — but remember: when you multiply or divide by a negative number, flip the inequality sign. The solution is ${q.correct}.`;
  },
  'A.5C': (q) => {
    return `Use substitution or elimination to solve the system. Substitute one equation into the other, or add/subtract equations to eliminate a variable. The answer is ${q.correct}.`;
  },
  'A.7A': (q) => {
    return `For vertex form y = a(x − h)² + k, the vertex is (h, k). Remember the sign inside the parentheses is opposite to h. The vertex is ${q.correct}.`;
  },
  'A.8A': (q) => {
    if (q.question.includes('x² =')) return `Take the square root of both sides. Remember there are two solutions: positive and negative. x = ${q.correct}.`;
    return `Factor the quadratic expression, set each factor equal to zero, and solve. The solutions are x = ${q.correct}.`;
  },
  'A.10A': (q) => {
    return `Distribute any minus signs, then combine like terms (same variable and exponent). The simplified expression is ${q.correct}.`;
  },
  'A.10E': (q) => {
    return `Find two numbers that multiply to the constant term and add to the coefficient of x. Write as the product of two binomials: ${q.correct}.`;
  },
  'A.11B': (q) => {
    if (q.question.includes('·')) return `Product rule: when multiplying same bases, add the exponents. The result is ${q.correct}.`;
    if (q.question.includes('÷')) return `Quotient rule: when dividing same bases, subtract the exponents. The result is ${q.correct}.`;
    return `Power rule: when raising a power to a power, multiply the exponents. The result is ${q.correct}.`;
  },
  'A.12B': (q) => {
    return `Substitute the given x-value into the function and evaluate. Follow order of operations (exponents first, then multiplication, then addition/subtraction). f(x) = ${q.correct}.`;
  },
  'A.2B': (q) => {
    return `Use slope-intercept form: y = mx + b, where m is the slope and b is the y-intercept. The equation is ${q.correct}.`;
  },
  'A.2A': (q) => {
    return `For a linear function y = mx + b, both the domain (all possible x values) and range (all possible y values) are all real numbers. The answer is ${q.correct}.`;
  },
  'A.6A': (q) => {
    return `For a quadratic f(x) = a(x − h)² + k: domain is always all real numbers. If a > 0, range is y ≥ k; if a < 0, range is y ≤ k. The answer is ${q.correct}.`;
  },
  'A.9A': (q) => {
    return `For exponential functions f(x) = a·bˣ (a > 0, b > 0), the range is always y > 0 because exponential functions never reach zero. The answer is ${q.correct}.`;
  },
};

const getExplanation = (q) => {
  const gen = EXPLANATIONS[q.teks];
  if (gen) return gen(q);
  return `The correct answer is ${q.correct}. Review this TEKS standard (${q.teks}) for more practice.`;
};

/* ── Topic groups for mode selection ── */
const TOPICS = [
  { id: 'linear', label: 'Linear', teks: ['A.2A','A.2B','A.3A','A.5A','A.5B'], color: '#3b82f6' },
  { id: 'systems', label: 'Systems', teks: ['A.5C'], color: '#8b5cf6' },
  { id: 'quadratic', label: 'Quadratic', teks: ['A.6A','A.7A','A.8A','A.10E'], color: '#ec4899' },
  { id: 'exponents', label: 'Exponents & Polys', teks: ['A.10A','A.11B'], color: '#f59e0b' },
  { id: 'functions', label: 'Functions', teks: ['A.12B','A.9A'], color: '#10b981' },
  { id: 'mixed', label: 'Mixed – All Topics', teks: Object.keys(GENERATORS), color: '#1e3a5f' },
];

/* ══════════════════════════════════════════════════════════════════════════ */

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,255,0.05)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(0,245,255,0.1)', marginBottom: 12 }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a5f,#0d1b2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00f5ff', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const AlgebraSprint = () => {
  const [searchParams] = useSearchParams();
  const { returnUrl, goBack } = useGameReturn();
  const [mode, setMode] = useState(null);       // topic id
  const [sprintSize, setSprintSize] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const timerRef = useRef(null);

  const teksParam = searchParams.get('teks') || '';
  const labelParam = searchParams.get('label') || '';
  const studentId = searchParams.get('sid') || '';
  const assignmentId = searchParams.get('aid') || '';
  const classId = searchParams.get('cid') || '';

  // Timer
  useEffect(() => {
    if (startTime && !gameOver) {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now()-startTime)/1000)), 500);
      return () => clearInterval(timerRef.current);
    }
  }, [startTime, gameOver]);

  const buildQuestions = useCallback((topicId) => {
    let pool = [];
    if (teksParam) {
      const ids = teksParam.split(',').map(t => t.trim()).filter(t => GENERATORS[t]);
      if (ids.length > 0) { pool = ids; }
    }
    if (pool.length === 0) {
      const topic = TOPICS.find(t => t.id === topicId);
      pool = topic ? topic.teks.filter(t => GENERATORS[t]) : Object.keys(GENERATORS);
    }
    const qs = [];
    for (let i = 0; i < sprintSize; i++) {
      const gen = GENERATORS[pick(pool)];
      if (gen) qs.push(gen());
    }
    return qs;
  }, [teksParam, sprintSize]);

  const startGame = (topicId) => {
    const qs = buildQuestions(topicId);
    setQuestions(qs);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback('');
    setGameOver(false);
    setHistory([]);
    setStartTime(Date.now());
    setMode(topicId);
  };

  const handleAnswer = (choice) => {
    if (selected !== null) return;
    const q = questions[current];
    const isCorrect = choice === q.correct;
    setSelected(choice);
    setFeedback(isCorrect ? 'Correct!' : `Wrong – answer: ${q.correct}`);
    if (isCorrect) setScore(s => s + 1);
    setHistory(h => [...h, { ...q, userAnswer: choice, isCorrect, explanation: getExplanation(q) }]);

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setGameOver(true);
        clearInterval(timerRef.current);
        // Save result for gradebook
        const finalScore = (isCorrect ? score + 1 : score);
        const pctScore = Math.round((finalScore / questions.length) * 100);
        if (studentId) {
          let resolvedAid = assignmentId;
          if (!resolvedAid && classId) {
            const match = findMatchingAssignment(classId, 'algebra-sprint', teksParam || undefined);
            if (match) resolvedAid = match.id;
          }
          if (resolvedAid) {
            saveGameResult({
              studentId, assignmentId: resolvedAid, classId,
              gameId: 'algebra-sprint', teks: teksParam,
              score: pctScore, correct: finalScore, total: questions.length,
              time: Math.floor((Date.now() - startTime) / 1000),
              grade: 'algebra',
            });
          }
        }
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setFeedback('');
      }
    }, 1200);
  };

  const fmt = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  const pct = gameOver && questions.length ? Math.round(score/questions.length*100) : 0;

  return (
    <div style={{ padding: '12px 16px', maxWidth: 650, margin: '0 auto', fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#0f172a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ color: '#007bff', textDecoration: 'none', fontSize: 13 }}>← Games</Link>
        )}
        {mode && !gameOver && (
          <div style={{ display: 'flex', gap: 12, fontSize: 12, fontWeight: 600, color: '#475569' }}>
            <span>Q {current+1}/{questions.length}</span>
            <span>Score: {score}</span>
            <span>{fmt(elapsed)}</span>
          </div>
        )}
        <button type="button" onClick={() => setShowHelp(!showHelp)}
          style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderRadius: 6,
            background: showHelp ? '#e8f4ff' : '#f8fafc', color: '#1e3a5f',
            border: showHelp ? '2px solid #007bff' : '1px solid #d1d5db' }}>
          {showHelp ? 'Hide Help' : 'How to Play'}
        </button>
      </div>

      <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>Algebra Sprint</h1>
      <p style={{ margin: '0 0 8px', color: '#64748b', fontSize: 13 }}>
        Fast-paced Algebra I practice – TEKS-aligned.
        {teksParam && <span style={{ marginLeft: 6, padding: '2px 8px', background: '#e8f0fe', color: '#1a5cba', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Focused: {teksParam}</span>}
      </p>

      {showHelp && (
        <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#334155', lineHeight: 1.65 }}>
            <li>Pick a <strong>topic</strong> (Linear, Quadratic, etc.) or play Mixed.</li>
            <li>Choose how many questions (3, 5, 8, or 10).</li>
            <li>Each question shows a problem with <strong>4 answer choices</strong>. Pick the right one!</li>
            <li>You get instant feedback – correct answers turn green, wrong ones turn red.</li>
            <li>Try to get the <strong>highest score in the shortest time</strong>.</li>
          </ol>
        </div>
      )}

      {/* ── Topic Selection ── */}
      {!mode && (
        <div style={{ marginTop: 8 }}>
          {labelParam && (
            <div style={{ marginBottom: 12, padding: 10, background: '#f0fdf4', borderRadius: 8 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#166534' }}>Focused: {labelParam}</p>
            </div>
          )}

          {!teksParam && (
            <>
              <p style={{ fontWeight: 600, marginBottom: 8, fontSize: 15, color: '#0f172a' }}>Choose a topic:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
                {TOPICS.map(t => (
                  <button key={t.id} type="button" onClick={() => startGame(t.id)}
                    style={{
                      padding: '14px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}cc)`,
                      color: '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center',
                      boxShadow: `0 3px 10px ${t.color}40`,
                    }}>
                    {t.label}
                    <span style={{ display: 'block', fontSize: 10, fontWeight: 400, opacity: 0.85, marginTop: 2 }}>
                      {t.teks.length} standard{t.teks.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13, marginRight: 8, color: '#334155' }}>Questions per sprint:</label>
            {[3, 5, 8, 10].map(n => (
              <button key={n} type="button" onClick={() => setSprintSize(n)}
                style={{
                  padding: '6px 14px', marginRight: 6, borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                  border: sprintSize === n ? '2px solid #007bff' : '1px solid #d1d5db',
                  background: sprintSize === n ? '#e8f4ff' : '#fff',
                  color: sprintSize === n ? '#007bff' : '#374151',
                }}>
                {n}
              </button>
            ))}
          </div>

          {teksParam && (
            <button type="button" onClick={() => startGame('focused')}
              style={{
                padding: '12px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(135deg, #007bff, #0056d2)', color: '#fff',
                border: 'none', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,123,255,0.3)',
              }}>
              Start Sprint
            </button>
          )}
        </div>
      )}

      {/* ── Question Screen ── */}
      {mode && !gameOver && questions[current] && (
        <div style={{ marginTop: 8 }}>
          <div style={{ padding: 20, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', background: '#e8f0fe', color: '#1a5cba', borderRadius: 4 }}>
              {questions[current].teks}
            </span>
            <p style={{ margin: '10px 0 0', fontSize: 17, fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-line', color: '#0f172a' }}>
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(questions[current].question)) }} />
            </p>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {questions[current].choices.map((c, i) => {
              let bg = '#fff', border = '1px solid #d1d5db', color = '#1e293b';
              if (selected !== null) {
                if (c === questions[current].correct) { bg = '#dcfce7'; border = '2px solid #22c55e'; color = '#166534'; }
                else if (c === selected) { bg = '#fee2e2'; border = '2px solid #dc2626'; color = '#991b1b'; }
              }
              return (
                <button key={i} type="button" onClick={() => handleAnswer(c)}
                  disabled={selected !== null}
                  style={{
                    padding: '12px 16px', borderRadius: 8, fontSize: 15, fontWeight: 500,
                    textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer',
                    background: bg, border, color, transition: 'all 0.15s',
                  }}>
                  <strong style={{ marginRight: 8, opacity: 0.5 }}>{String.fromCharCode(65+i)})</strong>
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatMathHtml(String(c))) }} />
                </button>
              );
            })}
          </div>

          {feedback && (
            <p style={{
              marginTop: 10, padding: '8px 14px', borderRadius: 8, fontWeight: 700, fontSize: 14,
              background: feedback.startsWith('Correct') ? '#dcfce7' : '#fee2e2',
              color: feedback.startsWith('Correct') ? '#166534' : '#991b1b',
            }}>
              {feedback}
            </p>
          )}
        </div>
      )}

      {/* ── Results Screen with Review ── */}
      {gameOver && (
        <>
          <QBotBubble msg="Algebra champion! QBot is cheering for you! 🤖🔢" />
          <GameReview
          questions={history.map((h) => ({
            question: h.question,
            correctAnswer: h.correct,
            userAnswer: h.userAnswer,
            isCorrect: h.isCorrect,
            teks: h.teks,
            explanation: h.explanation,
          }))}
          score={score}
          total={questions.length}
          time={elapsed}
          gameTitle="Algebra Sprint"
          onPlayAgain={() => startGame(mode)}
          onBack={() => { setMode(null); setGameOver(false); }}
          backLabel="Change Topic"
        />
        </>
      )}
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
};

export default AlgebraSprint;
