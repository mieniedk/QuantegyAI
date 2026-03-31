/**
 * GeoExplorer — Interactive activities for Domain III: Geometry and Measurement.
 *
 * Modes (rotated by activityIndex):
 *   0  "transform-lab"    Apply translations, rotations, reflections to shapes on a grid.
 *   1  "angle-explorer"   Drag rays to form angles; identify angle relationships.
 *   2  "area-builder"     Drag polygon vertices; see area and perimeter update live.
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

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 0 — Transform Lab
   A triangle on a coordinate grid. Apply translate, rotate, or reflect
   to match a target position shown as a dashed outline.
   ═══════════════════════════════════════════════════════════════════════════ */

function applyTransform(pts, type, param) {
  if (type === 'translate') return pts.map(([x, y]) => [x + param.dx, y + param.dy]);
  if (type === 'reflect-x') return pts.map(([x, y]) => [x, -y]);
  if (type === 'reflect-y') return pts.map(([x, y]) => [-x, y]);
  if (type === 'rotate-90') return pts.map(([x, y]) => [-y, x]);
  if (type === 'rotate-180') return pts.map(([x, y]) => [-x, -y]);
  return pts;
}

const TRANSFORM_RULES = {
  translate: { name: 'Translation', rule: (p) => `(x, y) → (x + ${p.dx}, y + ${p.dy})` },
  'reflect-x': { name: 'Reflection about the x-axis', rule: () => '(x, y) → (x, −y)' },
  'reflect-y': { name: 'Reflection about the y-axis', rule: () => '(x, y) → (−x, y)' },
  'rotate-90': { name: 'Rotation 90° counterclockwise about the origin', rule: () => '(x, y) → (−y, x)' },
  'rotate-180': { name: 'Rotation 180° about the origin', rule: () => '(x, y) → (−x, −y)' },
};

function TransformLab({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const [compactLayout, setCompactLayout] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 720 : true));

  const problem = useMemo(() => {
    const shapes = [
      [[1, 1], [3, 1], [2, 3]],
      [[1, 1], [4, 1], [4, 3]],
      [[-1, 1], [-3, 1], [-2, 3]],
      [[0, 0], [2, 0], [2, 2], [0, 2]],
    ];
    const transforms = [
      { type: 'translate', param: { dx: rand(-4, 4) || 2, dy: rand(-4, 4) || 1 }, label: 'Translate' },
      { type: 'reflect-x', param: {}, label: 'Reflect about the x-axis' },
      { type: 'reflect-y', param: {}, label: 'Reflect about the y-axis' },
      { type: 'rotate-90', param: {}, label: 'Rotate 90° CCW' },
      { type: 'rotate-180', param: {}, label: 'Rotate 180°' },
    ];
    const shape = shapes[rand(0, shapes.length - 1)];
    const transform = transforms[rand(0, transforms.length - 1)];
    const target = applyTransform(shape, transform.type, transform.param);
    return { original: shape, target, transform };
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selected, setSelected] = useState(null);
  const [applied, setApplied] = useState(null);
  const [checked, setChecked] = useState(false);
  const [dx, setDx] = useState(0);
  const [dy, setDy] = useState(0);

  // Reset local UI when the random problem changes (roundIdx).
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional full reset on new problem
  useEffect(() => { setSelected(null); setApplied(null); setChecked(false); setDx(0); setDy(0); }, [roundIdx]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setCompactLayout(window.innerWidth < 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const options = ['translate', 'reflect-x', 'reflect-y', 'rotate-90', 'rotate-180'];
  const optionLabels = { translate: 'Translate', 'reflect-x': 'Reflect about the x-axis', 'reflect-y': 'Reflect about the y-axis', 'rotate-90': 'Rotate 90°', 'rotate-180': 'Rotate 180°' };

  const W = 340;
  const H_SVG = 260;
  const PAD = 24;
  const GRID = 9;
  const cellW = (W - 2 * PAD) / (2 * GRID);
  const svgRef = useRef(null);
  const dragTranslateRef = useRef(null);

  const clientToGrid = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const xPx = (clientX - rect.left) * (W / rect.width);
    const yPx = (clientY - rect.top) * (H_SVG / rect.height);
    const gx = Math.round((xPx - PAD) / cellW - GRID);
    const gy = Math.round((H_SVG - PAD - yPx) / cellW - GRID);
    return [clamp(gx, -GRID, GRID), clamp(gy, -GRID, GRID)];
  }, [W, H_SVG, PAD, cellW, GRID]);

  const currentTransformed = useMemo(() => {
    if (!selected) return problem.original;
    const param = selected === 'translate' ? { dx, dy } : {};
    return applyTransform(problem.original, selected, param);
  }, [selected, dx, dy, problem.original]);

  const transformReadout = useMemo(() => {
    if (!selected) {
      return {
        headline: 'No transformation yet',
        sub: 'Pick a type below—or drag the purple outline on the grid to slide the shape (translation).',
        rule: null,
      };
    }
    const meta = TRANSFORM_RULES[selected];
    const param = selected === 'translate' ? { dx, dy } : {};
    return {
      headline: meta.name,
      sub: selected === 'translate' && dx === 0 && dy === 0
        ? 'Slide the shape on the grid or use the sliders to set a nonzero shift.'
        : selected === 'translate'
          ? `Every vertex moves by the same amount: ${dx} horizontally, ${dy} vertically.`
          : 'Each vertex maps by the rule below (about the origin).',
      rule: meta.rule(param),
    };
  }, [selected, dx, dy]);

  const beginTranslateDrag = useCallback((e) => {
    if (checked) return;
    if (selected && selected !== 'translate') return;
    e.preventDefault();
    const cx = e.clientX ?? e.nativeEvent?.clientX;
    const cy = e.clientY ?? e.nativeEvent?.clientY;
    if (cx == null || cy == null) return;
    setSelected('translate');
    const g = clientToGrid(cx, cy);
    const startDx = selected === 'translate' ? dx : 0;
    const startDy = selected === 'translate' ? dy : 0;
    dragTranslateRef.current = {
      pointerId: e.pointerId,
      startGx: g[0],
      startGy: g[1],
      startDx,
      startDy,
      captureEl: e.currentTarget,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  }, [checked, selected, clientToGrid, dx, dy]);

  const onTranslatePointerMove = useCallback((e) => {
    const d = dragTranslateRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const g = clientToGrid(e.clientX, e.clientY);
    const ndx = clamp(d.startDx + (g[0] - d.startGx), -GRID, GRID);
    const ndy = clamp(d.startDy + (g[1] - d.startGy), -GRID, GRID);
    setDx(ndx);
    setDy(ndy);
  }, [clientToGrid, GRID]);

  const endTranslateDrag = useCallback((e) => {
    const d = dragTranslateRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragTranslateRef.current = null;
    try { d.captureEl.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  }, []);

  const handleCheck = () => {
    setChecked(true);
    setApplied(currentTransformed);
  };

  const ptsMatch = (a, b) => {
    if (a.length !== b.length) return false;
    const sortA = [...a].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const sortB = [...b].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    return sortA.every((p, i) => Math.abs(p[0] - sortB[i][0]) < 0.5 && Math.abs(p[1] - sortB[i][1]) < 0.5);
  };

  const isCorrect = checked && ptsMatch(currentTransformed, problem.target);

  const sx = (v) => PAD + (v + GRID) * cellW;
  const sy = (v) => H_SVG - PAD - (v + GRID) * cellW;

  const polyPath = (pts) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x)},${sy(y)}`).join('') + 'Z';

  const controlsPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <QBotBubble
        message={isCorrect ? 'Correct transformation sequence — the image matches the target exactly.' : checked && !isCorrect ? 'Not quite. Recheck orientation (flip/rotate) then position (translate).' : 'Compare orientation first (flip/rotate), then position (translate).'}
        mood={isCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />

      <div
        role="status"
        aria-live="polite"
        style={{ padding: '8px 10px', borderRadius: 10, background: '#faf5ff', border: '1px solid #ddd6fe', fontSize: 12, color: '#4c1d95', lineHeight: 1.4 }}
      >
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c3aed', marginBottom: 2 }}>Current transformation</div>
        <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>{transformReadout.headline}</div>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.92 }}>{transformReadout.sub}</div>
        {transformReadout.rule && (
          <div style={{ marginTop: 6, fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, background: '#fff', padding: '4px 8px', borderRadius: 6, border: '1px solid #e9d5ff' }}>
            Rule: {transformReadout.rule}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => { setSelected(opt); setChecked(false); }}
            style={{
              padding: '7px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 34,
              background: selected === opt ? COLOR.blueBg : '#fff',
              border: `2px solid ${selected === opt ? COLOR.blueBorder : COLOR.border}`,
              color: selected === opt ? COLOR.blue : COLOR.textSecondary, flex: '1 1 100%',
            }}>
            {optionLabels[opt]}
          </button>
        ))}
      </div>

      {selected === 'translate' && (
        <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLOR.text, minWidth: 22 }}>dx:</span>
            <input type="range" min={-GRID} max={GRID} step={1} value={dx} onChange={(e) => setDx(parseInt(e.target.value, 10))} aria-label="Translate x amount" style={{ flex: 1, accentColor: COLOR.blue }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.blue, minWidth: 18, textAlign: 'right' }}>{dx}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLOR.text, minWidth: 22 }}>dy:</span>
            <input type="range" min={-GRID} max={GRID} step={1} value={dy} onChange={(e) => setDy(parseInt(e.target.value, 10))} aria-label="Translate y amount" style={{ flex: 1, accentColor: COLOR.green }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.green, minWidth: 18, textAlign: 'right' }}>{dy}</span>
          </div>
        </div>
      )}

      {!checked && selected && (
        <button type="button" onClick={handleCheck}
          style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, width: '100%' }}>
          Apply Transformation
        </button>
      )}

      {isCorrect && (
        <div style={{ padding: '8px 10px', borderRadius: 10, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Correct! Shape and orientation match.</p>
        </div>
      )}
      {checked && !isCorrect && (
        <div style={{ padding: '8px 10px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Not a match. Answer: {problem.transform.label}.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '1 1 auto', fontSize: 12, padding: '8px 10px' }}>
          {'\u{1F504}'} New Problem
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto', fontSize: 12, padding: '8px 10px' }}>{continueLabel}</button>
      </div>
    </div>
  );

  const graphPanel = (
    <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 6, touchAction: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H_SVG}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto' }}
      >
        {Array.from({ length: 2 * GRID + 1 }, (_, i) => i - GRID).map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={PAD} x2={sx(v)} y2={H_SVG - PAD} stroke={v === 0 ? '#9ca3af' : '#f3f4f6'} strokeWidth={v === 0 ? 1.5 : 0.5} />
            <line x1={PAD} y1={sy(v)} x2={W - PAD} y2={sy(v)} stroke={v === 0 ? '#9ca3af' : '#f3f4f6'} strokeWidth={v === 0 ? 1.5 : 0.5} />
            {v !== 0 && v % 3 === 0 && <text x={sx(v)} y={sy(0) + 11} fontSize={7} fill="#9ca3af" textAnchor="middle">{v}</text>}
            {v !== 0 && v % 3 === 0 && <text x={sx(0) - 5} y={sy(v) + 3} fontSize={7} fill="#9ca3af" textAnchor="end">{v}</text>}
          </g>
        ))}
        <path d={polyPath(problem.target)} fill="#d9770620" stroke="#d97706" strokeWidth={2} strokeDasharray="5 3" />
        <path d={polyPath(problem.original)} fill={`${COLOR.blue}20`} stroke={COLOR.blue} strokeWidth={2} />
        {selected && selected !== 'translate' && !checked && (
          <path d={polyPath(currentTransformed)} fill="#7c3aed15" stroke={COLOR.purple} strokeWidth={2} strokeDasharray="3 2" />
        )}
        {!checked && (selected === 'translate' || !selected) && (
          <path
            d={polyPath(selected === 'translate' ? currentTransformed : problem.original)}
            fill={selected === 'translate' ? '#7c3aed18' : '#7c3aed10'}
            stroke={COLOR.purple}
            strokeWidth={selected === 'translate' ? 2.5 : 2}
            strokeDasharray={selected === 'translate' ? '3 2' : '6 4'}
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={beginTranslateDrag}
            onPointerMove={onTranslatePointerMove}
            onPointerUp={endTranslateDrag}
            onPointerCancel={endTranslateDrag}
          />
        )}
        {selected === 'translate' && !checked && currentTransformed.map(([x, y], vi) => (
          <circle
            key={`drag-${vi}`}
            cx={sx(x)}
            cy={sy(y)}
            r={11}
            fill={COLOR.purple}
            fillOpacity={0.85}
            stroke="#fff"
            strokeWidth={2}
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={beginTranslateDrag}
            onPointerMove={onTranslatePointerMove}
            onPointerUp={endTranslateDrag}
            onPointerCancel={endTranslateDrag}
          />
        ))}
        {checked && (
          <path d={polyPath(applied || currentTransformed)} fill={isCorrect ? `${COLOR.green}25` : '#ef444425'} stroke={isCorrect ? COLOR.green : '#ef4444'} strokeWidth={2.5} />
        )}
        {problem.original.map(([x, y], i) => (
          <text key={`o${i}`} x={sx(x)} y={sy(y) - 8} fontSize={8} fill={COLOR.blue} fontWeight={700} textAnchor="middle">
            ({x},{y})
          </text>
        ))}
        {problem.target.map(([x, y], i) => (
          <text key={`t${i}`} x={sx(x)} y={sy(y) - 8} fontSize={8} fill="#d97706" fontWeight={600} textAnchor="middle" opacity={0.7}>
            ({x},{y})
          </text>
        ))}
      </svg>
    </div>
  );

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Transform Lab</p>
      <p style={{ margin: '0 0 6px', fontSize: 13, color: COLOR.textSecondary }}>
        Match the <span style={{ color: COLOR.blue, fontWeight: 700 }}>blue shape</span> to the <span style={{ color: '#d97706', fontWeight: 700 }}>dashed target</span>. Drag the <span style={{ color: COLOR.purple, fontWeight: 700 }}>purple outline</span> to translate, or pick a flip/rotation.
      </p>
      <div style={{ margin: '0 0 8px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '3px 10px' }}>
          Stage: {!selected ? 'Drag or pick' : checked ? 'Checked' : 'Previewing'}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? '#047857' : checked ? '#b91c1c' : '#64748b', background: isCorrect ? '#ecfdf5' : checked ? '#fef2f2' : '#f8fafc', border: `1px solid ${isCorrect ? '#86efac' : checked ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 999, padding: '3px 10px' }}>
          Progress: {isCorrect ? 'Matched' : checked ? 'Adjust and retry' : 'In progress'}
        </span>
      </div>

      {compactLayout ? (
        <>
          {graphPanel}
          <div style={{ marginTop: 10 }}>{controlsPanel}</div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 58%', minWidth: 0 }}>{graphPanel}</div>
          <div style={{ flex: '0 0 280px', maxHeight: '70vh', overflowY: 'auto' }}>{controlsPanel}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 1 — Angle Explorer
   Two intersecting lines. Drag ray endpoints to form angles. Tasks ask
   to create specific angle measures or identify angle relationships.
   ═══════════════════════════════════════════════════════════════════════════ */

function AngleExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);

  const targetAngle = useMemo(() => {
    const targets = [30, 45, 60, 90, 120, 135, 150];
    return targets[rand(0, targets.length - 1)];
  }, [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [angle, setAngle] = useState(45);
  const [checked, setChecked] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => { setAngle(45); setChecked(false); }, [roundIdx]);

  const W = 320, H_SVG = 260, CX = 160, CY = 160, R = 100;
  const rad = angle * Math.PI / 180;
  const rayX = CX + R * Math.cos(rad);
  const rayY = CY - R * Math.sin(rad);

  const supplement = 180 - angle;
  const isCorrect = Math.abs(angle - targetAngle) < 3;

  const getAngleFromPointer = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return 45;
    const rect = svg.getBoundingClientRect();
    const touchPoint = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touchPoint ? touchPoint.clientX : e.clientX;
    const clientY = touchPoint ? touchPoint.clientY : e.clientY;
    const x = (clientX - rect.left) * (W / rect.width) - CX;
    const y = CY - (clientY - rect.top) * (H_SVG / rect.height);
    let deg = Math.atan2(y, x) * 180 / Math.PI;
    if (deg < 5) deg = 5;
    if (deg > 175) deg = 175;
    return Math.round(deg);
  }, []);

  const onPointerDown = useCallback((e) => { e.preventDefault(); dragging.current = true; setAngle(getAngleFromPointer(e)); }, [getAngleFromPointer]);
  const onPointerMove = useCallback((e) => { if (!dragging.current) return; e.preventDefault(); setAngle(getAngleFromPointer(e)); }, [getAngleFromPointer]);
  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  const classify = (deg) => {
    if (deg < 90) return 'Acute';
    if (deg === 90) return 'Right';
    if (deg < 180) return 'Obtuse';
    return 'Straight';
  };

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Make an angle of <span style={{ color: COLOR.blue }}>{targetAngle}°</span>
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Set the blue ray to exactly {targetAngle}°.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Drag the ray endpoint to set the angle. The supplementary angle updates automatically.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Difference: {Math.abs(angle - targetAngle)}°
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? '#047857' : '#64748b', background: isCorrect ? '#ecfdf5' : '#f8fafc', border: `1px solid ${isCorrect ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {isCorrect ? 'Target reached' : 'Adjusting'}
        </span>
      </div>

      <QBotBubble
        message={isCorrect && checked ? `Perfect! ${targetAngle}° is a ${classify(targetAngle).toLowerCase()} angle. Its supplement is ${180 - targetAngle}°.` : `Your angle is ${angle}° (${classify(angle)}). Its supplement is ${supplement}°. ${angle + supplement === 180 ? 'Supplementary angles always sum to 180°!' : ''}`}
        mood={isCorrect && checked ? 'celebrate' : 'wave'}
      />
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#fefce8', border: '1px solid #fde68a', fontSize: 12, color: '#854d0e', lineHeight: 1.45 }}>
        <strong>How to use:</strong> move in small steps near the target. Keyboard users can focus the blue endpoint and use left/right arrows.
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 8, marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H_SVG}`} width="100%" style={{ display: 'block' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          {/* horizontal ray (fixed) */}
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="#9ca3af" strokeWidth={2} />
          {/* movable ray */}
          <line x1={CX} y1={CY} x2={rayX} y2={rayY} stroke={COLOR.blue} strokeWidth={2.5} />
          {/* angle arc */}
          {(() => {
            const arcR = 36;
            const endX = CX + arcR * Math.cos(rad);
            const endY = CY - arcR * Math.sin(rad);
            const large = angle > 180 ? 1 : 0;
            return <path d={`M${CX + arcR},${CY} A${arcR},${arcR} 0 ${large} 0 ${endX},${endY}`} fill={`${COLOR.blue}15`} stroke={COLOR.blue} strokeWidth={1.5} />;
          })()}
          {/* supplement arc */}
          {(() => {
            const arcR = 28;
            const endX = CX + arcR * Math.cos(rad);
            const endY = CY - arcR * Math.sin(rad);
            return <path d={`M${CX - arcR},${CY} A${arcR},${arcR} 0 0 0 ${endX},${endY}`} fill="#d9770615" stroke="#d97706" strokeWidth={1} strokeDasharray="3 2" />;
          })()}
          {/* angle label */}
          <text x={CX + 44 * Math.cos(rad / 2)} y={CY - 44 * Math.sin(rad / 2)} fontSize={12} fill={COLOR.blue} fontWeight={800} textAnchor="middle">{angle}°</text>
          <text x={CX - 38 * Math.cos(Math.PI - rad / 2)} y={CY + 38 * Math.sin(Math.PI - rad / 2) - 20} fontSize={10} fill="#d97706" fontWeight={600} textAnchor="middle">{supplement}°</text>
          {/* right angle marker */}
          {Math.abs(angle - 90) < 3 && (
            <rect x={CX + 2} y={CY - 14} width={12} height={12} fill="none" stroke={COLOR.blue} strokeWidth={1.5} />
          )}
          {/* vertex */}
          <circle cx={CX} cy={CY} r={4} fill={COLOR.text} />
          {/* draggable endpoint */}
          <g style={{ cursor: 'grab' }} onMouseDown={onPointerDown} onTouchStart={onPointerDown}
            role="button" tabIndex={0}
            aria-label={`Angle endpoint at ${angle} degrees. Use left and right arrow keys to adjust.`}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') { e.preventDefault(); setAngle((a) => Math.max(5, a - 2)); }
              if (e.key === 'ArrowRight') { e.preventDefault(); setAngle((a) => Math.min(175, a + 2)); }
            }}>
            <circle cx={rayX} cy={rayY} r={16} fill={COLOR.blue} stroke="#fff" strokeWidth={2.5} opacity={0.9} />
          </g>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ padding: '4px 12px', borderRadius: 8, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 13, fontWeight: 700, color: COLOR.blue }}>
          {angle}° — {classify(angle)}
        </div>
        <div style={{ padding: '4px 12px', borderRadius: 8, background: '#fef3c7', border: '1px solid #fde68a', fontSize: 13, fontWeight: 600, color: '#92400e' }}>
          Supplement: {supplement}°
        </div>
        {angle + supplement === 180 && angle > 0 && angle < 180 && (
          <div style={{ padding: '4px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #86efac', fontSize: 12, fontWeight: 600, color: COLOR.green }}>
            {angle}° + {supplement}° = 180° {'\u2713'}
          </div>
        )}
      </div>

      {checked && isCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>✓ You made a {targetAngle}° angle!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={() => setChecked(true)}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Check
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Angle
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Area Builder
   Drag vertices of a polygon on a grid. Area and perimeter update live
   using the Shoelace formula.
   ═══════════════════════════════════════════════════════════════════════════ */

function shoelaceArea(pts) {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return Math.abs(sum) / 2;
}

function perimeter(pts) {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum += Math.sqrt((pts[j][0] - pts[i][0]) ** 2 + (pts[j][1] - pts[i][1]) ** 2);
  }
  return sum;
}

function AreaBuilder({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);

  const targetArea = useMemo(() => rand(6, 15), [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const initVertices = useMemo(() => [
    [1, 1], [4, 1], [4, 3], [1, 3],
  ], [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [vertices, setVertices] = useState(initVertices);
  const [checked, setChecked] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(null);

  useEffect(() => { setVertices(initVertices); setChecked(false); }, [initVertices]);

  const W = 340, H_SVG = 280, PAD = 30;
  const GRID_MAX = 8;
  const cellW = (W - 2 * PAD) / GRID_MAX;
  const sx = (v) => PAD + v * cellW;
  const sy = (v) => H_SVG - PAD - v * cellW;

  const area = roundTo(shoelaceArea(vertices), 1);
  const peri = roundTo(perimeter(vertices), 1);
  const isMatch = Math.abs(area - targetArea) < 0.5;

  const getGridPos = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const rect = svg.getBoundingClientRect();
    const touchPoint = e.touches?.[0] || e.changedTouches?.[0];
    const clientX = touchPoint ? touchPoint.clientX : e.clientX;
    const clientY = touchPoint ? touchPoint.clientY : e.clientY;
    const px = (clientX - rect.left) * (W / rect.width);
    const py = (clientY - rect.top) * (H_SVG / rect.height);
    const gx = clamp(Math.round((px - PAD) / cellW), 0, GRID_MAX);
    const gy = clamp(Math.round((H_SVG - PAD - py) / cellW), 0, GRID_MAX);
    return [gx, gy];
  }, [cellW]);

  const onPointerDown = useCallback((idx, e) => { e.preventDefault(); dragging.current = idx; }, []);
  const onPointerMove = useCallback((e) => {
    if (dragging.current == null) return;
    e.preventDefault();
    const [gx, gy] = getGridPos(e);
    setVertices((prev) => { const n = [...prev]; n[dragging.current] = [gx, gy]; return n; });
  }, [getGridPos]);
  const onPointerUp = useCallback(() => { dragging.current = null; }, []);
  const nudgeVertex = useCallback((idx, dxStep, dyStep) => {
    setVertices((prev) => {
      const next = [...prev];
      const [x, y] = next[idx];
      next[idx] = [clamp(x + dxStep, 0, GRID_MAX), clamp(y + dyStep, 0, GRID_MAX)];
      return next;
    });
  }, [GRID_MAX]);

  const polyPath = vertices.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${sx(x)},${sy(y)}`).join('') + 'Z';

  const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706'];

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Make a shape with area = <span style={{ color: COLOR.blue }}>{targetArea}</span> sq. units
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Move vertices until polygon area matches {targetArea}.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Drag the vertices to reshape the polygon. Area updates in real time using the Shoelace formula.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Difference: {roundTo(Math.abs(area - targetArea), 1)}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isMatch ? '#047857' : '#64748b', background: isMatch ? '#ecfdf5' : '#f8fafc', border: `1px solid ${isMatch ? '#86efac' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {isMatch ? 'Target reached' : 'Adjusting'}
        </span>
      </div>

      <QBotBubble
        message={isMatch && checked ? `You did it! The area is ${area} square units. The Shoelace formula works for any simple polygon \u2014 just from the coordinates!` : `Current area: ${area}. Target: ${targetArea}. The Shoelace formula: A = \u00BD|${'\u03A3'}(x\u1D62y\u1D62\u208A\u2081 \u2212 x\u1D62\u208A\u2081y\u1D62)|. Try moving the vertices!`}
        mood={isMatch && checked ? 'celebrate' : 'wave'}
      />
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 12, color: '#0c4a6e', lineHeight: 1.45 }}>
        <strong>How to use:</strong> move one vertex at a time and watch how area/perimeter change. Focus a vertex and use arrow keys for precise moves.
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 8, marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H_SVG}`} width="100%" style={{ display: 'block' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          {/* grid dots */}
          {Array.from({ length: GRID_MAX + 1 }, (_, i) => (
            Array.from({ length: GRID_MAX + 1 }, (_, j) => (
              <circle key={`${i}-${j}`} cx={sx(i)} cy={sy(j)} r={1.5} fill="#d1d5db" />
            ))
          ))}
          {/* grid labels */}
          {Array.from({ length: GRID_MAX + 1 }, (_, i) => (
            <g key={`label-${i}`}>
              <text x={sx(i)} y={H_SVG - PAD + 16} fontSize={8} fill="#9ca3af" textAnchor="middle">{i}</text>
              <text x={PAD - 10} y={sy(i) + 3} fontSize={8} fill="#9ca3af" textAnchor="end">{i}</text>
            </g>
          ))}
          {/* polygon */}
          <path d={polyPath} fill={isMatch ? `${COLOR.green}25` : `${COLOR.blue}15`} stroke={isMatch ? COLOR.green : COLOR.blue} strokeWidth={2} />
          {/* edge lengths */}
          {vertices.map(([x1, y1], i) => {
            const [x2, y2] = vertices[(i + 1) % vertices.length];
            const len = roundTo(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), 1);
            return (
              <text key={`len-${i}`} x={(sx(x1) + sx(x2)) / 2 + 6} y={(sy(y1) + sy(y2)) / 2 - 6}
                fontSize={9} fill="#6b7280" fontWeight={600} textAnchor="middle">{len}</text>
            );
          })}
          {/* draggable vertices */}
          {vertices.map(([x, y], i) => (
            <g key={i} style={{ cursor: 'move' }}
              role="button"
              tabIndex={0}
              aria-label={`Vertex ${String.fromCharCode(65 + i)} at ${x}, ${y}. Use arrow keys to move on grid.`}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') { e.preventDefault(); nudgeVertex(i, -1, 0); }
                if (e.key === 'ArrowRight') { e.preventDefault(); nudgeVertex(i, 1, 0); }
                if (e.key === 'ArrowUp') { e.preventDefault(); nudgeVertex(i, 0, 1); }
                if (e.key === 'ArrowDown') { e.preventDefault(); nudgeVertex(i, 0, -1); }
              }}
              onMouseDown={(e) => onPointerDown(i, e)}
              onTouchStart={(e) => onPointerDown(i, e)}>
              <circle cx={sx(x)} cy={sy(y)} r={14} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
              <text x={sx(x)} y={sy(y) + 3.5} fontSize={8} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ padding: '6px 14px', borderRadius: 10, background: isMatch ? COLOR.greenLight : '#eff6ff', border: `1px solid ${isMatch ? COLOR.greenBorder : '#93c5fd'}`, fontSize: 14, fontWeight: 700, color: isMatch ? COLOR.green : COLOR.blue }}>
          Area = {area} sq. units
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 10, background: '#faf5ff', border: '1px solid #ddd6fe', fontSize: 13, fontWeight: 600, color: COLOR.purple }}>
          Perimeter = {peri} units
        </div>
      </div>

      {checked && isMatch && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Area matches the target!</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && (
          <button type="button" onClick={() => setChecked(true)}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Check
          </button>
        )}
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
   MODE 3 — Parallel & Perpendicular Lines Lab
   Two lines on a coordinate grid. Drag endpoints to explore slope
   relationships: parallel (equal slopes) and perpendicular (negative
   reciprocal slopes). Challenges ask the learner to make lines ‖ or ⊥.
   ═══════════════════════════════════════════════════════════════════════════ */

function slopeOf(x1, y1, x2, y2) {
  if (x2 === x1) return Infinity;
  return (y2 - y1) / (x2 - x1);
}

function slopeLabel(m) {
  if (m === Infinity || m === -Infinity) return 'undefined (vertical)';
  if (Number.isInteger(m)) return String(m);
  const sign = m < 0 ? '-' : '';
  const a = Math.abs(m);
  for (let d = 1; d <= 20; d++) {
    const n = a * d;
    if (Math.abs(n - Math.round(n)) < 0.001) return `${sign}${Math.round(n)}/${d}`;
  }
  return roundTo(m, 2).toString();
}

function areLinesParallel(m1, m2) {
  if (m1 === Infinity && m2 === Infinity) return true;
  if (m1 === Infinity || m2 === Infinity) return false;
  return Math.abs(m1 - m2) < 0.001;
}

function areLinesPerpendicular(m1, m2) {
  if (m1 === Infinity && Math.abs(m2) < 0.001) return true;
  if (m2 === Infinity && Math.abs(m1) < 0.001) return true;
  if (m1 === Infinity || m2 === Infinity) return false;
  return Math.abs(m1 * m2 + 1) < 0.05;
}

const CHALLENGES = [
  { type: 'parallel', text: 'Drag the blue line so it is parallel to the red line.' },
  { type: 'perpendicular', text: 'Drag the blue line so it is perpendicular to the red line.' },
  { type: 'identify', text: 'Are these two lines parallel, perpendicular, or neither?' },
];

function generateLinePair(challengeType) {
  const m1Choices = [-3, -2, -1, -0.5, 0.5, 1, 2, 3];
  const m1 = m1Choices[rand(0, m1Choices.length - 1)];
  const b1 = rand(-2, 2);
  const x1A = -4, x1B = 4;
  const y1A = clamp(Math.round(m1 * x1A + b1), -5, 5);
  const y1B = clamp(Math.round(m1 * x1B + b1), -5, 5);

  let x2A = -3, y2A, x2B = 3, y2B;
  if (challengeType === 'identify') {
    const r = Math.random();
    let m2;
    if (r < 0.33) {
      m2 = m1;
    } else if (r < 0.66) {
      m2 = m1 === 0 ? Infinity : -1 / m1;
      if (m2 === Infinity) { x2A = 0; x2B = 0; y2A = -4; y2B = 4; return { line1: [x1A, y1A, x1B, y1B], line2: [x2A, y2A, x2B, y2B], fixed: true }; }
    } else {
      m2 = m1 + (Math.random() < 0.5 ? 1.5 : -1.5);
    }
    const b2 = rand(-2, 2);
    y2A = clamp(Math.round(m2 * x2A + b2), -5, 5);
    y2B = clamp(Math.round(m2 * x2B + b2), -5, 5);
    return { line1: [x1A, y1A, x1B, y1B], line2: [x2A, y2A, x2B, y2B], fixed: true };
  }

  const b2 = rand(-2, 3);
  y2A = clamp(Math.round(0.5 * x2A + b2), -5, 5);
  y2B = clamp(Math.round(0.5 * x2B + b2), -5, 5);
  return { line1: [x1A, y1A, x1B, y1B], line2: [x2A, y2A, x2B, y2B], fixed: false };
}

function ParallelPerpLab({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [roundIdx, setRound] = useState(0);
  const svgRef = useRef(null);

  const challenge = useMemo(() => CHALLENGES[roundIdx % CHALLENGES.length], [roundIdx]);
  const initial = useMemo(() => generateLinePair(challenge.type), [roundIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const [line2, setLine2] = useState(initial.line2);
  useEffect(() => { setLine2(initial.line2); setChecked(false); setAnswer(null); }, [initial]);

  const [dragging, setDragging] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answer, setAnswer] = useState(null);

  const W = 340, H_SVG = 340, PAD = 30, GRID = 6;
  const sx = useCallback((x) => PAD + ((x + GRID) / (2 * GRID)) * (W - 2 * PAD), []);
  const sy = useCallback((y) => H_SVG - PAD - ((y + GRID) / (2 * GRID)) * (H_SVG - 2 * PAD), []);
  const fromSvg = useCallback((cx, cy) => {
    const gx = ((cx - PAD) / (W - 2 * PAD)) * 2 * GRID - GRID;
    const gy = GRID - ((cy - PAD) / (H_SVG - 2 * PAD)) * 2 * GRID;
    return [Math.round(clamp(gx, -GRID, GRID)), Math.round(clamp(gy, -GRID, GRID))];
  }, []);

  const onPointerDown = useCallback((endpoint, e) => {
    if (initial.fixed) return;
    e.preventDefault();
    setDragging(endpoint);
  }, [initial.fixed]);

  const onPointerMove = useCallback((e) => {
    if (dragging == null || !svgRef.current) return;
    e.preventDefault();
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const src = e.touches ? e.touches[0] : e;
    pt.x = src.clientX; pt.y = src.clientY;
    const svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());
    const [gx, gy] = fromSvg(svgPt.x, svgPt.y);
    setLine2((prev) => {
      const next = [...prev];
      if (dragging === 'A') { next[0] = gx; next[1] = gy; }
      else { next[2] = gx; next[3] = gy; }
      return next;
    });
    setChecked(false);
  }, [dragging, fromSvg]);

  const onPointerUp = useCallback(() => { setDragging(null); }, []);

  useEffect(() => {
    if (dragging == null) return;
    const onMove = (e) => onPointerMove(e);
    const onUp = () => onPointerUp();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, onPointerMove, onPointerUp]);

  const m1 = slopeOf(initial.line1[0], initial.line1[1], initial.line1[2], initial.line1[3]);
  const m2 = slopeOf(line2[0], line2[1], line2[2], line2[3]);
  const isPar = areLinesParallel(m1, m2);
  const isPerp = areLinesPerpendicular(m1, m2);
  const relationship = isPar ? 'parallel' : isPerp ? 'perpendicular' : 'neither';

  const handleCheck = () => {
    setChecked(true);
  };

  const isCorrect = challenge.type === 'parallel' ? isPar
    : challenge.type === 'perpendicular' ? isPerp
    : answer === relationship;

  const slopeProduct = (m1 !== Infinity && m2 !== Infinity) ? roundTo(m1 * m2, 2) : null;

  const propertiesPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ padding: '8px 10px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', letterSpacing: '0.05em', marginBottom: 2 }}>Red line slope</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#b91c1c' }}>m₁ = {slopeLabel(m1)}</div>
        </div>
        <div style={{ padding: '8px 10px', borderRadius: 10, background: '#eff6ff', border: '1px solid #93c5fd' }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: COLOR.blue, letterSpacing: '0.05em', marginBottom: 2 }}>Blue line slope</div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#1d4ed8' }}>m₂ = {slopeLabel(m2)}</div>
        </div>
      </div>

      <div style={{ padding: '10px 12px', borderRadius: 10, background: '#faf5ff', border: '1px solid #ddd6fe' }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#7c3aed', letterSpacing: '0.05em', marginBottom: 4 }}>Properties</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: isPar ? '#22c55e' : '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800, flexShrink: 0 }}>{isPar ? '\u2713' : ''}</span>
            Parallel: m₁ = m₂ {isPar && <span style={{ color: '#22c55e', fontWeight: 800 }}>&larr; Yes!</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: isPerp ? '#22c55e' : '#e2e8f0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800, flexShrink: 0 }}>{isPerp ? '\u2713' : ''}</span>
            Perpendicular: m₁ \u00d7 m₂ = \u22121 {slopeProduct !== null && <span style={{ opacity: 0.7 }}>(= {slopeProduct})</span>} {isPerp && <span style={{ color: '#22c55e', fontWeight: 800 }}>&larr; Yes!</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const graphPanel = (
    <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 6, touchAction: 'none' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H_SVG}`} width="100%" style={{ display: 'block', margin: '0 auto' }}>
        {Array.from({ length: 2 * GRID + 1 }, (_, i) => i - GRID).map((v) => (
          <g key={v}>
            <line x1={sx(v)} y1={PAD} x2={sx(v)} y2={H_SVG - PAD} stroke={v === 0 ? '#9ca3af' : '#f3f4f6'} strokeWidth={v === 0 ? 1.5 : 0.5} />
            <line x1={PAD} y1={sy(v)} x2={W - PAD} y2={sy(v)} stroke={v === 0 ? '#9ca3af' : '#f3f4f6'} strokeWidth={v === 0 ? 1.5 : 0.5} />
            {v !== 0 && v % 2 === 0 && <text x={sx(v)} y={sy(0) + 11} fontSize={7} fill="#9ca3af" textAnchor="middle">{v}</text>}
            {v !== 0 && v % 2 === 0 && <text x={sx(0) - 5} y={sy(v) + 3} fontSize={7} fill="#9ca3af" textAnchor="end">{v}</text>}
          </g>
        ))}
        {/* Red line (fixed) */}
        <line x1={sx(initial.line1[0])} y1={sy(initial.line1[1])} x2={sx(initial.line1[2])} y2={sy(initial.line1[3])}
          stroke="#dc2626" strokeWidth={3} strokeLinecap="round" />
        <circle cx={sx(initial.line1[0])} cy={sy(initial.line1[1])} r={6} fill="#dc2626" stroke="#fff" strokeWidth={2} />
        <circle cx={sx(initial.line1[2])} cy={sy(initial.line1[3])} r={6} fill="#dc2626" stroke="#fff" strokeWidth={2} />
        <text x={sx(initial.line1[0]) - 10} y={sy(initial.line1[1]) - 10} fontSize={9} fill="#dc2626" fontWeight={700}>
          ({initial.line1[0]},{initial.line1[1]})
        </text>
        <text x={sx(initial.line1[2]) + 4} y={sy(initial.line1[3]) - 10} fontSize={9} fill="#dc2626" fontWeight={700}>
          ({initial.line1[2]},{initial.line1[3]})
        </text>

        {/* Blue line (draggable unless "identify") */}
        <line x1={sx(line2[0])} y1={sy(line2[1])} x2={sx(line2[2])} y2={sy(line2[3])}
          stroke="#2563eb" strokeWidth={3} strokeLinecap="round" />
        {!initial.fixed ? (
          <>
            <circle cx={sx(line2[0])} cy={sy(line2[1])} r={12} fill="#2563eb" stroke="#fff" strokeWidth={2}
              style={{ cursor: 'grab', touchAction: 'none' }}
              onPointerDown={(e) => onPointerDown('A', e)} onTouchStart={(e) => onPointerDown('A', e)} />
            <text x={sx(line2[0])} y={sy(line2[1]) + 3.5} fontSize={7} fill="#fff" fontWeight={700} textAnchor="middle"
              style={{ pointerEvents: 'none' }}>A</text>
            <circle cx={sx(line2[2])} cy={sy(line2[3])} r={12} fill="#2563eb" stroke="#fff" strokeWidth={2}
              style={{ cursor: 'grab', touchAction: 'none' }}
              onPointerDown={(e) => onPointerDown('B', e)} onTouchStart={(e) => onPointerDown('B', e)} />
            <text x={sx(line2[2])} y={sy(line2[3]) + 3.5} fontSize={7} fill="#fff" fontWeight={700} textAnchor="middle"
              style={{ pointerEvents: 'none' }}>B</text>
          </>
        ) : (
          <>
            <circle cx={sx(line2[0])} cy={sy(line2[1])} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
            <circle cx={sx(line2[2])} cy={sy(line2[3])} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
          </>
        )}
        <text x={sx(line2[0]) - 10} y={sy(line2[1]) + 16} fontSize={9} fill="#2563eb" fontWeight={700}>
          ({line2[0]},{line2[1]})
        </text>
        <text x={sx(line2[2]) + 4} y={sy(line2[3]) + 16} fontSize={9} fill="#2563eb" fontWeight={700}>
          ({line2[2]},{line2[3]})
        </text>

        {/* Relationship badge on the graph */}
        {checked && (
          <g>
            <rect x={W / 2 - 50} y={8} width={100} height={22} rx={6} fill={isCorrect ? '#22c55e' : '#ef4444'} />
            <text x={W / 2} y={23} fontSize={11} fill="#fff" fontWeight={800} textAnchor="middle">
              {isCorrect ? '\u2713 Correct!' : '\u2717 Try again'}
            </text>
          </g>
        )}
      </svg>
    </div>
  );

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple, marginBottom: 10 }}>{badgeLabel || 'Interactive activity'}</div>}

      <QBotBubble
        message={
          checked && isCorrect ? (challenge.type === 'identify'
            ? `Right! The lines are ${relationship}. ${isPar ? 'Parallel lines have equal slopes.' : isPerp ? 'Perpendicular slopes multiply to \u22121.' : 'Neither equal slopes nor negative reciprocals.'}`
            : `Excellent! ${isPar ? 'Both slopes are equal \u2014 the lines are parallel.' : 'The slopes multiply to \u22121 \u2014 the lines are perpendicular.'}`)
          : checked && !isCorrect ? 'Not quite \u2014 check the slope values and try adjusting.'
          : challenge.text
        }
        mood={checked && isCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 8 }}>
        {graphPanel}
        {propertiesPanel}
      </div>

      {challenge.type === 'identify' && !checked && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          {['parallel', 'perpendicular', 'neither'].map((opt) => (
            <button key={opt} type="button" onClick={() => { setAnswer(opt); }}
              style={{
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: answer === opt ? COLOR.blueBg : '#fff',
                border: `2px solid ${answer === opt ? COLOR.blueBorder : COLOR.border}`,
                color: answer === opt ? COLOR.blue : COLOR.textSecondary, textTransform: 'capitalize',
              }}>
              {opt === 'parallel' ? '\u2225 Parallel' : opt === 'perpendicular' ? '\u22A5 Perpendicular' : 'Neither'}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        {!checked && (challenge.type !== 'identify' || answer) && (
          <button type="button" onClick={handleCheck}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Check
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Challenge
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>

      {checked && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 12, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, fontSize: 12, lineHeight: 1.7, color: COLOR.text }}>
          <strong>Key rules:</strong><br />
          \u2225 <strong>Parallel lines</strong> have <em>equal slopes</em>: m₁ = m₂. They never intersect.<br />
          \u22A5 <strong>Perpendicular lines</strong> have slopes that are <em>negative reciprocals</em>: m₁ \u00d7 m₂ = \u22121. They meet at 90\u00b0.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main export
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['transform-lab', 'angle-explorer', 'area-builder', 'parallel-perp-lab'];

export default function GeoExplorer({ activityIndex = 0, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const mode = MODES[activityIndex % MODES.length];
  if (mode === 'transform-lab') return <TransformLab onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'angle-explorer') return <AngleExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'parallel-perp-lab') return <ParallelPerpLab onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <AreaBuilder onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
