/**
 * ComplexFractalExplorer — Iterate z → z² + c from z₀ = 0; plot the orbit on the Argand diagram.
 * Leads to bounded vs escaping orbits and names the Mandelbrot set.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';

const W = 360;
const H = 300;
const PAD = 36;
const SCALE = 42;
const ESCAPE = 2.5;
const MAX_STEPS = 10;

function toScreen(re, im) {
  return { x: W / 2 + re * SCALE, y: H / 2 - im * SCALE };
}

function stepZ(z, c) {
  return {
    re: z.re * z.re - z.im * z.im + c.re,
    im: 2 * z.re * z.im + c.im,
  };
}

function mod(z) {
  return Math.hypot(z.re, z.im);
}

const PRESETS = [
  { re: 0, im: 1, label: 'c = i', hint: 'Classic bounded seed — orbit dances but stays small.' },
  { re: 1, im: 0, label: 'c = 1', hint: 'Orbit shoots outward quickly (escapes).' },
  { re: -0.5, im: 0, label: 'c = \u2212\u00bd', hint: 'Often converges toward a small attractor.' },
  { re: -0.75, im: 0.1, label: 'c = \u22120.75 + 0.1i', hint: 'Near the chaotic boundary of the Mandelbrot set.' },
];

function runOrbit(c) {
  const pts = [];
  let z = { re: 0, im: 0 };
  pts.push({ ...z });
  for (let k = 0; k < MAX_STEPS; k++) {
    if (mod(z) > ESCAPE) break;
    z = stepZ(z, c);
    pts.push({ ...z });
    if (mod(z) > ESCAPE) break;
  }
  return pts;
}

export default function ComplexFractalExplorer({
  onComplete,
  continueLabel = 'Continue',
  badgeLabel,
  embedded = false,
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [ranPresets, setRanPresets] = useState(() => new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [quizChoice, setQuizChoice] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const c = PRESETS[activeIdx];
  const orbit = useMemo(() => runOrbit({ re: c.re, im: c.im }), [c.re, c.im]);
  const escaped = orbit.length > 1 && mod(orbit[orbit.length - 1]) > ESCAPE;

  const handleRun = useCallback(() => {
    setRanPresets((prev) => new Set([...prev, activeIdx]));
  }, [activeIdx]);

  const quizCorrect = quizChoice === 'mandelbrot';

  const renderGrid = () => {
    const lim = 2.5;
    const lines = [];
    for (let v = -2; v <= 2; v++) {
      const { x } = toScreen(v, 0);
      const { y } = toScreen(0, v);
      lines.push(<line key={`v${v}`} x1={x} y1={PAD} x2={x} y2={H - PAD} stroke={COLOR.border} strokeWidth={0.5} />);
      lines.push(<line key={`h${v}`} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={COLOR.border} strokeWidth={0.5} />);
    }
    const o = toScreen(0, 0);
    return (
      <>
        {lines}
        <line x1={PAD} y1={o.y} x2={W - PAD} y2={o.y} stroke={COLOR.text} strokeWidth={1.2} />
        <line x1={o.x} y1={PAD} x2={o.x} y2={H - PAD} stroke={COLOR.text} strokeWidth={1.2} />
        <text x={W - PAD} y={o.y + 4} fontSize={10} fill={COLOR.textMuted}>Re</text>
        <text x={o.x + 4} y={PAD - 2} fontSize={10} fill={COLOR.textMuted}>Im</text>
        <circle cx={o.x} cy={o.y} r={ESCAPE * SCALE} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />
        <text x={o.x + ESCAPE * SCALE - 28} y={o.y - 6} fontSize={8} fill={COLOR.textMuted}>|z|≈2.5</text>
      </>
    );
  };

  if (quizDone) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex iteration'}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: COLOR.text }}>Fractal preview complete</p>
        <p style={{ fontSize: 13, color: COLOR.textSecondary, margin: '0 0 16px', lineHeight: 1.6 }}>
          The full <strong>Mandelbrot set</strong> colors every c in the plane by how fast the orbit of 0 escapes. You explored a few spots by hand.
        </p>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  if (showQuiz && !quizSubmitted) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex iteration'}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: COLOR.text }}>Quick check</p>
        <p style={{ margin: '0 0 14px', fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.55 }}>
          The famous diagram that marks every value of <strong>c</strong> for which the orbit of 0 under <strong>z \u2192 z\u00b2 + c</strong> stays bounded is called:
        </p>
        {[
          { id: 'mandelbrot', text: 'Mandelbrot set' },
          { id: 'julia', text: 'Julia set (fixed c, vary starting point)' },
          { id: 'unit', text: 'Unit disk |z| \u2264 1' },
          { id: 'fib', text: 'Fibonacci spiral' },
        ].map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setQuizChoice(opt.id)}
            style={{
              display: 'block',
              width: '100%',
              marginBottom: 8,
              padding: '12px 14px',
              textAlign: 'left',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: `2px solid ${quizChoice === opt.id ? COLOR.blue : COLOR.border}`,
              background: quizChoice === opt.id ? COLOR.blueBg : COLOR.card,
              color: COLOR.text,
              cursor: 'pointer',
            }}
          >
            {opt.text}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setQuizSubmitted(true)}
          disabled={!quizChoice}
          style={!quizChoice ? { opacity: 0.5, ...BTN_PRIMARY } : BTN_PRIMARY}
        >
          Check
        </button>
      </div>
    );
  }

  if (showQuiz && quizSubmitted) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex iteration'}</div>}
        <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: quizCorrect ? COLOR.successText : COLOR.red }}>
          {quizCorrect ? '\u2713 Right — the Mandelbrot set lives in the c-plane.' : '\u2717 The answer is the Mandelbrot set (in the c-plane). Julia sets fix c and vary the starting point.'}
        </p>
        <button type="button" onClick={() => setQuizDone(true)} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex iteration'}</div>}
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: COLOR.text }}>Orbit of 0 under z \u2192 z\u00b2 + c</p>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.55 }}>
        Start at z\u2080 = 0. Each step replaces z with z\u00b2 + c. Plot the points: some <strong>c</strong> keep the path bounded; others shoot past the dashed circle (rough escape radius).
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setActiveIdx(i)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 999,
              border: `2px solid ${activeIdx === i ? COLOR.blue : COLOR.border}`,
              background: activeIdx === i ? COLOR.blueBg : COLOR.card,
              color: COLOR.text,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p style={{ margin: '0 0 10px', fontSize: 12, color: COLOR.textSecondary }}>{c.hint}</p>

      <button type="button" onClick={handleRun} style={{ ...BTN_PRIMARY, marginBottom: 12, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)` }}>
        Run orbit (from z = 0)
      </button>
      {ranPresets.has(activeIdx) && (
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: escaped ? COLOR.amber : COLOR.successText }}>
          {escaped
            ? `Escaped after ${orbit.length - 1} step(s) (last |z| \u2248 ${mod(orbit[orbit.length - 1]).toFixed(2)}).`
            : `Still inside escape radius after ${orbit.length - 1} step(s) (bounded in this window).`}
        </p>
      )}

      <svg width={W} height={H} style={{ display: 'block', margin: '0 auto 12px', background: COLOR.card, borderRadius: 10, border: `1px solid ${COLOR.border}` }}>
        {renderGrid()}
        {orbit.length > 1 && orbit.slice(0, -1).map((p, i) => {
          const a = toScreen(p.re, p.im);
          const b = toScreen(orbit[i + 1].re, orbit[i + 1].im);
          return <line key={`seg${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#7c3aed" strokeWidth={2} opacity={0.85} />;
        })}
        {orbit.map((p, i) => {
          const pt = toScreen(p.re, p.im);
          const fill = i === 0 ? COLOR.text : i === orbit.length - 1 ? (escaped ? COLOR.amber : COLOR.green) : COLOR.blue;
          return <circle key={`pt${i}`} cx={pt.x} cy={pt.y} r={i === 0 ? 5 : 6} fill={fill} stroke="#fff" strokeWidth={1.5} />;
        })}
      </svg>

      <p style={{ margin: '0 0 8px', fontSize: 11, color: COLOR.textMuted }}>
        Steps:{' '}
        {orbit.map((p, i) => (
          <span key={i}>
            {i > 0 ? ' → ' : ''}
            z<sub>{i}</sub> ≈ ({p.re.toFixed(2)}, {p.im.toFixed(2)})
          </span>
        ))}
      </p>

      <p style={{ margin: '0 0 12px', fontSize: 12, color: COLOR.textSecondary }}>
        Try at least <strong>two</strong> different values of c (tap preset, then Run), then open the wrap-up question.
        <span style={{ display: 'block', marginTop: 6, fontWeight: 700, color: ranPresets.size >= 2 ? COLOR.successText : COLOR.textMuted }}>
          Presets with orbit run: {ranPresets.size}/2
        </span>
      </p>
      {ranPresets.size >= 2 && !showQuiz && (
        <button type="button" onClick={() => setShowQuiz(true)} style={BTN_PRIMARY}>
          Continue to wrap-up question
        </button>
      )}
    </div>
  );
}
