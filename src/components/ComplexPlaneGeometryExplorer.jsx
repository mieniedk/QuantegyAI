/**
 * ComplexPlaneGeometryExplorer — Argand diagram lab + Rotation Detective for the practice loop.
 * Sandbox: multiply a fixed z by chosen w and see the product (× i ⇒ 90° CCW when |w| = 1).
 * Detective: z₀ and target T on the plane; pick w so that z₀ · w = T.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE } from '../utils/loopStyles';

const W = 380;
const H = 320;
const PAD = 40;
const SCALE = 26;
const AXIS_LIM = 6;

function toScreen(re, im) {
  return { x: W / 2 + re * SCALE, y: H / 2 - im * SCALE };
}

function fmtComplex(re, im) {
  if (im === 0) return `${re}`;
  const sign = im > 0 ? '+' : '\u2212';
  const absIm = Math.abs(im);
  const imStr = absIm === 1 ? 'i' : `${absIm}i`;
  if (re === 0) return im > 0 ? imStr : `\u2212${absIm === 1 ? 'i' : absIm + 'i'}`;
  return `${re} ${sign} ${imStr}`;
}

function mul(z, w) {
  return {
    re: z.re * w.re - z.im * w.im,
    im: z.re * w.im + z.im * w.re,
  };
}

function add(z, w) {
  return { re: z.re + w.re, im: z.im + w.im };
}

function eq(a, b) {
  return a.re === b.re && a.im === b.im;
}

function mod(z) {
  return Math.hypot(z.re, z.im);
}

function seededRand(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return () => {
    h = (h * 16807 + 0) & 0x7fffffff;
    return (h & 0xffff) / 0xffff;
  };
}

function shuffleSeeded(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const UNIT_W = [
  { re: 1, im: 0, key: '1' },
  { re: -1, im: 0, key: '\u22121' },
  { re: 0, im: 1, key: 'i' },
  { re: 0, im: -1, key: '\u2212i' },
];

const SCALE_W = [
  { re: 2, im: 0, key: '2' },
  { re: -2, im: 0, key: '\u22122' },
  { re: 0, im: 2, key: '2i' },
  { re: 0, im: -2, key: '\u22122i' },
  { re: 3, im: 0, key: '3' },
];

const MIXED_W = [
  { re: 1, im: 1, key: '1 + i' },
  { re: 1, im: -1, key: '1 \u2212 i' },
  { re: 2, im: 1, key: '2 + i' },
  { re: 1, im: 2, key: '1 + 2i' },
  { re: -1, im: 1, key: '\u22121 + i' },
];

const Z0_POOL = [
  { re: 2, im: 1 },
  { re: 1, im: 2 },
  { re: 2, im: -1 },
  { re: 3, im: 1 },
  { re: 1, im: 1 },
  { re: 2, im: 2 },
];

function inBounds(z) {
  return Math.abs(z.re) <= AXIS_LIM && Math.abs(z.im) <= AXIS_LIM;
}

function generateDetectiveRound(roundIdx, seedStr) {
  const rng = seededRand(`${seedStr}|det|${roundIdx}`);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];

  let pool;
  if (roundIdx === 0) pool = UNIT_W;
  else if (roundIdx === 1) pool = [...UNIT_W, ...SCALE_W];
  else pool = [...UNIT_W, ...SCALE_W, ...MIXED_W];

  for (let attempt = 0; attempt < 80; attempt++) {
    const z0 = pick(Z0_POOL);
    const wCorrect = pick(pool);
    const target = mul(z0, wCorrect);
    if (!inBounds(target) || mod(target) < 0.5) continue;

    const wrong = pool.filter((w) => !eq(w, wCorrect) && inBounds(mul(z0, w)) && !eq(mul(z0, w), target));
    shuffleSeeded(wrong, rng);
    const picks = [wCorrect, ...wrong].slice(0, 4);
    if (picks.length < 4) continue;
    const choices = shuffleSeeded(picks, rng);
    return {
      z0,
      wCorrect,
      target,
      choices,
      prompt: `Which multiplier w makes (${fmtComplex(z0.re, z0.im)}) \u00b7 w = ${fmtComplex(target.re, target.im)}?`,
    };
  }

  const z0 = { re: 2, im: 1 };
  const wCorrect = { re: 0, im: 1, key: 'i' };
  const target = mul(z0, wCorrect);
  return {
    z0,
    wCorrect,
    target,
    choices: shuffleSeeded([wCorrect, UNIT_W[0], UNIT_W[1], UNIT_W[3]], rng),
    prompt: `Which multiplier w makes (${fmtComplex(z0.re, z0.im)}) \u00b7 w = ${fmtComplex(target.re, target.im)}?`,
  };
}

const SANDBOX_Z = { re: 2, im: 1 };
const SANDBOX_MULTIPLIERS = [
  { re: 1, im: 0, label: '1' },
  { re: 0, im: 1, label: 'i' },
  { re: -1, im: 0, label: '\u22121' },
  { re: 0, im: -1, label: '\u2212i' },
  { re: 2, im: 0, label: '2' },
  { re: 0, im: 2, label: '2i' },
  { re: 1, im: 1, label: '1 + i' },
];

const DETECTIVE_ROUNDS = 3;

export default function ComplexPlaneGeometryExplorer({
  onComplete,
  continueLabel = 'Continue',
  badgeLabel,
  embedded = false,
  activityIndex = 0,
}) {
  const seedStr = `cgeom-${activityIndex}`;
  const [labStarted, setLabStarted] = useState(false);
  const [sandboxW, setSandboxW] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedW, setSelectedW] = useState(null);

  const detectiveTask = useMemo(() => generateDetectiveRound(round, seedStr), [round, seedStr]);
  const sandboxProduct = sandboxW ? mul(SANDBOX_Z, sandboxW) : null;
  const sandboxSum = sandboxW ? add(SANDBOX_Z, sandboxW) : null;

  const done = round >= DETECTIVE_ROUNDS;

  const handleCheckDetective = useCallback(() => {
    if (!selectedW) return;
    setSubmitted(true);
    if (eq(selectedW, detectiveTask.wCorrect)) setScore((s) => s + 1);
  }, [selectedW, detectiveTask.wCorrect]);

  const isDetectiveCorrect = selectedW && eq(selectedW, detectiveTask.wCorrect);

  const handleNextRound = useCallback(() => {
    setRound((r) => r + 1);
    setSubmitted(false);
    setSelectedW(null);
  }, []);

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
        labels.push(<text key={`ly${v}`} x={W / 2 + 10} y={y + 3} textAnchor="start" fontSize={9} fill={COLOR.textMuted}>{v === 1 ? 'i' : v === -1 ? '\u2212i' : `${v}i`}</text>);
      }
    }
    const o = toScreen(0, 0);
    return (
      <>
        {lines}
        <line x1={PAD} y1={o.y} x2={W - PAD} y2={o.y} stroke={COLOR.text} strokeWidth={1.5} />
        <line x1={o.x} y1={PAD} x2={o.x} y2={H - PAD} stroke={COLOR.text} strokeWidth={1.5} />
        <text x={W - PAD + 2} y={o.y + 4} fontSize={11} fill={COLOR.text} fontWeight={700}>Re</text>
        <text x={o.x + 4} y={PAD - 4} fontSize={11} fill={COLOR.text} fontWeight={700}>Im</text>
        {labels}
      </>
    );
  };

  const drawPoint = (z, { fill, label, r = 8 }) => {
    const p = toScreen(z.re, z.im);
    return (
      <g key={`${label}-${z.re}-${z.im}`}>
        <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#fff" strokeWidth={2} />
        {label ? (
          <text x={p.x + 10} y={p.y - 8} fontSize={11} fontWeight={700} fill={fill}>{label}</text>
        ) : null}
      </g>
    );
  };

  if (done) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && (
          <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex plane'}</div>
        )}
        <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
          Rotation Detective complete
        </p>
        <p style={{ fontSize: 15, fontWeight: 700, color: COLOR.text, margin: '0 0 8px' }}>
          You got {score}/{DETECTIVE_ROUNDS} matches correct.
        </p>
        <p style={{ fontSize: 13, color: COLOR.textSecondary, margin: '0 0 16px', lineHeight: 1.6 }}>
          {score === DETECTIVE_ROUNDS
            ? 'You connected multiplication to geometry: on the unit circle, w rotates z; larger |w| also scales length.'
            : 'Keep experimenting: multiplying by i is a 90\u00b0 turn about the origin when |w| = 1. Arguments add and moduli multiply.'}
        </p>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    );
  }

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Complex plane'}</div>
      )}
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: COLOR.text }}>
        Complex plane: multiply as geometry
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.55 }}>
        Addition moves you like a vector sum. Multiplication rotates and scales: try <strong style={{ color: COLOR.text }}>× i</strong> and watch
        a 90\u00b0 counterclockwise turn when the multiplier has length 1.
      </p>

      {/* ── Sandbox ── */}
      <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, border: `1px solid ${COLOR.border}`, background: '#f8fafc' }}>
        <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 800, color: COLOR.purple }}>Interactive lab</p>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>
          Fixed <strong>z = {fmtComplex(SANDBOX_Z.re, SANDBOX_Z.im)}</strong>. Tap a multiplier w to see <strong>z \u00b7 w</strong> (purple) and <strong>z + w</strong> (amber dashed path to sum).
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {SANDBOX_MULTIPLIERS.map((w) => (
            <button
              key={w.label}
              type="button"
              onClick={() => {
                setSandboxW(w);
                setLabStarted(true);
              }}
              style={{
                padding: '8px 14px',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 999,
                border: `2px solid ${sandboxW && eq(sandboxW, w) ? COLOR.blue : COLOR.border}`,
                background: sandboxW && eq(sandboxW, w) ? COLOR.blueBg : COLOR.card,
                color: COLOR.text,
                cursor: 'pointer',
              }}
            >
              w = {w.label}
            </button>
          ))}
        </div>
        <svg width={W} height={H} style={{ display: 'block', margin: '0 auto', background: COLOR.card, borderRadius: 10, border: `1px solid ${COLOR.border}` }}>
          {renderGrid()}
          {drawPoint(SANDBOX_Z, { fill: COLOR.blue, label: 'z' })}
          {sandboxW ? (
            <>
              {drawPoint(sandboxW, { fill: '#0d9488', label: 'w', r: 7 })}
              {sandboxProduct && inBounds(sandboxProduct) ? drawPoint(sandboxProduct, { fill: '#7c3aed', label: 'z\u00b7w' }) : null}
              {sandboxSum && inBounds(sandboxSum) ? (
                <>
                  <line
                    x1={toScreen(SANDBOX_Z.re, SANDBOX_Z.im).x}
                    y1={toScreen(SANDBOX_Z.re, SANDBOX_Z.im).y}
                    x2={toScreen(sandboxSum.re, sandboxSum.im).x}
                    y2={toScreen(sandboxSum.re, sandboxSum.im).y}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    opacity={0.85}
                  />
                  {drawPoint(sandboxSum, { fill: '#d97706', label: 'z+w', r: 7 })}
                </>
              ) : null}
            </>
          ) : null}
        </svg>
        {sandboxW && sandboxW.im === 1 && sandboxW.re === 0 ? (
          <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 700, color: COLOR.successText }}>
            Aha: multiplying z by i rotates z 90\u00b0 around the origin (counterclockwise). |z \u00b7 i| = |z| when |w| = 1.
          </p>
        ) : null}
        {!labStarted && (
          <button type="button" onClick={() => setLabStarted(true)} style={{ ...BTN_PRIMARY, marginTop: 12, fontSize: 12, padding: '6px 14px', background: COLOR.borderLight, color: COLOR.textSecondary, boxShadow: 'none' }}>
            Skip lab intro
          </button>
        )}
      </div>

      {/* ── Rotation Detective ── */}
      <div
        style={{
          marginBottom: 8,
          paddingTop: 4,
          borderTop: `1px solid ${COLOR.border}`,
          opacity: labStarted ? 1 : 0.55,
          pointerEvents: labStarted ? 'auto' : 'none',
        }}
      >
        {!labStarted && (
          <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: COLOR.amber }}>
            Pick any multiplier in the lab above (or &ldquo;Skip lab intro&rdquo;) to unlock Rotation Detective.
          </p>
        )}
        <p style={{ margin: '0 0 4px', fontSize: 11, color: COLOR.textMuted, fontWeight: 700 }}>Rotation Detective \u00b7 Round {round + 1} of {DETECTIVE_ROUNDS}</p>
        <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLOR.text }}>{detectiveTask.prompt}</p>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: COLOR.textSecondary }}>
          Blue = z\u2080, green = target. Pick w so the product lands on the green point.
        </p>
        <svg width={W} height={H} style={{ display: 'block', margin: '0 auto 14px', background: COLOR.card, borderRadius: 10, border: `1px solid ${COLOR.border}` }}>
          {renderGrid()}
          {drawPoint(detectiveTask.z0, { fill: COLOR.blue, label: 'z\u2080' })}
          {drawPoint(detectiveTask.target, { fill: COLOR.green, label: 'target' })}
          {submitted && selectedW && !isDetectiveCorrect && inBounds(mul(detectiveTask.z0, selectedW))
            ? drawPoint(mul(detectiveTask.z0, selectedW), { fill: COLOR.red, label: 'z\u2080\u00b7w', r: 7 })
            : null}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {detectiveTask.choices.map((w) => {
            const label = w.key || fmtComplex(w.re, w.im);
            let bg = COLOR.card;
            let border = COLOR.border;
            let color = COLOR.text;
            if (submitted && eq(w, detectiveTask.wCorrect)) {
              bg = COLOR.successBg;
              border = COLOR.successBorder;
              color = COLOR.successText;
            } else if (submitted && selectedW && eq(w, selectedW) && !eq(w, detectiveTask.wCorrect)) {
              bg = COLOR.redBg;
              border = '#fca5a5';
              color = COLOR.red;
            } else if (selectedW && eq(w, selectedW)) {
              bg = COLOR.blueBg;
              border = COLOR.blueBorder;
              color = COLOR.blue;
            }
            return (
              <button
                key={label}
                type="button"
                onClick={() => !submitted && setSelectedW(w)}
                style={{
                  padding: '12px 16px',
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: 'left',
                  borderRadius: 10,
                  border: `2px solid ${border}`,
                  background: bg,
                  color,
                  cursor: submitted ? 'default' : 'pointer',
                }}
              >
                w = {label}
                {submitted && eq(w, detectiveTask.wCorrect) ? ' \u2713' : ''}
                {submitted && selectedW && eq(w, selectedW) && !eq(w, detectiveTask.wCorrect) ? ' \u2717' : ''}
              </button>
            );
          })}
        </div>

        {submitted && (
          <p aria-live="polite" style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: isDetectiveCorrect ? COLOR.successText : COLOR.red, lineHeight: 1.5 }}>
            {isDetectiveCorrect
              ? '\u2713 Correct: that multiplier sends z\u2080 to the target.'
              : `\u2717 The correct w is ${detectiveTask.wCorrect.key || fmtComplex(detectiveTask.wCorrect.re, detectiveTask.wCorrect.im)}.`}
          </p>
        )}

        {!submitted && (
          <button
            type="button"
            onClick={handleCheckDetective}
            disabled={!selectedW}
            style={selectedW ? { ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)` } : BTN_PRIMARY_DISABLED}
          >
            Check
          </button>
        )}
        {submitted && round < DETECTIVE_ROUNDS - 1 && (
          <button type="button" onClick={handleNextRound} style={{ ...BTN_PRIMARY, marginLeft: 8 }}>Next round</button>
        )}
        {submitted && round === DETECTIVE_ROUNDS - 1 && (
          <button type="button" onClick={handleNextRound} style={{ ...BTN_PRIMARY, marginLeft: 8 }}>{continueLabel}</button>
        )}
      </div>
    </div>
  );
}
