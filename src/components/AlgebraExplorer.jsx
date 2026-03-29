/**
 * AlgebraExplorer — Interactive activities for Domain II: Patterns and Algebra.
 *
 * Modes (rotated by activityIndex):
 *   0  "function-transform"  Drag sliders to transform y = a f(x-h)+k and match a target curve.
 *   1  "quadratic"           Drag vertex & point to shape a parabola; equation updates live.
 *   2  "trig-circle"         Unit circle manipulative — drag angle, see sin/cos/tan values.
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';
import qbotImg from '../assets/qbot.svg';

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const roundTo = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

function QBotBubble({ message, mood }) {
  const moodEmoji = { wave: '\u{1F44B}', think: '\u{1F914}', encourage: '\u{1F4AA}', celebrate: '\u{1F389}' };
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #a78bfa', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
        <img src={qbotImg} alt="QBot" style={{ width: 26 }} />
      </div>
      <div aria-live="polite" style={{ background: '#f5f3ff', borderRadius: '2px 12px 12px 12px', padding: '8px 12px', border: '1px solid #ddd6fe', flex: 1, fontSize: 13, fontWeight: 600, color: '#4c1d95', lineHeight: 1.5 }}>
        <span style={{ marginRight: 4 }}>{moodEmoji[mood] || ''}</span>{message}
      </div>
    </div>
  );
}

const SEQUENCE_TASKS = [
  {
    prompt: 'Arithmetic sequence: 7, 11, 15, 19, ... Find term 12.',
    answer: '51',
    coach: 'Common difference is +4. Use a_n = 7 + (n-1)*4.',
  },
  {
    prompt: 'Geometric sequence: 3, 6, 12, 24, ... Find term 8.',
    answer: '384',
    coach: 'Common ratio is 2. Use a_n = 3*2^(n-1).',
  },
  {
    prompt: 'Savings starts at 200 and grows by 50 each month. Value at month 10?',
    answer: '650',
    coach: 'Arithmetic growth: a_n = 200 + (n-1)*50.',
  },
  {
    prompt: 'A balance doubles each year from 80. Balance after 5 years?',
    answer: '1280',
    coach: 'Geometric growth: a_n = 80*2^(n-1).',
  },
  {
    prompt: 'A sequence is recursive: a1=5, a_n=a_(n-1)+3. Find a_9.',
    answer: '29',
    coach: 'Add 3 repeatedly for 8 jumps after term 1.',
  },
];

function SequencePatterns({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const task = SEQUENCE_TASKS[idx % SEQUENCE_TASKS.length];
  const done = idx >= 3;
  const isCorrect = checked && input.trim() === task.answer;

  if (done) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
          Sequence Modeling: {score}/3 correct
        </p>
        <QBotBubble
          message={score >= 2
            ? 'Strong sequence work. You are connecting rules to real contexts like savings and growth.'
            : 'Good start. Keep identifying whether the pattern is additive or multiplicative before writing the rule.'}
          mood={score >= 2 ? 'celebrate' : 'encourage'}
        />
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 6px', fontSize: 11, color: COLOR.textMuted, fontWeight: 700 }}>Task {idx + 1} of 3</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Generalize a sequence and compute a target term in context.
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 800, color: COLOR.text }}>{task.prompt}</p>
      <QBotBubble message={checked ? task.coach : 'First classify the sequence: arithmetic (+d), geometric (*r), or recursive.'} mood={checked ? (isCorrect ? 'celebrate' : 'think') : 'wave'} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter answer"
          style={{ flex: 1, border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, fontWeight: 700 }}
        />
        {!checked && (
          <button type="button" onClick={() => { setChecked(true); if (input.trim() === task.answer) setScore((s) => s + 1); }} style={{ ...BTN_PRIMARY, flex: '0 0 auto' }}>
            Check
          </button>
        )}
      </div>
      {checked && (
        <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: isCorrect ? COLOR.green : COLOR.red }}>
          {isCorrect ? '\u2713 Correct term value from the sequence rule.' : `\u2717 Not correct yet. Recompute using the sequence rule; target value is ${task.answer}.`}
        </p>
      )}
      {checked && (
        <button
          type="button"
          onClick={() => { setIdx((i) => i + 1); setInput(''); setChecked(false); }}
          style={BTN_PRIMARY}
        >
          Next Task
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 0 — Function Transform
   Parent functions: linear, quadratic, absolute value, square root, cubic, exponential.
   Sliders for a, h, k. Target shown as dashed; student matches by adjusting parameters.
   ═══════════════════════════════════════════════════════════════════════════ */

const PARENT_FNS = [
  { name: 'x', fn: (x) => x, label: 'Linear (Straight Line)' },
  { name: 'x\u00B2', fn: (x) => x * x, label: 'Quadratic (Parabola)' },
  { name: '|x|', fn: (x) => Math.abs(x), label: 'Absolute Value' },
  { name: '\u221Ax', fn: (x) => (x >= 0 ? Math.sqrt(x) : undefined), label: 'Square Root' },
  { name: 'x\u00B3', fn: (x) => x ** 3, label: 'Cubic' },
  { name: '2^x', fn: (x) => 2 ** x, label: 'Exponential' },
];

/** y = a·f(x−h) + k; explicit · before numeric/functional bases (e.g. 2^(x−h)) so it is not read as a2. */
function transformEquationDisplay(parentName) {
  const inner = parentName.replace('x', '(x\u2212h)');
  if (parentName.includes('^')) {
    return `y = a\u00B7${inner} + k`;
  }
  return `y = a${inner} + k`;
}

function FunctionTransform({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const [wideLayout, setWideLayout] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 760 : false));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setWideLayout(window.innerWidth >= 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const target = useMemo(() => {
    const a = [0.5, 1, 2, -1, -0.5][rand(0, 4)];
    const h = rand(-3, 3);
    const k = rand(-3, 3);
    const fnIdx = rand(0, PARENT_FNS.length - 1);
    return { a, h, k, fnIdx };
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [a, setA] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const parent = PARENT_FNS[target.fnIdx];

  useEffect(() => { setA(1); setH(0); setK(0); }, [roundIdx]);

  const W = 340, H_SVG = 260, PAD = 36;
  const xMin = -6, xMax = 6, yMin = -6, yMax = 6;
  const sx = (v) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (v) => H_SVG - PAD - ((v - yMin) / (yMax - yMin)) * (H_SVG - 2 * PAD);

  const buildPath = (aVal, hVal, kVal, fn) => {
    const pts = [];
    for (let px = 0; px <= W; px += 2) {
      const xv = xMin + (px / W) * (xMax - xMin);
      const raw = fn(xv - hVal);
      if (raw === undefined) continue;
      const yv = aVal * raw + kVal;
      if (yv < yMin - 2 || yv > yMax + 2) continue;
      pts.push(`${sx(xv)},${sy(yv)}`);
    }
    return pts.length > 1 ? `M${pts.join('L')}` : '';
  };

  const studentPath = buildPath(a, h, k, parent.fn);
  const targetPath = buildPath(target.a, target.h, target.k, parent.fn);

  const isMatch = Math.abs(a - target.a) < 0.1 && Math.abs(h - target.h) < 0.5 && Math.abs(k - target.k) < 0.5;
  const transformDistance = roundTo(Math.abs(a - target.a) + Math.abs(h - target.h) + Math.abs(k - target.k), 2);

  const getQBotMsg = () => {
    if (isMatch) return { msg: 'Perfect match! You can see how a, h, and k each affect the graph shape and position.', mood: 'celebrate' };
    const hints = [];
    if (Math.abs(a - target.a) >= 0.1) hints.push(target.a < 0 ? 'Try flipping the graph (negative a)' : Math.abs(target.a) < 1 ? 'The target is wider \u2014 try a smaller |a|' : 'The target is narrower \u2014 try a larger |a|');
    if (Math.abs(h - target.h) >= 0.5) hints.push(target.h > 0 ? 'Shift right (increase h)' : 'Shift left (decrease h)');
    if (Math.abs(k - target.k) >= 0.5) hints.push(target.k > 0 ? 'Shift up (increase k)' : 'Shift down (decrease k)');
    return { msg: hints[0] || 'Adjust the sliders to match the dashed target curve.', mood: hints.length <= 1 ? 'encourage' : 'think' };
  };

  const qbot = getQBotMsg();

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Transform: {transformEquationDisplay(parent.name)}
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Match the solid graph to the dashed target using a, h, and k across different function families.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Adjust a, h, k with the sliders to match the <span style={{ color: '#d97706', fontWeight: 700 }}>dashed target</span> curve.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Parent: {parent.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isMatch ? '#047857' : '#9a3412', background: isMatch ? '#ecfdf5' : '#fff7ed', border: `1px solid ${isMatch ? '#86efac' : '#fdba74'}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {isMatch ? 'Matched' : `Distance ${transformDistance}`}
        </span>
      </div>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      <div style={{ display: 'flex', flexDirection: wideLayout ? 'row' : 'column', gap: 12, alignItems: 'stretch', marginBottom: 12 }}>
        {/* Graph panel */}
        <div style={{ flex: wideLayout ? '1 1 60%' : '1 1 auto', minWidth: 0 }}>
          <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: wideLayout ? 6 : 8 }}>
            <svg viewBox={`0 0 ${W} ${H_SVG}`} width="100%" style={{ display: 'block', maxWidth: wideLayout ? 480 : '100%', margin: '0 auto' }}>
              <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="#d1d5db" strokeWidth={1.5} />
              <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H_SVG - PAD} stroke="#d1d5db" strokeWidth={1.5} />
              {Array.from({ length: 13 }, (_, i) => i - 6).map((v) => (
                <g key={v}>
                  {v !== 0 && <text x={sx(v)} y={sy(0) + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{v}</text>}
                  {v !== 0 && <text x={sx(0) - 8} y={sy(v) + 3} fontSize={8} fill="#9ca3af" textAnchor="end">{v}</text>}
                </g>
              ))}
              <path d={targetPath} fill="none" stroke="#d97706" strokeWidth={2.5} strokeDasharray="6 3" opacity={0.8} />
              <path d={studentPath} fill="none" stroke={isMatch ? COLOR.green : COLOR.blue} strokeWidth={2.5} opacity={0.9} />
            </svg>
          </div>
          {/* Live equation readout — sits below graph so it's always visible */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
            <div style={{ padding: '5px 12px', borderRadius: 10, background: isMatch ? COLOR.greenLight : '#eff6ff', border: `1px solid ${isMatch ? COLOR.greenBorder : '#93c5fd'}`, fontSize: 12, fontWeight: 700, color: isMatch ? COLOR.green : COLOR.blue }}>
              y = {a}{parent.name.replace('x', `(x${h >= 0 ? '\u2212' : '+'}${Math.abs(h)})`)} {k >= 0 ? '+' : '\u2212'} {Math.abs(k)}
            </div>
            <div style={{ padding: '5px 12px', borderRadius: 10, background: transformDistance <= 0.6 ? '#ecfdf5' : '#fff7ed', border: `1px solid ${transformDistance <= 0.6 ? '#86efac' : '#fdba74'}`, fontSize: 11, fontWeight: 700, color: transformDistance <= 0.6 ? '#047857' : '#9a3412' }}>
              Distance: {transformDistance}
            </div>
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ flex: wideLayout ? '0 0 260px' : '1 1 auto', background: '#fff', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: '12px 14px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: COLOR.textSecondary, marginBottom: 2 }}>
            Adjust parameters
          </div>
          <div style={{ padding: '6px 10px', borderRadius: 8, background: '#eef2ff', border: '1px solid #c7d2fe', fontSize: 11, color: '#3730a3', lineHeight: 1.4 }}>
            Move one slider at a time: <strong>a</strong> (shape/flip), <strong>h</strong> (left/right), <strong>k</strong> (up/down).
          </div>
          {[
            { label: 'a', desc: 'stretch / flip', val: a, set: setA, min: -3, max: 3, step: 0.5, color: '#2563eb' },
            { label: 'h', desc: 'horizontal shift', val: h, set: setH, min: -5, max: 5, step: 1, color: '#059669' },
            { label: 'k', desc: 'vertical shift', val: k, set: setK, min: -5, max: 5, step: 1, color: '#7c3aed' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: s.color }}>{s.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: COLOR.textSecondary }}>{s.desc}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                  onChange={(e) => s.set(parseFloat(e.target.value))}
                  aria-label={`${s.label} — ${s.desc}`}
                  style={{ flex: 1, accentColor: s.color }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: s.color, minWidth: 32, textAlign: 'right' }}>{s.val}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, background: isMatch ? '#ecfdf5' : '#f8fafc', border: `1px solid ${isMatch ? '#86efac' : '#e5e7eb'}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isMatch ? COLOR.green : '#d97706', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: isMatch ? COLOR.green : '#92400e' }}>
              {isMatch ? 'Matched!' : 'Keep adjusting'}
            </span>
          </div>
        </div>
      </div>

      {isMatch && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Perfect match! You aligned shape and shifts.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Target
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

const MACHINE_RULES = [
  { display: 'y = 2x + 1', fn: (x) => 2 * x + 1, coach: 'Double x, then add 1.' },
  { display: 'y = x² − 3', fn: (x) => (x * x) - 3, coach: 'Square first, then subtract 3.' },
  { display: 'y = |x − 2| + 1', fn: (x) => Math.abs(x - 2) + 1, coach: 'Shift right by 2 inside absolute value.' },
  { display: 'y = -x + 4', fn: (x) => -x + 4, coach: 'Flip then shift up.' },
  { display: 'y = 3(x − 1)', fn: (x) => 3 * (x - 1), coach: 'Shift right 1, then multiply by 3.' },
];

function FunctionMachine({ onComplete, continueLabel, badgeLabel, embedded }) {
  const totalRounds = 3;
  const [roundIdx, setRoundIdx] = useState(0);
  const [inputValue, setInputValue] = useState('0');
  const [guessValue, setGuessValue] = useState('');
  const [machineState, setMachineState] = useState('idle'); // idle | running | done
  const [lastOutput, setLastOutput] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef(null);

  const task = useMemo(() => {
    const rule = MACHINE_RULES[rand(0, MACHINE_RULES.length - 1)];
    const seedInput = rand(-6, 6);
    return { rule, seedInput, seedOutput: roundTo(rule.fn(seedInput), 2) };
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setInputValue(String(task.seedInput));
    setGuessValue('');
    setMachineState('idle');
    setLastOutput(null);
    setChecked(false);
  }, [task]);

  const numericInput = Number(inputValue);
  const isInputValid = Number.isFinite(numericInput);
  const expectedOutput = isInputValid ? roundTo(task.rule.fn(numericInput), 2) : null;
  const canCheck = machineState === 'done' && guessValue.trim().length > 0 && expectedOutput !== null;
  const isCorrect = canCheck && Number(guessValue) === expectedOutput;

  const playCue = useCallback((frequency, duration = 0.08, type = 'sine') => {
    if (!soundOn || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Audio is optional; ignore unsupported contexts.
    }
  }, [soundOn]);

  useEffect(() => () => {
    try { audioCtxRef.current?.close?.(); } catch {}
  }, []);

  const runMachine = useCallback(() => {
    if (!isInputValid) return;
    setChecked(false);
    setMachineState('running');
    playCue(460, 0.07, 'square');
    window.setTimeout(() => {
      setLastOutput(expectedOutput);
      setMachineState('done');
      playCue(740, 0.09, 'triangle');
    }, 700);
  }, [isInputValid, expectedOutput, playCue]);

  const onCheck = useCallback(() => {
    if (!canCheck) return;
    setChecked(true);
    if (isCorrect) {
      setScore((s) => s + 1);
      playCue(880, 0.08, 'sine');
      window.setTimeout(() => playCue(1040, 0.08, 'sine'), 90);
    } else {
      playCue(220, 0.12, 'sawtooth');
    }
  }, [canCheck, isCorrect, playCue]);

  if (roundIdx >= totalRounds) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
          Function Machine: {score}/{totalRounds} correct
        </p>
        <QBotBubble
          message={score >= 2
            ? 'Great work translating rules into outputs. This is function reasoning in action.'
            : 'Nice attempt. Keep applying operations in the exact order shown by the rule.'}
          mood={score >= 2 ? 'celebrate' : 'encourage'}
        />
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 11, color: COLOR.textMuted, fontWeight: 700 }}>Task {roundIdx + 1} of {totalRounds}</p>
      <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Function Machine: {task.rule.display}
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Enter x, run the machine, and predict the output y.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Touch friendly controls: tap + / − to change input quickly, then tap Run Machine.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary }}>
          Status: {machineState === 'running' ? 'Machine running...' : machineState === 'done' ? 'Output ready' : 'Ready'}
        </span>
        <button
          type="button"
          onClick={() => setSoundOn((v) => !v)}
          style={{
            borderRadius: 999,
            border: `1px solid ${soundOn ? '#86efac' : COLOR.border}`,
            background: soundOn ? '#ecfdf5' : '#fff',
            color: soundOn ? '#166534' : COLOR.textSecondary,
            fontSize: 11,
            fontWeight: 800,
            padding: '5px 10px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Sound: {soundOn ? 'On' : 'Off'}
        </button>
      </div>

      <QBotBubble
        message={checked
          ? (isCorrect
            ? 'Correct output. You processed the rule correctly.'
            : `${task.rule.coach} For x = ${inputValue}, y = ${expectedOutput}.`)
          : task.rule.coach}
        mood={checked ? (isCorrect ? 'celebrate' : 'think') : 'wave'}
      />

      <div style={{ marginBottom: 12, borderRadius: 14, border: `1px solid ${COLOR.border}`, background: '#f8fafc', padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 10, alignItems: 'center' }}>
          <div style={{ borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>INPUT x</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLOR.blue }}>{inputValue}</div>
          </div>
          <div style={{ borderRadius: 12, border: '1px solid #0f172a', background: 'linear-gradient(180deg,#1f2937,#111827)', padding: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#cbd5e1', textAlign: 'center', marginBottom: 6 }}>
              Function Machine
            </div>
            <div style={{ position: 'relative', height: 42, borderRadius: 999, border: '1px solid #334155', overflow: 'hidden', background: '#0f172a' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(90deg,rgba(148,163,184,0.24) 0px, rgba(148,163,184,0.24) 10px, rgba(30,41,59,0.4) 10px, rgba(30,41,59,0.4) 20px)',
                transform: machineState === 'running' ? 'translateX(-18px)' : 'translateX(0)',
                transition: machineState === 'running' ? 'transform 0.7s linear' : 'transform 0.2s ease',
              }}
              />
              <div style={{
                position: 'absolute',
                top: 9,
                left: machineState === 'running' ? '74%' : '6%',
                width: 24,
                height: 24,
                borderRadius: 6,
                background: 'linear-gradient(135deg,#60a5fa,#2563eb)',
                border: '1px solid #bfdbfe',
                boxShadow: '0 0 0 2px rgba(30,64,175,0.2)',
                transition: 'left 0.65s cubic-bezier(.22,.8,.28,1)',
              }}
              />
            </div>
            <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#cbd5e1', textAlign: 'center' }}>
              {machineState === 'running' ? 'Processing input...' : machineState === 'done' ? 'Output generated' : 'Tap Run Machine'}
            </div>
          </div>
          <div style={{ borderRadius: 10, background: '#f3e8ff', border: '1px solid #ddd6fe', padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', marginBottom: 4 }}>OUTPUT y</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLOR.purple }}>
              {machineState === 'done' ? String(lastOutput) : '?'}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 8, borderRadius: 10, background: '#ffffff', border: `1px solid ${COLOR.border}`, padding: '8px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, marginBottom: 2 }}>Machine rule</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLOR.text }}>{task.rule.display}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            aria-label="Decrease input value"
            onClick={() => setInputValue((v) => String((Number(v || 0) - 1)))}
            style={{ ...BTN_PRIMARY, width: 46, minHeight: 42, padding: 0 }}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 16, fontWeight: 700, textAlign: 'center' }}
            aria-label="Input x value"
          />
          <button
            type="button"
            aria-label="Increase input value"
            onClick={() => setInputValue((v) => String((Number(v || 0) + 1)))}
            style={{ ...BTN_PRIMARY, width: 46, minHeight: 42, padding: 0 }}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={runMachine}
          disabled={!isInputValid || machineState === 'running'}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', opacity: (!isInputValid || machineState === 'running') ? 0.65 : 1 }}
        >
          {machineState === 'running' ? 'Running...' : 'Run Machine'}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            inputMode="numeric"
            value={guessValue}
            onChange={(e) => setGuessValue(e.target.value)}
            placeholder="Predict output y"
            style={{ border: `1px solid ${COLOR.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, fontWeight: 700 }}
            aria-label="Predicted output y value"
          />
          <button
            type="button"
            onClick={onCheck}
            disabled={!canCheck}
            style={{ ...BTN_PRIMARY, opacity: canCheck ? 1 : 0.55, cursor: canCheck ? 'pointer' : 'not-allowed' }}
          >
            Check
          </button>
        </div>
      </div>

      {checked && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: isCorrect ? COLOR.greenLight : '#fef2f2', border: `1px solid ${isCorrect ? COLOR.greenBorder : '#fca5a5'}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isCorrect ? COLOR.green : '#ef4444' }}>
            {isCorrect ? '✓ Correct output.' : `✗ Not yet. Correct output is ${expectedOutput}.`}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setRoundIdx((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}
        >
          Next Task
        </button>
        <button type="button" onClick={() => setRoundIdx(totalRounds)} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>
          {continueLabel}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 1 — Quadratic Explorer
   Drag the vertex (h, k) and one extra point to define a parabola.
   Equation updates live in vertex form y = a(x-h)² + k.
   ═══════════════════════════════════════════════════════════════════════════ */

function QuadraticExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);

  const targetPts = useMemo(() => {
    const th = rand(-3, 3);
    const tk = rand(-4, 3);
    const ta = [0.5, 1, -0.5, -1, 2, -2][rand(0, 5)];
    return { h: th, k: tk, a: ta };
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [vertexX, setVertexX] = useState(0);
  const [vertexY, setVertexY] = useState(0);
  const [extraX, setExtraX] = useState(2);
  const [extraY, setExtraY] = useState(4);
  const svgRef = useRef(null);
  const dragging = useRef(null);

  useEffect(() => { setVertexX(0); setVertexY(0); setExtraX(2); setExtraY(4); }, [roundIdx]);

  const W = 340, H_SVG = 260, PAD = 36;
  const xMin = -6, xMax = 6, yMin = -6, yMax = 6;
  const sx = (v) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (v) => H_SVG - PAD - ((v - yMin) / (yMax - yMin)) * (H_SVG - 2 * PAD);
  const fromSx = (px) => clamp(roundTo(xMin + ((px - PAD) / (W - 2 * PAD)) * (xMax - xMin), 1), xMin, xMax);
  const fromSy = (py) => clamp(roundTo(yMax - ((py - PAD) / (H_SVG - 2 * PAD)) * (yMax - yMin), 1), yMin, yMax);

  const dx = extraX - vertexX;
  const safeDx = Math.abs(dx) < 0.2 ? (dx < 0 ? -0.2 : 0.2) : dx;
  const dy = extraY - vertexY;
  const studentA = roundTo(dy / (safeDx * safeDx), 2);

  const buildParabola = (aVal, hVal, kVal) => {
    const pts = [];
    for (let px = 0; px <= W; px += 2) {
      const xv = xMin + (px / W) * (xMax - xMin);
      const yv = aVal * (xv - hVal) ** 2 + kVal;
      if (yv < yMin - 2 || yv > yMax + 2) continue;
      pts.push(`${sx(xv)},${sy(yv)}`);
    }
    return pts.length > 1 ? `M${pts.join('L')}` : '';
  };

  const studentPath = buildParabola(studentA, vertexX, vertexY);
  const targetPath = buildParabola(targetPts.a, targetPts.h, targetPts.k);

  const isMatch = Math.abs(studentA - targetPts.a) < 0.3 && Math.abs(vertexX - targetPts.h) < 0.5 && Math.abs(vertexY - targetPts.k) < 0.5;
  const fitDistance = roundTo(Math.abs(studentA - targetPts.a) + Math.abs(vertexX - targetPts.h) + Math.abs(vertexY - targetPts.k), 2);

  const getPointerPos = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const touchPoint = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touchPoint ? touchPoint.clientX : e.clientX;
    const clientY = touchPoint ? touchPoint.clientY : e.clientY;
    const px = (clientX - rect.left) * (W / rect.width);
    const py = (clientY - rect.top) * (H_SVG / rect.height);
    return { x: fromSx(px), y: fromSy(py) };
  }, []);

  const onPointerDown = useCallback((which, e) => { e.preventDefault(); dragging.current = which; }, []);
  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    if (dragging.current === 'vertex') { setVertexX(x); setVertexY(y); }
    else { setExtraX(x); setExtraY(y); }
  }, [getPointerPos]);
  const onPointerUp = useCallback(() => { dragging.current = null; }, []);
  const nudgeHandle = useCallback((which, dxStep, dyStep) => {
    if (which === 'vertex') {
      setVertexX((v) => clamp(roundTo(v + dxStep, 1), xMin, xMax));
      setVertexY((v) => clamp(roundTo(v + dyStep, 1), yMin, yMax));
    } else {
      setExtraX((v) => clamp(roundTo(v + dxStep, 1), xMin, xMax));
      setExtraY((v) => clamp(roundTo(v + dyStep, 1), yMin, yMax));
    }
  }, [xMin, xMax, yMin, yMax]);

  const roots = useMemo(() => {
    if (studentA === 0) return [];
    const disc = -vertexY / studentA;
    if (disc < 0) return [];
    if (disc === 0) return [vertexX];
    return [roundTo(vertexX - Math.sqrt(disc), 2), roundTo(vertexX + Math.sqrt(disc), 2)];
  }, [studentA, vertexX, vertexY]);

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Shape the Parabola</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Move V and P to match the dashed parabola.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Drag the <span style={{ color: COLOR.green, fontWeight: 700 }}>green vertex</span> and the <span style={{ color: COLOR.purple, fontWeight: 700 }}>purple point</span> to match the <span style={{ color: '#d97706', fontWeight: 700 }}>dashed target</span>.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Vertex target: ({targetPts.h}, {targetPts.k})
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isMatch ? '#047857' : '#9a3412', background: isMatch ? '#ecfdf5' : '#fff7ed', border: `1px solid ${isMatch ? '#86efac' : '#fdba74'}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {isMatch ? 'Matched' : `Distance ${fitDistance}`}
        </span>
      </div>

      <QBotBubble
        message={isMatch ? 'You matched the target parabola! Notice how the vertex (h, k) sets the position, and the extra point determines how wide or narrow it opens.' : 'The vertex controls position. The second point controls the width (a-value). A negative a flips the parabola upside down.'}
        mood={isMatch ? 'celebrate' : 'wave'}
      />
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12, color: '#0c4a6e', lineHeight: 1.45 }}>
        <strong>How to use:</strong> Focus a handle and use arrow keys to nudge it. Match position first, then width/opening.
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 8, marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H_SVG}`} width="100%" style={{ display: 'block' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          <line x1={PAD} y1={sy(0)} x2={W - PAD} y2={sy(0)} stroke="#d1d5db" strokeWidth={1.5} />
          <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={H_SVG - PAD} stroke="#d1d5db" strokeWidth={1.5} />
          {Array.from({ length: 13 }, (_, i) => i - 6).filter((v) => v !== 0).map((v) => (
            <g key={v}>
              <text x={sx(v)} y={sy(0) + 14} fontSize={8} fill="#9ca3af" textAnchor="middle">{v}</text>
              <text x={sx(0) - 8} y={sy(v) + 3} fontSize={8} fill="#9ca3af" textAnchor="end">{v}</text>
            </g>
          ))}
          <path d={targetPath} fill="none" stroke="#d97706" strokeWidth={2.5} strokeDasharray="6 3" opacity={0.7} />
          <path d={studentPath} fill="none" stroke={isMatch ? COLOR.green : COLOR.blue} strokeWidth={2.5} />
          {/* vertex handle */}
          <g style={{ cursor: 'move' }} onMouseDown={(e) => onPointerDown('vertex', e)} onTouchStart={(e) => onPointerDown('vertex', e)}
            role="button" tabIndex={0} aria-label={`Vertex handle at ${vertexX}, ${vertexY}. Use arrow keys to move.`}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeHandle('vertex', -0.2, 0); }
              if (e.key === 'ArrowRight') { e.preventDefault(); nudgeHandle('vertex', 0.2, 0); }
              if (e.key === 'ArrowUp') { e.preventDefault(); nudgeHandle('vertex', 0, 0.2); }
              if (e.key === 'ArrowDown') { e.preventDefault(); nudgeHandle('vertex', 0, -0.2); }
            }}>
            <circle cx={sx(vertexX)} cy={sy(vertexY)} r={10} fill={COLOR.green} stroke="#fff" strokeWidth={2.5} />
            <text x={sx(vertexX)} y={sy(vertexY) + 3.5} fontSize={8} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>V</text>
          </g>
          {/* extra point handle */}
          <g style={{ cursor: 'move' }} onMouseDown={(e) => onPointerDown('extra', e)} onTouchStart={(e) => onPointerDown('extra', e)}
            role="button" tabIndex={0} aria-label={`Point handle at ${extraX}, ${extraY}. Use arrow keys to move.`}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeHandle('extra', -0.2, 0); }
              if (e.key === 'ArrowRight') { e.preventDefault(); nudgeHandle('extra', 0.2, 0); }
              if (e.key === 'ArrowUp') { e.preventDefault(); nudgeHandle('extra', 0, 0.2); }
              if (e.key === 'ArrowDown') { e.preventDefault(); nudgeHandle('extra', 0, -0.2); }
            }}>
            <circle cx={sx(extraX)} cy={sy(extraY)} r={10} fill={COLOR.purple} stroke="#fff" strokeWidth={2.5} />
            <text x={sx(extraX)} y={sy(extraY) + 3.5} fontSize={8} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>P</text>
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ padding: '6px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 13, fontWeight: 700, color: COLOR.blue, textAlign: 'center' }}>
          y = {studentA}(x {vertexX >= 0 ? '\u2212' : '+'} {Math.abs(vertexX)}){'\u00B2'} {vertexY >= 0 ? '+' : '\u2212'} {Math.abs(vertexY)}
        </div>
        {roots.length > 0 && (
          <div style={{ padding: '6px 14px', borderRadius: 10, background: '#faf5ff', border: '1px solid #ddd6fe', fontSize: 12, fontWeight: 600, color: COLOR.purple }}>
            Roots: {roots.join(', ')}
          </div>
        )}
      </div>

      {isMatch && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Matched the target parabola with accurate vertex-form control.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Target
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Trig Circle
   Unit circle: drag a point around the circle. See sin, cos, tan update
   in real time. Tasks ask student to find specific angle values.
   ═══════════════════════════════════════════════════════════════════════════ */

const TRIG_TASKS = [
  { prompt: 'Drag to the angle where sin = 0.5', check: (deg) => Math.abs(Math.sin(deg * Math.PI / 180) - 0.5) < 0.08 },
  { prompt: 'Drag to the angle where cos = 0', check: (deg) => Math.abs(Math.cos(deg * Math.PI / 180)) < 0.08 },
  { prompt: 'Drag to the angle where sin = \u2212\u00BD', check: (deg) => Math.abs(Math.sin(deg * Math.PI / 180) + 0.5) < 0.08 },
  { prompt: 'Drag to 45° (where sin = cos)', check: (deg) => Math.abs(Math.sin(deg * Math.PI / 180) - Math.cos(deg * Math.PI / 180)) < 0.08 },
  { prompt: 'Drag to the angle where tan = 1', check: (deg) => Math.abs(Math.tan(deg * Math.PI / 180) - 1) < 0.15 && Math.cos(deg * Math.PI / 180) > 0.1 },
  { prompt: 'Drag to 180°', check: (deg) => Math.abs(((deg % 360) + 360) % 360 - 180) < 8 },
];

function TrigCircle({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [angle, setAngle] = useState(0);
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const task = TRIG_TASKS[taskIdx % TRIG_TASKS.length];
  const totalTasks = 3;
  const done = roundIdx >= totalTasks;

  useEffect(() => { setAngle(0); setChecked(false); }, [taskIdx]);

  const W = 300, H_SVG = 300, CX = 150, CY = 150, R = 110;
  const rad = angle * Math.PI / 180;
  const px = CX + R * Math.cos(rad);
  const py = CY - R * Math.sin(rad);
  const sinVal = roundTo(Math.sin(rad), 3);
  const cosVal = roundTo(Math.cos(rad), 3);
  const tanVal = Math.abs(Math.cos(rad)) > 0.01 ? roundTo(Math.tan(rad), 3) : 'undef';
  const degDisplay = ((Math.round(angle) % 360) + 360) % 360;
  const radDisplay = roundTo(angle * Math.PI / 180, 3);

  const isCorrect = task.check(angle);

  const getAngleFromPointer = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const touchPoint = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touchPoint ? touchPoint.clientX : e.clientX;
    const clientY = touchPoint ? touchPoint.clientY : e.clientY;
    const x = (clientX - rect.left) * (W / rect.width) - CX;
    const y = CY - (clientY - rect.top) * (H_SVG / rect.height);
    let deg = Math.atan2(y, x) * 180 / Math.PI;
    if (deg < 0) deg += 360;
    return Math.round(deg);
  }, []);

  const onPointerDown = useCallback((e) => { e.preventDefault(); dragging.current = true; setAngle(getAngleFromPointer(e)); }, [getAngleFromPointer]);
  const onPointerMove = useCallback((e) => { if (!dragging.current) return; e.preventDefault(); setAngle(getAngleFromPointer(e)); }, [getAngleFromPointer]);
  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  const handleCheck = () => {
    setChecked(true);
    if (isCorrect) setScore((s) => s + 1);
  };
  const handleNext = () => {
    setTaskIdx((i) => i + 1);
    setRound((r) => r + 1);
  };

  if (done) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
        <p style={{ fontSize: 16, fontWeight: 800, color: COLOR.text, margin: '0 0 8px' }}>
          Unit Circle: {score}/{totalTasks} correct!
        </p>
        <QBotBubble
          message={score === totalTasks ? 'Strong unit-circle accuracy: sin corresponds to y, cos to x, and tan = sin/cos.' : 'Rework missed prompts by matching each target value to x = cos\u03B8 and y = sin\u03B8 on the circle.'}
          mood={score === totalTasks ? 'celebrate' : 'encourage'}
        />
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 11, color: COLOR.textMuted, fontWeight: 700 }}>Task {roundIdx + 1} of {totalTasks}</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Place the point at the angle that satisfies the prompt.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>{task.prompt}</p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {roundIdx}/{totalTasks} completed
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Score: {score}
        </span>
      </div>

      <QBotBubble
        message={checked ? (isCorrect ? 'Correct angle relationship: the reference triangle confirms sin and cos as vertical and horizontal lengths.' : `Not correct yet. The target trig condition (sin, cos, or tan) was not met at ${degDisplay}°. Compare the live values and adjust to the required angle.`) : 'Drag the blue point around the unit circle. Watch how sin, cos, and tan change with the angle.'}
        mood={checked ? (isCorrect ? 'celebrate' : 'think') : 'wave'}
      />
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#14532d', lineHeight: 1.45 }}>
        <strong>How to use:</strong> Drag the point (or use left/right arrows). Start with special angles: 0°, 30°, 45°, 60°, 90°.
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 8, marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H_SVG}`} width="100%" style={{ display: 'block' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          {/* grid lines */}
          <line x1={CX} y1={10} x2={CX} y2={H_SVG - 10} stroke="#e5e7eb" strokeWidth={1} />
          <line x1={10} y1={CY} x2={W - 10} y2={CY} stroke="#e5e7eb" strokeWidth={1} />
          {/* quadrant labels */}
          <text x={CX + R / 2} y={CY - R / 2} fontSize={10} fill="#d1d5db" textAnchor="middle" fontWeight={700}>I</text>
          <text x={CX - R / 2} y={CY - R / 2} fontSize={10} fill="#d1d5db" textAnchor="middle" fontWeight={700}>II</text>
          <text x={CX - R / 2} y={CY + R / 2 + 10} fontSize={10} fill="#d1d5db" textAnchor="middle" fontWeight={700}>III</text>
          <text x={CX + R / 2} y={CY + R / 2 + 10} fontSize={10} fill="#d1d5db" textAnchor="middle" fontWeight={700}>IV</text>
          {/* axis labels */}
          <text x={W - 8} y={CY - 6} fontSize={9} fill="#6b7280" textAnchor="end">1</text>
          <text x={12} y={CY - 6} fontSize={9} fill="#6b7280" textAnchor="start">{'\u22121'}</text>
          <text x={CX + 6} y={18} fontSize={9} fill="#6b7280">1</text>
          <text x={CX + 6} y={H_SVG - 10} fontSize={9} fill="#6b7280">{'\u22121'}</text>
          {/* unit circle */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke={COLOR.border} strokeWidth={2} />
          {/* reference triangle */}
          <line x1={CX} y1={CY} x2={px} y2={py} stroke={COLOR.blue} strokeWidth={2} opacity={0.6} />
          <line x1={px} y1={py} x2={px} y2={CY} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.7} />
          <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#059669" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.7} />
          {/* cos label */}
          <text x={(CX + px) / 2} y={CY + 14} fontSize={9} fill="#059669" textAnchor="middle" fontWeight={700}>cos</text>
          {/* sin label */}
          <text x={px + 10} y={(CY + py) / 2} fontSize={9} fill="#ef4444" fontWeight={700}>sin</text>
          {/* angle arc */}
          {angle > 0 && angle < 360 && (() => {
            const arcR = 24;
            const endX = CX + arcR * Math.cos(rad);
            const endY = CY - arcR * Math.sin(rad);
            const large = angle > 180 ? 1 : 0;
            return <path d={`M${CX + arcR},${CY} A${arcR},${arcR} 0 ${large} 0 ${endX},${endY}`} fill="none" stroke="#d97706" strokeWidth={1.5} />;
          })()}
          {/* draggable point */}
          <g style={{ cursor: 'grab' }} onMouseDown={onPointerDown} onTouchStart={onPointerDown}
            role="button" tabIndex={0}
            aria-label={`Unit circle point at ${degDisplay} degrees. Use left and right arrow keys to rotate.`}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { e.preventDefault(); setAngle((a0) => (a0 - 5 + 360) % 360); }
              if (e.key === 'ArrowRight') { e.preventDefault(); setAngle((a0) => (a0 + 5) % 360); }
            }}>
            <circle cx={px} cy={py} r={12} fill={COLOR.blue} stroke="#fff" strokeWidth={2.5} opacity={0.9} />
          </g>
        </svg>
      </div>

      {/* live readout */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 12, fontWeight: 700, color: COLOR.blue }}>
          {degDisplay}° ({radDisplay} rad)
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac', fontSize: 12, fontWeight: 700, color: '#059669' }}>
          cos = {cosVal}
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fca5a5', fontSize: 12, fontWeight: 700, color: '#ef4444' }}>
          sin = {sinVal}
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: '#faf5ff', border: '1px solid #ddd6fe', fontSize: 12, fontWeight: 700, color: COLOR.purple }}>
          tan = {tanVal}
        </div>
      </div>

      {checked && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: isCorrect ? COLOR.greenLight : '#fef2f2', border: `1px solid ${isCorrect ? COLOR.greenBorder : '#fca5a5'}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isCorrect ? COLOR.green : '#ef4444' }}>
            {isCorrect ? '\u2713 Correct angle placement for the trig condition.' : '\u2717 Not correct yet - revisit the target trig value and reposition the point.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={handleCheck}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Check
          </button>
        )}
        {checked && (
          <button type="button" onClick={handleNext} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>
            {roundIdx < totalTasks - 1 ? 'Next Task' : continueLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main export — rotates mode by activityIndex
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['function-transform', 'quadratic', 'trig-circle', 'sequence-patterns'];

export default function AlgebraExplorer({ activityIndex = 0, mode, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const resolvedMode = mode || MODES[activityIndex % MODES.length];
  if (resolvedMode === 'sequence-patterns') return <SequencePatterns onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (resolvedMode === 'function-transform') return <FunctionMachine onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (resolvedMode === 'function-transform-legacy') return <FunctionTransform onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (resolvedMode === 'quadratic') return <QuadraticExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <TrigCircle onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
