import React, { useMemo, useState } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';

const MODES = ['limit-zoom', 'derivative-sense', 'lhospital-lab'];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const roundTo = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

function cardShell({ embedded, badgeLabel, children }) {
  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>
          {badgeLabel}
        </div>
      )}
      {children}
    </div>
  );
}

function LimitZoom({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [x, setX] = useState(1.24);
  const [nudges, setNudges] = useState(0);
  const safe = Math.abs(x - 1) > 0.0001;
  const fx = safe ? (x * x - 1) / (x - 1) : null;
  const diff = fx == null ? null : Math.abs(fx - 2);
  const close = diff != null && diff < 0.05;

  return cardShell({
    embedded,
    badgeLabel,
    children: (
      <>
        <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
          Limit Zoom Lab
        </p>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.5 }}>
          Move <strong>x</strong> close to 1 for f(x) = (x^2 - 1) / (x - 1). Watch f(x) approach the limit.
        </p>
        <div style={{ padding: '12px 14px', borderRadius: 12, border: `1px solid ${COLOR.border}`, background: '#f8fafc', marginBottom: 12 }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
            Current x: <strong>{roundTo(x, 3)}</strong>
          </p>
          <input
            type="range"
            min="0.70"
            max="1.30"
            step="0.005"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => { setX((v) => clamp(v - 0.01, 0.70, 1.30)); setNudges((n) => n + 1); }}
              style={{ ...BTN_PRIMARY, flex: 1, background: 'linear-gradient(135deg,#475569,#334155)' }}
            >
              Nudge Left
            </button>
            <button
              type="button"
              onClick={() => { setX((v) => clamp(v + 0.01, 0.70, 1.30)); setNudges((n) => n + 1); }}
              style={{ ...BTN_PRIMARY, flex: 1, background: 'linear-gradient(135deg,#475569,#334155)' }}
            >
              Nudge Right
            </button>
          </div>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${close ? COLOR.successBorder : COLOR.border}`, background: close ? COLOR.successBg : '#ffffff', marginBottom: 12 }}>
          <p style={{ margin: 0, fontSize: 14, color: COLOR.text }}>
            f(x) = {safe ? roundTo(fx, 4) : 'undefined at x = 1'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: COLOR.textSecondary }}>
            Target limit: 2 {diff != null ? `|difference| = ${roundTo(diff, 4)}` : ''}
          </p>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: close ? COLOR.successText : COLOR.textSecondary, fontWeight: close ? 700 : 500 }}>
          {close
            ? 'Great! Even though f(1) is undefined, values near x=1 approach 2.'
            : 'Bring x closer to 1 from either side and compare f(x) to 2.'}
        </p>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
          Tip: (x^2 - 1)/(x - 1) factors to (x - 1)(x + 1)/(x - 1) = x + 1 for x != 1.
          {nudges > 0 ? ` You used ${nudges} nudges.` : ''}
        </p>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </>
    ),
  });
}

const DERIVATIVE_PROMPTS = [
  { fx: 'x^2', at: 3, answer: '6', choices: ['3', '6', '9', '12'], why: 'd/dx(x^2)=2x, and 2(3)=6.' },
  { fx: 'x^3', at: 2, answer: '12', choices: ['6', '8', '12', '16'], why: 'd/dx(x^3)=3x^2, and 3(2^2)=12.' },
  { fx: 'sin x', at: 0, answer: '1', choices: ['0', '1', '-1', 'undefined'], why: 'd/dx(sin x)=cos x, and cos(0)=1.' },
  { fx: 'e^x', at: 1, answer: 'e', choices: ['1', '2', 'e', '0'], why: 'd/dx(e^x)=e^x, so at x=1 it is e.' },
];

function DerivativeSense({ onComplete, continueLabel, badgeLabel, embedded, activityIndex }) {
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const prompt = DERIVATIVE_PROMPTS[activityIndex % DERIVATIVE_PROMPTS.length];
  const isCorrect = submitted && selected === prompt.answer;

  return cardShell({
    embedded,
    badgeLabel,
    children: (
      <>
        <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
          Derivative Sense Check
        </p>
        <p style={{ margin: '0 0 12px', fontSize: 14, color: COLOR.textSecondary }}>
          Pick the slope of the tangent line: f(x) = <strong>{prompt.fx}</strong> at x = <strong>{prompt.at}</strong>.
        </p>
        <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
          {prompt.choices.map((c) => {
            const active = selected === c;
            return (
              <button
                key={c}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(c)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `2px solid ${active ? COLOR.blue : COLOR.border}`,
                  background: active ? COLOR.blueBg : '#fff',
                  color: COLOR.text,
                  textAlign: 'left',
                  fontWeight: 700,
                  cursor: submitted ? 'default' : 'pointer',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
        {!submitted && (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!selected}
            style={!selected ? { ...BTN_PRIMARY, opacity: 0.6, cursor: 'not-allowed' } : BTN_PRIMARY}
          >
            Check
          </button>
        )}
        {submitted && (
          <p style={{ margin: '10px 0 12px', fontSize: 13, color: isCorrect ? COLOR.successText : COLOR.red, fontWeight: 700 }}>
            {isCorrect ? 'Correct. ' : `Not yet. Correct answer: ${prompt.answer}. `}
            <span style={{ color: COLOR.textSecondary, fontWeight: 600 }}>{prompt.why}</span>
          </p>
        )}
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </>
    ),
  });
}

const LHOSPITAL_ITEMS = [
  {
    expr: 'lim(x->0) (sin x)/x',
    form: '0/0',
    direct: true,
    reason: "Directly valid: 0/0 form and differentiable numerator/denominator.",
    transformed: "After one step: lim(x->0) (cos x)/1 = 1",
    plot: {
      domain: [-2.4, 2.4],
      approach: 0,
      approachLabel: 'x -> 0',
      numerator: (x) => Math.sin(x),
      denominator: (x) => x,
      dNumerator: (x) => Math.cos(x),
      dDenominator: () => 1,
    },
  },
  {
    expr: 'lim(x->infinity) (ln x)/x',
    form: 'infinity/infinity',
    direct: true,
    reason: "Directly valid: infinity/infinity form. One L'Hospital step gives (1/x)/1 -> 0.",
    transformed: "After one step: lim(x->infinity) (1/x)/1 = 0",
    plot: {
      domain: [1, 12],
      approach: 12,
      approachLabel: 'x -> infinity',
      numerator: (x) => Math.log(x),
      denominator: (x) => x,
      dNumerator: (x) => 1 / x,
      dDenominator: () => 1,
    },
  },
  {
    expr: 'lim(x->infinity) x*e^(-x)',
    form: '0*infinity',
    direct: false,
    reason: "Not direct. Rewrite to x/(e^x) to create infinity/infinity, then apply L'Hospital.",
    transformed: "Rewrite first: lim(x->infinity) x/e^x. One L'Hospital step gives lim(x->infinity) 1/e^x = 0",
    plot: {
      domain: [0, 6],
      approach: 6,
      approachLabel: 'x -> infinity (rewritten x/e^x)',
      numerator: (x) => x,
      denominator: (x) => Math.exp(x),
      dNumerator: () => 1,
      dDenominator: (x) => Math.exp(x),
    },
  },
  {
    expr: 'lim(x->infinity) (sqrt(x^2 + x) - x)',
    form: 'infinity - infinity',
    direct: false,
    reason: 'Not direct. Rationalize first to convert into a quotient form.',
    transformed: "Rationalize first: lim(x->infinity) 1/(sqrt(x^2+x)+x) = 0 (no direct L'Hospital needed after rewrite).",
    plot: {
      domain: [1, 12],
      approach: 12,
      approachLabel: 'x -> infinity (rationalized)',
      numerator: () => 1,
      denominator: (x) => Math.sqrt(x * x + x) + x,
      dNumerator: () => 0,
      dDenominator: (x) => ((2 * x + 1) / (2 * Math.sqrt(x * x + x))) + 1,
    },
  },
];

const LHOSPITAL_GUIDED_QUESTIONS = [
  {
    prompt: 'For lim(x->0) (sin x)/x, which indeterminate form do you get by direct substitution?',
    choices: ['0/0', 'infinity/infinity', '0*infinity', '1^infinity'],
    answer: '0/0',
    steps: [
      'Step 1: Substitute x = 0 into the numerator: sin(0) = 0.',
      'Step 2: Substitute x = 0 into the denominator: x = 0.',
      'Step 3: The quotient becomes 0/0, which is indeterminate.',
      "Step 4: Because the form is 0/0 and both parts are differentiable near 0, L'Hospital's Rule is valid.",
    ],
  },
  {
    prompt: "After one L'Hospital step, what is lim(x->0) (sin x)/x equal to?",
    choices: ['0', '1', 'does not exist', 'infinity'],
    answer: '1',
    steps: [
      "Step 1: Differentiate the numerator: d/dx[sin x] = cos x.",
      'Step 2: Differentiate the denominator: d/dx[x] = 1.',
      "Step 3: Rewrite the limit as lim(x->0) cos(x)/1.",
      'Step 4: Evaluate directly: cos(0) = 1.',
      'Step 5: Final answer = 1.',
    ],
  },
  {
    prompt: "For lim(x->infinity) (ln x)/x, what does one L'Hospital step produce?",
    choices: ['(1/x)/1', 'x/(1/x)', '1/(ln x)', 'e^x/x'],
    answer: '(1/x)/1',
    steps: [
      'Step 1: Check the original form as x->infinity: ln(x)->infinity and x->infinity, so it is infinity/infinity.',
      "Step 2: Differentiate top and bottom once: d/dx[ln x] = 1/x and d/dx[x] = 1.",
      "Step 3: New limit: lim(x->infinity) (1/x)/1.",
      'Step 4: Since 1/x -> 0 as x->infinity, the limit is 0.',
    ],
  },
  {
    prompt: 'For lim(x->infinity) x*e^(-x), what is the best first move before applying L\'Hospital?',
    choices: ['Rewrite as x/e^x', 'Differentiate product directly in the limit', 'Take log of both sides', 'Square both terms'],
    answer: 'Rewrite as x/e^x',
    steps: [
      "Step 1: Recognize x*e^(-x) is a product form (infinity*0), not a direct L'Hospital form.",
      'Step 2: Rewrite e^(-x) as 1/e^x, giving x/e^x.',
      "Step 3: Now the form is infinity/infinity, which is valid for L'Hospital.",
      'Step 4: Differentiate once: numerator -> 1, denominator -> e^x.',
      'Step 5: Evaluate lim(x->infinity) 1/e^x = 0.',
    ],
  },
];

function buildSeriesPath({ fn, xMin, xMax, yMin, yMax, width, height, pad }) {
  const toX = (x) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const toY = (y) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);
  const steps = 100;
  let d = '';
  let started = false;
  let prevY = null;
  for (let i = 0; i <= steps; i += 1) {
    const x = xMin + ((xMax - xMin) * i) / steps;
    const y = fn(x);
    const finite = Number.isFinite(y) && Math.abs(y) < 1e6;
    if (!finite) {
      started = false;
      prevY = null;
      continue;
    }
    const yClamped = clamp(y, yMin, yMax);
    if (prevY != null && Math.abs(yClamped - prevY) > (yMax - yMin) * 0.65) {
      started = false;
    }
    const px = roundTo(toX(x), 2);
    const py = roundTo(toY(yClamped), 2);
    d += `${started ? ' L' : ' M'} ${px} ${py}`;
    started = true;
    prevY = yClamped;
  }
  return d || '';
}

function LHospitalGraphPanel({ item }) {
  const [probeX, setProbeX] = useState(roundTo((item.plot.domain[0] + item.plot.domain[1]) / 2, 2));
  const W = 360;
  const H = 190;
  const PAD = 28;
  const [xMin, xMax] = item.plot.domain;

  const range = useMemo(() => {
    const values = [];
    const fns = [item.plot.numerator, item.plot.denominator, item.plot.dNumerator, item.plot.dDenominator];
    for (let i = 0; i <= 100; i += 1) {
      const x = xMin + ((xMax - xMin) * i) / 100;
      for (const fn of fns) {
        const y = fn(x);
        if (Number.isFinite(y) && Math.abs(y) < 30) values.push(y);
      }
    }
    if (values.length === 0) return { yMin: -2, yMax: 2 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (Math.abs(max - min) < 0.01) return { yMin: min - 1, yMax: max + 1 };
    const pad = (max - min) * 0.15;
    return { yMin: min - pad, yMax: max + pad };
  }, [item.plot, xMin, xMax]);

  const yMin = range.yMin;
  const yMax = range.yMax;
  const pathN = buildSeriesPath({ fn: item.plot.numerator, xMin, xMax, yMin, yMax, width: W, height: H, pad: PAD });
  const pathD = buildSeriesPath({ fn: item.plot.denominator, xMin, xMax, yMin, yMax, width: W, height: H, pad: PAD });
  const pathDN = buildSeriesPath({ fn: item.plot.dNumerator, xMin, xMax, yMin, yMax, width: W, height: H, pad: PAD });
  const pathDD = buildSeriesPath({ fn: item.plot.dDenominator, xMin, xMax, yMin, yMax, width: W, height: H, pad: PAD });

  const toX = (x) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const toY = (y) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);
  const vN = item.plot.numerator(probeX);
  const vD = item.plot.denominator(probeX);
  const vDN = item.plot.dNumerator(probeX);
  const vDD = item.plot.dDenominator(probeX);

  return (
    <div style={{ marginBottom: 12, padding: '10px 10px 12px', borderRadius: 12, border: `1px solid ${COLOR.border}`, background: '#ffffff' }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: COLOR.textSecondary }}>
        Visual check ({item.plot.approachLabel}): numerator/denominator vs their derivatives
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: '#f8fafc', borderRadius: 10 }}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#cbd5e1" strokeWidth="1.5" />
        <path d={pathN} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={pathD} fill="none" stroke="#dc2626" strokeWidth="2" />
        <path d={pathDN} fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeDasharray="4 3" />
        <path d={pathDD} fill="none" stroke="#059669" strokeWidth="1.8" strokeDasharray="4 3" />
        <line x1={toX(probeX)} y1={PAD} x2={toX(probeX)} y2={H - PAD} stroke="#94a3b8" strokeWidth="1.3" strokeDasharray="3 3" />
        {Number.isFinite(vN) && <circle cx={toX(probeX)} cy={toY(clamp(vN, yMin, yMax))} r="3" fill="#2563eb" />}
        {Number.isFinite(vD) && <circle cx={toX(probeX)} cy={toY(clamp(vD, yMin, yMax))} r="3" fill="#dc2626" />}
      </svg>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8, fontSize: 12 }}>
        <span style={{ color: '#2563eb', fontWeight: 700 }}>numerator</span>
        <span style={{ color: '#dc2626', fontWeight: 700 }}>denominator</span>
        <span style={{ color: '#7c3aed', fontWeight: 700 }}>numerator derivative</span>
        <span style={{ color: '#059669', fontWeight: 700 }}>denominator derivative</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          type="range"
          min={String(xMin)}
          max={String(xMax)}
          step={String((xMax - xMin) / 120)}
          value={probeX}
          onChange={(e) => setProbeX(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: COLOR.textSecondary }}>
        Probe x = {roundTo(probeX, 3)} | n(x) = {roundTo(vN, 4)} | d(x) = {roundTo(vD, 4)} | n'(x) = {roundTo(vDN, 4)} | d'(x) = {roundTo(vDD, 4)}
      </p>
    </div>
  );
}

function LHospitalLab({ onComplete, continueLabel, badgeLabel, embedded, activityIndex }) {
  const [choice, setChoice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showStep, setShowStep] = useState(false);
  const [guidedChoice, setGuidedChoice] = useState('');
  const [guidedSubmitted, setGuidedSubmitted] = useState(false);
  const item = useMemo(() => LHOSPITAL_ITEMS[activityIndex % LHOSPITAL_ITEMS.length], [activityIndex]);
  const guided = useMemo(
    () => LHOSPITAL_GUIDED_QUESTIONS[activityIndex % LHOSPITAL_GUIDED_QUESTIONS.length],
    [activityIndex],
  );
  const correct = item.direct ? 'yes' : 'no';
  const isCorrect = submitted && choice === correct;
  const guidedCorrect = guidedSubmitted && guidedChoice === guided.answer;

  return cardShell({
    embedded,
    badgeLabel,
    children: (
      <>
        <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
          L'Hospital Lab
        </p>
        <p style={{ margin: '0 0 10px', fontSize: 14, color: COLOR.textSecondary }}>
          Decide if L'Hospital's Rule can be applied <strong>directly</strong>.
        </p>
        <div style={{ padding: '10px 12px', borderRadius: 12, border: `1px solid ${COLOR.border}`, background: '#f8fafc', marginBottom: 10 }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, color: COLOR.text }}><strong>{item.expr}</strong></p>
          <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary }}>Observed form: {item.form}</p>
        </div>
        <LHospitalGraphPanel item={item} />
        <button
          type="button"
          onClick={() => setShowStep((s) => !s)}
          style={{ ...BTN_PRIMARY, marginBottom: 10, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}
        >
          {showStep ? 'Hide One-Step Transform' : "Apply L'Hospital Once"}
        </button>
        {showStep && (
          <div style={{ marginBottom: 10, padding: '10px 12px', borderRadius: 12, border: '1px solid #d8b4fe', background: '#faf5ff' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#4c1d95', fontWeight: 700 }}>
              {item.transformed}
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => setChoice('yes')}
            disabled={submitted}
            style={{
              ...BTN_PRIMARY,
              flex: 1,
              background: choice === 'yes' ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'linear-gradient(135deg,#64748b,#475569)',
            }}
          >
            Yes, directly
          </button>
          <button
            type="button"
            onClick={() => setChoice('no')}
            disabled={submitted}
            style={{
              ...BTN_PRIMARY,
              flex: 1,
              background: choice === 'no' ? 'linear-gradient(135deg,#2563eb,#1d4ed8)' : 'linear-gradient(135deg,#64748b,#475569)',
            }}
          >
            No, rewrite first
          </button>
        </div>
        {!submitted && (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!choice}
            style={!choice ? { ...BTN_PRIMARY, opacity: 0.6, cursor: 'not-allowed' } : BTN_PRIMARY}
          >
            Check Reasoning
          </button>
        )}
        {submitted && (
          <p style={{ margin: '10px 0 12px', fontSize: 13, color: isCorrect ? COLOR.successText : COLOR.red, fontWeight: 700 }}>
            {isCorrect ? 'Correct. ' : `Not quite. Correct choice: "${correct === 'yes' ? 'Yes, directly' : 'No, rewrite first'}". `}
            <span style={{ color: COLOR.textSecondary, fontWeight: 600 }}>{item.reason}</span>
          </p>
        )}
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, border: `1px solid ${COLOR.border}`, background: '#f8fafc' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.text, fontWeight: 800 }}>
            Guided question (step-by-step)
          </p>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
            {guided.prompt}
          </p>
          <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
            {guided.choices.map((c) => (
              <button
                key={c}
                type="button"
                disabled={guidedSubmitted}
                onClick={() => setGuidedChoice(c)}
                style={{
                  padding: '9px 10px',
                  borderRadius: 10,
                  textAlign: 'left',
                  fontWeight: 700,
                  border: `2px solid ${guidedChoice === c ? COLOR.blue : COLOR.border}`,
                  background: guidedChoice === c ? COLOR.blueBg : '#fff',
                  color: COLOR.text,
                  cursor: guidedSubmitted ? 'default' : 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {!guidedSubmitted && (
            <button
              type="button"
              onClick={() => setGuidedSubmitted(true)}
              disabled={!guidedChoice}
              style={!guidedChoice ? { ...BTN_PRIMARY, opacity: 0.6, cursor: 'not-allowed' } : BTN_PRIMARY}
            >
              Check guided answer
            </button>
          )}
          {guidedSubmitted && (
            <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 10, border: `1px solid ${guidedCorrect ? COLOR.successBorder : '#fecaca'}`, background: guidedCorrect ? COLOR.successBg : '#fef2f2' }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: guidedCorrect ? COLOR.successText : '#b91c1c' }}>
                {guidedCorrect ? 'Correct.' : `Not yet. Correct answer: ${guided.answer}.`}
              </p>
              <div style={{ display: 'grid', gap: 4 }}>
                {guided.steps.map((step) => (
                  <p key={step} style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
                    {step}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </>
    ),
  });
}

function pickCalculusMode(currentStd, activityIndex) {
  if (currentStd === 'calc_c002') return 'lhospital-lab';
  if (currentStd === 'calc_c001') return 'limit-zoom';
  if (currentStd === 'calc_c011') return 'limit-zoom';
  if (['calc_c003', 'calc_c004', 'calc_c005', 'calc_c006', 'calc_c007', 'calc_c008', 'calc_c009', 'calc_c010'].includes(currentStd)) {
    return 'derivative-sense';
  }
  if (currentStd === 'calc_c012') return activityIndex % 2 === 0 ? 'limit-zoom' : 'derivative-sense';
  return MODES[activityIndex % MODES.length];
}

export default function CalculusExplorer({
  currentStd = '',
  activityIndex = 0,
  onComplete,
  continueLabel,
  badgeLabel,
  embedded,
}) {
  const mode = pickCalculusMode(currentStd, activityIndex);

  if (mode === 'limit-zoom') {
    return (
      <LimitZoom
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  if (mode === 'derivative-sense') {
    return (
      <DerivativeSense
        activityIndex={activityIndex}
        onComplete={onComplete}
        continueLabel={continueLabel}
        badgeLabel={badgeLabel}
        embedded={embedded}
      />
    );
  }
  return (
    <LHospitalLab
      activityIndex={activityIndex}
      onComplete={onComplete}
      continueLabel={continueLabel}
      badgeLabel={badgeLabel}
      embedded={embedded}
    />
  );
}
