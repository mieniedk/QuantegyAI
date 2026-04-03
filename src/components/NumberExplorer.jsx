/**
 * NumberExplorer — Interactive activities for Domain I: Number Concepts.
 *
 * Modes (rotated by activityIndex):
 *   0  "number-line"    Drag number tokens to correct positions on a number line.
 *   1  "complex-plane"  Reuses the existing ComplexPlaneExplorer component.
 *   2  "prime-blast"    Select all prime numbers from 1 to 50.
 *   3  "factor-lab"     Build prime factorization trees, then find GCF / LCM.
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';
import { sanitizeHtml } from '../utils/sanitize';
import ComplexPlaneExplorer from './ComplexPlaneExplorer';
import qbotImg from '../assets/qbot.svg';

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const roundTo = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

function QBotBubble({ message, mood }) {
  const moodEmoji = { wave: '\u{1F44B}', think: '\u{1F914}', encourage: '\u{1F4AA}', celebrate: '\u{1F389}' };
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #a78bfa', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
        <img src={qbotImg} alt="QBot" style={{ width: 26 }} />
      </div>
      <div aria-live="polite" style={{ background: '#f5f3ff', borderRadius: '2px 12px 12px 12px', padding: '8px 12px', border: '1px solid #ddd6fe', flex: 1, fontSize: 13, fontWeight: 600, color: '#4c1d95', lineHeight: 1.5 }}>
        <span style={{ marginRight: 4 }}>{moodEmoji[mood] || ''}</span>{message}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 0 — Number Line Plot
   Drag number tokens (fractions, irrationals, decimals) to their correct
   positions on a number line. QBot gives hot/cold feedback.
   ═══════════════════════════════════════════════════════════════════════════ */

const NUMBER_SETS = [
  [
    { label: '\u00BD', value: 0.5 },
    { label: '√(2)', value: 1.414 },
    { label: '2.7', value: 2.7 },
    { label: '\u03C0', value: 3.14159 },
    { label: '\u2154', value: 0.667 },
  ],
  [
    { label: '\u00BE', value: 0.75 },
    { label: '√(3)', value: 1.732 },
    { label: '1.5', value: 1.5 },
    { label: 'e', value: 2.718 },
    { label: '\u2155', value: 0.2 },
  ],
  [
    { label: '√(5)', value: 2.236 },
    { label: '\u2153', value: 0.333 },
    { label: '3.5', value: 3.5 },
    { label: '\u215B', value: 0.125 },
    { label: '\u03C0/2', value: 1.5708 },
  ],
];

function NumberLinePlot({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const numbers = useMemo(() => {
    const set = NUMBER_SETS[roundIdx % NUMBER_SETS.length];
    return set.map((n) => ({ ...n, placed: null }));
  }, [roundIdx]);

  const [placements, setPlacements] = useState(() => numbers.map(() => null));
  const [solved, setSolved] = useState(false);
  const [checked, setChecked] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(null);

  useEffect(() => { setPlacements(numbers.map(() => null)); setSolved(false); setChecked(false); }, [numbers]);

  const W = 380, H = 120, PAD = 30;
  const LINE_Y = 70;
  const RANGE = { min: 0, max: 4 };
  const scale = (v) => PAD + ((v - RANGE.min) / (RANGE.max - RANGE.min)) * (W - 2 * PAD);
  const unscale = (px) => clamp(roundTo(RANGE.min + ((px - PAD) / (W - 2 * PAD)) * (RANGE.max - RANGE.min), 2), RANGE.min, RANGE.max);

  const getPointerX = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const touchPoint = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touchPoint ? touchPoint.clientX : e.clientX;
    return (clientX - rect.left) * (W / rect.width);
  }, []);

  const onPointerDown = useCallback((idx, e) => {
    e.preventDefault();
    dragging.current = idx;
  }, []);
  const onPointerMove = useCallback((e) => {
    if (dragging.current == null) return;
    e.preventDefault();
    const x = getPointerX(e);
    const val = unscale(x);
    setPlacements((prev) => { const n = [...prev]; n[dragging.current] = val; return n; });
  }, [getPointerX]);
  const onPointerUp = useCallback(() => { dragging.current = null; }, []);
  const nudgePlacement = useCallback((idx, delta) => {
    setPlacements((prev) => {
      const next = [...prev];
      const base = next[idx] == null ? 2 : next[idx];
      next[idx] = clamp(roundTo(base + delta, 2), RANGE.min, RANGE.max);
      return next;
    });
  }, []);

  const allPlaced = placements.every((p) => p != null);
  const avgError = allPlaced
    ? roundTo(numbers.reduce((sum, n, i) => sum + Math.abs((placements[i] ?? n.value) - n.value), 0) / numbers.length, 2)
    : null;

  const handleCheck = useCallback(() => {
    setChecked(true);
    const allClose = numbers.every((n, i) => placements[i] != null && Math.abs(placements[i] - n.value) < 0.15);
    if (allClose) setSolved(true);
  }, [numbers, placements]);

  const getQBotMsg = () => {
    if (!allPlaced && !checked) return { msg: 'Drag each number token onto the number line. Think about where fractions and irrationals fall between the whole numbers!', mood: 'wave' };
    if (checked && solved) return { msg: 'Perfect placement! You clearly understand where these numbers live on the real number line.', mood: 'celebrate' };
    if (checked && !solved) {
      const worstIdx = numbers.reduce((worst, n, i) => {
        const err = placements[i] != null ? Math.abs(placements[i] - n.value) : 999;
        return err > (worst.err || 0) ? { idx: i, err } : worst;
      }, { idx: 0, err: 0 });
      return { msg: `Recheck ${numbers[worstIdx.idx].label}: its decimal value is about ${roundTo(numbers[worstIdx.idx].value, 2)}, so place it near that coordinate on the number line.`, mood: 'think' };
    }
    return { msg: 'Progress is building - finish placing every token, then verify each location against its decimal value.', mood: 'encourage' };
  };
  const qbot = getQBotMsg();

  const TOKEN_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Place the numbers on the number line
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Drag each token to its correct position between 0 and 4.
      </p>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1e3a8a', lineHeight: 1.45 }}>
        <strong>How to use:</strong> Pick a token, place it on the line, then fine-tune with left/right arrow keys when focused.
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: '12px 8px', marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          <line x1={PAD} y1={LINE_Y} x2={W - PAD} y2={LINE_Y} stroke={COLOR.border} strokeWidth={2} />
          {Array.from({ length: 9 }, (_, i) => {
            const v = i * 0.5;
            const x = scale(v);
            const isMajor = v === Math.floor(v);
            return <g key={v}>
              <line x1={x} y1={LINE_Y - (isMajor ? 8 : 4)} x2={x} y2={LINE_Y + (isMajor ? 8 : 4)} stroke="#94a3b8" strokeWidth={isMajor ? 1.5 : 0.5} />
              {isMajor && <text x={x} y={LINE_Y + 20} fontSize={10} fill="#6b7280" textAnchor="middle" fontWeight={600}>{v}</text>}
            </g>;
          })}
          {/* Placed tokens on the line */}
          {numbers.map((n, i) => {
            if (placements[i] == null) return null;
            const x = scale(placements[i]);
            const isClose = checked && Math.abs(placements[i] - n.value) < 0.15;
            const isFar = checked && !isClose;
            return (
              <g key={`placed-${i}`} style={{ cursor: 'grab' }}
                role="button"
                tabIndex={solved ? -1 : 0}
                aria-label={`Number ${n.label} at position ${placements[i]}. Use left and right arrow keys to move.`}
                onKeyDown={(e) => {
                  if (solved) return;
                  if (e.key === 'ArrowLeft') { e.preventDefault(); nudgePlacement(i, -0.1); }
                  if (e.key === 'ArrowRight') { e.preventDefault(); nudgePlacement(i, 0.1); }
                }}
                onMouseDown={(e) => !solved && onPointerDown(i, e)}
                onTouchStart={(e) => !solved && onPointerDown(i, e)}>
                <circle cx={x} cy={LINE_Y} r={14} fill={isClose ? COLOR.green : isFar ? '#ef4444' : TOKEN_COLORS[i]} opacity={0.9} stroke="#fff" strokeWidth={2} />
                <text x={x} y={LINE_Y + 4} fontSize={8} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>{n.label}</text>
              </g>
            );
          })}
          {/* Show correct positions after check */}
          {checked && !solved && numbers.map((n, i) => {
            const x = scale(n.value);
            return <g key={`correct-${i}`} opacity={0.4}>
              <line x1={x} y1={LINE_Y - 18} x2={x} y2={LINE_Y - 6} stroke={TOKEN_COLORS[i]} strokeWidth={2} />
              <text x={x} y={LINE_Y - 21} fontSize={7} fill={TOKEN_COLORS[i]} textAnchor="middle" fontWeight={700}>{n.label}</text>
            </g>;
          })}
        </svg>
      </div>

      {/* Token tray for unplaced tokens */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14, touchAction: 'none' }}>
        {numbers.map((n, i) => (
          <button key={i} type="button" style={{
            padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: 14,
            background: placements[i] != null ? `${TOKEN_COLORS[i]}18` : TOKEN_COLORS[i],
            color: placements[i] != null ? TOKEN_COLORS[i] : '#fff',
            border: `2px solid ${TOKEN_COLORS[i]}`,
            cursor: placements[i] != null ? 'default' : 'grab',
            opacity: placements[i] != null ? 0.5 : 1,
            lineHeight: 1.2,
          }}
            aria-label={placements[i] != null ? `${n.label} is placed on number line` : `Place ${n.label} on number line`}
            disabled={placements[i] != null || solved}
            onMouseDown={(e) => { if (placements[i] == null && !solved) { setPlacements((prev) => { const n2 = [...prev]; n2[i] = 2; return n2; }); dragging.current = i; } }}
            onTouchStart={(e) => { e.preventDefault(); if (placements[i] == null && !solved) { setPlacements((prev) => { const n2 = [...prev]; n2[i] = 2; return n2; }); dragging.current = i; } }}
            onKeyDown={(e) => {
              if (placements[i] != null || solved) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setPlacements((prev) => { const n2 = [...prev]; n2[i] = 2; return n2; });
              }
            }}
          >
            {n.label} {placements[i] != null ? '\u2713' : ''}
          </button>
        ))}
      </div>

      {solved && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} All numbers placed correctly!</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: COLOR.textSecondary }}>Fractions, irrationals, and transcendental numbers all have precise positions on the real number line.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ padding: '4px 10px', borderRadius: 8, background: allPlaced ? '#ecfeff' : '#f8fafc', border: `1px solid ${allPlaced ? '#67e8f9' : '#e5e7eb'}`, fontSize: 12, fontWeight: 700, color: allPlaced ? '#0e7490' : '#64748b' }}>
          Placed: {placements.filter((p) => p != null).length}/{numbers.length}
        </div>
        {avgError != null && (
          <div style={{ padding: '4px 10px', borderRadius: 8, background: avgError <= 0.15 ? '#ecfdf5' : '#fff7ed', border: `1px solid ${avgError <= 0.15 ? '#86efac' : '#fdba74'}`, fontSize: 12, fontWeight: 700, color: avgError <= 0.15 ? '#047857' : '#9a3412' }}>
            Avg error: {avgError}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={handleCheck} disabled={!allPlaced}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, opacity: allPlaced ? 1 : 0.4, flex: '1 1 auto' }}>
            Check Positions
          </button>
        )}
        {checked && !solved && (
          <button type="button" onClick={() => setChecked(false)}
            style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
            {'\u{1F504}'} Retry
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Set
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
      <style>{`@keyframes fadeIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE — Real number sets (ℕ ⊂ 𝕎 ⊂ ℤ ⊂ ℚ ⊂ ℝ)
   Classify each value by the **smallest** set in the chain that contains it.
   ℕ = {1,2,…}; 𝕎 adds 0; ℤ adds negatives; ℚ adds non-integer rationals; last = irrationals.
   ═══════════════════════════════════════════════════════════════════════════ */

const REAL_SET_ZONES = [
  {
    id: 'N',
    short: 'ℕ',
    title: 'Natural numbers',
    subtitle: 'Counting numbers 1, 2, 3, …',
    accent: '#15803d',
    bg: '#ecfdf5',
    border: '#86efac',
  },
  {
    id: 'W',
    short: '𝕎',
    title: 'Whole numbers',
    subtitle: 'Use for 0 here — we take ℕ = 1, 2, 3, …',
    accent: '#0d9488',
    bg: '#f0fdfa',
    border: '#5eead4',
  },
  {
    id: 'Z',
    short: 'ℤ',
    title: 'Integers',
    subtitle: 'Negative integers (…, −2, −1) — positives are naturals in this activity',
    accent: '#2563eb',
    bg: '#eff6ff',
    border: '#93c5fd',
  },
  {
    id: 'Q',
    short: 'ℚ',
    title: 'Rational numbers',
    subtitle: 'Ratios of integers: fractions, terminating or repeating decimals (not integers)',
    accent: '#7c3aed',
    bg: '#f5f3ff',
    border: '#c4b5fd',
  },
  {
    id: 'R',
    short: 'Irrational',
    title: 'Irrational (ℝ \\ ℚ)',
    subtitle: 'Real but not rational — e.g. √2, π',
    accent: '#c2410c',
    bg: '#fff7ed',
    border: '#fdba74',
  },
];

/** @type {{ label: string, zone: string, explain: string }[]} */
const REAL_SET_ITEMS = [
  { label: '17', zone: 'N', explain: '17 is a counting number, so it lives in ℕ (and every larger set).' },
  { label: '1', zone: 'N', explain: '1 is the smallest natural in this activity’s ℕ = {1, 2, 3, …}.' },
  { label: '0', zone: 'W', explain: '0 is whole. We treat ℕ as 1, 2, 3, …, so 0’s smallest set here is 𝕎.' },
  { label: '−9', zone: 'Z', explain: 'Negative integers are in ℤ; they are not whole numbers in the usual school sense.' },
  { label: '−1', zone: 'Z', explain: 'Same idea: negative integers belong to ℤ.' },
  { label: '3/4', zone: 'Q', explain: 'A fraction of two integers (denominator ≠ 0) that is not an integer sits in ℚ.' },
  { label: '−2.5', zone: 'Q', explain: 'Terminating decimals are rational; this is not an integer.' },
  { label: '0.\\overline{3}', zone: 'Q', explain: 'A repeating decimal is rational (here 1/3).' },
  { label: '2.\\overline{7}', zone: 'Q', explain: 'Repeating decimals are rational numbers.' },
  { label: '√5', zone: 'R', explain: '√5 cannot be written as a ratio of integers; it is irrational (still real).' },
  { label: 'π', zone: 'R', explain: 'π is real but not rational.' },
  { label: '√2 / 2', zone: 'R', explain: 'This is irrational (not a ratio of two integers in lowest terms as a rational would be).' },
  { label: '6', zone: 'N', explain: 'Positive counting number → ℕ.' },
  { label: '−3/1', zone: 'Z', explain: '−3/1 equals −3, an integer (not whole), so smallest set is ℤ.' },
];

function shuffleRealSetItems(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function RealNumberSetsExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => shuffleRealSetItems(REAL_SET_ITEMS).slice(0, 8), [round]);
  const [assignments, setAssignments] = useState({});
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAssignments({});
    setSelectedLabel(null);
    setChecked(false);
  }, [round]);

  const allAssigned = items.length > 0 && items.every((it) => assignments[it.label] != null);
  const correctCount = checked
    ? items.filter((it) => assignments[it.label] === it.zone).length
    : 0;
  const allCorrect = checked && correctCount === items.length;

  const assign = (zoneId) => {
    if (!selectedLabel || checked) return;
    setAssignments((prev) => ({ ...prev, [selectedLabel]: zoneId }));
    setSelectedLabel(null);
  };

  const qbot = !checked
    ? { msg: 'Tap a number, then tap the **smallest** set that still contains it — from ℕ out to irrationals.', mood: 'wave' }
    : allCorrect
      ? { msg: 'Nice! You matched each value to its tightest set in ℕ ⊂ 𝕎 ⊂ ℤ ⊂ ℚ ⊂ ℝ.', mood: 'celebrate' }
      : { msg: `You have ${correctCount}/${items.length} correct. Read the hints and try Check again.`, mood: 'think' };

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Place numbers in the real number system
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
        Sets nest like Russian dolls: <strong>ℕ</strong> (naturals) ⊂ <strong>𝕎</strong> (wholes) ⊂ <strong>ℤ</strong> (integers) ⊂ <strong>ℚ</strong> (rationals) ⊂ <strong>ℝ</strong> (reals).
        For each value, choose the <strong>innermost</strong> set it belongs to. Irrationals use the last row (real but not rational).
      </p>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How:</strong> Tap a chip below, then tap the matching set. ℕ = 1, 2, 3, … only; 𝕎 is for 0 here; negative integers go under ℤ; non-integer rationals under ℚ; √2, π, etc. under the last row.
      </div>

      {/* Nested visual (conceptual) */}
      <div style={{ marginBottom: 14, padding: '12px 10px', borderRadius: 14, background: 'linear-gradient(180deg,#fffbeb 0%,#fef3c7 100%)', border: '1px solid #fcd34d' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, textAlign: 'center' }}>
          Smallest set wins
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
          {REAL_SET_ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => assign(z.id)}
              disabled={checked}
              style={{
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 12,
                border: `2px solid ${z.border}`,
                background: z.bg,
                cursor: checked ? 'default' : 'pointer',
                opacity: checked ? 0.85 : 1,
                transition: 'transform 0.12s',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: z.accent }}>
                {z.short} · {z.title}
              </div>
              <div style={{ fontSize: 11, color: COLOR.textSecondary, marginTop: 2, lineHeight: 1.35 }}>{z.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.text, marginBottom: 8 }}>Number bank — tap one, then a set:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {items.map((it) => {
          const placed = assignments[it.label] != null;
          const zoneMeta = placed ? REAL_SET_ZONES.find((z) => z.id === assignments[it.label]) : null;
          const wrong = checked && placed && assignments[it.label] !== it.zone;
          const right = checked && placed && assignments[it.label] === it.zone;
          return (
            <button
              key={`${round}-${it.label}`}
              type="button"
              disabled={checked}
              onClick={() => !checked && setSelectedLabel((s) => (s === it.label ? null : it.label))}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                border: `2px solid ${
                  right ? COLOR.greenBorder : wrong ? '#fca5a5' : selectedLabel === it.label ? COLOR.blue : COLOR.border
                }`,
                background: right ? COLOR.greenLight : wrong ? '#fef2f2' : selectedLabel === it.label ? COLOR.blueBg : '#fff',
                color: wrong ? '#b91c1c' : COLOR.text,
                cursor: checked ? 'default' : 'pointer',
                opacity: placed && !checked ? 0.75 : 1,
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(it.label.replace(/\.\\overline\{([^}]+)\}/g, '<span style="text-decoration:overline">$1</span>')) }} />
              {placed && !checked && zoneMeta && (
                <span style={{ fontSize: 10, fontWeight: 700, marginLeft: 6, color: zoneMeta.accent }}>→ {zoneMeta.short}</span>
              )}
              {right && ' ✓'}
              {wrong && ' ✗'}
            </button>
          );
        })}
      </div>

      {checked && !allCorrect && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fcd34d', fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
          {items.filter((it) => assignments[it.label] !== it.zone).map((it) => (
            <p key={it.label} style={{ margin: '0 0 6px' }}>
              <strong>{it.label.replace(/\.\\overline\{([^}]+)\}/g, '$1̅')}</strong>: {it.explain}
            </p>
          ))}
        </div>
      )}

      {allCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>✓ Every value is in its tightest set.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={!allAssigned}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, opacity: allAssigned ? 1 : 0.45 }}
          >
            Check classifications
          </button>
        )}
        {checked && !allCorrect && (
          <button type="button" onClick={() => { setChecked(false); setAssignments({}); setSelectedLabel(null); }} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
            Clear and retry
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#64748b,#475569)' }}>
          New set of numbers
        </button>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
      <style>{`@keyframes fadeIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Real number properties — commutative, associative, distributive, identities
   ═══════════════════════════════════════════════════════════════════════════ */

const PROPERTY_LABELS = {
  commutative: 'Commutative',
  associative: 'Associative',
  distributive: 'Distributive',
  identity: 'Identity / inverse idea',
};

const PROPERTY_ITEMS = [
  { id: 'p1', text: 'a + b = b + a', answer: 'commutative', hint: 'Order of terms swapped; sum unchanged.' },
  { id: 'p2', text: '(a + b) + c = a + (b + c)', answer: 'associative', hint: 'Grouping of addition changes, not order of numbers.' },
  { id: 'p3', text: 'a(b + c) = ab + ac', answer: 'distributive', hint: 'Multiplication spreads across a sum.' },
  { id: 'p4', text: 'a + (−a) = 0', answer: 'identity', hint: 'Additive inverse pairs with addition to give the additive identity 0.' },
  { id: 'p5', text: 'x · 1 = x', answer: 'identity', hint: 'Multiplying by 1 leaves x unchanged (multiplicative identity).' },
  { id: 'p6', text: '(xy)z = x(yz)', answer: 'associative', hint: 'Grouping of multiplication changes.' },
];

function RealNumberPropertiesExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);
  const batch = useMemo(() => {
    const a = [...PROPERTY_ITEMS];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 4);
  }, [round]);
  const [picked, setPicked] = useState({});
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setPicked({});
    setChecked(false);
  }, [round]);

  const allPicked = batch.every((it) => picked[it.id]);
  const nCorrect = checked ? batch.filter((it) => picked[it.id] === it.answer).length : 0;
  const allRight = checked && nCorrect === batch.length;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Properties of the real numbers
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
        For each statement, choose whether it illustrates commutativity, associativity, the distributive property, or an identity / additive-inverse idea.
      </p>
      <QBotBubble
        message={!checked ? 'These properties justify every algebra move you make on the real numbers.' : allRight ? 'Strong! You separated structure (how numbers combine) from the particular values.' : 'Use each hint — focus on whether order, grouping, or factoring across a sum changed.'}
        mood={!checked ? 'wave' : allRight ? 'celebrate' : 'think'}
      />
      {batch.map((it) => (
        <div key={it.id} style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 12, border: `1px solid ${COLOR.border}`, background: '#fafafa' }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: COLOR.text }}>{it.text}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(PROPERTY_LABELS).map(([key, label]) => {
              const sel = picked[it.id] === key;
              const show = checked;
              const ok = show && key === it.answer;
              const bad = show && sel && key !== it.answer;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={checked}
                  onClick={() => !checked && setPicked((p) => ({ ...p, [it.id]: key }))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `2px solid ${ok ? COLOR.greenBorder : bad ? '#fca5a5' : sel ? COLOR.blue : COLOR.border}`,
                    background: ok ? COLOR.greenLight : bad ? '#fef2f2' : sel ? COLOR.blueBg : '#fff',
                    color: bad ? '#b91c1c' : COLOR.text,
                    cursor: checked ? 'default' : 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {checked && picked[it.id] !== it.answer && (
            <p style={{ margin: '8px 0 0', fontSize: 11, color: COLOR.textSecondary }}>{it.hint}</p>
          )}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {!checked && (
          <button type="button" disabled={!allPicked} onClick={() => setChecked(true)} style={{ ...BTN_PRIMARY, opacity: allPicked ? 1 : 0.45 }}>
            Check
          </button>
        )}
        {checked && !allRight && (
          <button type="button" onClick={() => { setPicked({}); setChecked(false); }} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)' }}>
            Retry
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#64748b,#475569)' }}>
          New set
        </button>
        <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Complex arithmetic quick-check (same standard as complex plane, different UI)
   ═══════════════════════════════════════════════════════════════════════════ */

const COMPLEX_MC_ROUNDS = [
  { q: '(2 + 3i) + (1 − 2i) = ?', choices: ['3 + i', '3 − i', '1 + 5i', '3 + 5i'], a: '3 + i', why: 'Add real parts (2+1) and imaginary parts (3i−2i).' },
  { q: '(1 + i)(1 − i) = ?', choices: ['2', '−2', '2i', '0'], a: '2', why: 'Difference of squares: 1 − i² = 1 − (−1) = 2.' },
  { q: 'i⁴ = ?', choices: ['1', '−1', 'i', '−i'], a: '1', why: 'Powers of i cycle every 4: i⁴ = (i²)² = (−1)² = 1.' },
  { q: 'Conjugate of 4 − 5i is ?', choices: ['4 + 5i', '−4 − 5i', '−4 + 5i', '4 − 5i'], a: '4 + 5i', why: 'Flip the sign on the imaginary part.' },
  { q: '|3 + 4i| = ?', choices: ['5', '7', '12', '25'], a: '5', why: '√(3² + 4²) = √25 = 5.' },
  { q: '(2i)(3i) = ?', choices: ['−6', '6', '6i', '5i'], a: '−6', why: '2·3·i² = 6(−1) = −6.' },
];

function shuffleChoices(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ComplexArithmeticExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => {
    const a = [...COMPLEX_MC_ROUNDS];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, 4).map((r) => ({ ...r, shuffled: shuffleChoices(r.choices) }));
  }, [round]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setIdx(0);
    setSel(null);
    setRevealed(false);
    setScore(0);
    setFinished(false);
  }, [round]);

  const cur = deck[idx];
  const pick = (c) => {
    if (revealed || finished) return;
    setSel(c);
    setRevealed(true);
    if (c === cur.a) setScore((s) => s + 1);
  };

  const goNextOrFinish = () => {
    if (idx + 1 >= deck.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSel(null);
    setRevealed(false);
  };

  if (finished) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Complex skills check: {score}/{deck.length}</p>
        <QBotBubble message={score >= deck.length - 1 ? 'Solid command of operations, conjugates, and modulus on ℂ.' : 'Review i² = −1, adding like parts, and |a+bi| = √(a²+b²).'} mood={score >= deck.length - 1 ? 'celebrate' : 'encourage'} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setRound((r) => r + 1)} style={BTN_PRIMARY}>New questions</button>
          <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
        </div>
      </div>
    );
  }

  if (!cur) return null;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Complex number quick checks
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: COLOR.textMuted, fontWeight: 700 }}>Question {idx + 1} of {deck.length}</p>
      <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: COLOR.text }}>{cur.q}</p>
      <QBotBubble message={revealed ? (sel === cur.a ? 'Yes — ' + cur.why : 'Not quite — ' + cur.why) : 'Use i² = −1 and combine real with real, imaginary with imaginary.'} mood={revealed ? (sel === cur.a ? 'celebrate' : 'think') : 'wave'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {cur.shuffled.map((c) => {
          const isSel = sel === c;
          const showOk = revealed && c === cur.a;
          const showBad = revealed && isSel && c !== cur.a;
          return (
            <button
              key={c}
              type="button"
              disabled={revealed}
              onClick={() => pick(c)}
              style={{
                ...BTN_PRIMARY,
                textAlign: 'left',
                background: showOk ? COLOR.successBg : showBad ? '#fef2f2' : BTN_PRIMARY.background,
                borderColor: showOk ? COLOR.successBorder : showBad ? '#fca5a5' : COLOR.blueBorder,
                color: showBad ? '#b91c1c' : COLOR.text,
                opacity: revealed && !showOk && !showBad ? 0.65 : 1,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
      {revealed && (
        <button type="button" onClick={goNextOrFinish} style={{ ...BTN_PRIMARY, marginBottom: 10 }}>
          {idx + 1 >= deck.length ? 'See results' : 'Next question'}
        </button>
      )}
    </div>
  );
}

const COMPLEX_EQ_ROUNDS = [
  { q: 'In ℂ, the solutions of z² = −16 are:', choices: ['±4i', '±4', '±8i', 'no solutions'], a: '±4i', why: 'z = ±√(−16) = ±4i.' },
  { q: 'A real polynomial with root 2 + i must also have root:', choices: ['2 − i', '−2 + i', '−2 − i', 'i only'], a: '2 − i', why: 'Non-real roots of real-coefficient polynomials come in conjugate pairs.' },
  { q: '(1 + i)² equals:', choices: ['2i', '−2i', '2', '−2'], a: '2i', why: '1 + 2i + i² = 1 + 2i − 1 = 2i.' },
  { q: 'Multiplicative inverse of i (number you multiply by i to get 1) is:', choices: ['−i', 'i', '1', '−1'], a: '−i', why: 'i · (−i) = −i² = 1.' },
];

function ComplexEquationsExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);
  const deck = useMemo(() => {
    const a = [...COMPLEX_EQ_ROUNDS];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.map((r) => ({ ...r, shuffled: shuffleChoices(r.choices) }));
  }, [round]);
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setIdx(0);
    setSel(null);
    setRevealed(false);
    setScore(0);
    setFinished(false);
  }, [round]);

  const cur = deck[idx];

  const pick = (c) => {
    if (revealed || finished || !cur) return;
    setSel(c);
    setRevealed(true);
    if (c === cur.a) setScore((s) => s + 1);
  };

  const goNextOrFinish = () => {
    if (idx + 1 >= deck.length) {
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
    setSel(null);
    setRevealed(false);
  };

  if (finished) {
    return (
      <div style={embedded ? {} : CARD}>
        {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
        <p style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Complex equations & structure: {score}/{deck.length}</p>
        <QBotBubble message={score === deck.length ? 'Great — conjugate pairs, powers of i, and simple quadratics in ℂ are TExES staples.' : 'Revisit conjugate root theorem and solving z² = negative real using i.'} mood={score === deck.length ? 'celebrate' : 'encourage'} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setRound((r) => r + 1)} style={BTN_PRIMARY}>New set</button>
          <button type="button" onClick={onComplete} style={BTN_PRIMARY}>{continueLabel}</button>
        </div>
      </div>
    );
  }

  if (!cur) return null;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Complex equations & conjugate reasoning
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: COLOR.textMuted, fontWeight: 700 }}>Question {idx + 1} of {deck.length}</p>
      <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: COLOR.text }}>{cur.q}</p>
      <QBotBubble message={revealed ? (sel === cur.a ? 'Right — ' + cur.why : cur.why) : 'Think about i² = −1, conjugate pairs for real polynomials, and inverse of i.'} mood={revealed ? (sel === cur.a ? 'celebrate' : 'think') : 'wave'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {cur.shuffled.map((c) => {
          const isSel = sel === c;
          const showOk = revealed && c === cur.a;
          const showBad = revealed && isSel && c !== cur.a;
          return (
            <button
              key={c}
              type="button"
              disabled={revealed}
              onClick={() => pick(c)}
              style={{
                ...BTN_PRIMARY,
                textAlign: 'left',
                background: showOk ? COLOR.successBg : showBad ? '#fef2f2' : BTN_PRIMARY.background,
                borderColor: showOk ? COLOR.successBorder : showBad ? '#fca5a5' : COLOR.blueBorder,
                color: showBad ? '#b91c1c' : COLOR.text,
                opacity: revealed && !showOk && !showBad ? 0.65 : 1,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
      {revealed && (
        <button type="button" onClick={goNextOrFinish} style={{ ...BTN_PRIMARY, marginBottom: 10 }}>
          {idx + 1 >= deck.length ? 'See results' : 'Next'}
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Prime Number Blast
   Show numbers 1..50. Learner selects only primes; correct picks trigger
   a short sound and burst animation.
   ═══════════════════════════════════════════════════════════════════════════ */
function PrimeNumberBlast({ onComplete, continueLabel, badgeLabel, embedded }) {
  const numbers = useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);
  const primeSet = useMemo(() => new Set(numbers.filter((n) => isPrime(n))), [numbers]);
  const totalPrimes = primeSet.size;

  const [selectedPrimes, setSelectedPrimes] = useState(() => new Set());
  const [wrongPicks, setWrongPicks] = useState(() => new Set());
  const [bursts, setBursts] = useState([]);
  const [lastMessage, setLastMessage] = useState('Tap each prime number on the grid.');
  const audioCtxRef = useRef(null);
  const timeoutRefs = useRef([]);

  useEffect(() => () => {
    timeoutRefs.current.forEach((t) => clearTimeout(t));
  }, []);

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutRefs.current.push(id);
  }, []);

  const playPrimeSound = useCallback((primeHitCount) => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420 + Math.min(260, primeHitCount * 10), now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }, []);

  const handlePick = useCallback((n) => {
    if (selectedPrimes.has(n)) return;

    if (primeSet.has(n)) {
      setSelectedPrimes((prev) => {
        const next = new Set(prev);
        next.add(n);
        return next;
      });
      setWrongPicks((prev) => {
        if (!prev.has(n)) return prev;
        const next = new Set(prev);
        next.delete(n);
        return next;
      });

      const burstId = `${n}-${Date.now()}`;
      setBursts((prev) => [...prev, { id: burstId, n }]);
      scheduleTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== burstId));
      }, 550);

      const nextCount = selectedPrimes.size + 1;
      playPrimeSound(nextCount);
      setLastMessage(`Correct prime selection: ${n} has exactly two factors (1 and ${n}).`);
    } else {
      setWrongPicks((prev) => {
        const next = new Set(prev);
        next.add(n);
        return next;
      });
      setLastMessage(`${n} is not prime. Try numbers with exactly two factors.`);
    }
  }, [primeSet, selectedPrimes, playPrimeSound, scheduleTimeout]);

  const foundCount = selectedPrimes.size;
  const solved = foundCount === totalPrimes;

  const qbot = solved
    ? { msg: `All ${totalPrimes} primes from 1 to 50 are identified. Strong factor-based classification.`, mood: 'celebrate' }
    : { msg: `${lastMessage} Prime numbers have exactly two factors: 1 and itself.`, mood: 'encourage' };

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Prime Number Blast
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Select all prime numbers from 1 to 50.
      </p>
      <div style={{ margin: '0 0 10px', padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLOR.border}`, background: '#f8fafc' }}>
        <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary }}>
          <strong>How to use:</strong> Tap a number once. Correct prime picks play a sound and trigger a mini explosion.
        </p>
      </div>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {foundCount}/{totalPrimes} primes
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Remaining: {totalPrimes - foundCount}
        </span>
      </div>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 8, marginBottom: 12 }}>
        {numbers.map((n) => {
          const isHit = selectedPrimes.has(n);
          const isMiss = wrongPicks.has(n) && !isHit;
          const activeBurst = bursts.some((b) => b.n === n);
          return (
            <button
              key={n}
              type="button"
              onClick={() => !solved && handlePick(n)}
              disabled={solved || isHit}
              aria-label={`Number ${n}${isHit ? ' selected as prime' : ''}`}
              style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 40,
                borderRadius: 10,
                border: `2px solid ${isHit ? COLOR.greenBorder : isMiss ? '#fca5a5' : COLOR.border}`,
                background: isHit ? COLOR.greenLight : isMiss ? '#fef2f2' : '#ffffff',
                color: isHit ? COLOR.green : isMiss ? '#b91c1c' : COLOR.text,
                fontWeight: 800,
                fontSize: 14,
                cursor: solved || isHit ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {n}
              {isHit && <span style={{ marginLeft: 6 }}>{'\u2713'}</span>}
              {activeBurst && (
                <>
                  <span style={{ position: 'absolute', inset: 0, margin: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'primePop 0.5s ease-out forwards' }} />
                  <span style={{ position: 'absolute', left: '50%', top: '50%', width: 4, height: 4, borderRadius: '50%', background: '#fb7185', animation: 'primeRay1 0.5s ease-out forwards' }} />
                  <span style={{ position: 'absolute', left: '50%', top: '50%', width: 4, height: 4, borderRadius: '50%', background: '#38bdf8', animation: 'primeRay2 0.5s ease-out forwards' }} />
                  <span style={{ position: 'absolute', left: '50%', top: '50%', width: 4, height: 4, borderRadius: '50%', background: '#a3e635', animation: 'primeRay3 0.5s ease-out forwards' }} />
                </>
              )}
            </button>
          );
        })}
      </div>

      {solved && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Prime master! You found every prime from 1 to 50.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            setSelectedPrimes(new Set());
            setWrongPicks(new Set());
            setBursts([]);
            setLastMessage('Grid reset. Find all prime numbers again.');
          }}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}
        >
          {'\u{1F504}'} Reset Grid
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>

      <style>{`
        @keyframes primePop { 0%{transform:scale(0.4);opacity:0.9} 100%{transform:scale(5);opacity:0} }
        @keyframes primeRay1 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(16px,-16px) scale(1.2);opacity:0} }
        @keyframes primeRay2 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(-18px,8px) scale(1.2);opacity:0} }
        @keyframes primeRay3 { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(4px,18px) scale(1.2);opacity:0} }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Factor Lab
   Given a composite number, split it into factor pairs by clicking until
   all leaves are prime. Then identify GCF/LCM of two numbers.
   ═══════════════════════════════════════════════════════════════════════════ */

function getFactorPairs(n) {
  const pairs = [];
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) pairs.push([i, n / i]);
  }
  return pairs;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) { if (n % i === 0) return false; }
  return true;
}

function primeFactors(n) {
  const factors = [];
  let d = 2;
  while (n > 1) {
    while (n % d === 0) { factors.push(d); n /= d; }
    d++;
  }
  return factors;
}

function FactorLab({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);

  const problem = useMemo(() => {
    const composites = [12, 18, 24, 30, 36, 42, 48, 56, 60, 72, 84, 90];
    const a = composites[rand(0, composites.length - 1)];
    let b = composites[rand(0, composites.length - 1)];
    while (b === a) b = composites[rand(0, composites.length - 1)];
    const pf_a = primeFactors(a);
    const pf_b = primeFactors(b);
    const allPrimes = new Set([...pf_a, ...pf_b]);
    let gcf = 1, lcm = 1;
    for (const p of allPrimes) {
      const ca = pf_a.filter((f) => f === p).length;
      const cb = pf_b.filter((f) => f === p).length;
      gcf *= p ** Math.min(ca, cb);
      lcm *= p ** Math.max(ca, cb);
    }
    return { a, b, pf_a, pf_b, gcf, lcm };
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [treeA, setTreeA] = useState([]);
  const [treeB, setTreeB] = useState([]);
  const [phase, setPhase] = useState('factor-a');
  const [gcfGuess, setGcfGuess] = useState('');
  const [lcmGuess, setLcmGuess] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setTreeA([{ value: problem.a, children: null }]);
    setTreeB([{ value: problem.b, children: null }]);
    setPhase('factor-a');
    setGcfGuess('');
    setLcmGuess('');
    setChecked(false);
  }, [problem]);

  const splitNode = useCallback((tree, setTree, nodeIdx) => {
    const node = tree[nodeIdx];
    if (!node || isPrime(node.value) || node.children) return;
    const pairs = getFactorPairs(node.value);
    if (pairs.length === 0) return;
    const [a, b] = pairs[0];
    const newTree = [...tree];
    const leftIdx = newTree.length;
    const rightIdx = newTree.length + 1;
    newTree[nodeIdx] = { ...node, children: [leftIdx, rightIdx] };
    newTree.push({ value: a, children: null });
    newTree.push({ value: b, children: null });
    setTree(newTree);
  }, []);

  const isTreeDone = (tree) => tree.every((n) => isPrime(n.value) || n.children != null);
  const getLeaves = (tree) => tree.filter((n) => n.children == null).map((n) => n.value).sort((a, b) => a - b);

  const treeDoneA = isTreeDone(treeA);
  const treeDoneB = isTreeDone(treeB);

  useEffect(() => {
    if (phase === 'factor-a' && treeDoneA && treeA.length > 1) setPhase('factor-b');
    if (phase === 'factor-b' && treeDoneB && treeB.length > 1) setPhase('gcf-lcm');
  }, [phase, treeDoneA, treeDoneB, treeA.length, treeB.length]);

  const handleCheck = () => {
    setChecked(true);
  };

  const gcfCorrect = parseInt(gcfGuess, 10) === problem.gcf;
  const lcmCorrect = parseInt(lcmGuess, 10) === problem.lcm;
  const allCorrect = checked && gcfCorrect && lcmCorrect;
  const completedSteps = (treeDoneA ? 1 : 0) + (treeDoneB ? 1 : 0) + (allCorrect ? 1 : 0);

  const renderTree = (tree, setTree, label, targetNum) => {
    const levels = [];
    const assignLevel = (idx, level) => {
      if (!levels[level]) levels[level] = [];
      levels[level].push(idx);
      const node = tree[idx];
      if (node.children) {
        assignLevel(node.children[0], level + 1);
        assignLevel(node.children[1], level + 1);
      }
    };
    if (tree.length > 0) assignLevel(0, 0);

    return (
      <div style={{ marginBottom: 12 }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
          Factor tree for <span style={{ color: COLOR.blue, fontSize: 16 }}>{targetNum}</span>
        </p>
        <div style={{ background: '#f8fafc', borderRadius: 12, border: `1px solid ${COLOR.border}`, padding: 12, minHeight: 60 }}>
          {levels.map((levelNodes, lvl) => (
            <div key={lvl} style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
              {levelNodes.map((idx) => {
                const node = tree[idx];
                const prime = isPrime(node.value);
                const canSplit = !prime && !node.children;
                return (
                  <button key={idx} type="button"
                    onClick={() => canSplit && splitNode(tree, setTree, idx)}
                    style={{
                      padding: '6px 14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                      background: prime ? COLOR.greenLight : node.children ? '#f3f4f6' : COLOR.blueBg,
                      border: `2px solid ${prime ? COLOR.greenBorder : node.children ? COLOR.border : COLOR.blueBorder}`,
                      color: prime ? COLOR.green : node.children ? COLOR.textSecondary : COLOR.blue,
                      cursor: canSplit ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                    }}>
                    {node.value} {prime && '\u2713'}
                  </button>
                );
              })}
            </div>
          ))}
          {tree.length === 1 && !isPrime(tree[0].value) && (
            <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, textAlign: 'center' }}>
              Click the number to split it into factors
            </p>
          )}
          {isTreeDone(tree) && tree.length > 1 && (
            <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: COLOR.green, textAlign: 'center' }}>
              Prime factorization: {getLeaves(tree).join(' \u00D7 ')}
            </p>
          )}
        </div>
      </div>
    );
  };

  const getQBotMsg = () => {
    if (phase === 'factor-a') return { msg: `Click ${problem.a} to split it into two factors. Keep splitting until every number is prime!`, mood: 'wave' };
    if (phase === 'factor-b') return { msg: `Now factor ${problem.b} the same way and record only prime leaves in the tree.`, mood: 'encourage' };
    if (!checked) return { msg: `Now use the prime factorizations to find the GCF (greatest common factor) and LCM (least common multiple) of ${problem.a} and ${problem.b}.`, mood: 'think' };
    if (allCorrect) return { msg: 'Excellent! GCF uses the lowest power of each shared prime, and LCM uses the highest power of every prime.', mood: 'celebrate' };
    return { msg: 'Not correct yet. Rebuild from prime powers: GCF uses shared primes with minimum exponents; LCM uses all primes with maximum exponents.', mood: 'think' };
  };

  const qbot = getQBotMsg();

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Prime Factorization Lab
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Factor both numbers, then find their GCF and LCM.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Build factor trees for {problem.a} and {problem.b}, then find their GCF and LCM.
      </p>
      <div style={{ margin: '0 0 10px', padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLOR.border}`, background: '#f8fafc' }}>
        <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary }}>
          <strong>How to use:</strong> Click a composite number to split it. When both trees are prime-only, enter GCF/LCM and press Check.
        </p>
      </div>
      <div style={{ margin: '0 0 12px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Step progress: {completedSteps}/3
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Stage: {phase === 'factor-a' ? 'Factor A' : phase === 'factor-b' ? 'Factor B' : 'Solve GCF/LCM'}
        </span>
      </div>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      {renderTree(treeA, setTreeA, 'A', problem.a)}
      {(phase === 'factor-b' || phase === 'gcf-lcm') && renderTree(treeB, setTreeB, 'B', problem.b)}

      {phase === 'gcf-lcm' && (
        <div style={{ background: '#faf5ff', borderRadius: 14, border: '1px solid #ddd6fe', padding: '14px 16px', marginBottom: 12 }}>
          <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#4c1d95' }}>
            Find GCF and LCM of {problem.a} and {problem.b}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLOR.text }}>GCF =</label>
              <input type="number" value={gcfGuess} onChange={(e) => setGcfGuess(e.target.value)}
                disabled={allCorrect}
                style={{ marginLeft: 6, width: 60, padding: '6px 8px', borderRadius: 8, border: `2px solid ${checked ? (gcfCorrect ? COLOR.greenBorder : '#fca5a5') : COLOR.border}`, fontSize: 14, fontWeight: 700, textAlign: 'center', background: checked ? (gcfCorrect ? COLOR.greenLight : '#fef2f2') : '#fff' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: COLOR.text }}>LCM =</label>
              <input type="number" value={lcmGuess} onChange={(e) => setLcmGuess(e.target.value)}
                disabled={allCorrect}
                style={{ marginLeft: 6, width: 60, padding: '6px 8px', borderRadius: 8, border: `2px solid ${checked ? (lcmCorrect ? COLOR.greenBorder : '#fca5a5') : COLOR.border}`, fontSize: 14, fontWeight: 700, textAlign: 'center', background: checked ? (lcmCorrect ? COLOR.greenLight : '#fef2f2') : '#fff' }} />
            </div>
          </div>
          {checked && !allCorrect && (
            <p style={{ margin: 0, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
              {!gcfCorrect && `GCF should be ${problem.gcf}. `}
              {!lcmCorrect && `LCM should be ${problem.lcm}.`}
            </p>
          )}
          {allCorrect && (
            <p aria-live="polite" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLOR.green }}>
              {'\u2713'} Both values are correct with valid prime-factor reasoning.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {phase === 'gcf-lcm' && !allCorrect && (
          <button type="button" onClick={handleCheck} disabled={!gcfGuess || !lcmGuess}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto', opacity: gcfGuess && lcmGuess ? 1 : 0.4 }}>
            Check
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Problem
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
      <style>{`@keyframes fadeIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main export — rotates mode by activityIndex
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['number-line', 'complex-plane', 'prime-blast', 'factor-lab'];

export default function NumberExplorer({ activityIndex = 0, modeSet = null, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const activeModes = Array.isArray(modeSet) && modeSet.length > 0 ? modeSet : MODES;
  const mode = activeModes[activityIndex % activeModes.length];
  if (mode === 'number-line') return <NumberLinePlot onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'real-number-sets') return <RealNumberSetsExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'real-properties') return <RealNumberPropertiesExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-plane') return <ComplexPlaneExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-arithmetic') return <ComplexArithmeticExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-equations') return <ComplexEquationsExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'prime-blast') return <PrimeNumberBlast onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <FactorLab onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
