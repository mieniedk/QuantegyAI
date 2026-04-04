/**
 * ComplexCardSortExplorer — Match each rectangular form to its polar description (same complex number).
 */
import React, { useState, useMemo, useCallback } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';

const TRIPLES = [
  { id: 'a', rect: '1 + i', polar: '\u221a2 cis(\u03c0/4)', re: 1, im: 1 },
  { id: 'b', rect: '2i', polar: '2 cis(\u03c0/2)', re: 0, im: 2 },
  { id: 'c', rect: '\u22121', polar: '1 cis(\u03c0)', re: -1, im: 0 },
];

function seededShuffle(arr, seedStr) {
  const a = [...arr];
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = ((h << 5) - h + seedStr.charCodeAt(i)) | 0;
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 16807 + 1) & 0x7fffffff;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const W = 72;
const H = 72;
const S = 14;

function MiniPlot({ re, im }) {
  const cx = W / 2 + re * S;
  const cy = H / 2 - im * S;
  return (
    <svg width={W} height={H} style={{ borderRadius: 8, background: '#f8fafc', border: `1px solid ${COLOR.border}` }}>
      <line x1={W / 2} y1={4} x2={W / 2} y2={H - 4} stroke={COLOR.border} strokeWidth={1} />
      <line x1={4} y1={H / 2} x2={W - 4} y2={H / 2} stroke={COLOR.border} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={6} fill={COLOR.blue} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

export default function ComplexCardSortExplorer({
  onComplete,
  continueLabel = 'Continue',
  badgeLabel,
  embedded = false,
  activityIndex = 0,
}) {
  const polarOrder = useMemo(
    () => seededShuffle(TRIPLES.map((t) => ({ id: t.id, label: t.polar })), `ccsort-polar-${activityIndex}`),
    [activityIndex],
  );

  const [matched, setMatched] = useState(() => new Set());
  const [pickRect, setPickRect] = useState(null);
  const [pickPolar, setPickPolar] = useState(null);
  const tryPair = useCallback(
    (rectId, polarId) => {
      if (rectId === polarId) {
        setMatched((m) => new Set([...m, rectId]));
        setPickRect(null);
        setPickPolar(null);
      } else {
        setPickRect(null);
        setPickPolar(null);
      }
    },
    [],
  );

  const onRectClick = (id) => {
    if (matched.has(id)) return;
    if (pickPolar != null) tryPair(id, pickPolar);
    else setPickRect((p) => (p === id ? null : id));
  };

  const onPolarClick = (id) => {
    if (matched.has(id)) return;
    if (pickRect != null) tryPair(pickRect, id);
    else setPickPolar((p) => (p === id ? null : id));
  };

  const allDone = matched.size === TRIPLES.length;

  const cardStyle = (selected, locked) => ({
    padding: '12px 14px',
    fontSize: 14,
    fontWeight: 700,
    borderRadius: 10,
    border: `2px solid ${locked ? COLOR.successBorder : selected ? COLOR.blue : COLOR.border}`,
    background: locked ? COLOR.successBg : selected ? COLOR.blueBg : COLOR.card,
    color: locked ? COLOR.successText : COLOR.text,
    cursor: locked ? 'default' : 'pointer',
    textAlign: 'center',
    transition: 'border-color 0.15s, background 0.15s',
  });

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel || 'Representations'}</div>}
      <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 800, color: COLOR.text }}>Representation match</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.55 }}>
        Each row in the middle is one number in rectangular form with its plot. Tap a <strong>rectangular</strong> card, then the <strong>polar</strong> card that describes the same point.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rectangular + plot</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRIPLES.map((t) => {
              const locked = matched.has(t.id);
              const selected = pickRect === t.id;
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button type="button" onClick={() => onRectClick(t.id)} disabled={locked} style={{ ...cardStyle(selected, locked), flex: 1 }}>
                    {t.rect}
                  </button>
                  <MiniPlot re={t.re} im={t.im} />
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 800, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Polar (shuffled)</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {polarOrder.map((p) => {
              const locked = matched.has(p.id);
              const selected = pickPolar === p.id;
              return (
                <button key={p.id} type="button" onClick={() => onPolarClick(p.id)} disabled={locked} style={{ ...cardStyle(selected, locked), minHeight: 48 }}>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {allDone ? (
        <>
          <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: COLOR.successText }}>
            \u2713 All three pairs match. Same modulus and argument in polar as in the plane.
          </p>
          <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: COLOR.textMuted }}>
          Matched: {matched.size}/{TRIPLES.length}
          {(pickRect || pickPolar) && ' — tap the matching card in the other column.'}
        </p>
      )}
    </div>
  );
}
