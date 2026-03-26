/**
 * ComplexPlaneExplorer — Interactive complex-number manipulative.
 *
 * Each round generates a random complex-number task (plot a+bi, find modulus,
 * identify conjugate, compute power of i) and the student taps the grid or
 * picks the right answer. Three rounds per session.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE } from '../utils/loopStyles';

const W = 320;
const H = 280;
const PAD = 36;
const SCALE = 28;
const AXIS_LIM = 5;
const SNAP = 1;

function toScreen(re, im) {
  return { x: W / 2 + re * SCALE, y: H / 2 - im * SCALE };
}
function toMath(sx, sy) {
  const re = Math.round((sx - W / 2) / SCALE / SNAP) * SNAP;
  const im = Math.round((H / 2 - sy) / SCALE / SNAP) * SNAP;
  return { re, im };
}
function fmtComplex(re, im) {
  if (im === 0) return `${re}`;
  const sign = im > 0 ? '+' : '\u2212';
  const absIm = Math.abs(im);
  const imStr = absIm === 1 ? 'i' : `${absIm}i`;
  if (re === 0) return im > 0 ? imStr : `\u2212${absIm === 1 ? 'i' : absIm + 'i'}`;
  return `${re} ${sign} ${imStr}`;
}

function seededRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return () => { h = (h * 16807 + 0) & 0x7fffffff; return (h & 0xffff) / 0xffff; };
}

function generateRound(index) {
  const rng = seededRand(`complex-${Date.now()}-${index}`);
  const randInt = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const types = ['plot', 'identify', 'conjugate', 'modulus', 'power-of-i'];
  const type = types[index % types.length];

  if (type === 'plot') {
    const re = randInt(-4, 4);
    const im = randInt(-4, 4);
    if (re === 0 && im === 0) return generateRound(index + 5);
    return { type, re, im, prompt: `Tap the complex plane to plot ${fmtComplex(re, im)}` };
  }
  if (type === 'identify') {
    const re = randInt(-4, 4);
    const im = randInt(-4, 4);
    if (re === 0 && im === 0) return generateRound(index + 5);
    const correct = fmtComplex(re, im);
    const wrong1 = fmtComplex(im, re);
    const wrong2 = fmtComplex(-re, im);
    const wrong3 = fmtComplex(re, -im);
    const choices = [correct, wrong1, wrong2, wrong3].filter((v, i, a) => a.indexOf(v) === i);
    while (choices.length < 4) choices.push(fmtComplex(randInt(-4, 4), randInt(-4, 4)));
    const unique = [...new Set(choices)].slice(0, 4);
    unique.sort(() => rng() - 0.5);
    return { type, re, im, correct, choices: unique, prompt: 'Which complex number is shown on the plane?' };
  }
  if (type === 'conjugate') {
    const re = randInt(-4, 4);
    const im = randInt(1, 4) * (rng() > 0.5 ? 1 : -1);
    const correct = fmtComplex(re, -im);
    const choices = [correct, fmtComplex(-re, im), fmtComplex(-re, -im), fmtComplex(re, im)];
    const unique = [...new Set(choices)].slice(0, 4);
    unique.sort(() => rng() - 0.5);
    return { type, re, im, correct, choices: unique, prompt: `What is the conjugate of ${fmtComplex(re, im)}?` };
  }
  if (type === 'modulus') {
    const pairs = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [1, 0, 1], [0, 3, 3], [4, 3, 5], [2, 2, '2\u221A2']];
    const [re, im, mod] = pairs[Math.floor(rng() * pairs.length)];
    const correct = String(mod);
    const wrong = [`${re + im}`, `${Math.abs(re - im)}`, `${re * im}`].filter(w => w !== correct);
    const choices = [correct, ...wrong.slice(0, 3)];
    while (choices.length < 4) choices.push(String(randInt(1, 15)));
    const unique = [...new Set(choices)].slice(0, 4);
    unique.sort(() => rng() - 0.5);
    return { type, re, im, correct, choices: unique, prompt: `What is |${fmtComplex(re, im)}| (the modulus)?` };
  }
  // power-of-i
  const exp = randInt(2, 25);
  const cycle = ['1', 'i', '\u22121', '\u2212i'];
  const correct = cycle[exp % 4];
  const choices = ['1', 'i', '\u22121', '\u2212i'];
  return { type, exp, correct, choices, prompt: `Simplify: i^${exp}` };
}

const TOTAL_ROUNDS = 3;

export default function ComplexPlaneExplorer({ onComplete, continueLabel = 'Continue', badgeLabel, embedded = false }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [tappedPoint, setTappedPoint] = useState(null);

  const task = useMemo(() => generateRound(round), [round]);
  const done = round >= TOTAL_ROUNDS;

  const handleGridClick = useCallback((e) => {
    if (submitted || task.type !== 'plot') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { re, im } = toMath(sx, sy);
    const clamped = { re: Math.max(-AXIS_LIM, Math.min(AXIS_LIM, re)), im: Math.max(-AXIS_LIM, Math.min(AXIS_LIM, im)) };
    setTappedPoint(clamped);
  }, [submitted, task.type]);

  const handleCheck = useCallback(() => {
    setSubmitted(true);
    if (task.type === 'plot') {
      if (tappedPoint && tappedPoint.re === task.re && tappedPoint.im === task.im) setScore((s) => s + 1);
    } else {
      if (selectedAnswer === task.correct) setScore((s) => s + 1);
    }
  }, [task, tappedPoint, selectedAnswer]);

  const isCorrect = task.type === 'plot'
    ? tappedPoint && tappedPoint.re === task.re && tappedPoint.im === task.im
    : selectedAnswer === task.correct;

  const handleNext = useCallback(() => {
    setRound((r) => r + 1);
    setSubmitted(false);
    setSelectedAnswer(null);
    setTappedPoint(null);
  }, []);

  const canCheck = task.type === 'plot' ? tappedPoint != null : selectedAnswer != null;
  const objectiveText = task.type === 'plot'
    ? `Plot ${fmtComplex(task.re, task.im)} on the grid.`
    : task.type === 'identify'
      ? 'Identify the complex number shown by the plotted point.'
      : task.type === 'conjugate'
        ? `Find the conjugate of ${fmtComplex(task.re, task.im)}.`
        : task.type === 'modulus'
          ? `Find the modulus of ${fmtComplex(task.re, task.im)}.`
          : `Simplify i^${task.exp} using the cycle 1, i, -1, -i.`;
  const howToText = task.type === 'plot'
    ? 'Click once to place your point, then press Check.'
    : 'Select one choice, then press Check.';

  /* ── Render grid ── */
  const renderGrid = () => {
    const lines = [];
    const labels = [];
    for (let v = -AXIS_LIM; v <= AXIS_LIM; v++) {
      const { x } = toScreen(v, 0);
      const { y } = toScreen(0, v);
      lines.push(<line key={`gv${v}`} x1={x} y1={PAD} x2={x} y2={H - PAD} stroke={COLOR.border} strokeWidth={0.5} />);
      lines.push(<line key={`gh${v}`} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={COLOR.border} strokeWidth={0.5} />);
      if (v !== 0) {
        labels.push(<text key={`lx${v}`} x={x} y={H / 2 + 14} textAnchor="middle" fontSize={9} fill={COLOR.textMuted}>{v}</text>);
        labels.push(<text key={`ly${v}`} x={W / 2 + 10} y={y + 3} textAnchor="start" fontSize={9} fill={COLOR.textMuted}>{v}i</text>);
      }
    }
    const o = toScreen(0, 0);
    return (
      <>
        {lines}
        <line x1={PAD} y1={o.y} x2={W - PAD} y2={o.y} stroke={COLOR.text} strokeWidth={1.5} />
        <line x1={o.x} y1={PAD} x2={o.x} y2={H - PAD} stroke={COLOR.text} strokeWidth={1.5} />
        <text x={W - PAD + 4} y={o.y + 4} fontSize={11} fill={COLOR.text} fontWeight={700}>Re</text>
        <text x={o.x + 4} y={PAD - 6} fontSize={11} fill={COLOR.text} fontWeight={700}>Im</text>
        {labels}
      </>
    );
  };

  if (done) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex numbers'}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
          Objective complete: Solve 3 complex-number challenges accurately.
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, margin: '0 0 8px' }}>
          You got {score}/{TOTAL_ROUNDS} correct!
        </p>
        <p style={{ fontSize: 13, color: COLOR.textSecondary, margin: '0 0 16px' }}>
          {score === TOTAL_ROUNDS ? 'Accurate complex-number reasoning across plotting, conjugates, modulus, and powers of i.' : 'Rework missed rounds by checking coordinate signs, conjugate rules, modulus setup, and the i-power cycle.'}
        </p>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex numbers'}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 11, color: COLOR.textMuted, fontWeight: 700 }}>Round {round + 1} of {TOTAL_ROUNDS}</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: {objectiveText}
      </p>
      <div style={{ margin: '0 0 10px', padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLOR.border}`, background: '#f8fafc' }}>
        <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary }}>
          <strong>How to use:</strong> {howToText}
        </p>
      </div>
      <div style={{ margin: '0 0 12px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {round + 1}/{TOTAL_ROUNDS}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Score: {score}
        </span>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: COLOR.text }}>{task.prompt}</p>

      {(task.type === 'plot' || task.type === 'identify') && (
        <svg width={W} height={H} style={{ display: 'block', margin: '0 auto 16px', background: COLOR.card, borderRadius: 10, border: `1px solid ${COLOR.border}`, cursor: task.type === 'plot' && !submitted ? 'crosshair' : 'default' }}
          onClick={handleGridClick}>
          {renderGrid()}
          {/* For identify: show the point */}
          {task.type === 'identify' && (() => {
            const p = toScreen(task.re, task.im);
            return <circle cx={p.x} cy={p.y} r={7} fill={COLOR.blue} stroke="#fff" strokeWidth={2} />;
          })()}
          {/* For plot: show tapped point */}
          {task.type === 'plot' && tappedPoint && (() => {
            const p = toScreen(tappedPoint.re, tappedPoint.im);
            const isRight = submitted && isCorrect;
            const isWrong = submitted && !isCorrect;
            return (
              <>
                <circle cx={p.x} cy={p.y} r={7} fill={isRight ? COLOR.green : isWrong ? COLOR.red : COLOR.blue} stroke="#fff" strokeWidth={2} />
                {isWrong && (() => {
                  const correct = toScreen(task.re, task.im);
                  return <circle cx={correct.x} cy={correct.y} r={7} fill={COLOR.green} stroke="#fff" strokeWidth={2} opacity={0.7} />;
                })()}
              </>
            );
          })()}
        </svg>
      )}

      {task.choices && task.type !== 'plot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {task.choices.map((c) => {
            let bg = COLOR.card;
            let border = COLOR.border;
            let color = COLOR.text;
            if (submitted && c === task.correct) { bg = COLOR.successBg; border = COLOR.successBorder; color = COLOR.successText; }
            else if (submitted && c === selectedAnswer && c !== task.correct) { bg = COLOR.redBg; border = '#fca5a5'; color = COLOR.red; }
            else if (c === selectedAnswer) { bg = COLOR.blueBg; border = COLOR.blueBorder; color = COLOR.blue; }
            return (
              <button key={c} type="button" onClick={() => !submitted && setSelectedAnswer(c)}
                style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, textAlign: 'left', borderRadius: 10,
                  border: `2px solid ${border}`, background: bg, color, cursor: submitted ? 'default' : 'pointer',
                  transition: 'all 0.15s' }}>
                {c}
                {submitted && c === task.correct && ' \u2713'}
                {submitted && c === selectedAnswer && c !== task.correct && ' \u2717'}
              </button>
            );
          })}
        </div>
      )}

      {submitted && (
        <p aria-live="polite" style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: isCorrect ? COLOR.successText : COLOR.red }}>
          {isCorrect ? '\u2713 Correct solution - your complex-number reasoning matches the task requirements.' : `\u2717 Not correct. The correct result is ${task.type === 'plot' ? fmtComplex(task.re, task.im) : task.correct}. Re-check signs, magnitude, or i-cycle steps.`}
        </p>
      )}

      {!submitted && (
        <button type="button" onClick={handleCheck} disabled={!canCheck}
          style={canCheck ? { ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)` } : BTN_PRIMARY_DISABLED}>
          Check
        </button>
      )}
      {submitted && round < TOTAL_ROUNDS - 1 && (
        <button type="button" onClick={handleNext} style={BTN_PRIMARY}>Next</button>
      )}
      {submitted && round === TOTAL_ROUNDS - 1 && (
        <button type="button" onClick={handleNext} style={BTN_PRIMARY}>{continueLabel}</button>
      )}
    </div>
  );
}
