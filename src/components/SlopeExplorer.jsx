/**
 * SlopeExplorer — Interactive slope manipulative: drag the line to match the given slope.
 *
 * Correctness is computed reactively from React state so the Continue button
 * activates instantly when the slope matches. A faded target line is shown
 * to guide the user visually.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE } from '../utils/loopStyles';

const W = 320;
const H = 280;
const PAD = 40;
const SCALE = 24;

function toScreen(x, y) {
  return { x: W / 2 + x * SCALE, y: H / 2 - y * SCALE };
}
function toMath(sx, sy) {
  return { x: (sx - W / 2) / SCALE, y: (H / 2 - sy) / SCALE };
}
function within(v, lo, hi, eps = 1e-6) {
  return v >= lo - eps && v <= hi + eps;
}
function uniquePoints(pts, eps = 1e-5) {
  const out = [];
  for (const p of pts) {
    if (!out.some((q) => Math.abs(q.x - p.x) < eps && Math.abs(q.y - p.y) < eps)) out.push(p);
  }
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
function getRandomSlope() { return SLOPES[Math.floor(Math.random() * SLOPES.length)]; }

function initState(mode = 'slope') {
  const correctSlope = getRandomSlope();
  const yIntercept = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 5) - 2;
  const interceptOffset = (Math.random() < 0.5 ? 1.5 : -1.5) + (Math.random() - 0.5);
  let startIntercept = (mode === 'intercept' || mode === 'both')
    ? Math.max(-5, Math.min(5, yIntercept + interceptOffset))
    : yIntercept;
  startIntercept = Math.round(startIntercept * 10) / 10;
  const m = correctSlope;
  let x;
  if (Math.abs(m) < 0.1) { x = 3; }
  else {
    const xA = (5 - startIntercept) / m, xB = (-5 - startIntercept) / m;
    x = Math.max(1, Math.min(4, (Math.max(-5, Math.min(xA, xB)) + Math.min(5, Math.max(xA, xB))) / 2));
    x = Math.round(x * 10) / 10;
  }
  const correctY = m * x + startIntercept;
  const wrongOff = (Math.random() < 0.5 ? 1.5 : -1.5) + (Math.random() - 0.5);
  let y = Math.max(-5, Math.min(5, correctY + wrongOff));
  y = Math.round(y * 10) / 10;
  return { correctSlope, yIntercept, startIntercept, secondPoint: { x, y } };
}

function formatSlope(m) {
  if (Number.isInteger(m)) return String(m);
  const fracs = { 0.5: '1/2', '-0.5': '-1/2', 1.5: '3/2', '-1.5': '-3/2', 2.5: '5/2', '-2.5': '-5/2' };
  return fracs[String(m)] || String(m);
}

const TOLERANCE = 0.5;

export default function SlopeExplorer({ onComplete, continueLabel = 'Continue', mode = 'slope', badgeLabel = 'Interactive activity', embedded = false }) {
  const [state, setState] = useState(() => initState(mode));
  const { correctSlope, yIntercept, startIntercept } = state;
  const [dragPoint, setDragPoint] = useState(null);
  const [currentIntercept, setCurrentIntercept] = useState(startIntercept);
  const [secondPoint, setSecondPoint] = useState(state.secondPoint);
  const [hasDragged, setHasDragged] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const svgRef = useRef(null);
  const spRef = useRef(secondPoint);
  const ciRef = useRef(currentIntercept);
  spRef.current = secondPoint;
  ciRef.current = currentIntercept;

  useEffect(() => {
    const next = initState(mode);
    setState(next);
    setCurrentIntercept(next.startIntercept);
    setSecondPoint(next.secondPoint);
    setHasDragged(false);
    setDragPoint(null);
    setShowHint(false);
  }, [mode]);

  // Show hint after 8 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 8000);
    return () => clearTimeout(t);
  }, [state]);

  /* ── Reactive correctness ── */
  const curSlope = Math.abs(secondPoint.x) > 0.15
    ? (secondPoint.y - currentIntercept) / secondPoint.x
    : null;
  const slopeOk = curSlope !== null && Math.abs(curSlope - correctSlope) < TOLERANCE;
  const interceptOk = Math.abs(currentIntercept - yIntercept) < TOLERANCE;
  const isCorrect = mode === 'intercept' ? interceptOk : mode === 'both' ? slopeOk && interceptOk : slopeOk;
  const canContinue = isCorrect && !dragPoint;
  const slopeDisplay = curSlope === null ? 'undefined' : formatSlope(Math.round(curSlope * 100) / 100);

  /* ── Pointer handling ── */
  const getCoords = useCallback((e) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX;
    const cy = e.clientY ?? e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY;
    if (cx == null || cy == null) return null;
    return toMath(cx - rect.left, cy - rect.top);
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const m = getCoords(e);
    if (!m) return;
    const dSecond = Math.hypot(m.x - spRef.current.x, m.y - spRef.current.y);
    const dIntercept = Math.hypot(m.x, m.y - ciRef.current);
    if (dSecond < 2.5) {
      setDragPoint('second');
      try { if (e.pointerId != null) e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    } else if ((mode === 'intercept' || mode === 'both') && (dIntercept < 2.5 || Math.abs(m.x) < 0.8)) {
      // Allow users to grab anywhere near the y-axis in intercept modes.
      setDragPoint('intercept');
      const rounded = Math.round(Math.max(-5, Math.min(5, m.y)) * 10) / 10;
      setCurrentIntercept(rounded);
      ciRef.current = rounded;
      try { if (e.pointerId != null) e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    }
  }, [getCoords, mode]);

  useEffect(() => {
    if (!dragPoint) return;
    const onMove = (e) => {
      e.preventDefault();
      const m = getCoords(e);
      if (!m) return;
      if (dragPoint === 'intercept') {
        const rounded = Math.round(Math.max(-5, Math.min(5, m.y)) * 10) / 10;
        setCurrentIntercept(rounded);
        ciRef.current = rounded;
      } else {
        const pt = { x: m.x, y: m.y };
        setSecondPoint(pt);
        spRef.current = pt;
      }
    };
    const onUp = (e) => {
      e?.preventDefault?.();
      setDragPoint(null);
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
  }, [dragPoint, getCoords]);

  /* ── Grid ── */
  const gridLines = [];
  for (let i = -6; i <= 6; i++) {
    const o = toScreen(i, 0), u = toScreen(0, i);
    gridLines.push(
      <line key={`v${i}`} x1={o.x} y1={PAD} x2={o.x} y2={H - PAD} stroke="#334155" strokeWidth={i === 0 ? 1.5 : 0.5} opacity={i === 0 ? 1 : 0.4} />,
      <line key={`h${i}`} x1={PAD} y1={u.y} x2={W - PAD} y2={u.y} stroke="#334155" strokeWidth={i === 0 ? 1.5 : 0.5} opacity={i === 0 ? 1 : 0.4} />,
    );
  }

  /* ── Target line (faded green, shows correct answer) ── */
  const targetPt2 = { x: secondPoint.x || 3, y: correctSlope * (secondPoint.x || 3) + yIntercept };
  const targetClipped = getLineEndpointsInBounds({ x: 0, y: yIntercept }, targetPt2);
  const targetA = targetClipped ? toScreen(targetClipped[0].x, targetClipped[0].y) : toScreen(0, yIntercept);
  const targetB = targetClipped ? toScreen(targetClipped[1].x, targetClipped[1].y) : toScreen(targetPt2.x, targetPt2.y);

  /* ── User line ── */
  const p1 = toScreen(0, currentIntercept);
  const p2 = toScreen(secondPoint.x, secondPoint.y);
  const clipped = getLineEndpointsInBounds({ x: 0, y: currentIntercept }, secondPoint);
  const lineA = clipped ? toScreen(clipped[0].x, clipped[0].y) : p1;
  const lineB = clipped ? toScreen(clipped[1].x, clipped[1].y) : p2;

  /* ── Feedback ── */
  let feedbackMsg = null;
  if (canContinue) {
    feedbackMsg = <span style={{ color: '#15803d' }}>✓ Correct! Click Continue below.</span>;
  } else if (hasDragged && !dragPoint) {
    feedbackMsg = mode === 'intercept'
      ? <span style={{ color: '#b91c1c' }}>Keep adjusting — move the green dot to y-intercept {yIntercept}.</span>
      : mode === 'both'
        ? <span style={{ color: '#b91c1c' }}>Keep adjusting — match slope {formatSlope(correctSlope)} and y-intercept {yIntercept}.</span>
        : <span style={{ color: '#b91c1c' }}>Keep adjusting — drag the blue dot until slope matches {formatSlope(correctSlope)}.</span>;
  }

  return (
    <div style={{ ...(embedded ? {} : CARD), userSelect: 'none', WebkitUserSelect: 'none' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100%{r:10;opacity:0.6} 50%{r:18;opacity:0.2} }
        .drag-hint { animation: pulse-dot 1.5s ease-in-out infinite; }
      `}</style>

      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 8px', fontSize: 15, color: COLOR.text, fontWeight: 700 }}>
        {mode === 'intercept'
          ? <>Drag the <strong style={{ color: COLOR.green }}>green point</strong> until y-intercept = <strong>{yIntercept}</strong>.</>
          : mode === 'both'
            ? <>Drag both points: slope = <strong>{formatSlope(correctSlope)}</strong>, y-intercept = <strong>{yIntercept}</strong>.</>
            : <>Drag the <strong style={{ color: COLOR.blue }}>blue point</strong> until the slope matches <strong>{formatSlope(correctSlope)}</strong>.</>}
      </p>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: COLOR.textSecondary }}>
        Click and hold the dot, then drag it up or down. The dashed green line shows the target.
      </p>

      <div style={{ marginBottom: 8, padding: '8px 14px', borderRadius: 10, border: isCorrect ? `2px solid ${COLOR.successBorder}` : `1px solid ${COLOR.border}`, background: isCorrect ? COLOR.successBg : COLOR.bg, transition: 'all 0.3s' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: isCorrect ? COLOR.successText : COLOR.textSecondary }}>
          {mode === 'intercept' && <>Your y-intercept: <strong>{Math.round(currentIntercept * 100) / 100}</strong> · Target: <strong>{yIntercept}</strong></>}
          {mode === 'slope' && <>Your slope: <strong>{slopeDisplay}</strong> · Target: <strong>{formatSlope(correctSlope)}</strong></>}
          {mode === 'both' && <>Slope: <strong>{slopeDisplay}</strong> (target {formatSlope(correctSlope)}) · y-int: <strong>{Math.round(currentIntercept * 100) / 100}</strong> (target {yIntercept})</>}
          {isCorrect && ' \u2713'}
        </span>
      </div>

      <svg ref={svgRef} width={W} height={H}
        style={{ display: 'block', margin: '0 auto 16px', background: COLOR.bg, borderRadius: 12, border: `1px solid ${COLOR.border}`, cursor: dragPoint ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown} onMouseDown={handlePointerDown}
      >
        {gridLines}
        <line x1={targetA.x} y1={targetA.y} x2={targetB.x} y2={targetB.y}
          stroke="#22c55e" strokeWidth={2} strokeDasharray="8 6" opacity={isCorrect ? 0 : 0.5} />
        <line x1={lineA.x} y1={lineA.y} x2={lineB.x} y2={lineB.y}
          stroke={isCorrect ? '#22c55e' : '#2563eb'} strokeWidth={3} strokeLinecap="round" />
        <circle cx={p1.x} cy={p1.y} r={6} fill="#22c55e" stroke="#15803d" strokeWidth={2} />
        {(mode === 'intercept' || mode === 'both') && <circle cx={p1.x} cy={p1.y} r={24} fill="transparent" style={{ cursor: 'ns-resize' }} />}
        {!hasDragged && <circle className="drag-hint" cx={p2.x} cy={p2.y} r={10} fill="#2563eb" opacity={0.4} />}
        <circle cx={p2.x} cy={p2.y} r={10} fill="#2563eb" stroke="#1d4ed8" strokeWidth={2} style={{ cursor: 'grab' }} />
        <circle cx={p2.x} cy={p2.y} r={28} fill="transparent" style={{ cursor: 'grab' }} />
      </svg>

      {feedbackMsg && <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700 }}>{feedbackMsg}</p>}

      {showHint && !hasDragged && (
        <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.purple, fontWeight: 600, background: COLOR.purpleBg, borderRadius: 8, padding: '8px 12px' }}>
          Hint: Click and hold the blue dot, then drag it up or down. Match the dashed green line.
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
