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

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>Transform Lab</p>
      <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: COLOR.text }}>
        Objective: Apply one transformation to make the blue shape match the dashed target.
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Apply the right transformation to move the <span style={{ color: COLOR.blue, fontWeight: 700 }}>blue shape</span> to match the <span style={{ color: '#d97706', fontWeight: 700 }}>dashed target</span>.
        {' '}Drag the <span style={{ color: COLOR.purple, fontWeight: 700 }}>purple outline</span> on the grid to translate, or use the buttons for flips and turns—the panel below names the transformation and shows the coordinate rule.
      </p>
      <div style={{ margin: '0 0 10px', display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, background: '#f1f5f9', border: `1px solid ${COLOR.border}`, borderRadius: 999, padding: '4px 10px' }}>
          Stage: {!selected ? 'Drag or pick' : checked ? 'Checked' : 'Previewing'}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: isCorrect ? '#047857' : checked ? '#b91c1c' : '#64748b', background: isCorrect ? '#ecfdf5' : checked ? '#fef2f2' : '#f8fafc', border: `1px solid ${isCorrect ? '#86efac' : checked ? '#fca5a5' : '#e5e7eb'}`, borderRadius: 999, padding: '4px 10px' }}>
          Progress: {isCorrect ? 'Matched' : checked ? 'Adjust and retry' : 'In progress'}
        </span>
      </div>

      <QBotBubble
        message={isCorrect ? 'Correct transformation sequence - the image matches the target exactly.' : checked && !isCorrect ? 'Transformation is not correct yet. Recheck orientation (reflection/rotation) and then translation distance.' : 'Hint: compare orientation first (flip/rotate) and then position (translate) to match the dashed shape.'}
        mood={isCorrect ? 'celebrate' : checked ? 'think' : 'wave'}
      />
      <div
        role="status"
        aria-live="polite"
        style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 12, background: '#faf5ff', border: `1px solid #ddd6fe`, fontSize: 13, color: '#4c1d95', lineHeight: 1.5 }}
      >
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c3aed', marginBottom: 4 }}>Current transformation</div>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>{transformReadout.headline}</div>
        <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.92 }}>{transformReadout.sub}</div>
        {transformReadout.rule && (
          <div style={{ marginTop: 8, fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, background: '#fff', padding: '6px 10px', borderRadius: 8, border: '1px solid #e9d5ff' }}>
            Rule: {transformReadout.rule}
          </div>
        )}
      </div>
      <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 12, color: '#1e3a8a', lineHeight: 1.45 }}>
        <strong>How to use:</strong> pick a transformation type, read the rule above, then drag the purple shape (translation) or tap a flip/turn. Use sliders if you prefer. Press Apply when you are ready to check.
      </div>

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: 8, marginBottom: 12, touchAction: 'none' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H_SVG}`}
          width="100%"
          style={{ display: 'block' }}
        >
          {/* grid */}
          {Array.from({ length: 2 * GRID + 1 }, (_, i) => i - GRID).map((v) => (
            <g key={v}>
              <line x1={sx(v)} y1={PAD} x2={sx(v)} y2={H_SVG - PAD} stroke={v === 0 ? '#9ca3af' : '#f3f4f6'} strokeWidth={v === 0 ? 1.5 : 0.5} />
              <line x1={PAD} y1={sy(v)} x2={W - PAD} y2={sy(v)} stroke={v === 0 ? '#9ca3af' : '#f3f4f6'} strokeWidth={v === 0 ? 1.5 : 0.5} />
              {v !== 0 && v % 3 === 0 && <text x={sx(v)} y={sy(0) + 11} fontSize={7} fill="#9ca3af" textAnchor="middle">{v}</text>}
              {v !== 0 && v % 3 === 0 && <text x={sx(0) - 5} y={sy(v) + 3} fontSize={7} fill="#9ca3af" textAnchor="end">{v}</text>}
            </g>
          ))}
          {/* target (dashed) */}
          <path d={polyPath(problem.target)} fill="#d9770620" stroke="#d97706" strokeWidth={2} strokeDasharray="5 3" />
          {/* original (blue, solid) */}
          <path d={polyPath(problem.original)} fill={`${COLOR.blue}20`} stroke={COLOR.blue} strokeWidth={2} />
          {/* student's transform preview — non-translate (view only) */}
          {selected && selected !== 'translate' && !checked && (
            <path d={polyPath(currentTransformed)} fill="#7c3aed15" stroke={COLOR.purple} strokeWidth={2} strokeDasharray="3 2" />
          )}
          {/* draggable translation layer (starts before any selection) */}
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
          {/* applied result */}
          {checked && (
            <path d={polyPath(applied || currentTransformed)} fill={isCorrect ? `${COLOR.green}25` : '#ef444425'} stroke={isCorrect ? COLOR.green : '#ef4444'} strokeWidth={2.5} />
          )}
          {/* vertex labels */}
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

      {/* Transform selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 10 }}>
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => { setSelected(opt); setChecked(false); }}
            style={{
              padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 44,
              background: selected === opt ? COLOR.blueBg : '#fff',
              border: `2px solid ${selected === opt ? COLOR.blueBorder : COLOR.border}`,
              color: selected === opt ? COLOR.blue : COLOR.textSecondary,
            }}>
            {optionLabels[opt]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ padding: '5px 12px', borderRadius: 999, background: selected ? '#ecfeff' : '#f8fafc', border: `1px solid ${selected ? '#67e8f9' : '#e5e7eb'}`, fontSize: 12, fontWeight: 700, color: selected ? '#0e7490' : '#64748b' }}>
          {selected ? `Selected: ${optionLabels[selected]}` : 'Select a transformation to begin'}
        </div>
      </div>

      {selected === 'translate' && (
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.text }}>dx:</span>
            <input type="range" min={-GRID} max={GRID} step={1} value={dx} onChange={(e) => setDx(parseInt(e.target.value, 10))} aria-label="Translate x amount" style={{ width: 90, accentColor: COLOR.blue }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLOR.blue }}>{dx}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLOR.text }}>dy:</span>
            <input type="range" min={-GRID} max={GRID} step={1} value={dy} onChange={(e) => setDy(parseInt(e.target.value, 10))} aria-label="Translate y amount" style={{ width: 90, accentColor: COLOR.green }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: COLOR.green }}>{dy}</span>
          </div>
        </div>
      )}

      {isCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p aria-live="polite" style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} Correct transformation! Shape and orientation both match.</p>
        </div>
      )}
      {checked && !isCorrect && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#ef4444' }}>Not a match. The correct transformation was: {problem.transform.label}.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!checked && selected && (
          <button type="button" onClick={handleCheck}
            style={{ ...BTN_PRIMARY, background: `linear-gradient(135deg, ${COLOR.blue}, #1d4ed8)`, flex: '1 1 auto' }}>
            Apply Transformation
          </button>
        )}
        <button type="button" onClick={() => setRound((r) => r + 1)}
          style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Problem
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
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
   Main export
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['transform-lab', 'angle-explorer', 'area-builder'];

export default function GeoExplorer({ activityIndex = 0, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const mode = MODES[activityIndex % MODES.length];
  if (mode === 'transform-lab') return <TransformLab onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'angle-explorer') return <AngleExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <AreaBuilder onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
