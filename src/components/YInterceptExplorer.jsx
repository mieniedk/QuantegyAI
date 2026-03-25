/**
 * YInterceptExplorer — drag a marker on the y-axis to identify the y-intercept of a given line.
 *
 * Shows a faded target marker and pulsing drag hint for better UX.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE } from '../utils/loopStyles';

const W = 320;
const H = 280;
const PAD = 40;
const SCALE = 24;

function toScreen(x, y) { return { x: W / 2 + x * SCALE, y: H / 2 - y * SCALE }; }
function toMath(sx, sy) { return { x: (sx - W / 2) / SCALE, y: (H / 2 - sy) / SCALE }; }
function within(v, lo, hi, eps = 1e-6) { return v >= lo - eps && v <= hi + eps; }
function uniquePoints(pts, eps = 1e-5) {
  const out = [];
  for (const p of pts) { if (!out.some((q) => Math.abs(q.x - p.x) < eps && Math.abs(q.y - p.y) < eps)) out.push(p); }
  return out;
}
function getLineEndpointsInBounds(a, b) {
  const xMin = (PAD - W / 2) / SCALE, xMax = (W - PAD - W / 2) / SCALE;
  const yMax = (H / 2 - PAD) / SCALE, yMin = (H / 2 - (H - PAD)) / SCALE;
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;
  const cands = [];
  if (Math.abs(dx) > 1e-9) {
    const tL = (xMin - a.x) / dx, yL = a.y + tL * dy;
    if (within(yL, yMin, yMax)) cands.push({ x: xMin, y: yL });
    const tR = (xMax - a.x) / dx, yR = a.y + tR * dy;
    if (within(yR, yMin, yMax)) cands.push({ x: xMax, y: yR });
  }
  if (Math.abs(dy) > 1e-9) {
    const tB = (yMin - a.y) / dy, xB = a.x + tB * dx;
    if (within(xB, xMin, xMax)) cands.push({ x: xB, y: yMin });
    const tT = (yMax - a.y) / dy, xT = a.x + tT * dx;
    if (within(xT, xMin, xMax)) cands.push({ x: xT, y: yMax });
  }
  const u = uniquePoints(cands);
  if (u.length < 2) return null;
  let best = [u[0], u[1]], bestD = -1;
  for (let i = 0; i < u.length; i++)
    for (let j = i + 1; j < u.length; j++) {
      const d = Math.hypot(u[i].x - u[j].x, u[i].y - u[j].y);
      if (d > bestD) { bestD = d; best = [u[i], u[j]]; }
    }
  return best;
}

const SLOPES = [-3, -2.5, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 2.5, 3];
function initState() {
  const slope = SLOPES[Math.floor(Math.random() * SLOPES.length)];
  const intercept = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 5) - 2;
  const x2 = 4;
  const y2 = Math.max(-5, Math.min(5, slope * x2 + intercept));
  return { slope, intercept, pointA: { x: 0, y: intercept }, pointB: { x: x2, y: y2 } };
}

const TOLERANCE = 0.5;

export default function YInterceptExplorer({ onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const [state, setState] = useState(initState);
  const [guessIntercept, setGuessIntercept] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const svgRef = useRef(null);
  const guessRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 8000);
    return () => clearTimeout(t);
  }, [state]);

  const isCorrect = Math.abs(guessIntercept - state.intercept) < TOLERANCE;
  const canContinue = isCorrect && !dragging;

  const getCoords = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY;
    if (cx == null || cy == null) return null;
    return toMath(cx - rect.left, cy - rect.top);
  }, []);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const m = getCoords(e);
    if (!m) return;
    if (Math.hypot(m.x, m.y - guessRef.current) < 2.5 || Math.abs(m.x) < 0.8) {
      // Make drag start easier: users can grab near the y-axis, not just the center pixel.
      const rounded = Math.round(Math.max(-5, Math.min(5, m.y)) * 10) / 10;
      setGuessIntercept(rounded);
      guessRef.current = rounded;
      setDragging(true);
      try { if (e.pointerId != null) e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }, [getCoords]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      e.preventDefault();
      const m = getCoords(e);
      if (!m) return;
      const rounded = Math.round(Math.max(-5, Math.min(5, m.y)) * 10) / 10;
      setGuessIntercept(rounded);
      guessRef.current = rounded;
    };
    const onUp = (e) => {
      e?.preventDefault?.();
      setDragging(false);
      setHasDragged(true);
    };
    window.addEventListener('pointermove', onMove, { capture: true, passive: false });
    window.addEventListener('pointerup', onUp, { capture: true, passive: false });
    window.addEventListener('pointercancel', onUp, { capture: true, passive: false });
    window.addEventListener('mousemove', onMove, { capture: true, passive: false });
    window.addEventListener('mouseup', onUp, { capture: true, passive: false });
    return () => {
      window.removeEventListener('pointermove', onMove, { capture: true });
      window.removeEventListener('pointerup', onUp, { capture: true });
      window.removeEventListener('pointercancel', onUp, { capture: true });
      window.removeEventListener('mousemove', onMove, { capture: true });
      window.removeEventListener('mouseup', onUp, { capture: true });
    };
  }, [dragging, getCoords]);

  const gridLines = [];
  for (let i = -6; i <= 6; i++) {
    const o = toScreen(i, 0), u = toScreen(0, i);
    gridLines.push(
      <line key={`v${i}`} x1={o.x} y1={PAD} x2={o.x} y2={H - PAD} stroke="#334155" strokeWidth={i === 0 ? 1.5 : 0.5} opacity={i === 0 ? 1 : 0.4} />,
      <line key={`h${i}`} x1={PAD} y1={u.y} x2={W - PAD} y2={u.y} stroke="#334155" strokeWidth={i === 0 ? 1.5 : 0.5} opacity={i === 0 ? 1 : 0.4} />,
    );
  }
  const clipped = getLineEndpointsInBounds(state.pointA, state.pointB);
  const lineA = clipped ? toScreen(clipped[0].x, clipped[0].y) : toScreen(state.pointA.x, state.pointA.y);
  const lineB = clipped ? toScreen(clipped[1].x, clipped[1].y) : toScreen(state.pointB.x, state.pointB.y);
  const guessPoint = toScreen(0, guessIntercept);
  const actualIntPoint = toScreen(0, state.intercept);

  let feedbackMsg = null;
  if (canContinue) {
    feedbackMsg = <span style={{ color: '#15803d' }}>✓ Correct! Click Continue below.</span>;
  } else if (hasDragged && !dragging && !isCorrect) {
    feedbackMsg = <span style={{ color: '#b91c1c' }}>Keep adjusting — drag the green dot to where the blue line crosses the y-axis.</span>;
  }

  return (
    <div style={{ ...(embedded ? {} : CARD), userSelect: 'none', WebkitUserSelect: 'none' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{r:10;opacity:0.6} 50%{r:18;opacity:0.2} }
        .drag-hint { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      {!embedded && (
      <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 8px', fontSize: 15, color: COLOR.text, fontWeight: 700 }}>
        Drag the <strong style={{ color: COLOR.green }}>green marker</strong> on the y-axis to where the blue line crosses it.
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: COLOR.textSecondary }}>
        Click and hold the green dot, then slide it up or down along the y-axis.
      </p>

      <div style={{ marginBottom: 8, padding: '8px 14px', borderRadius: 10, border: isCorrect ? `2px solid ${COLOR.successBorder}` : `1px solid ${COLOR.border}`, background: isCorrect ? COLOR.successBg : COLOR.bg, transition: 'all 0.3s' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? COLOR.successText : COLOR.textSecondary }}>
          Your guess: <strong>{Math.round(guessIntercept * 100) / 100}</strong>
          {isCorrect && ' \u2713 Correct!'}
        </span>
      </div>

      <svg ref={svgRef} width={W} height={H}
        style={{ display: 'block', margin: '0 auto 16px', background: COLOR.bg, borderRadius: 12, border: `1px solid ${COLOR.border}`, cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={onPointerDown} onMouseDown={onPointerDown}
      >
        {gridLines}
        <line x1={lineA.x} y1={lineA.y} x2={lineB.x} y2={lineB.y} stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
        {!isCorrect && <circle cx={actualIntPoint.x} cy={actualIntPoint.y} r={6} fill="#2563eb" opacity={0.25} />}
        {!hasDragged && <circle className="drag-hint" cx={guessPoint.x} cy={guessPoint.y} r={10} fill="#22c55e" opacity={0.4} />}
        <circle cx={guessPoint.x} cy={guessPoint.y} r={10} fill="#22c55e" stroke="#15803d" strokeWidth={2} style={{ cursor: 'ns-resize' }} />
        <circle cx={guessPoint.x} cy={guessPoint.y} r={28} fill="transparent" style={{ cursor: 'ns-resize' }} />
      </svg>

      {feedbackMsg && <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>{feedbackMsg}</p>}

      {showHint && !hasDragged && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.purple, fontWeight: 600, background: COLOR.purpleBg, borderRadius: 8, padding: '8px 12px' }}>
          Hint: Click and hold the green dot, then drag it to where the blue line touches the y-axis.
        </p>
      )}

      <button type="button" onClick={onComplete}
        style={BTN_PRIMARY}
      >
        {continueLabel}
      </button>
    </div>
  );
}
