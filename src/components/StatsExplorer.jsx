/**
 * StatsExplorer — genuinely interactive probability / statistics activities.
 *
 * Modes (rotated by activityIndex):
 *   0  "mean-builder"     Drag dots on a number line to hit a target mean.
 *   1  "median-sorter"    Sort scrambled data and identify the median.
 *   2  "box-plot"         Build a box-and-whisker plot from a five-number summary.
 *   3  "bell-curve"       Explore the normal distribution with sliders (68-95-99.7 rule).
 *   4  "line-fit"         Drag slope & intercept to fit a regression line to scatter points.
 *   5  "prob-sim"         Spin a visual probability wheel and predict outcomes.
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { COLOR, CARD, BTN_PRIMARY, BADGE } from '../utils/loopStyles';
import qbotImg from '../assets/qbot.svg';

/* ── helpers ── */
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const roundTo = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 1 — Mean Builder
   Given a target mean, place / drag dots on a number line so the set's mean
   matches. Real-time feedback as dots move.
   ═══════════════════════════════════════════════════════════════════════════ */
function getMeanQBotMsg(currentMean, targetMean, hasMoved) {
  if (!hasMoved) return { msg: 'The mean is the sum of all values divided by how many there are. Drag the dots to make the mean hit the target!', mood: 'wave' };
  const diff = currentMean - targetMean;
  if (Math.abs(diff) < 0.01) return { msg: 'You nailed it! The mean equals the target. Notice how many different data sets can share the same mean.', mood: 'celebrate' };
  if (Math.abs(diff) < 1) return { msg: `So close! The mean is ${diff > 0 ? 'a little too high' : 'a little too low'}. Try nudging one dot ${diff > 0 ? 'left' : 'right'}.`, mood: 'encourage' };
  if (diff > 0) return { msg: `The mean is too high by ${roundTo(Math.abs(diff), 1)}. Move some dots to smaller numbers (left) to bring the mean down.`, mood: 'think' };
  return { msg: `The mean is too low by ${roundTo(Math.abs(diff), 1)}. Move some dots to larger numbers (right) to raise the mean.`, mood: 'think' };
}

function MeanBuilder({ onComplete, continueLabel, badgeLabel, embedded }) {
  const DOT_COUNT = 5;
  const RANGE = { min: 1, max: 15 };
  const [round, setRound] = useState(0);
  const targetMean = useMemo(() => rand(4, 11), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const initVals = useMemo(() => {
    return Array.from({ length: DOT_COUNT }, () => rand(RANGE.min, RANGE.max));
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [values, setValues] = useState(initVals);
  const [solved, setSolved] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => { setValues(initVals); setSolved(false); setHasMoved(false); }, [initVals]);
  const [showHelp, setShowHelp] = useState(false);
  const svgRef = useRef(null);
  const dragging = useRef(null);

  const W = 360, H = 100, PAD = 30;
  const lineY = 60;
  const scale = (v) => PAD + ((v - RANGE.min) / (RANGE.max - RANGE.min)) * (W - 2 * PAD);
  const unscale = (px) => clamp(Math.round(RANGE.min + ((px - PAD) / (W - 2 * PAD)) * (RANGE.max - RANGE.min)), RANGE.min, RANGE.max);

  const sum = values.reduce((s, v) => s + v, 0);
  const currentMean = roundTo(sum / values.length, 1);
  const isCorrect = Math.abs(currentMean - targetMean) < 0.01;

  useEffect(() => { if (isCorrect && !solved) setSolved(true); }, [isCorrect, solved]);

  const qbot = useMemo(() => getMeanQBotMsg(currentMean, targetMean, hasMoved), [currentMean, targetMean, hasMoved]);

  const getPointerX = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return (clientX - rect.left) * (W / rect.width);
  }, []);

  const onPointerDown = useCallback((idx, e) => {
    e.preventDefault();
    dragging.current = idx;
    if (!hasMoved) setHasMoved(true);
  }, [hasMoved]);

  const onPointerMove = useCallback((e) => {
    if (dragging.current == null) return;
    e.preventDefault();
    const x = getPointerX(e);
    const val = unscale(x);
    setValues((prev) => { const n = [...prev]; n[dragging.current] = val; return n; });
  }, [getPointerX]);

  const onPointerUp = useCallback(() => { dragging.current = null; }, []);

  const DOT_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Drag the dots so the mean = <span style={{ color: COLOR.blue, fontSize: 20 }}>{targetMean}</span>
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Move each dot along the number line. The mean updates in real time.
        <button type="button" onClick={() => setShowHelp((p) => !p)} style={{ background: 'none', border: 'none', color: COLOR.blue, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 13, marginLeft: 6, textDecoration: 'underline', textUnderlineOffset: 2 }}>
          {showHelp ? 'Hide help' : 'What is the mean?'}
        </button>
      </p>

      {/* QBot coach */}
      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      {showHelp && (
        <div style={{ marginBottom: 12, background: '#faf5ff', borderRadius: 14, border: '1px solid #ddd6fe', padding: '12px 16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#4c1d95' }}>{'\u{1F4D6}'} The Mean (Average)</p>
          <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.6 }}>
            <strong>Mean</strong> = sum of all values {'\u00F7'} number of values.<br />
            For {DOT_COUNT} dots: Mean = ({values.join(' + ')}) {'\u00F7'} {DOT_COUNT} = {sum} {'\u00F7'} {DOT_COUNT} = <strong>{currentMean}</strong><br />
            To reach a target of {targetMean}, you need the sum to be {targetMean * DOT_COUNT}. Your current sum is {sum}.
          </p>
        </div>
      )}

      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: '12px 8px', marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', cursor: dragging.current != null ? 'grabbing' : 'default' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          <line x1={PAD} y1={lineY} x2={W - PAD} y2={lineY} stroke={COLOR.border} strokeWidth={2} />
          {Array.from({ length: RANGE.max - RANGE.min + 1 }, (_, i) => {
            const v = RANGE.min + i;
            const x = scale(v);
            return <g key={v}>
              <line x1={x} y1={lineY - 5} x2={x} y2={lineY + 5} stroke="#94a3b8" strokeWidth={1} />
              <text x={x} y={lineY + 18} fontSize={9} fill="#6b7280" textAnchor="middle">{v}</text>
            </g>;
          })}
          <line x1={scale(targetMean)} y1={lineY - 20} x2={scale(targetMean)} y2={lineY + 4} stroke={COLOR.blue} strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={scale(targetMean)} y={lineY - 23} fontSize={9} fill={COLOR.blue} textAnchor="middle" fontWeight={700}>target</text>
          <polygon points={`${scale(currentMean)},${lineY - 14} ${scale(currentMean) - 5},${lineY - 22} ${scale(currentMean) + 5},${lineY - 22}`}
            fill={isCorrect ? COLOR.green : '#f59e0b'} />
          {values.map((v, i) => (
            <g key={i} style={{ cursor: 'grab' }}
              onMouseDown={(e) => onPointerDown(i, e)}
              onTouchStart={(e) => onPointerDown(i, e)}>
              <circle cx={scale(v)} cy={lineY} r={12} fill={DOT_COLORS[i % DOT_COLORS.length]} opacity={0.85} stroke="#fff" strokeWidth={2} />
              <text x={scale(v)} y={lineY + 4} fontSize={10} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>{v}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* live stats */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ padding: '6px 14px', borderRadius: 10, background: isCorrect ? COLOR.greenLight : '#fef9c3', border: `1px solid ${isCorrect ? COLOR.greenBorder : '#fde68a'}`, fontSize: 14, fontWeight: 700, color: isCorrect ? COLOR.green : '#92400e' }}>
          Mean = {currentMean}
        </div>
        <div style={{ padding: '6px 14px', borderRadius: 10, background: '#f5f3ff', border: `1px solid #c4b5fd`, fontSize: 13, fontWeight: 600, color: COLOR.purple }}>
          Sum: {sum} {'\u00F7'} {DOT_COUNT} = {currentMean}
        </div>
      </div>

      {solved && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>{'\u2713'} You matched the target mean!</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: COLOR.textSecondary }}>Many different data sets can have the same mean. The mean is just one way to describe the center of data.</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} Try Another
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
      {round > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Practice round {round + 1} — new target each time!
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 2 — Line of Best Fit  (with QBot coaching)
   Scatter points are shown. Drag two handles to adjust slope + intercept of
   a line. Residual lines are rendered live. Goal: minimize total residual.
   QBot gives real-time guidance; a glossary panel explains key terms.
   ═══════════════════════════════════════════════════════════════════════════ */

const GLOSSARY = [
  { term: 'Residual', def: 'The vertical distance between a data point and the line. Residual = actual y \u2212 predicted y. The dashed red lines on the graph show each residual.' },
  { term: 'Sum of Squared Residuals (SSR)', def: 'Add up (each residual)\u00B2. A smaller SSR means a better fit. Squaring prevents positives and negatives from canceling out.' },
  { term: 'Slope (m)', def: 'How steep the line is. A slope of 2 means y increases by 2 for every 1 unit increase in x.' },
  { term: 'Y-Intercept (b)', def: 'Where the line crosses the y-axis (the value of y when x = 0).' },
  { term: 'Line of Best Fit', def: 'The straight line that minimizes the total squared residuals. Also called the least-squares regression line.' },
];

function getQBotMessage(ratio, slope, intercept, bestSlope, bestIntercept, hasMoved) {
  if (!hasMoved) return { msg: 'Drag the green handle up or down to set where the line starts, then tilt with the purple handle!', mood: 'wave' };
  if (ratio > 5) return { msg: 'The line is way off \u2014 see those long red dashes? Try tilting the slope so the line passes through the middle of the points.', mood: 'think' };
  if (ratio > 3) return { msg: 'Getting closer! The red residual lines are still pretty long. Try adjusting the slope \u2014 does the data trend up or down?', mood: 'think' };
  if (ratio > 1.8) return { msg: 'Good progress! A few points are still far from the line. Fine-tune the intercept (green handle) to shift everything up or down.', mood: 'encourage' };
  if (ratio > 1.3) return { msg: 'You are close to minimum SSR. Make small slope/intercept adjustments to reduce the remaining residuals.', mood: 'encourage' };
  return { msg: 'Excellent fit! Your line is nearly optimal. The residuals are as small as they can get.', mood: 'celebrate' };
}

function QBotBubble({ message, mood }) {
  const moodEmoji = { wave: '\u{1F44B}', think: '\u{1F914}', encourage: '\u{1F4AA}', celebrate: '\u{1F389}' };
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid #a78bfa', boxShadow: '0 2px 8px rgba(124,58,237,0.2)' }}>
        <img src={qbotImg} alt="QBot" style={{ width: 26 }} />
      </div>
      <div style={{ background: '#f5f3ff', borderRadius: '2px 12px 12px 12px', padding: '8px 12px', border: '1px solid #ddd6fe', flex: 1, fontSize: 13, fontWeight: 600, color: '#4c1d95', lineHeight: 1.5 }}>
        <span style={{ marginRight: 4 }}>{moodEmoji[mood] || ''}</span>{message}
      </div>
    </div>
  );
}

function LineFit({ onComplete, continueLabel, badgeLabel, embedded }) {
  const W = 340, H = 260, PAD = 36;
  const [round, setRound] = useState(0);

  const points = useMemo(() => {
    const trueSlope = roundTo(rand(3, 12) / 5, 1);
    const trueInt = rand(1, 4);
    return Array.from({ length: 8 }, () => {
      const x = rand(1, 10);
      const noise = (Math.random() - 0.5) * 4;
      const y = clamp(Math.round(trueSlope * x + trueInt + noise), 0, 14);
      return { x, y };
    });
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(5);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const dragging = useRef(null);
  const svgRef = useRef(null);

  const handleTryAnother = useCallback(() => {
    setRound((r) => r + 1);
    setSlope(1);
    setIntercept(5);
    setShowSolution(false);
    setShowGlossary(false);
    setHasMoved(false);
  }, []);

  const xMin = 0, xMax = 12, yMin = 0, yMax = 14;
  const sx = (v) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (v) => H - PAD - ((v - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  const predict = (x) => slope * x + intercept;
  const totalResidual = roundTo(points.reduce((s, p) => s + (p.y - predict(p.x)) ** 2, 0), 1);

  const leastSquares = useMemo(() => {
    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
    const mNum = n * sumXY - sumX * sumY;
    const mDen = n * sumX2 - sumX * sumX;
    const m = mDen !== 0 ? mNum / mDen : 0;
    const b = (sumY - m * sumX) / n;
    return {
      m: roundTo(m, 2), b: roundTo(b, 2),
      n, sumX, sumY, sumXY, sumX2,
      mNum: roundTo(mNum, 1), mDen: roundTo(mDen, 1),
      meanX: roundTo(sumX / n, 2), meanY: roundTo(sumY / n, 2),
    };
  }, [points]);

  const bestResidual = roundTo(points.reduce((s, p) => s + (p.y - (leastSquares.m * p.x + leastSquares.b)) ** 2, 0), 1);
  const ratio = bestResidual > 0 ? totalResidual / bestResidual : 1;
  const isGoodFit = ratio <= 1.3;

  // Progress percentage (100% = perfect fit, 0% = very far off)
  const progressPct = clamp(Math.round(100 / Math.max(ratio, 1)), 0, 100);

  const qbot = useMemo(
    () => getQBotMessage(ratio, slope, intercept, leastSquares.m, leastSquares.b, hasMoved),
    [ratio, slope, intercept, leastSquares, hasMoved],
  );

  const getPointerPos = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const px = (clientX - rect.left) * (W / rect.width);
    const py = (clientY - rect.top) * (H / rect.height);
    const xv = xMin + ((px - PAD) / (W - 2 * PAD)) * (xMax - xMin);
    const yv = yMax - ((py - PAD) / (H - 2 * PAD)) * (yMax - yMin);
    return { x: xv, y: yv };
  }, []);

  const onPointerDown = useCallback((which, e) => {
    e.preventDefault();
    dragging.current = which;
    if (!hasMoved) setHasMoved(true);
  }, [hasMoved]);
  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    if (dragging.current === 'intercept') {
      setIntercept(clamp(roundTo(y, 1), -2, 14));
    } else if (dragging.current === 'slope') {
      const newSlope = x > 0.5 ? clamp(roundTo((y - intercept) / x, 1), -3, 3) : slope;
      setSlope(newSlope);
    }
  }, [getPointerPos, intercept, slope]);
  const onPointerUp = useCallback(() => { dragging.current = null; }, []);

  const lineX1 = xMin, lineX2 = xMax;
  const lineY1 = predict(lineX1), lineY2 = predict(lineX2);

  const progressColor = progressPct >= 77 ? COLOR.green : progressPct >= 50 ? '#d97706' : '#ef4444';

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Fit the line to the data
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Drag the <span style={{ color: '#059669', fontWeight: 700 }}>green handle (b)</span> to set the y-intercept and the <span style={{ color: '#7c3aed', fontWeight: 700 }}>purple handle (m)</span> to tilt the slope. Your goal: make the <button type="button" onClick={() => setShowGlossary((p) => !p)} style={{ background: 'none', border: 'none', color: COLOR.blue, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 2 }}>residuals</button> as small as possible!
      </p>

      {/* QBot coach */}
      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      {/* Glossary panel */}
      {showGlossary && (
        <div style={{ marginBottom: 12, background: '#faf5ff', borderRadius: 14, border: '1px solid #ddd6fe', padding: '14px 16px', animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#4c1d95' }}>{'\u{1F4D6}'} Key Terms</span>
            <button type="button" onClick={() => setShowGlossary(false)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af', padding: 0 }}>{'\u2715'}</button>
          </div>
          {GLOSSARY.map((g) => (
            <div key={g.term} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.purple }}>{g.term}</div>
              <div style={{ fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>{g.def}</div>
            </div>
          ))}
        </div>
      )}

      {/* Data points listing */}
      <div style={{ marginBottom: 10, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd', padding: '8px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>
          {'\u{1F4CA}'} Your {points.length} data points:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {points.map((p, i) => (
            <span key={i} style={{ padding: '2px 8px', borderRadius: 6, background: '#fff', border: '1px solid #bae6fd', fontSize: 12, fontWeight: 600, color: '#1e40af' }}>
              ({p.x}, {p.y})
            </span>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: COLOR.textSecondary, marginBottom: 3 }}>
          <span>Fit quality</span>
          <span style={{ color: progressColor, fontWeight: 700 }}>{progressPct}%{isGoodFit ? ' \u2714' : ''}</span>
        </div>
        <div style={{ height: 8, background: '#f3f4f6', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`, borderRadius: 6, transition: 'width 0.3s ease, background 0.3s ease' }} />
        </div>
      </div>

      {/* SVG graph */}
      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: '8px', marginBottom: 12, touchAction: 'none' }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}
          onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
          onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
          {/* axes */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d1d5db" strokeWidth={1.5} />
          <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#d1d5db" strokeWidth={1.5} />
          {/* x ticks */}
          {Array.from({ length: 7 }, (_, i) => { const v = i * 2; return <g key={`x${v}`}><line x1={sx(v)} y1={H - PAD} x2={sx(v)} y2={H - PAD + 4} stroke="#9ca3af" strokeWidth={1} /><text x={sx(v)} y={H - PAD + 16} fontSize={9} fill="#6b7280" textAnchor="middle">{v}</text></g>; })}
          {/* y ticks */}
          {Array.from({ length: 8 }, (_, i) => { const v = i * 2; return <g key={`y${v}`}><line x1={PAD - 4} y1={sy(v)} x2={PAD} y2={sy(v)} stroke="#9ca3af" strokeWidth={1} /><text x={PAD - 8} y={sy(v) + 3} fontSize={9} fill="#6b7280" textAnchor="end">{v}</text></g>; })}
          {/* residual lines with labels */}
          {points.map((p, i) => {
            const predicted = predict(p.x);
            const residual = roundTo(p.y - predicted, 1);
            const midY = (sy(p.y) + sy(predicted)) / 2;
            return <g key={`r${i}`}>
              <line x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(predicted)}
                stroke="#fca5a5" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.7} />
              {Math.abs(residual) > 0.5 && (
                <text x={sx(p.x) + 6} y={midY + 3} fontSize={7} fill="#ef4444" fontWeight={600} opacity={0.8}>{residual > 0 ? '+' : ''}{residual}</text>
              )}
            </g>;
          })}
          {/* student's regression line */}
          <line x1={sx(lineX1)} y1={sy(lineY1)} x2={sx(lineX2)} y2={sy(lineY2)}
            stroke={isGoodFit ? COLOR.green : '#2563eb'} strokeWidth={2.5} opacity={0.8} />
          {/* best-fit line overlay (gold, dashed) */}
          {showSolution && (
            <line
              x1={sx(xMin)} y1={sy(leastSquares.m * xMin + leastSquares.b)}
              x2={sx(xMax)} y2={sy(leastSquares.m * xMax + leastSquares.b)}
              stroke="#d97706" strokeWidth={2} strokeDasharray="6 3" opacity={0.9} />
          )}
          {/* legend when solution shown */}
          {showSolution && <>
            <rect x={W - PAD - 110} y={PAD + 2} width={106} height={36} rx={6} fill="#fff" stroke="#e5e7eb" strokeWidth={1} opacity={0.95} />
            <line x1={W - PAD - 100} y1={PAD + 14} x2={W - PAD - 80} y2={PAD + 14} stroke="#2563eb" strokeWidth={2.5} />
            <text x={W - PAD - 76} y={PAD + 17} fontSize={8} fill="#334155" fontWeight={600}>Your line</text>
            <line x1={W - PAD - 100} y1={PAD + 28} x2={W - PAD - 80} y2={PAD + 28} stroke="#d97706" strokeWidth={2} strokeDasharray="6 3" />
            <text x={W - PAD - 76} y={PAD + 31} fontSize={8} fill="#334155" fontWeight={600}>Best fit</text>
          </>}
          {/* data points with coordinate labels */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill="#2563eb" stroke="#fff" strokeWidth={1.5} />
              <text x={sx(p.x)} y={sy(p.y) - 8} fontSize={7} fill="#1e40af" fontWeight={700} textAnchor="middle" opacity={0.85}>
                ({p.x},{p.y})
              </text>
            </g>
          ))}
          {/* intercept handle (y-axis) */}
          <g style={{ cursor: 'ns-resize' }}
            onMouseDown={(e) => onPointerDown('intercept', e)}
            onTouchStart={(e) => onPointerDown('intercept', e)}>
            <circle cx={sx(0)} cy={sy(intercept)} r={12} fill={COLOR.green} stroke="#fff" strokeWidth={2.5} opacity={0.9} />
            <text x={sx(0)} y={sy(intercept) + 4} fontSize={9} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>b</text>
          </g>
          {/* slope handle (right side) */}
          <g style={{ cursor: 'move' }}
            onMouseDown={(e) => onPointerDown('slope', e)}
            onTouchStart={(e) => onPointerDown('slope', e)}>
            <circle cx={sx(8)} cy={sy(predict(8))} r={12} fill={COLOR.purple} stroke="#fff" strokeWidth={2.5} opacity={0.9} />
            <text x={sx(8)} y={sy(predict(8)) + 4} fontSize={9} fill="#fff" textAnchor="middle" fontWeight={700} style={{ pointerEvents: 'none' }}>m</text>
          </g>
        </svg>
      </div>

      {/* Equations side by side */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ padding: '6px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 13, fontWeight: 700, color: COLOR.blue, textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Your line</div>
          y = {slope}x {intercept >= 0 ? '+' : '\u2212'} {Math.abs(intercept)}
        </div>
        {showSolution && (
          <div style={{ padding: '6px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fbbf24', fontSize: 13, fontWeight: 700, color: '#92400e', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Best fit (100%)</div>
            y = {leastSquares.m}x {leastSquares.b >= 0 ? '+' : '\u2212'} {Math.abs(leastSquares.b)}
          </div>
        )}
        <div style={{ padding: '6px 14px', borderRadius: 10, background: isGoodFit ? COLOR.greenLight : '#fef9c3', border: `1px solid ${isGoodFit ? COLOR.greenBorder : '#fde68a'}`, fontSize: 13, fontWeight: 700, color: isGoodFit ? COLOR.green : '#92400e' }}>
          SSR: {totalResidual}{showSolution ? ` / best: ${bestResidual}` : ''}
        </div>
      </div>

      {/* Action buttons row */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setShowSolution((p) => !p)} style={{ padding: '6px 14px', borderRadius: 10, background: showSolution ? '#fffbeb' : '#f8fafc', border: `1px solid ${showSolution ? '#fbbf24' : '#e5e7eb'}`, fontSize: 12, fontWeight: 700, color: showSolution ? '#92400e' : COLOR.textSecondary, cursor: 'pointer' }}>
          {showSolution ? '\u2715 Hide Solution' : '\u{1F4A1} Show Best Fit'}
        </button>
        <button type="button" onClick={() => setShowGlossary((p) => !p)} style={{ padding: '6px 14px', borderRadius: 10, background: '#faf5ff', border: '1px solid #ddd6fe', fontSize: 12, fontWeight: 700, color: COLOR.purple, cursor: 'pointer' }}>
          {'\u{1F4D6}'} {showGlossary ? 'Hide' : 'Terms'}
        </button>
      </div>

      {isGoodFit && !showSolution && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>
            {'\u2713'} Excellent fit! Your SSR ({totalResidual}) is very close to the best possible ({bestResidual}).
          </p>
        </div>
      )}

      {/* Step-by-step solution */}
      {showSolution && (
        <div style={{ marginBottom: 14, background: '#fffbeb', borderRadius: 14, border: '1px solid #fbbf24', padding: '14px 16px', animation: 'fadeIn 0.3s ease' }}>
          <p style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#92400e' }}>{'\u{1F4DD}'} How to Find the Least-Squares Line</p>

          {/* Step 1 — data table */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#78350f' }}>Step 1: List the data and compute sums</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%', background: '#fff', borderRadius: 8 }}>
                <thead>
                  <tr style={{ background: '#fef3c7' }}>
                    {['Point', 'x', 'y', 'x\u00B2', 'xy'].map((h) => (
                      <th key={h} style={{ padding: '4px 8px', borderBottom: '1px solid #fde68a', fontWeight: 700, color: '#78350f', textAlign: 'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {points.map((p, i) => (
                    <tr key={i}>
                      <td style={{ padding: '3px 8px', borderBottom: '1px solid #fef3c7', textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '3px 8px', borderBottom: '1px solid #fef3c7', textAlign: 'center' }}>{p.x}</td>
                      <td style={{ padding: '3px 8px', borderBottom: '1px solid #fef3c7', textAlign: 'center' }}>{p.y}</td>
                      <td style={{ padding: '3px 8px', borderBottom: '1px solid #fef3c7', textAlign: 'center' }}>{p.x * p.x}</td>
                      <td style={{ padding: '3px 8px', borderBottom: '1px solid #fef3c7', textAlign: 'center' }}>{p.x * p.y}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#fef3c7', fontWeight: 700 }}>
                    <td style={{ padding: '4px 8px', textAlign: 'center', color: '#78350f' }}>{'\u03A3'}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>{leastSquares.sumX}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>{leastSquares.sumY}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>{leastSquares.sumX2}</td>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>{leastSquares.sumXY}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6b7280' }}>n = {leastSquares.n} data points</p>
          </div>

          {/* Step 2 — slope formula */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#78350f' }}>Step 2: Calculate the slope (m)</p>
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #fde68a', fontSize: 13, lineHeight: 2, color: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700 }}>m =</span>
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #78350f', paddingBottom: 2 }}>
                    n{'\u00B7'}{'\u03A3'}xy {'\u2212'} {'\u03A3'}x{'\u00B7'}{'\u03A3'}y
                  </span>
                  <span style={{ paddingTop: 2 }}>
                    n{'\u00B7'}{'\u03A3'}x{'\u00B2'} {'\u2212'} ({'\u03A3'}x){'\u00B2'}
                  </span>
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                <span style={{ fontWeight: 700 }}>m =</span>{' '}
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #94a3b8', paddingBottom: 1 }}>
                    {leastSquares.n}{'\u00B7'}{leastSquares.sumXY} {'\u2212'} {leastSquares.sumX}{'\u00B7'}{leastSquares.sumY}
                  </span>
                  <span style={{ paddingTop: 1 }}>
                    {leastSquares.n}{'\u00B7'}{leastSquares.sumX2} {'\u2212'} {leastSquares.sumX}{'\u00B2'}
                  </span>
                </span>
                {' = '}
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #94a3b8', paddingBottom: 1 }}>{leastSquares.mNum}</span>
                  <span style={{ paddingTop: 1 }}>{leastSquares.mDen}</span>
                </span>
                {' = '}<strong style={{ color: '#d97706' }}>{leastSquares.m}</strong>
              </div>
            </div>
          </div>

          {/* Step 3 — intercept formula */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#78350f' }}>Step 3: Calculate the y-intercept (b)</p>
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #fde68a', fontSize: 13, lineHeight: 2, color: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700 }}>b =</span>
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #78350f', paddingBottom: 2 }}>
                    {'\u03A3'}y {'\u2212'} m{'\u00B7'}{'\u03A3'}x
                  </span>
                  <span style={{ paddingTop: 2 }}>n</span>
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
                <span style={{ fontWeight: 700 }}>b =</span>{' '}
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #94a3b8', paddingBottom: 1 }}>
                    {leastSquares.sumY} {'\u2212'} {leastSquares.m}{'\u00B7'}{leastSquares.sumX}
                  </span>
                  <span style={{ paddingTop: 1 }}>{leastSquares.n}</span>
                </span>
                {' = '}
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ borderBottom: '2px solid #94a3b8', paddingBottom: 1 }}>
                    {roundTo(leastSquares.sumY - leastSquares.m * leastSquares.sumX, 2)}
                  </span>
                  <span style={{ paddingTop: 1 }}>{leastSquares.n}</span>
                </span>
                {' = '}<strong style={{ color: '#d97706' }}>{leastSquares.b}</strong>
              </div>
            </div>
          </div>

          {/* Step 4 — final equation */}
          <div>
            <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#78350f' }}>Step 4: Write the equation</p>
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #fde68a', textAlign: 'center', fontSize: 16, fontWeight: 800, color: '#d97706' }}>
              y = {leastSquares.m}x {leastSquares.b >= 0 ? '+' : '\u2212'} {Math.abs(leastSquares.b)}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
              This line minimizes the sum of squared residuals (SSR = {bestResidual}). Your line's SSR was {totalResidual}.
              {isGoodFit
                ? ' Your line is close because slope and intercept are near the least-squares values.'
                : ' Adjust slope and intercept toward these values to reduce SSR further.'}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={handleTryAnother} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} Try Another
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
      {round > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Practice round {round + 1} — new data points each time!
        </p>
      )}

      <style>{`@keyframes fadeIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 3 — Probability Simulator
   A visual spinner divided into colored sectors. Student predicts what
   fraction of N spins will land on each color, then runs the simulation
   and compares experimental vs theoretical probability.
   ═══════════════════════════════════════════════════════════════════════════ */
function ProbSim({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);

  const SECTORS = useMemo(() => {
    const configs = [
      [{ label: 'Red', color: '#ef4444', fraction: 1 / 2 }, { label: 'Blue', color: '#2563eb', fraction: 1 / 4 }, { label: 'Green', color: '#059669', fraction: 1 / 4 }],
      [{ label: 'Red', color: '#ef4444', fraction: 1 / 3 }, { label: 'Blue', color: '#2563eb', fraction: 1 / 3 }, { label: 'Yellow', color: '#eab308', fraction: 1 / 3 }],
      [{ label: 'Red', color: '#ef4444', fraction: 3 / 8 }, { label: 'Blue', color: '#2563eb', fraction: 3 / 8 }, { label: 'Green', color: '#059669', fraction: 1 / 4 }],
    ];
    return configs[Math.floor(Math.random() * configs.length)];
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const TOTAL_SPINS = 20;
  const [predictions, setPredictions] = useState(() => SECTORS.map(() => 0));
  const [results, setResults] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [currentSpin, setCurrentSpin] = useState(0);
  const [counts, setCounts] = useState(() => SECTORS.map(() => 0));
  const [phase, setPhase] = useState('predict');

  const handleTryAnother = useCallback(() => {
    setRound((r) => r + 1);
    setPhase('predict');
    setResults(null);
    setSpinning(false);
    setSpinAngle(0);
    setCurrentSpin(0);
  }, []);

  useEffect(() => {
    setPredictions(SECTORS.map(() => 0));
    setCounts(SECTORS.map(() => 0));
  }, [SECTORS]);

  const runSimulation = useCallback(() => {
    setPhase('spinning');
    setSpinning(true);
    setCounts(SECTORS.map(() => 0));
    const allResults = [];
    for (let i = 0; i < TOTAL_SPINS; i++) {
      const r = Math.random();
      let cum = 0;
      let idx = 0;
      for (let j = 0; j < SECTORS.length; j++) {
        cum += SECTORS[j].fraction;
        if (r < cum) { idx = j; break; }
      }
      allResults.push(idx);
    }
    setResults(allResults);

    let step = 0;
    const interval = setInterval(() => {
      if (step >= TOTAL_SPINS) {
        clearInterval(interval);
        setSpinning(false);
        setPhase('compare');
        return;
      }
      const idx = allResults[step];
      let angle = 0;
      for (let j = 0; j < idx; j++) angle += SECTORS[j].fraction * 360;
      angle += SECTORS[idx].fraction * 180;
      setSpinAngle(360 * 3 + angle + Math.random() * (SECTORS[idx].fraction * 360 * 0.6));
      setCurrentSpin(step + 1);
      setCounts((prev) => { const n = [...prev]; n[idx]++; return n; });
      step++;
    }, 250);
  }, [SECTORS]);

  const predSum = predictions.reduce((s, v) => s + v, 0);
  const predValid = predSum === TOTAL_SPINS;

  const R = 80, cx = 90, cy = 90;
  let startAngle = 0;

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Probability Spinner
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        {phase === 'predict' && `Look at the spinner. Predict how many of ${TOTAL_SPINS} spins will land on each color.`}
        {phase === 'spinning' && `Spinning... ${currentSpin} / ${TOTAL_SPINS}`}
        {phase === 'compare' && 'Compare your predictions to the actual results!'}
      </p>

      {/* QBot coach */}
      <QBotBubble
        message={
          phase === 'predict'
            ? `Tip: if a color takes up ${Math.round(SECTORS[0].fraction * 100)}% of the wheel, you'd expect about ${Math.round(SECTORS[0].fraction * TOTAL_SPINS)} out of ${TOTAL_SPINS} spins to land on it. Use each color's percentage to guide your prediction!`
            : phase === 'spinning'
              ? 'Watch how the results build up. Each spin is independent \u2014 past results don\'t affect the next spin!'
              : 'Notice any difference between Expected and Actual? With more spins the actual gets closer to the expected. That\'s the Law of Large Numbers in action!'
        }
        mood={phase === 'predict' ? 'wave' : phase === 'spinning' ? 'encourage' : 'celebrate'}
      />

      {/* Spinner wheel */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg viewBox="0 0 180 180" width={180} height={180}>
          {SECTORS.map((sec, i) => {
            const angle = sec.fraction * 360;
            const a1 = (startAngle * Math.PI) / 180;
            const a2 = ((startAngle + angle) * Math.PI) / 180;
            const largeArc = angle > 180 ? 1 : 0;
            const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
            const x2 = cx + R * Math.cos(a2), y2 = cy + R * Math.sin(a2);
            const midA = ((startAngle + angle / 2) * Math.PI) / 180;
            const lx = cx + R * 0.6 * Math.cos(midA), ly = cy + R * 0.6 * Math.sin(midA);
            const d = `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${largeArc} 1 ${x2},${y2} Z`;
            const pct = Math.round(sec.fraction * 100);
            startAngle += angle;
            return <g key={i}>
              <path d={d} fill={sec.color} stroke="#fff" strokeWidth={2} opacity={0.9} />
              <text x={lx} y={ly + 4} fontSize={11} fill="#fff" fontWeight={800} textAnchor="middle">{pct}%</text>
            </g>;
          })}
          {/* spinner arrow */}
          <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${spinAngle}deg)`, transition: spinning ? 'transform 0.4s cubic-bezier(0.2,0.8,0.3,1)' : 'none' }}>
            <polygon points={`${cx},${cy - R + 10} ${cx - 6},${cy} ${cx + 6},${cy}`} fill="#0f172a" stroke="#fff" strokeWidth={1} />
          </g>
          <circle cx={cx} cy={cy} r={8} fill="#0f172a" stroke="#fff" strokeWidth={2} />
        </svg>
      </div>

      {/* Prediction inputs */}
      {phase === 'predict' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            {SECTORS.map((sec, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: sec.color, margin: '0 auto 4px' }} />
                <div style={{ fontSize: 11, fontWeight: 700, color: COLOR.text, marginBottom: 4 }}>{sec.label}</div>
                <div style={{ fontSize: 10, color: COLOR.textSecondary, marginBottom: 4 }}>P = {Math.round(sec.fraction * 100)}%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                  <button type="button" onClick={() => setPredictions((p) => { const n = [...p]; n[i] = Math.max(0, n[i] - 1); return n; })}
                    style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${COLOR.border}`, background: COLOR.card, cursor: 'pointer', fontSize: 16, fontWeight: 700, color: COLOR.text }}>-</button>
                  <span style={{ fontSize: 18, fontWeight: 800, color: sec.color, minWidth: 28, textAlign: 'center' }}>{predictions[i]}</span>
                  <button type="button" onClick={() => setPredictions((p) => { const n = [...p]; n[i] = Math.min(TOTAL_SPINS, n[i] + 1); return n; })}
                    style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${COLOR.border}`, background: COLOR.card, cursor: 'pointer', fontSize: 16, fontWeight: 700, color: COLOR.text }}>+</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: predValid ? COLOR.green : '#d97706' }}>
            Total: {predSum} / {TOTAL_SPINS} {predValid ? '\u2713' : '(must equal ' + TOTAL_SPINS + ')'}
          </div>
          <button type="button" onClick={runSimulation} disabled={!predValid}
            style={{ ...BTN_PRIMARY, marginTop: 12, opacity: predValid ? 1 : 0.4, cursor: predValid ? 'pointer' : 'not-allowed' }}>
            Spin {TOTAL_SPINS} times!
          </button>
        </div>
      )}

      {/* Results comparison */}
      {phase === 'compare' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `auto repeat(${SECTORS.length}, 1fr)`, gap: '4px 10px', marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
            <div />
            {SECTORS.map((sec, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: sec.color, margin: '0 auto 2px' }} />
                <span style={{ fontSize: 11 }}>{sec.label}</span>
              </div>
            ))}
            <div style={{ color: COLOR.textSecondary }}>Expected</div>
            {SECTORS.map((sec, i) => <div key={`e${i}`} style={{ textAlign: 'center', color: COLOR.textSecondary }}>{Math.round(sec.fraction * TOTAL_SPINS)}</div>)}
            <div style={{ color: COLOR.purple, fontWeight: 700 }}>Predicted</div>
            {predictions.map((p, i) => <div key={`p${i}`} style={{ textAlign: 'center', color: COLOR.purple, fontWeight: 700 }}>{p}</div>)}
            <div style={{ color: COLOR.blue, fontWeight: 700 }}>Actual</div>
            {counts.map((c, i) => <div key={`a${i}`} style={{ textAlign: 'center', color: COLOR.blue, fontWeight: 700 }}>{c}</div>)}
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary, textAlign: 'center', lineHeight: 1.5 }}>
            With only {TOTAL_SPINS} spins, the actual results may differ from the theoretical probability. As the number of trials increases, the experimental probability approaches the theoretical probability. This is the <strong style={{ color: COLOR.text }}>Law of Large Numbers</strong>.
          </p>
        </div>
      )}

      {(phase === 'spinning' || phase === 'compare') && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {phase === 'compare' && (
            <button type="button" onClick={handleTryAnother} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
              {'\u{1F504}'} Try Another
            </button>
          )}
          <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }} disabled={spinning}>
            {continueLabel}
          </button>
        </div>
      )}
      {round > 0 && (
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          Practice round {round + 1} — new spinner each time!
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 4 — Median Sorter
   Sort a scrambled data set, then identify the median.
   ═══════════════════════════════════════════════════════════════════════════ */
function getMedianQBotMsg(phase, isEven) {
  if (phase === 'sort') return { msg: 'First, put the numbers in order from smallest to largest. Tap two cards to swap them!', mood: 'wave' };
  if (phase === 'pick') {
    if (isEven) return { msg: 'The data has an even count, so the median is the average of the two middle values. Tap both middle cards!', mood: 'think' };
    return { msg: 'Great — now find the middle value! That\'s your median. Tap it!', mood: 'encourage' };
  }
  return { msg: 'You found the median! Remember: the median splits the sorted data into two equal halves. It\'s resistant to outliers, unlike the mean.', mood: 'celebrate' };
}

function MedianSorter({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);
  const count = useMemo(() => rand(0, 1) === 0 ? 7 : 8, [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const isEven = count % 2 === 0;

  const sortedData = useMemo(() => {
    const arr = Array.from({ length: count }, () => rand(1, 50));
    arr.sort((a, b) => a - b);
    return arr;
  }, [round, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const trueMedian = isEven
    ? (sortedData[count / 2 - 1] + sortedData[count / 2]) / 2
    : sortedData[Math.floor(count / 2)];

  const shuffled = useMemo(() => {
    const arr = [...sortedData];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [sortedData]);

  const [cards, setCards] = useState(shuffled);
  const [phase, setPhase] = useState('sort');
  const [selected, setSelected] = useState(null);
  const [pickedIndices, setPickedIndices] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => { setCards(shuffled); setPhase('sort'); setSelected(null); setPickedIndices([]); setShowHelp(false); }, [shuffled]);

  const isSorted = cards.every((v, i) => i === 0 || cards[i - 1] <= v);

  useEffect(() => {
    if (isSorted && phase === 'sort') setPhase('pick');
  }, [isSorted, phase]);

  const handleCardTap = useCallback((idx) => {
    if (phase === 'sort') {
      if (selected === null) { setSelected(idx); return; }
      setCards((prev) => {
        const n = [...prev];
        [n[selected], n[idx]] = [n[idx], n[selected]];
        return n;
      });
      setSelected(null);
    } else if (phase === 'pick') {
      setPickedIndices((prev) => {
        if (prev.includes(idx)) return prev.filter((i) => i !== idx);
        if (isEven && prev.length < 2) return [...prev, idx];
        if (!isEven) return [idx];
        return prev;
      });
    }
  }, [phase, selected, isEven]);

  const checkMedian = useCallback(() => {
    if (!isEven && pickedIndices.length === 1) {
      if (cards[pickedIndices[0]] === trueMedian) setPhase('done');
    } else if (isEven && pickedIndices.length === 2) {
      const vals = pickedIndices.map((i) => cards[i]).sort((a, b) => a - b);
      const avg = (vals[0] + vals[1]) / 2;
      if (Math.abs(avg - trueMedian) < 0.01) setPhase('done');
    }
  }, [pickedIndices, cards, trueMedian, isEven]);

  const qbot = useMemo(() => getMedianQBotMsg(phase, isEven), [phase, isEven]);

  const midIdx = Math.floor(count / 2);
  const CARD_COLORS = { sort: '#eff6ff', pick: '#f0fdf4', done: '#f0fdf4' };

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Find the Median
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        {phase === 'sort' && 'Tap two cards to swap them. Sort smallest to largest.'}
        {phase === 'pick' && (isEven ? 'Sorted! Now tap the two middle values.' : 'Sorted! Now tap the middle value.')}
        {phase === 'done' && `The median is ${trueMedian}!`}
        <button type="button" onClick={() => setShowHelp((p) => !p)} style={{ background: 'none', border: 'none', color: COLOR.blue, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 13, marginLeft: 6, textDecoration: 'underline', textUnderlineOffset: 2 }}>
          {showHelp ? 'Hide help' : 'What is the median?'}
        </button>
      </p>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      {showHelp && (
        <div style={{ marginBottom: 12, background: '#faf5ff', borderRadius: 14, border: '1px solid #ddd6fe', padding: '12px 16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#4c1d95' }}>The Median</p>
          <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.6 }}>
            <strong>Step 1:</strong> Sort the data from smallest to largest.<br />
            <strong>Step 2:</strong> If there is an <strong>odd</strong> number of values, the median is the single middle value.<br />
            If there is an <strong>even</strong> number of values, the median is the <strong>average</strong> of the two middle values.<br />
            The median is more resistant to outliers than the mean.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {cards.map((v, i) => {
          const isPicked = pickedIndices.includes(i);
          const isSelSort = selected === i;
          const isMiddle = phase !== 'sort' && (isEven ? (i === midIdx - 1 || i === midIdx) : i === midIdx);
          let bg = CARD_COLORS[phase];
          if (isSelSort) bg = '#dbeafe';
          if (isPicked) bg = '#bbf7d0';
          if (phase === 'done' && isMiddle) bg = '#86efac';
          return (
            <button key={i} type="button" onClick={() => handleCardTap(i)}
              style={{
                width: 44, height: 52, borderRadius: 10,
                border: isSelSort ? '2px solid #2563eb' : isPicked ? '2px solid #16a34a' : `1.5px solid ${COLOR.border}`,
                background: bg, cursor: phase === 'done' ? 'default' : 'pointer',
                fontSize: 17, fontWeight: 800, color: COLOR.text,
                transition: 'all 0.15s',
                transform: isSelSort ? 'scale(1.1)' : 'scale(1)',
              }}>
              {v}
            </button>
          );
        })}
      </div>

      {phase === 'pick' && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <button type="button" onClick={checkMedian}
            disabled={isEven ? pickedIndices.length !== 2 : pickedIndices.length !== 1}
            style={{
              ...BTN_PRIMARY,
              opacity: (isEven ? pickedIndices.length === 2 : pickedIndices.length === 1) ? 1 : 0.4,
              cursor: (isEven ? pickedIndices.length === 2 : pickedIndices.length === 1) ? 'pointer' : 'not-allowed',
            }}>
            Check Median
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green }}>
            {'\u2713'} Median = {trueMedian}
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.5 }}>
            {isEven
              ? `With ${count} values, the median is the average of positions ${midIdx} and ${midIdx + 1}: (${sortedData[midIdx - 1]} + ${sortedData[midIdx]}) \u00F7 2 = ${trueMedian}.`
              : `With ${count} values, the median is the value at position ${midIdx + 1}: ${trueMedian}.`}
            {' '}Unlike the mean, the median is not pulled by extreme values.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Data Set
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 5 — Box Plot Builder
   Given a data set, identify the five-number summary and build a box plot.
   ═══════════════════════════════════════════════════════════════════════════ */
function computeFiveNum(sorted) {
  const n = sorted.length;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const lowerHalf = sorted.slice(0, Math.floor(n / 2));
  const upperHalf = sorted.slice(n % 2 === 0 ? n / 2 : Math.floor(n / 2) + 1);
  const q1 = lowerHalf.length % 2 === 0
    ? (lowerHalf[lowerHalf.length / 2 - 1] + lowerHalf[lowerHalf.length / 2]) / 2
    : lowerHalf[Math.floor(lowerHalf.length / 2)];
  const q3 = upperHalf.length % 2 === 0
    ? (upperHalf[upperHalf.length / 2 - 1] + upperHalf[upperHalf.length / 2]) / 2
    : upperHalf[Math.floor(upperHalf.length / 2)];
  return { min: sorted[0], q1, median, q3, max: sorted[n - 1], iqr: q3 - q1 };
}

const FIVE_NUM_STEPS = ['min', 'q1', 'median', 'q3', 'max'];
const FIVE_NUM_LABELS = { min: 'Minimum', q1: 'Q1 (25th %ile)', median: 'Median (Q2)', q3: 'Q3 (75th %ile)', max: 'Maximum' };

function getBoxQBotMsg(step, total) {
  if (step === 0) return { msg: 'Let\'s build a box plot! Start by finding the minimum \u2014 the smallest value in the sorted data.', mood: 'wave' };
  if (step === 1) return { msg: 'Now find Q1. Split the lower half of the data and find its median.', mood: 'think' };
  if (step === 2) return { msg: 'Find the overall median \u2014 the middle of the entire data set.', mood: 'think' };
  if (step === 3) return { msg: 'Now Q3 \u2014 the median of the upper half.', mood: 'encourage' };
  if (step === 4) return { msg: 'Last one! What\'s the maximum value?', mood: 'encourage' };
  return { msg: `You built the box plot! IQR = Q3 \u2212 Q1. The box shows the middle 50% of the data. Values beyond 1.5\u00D7IQR from the box are outliers.`, mood: 'celebrate' };
}

function BoxPlotBuilder({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [round, setRound] = useState(0);

  const sortedData = useMemo(() => {
    const arr = Array.from({ length: rand(9, 13) }, () => rand(2, 48));
    arr.sort((a, b) => a - b);
    return arr;
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const fiveNum = useMemo(() => computeFiveNum(sortedData), [sortedData]);
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => { setStepIdx(0); setAnswers({}); setInput(''); setFeedback(''); }, [round]);

  const currentKey = FIVE_NUM_STEPS[stepIdx];
  const isDone = stepIdx >= 5;

  const handleSubmit = useCallback(() => {
    const val = parseFloat(input);
    if (isNaN(val)) { setFeedback('Enter a number.'); return; }
    const expected = fiveNum[currentKey];
    if (Math.abs(val - expected) < 0.01) {
      setAnswers((prev) => ({ ...prev, [currentKey]: val }));
      setStepIdx((s) => s + 1);
      setInput('');
      setFeedback('');
    } else {
      setFeedback(`Not quite \u2014 check the sorted data again. Hint: the ${FIVE_NUM_LABELS[currentKey]} is ${expected}.`);
    }
  }, [input, fiveNum, currentKey]);

  const qbot = useMemo(() => getBoxQBotMsg(stepIdx, sortedData.length), [stepIdx, sortedData.length]);

  const W = 340, H = 80, PAD = 30;
  const dataMin = sortedData[0] - 2, dataMax = sortedData[sortedData.length - 1] + 2;
  const sx = (v) => PAD + ((v - dataMin) / (dataMax - dataMin)) * (W - 2 * PAD);
  const boxY = 20, boxH = 36;
  const lowerFence = fiveNum.q1 - 1.5 * fiveNum.iqr;
  const upperFence = fiveNum.q3 + 1.5 * fiveNum.iqr;
  const outliers = sortedData.filter((v) => v < lowerFence || v > upperFence);

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Build a Box Plot
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Find each part of the five-number summary to construct the box-and-whisker plot.
      </p>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      {/* Sorted data display */}
      <div style={{ marginBottom: 12, background: '#f0f9ff', borderRadius: 10, border: '1px solid #bae6fd', padding: '8px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>Sorted Data ({sortedData.length} values):</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {sortedData.map((v, i) => (
            <span key={i} style={{ padding: '2px 8px', borderRadius: 6, background: '#fff', border: '1px solid #bae6fd', fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Input for current step */}
      {!isDone && (
        <div style={{ marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLOR.text, marginBottom: 6 }}>
            Step {stepIdx + 1}/5: Find the <span style={{ color: COLOR.purple }}>{FIVE_NUM_LABELS[currentKey]}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
            <input type="number" value={input} onChange={(e) => { setInput(e.target.value); setFeedback(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              style={{ width: 80, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${COLOR.border}`, fontSize: 16, fontWeight: 700, textAlign: 'center' }}
              placeholder="?" />
            <button type="button" onClick={handleSubmit} style={{ ...BTN_PRIMARY, padding: '8px 18px' }}>Check</button>
          </div>
          {feedback && <p style={{ margin: '6px 0 0', fontSize: 12, color: feedback.startsWith('Not') ? '#dc2626' : COLOR.green, fontWeight: 600 }}>{feedback}</p>}
        </div>
      )}

      {/* Five-number summary progress */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {FIVE_NUM_STEPS.map((key, i) => (
          <div key={key} style={{
            padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: answers[key] != null ? COLOR.greenLight : i === stepIdx ? '#eff6ff' : '#f3f4f6',
            border: answers[key] != null ? `1px solid ${COLOR.greenBorder}` : i === stepIdx ? '1px solid #93c5fd' : `1px solid ${COLOR.border}`,
            color: answers[key] != null ? COLOR.green : i === stepIdx ? COLOR.blue : COLOR.textSecondary,
          }}>
            {FIVE_NUM_LABELS[key]}: {answers[key] != null ? answers[key] : '?'}
          </div>
        ))}
      </div>

      {/* Box plot SVG */}
      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: '8px', marginBottom: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <line x1={PAD} y1={boxY + boxH / 2} x2={W - PAD} y2={boxY + boxH / 2} stroke="#e5e7eb" strokeWidth={1} />
          {/* tick marks */}
          {Array.from({ length: 6 }, (_, i) => {
            const v = dataMin + ((dataMax - dataMin) / 5) * i;
            return <g key={i}>
              <line x1={sx(v)} y1={boxY + boxH + 2} x2={sx(v)} y2={boxY + boxH + 6} stroke="#9ca3af" strokeWidth={1} />
              <text x={sx(v)} y={boxY + boxH + 16} fontSize={8} fill="#6b7280" textAnchor="middle">{Math.round(v)}</text>
            </g>;
          })}
          {isDone && <>
            {/* whiskers */}
            <line x1={sx(fiveNum.min)} y1={boxY + boxH / 2} x2={sx(fiveNum.q1)} y2={boxY + boxH / 2} stroke="#2563eb" strokeWidth={2} />
            <line x1={sx(fiveNum.q3)} y1={boxY + boxH / 2} x2={sx(fiveNum.max)} y2={boxY + boxH / 2} stroke="#2563eb" strokeWidth={2} />
            <line x1={sx(fiveNum.min)} y1={boxY + 6} x2={sx(fiveNum.min)} y2={boxY + boxH - 6} stroke="#2563eb" strokeWidth={2} />
            <line x1={sx(fiveNum.max)} y1={boxY + 6} x2={sx(fiveNum.max)} y2={boxY + boxH - 6} stroke="#2563eb" strokeWidth={2} />
            {/* box */}
            <rect x={sx(fiveNum.q1)} y={boxY} width={sx(fiveNum.q3) - sx(fiveNum.q1)} height={boxH} rx={4}
              fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth={2} />
            {/* median line */}
            <line x1={sx(fiveNum.median)} y1={boxY} x2={sx(fiveNum.median)} y2={boxY + boxH} stroke="#dc2626" strokeWidth={2.5} />
            {/* outliers */}
            {outliers.map((v, i) => (
              <circle key={i} cx={sx(v)} cy={boxY + boxH / 2} r={4} fill="none" stroke="#d97706" strokeWidth={2} />
            ))}
            {/* labels */}
            <text x={sx(fiveNum.min)} y={boxY - 4} fontSize={8} fill="#1e40af" textAnchor="middle" fontWeight={700}>{fiveNum.min}</text>
            <text x={sx(fiveNum.q1)} y={boxY - 4} fontSize={8} fill="#1e40af" textAnchor="middle" fontWeight={700}>Q1={fiveNum.q1}</text>
            <text x={sx(fiveNum.median)} y={boxY - 4} fontSize={8} fill="#dc2626" textAnchor="middle" fontWeight={700}>Med={fiveNum.median}</text>
            <text x={sx(fiveNum.q3)} y={boxY - 4} fontSize={8} fill="#1e40af" textAnchor="middle" fontWeight={700}>Q3={fiveNum.q3}</text>
            <text x={sx(fiveNum.max)} y={boxY - 4} fontSize={8} fill="#1e40af" textAnchor="middle" fontWeight={700}>{fiveNum.max}</text>
          </>}
          {/* partial build: show pieces as they're answered */}
          {!isDone && Object.keys(answers).map((key) => {
            const v = answers[key];
            const c = key === 'median' ? '#dc2626' : '#2563eb';
            return <g key={key}>
              <line x1={sx(v)} y1={boxY + 4} x2={sx(v)} y2={boxY + boxH - 4} stroke={c} strokeWidth={2} />
              <text x={sx(v)} y={boxY - 4} fontSize={8} fill={c} textAnchor="middle" fontWeight={700}>{key === 'median' ? 'Med' : key.toUpperCase()}={v}</text>
            </g>;
          })}
        </svg>
      </div>

      {isDone && (
        <div style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 12, background: COLOR.greenLight, border: `1px solid ${COLOR.greenBorder}` }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: COLOR.green, textAlign: 'center' }}>
            {'\u2713'} Box plot complete!
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.6, textAlign: 'center' }}>
            <strong>IQR</strong> = Q3 {'\u2212'} Q1 = {fiveNum.q3} {'\u2212'} {fiveNum.q1} = <strong>{roundTo(fiveNum.iqr, 1)}</strong>.<br />
            The <strong>box</strong> contains the middle 50% of the data. The <strong>whiskers</strong> extend to min and max.<br />
            Outlier fences: below {roundTo(lowerFence, 1)} or above {roundTo(upperFence, 1)} (1.5{'\u00D7'}IQR from box).
            {outliers.length > 0
              ? <><br />Outliers detected: {outliers.join(', ')}</>
              : <><br />No outliers in this data set.</>}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setRound((r) => r + 1)} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} New Data
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE 6 — Bell Curve Explorer
   Adjust mean & standard deviation to see how the normal distribution
   changes. Visualizes the 68-95-99.7 rule (Empirical Rule).
   ═══════════════════════════════════════════════════════════════════════════ */
function normalPDF(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

function getBellQBotMsg(showRule, sd) {
  if (!showRule) return { msg: 'Use the sliders to change the mean (center) and standard deviation (spread). Watch how the bell curve reshapes!', mood: 'wave' };
  if (sd <= 3) return { msg: 'Small standard deviation \u2014 the data is tightly clustered around the mean. Almost all values fall within a narrow range.', mood: 'think' };
  if (sd >= 8) return { msg: 'Large standard deviation \u2014 the data is spread out. The curve is wider and flatter.', mood: 'think' };
  return { msg: 'The 68-95-99.7 rule: about 68% of data falls within 1 SD of the mean, 95% within 2 SDs, and 99.7% within 3 SDs. This is the Empirical Rule!', mood: 'celebrate' };
}

function BellCurveExplorer({ onComplete, continueLabel, badgeLabel, embedded }) {
  const [mean, setMean] = useState(50);
  const [sd, setSd] = useState(5);
  const [showRule, setShowRule] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const qbot = useMemo(() => getBellQBotMsg(showRule, sd), [showRule, sd]);

  const W = 360, H = 180, PAD = 30;
  const xMin = 20, xMax = 80;
  const yMax = normalPDF(mean, mean, sd) * 1.15;
  const sx = (v) => PAD + ((v - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const sy = (v) => H - PAD - (v / yMax) * (H - 2 * PAD);

  const curvePts = useMemo(() => {
    const pts = [];
    for (let x = xMin; x <= xMax; x += 0.5) {
      pts.push({ x, y: normalPDF(x, mean, sd) });
    }
    return pts;
  }, [mean, sd]);

  const curvePath = curvePts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const fillPath = `${curvePath} L${sx(xMax).toFixed(1)},${sy(0).toFixed(1)} L${sx(xMin).toFixed(1)},${sy(0).toFixed(1)} Z`;

  const sdBands = [
    { label: '68%', from: mean - sd, to: mean + sd, color: 'rgba(37,99,235,0.2)', border: '#93c5fd' },
    { label: '95%', from: mean - 2 * sd, to: mean + 2 * sd, color: 'rgba(124,58,237,0.1)', border: '#c4b5fd' },
    { label: '99.7%', from: mean - 3 * sd, to: mean + 3 * sd, color: 'rgba(234,179,8,0.08)', border: '#fde68a' },
  ];

  return (
    <div style={embedded ? {} : CARD}>
      {!embedded && (
        <div style={{ ...BADGE, background: `${COLOR.purple}14`, color: COLOR.purple }}>{badgeLabel}</div>
      )}
      <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: COLOR.text }}>
        Normal Distribution Explorer
      </p>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: COLOR.textSecondary }}>
        Adjust the mean and standard deviation to see how the bell curve changes.
        <button type="button" onClick={() => setShowHelp((p) => !p)} style={{ background: 'none', border: 'none', color: COLOR.blue, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 13, marginLeft: 6, textDecoration: 'underline', textUnderlineOffset: 2 }}>
          {showHelp ? 'Hide' : 'What is this?'}
        </button>
      </p>

      <QBotBubble message={qbot.msg} mood={qbot.mood} />

      {showHelp && (
        <div style={{ marginBottom: 12, background: '#faf5ff', borderRadius: 14, border: '1px solid #ddd6fe', padding: '12px 16px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#4c1d95' }}>The Normal (Bell) Curve</p>
          <p style={{ margin: 0, fontSize: 12, color: COLOR.textSecondary, lineHeight: 1.6 }}>
            Many natural phenomena (test scores, heights, measurement errors) follow a <strong>normal distribution</strong>.<br />
            <strong>Mean ({'\u03BC'})</strong> = center of the curve. <strong>Standard Deviation ({'\u03C3'})</strong> = how spread out the data is.<br />
            <strong>68-95-99.7 Rule:</strong> ~68% within 1{'\u03C3'}, ~95% within 2{'\u03C3'}, ~99.7% within 3{'\u03C3'} of the mean.<br />
            A smaller {'\u03C3'} = taller, narrower curve. A larger {'\u03C3'} = shorter, wider curve.
          </p>
        </div>
      )}

      {/* SVG bell curve */}
      <div style={{ background: '#f8fafc', borderRadius: 14, border: `1px solid ${COLOR.border}`, padding: '8px', marginBottom: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {/* x-axis */}
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d1d5db" strokeWidth={1.5} />
          {Array.from({ length: 7 }, (_, i) => {
            const v = xMin + ((xMax - xMin) / 6) * i;
            return <g key={i}>
              <line x1={sx(v)} y1={H - PAD} x2={sx(v)} y2={H - PAD + 4} stroke="#9ca3af" strokeWidth={1} />
              <text x={sx(v)} y={H - PAD + 14} fontSize={8} fill="#6b7280" textAnchor="middle">{Math.round(v)}</text>
            </g>;
          })}
          {/* SD bands */}
          {showRule && sdBands.slice().reverse().map((band, i) => {
            const x1 = Math.max(xMin, band.from), x2 = Math.min(xMax, band.to);
            if (x1 >= x2) return null;
            return <g key={i}>
              <rect x={sx(x1)} y={PAD} width={sx(x2) - sx(x1)} height={H - 2 * PAD} fill={band.color} />
              <line x1={sx(x1)} y1={PAD} x2={sx(x1)} y2={H - PAD} stroke={band.border} strokeWidth={1} strokeDasharray="3 2" />
              <line x1={sx(x2)} y1={PAD} x2={sx(x2)} y2={H - PAD} stroke={band.border} strokeWidth={1} strokeDasharray="3 2" />
              <text x={(sx(x1) + sx(x2)) / 2} y={H - PAD - 6} fontSize={9} fill={i === 2 ? '#2563eb' : i === 1 ? '#7c3aed' : '#b45309'} textAnchor="middle" fontWeight={700}>{band.label}</text>
            </g>;
          })}
          {/* curve fill */}
          <path d={fillPath} fill="rgba(37,99,235,0.12)" />
          {/* curve line */}
          <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2.5} />
          {/* mean line */}
          <line x1={sx(mean)} y1={PAD} x2={sx(mean)} y2={H - PAD} stroke="#dc2626" strokeWidth={1.5} strokeDasharray="4 2" />
          <text x={sx(mean)} y={PAD - 4} fontSize={9} fill="#dc2626" textAnchor="middle" fontWeight={700}>{'\u03BC'}={mean}</text>
        </svg>
      </div>

      {/* Sliders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: COLOR.text, display: 'block', marginBottom: 4 }}>
            Mean ({'\u03BC'}): <span style={{ color: '#dc2626' }}>{mean}</span>
          </label>
          <input type="range" min={30} max={70} value={mean} onChange={(e) => setMean(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#dc2626' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: COLOR.text, display: 'block', marginBottom: 4 }}>
            Std Dev ({'\u03C3'}): <span style={{ color: COLOR.purple }}>{sd}</span>
          </label>
          <input type="range" min={1} max={12} value={sd} onChange={(e) => setSd(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#7c3aed' }} />
        </div>
      </div>

      {/* SD bands toggle */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => setShowRule((p) => !p)}
          style={{ padding: '6px 14px', borderRadius: 10, background: showRule ? '#eff6ff' : '#f3f4f6', border: `1px solid ${showRule ? '#93c5fd' : COLOR.border}`, fontSize: 12, fontWeight: 700, color: showRule ? COLOR.blue : COLOR.textSecondary, cursor: 'pointer' }}>
          {showRule ? '\u2713 68-95-99.7 Rule' : 'Show 68-95-99.7 Rule'}
        </button>
      </div>

      {/* Key stats */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ padding: '6px 12px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>
          {'\u03BC'} = {mean}
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 10, background: '#f5f3ff', border: '1px solid #c4b5fd', fontSize: 12, fontWeight: 700, color: COLOR.purple }}>
          {'\u03C3'} = {sd}
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 10, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 12, fontWeight: 600, color: COLOR.blue }}>
          68%: [{mean - sd}, {mean + sd}]
        </div>
        <div style={{ padding: '6px 12px', borderRadius: 10, background: '#f5f3ff', border: '1px solid #c4b5fd', fontSize: 12, fontWeight: 600, color: COLOR.purple }}>
          95%: [{mean - 2 * sd}, {mean + 2 * sd}]
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => { setMean(50); setSd(5); setShowRule(true); }} style={{ ...BTN_PRIMARY, background: 'linear-gradient(135deg,#d97706,#b45309)', flex: '0 0 auto' }}>
          {'\u{1F504}'} Reset
        </button>
        <button type="button" onClick={onComplete} style={{ ...BTN_PRIMARY, flex: '1 1 auto' }}>{continueLabel}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main export — rotates mode by activityIndex
   ═══════════════════════════════════════════════════════════════════════════ */
const MODES = ['mean-builder', 'median-sorter', 'box-plot', 'bell-curve', 'line-fit', 'prob-sim'];

export default function StatsExplorer({ activityIndex = 0, onComplete, continueLabel = 'Continue', badgeLabel = 'Interactive activity', embedded = false }) {
  const mode = MODES[activityIndex % MODES.length];
  if (mode === 'mean-builder') return <MeanBuilder onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'median-sorter') return <MedianSorter onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'box-plot') return <BoxPlotBuilder onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'bell-curve') return <BellCurveExplorer onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  if (mode === 'line-fit') return <LineFit onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
  return <ProbSim onComplete={onComplete} continueLabel={continueLabel} badgeLabel={badgeLabel} embedded={embedded} />;
}
