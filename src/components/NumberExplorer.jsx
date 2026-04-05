/**
 * NumberExplorer — Interactive activities for Domain I: Number Concepts.
 *
 * Modes (rotated by activityIndex from CompetencyActivity `modeSet` per standard):
 *   c001: number-line, real-number-sets, real-properties, commutativity explorer
 *   c002: slot A/C rotate geometry/fractal/card-sort + arithmetic + equations; slot B real-number-sets.
 *   c003: prime-blast, real-number-sets, factor-lab, gcd-lcm (repeating pattern in modeSet)
 *   Fallback MODES: number-line, complex-plane, complex-geometry, prime-blast, factor-lab
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';
import { sanitizeHtml } from '../utils/sanitize';
import ComplexPlaneExplorer from './ComplexPlaneExplorer';
import ComplexPlaneGeometryExplorer from './ComplexPlaneGeometryExplorer';
import CommutativityExplorer from './CommutativityExplorer';
import GcdLcmExplorer from './GcdLcmExplorer';
import ComplexFractalExplorer from './ComplexFractalExplorer';
import ComplexCardSortExplorer from './ComplexCardSortExplorer';
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
  { label: '100', zone: 'N', explain: '100 is a counting number, so it belongs in ℕ.' },
  { label: '2', zone: 'N', explain: '2 is a natural number in this activity (ℕ = 1, 2, 3, …).' },
  { label: '−101', zone: 'Z', explain: 'Negative integers live in ℤ; they are not whole numbers.' },
  { label: '−1/3', zone: 'Q', explain: 'A ratio of two integers (non-integer) is rational — in ℚ.' },
  { label: '1/2', zone: 'Q', explain: 'A fraction that is not an integer sits in ℚ.' },
  { label: '√2', zone: 'R', explain: '√2 is irrational: real, but not a ratio of two integers.' },
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

function renderChipLabelHtml(label) {
  return sanitizeHtml(label.replace(/\.\\overline\{([^}]+)\}/g, '<span style="text-decoration:overline">$1</span>'));
}

/** Ellipse model in SVG viewBox coords (outer Q → inner N). Hit-test innermost first. */
const REAL_NEST_ELLIPSES = [
  { id: 'Q', cx: 175, cy: 178, rx: 178, ry: 132 },
  { id: 'Z', cx: 175, cy: 178, rx: 128, ry: 98 },
  { id: 'W', cx: 175, cy: 178, rx: 84, ry: 64 },
  { id: 'N', cx: 175, cy: 178, rx: 44, ry: 34 },
];

/** ViewBox fits nested ℚ ovals + labels only (legend lives in HTML below). */
const REAL_NEST_SVG_VIEW_W = 368;
const REAL_NEST_SVG_VIEW_H = 360;

function clientPointInRect(clientX, clientY, rect) {
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function nestEllipseContains(px, py, cx, cy, rx, ry) {
  if (rx < 1e-6 || ry < 1e-6) return false;
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1.0002;
}

function resolveRationalZoneFromNestSvg(svgEl, clientX, clientY) {
  if (!svgEl || typeof svgEl.createSVGPoint !== 'function') return null;
  const rect = svgEl.getBoundingClientRect();
  if (!clientPointInRect(clientX, clientY, rect)) return null;
  let pt;
  try {
    const svgPt = svgEl.createSVGPoint();
    svgPt.x = clientX;
    svgPt.y = clientY;
    const ctm = svgEl.getScreenCTM();
    if (!ctm) return null;
    pt = svgPt.matrixTransform(ctm.inverse());
  } catch (_) {
    return null;
  }
  for (let i = REAL_NEST_ELLIPSES.length - 1; i >= 0; i--) {
    const ell = REAL_NEST_ELLIPSES[i];
    if (nestEllipseContains(pt.x, pt.y, ell.cx, ell.cy, ell.rx, ell.ry)) return ell.id;
  }
  return null;
}

/** Chips assigned to nested rational zones; pen/touch/mouse use pointer capture + ellipse hit-test. */
function RealNumberSetsExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);
  const items = useMemo(() => shuffleRealSetItems(REAL_SET_ITEMS).slice(0, 8), [round]);
  const [assignments, setAssignments] = useState({});
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [checked, setChecked] = useState(false);
  const boardRef = useRef(null);
  const nestSvgRef = useRef(null);
  const irrPanelRef = useRef(null);
  const dragRef = useRef({ label: null, x0: 0, y0: 0, moved: false });
  const lastGhostRef = useRef({ x: 0, y: 0 });
  const capturePointerIdRef = useRef(null);
  const suppressBankClickRef = useRef(false);
  const [dragGhost, setDragGhost] = useState(null);

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

  const assignToZone = useCallback((zoneId, label) => {
    if (!label || checked) return;
    setAssignments((prev) => ({ ...prev, [label]: zoneId }));
    setSelectedLabel(null);
  }, [checked]);

  const assignFromTap = (zoneId) => {
    if (!selectedLabel || checked) return;
    assignToZone(zoneId, selectedLabel);
  };

  const resolveDropZone = useCallback((clientX, clientY) => {
    const irrEl = irrPanelRef.current;
    if (irrEl) {
      const r = irrEl.getBoundingClientRect();
      if (clientPointInRect(clientX, clientY, r)) return 'R';
    }
    const root = boardRef.current;
    if (!root) return null;
    const svgHit = resolveRationalZoneFromNestSvg(nestSvgRef.current, clientX, clientY);
    if (svgHit) return svgHit;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el || !root.contains(el)) return null;
    const irr = el.closest('[data-real-nest="irrational"]');
    if (irr) return 'R';
    const hit = el.closest('[data-real-nest]');
    if (!hit) return null;
    const id = hit.getAttribute('data-real-nest');
    if (id === 'irrational' || id === 'nested-root') return null;
    return id;
  }, []);

  useEffect(() => {
    if (!dragGhost?.label) return undefined;
    let ended = false;
    const pid = capturePointerIdRef.current;
    const runEnd = (ev) => {
      if (ended) return;
      if (pid != null && ev.pointerId !== pid) return;
      ended = true;
      const label = dragRef.current.label;
      const moved = dragRef.current.moved;
      dragRef.current = { label: null, x0: 0, y0: 0, moved: false };
      capturePointerIdRef.current = null;
      setDragGhost(null);
      if (moved) suppressBankClickRef.current = true;
      let x = ev.clientX;
      let y = ev.clientY;
      if (x == null || y == null || Number.isNaN(x) || Number.isNaN(y)) {
        x = lastGhostRef.current.x;
        y = lastGhostRef.current.y;
      }
      if (!label || checked) return;
      if (moved && x != null && y != null) {
        const z = resolveDropZone(x, y);
        if (z) assignToZone(z, label);
      }
    };
    const onMove = (e) => {
      if (pid != null && e.pointerId !== pid) return;
      if (e.cancelable) e.preventDefault();
      const x = e.clientX;
      const y = e.clientY;
      if (x == null || y == null) return;
      lastGhostRef.current = { x, y };
      setDragGhost((g) => (g ? { ...g, x, y } : null));
      const dx = x - dragRef.current.x0;
      const dy = y - dragRef.current.y0;
      if (Math.hypot(dx, dy) > 10) dragRef.current.moved = true;
    };
    window.addEventListener('pointermove', onMove, { passive: false, capture: true });
    window.addEventListener('pointerup', runEnd, { capture: true });
    window.addEventListener('pointercancel', runEnd, { capture: true });
    window.addEventListener('lostpointercapture', runEnd, { capture: true });
    return () => {
      ended = true;
      window.removeEventListener('pointermove', onMove, { capture: true });
      window.removeEventListener('pointerup', runEnd, { capture: true });
      window.removeEventListener('pointercancel', runEnd, { capture: true });
      window.removeEventListener('lostpointercapture', runEnd, { capture: true });
    };
  }, [dragGhost?.label, checked, resolveDropZone, assignToZone]);

  const startDragChip = useCallback((e, label) => {
    if (checked || assignments[label] != null) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget;
    capturePointerIdRef.current = e.pointerId;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) { /* some embedded browsers */ }
    const x = e.clientX ?? 0;
    const y = e.clientY ?? 0;
    lastGhostRef.current = { x, y };
    dragRef.current = { label, x0: x, y0: y, moved: false };
    setDragGhost({ label, x, y });
  }, [checked, assignments]);

  const zoneById = useMemo(() => Object.fromEntries(REAL_SET_ZONES.map((z) => [z.id, z])), []);

  const renderPlacedChip = (it) => {
    const zoneMeta = zoneById[assignments[it.label]];
    const wrong = checked && assignments[it.label] !== it.zone;
    const right = checked && assignments[it.label] === it.zone;
    return (
      <button
        key={`placed-${it.label}`}
        type="button"
        disabled={checked}
        onClick={(ev) => {
          ev.stopPropagation();
          if (!checked) setSelectedLabel((s) => (s === it.label ? null : it.label));
        }}
        style={{
          padding: '4px 8px',
          borderRadius: 8,
          fontWeight: 800,
          fontSize: 12,
          border: `2px solid ${right ? COLOR.greenBorder : wrong ? '#fca5a5' : selectedLabel === it.label ? COLOR.blue : zoneMeta?.border || COLOR.border}`,
          background: right ? COLOR.greenLight : wrong ? '#fef2f2' : selectedLabel === it.label ? COLOR.blueBg : '#fff',
          color: wrong ? '#b91c1c' : COLOR.text,
          cursor: checked ? 'default' : 'pointer',
          lineHeight: 1.2,
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: renderChipLabelHtml(it.label) }} />
        {right ? ' ✓' : ''}{wrong ? ' ✗' : ''}
      </button>
    );
  };

  const qbot = !checked
    ? { msg: '**Drag** each number onto the **labeled ovals** (ℕ, ℤ, ℚ) or the **Irrational** zone. Pick the **smallest** set that fits — or tap a chip, then tap a region.', mood: 'wave' }
    : allCorrect
      ? { msg: 'Nice! Each value is in its tightest set: ℕ ⊂ 𝕎 ⊂ ℤ ⊂ ℚ, and irrationals fill the other half of ℝ (ℝ = ℚ ∪ irrationals).', mood: 'celebrate' }
      : { msg: `You have ${correctCount}/${items.length} correct. Read the hints and try Check again.`, mood: 'think' };

  const nestZones = REAL_SET_ZONES.filter((z) => z.id !== 'R');
  const irrZone = REAL_SET_ZONES.find((z) => z.id === 'R');

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Place numbers in the real number system
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
        The diagram is a <strong>nested “Venn”</strong> for <strong>rationals only</strong>: <strong>ℕ</strong> is the smallest oval; <strong>𝕎</strong> and <strong>ℤ</strong> are the next rings; the outer <strong>ℚ</strong> oval is all rationals.
        <strong>Irrationals</strong> are real numbers too, but they are <em>not</em> in ℚ — they belong in the <strong>orange region</strong>, which meets ℚ along one edge. There is <strong>no gap</strong> and <strong>nothing “in between”</strong>: every real is either rational or irrational (ℝ = ℚ ∪ (ℝ \ ℚ)).
        Use the <strong>innermost</strong> oval for rationals, or the orange side for irrationals.
      </p>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${COLOR.border}`, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.45 }}>
        <strong>How:</strong> Drag from the bank onto the ovals (rationals) or the orange region (irrationals), or tap a chip then tap a region. ℕ = 1, 2, 3, …; 𝕎 adds 0; ℤ adds negatives; ℚ adds non-integer rationals; orange = ℝ \ ℚ (e.g. √2, π).
      </div>

      <div
        ref={boardRef}
        style={{
          marginBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'stretch',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <div
          style={{
            borderRadius: 18,
            border: '3px solid #94a3b8',
            background: 'linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 8%,#f8fafc 100%)',
            padding: '12px 14px 14px',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)',
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: 4, letterSpacing: '0.02em' }}>
            ℝ Real numbers
          </div>
          <p style={{ margin: '0 0 6px', fontSize: 12, color: COLOR.textSecondary, textAlign: 'center', lineHeight: 1.45 }}>
            Left: nested rationals (ℚ and its subsets). Right: irrationals. They <strong>touch</strong> along the vertical divider — that line is not a third set; it is just the boundary between the two parts of ℝ.
          </p>
          <p style={{ margin: '0 0 10px', fontSize: 11, color: '#64748b', textAlign: 'center', lineHeight: 1.45, fontStyle: 'italic' }}>
            <strong>Illustration only — not to scale.</strong> The areas do not show how many numbers are in each set. In fact there are infinitely many rationals and <em>uncountably</em> many irrationals (far more than rationals); this picture is only to show how the sets nest and partition ℝ.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0,
              alignItems: 'stretch',
              justifyContent: 'center',
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
            }}
          >
        {/* Concentric ℚ ⊃ ℤ ⊃ 𝕎 ⊃ ℕ — SVG ovals (sketch-style) + HTML targets for chips */}
        <div
          data-real-nest="nested-root"
          role="presentation"
          onClick={(e) => {
            if (checked) return;
            const t = e.target.closest('[data-real-nest]');
            const id = t?.getAttribute('data-real-nest');
            if (!id || id === 'nested-root' || id === 'irrational') return;
            assignFromTap(id);
          }}
          style={{
            flex: '1 1 280px',
            maxWidth: 520,
            position: 'relative',
            padding: 12,
            borderRadius: 0,
            background: 'linear-gradient(160deg,#faf5ff 0%,#ede9fe 100%)',
            border: 'none',
            borderRight: '3px solid #64748b',
            cursor: selectedLabel && !checked ? 'pointer' : 'default',
            minHeight: 340,
            boxSizing: 'border-box',
          }}
        >
          <svg
            ref={nestSvgRef}
            viewBox={`0 0 ${REAL_NEST_SVG_VIEW_W} ${REAL_NEST_SVG_VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: 'absolute',
              left: 8,
              right: 8,
              top: 40,
              height: 'calc(100% - 48px)',
              width: 'calc(100% - 16px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            aria-hidden
          >
            <defs>
              <linearGradient id="rn-q" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5f3ff" />
                <stop offset="100%" stopColor="#ede9fe" />
              </linearGradient>
              <linearGradient id="rn-z" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#eff6ff" />
                <stop offset="100%" stopColor="#dbeafe" />
              </linearGradient>
              <linearGradient id="rn-w" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f0fdfa" />
                <stop offset="100%" stopColor="#ccfbf1" />
              </linearGradient>
              <linearGradient id="rn-n" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="100%" stopColor="#bbf7d0" />
              </linearGradient>
              <filter id="rn-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.12" />
              </filter>
            </defs>
            {REAL_NEST_ELLIPSES.map((ell) => (
              <ellipse
                key={ell.id}
                cx={ell.cx}
                cy={ell.cy}
                rx={ell.rx}
                ry={ell.ry}
                fill={
                  ell.id === 'Q' ? 'url(#rn-q)'
                    : ell.id === 'Z' ? 'url(#rn-z)'
                      : ell.id === 'W' ? 'url(#rn-w)'
                        : 'url(#rn-n)'
                }
                stroke={ell.id === 'Q' ? '#a78bfa' : ell.id === 'Z' ? '#60a5fa' : ell.id === 'W' ? '#2dd4bf' : '#4ade80'}
                strokeWidth={ell.id === 'N' ? 2.5 : 2}
                opacity={ell.id === 'Q' ? 0.95 : 0.92}
                filter="url(#rn-soft-shadow)"
              />
            ))}
            {/* Large on-diagram set labels (annular regions); x matches REAL_NEST_ELLIPSES cx */}
            <text x="175" y="52" textAnchor="middle" fontSize="15" fontWeight="800" fill="#5b21b6">ℚ Rational numbers</text>
            <text x="175" y="70" textAnchor="middle" fontSize="10" fontWeight="600" fill="#6d28d9">(fractions, terminating / repeating decimals)</text>
            <text x="175" y="100" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1d4ed8">ℤ Integers</text>
            <text x="175" y="116" textAnchor="middle" fontSize="9" fontWeight="600" fill="#2563eb">…, −2, −1, 0, 1, 2, …</text>
            <text x="175" y="142" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0f766e">𝕎 Whole numbers</text>
            <text x="175" y="156" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0d9488">0, 1, 2, 3, …</text>
            <text x="175" y="182" textAnchor="middle" fontSize="14" fontWeight="800" fill="#166534">ℕ Natural numbers</text>
            <text x="175" y="198" textAnchor="middle" fontSize="9" fontWeight="600" fill="#15803d">1, 2, 3, … (counting)</text>
          </svg>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, fontWeight: 800, color: '#6b21a8', textAlign: 'center', marginBottom: 8, letterSpacing: '0.04em' }}>
            Nested sets on the diagram — drop on the matching oval
          </div>
          {(() => {
            let inner = (
              <div
                data-real-nest="N"
                style={{
                  minHeight: 52,
                  minWidth: 72,
                  padding: 8,
                  borderRadius: '50%',
                  border: '2px solid transparent',
                  background: 'transparent',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  alignContent: 'flex-start',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  margin: '0 auto',
                  maxWidth: '42%',
                  touchAction: 'none',
                }}
              >
                <div style={{ width: '100%', fontSize: 9, fontWeight: 800, color: zoneById.N.accent, marginBottom: 2, textAlign: 'center' }}>
                  {zoneById.N.short} natural
                </div>
                {items.filter((it) => assignments[it.label] === 'N').map(renderPlacedChip)}
              </div>
            );
            const wrapOrder = ['W', 'Z', 'Q'];
            for (const zid of wrapOrder) {
              const z = zoneById[zid];
              const padPct = zid === 'Q' ? '10%' : zid === 'Z' ? '8%' : '7%';
              inner = (
                <div
                  key={zid}
                  data-real-nest={zid}
                  style={{
                    padding: padPct,
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    background: 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: zid === 'Q' ? 260 : undefined,
                    width: '100%',
                    boxSizing: 'border-box',
                    touchAction: 'none',
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 800, color: z.accent, marginBottom: 4, lineHeight: 1.3, textAlign: 'center', maxWidth: 200 }}>
                    {z.short} {z.title}
                  </div>
                  {inner}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 }}>
                    {items.filter((it) => assignments[it.label] === zid).map(renderPlacedChip)}
                  </div>
                </div>
              );
            }
            return inner;
          })()}
        </div>

        {/* Irrationals — sibling to ℚ, not inside it */}
        {irrZone && (
          <div
            ref={irrPanelRef}
            data-real-nest="irrational"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && selectedLabel && !checked) {
                e.preventDefault();
                assignFromTap('R');
              }
            }}
            onClick={() => assignFromTap('R')}
            style={{
              flex: '1 1 220px',
              maxWidth: 340,
              minHeight: 340,
              padding: 14,
              borderRadius: 0,
              borderTop: `2px dashed ${irrZone.border}`,
              borderRight: `2px dashed ${irrZone.border}`,
              borderBottom: `2px dashed ${irrZone.border}`,
              borderLeft: 'none',
              background: irrZone.bg,
              cursor: selectedLabel && !checked ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              touchAction: 'none',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: irrZone.accent, marginBottom: 6 }}>
              ℝ \ ℚ — {irrZone.title}
            </div>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: COLOR.textSecondary, lineHeight: 1.4 }}>
              Same ℝ as the left side: irrationals meet rationals only on this shared edge — there is no “space” of other reals between the two kinds.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1, alignContent: 'flex-start' }}>
              {items.filter((it) => assignments[it.label] === 'R').map(renderPlacedChip)}
            </div>
          </div>
        )}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 14px',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 12,
              paddingTop: 10,
              borderTop: '1px solid #e2e8f0',
              fontSize: 11,
              color: '#64748b',
            }}
          >
            <span><span style={{ color: '#15803d', fontWeight: 900 }} aria-hidden>●</span> ℕ natural</span>
            <span><span style={{ color: '#0d9488', fontWeight: 900 }} aria-hidden>●</span> 𝕎 whole</span>
            <span><span style={{ color: '#2563eb', fontWeight: 900 }} aria-hidden>●</span> ℤ integer</span>
            <span><span style={{ color: '#7c3aed', fontWeight: 900 }} aria-hidden>●</span> ℚ rational</span>
            <span style={{ color: '#c2410c', fontWeight: 700 }}>Orange region = ℝ \ ℚ (irrational)</span>
          </div>
        </div>
      </div>

      {dragGhost?.label && (
        <div
          style={{
            position: 'fixed',
            left: dragGhost.x,
            top: dragGhost.y,
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            pointerEvents: 'none',
            padding: '8px 12px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 14,
            border: `2px solid ${COLOR.blue}`,
            background: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: renderChipLabelHtml(dragGhost.label) }} />
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.text, marginBottom: 8 }}>Number bank — drag into a set, or tap then tap a region:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14, touchAction: 'none', msTouchAction: 'none' }}>
        {items.map((it) => {
          const placed = assignments[it.label] != null;
          const wrong = checked && placed && assignments[it.label] !== it.zone;
          const right = checked && placed && assignments[it.label] === it.zone;
          if (placed && !checked) return null;
          return (
            <button
              key={`${round}-${it.label}`}
              type="button"
              disabled={checked}
              onClick={() => {
                if (checked) return;
                if (suppressBankClickRef.current) {
                  suppressBankClickRef.current = false;
                  return;
                }
                setSelectedLabel((s) => (s === it.label ? null : it.label));
              }}
              onPointerDown={(e) => startDragChip(e, it.label)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                fontWeight: 800,
                fontSize: 14,
                touchAction: 'none',
                msTouchAction: 'none',
                border: `2px solid ${
                  right ? COLOR.greenBorder : wrong ? '#fca5a5' : selectedLabel === it.label ? COLOR.blue : COLOR.border
                }`,
                background: right ? COLOR.greenLight : wrong ? '#fef2f2' : selectedLabel === it.label ? COLOR.blueBg : '#fff',
                color: wrong ? '#b91c1c' : COLOR.text,
                cursor: checked ? 'default' : 'grab',
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: renderChipLabelHtml(it.label) }} />
              {right ? ' ✓' : ''}{wrong ? ' ✗' : ''}
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

/** lab: which manipulative row to show before naming the property */
const PROPERTY_ITEMS = [
  { id: 'p1', text: 'a + b = b + a', answer: 'commutative', hint: 'Order of terms swapped; sum unchanged.', lab: 'swapAdd' },
  { id: 'p2', text: '(a + b) + c = a + (b + c)', answer: 'associative', hint: 'Grouping of addition changes, not order of numbers.', lab: 'parenAdd' },
  { id: 'p3', text: 'a(b + c) = ab + ac', answer: 'distributive', hint: 'Multiplication spreads across a sum.', lab: 'distribute' },
  { id: 'p4', text: 'a + (−a) = 0', answer: 'identity', hint: 'Additive inverse pairs with addition to give the additive identity 0.', lab: 'inverseAdd' },
  { id: 'p5', text: 'x · 1 = x', answer: 'identity', hint: 'Multiplying by 1 leaves x unchanged (multiplicative identity).', lab: 'swapMul' },
  { id: 'p6', text: '(xy)z = x(yz)', answer: 'associative', hint: 'Grouping of multiplication changes.', lab: 'parenMul' },
];

const BLOCK = {
  a: { label: 'a', color: '#2563eb' },
  b: { label: 'b', color: '#059669' },
  c: { label: 'c', color: '#d97706' },
  x: { label: 'x', color: '#7c3aed' },
  one: { label: '1', color: '#64748b' },
  na: { label: '−a', color: '#dc2626' },
};

function PropBlock({ spec, selected, dim, onTap, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onTap?.()}
      style={{
        minWidth: 48,
        minHeight: 48,
        padding: '0 12px',
        borderRadius: 12,
        fontWeight: 800,
        fontSize: 17,
        fontFamily: 'Georgia, "Times New Roman", serif',
        border: `3px solid ${selected ? COLOR.blue : spec.color}`,
        background: selected ? COLOR.blueBg : `${spec.color}18`,
        color: '#111827',
        cursor: disabled ? 'default' : 'pointer',
        touchAction: 'manipulation',
        boxShadow: selected ? `0 0 0 2px ${COLOR.blue}` : '0 2px 0 rgba(0,0,0,0.06)',
        opacity: dim ? 0.45 : 1,
        lineHeight: 1,
      }}
    >
      {spec.label}
    </button>
  );
}

/** Swap two addends / factors around a fixed operator (+ or ·) */
function LabSwapCommute({ op, leftKey, rightKey, disabled, onExplored }) {
  const [order, setOrder] = useState([leftKey, rightKey]);
  const [sel, setSel] = useState(null);
  const L = BLOCK[order[0]];
  const R = BLOCK[order[1]];
  const swapped = order[0] === rightKey;

  useEffect(() => {
    if (swapped) onExplored?.();
  }, [swapped, onExplored]);

  const tap = (side) => {
    if (disabled) return;
    if (sel == null) {
      setSel(side);
      return;
    }
    if (sel === side) {
      setSel(null);
      return;
    }
    setOrder((o) => [o[1], o[0]]);
    setSel(null);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: COLOR.textSecondary }}>
        Tap one block, then the other, to <strong>swap</strong> — the value of the expression stays the same.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 8px', borderRadius: 14, background: '#f8fafc', border: `1px dashed ${COLOR.border}` }}>
        <PropBlock spec={L} selected={sel === 'L'} dim={disabled} disabled={disabled} onTap={() => tap('L')} />
        <span style={{ fontSize: 22, fontWeight: 800, color: COLOR.textSecondary }}>{op}</span>
        <PropBlock spec={R} selected={sel === 'R'} dim={disabled} disabled={disabled} onTap={() => tap('R')} />
        {swapped && !disabled && (
          <span style={{ width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 800, color: COLOR.green, marginTop: 4 }}>
            Same result — only the order on the page changed.
          </span>
        )}
      </div>
    </div>
  );
}

/** Move parentheses between (a+b)+c and a+(b+c) — or × version */
function LabParenGroup({ times, disabled, onExplored }) {
  const [groupFirst, setGroupFirst] = useState(true);

  const op = times ? (
    <span style={{ fontSize: 20, fontWeight: 800, color: COLOR.textSecondary }}>·</span>
  ) : (
    <span style={{ fontSize: 20, fontWeight: 800, color: COLOR.textSecondary }}>+</span>
  );

  const row = (firstPair) => {
    const A = BLOCK.a;
    const B = BLOCK.b;
    const C = BLOCK.c;
    const wrap = (inner) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 10, border: `3px solid ${COLOR.purple}`, background: COLOR.purpleBg }}>
        {inner}
      </span>
    );
    if (firstPair) {
      return (
        <>
          {wrap(
            <>
              <PropBlock spec={A} dim disabled />
              {op}
              <PropBlock spec={B} dim disabled />
            </>,
          )}
          {op}
          <PropBlock spec={C} dim disabled />
        </>
      );
    }
    return (
      <>
        <PropBlock spec={A} dim disabled />
        {op}
        {wrap(
          <>
            <PropBlock spec={B} dim disabled />
            {op}
            <PropBlock spec={C} dim disabled />
          </>,
        )}
      </>
    );
  };

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: COLOR.textSecondary }}>
        Use the control to move <strong>which pair is grouped first</strong> — the three values stay in the same order.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '12px 8px', borderRadius: 14, background: '#f8fafc', border: `1px dashed ${COLOR.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {row(groupFirst)}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setGroupFirst((g) => !g);
            onExplored?.();
          }}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 12,
            border: `2px solid ${COLOR.purple}`,
            background: '#fff',
            color: COLOR.purple,
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          {groupFirst ? 'Group the second pair instead' : 'Group the first pair instead'}
        </button>
      </div>
    </div>
  );
}

/** Drag a onto (b+c) to “split” into ab + ac */
function LabDistribute({ disabled, onExplored }) {
  const [expanded, setExpanded] = useState(false);
  const zoneRef = useRef(null);
  const draggingA = useRef(false);

  useEffect(() => {
    if (expanded) onExplored?.();
  }, [expanded, onExplored]);

  useEffect(() => {
    if (expanded || disabled) return undefined;
    const onUp = (e) => {
      if (!draggingA.current) return;
      draggingA.current = false;
      const z = zoneRef.current;
      if (!z) return;
      const r = z.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) setExpanded(true);
    };
    const onCancel = () => { draggingA.current = false; };
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [expanded, disabled]);

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: COLOR.textSecondary }}>
        <strong>Drag</strong> the <em>a</em> block onto the sum (b + c) to multiply through — distributive step.
      </p>
      <div style={{ padding: '12px 8px', borderRadius: 14, background: '#f8fafc', border: `1px dashed ${COLOR.border}` }}>
        {!expanded ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div
              onPointerDown={(e) => {
                if (disabled) return;
                draggingA.current = true;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch (_) { /* ignore */ }
              }}
              style={{ cursor: disabled ? 'default' : 'grab', touchAction: 'none' }}
            >
              <PropBlock spec={BLOCK.a} dim={disabled} disabled={disabled} />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800 }}>·</span>
            <div
              ref={zoneRef}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 12,
                border: `3px dashed ${COLOR.amber}`,
                background: COLOR.amberBg,
                minHeight: 52,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 800 }}>(</span>
              <PropBlock spec={BLOCK.b} dim disabled />
              <span style={{ fontSize: 22, fontWeight: 800 }}>+</span>
              <PropBlock spec={BLOCK.c} dim disabled />
              <span style={{ fontSize: 18, fontWeight: 800 }}>)</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <PropBlock spec={{ label: 'ab', color: BLOCK.a.color }} dim disabled />
            <span style={{ fontSize: 22, fontWeight: 800 }}>+</span>
            <PropBlock spec={{ label: 'ac', color: BLOCK.a.color }} dim disabled />
            <span style={{ width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 800, color: COLOR.green, marginTop: 6 }}>
              a·b + a·c — same as a(b + c)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Merge a + (−a) into 0 */
function LabInverseAdd({ disabled, onExplored }) {
  const [merged, setMerged] = useState(false);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    if (merged) onExplored?.();
  }, [merged, onExplored]);

  const tap = (which) => {
    if (disabled || merged) return;
    if (sel == null) {
      setSel(which);
      return;
    }
    if (sel === which) {
      setSel(null);
      return;
    }
    if ((sel === 'a' && which === 'na') || (sel === 'na' && which === 'a')) setMerged(true);
    setSel(null);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: COLOR.textSecondary }}>
        Tap <strong>a</strong>, then <strong>−a</strong> (or the reverse) to show they <strong>cancel</strong> to zero.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', padding: '12px 8px', borderRadius: 14, background: '#f8fafc', border: `1px dashed ${COLOR.border}` }}>
        {!merged ? (
          <>
            <PropBlock spec={BLOCK.a} selected={sel === 'a'} dim={disabled} disabled={disabled} onTap={() => tap('a')} />
            <span style={{ fontSize: 22, fontWeight: 800, color: COLOR.textSecondary }}>+</span>
            <PropBlock spec={BLOCK.na} selected={sel === 'na'} dim={disabled} disabled={disabled} onTap={() => tap('na')} />
          </>
        ) : (
          <PropBlock spec={{ label: '0', color: '#64748b' }} dim={disabled} disabled />
        )}
        {merged && !disabled && (
          <span style={{ width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 800, color: COLOR.green, marginTop: 4 }}>
            Additive inverse — sum is the additive identity 0.
          </span>
        )}
      </div>
    </div>
  );
}

function PropertyManipulativeLab({ item, disabled, onExplored }) {
  const noop = useCallback(() => {}, []);
  const ex = onExplored || noop;
  switch (item.lab) {
    case 'swapAdd':
      return <LabSwapCommute op="+" leftKey="a" rightKey="b" disabled={disabled} onExplored={ex} />;
    case 'swapMul':
      return <LabSwapCommute op="·" leftKey="x" rightKey="one" disabled={disabled} onExplored={ex} />;
    case 'parenAdd':
      return <LabParenGroup times={false} disabled={disabled} onExplored={ex} />;
    case 'parenMul':
      return <LabParenGroup times disabled={disabled} onExplored={ex} />;
    case 'distribute':
      return <LabDistribute disabled={disabled} onExplored={ex} />;
    case 'inverseAdd':
      return <LabInverseAdd disabled={disabled} onExplored={ex} />;
    default:
      return null;
  }
}

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
  const [labDone, setLabDone] = useState({});

  useEffect(() => {
    setPicked({});
    setChecked(false);
    setLabDone({});
  }, [round]);

  const markLab = useCallback((id) => {
    setLabDone((d) => (d[id] ? d : { ...d, [id]: true }));
  }, []);

  const allPicked = batch.every((it) => picked[it.id]);
  const allLabs = batch.every((it) => labDone[it.id]);
  const canCheck = allPicked && allLabs;
  const nCorrect = checked ? batch.filter((it) => picked[it.id] === it.answer).length : 0;
  const allRight = checked && nCorrect === batch.length;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Properties of the real numbers
      </p>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5 }}>
        Use the <strong>blocks</strong> on each card, then name the property: commutativity, associativity, distributive, or identity / inverse.
      </p>
      <QBotBubble
        message={
          !checked
            ? 'Move the pieces first — then match what you noticed to the formal property name.'
            : allRight
              ? 'Strong! You connected the physical rearrangement to the algebraic rule.'
              : 'Use each hint — focus on whether order, grouping, or spreading multiplication changed.'
        }
        mood={!checked ? 'wave' : allRight ? 'celebrate' : 'think'}
      />
      {batch.map((it) => (
        <div key={it.id} style={{ marginBottom: 14, padding: '12px 12px', borderRadius: 14, border: `1px solid ${COLOR.border}`, background: '#fafafa' }}>
          <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 800, color: COLOR.text }}>{it.text}</p>
          {!labDone[it.id] && !checked && (
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: COLOR.amber }}>Try the lab below — then pick a property.</p>
          )}
          {labDone[it.id] && !checked && (
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: COLOR.green }}>Lab explored — now classify.</p>
          )}
          <PropertyManipulativeLab item={it} disabled={checked} onExplored={() => markLab(it.id)} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {Object.entries(PROPERTY_LABELS).map(([key, label]) => {
              const sel = picked[it.id] === key;
              const show = checked;
              const ok = show && key === it.answer;
              const bad = show && sel && key !== it.answer;
              const lock = !labDone[it.id] && !checked;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={checked || lock}
                  onClick={() => !checked && !lock && setPicked((p) => ({ ...p, [it.id]: key }))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    border: `2px solid ${ok ? COLOR.greenBorder : bad ? '#fca5a5' : sel ? COLOR.blue : COLOR.border}`,
                    background: ok ? COLOR.greenLight : bad ? '#fef2f2' : sel ? COLOR.blueBg : lock ? '#f3f4f6' : '#fff',
                    color: bad ? '#b91c1c' : lock ? COLOR.textMuted : COLOR.text,
                    cursor: checked || lock ? 'default' : 'pointer',
                    opacity: lock ? 0.65 : 1,
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
          <button type="button" disabled={!canCheck} onClick={() => setChecked(true)} style={{ ...BTN_PRIMARY, opacity: canCheck ? 1 : 0.45 }}>
            Check
          </button>
        )}
        {checked && !allRight && (
          <button
            type="button"
            onClick={() => {
              setPicked({});
              setChecked(false);
              setLabDone({});
            }}
            style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)' }}
          >
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
   Main export — mode from modeOverride, else activitySlot % modeSet (loop tiles A/B/C).
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['number-line', 'complex-plane', 'prime-blast', 'factor-lab'];

export default function NumberExplorer({
  activityIndex = 0,
  activitySlot = null,
  modeOverride = null,
  modeSet = null,
  onComplete,
  continueLabel = 'Continue',
  badgeLabel = 'Interactive activity',
  embedded = false,
}) {
  const activeModes = Array.isArray(modeSet) && modeSet.length > 0 ? modeSet : MODES;
  const mode = (() => {
    if (modeOverride) return modeOverride;
    const idx = activitySlot != null ? activitySlot : activityIndex % activeModes.length;
    return activeModes[idx % activeModes.length];
  })();
  if (mode === 'number-line') return <NumberLinePlot onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'real-number-sets') return <RealNumberSetsExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'real-properties') return <RealNumberPropertiesExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'commutativity') return <CommutativityExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'gcd-lcm') return <GcdLcmExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-plane') return <ComplexPlaneExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-geometry') return <ComplexPlaneGeometryExplorer activityIndex={activityIndex} onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-fractal') return <ComplexFractalExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-card-sort') return <ComplexCardSortExplorer activityIndex={activityIndex} onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-arithmetic') return <ComplexArithmeticExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'complex-equations') return <ComplexEquationsExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'prime-blast') return <PrimeNumberBlast onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <FactorLab onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
