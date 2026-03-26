import React, { useState, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   SHAPE SHIFTER — Geometry game
   Classify 2D/3D shapes, identify quadrilaterals, calculate area
   TEKS 3.6A, 3.6B, 3.6C
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  correct: () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 80); setTimeout(() => tone(784, 0.15), 160); },
  wrong: () => tone(200, 0.3, 'sawtooth', 0.06),
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 90)); },
  pop: () => tone(600, 0.06, 'sine', 0.08),
};

const pick = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const COLORS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#c084fc', '#fb923c'];

/* ── Shape definitions ── */
const SHAPES_2D = [
  { name: 'Triangle', sides: 3, attrs: ['3 sides', '3 angles'], svg: (s, c) => <polygon points={`${s/2},4 4,${s-4} ${s-4},${s-4}`} fill={c} stroke="#fff" strokeWidth={2} /> },
  { name: 'Square', sides: 4, attrs: ['4 equal sides', '4 right angles'], isQuad: true, svg: (s, c) => <rect x={6} y={6} width={s-12} height={s-12} fill={c} stroke="#fff" strokeWidth={2} /> },
  { name: 'Rectangle', sides: 4, attrs: ['4 sides', '2 pairs of equal sides', '4 right angles'], isQuad: true, svg: (s, c) => <rect x={4} y={s*0.2} width={s-8} height={s*0.6} fill={c} stroke="#fff" strokeWidth={2} rx={1} /> },
  { name: 'Rhombus', sides: 4, attrs: ['4 equal sides', 'opposite angles equal'], isQuad: true, svg: (s, c) => <polygon points={`${s/2},6 ${s-6},${s/2} ${s/2},${s-6} 6,${s/2}`} fill={c} stroke="#fff" strokeWidth={2} /> },
  { name: 'Parallelogram', sides: 4, attrs: ['4 sides', '2 pairs of parallel sides', 'opposite sides equal'], isQuad: true, svg: (s, c) => <polygon points={`${s*0.25},${s*0.25} ${s-6},${s*0.25} ${s*0.75},${s*0.75} 6,${s*0.75}`} fill={c} stroke="#fff" strokeWidth={2} /> },
  { name: 'Trapezoid', sides: 4, attrs: ['4 sides', 'exactly 1 pair of parallel sides'], isQuad: true, svg: (s, c) => <polygon points={`${s*0.3},${s*0.25} ${s*0.7},${s*0.25} ${s-6},${s*0.75} 6,${s*0.75}`} fill={c} stroke="#fff" strokeWidth={2} /> },
  { name: 'Pentagon', sides: 5, attrs: ['5 sides', '5 angles'], svg: (s, c) => { const pts = Array.from({length:5},(_,i)=>{const a=Math.PI*2*i/5-Math.PI/2;return `${s/2+s*0.42*Math.cos(a)},${s/2+s*0.42*Math.sin(a)}`;}).join(' '); return <polygon points={pts} fill={c} stroke="#fff" strokeWidth={2} />; } },
  { name: 'Hexagon', sides: 6, attrs: ['6 sides', '6 angles'], svg: (s, c) => { const pts = Array.from({length:6},(_,i)=>{const a=Math.PI*2*i/6-Math.PI/6;return `${s/2+s*0.42*Math.cos(a)},${s/2+s*0.42*Math.sin(a)}`;}).join(' '); return <polygon points={pts} fill={c} stroke="#fff" strokeWidth={2} />; } },
  { name: 'Circle', sides: 0, attrs: ['no sides', 'no angles', 'round'], svg: (s, c) => <circle cx={s/2} cy={s/2} r={s*0.42} fill={c} stroke="#fff" strokeWidth={2} /> },
];

const SHAPES_3D = [
  { name: 'Cube', faces: 6, edges: 12, vertices: 8, attrs: ['6 square faces', '12 edges', '8 vertices'] },
  { name: 'Rectangular Prism', faces: 6, edges: 12, vertices: 8, attrs: ['6 rectangular faces', '12 edges', '8 vertices'] },
  { name: 'Sphere', faces: 0, edges: 0, vertices: 0, attrs: ['no faces', 'no edges', 'no vertices', 'round'] },
  { name: 'Cone', faces: 1, edges: 1, vertices: 1, attrs: ['1 flat face (circle)', '1 curved surface', '1 vertex'] },
  { name: 'Cylinder', faces: 2, edges: 2, vertices: 0, attrs: ['2 flat faces (circles)', '1 curved surface', '0 vertices'] },
  { name: 'Triangular Prism', faces: 5, edges: 9, vertices: 6, attrs: ['2 triangular faces', '3 rectangular faces', '9 edges'] },
];

const SHAPE_3D_EMOJI = { Cube: '🧊', 'Rectangular Prism': '📦', Sphere: '🔮', Cone: '🍦', Cylinder: '🥫', 'Triangular Prism': '🔺' };

const DIFFICULTY = {
  easy:   { label: 'Shape Spotter', emoji: '🌱', rounds: 8, types: ['identify', 'count_sides', 'quad_or_not'] },
  medium: { label: 'Geo Analyst',   emoji: '🔥', rounds: 10, types: ['identify', 'count_sides', 'quad_or_not', 'name_quad', 'area', '3d_identify'] },
  hard:   { label: 'Shape Master',  emoji: '💎', rounds: 12, types: ['identify', 'count_sides', 'quad_or_not', 'name_quad', 'area', '3d_identify', '3d_attrs', 'classify'] },
};

const QBOT = {
  start: ["Let's explore shapes! 🔷🤖", "Shape Shifter mode activated! Can you identify them all? 🔶", "Geometry time with QBot! 📐"],
  correct: ["Correct classification using shape properties. 🔷", "Correct - side/angle attributes match. ⭐", "Nice geometry solve - properties identified accurately. 📐", "QBot confirms your geometric reasoning. 🤖✅"],
  wrong: ["Not correct yet - verify side count and angle properties. 🔍", "Close - recount sides/vertices carefully. 📐", "Re-check the defining attributes before answering. 💪"],
  win: ["Shape mastery achieved with solid geometric reasoning. 🏆📐", "You completed geometry challenges with strong evidence. 🌟", "Shape set complete - keep applying property-based classification. 🤖🎉"],
};

function genNumericOptions(correct, max) {
  const opts = new Set([correct]);
  let tries = 0;
  while (opts.size < 4 && tries < 50) {
    const v = correct + pick([-3, -2, -1, 1, 2, 3, 4, 5]);
    if (v >= 0 && v <= (max || 100)) opts.add(v);
    tries++;
  }
  while (opts.size < 4) opts.add(correct + opts.size);
  return shuffle([...opts]);
}

function generateQuestion(diff) {
  const qType = pick(diff.types);

  switch (qType) {
    case 'identify': {
      const shape = pick(SHAPES_2D);
      const color = pick(COLORS);
      const size = 90;
      return {
        type: 'identify', prompt: 'What is this shape called?',
        visual: <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>{shape.svg(size, color)}</svg>,
        correctAnswer: shape.name,
        options: shuffle([shape.name, ...shuffle(SHAPES_2D.filter(s => s.name !== shape.name).map(s => s.name)).slice(0, 3)]),
        explanation: `This shape is a ${shape.name}. It has ${shape.attrs.join(', ')}.`,
      };
    }
    case 'count_sides': {
      const shape = pick(SHAPES_2D.filter(s => s.sides > 0));
      const color = pick(COLORS);
      const size = 90;
      return {
        type: 'count_sides', prompt: `How many sides does this shape have?`,
        visual: <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>{shape.svg(size, color)}</svg>,
        correctAnswer: shape.sides,
        options: genNumericOptions(shape.sides, 8).map(String),
        shapeName: shape.name,
        explanation: `A ${shape.name} has ${shape.sides} sides.`,
      };
    }
    case 'quad_or_not': {
      const shape = pick(SHAPES_2D);
      const color = pick(COLORS);
      const size = 90;
      const isQuad = !!shape.isQuad;
      return {
        type: 'quad_or_not', prompt: `Is this shape a quadrilateral?`,
        visual: <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>{shape.svg(size, color)}</svg>,
        correctAnswer: isQuad ? 'Yes' : 'No',
        options: ['Yes', 'No'],
        shapeName: shape.name,
        explanation: isQuad
          ? `Yes! A ${shape.name} has 4 sides, so it IS a quadrilateral.`
          : `No. A ${shape.name} has ${shape.sides === 0 ? 'no straight sides' : shape.sides + ' sides'}, so it is NOT a quadrilateral (which needs exactly 4 sides).`,
      };
    }
    case 'name_quad': {
      const quads = SHAPES_2D.filter(s => s.isQuad);
      const shape = pick(quads);
      const clue = pick(shape.attrs);
      return {
        type: 'name_quad', prompt: `Which quadrilateral has: ${shape.attrs.join(', ')}?`,
        visual: null,
        correctAnswer: shape.name,
        options: shuffle(quads.map(q => q.name)).slice(0, 4).includes(shape.name)
          ? shuffle(quads.map(q => q.name)).slice(0, 4)
          : shuffle([shape.name, ...shuffle(quads.filter(q => q.name !== shape.name).map(q => q.name)).slice(0, 3)]),
        explanation: `A ${shape.name} has: ${shape.attrs.join(', ')}.`,
      };
    }
    case 'area': {
      const w = randInt(2, 10);
      const h = randInt(2, 10);
      const area = w * h;
      const size = 120;
      const maxDim = Math.max(w, h);
      const scale = Math.min(10, Math.floor((size - 20) / maxDim));
      const rw = w * scale, rh = h * scale;
      const ox = (size - rw) / 2, oy = (size - rh) / 2;
      return {
        type: 'area',
        prompt: `What is the area of this rectangle?`,
        visual: (
          <svg width={size} height={size + 20} style={{ display: 'block', margin: '0 auto' }}>
            <rect x={ox} y={oy} width={rw} height={rh} fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth={2} rx={2} />
            {/* Grid lines */}
            {Array.from({ length: w - 1 }, (_, i) => (
              <line key={`v${i}`} x1={ox + (i + 1) * scale} y1={oy} x2={ox + (i + 1) * scale} y2={oy + rh} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: h - 1 }, (_, i) => (
              <line key={`h${i}`} x1={ox} y1={oy + (i + 1) * scale} x2={ox + rw} y2={oy + (i + 1) * scale} stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
            ))}
            <text x={ox + rw / 2} y={oy + rh + 14} fill="#e2e8f0" fontSize={11} fontWeight={700} textAnchor="middle">{w} units</text>
            <text x={ox - 8} y={oy + rh / 2 + 4} fill="#e2e8f0" fontSize={11} fontWeight={700} textAnchor="end" transform={`rotate(-90, ${ox - 8}, ${oy + rh / 2 + 4})`}>{h} units</text>
          </svg>
        ),
        correctAnswer: area,
        options: genNumericOptions(area, 120).map(String),
        explanation: `Area = length × width = ${w} × ${h} = ${area} square units.`,
      };
    }
    case '3d_identify': {
      const shape = pick(SHAPES_3D);
      return {
        type: '3d_identify',
        prompt: `Which 3D shape has: ${shape.attrs.slice(0, 2).join(', ')}?`,
        visual: <div style={{ fontSize: 56, textAlign: 'center' }}>{SHAPE_3D_EMOJI[shape.name] || '🔷'}</div>,
        correctAnswer: shape.name,
        options: shuffle([shape.name, ...shuffle(SHAPES_3D.filter(s => s.name !== shape.name).map(s => s.name)).slice(0, 3)]),
        explanation: `A ${shape.name} has: ${shape.attrs.join(', ')}.`,
      };
    }
    case '3d_attrs': {
      const shape = pick(SHAPES_3D);
      const attrType = pick(['faces', 'edges', 'vertices']);
      const val = shape[attrType];
      return {
        type: '3d_attrs',
        prompt: `How many ${attrType} does a ${shape.name} have?`,
        visual: <div style={{ fontSize: 56, textAlign: 'center' }}>{SHAPE_3D_EMOJI[shape.name] || '🔷'}</div>,
        correctAnswer: val,
        options: genNumericOptions(val, 14).map(String),
        explanation: `A ${shape.name} has ${shape.faces} faces, ${shape.edges} edges, and ${shape.vertices} vertices.`,
      };
    }
    case 'classify': {
      const is2D = Math.random() > 0.5;
      if (is2D) {
        const shape = pick(SHAPES_2D);
        const color = pick(COLORS);
        const size = 90;
        return {
          type: 'classify', prompt: `Is this a 2D or 3D shape?`,
          visual: <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>{shape.svg(size, color)}</svg>,
          correctAnswer: '2D',
          options: ['2D', '3D'],
          explanation: `A ${shape.name} is a 2D (flat) shape — it has length and width but no depth.`,
        };
      } else {
        const shape = pick(SHAPES_3D);
        return {
          type: 'classify', prompt: `Is this a 2D or 3D shape?`,
          visual: <div style={{ fontSize: 56, textAlign: 'center' }}>{SHAPE_3D_EMOJI[shape.name] || '🔷'}<div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{shape.name}</div></div>,
          correctAnswer: '3D',
          options: ['2D', '3D'],
          explanation: `A ${shape.name} is a 3D shape — it has length, width, AND depth.`,
        };
      }
    }
    default: {
      return generateQuestion({ ...diff, types: ['identify'] });
    }
  }
}

/* ── Main Component ── */
export default function ShapeShifter() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');

  const [difficulty, setDifficulty] = useState(null);
  const [diff, setDiff] = useState(null);
  const [question, setQuestion] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT.start));
  const [showHowTo, setShowHowTo] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const lockRef = useRef(false);

  const newRound = useCallback((d) => {
    const q = generateQuestion(d);
    setQuestion(q);
    setSelectedOpt(null);
    setFeedback(null);
    lockRef.current = false;
    SFX.pop();
  }, []);

  const startGame = useCallback((level) => {
    const d = DIFFICULTY[level];
    setDifficulty(level);
    setDiff(d);
    setRoundIdx(0);
    setScore(0);
    setTotalRounds(d.rounds);
    setGameOver(false);
    setHistory([]);
    setStreak(0);
    setQbotMsg(pick(QBOT.start));
    newRound(d);
  }, [newRound]);

  const submitAnswer = useCallback((answer) => {
    if (lockRef.current || !question) return;
    lockRef.current = true;
    setSelectedOpt(answer);
    const correct = String(answer) === String(question.correctAnswer);

    if (correct) {
      SFX.correct();
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ correct: true, msg: question.explanation });
      setQbotMsg(pick(QBOT.correct));
    } else {
      SFX.wrong();
      setStreak(0);
      setFeedback({ correct: false, msg: question.explanation });
      setQbotMsg(pick(QBOT.wrong));
    }

    setHistory(prev => [...prev, {
      question: question.prompt,
      correctAnswer: String(question.correctAnswer),
      studentAnswer: String(answer),
      correct,
    }]);

    setTimeout(() => {
      const nextIdx = roundIdx + 1;
      if (nextIdx >= totalRounds) {
        setGameOver(true);
        setQbotMsg(pick(QBOT.win));
        SFX.win();
        saveGameResult({ gameName: 'Shape Shifter', score: score + (correct ? 1 : 0), total: totalRounds, assignmentId, classId });
      } else {
        setRoundIdx(nextIdx);
        newRound(diff);
      }
    }, 2400);
  }, [question, roundIdx, totalRounds, score, diff, assignmentId, classId, newRound]);

  if (showReview) return <GameReview gameName="Shape Shifter" results={history} onBack={() => setShowReview(false)} />;

  /* ── Difficulty select ── */
  if (!difficulty) {
    return (
      <div style={pageStyle}>
        <Link to="/games" style={backLink}>← Games</Link>
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 4, textAlign: 'center', marginTop: 8 }}>🔷 Shape Shifter</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center', maxWidth: 360 }}>
          Classify shapes, recognize quadrilaterals & calculate area!
        </div>
        <QBotBubble msg="Welcome to Shape Shifter! Let's see if you can identify shapes by their properties! 🤖🔷" />
        <div style={{ maxWidth: 400, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>How It Works</div>
          <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>🔷 QBot shows you a <strong style={{ color: '#60a5fa' }}>shape</strong> or describes its properties.</div>
            <div style={{ marginBottom: 8 }}>📐 Identify shapes, count sides, check if it's a <strong style={{ color: '#fbbf24' }}>quadrilateral</strong>, and calculate <strong style={{ color: '#34d399' }}>area</strong>!</div>
            <div style={{ marginBottom: 8 }}>🧊 Harder levels add <strong style={{ color: '#c084fc' }}>3D shapes</strong> — cubes, spheres, cones and more!</div>
            <div>⭐ Pick the correct answer and build your score!</div>
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>Choose Your Level</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460, width: '100%' }}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <button type="button" key={key} onPointerUp={() => startGame(key)} style={{ ...btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)'), minWidth: 130, padding: '14px 16px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 4, flex: '1 1 auto' }}>
              <div style={{ fontSize: 26 }}>{d.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{d.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'center', lineHeight: 1.3 }}>
                {key === 'easy' && '2D shapes, sides, quads'}
                {key === 'medium' && '+ Area & 3D shapes'}
                {key === 'hard' && 'All types + classify'}
              </div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>{d.rounds} questions</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : 1;

  return (
    <div style={{ ...pageStyle, padding: '10px 12px 24px' }}>
      {showHowTo && (
        <div style={overlayBg}>
          <div style={overlayBox}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, textAlign: 'center' }}>🔷 How to Play</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>1. Study the shape or description.</div>
              <div style={{ marginBottom: 8 }}>2. Read QBot's question carefully.</div>
              <div style={{ marginBottom: 8 }}>3. Count sides, look at angles and attributes.</div>
              <div>4. Pick the correct answer!</div>
            </div>
            <button type="button" onPointerUp={() => setShowHowTo(false)} style={{ ...btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)'), width: '100%', marginTop: 16 }}>Got it!</button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Link to="/games" style={backLink}>← Games</Link>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>🔷 Shape Shifter</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{diff.emoji} {diff.label}</span>
          <button type="button" onPointerUp={() => setShowHowTo(true)} style={helpBtn}>?</button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 500, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>
          <span>Question {roundIdx + 1} / {totalRounds}</span>
          <span>Score: {score}</span>
          {streak >= 2 && <span style={{ color: '#f59e0b' }}>🔥 {streak} streak</span>}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${((roundIdx + (feedback ? 1 : 0)) / totalRounds) * 100}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ maxWidth: 500, width: '100%', marginBottom: 8 }}><QBotBubble msg={qbotMsg} /></div>

      {question && (
        <>
          {question.visual && (
            <div style={{ maxWidth: 500, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px 8px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center' }}>
              {question.visual}
            </div>
          )}

          <div style={{ maxWidth: 500, width: '100%', background: 'rgba(124,58,237,0.08)', borderRadius: 14, padding: '12px 16px', marginBottom: 12, border: '1px solid rgba(124,58,237,0.15)', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.5 }}>{question.prompt}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: question.options.length <= 2 ? '1fr 1fr' : '1fr 1fr', gap: 10, maxWidth: 400, width: '100%' }}>
            {question.options.map((opt, i) => {
              const isCorrect = String(opt) === String(question.correctAnswer);
              const isSelected = selectedOpt === opt;
              let bg, border, color;
              if (feedback) {
                if (isCorrect) { bg = 'rgba(34,197,94,0.2)'; border = '2px solid #22c55e'; color = '#22c55e'; }
                else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid #ef4444'; color = '#ef4444'; }
                else { bg = 'rgba(255,255,255,0.03)'; border = '1px solid rgba(255,255,255,0.06)'; color = '#64748b'; }
              } else { bg = 'rgba(124,58,237,0.08)'; border = '1px solid rgba(124,58,237,0.2)'; color = '#e2e8f0'; }
              return (
                <button type="button" key={i} onPointerUp={() => !feedback && submitAnswer(opt)} disabled={!!feedback}
                  style={{ padding: '14px 16px', minHeight: 52, borderRadius: 12, cursor: feedback ? 'default' : 'pointer', fontSize: 14, fontWeight: 800, textAlign: 'center', background: bg, border, color, WebkitTapHighlightColor: 'transparent', transition: 'all 0.2s ease' }}>
                  {opt}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div style={{ maxWidth: 500, width: '100%', padding: '10px 16px', borderRadius: 12, marginTop: 12, background: feedback.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${feedback.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, textAlign: 'center', fontSize: 12, fontWeight: 700, color: feedback.correct ? '#22c55e' : '#ef4444', lineHeight: 1.5, animation: 'fadeIn 0.3s ease' }}>
              {feedback.correct ? '✓ ' : '✗ '}{feedback.msg}
            </div>
          )}
        </>
      )}

      {gameOver && (
        <div style={overlayBg}>
          <div style={{ ...overlayBox, maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🔷</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score === totalRounds ? 'Shape Mastery!' : score >= totalRounds * 0.7 ? 'Strong Geometry Reasoning' : 'Geometry Skills Building'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1, 2, 3].map(s => <span key={s} style={{ fontSize: 28, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{score}</div><div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>CORRECT</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{totalRounds - score}</div><div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>MISSED</div></div>
            </div>
            <QBotBubble msg={qbotMsg} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button type="button" onPointerUp={() => startGame(difficulty)} style={btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)')}>Play Again</button>
              <button type="button" onPointerUp={() => setDifficulty(null)} style={btnStyle('linear-gradient(135deg,#475569,#334155)')}>Change Level</button>
              <button type="button" onPointerUp={() => setShowReview(true)} style={btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)')}>Review Solutions</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        button:active { transform: scale(0.96); opacity: 0.85; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(124,58,237,0.06)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(124,58,237,0.12)' }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a8a,#1e1b4b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #7c3aed', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const pageStyle = { minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', overflowY: 'auto' };
const backLink = { position: 'absolute', top: 16, left: 16, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 };
function btnStyle(bg) { return { padding: '14px 22px', minHeight: 48, background: bg, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, WebkitTapHighlightColor: 'transparent' }; }
const helpBtn = { width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.1)', color: '#a78bfa', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const overlayBg = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' };
const overlayBox = { background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', border: '1px solid rgba(124,58,237,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' };
