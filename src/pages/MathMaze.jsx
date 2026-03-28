import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import qbotImg from '../assets/qbot.svg';
import useGameReturn from '../hooks/useGameReturn';

/* ═══════════════════════════════════════════════════════════
   MATH MAZE RUNNER — Visual grid maze with multiple levels
   Navigate through a real maze by solving math at locked doors.
   ═══════════════════════════════════════════════════════════ */

let _ac = null;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  step: () => tone(400, 0.04, 'triangle', 0.06),
  door: () => { tone(300, 0.08, 'square', 0.06); setTimeout(() => tone(500, 0.08, 'square', 0.06), 60); },
  correct: () => { tone(523, 0.1); setTimeout(() => tone(659, 0.1), 70); setTimeout(() => tone(784, 0.15), 140); },
  wrong: () => { tone(200, 0.2, 'sawtooth', 0.08); setTimeout(() => tone(160, 0.25, 'sawtooth', 0.06), 120); },
  key: () => { [800, 1000, 1200].forEach((f, i) => setTimeout(() => tone(f, 0.08, 'sine', 0.1), i * 50)); },
  exit: () => { [523, 659, 784, 880, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18), i * 80)); },
  levelUp: () => { [440, 554, 659, 880].forEach((f, i) => setTimeout(() => tone(f, 0.2, 'sine', 0.14), i * 100)); },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

/* ── Cell types ── */
const WALL = 0, PATH = 1, DOOR = 2, KEY = 3, START = 4, EXIT = 5, TRAP = 6, COIN = 7;
const CELL_SIZE = 44;

/* ── Maze generation (recursive backtracker) ── */
function generateMaze(w, h) {
  const grid = Array.from({ length: h }, () => Array(w).fill(WALL));
  const visited = Array.from({ length: h }, () => Array(w).fill(false));

  function carve(x, y) {
    visited[y][x] = true;
    grid[y][x] = PATH;
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < w && ny >= 0 && ny < h && !visited[ny][nx]) {
        grid[y + dy / 2][x + dx / 2] = PATH;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1);
  grid[1][1] = START;
  grid[h - 2][w - 2] = EXIT;
  return grid;
}

function addFeatures(grid, level) {
  const h = grid.length, w = grid[0].length;
  const pathCells = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (grid[y][x] === PATH && !(y === 1 && x === 1) && !(y === h - 2 && x === w - 2))
        pathCells.push([x, y]);

  const shuffled = pathCells.sort(() => Math.random() - 0.5);
  const doorCount = Math.min(3 + level, 7, shuffled.length);
  const coinCount = Math.min(2 + level, 5, shuffled.length - doorCount);
  const trapCount = Math.min(level, 3, shuffled.length - doorCount - coinCount);

  let idx = 0;
  for (let i = 0; i < doorCount && idx < shuffled.length; i++, idx++)
    grid[shuffled[idx][1]][shuffled[idx][0]] = DOOR;
  for (let i = 0; i < coinCount && idx < shuffled.length; i++, idx++)
    grid[shuffled[idx][1]][shuffled[idx][0]] = COIN;
  for (let i = 0; i < trapCount && idx < shuffled.length; i++, idx++)
    grid[shuffled[idx][1]][shuffled[idx][0]] = TRAP;

  return grid;
}

/* ── Question generator ── */
function genQuestion(level) {
  const diff = Math.min(level, 4);
  const gens = [
    () => { const a = randInt(10 * diff, 50 * diff), b = randInt(10, 30 * diff); return { q: `${a} + ${b}`, ans: a + b, teks: '3.4A' }; },
    () => { const a = randInt(30 * diff, 90 * diff), b = randInt(10, a - 1); return { q: `${a} − ${b}`, ans: a - b, teks: '3.4A' }; },
    () => { const a = randInt(2, 4 + diff), b = randInt(2, 4 + diff); return { q: `${a} × ${b}`, ans: a * b, teks: '3.4C' }; },
    () => { const b = randInt(2, 5 + diff), ans = randInt(2, 5 + diff); return { q: `${b * ans} ÷ ${b}`, ans, teks: '3.4D' }; },
  ];
  if (diff >= 2) gens.push(() => { const n = [2, 3, 4][randInt(0, 2)], d = randInt(2, 6) * n; return { q: `1/${n} of ${d}`, ans: d / n, teks: '3.3F' }; });
  const gen = gens[randInt(0, gens.length - 1)];
  const question = gen();
  const wrong1 = question.ans + randInt(1, 5);
  let wrong2 = question.ans - randInt(1, 5);
  if (wrong2 <= 0 || wrong2 === wrong1 || wrong2 === question.ans) wrong2 = question.ans + randInt(6, 12);
  let wrong3 = question.ans + randInt(2, 8);
  if (wrong3 === question.ans || wrong3 === wrong1 || wrong3 === wrong2) wrong3 = question.ans - randInt(2, 8);
  if (wrong3 <= 0) wrong3 = question.ans + randInt(10, 15);
  const choices = [question.ans, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
  return { ...question, choices };
}

const MAZE_SIZES = [
  { w: 9, h: 9 },
  { w: 11, h: 9 },
  { w: 11, h: 11 },
  { w: 13, h: 11 },
  { w: 13, h: 13 },
];

const QBOT_MSGS = {
  start: ["Let's navigate this maze! 🗺️", "Find the exit! QBot believes in you! 🤖", "Watch out for traps! ⚠️"],
  door: ["A locked door! Solve to pass! 🔒", "Math is the key! 🔑", "Think carefully! 🧠"],
  correct: ["Door unlocked - your equation result is correct. 🎉", "Correct solve - arithmetic checks out. 💫", "Path cleared by accurate computation. ✨"],
  wrong: ["Incorrect result - recompute the expression carefully. 🔒", "Incorrect - check operation order and signs. 💪", "Door stays locked - verify each step before answering. 🤔"],
  coin: ["Bonus coins! Nice find! 💰", "Treasure collected! 🪙", "Cha-ching! +50 points! 💎"],
  trap: ["Oh no, a trap! −25 points! 💀", "Watch your step! ⚡", "Trap sprung! Be careful! 🕳️"],
  trapDisarm: ["Trap disarmed - correct computation prevented the penalty. 🛡️", "Correct trap solve - no points lost. ✅", "Trap cleared with accurate math. 🎉"],
  trapChallenge: ["A trap! Solve to disarm! ⚡", "Math can disarm it! 🛡️", "Quick — solve to avoid the penalty! 🧠"],
  exit: ["You found the exit! 🏆", "Maze complete! Amazing! 🎊", "Level cleared! 🌟"],
  levelUp: ["New maze unlocked! Bigger & harder! 📈", "Level up! The maze grows! 🌀", "Ready for the next challenge? 🔥"],
};
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

/* ═══════════════════════════════════════════════════════════ */
const MathMaze = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');
  const { returnUrl, goBack } = useGameReturn();

  const [level, setLevel] = useState(1);
  const [maze, setMaze] = useState(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [keys, setKeys] = useState(0);
  const [doorQuestion, setDoorQuestion] = useState(null);
  const [doorPos, setDoorPos] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [doorResult, setDoorResult] = useState(null);
  const [trapQuestion, setTrapQuestion] = useState(null);
  const [trapPos, setTrapPos] = useState(null);
  const [trapSelectedAnswer, setTrapSelectedAnswer] = useState(null);
  const [trapResult, setTrapResult] = useState(null);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT_MSGS.start));
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [visited, setVisited] = useState(new Set(['1,1']));
  const [levelComplete, setLevelComplete] = useState(false);
  const [totalLevels, setTotalLevels] = useState(0);
  const [particles, setParticles] = useState([]);
  const scrollRef = useRef(null);
  const answeringRef = useRef(false);
  const dpadCooldownRef = useRef(0);
  const [showHelp, setShowHelp] = useState(false);

  const initLevel = useCallback((lvl) => {
    const size = MAZE_SIZES[Math.min(lvl - 1, MAZE_SIZES.length - 1)];
    let grid = generateMaze(size.w, size.h);
    grid = addFeatures(grid, lvl);
    setMaze(grid);
    setPlayerPos({ x: 1, y: 1 });
    setVisited(new Set(['1,1']));
    setDoorQuestion(null);
    setDoorPos(null);
    setSelectedAnswer(null);
    setDoorResult(null);
    setTrapQuestion(null);
    setTrapPos(null);
    setTrapSelectedAnswer(null);
    setTrapResult(null);
    setLevelComplete(false);
    setQbotMsg(lvl > 1 ? pick(QBOT_MSGS.levelUp) : pick(QBOT_MSGS.start));
    answeringRef.current = false;
  }, []);

  useEffect(() => { initLevel(1); }, [initLevel]);

  // Auto-scroll to keep player visible
  useEffect(() => {
    if (scrollRef.current && maze) {
      const container = scrollRef.current;
      const px = playerPos.x * CELL_SIZE;
      const py = playerPos.y * CELL_SIZE;
      container.scrollTo({
        left: px - container.clientWidth / 2 + CELL_SIZE / 2,
        top: py - container.clientHeight / 2 + CELL_SIZE / 2,
        behavior: 'smooth',
      });
    }
  }, [playerPos, maze]);

  const spawnParticles = (emoji, count = 4) => {
    const mazeW = maze?.[0]?.length || 9;
    const mazeH = maze?.length || 9;
    const cellW = 100 / mazeW;
    const cellH = 100 / mazeH;
    const ps = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i, emoji,
      x: (playerPos.x + 0.5) * cellW + (randInt(-15, 15) / mazeW),
      y: (playerPos.y + 0.5) * cellH + (randInt(-15, 15) / mazeH),
      dx: randInt(-30, 30), dy: randInt(-40, -10),
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 800);
  };

  const tryMove = useCallback((dx, dy) => {
    if (!maze || doorQuestion || trapQuestion || levelComplete || gameOver) return;
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;
    if (ny < 0 || ny >= maze.length || nx < 0 || nx >= maze[0].length) return;
    const cell = maze[ny][nx];
    if (cell === WALL) return;

    if (cell === DOOR) {
      SFX.door();
      setDoorQuestion(genQuestion(level));
      setDoorPos({ x: nx, y: ny });
      setSelectedAnswer(null);
      setDoorResult(null);
      setQbotMsg(pick(QBOT_MSGS.door));
      return;
    }

    if (cell === TRAP) {
      SFX.door(); // same alert sound
      setTrapQuestion(genQuestion(level));
      setTrapPos({ x: nx, y: ny });
      setTrapSelectedAnswer(null);
      setTrapResult(null);
      setQbotMsg(pick(QBOT_MSGS.trapChallenge));
      return;
    }

    SFX.step();
    setPlayerPos({ x: nx, y: ny });
    setMoves(m => m + 1);
    setVisited(prev => new Set([...prev, `${nx},${ny}`]));

    if (cell === COIN) {
      SFX.key();
      setScore(s => s + 50);
      setQbotMsg(pick(QBOT_MSGS.coin));
      spawnParticles('🪙', 5);
      setMaze(prev => prev.map((row, i) => row.map((c, j) => (i === ny && j === nx) ? PATH : c)));
    } else if (cell === EXIT) {
      SFX.exit();
      setScore(s => s + 200);
      setQbotMsg(pick(QBOT_MSGS.exit));
      setLevelComplete(true);
      setTotalLevels(t => t + 1);
      spawnParticles('⭐', 6);
    }
  }, [maze, playerPos, doorQuestion, trapQuestion, levelComplete, gameOver, level]);

  const handleDpadMove = useCallback((dx, dy) => (e) => {
    if (e.type === 'pointerdown') e.preventDefault();
    const now = Date.now();
    if (now - dpadCooldownRef.current < 120) return;
    dpadCooldownRef.current = now;
    tryMove(dx, dy);
  }, [tryMove]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (doorQuestion || trapQuestion || levelComplete) return;
      const map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0], w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); tryMove(dir[0], dir[1]); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [tryMove, doorQuestion, trapQuestion, levelComplete]);

  const handleDoorAnswer = (choice) => {
    if (!doorQuestion || doorResult !== null || answeringRef.current) return;
    answeringRef.current = true;
    const correct = Number(choice) === Number(doorQuestion.ans);
    const dp = { ...doorPos };
    setSelectedAnswer(choice);
    setDoorResult(correct ? 'correct' : 'wrong');

    setAnsweredQuestions(prev => [...prev, {
      question: doorQuestion.q,
      correctAnswer: String(doorQuestion.ans),
      studentAnswer: String(choice),
      correct,
      teks: doorQuestion.teks,
    }]);

    if (correct) {
      SFX.correct();
      setScore(s => s + 100);
      setQbotMsg(pick(QBOT_MSGS.correct));
      spawnParticles('✨', 4);
      setTimeout(() => {
        setMaze(prev => prev.map((row, i) => row.map((c, j) => (i === dp.y && j === dp.x) ? PATH : c)));
        setPlayerPos({ x: dp.x, y: dp.y });
        setVisited(prev => new Set([...prev, `${dp.x},${dp.y}`]));
        setMoves(m => m + 1);
        setDoorQuestion(null);
        setDoorPos(null);
        setDoorResult(null);
        answeringRef.current = false;
      }, 800);
    } else {
      SFX.wrong();
      setQbotMsg(pick(QBOT_MSGS.wrong));
      setTimeout(() => {
        setDoorQuestion(null);
        setDoorPos(null);
        setDoorResult(null);
        answeringRef.current = false;
      }, 1200);
    }
  };

  const handleTrapAnswer = (choice) => {
    if (!trapQuestion || trapResult !== null || answeringRef.current) return;
    answeringRef.current = true;
    const correct = Number(choice) === Number(trapQuestion.ans);
    const tp = { ...trapPos };
    setTrapSelectedAnswer(choice);
    setTrapResult(correct ? 'disarmed' : 'sprung');

    setAnsweredQuestions(prev => [...prev, {
      question: trapQuestion.q,
      correctAnswer: String(trapQuestion.ans),
      studentAnswer: String(choice),
      correct,
      teks: trapQuestion.teks,
    }]);

    if (correct) {
      SFX.correct();
      setQbotMsg(pick(QBOT_MSGS.trapDisarm));
      spawnParticles('🛡️', 4);
      setTimeout(() => {
        setMaze(prev => prev.map((row, i) => row.map((c, j) => (i === tp.y && j === tp.x) ? PATH : c)));
        setPlayerPos({ x: tp.x, y: tp.y });
        setVisited(prev => new Set([...prev, `${tp.x},${tp.y}`]));
        setMoves(m => m + 1);
        setTrapQuestion(null);
        setTrapPos(null);
        setTrapResult(null);
        setTrapSelectedAnswer(null);
        answeringRef.current = false;
      }, 800);
    } else {
      SFX.wrong();
      setScore(s => Math.max(0, s - 25));
      setQbotMsg(pick(QBOT_MSGS.trap));
      spawnParticles('💀', 3);
      setTimeout(() => {
        setMaze(prev => prev.map((row, i) => row.map((c, j) => (i === tp.y && j === tp.x) ? PATH : c)));
        setPlayerPos({ x: tp.x, y: tp.y });
        setVisited(prev => new Set([...prev, `${tp.x},${tp.y}`]));
        setMoves(m => m + 1);
        setTrapQuestion(null);
        setTrapPos(null);
        setTrapResult(null);
        setTrapSelectedAnswer(null);
        answeringRef.current = false;
      }, 1200);
    }
  };

  const handleNextLevel = () => {
    SFX.levelUp();
    const nextLvl = level + 1;
    setLevel(nextLvl);
    initLevel(nextLvl);
  };

  const handleFinish = () => {
    setGameOver(true);
    saveGameResult('math-maze', {
      score, total: (totalLevels + 1) * 500,
      percentage: Math.min(100, Math.round((score / Math.max(1, (totalLevels + 1) * 500)) * 100)),
      teksStandards: [...new Set(answeredQuestions.map(q => q.teks))],
      questions: answeredQuestions,
    }, { sid, aid, cid });
  };

  const resetGame = () => {
    setLevel(1); setScore(0); setMoves(0); setKeys(0);
    setGameOver(false); setShowReview(false);
    setAnsweredQuestions([]); setTotalLevels(0);
    initLevel(1);
  };

  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview
          questions={answeredQuestions.map(q => ({
            ...q,
            userAnswer: q.studentAnswer ?? q.userAnswer,
            isCorrect: q.correct ?? q.isCorrect,
          }))}
          score={score}
          total={(totalLevels + 1) * 500}
          gameTitle="Math Maze Runner"
          onPlayAgain={resetGame}
          continueUrl={returnUrl || undefined}
          continueLabel="Continue"
          onBack={() => navigate('/games')}
          backLabel="Back"
        />
      </div>
    );
  }

  if (gameOver) {
    const pct = Math.min(100, Math.round((score / Math.max(1, (totalLevels + 1) * 500)) * 100));
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)', maxWidth: 440, width: '92%', color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>🏆</div>
          <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: '#22c55e' }}>Maze Conquered!</h2>
          <QBotGuide msg="Strong maze run - keep solving each lock with clean setup and arithmetic checks. 🌟" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 20, marginTop: 12 }}>
            <div><div style={{ fontSize: 20, fontWeight: 900, color: '#22c55e' }}>{score}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Score</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24' }}>{totalLevels + 1}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Levels</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 900, color: '#3b82f6' }}>{moves}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Steps</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 900, color: '#8b5cf6' }}>{answeredQuestions.filter(q => q.correct).length}</div><div style={{ fontSize: 9, color: '#94a3b8' }}>Doors</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {returnUrl && (
              <button onClick={goBack} style={{ width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: '2px solid #34d399', borderRadius: 12, boxShadow: '0 0 14px rgba(5,150,105,0.35)' }}>
                Continue
              </button>
            )}
            <button onClick={resetGame} style={btn(returnUrl ? '#6366f1' : '#22c55e')}>Play Again</button>
            <button onClick={() => setShowReview(true)} style={btn('#6366f1')}>Review Answers</button>
            <Link to="/games" style={{ ...btn('#475569'), textDecoration: 'none', display: 'block' }}>Back</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!maze) return null;
  const mazeH = maze.length, mazeW = maze[0].length;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: 0 }}>
            ← Continue
          </button>
        ) : (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>← Games</Link>
        )}
        <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, color: '#22c55e' }}>🗺️ MAZE RUNNER</div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {score}</span>
          <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Lv.{level}</span>
        </div>
      </div>

      {/* QBot Guide + How to Play */}
      <div style={{ maxWidth: 520, margin: '8px auto 0', padding: '0 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <QBotGuide msg={qbotMsg} />
          </div>
          <button type="button" onClick={() => setShowHelp(!showHelp)} style={{ flexShrink: 0, padding: '6px 12px', fontSize: 11, fontWeight: 600, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}>
            {showHelp ? 'Hide' : 'How to play'}
          </button>
        </div>
        {showHelp && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>How to play</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Move with <strong>arrow keys</strong> or <strong>WASD</strong>, or tap adjacent cells</li>
              <li>Find the 🚪 <strong>exit</strong> (green) to reach the next level</li>
              <li>🔒 <strong>Locked doors</strong> — solve the math problem to unlock</li>
              <li>🪙 <strong>Coins</strong> — +50 points</li>
              <li>⚡ <strong>Traps</strong> — solve the math to disarm, or lose −25 points</li>
            </ul>
          </div>
        )}
      </div>

      {/* Maze viewport */}
      <div style={{ maxWidth: 520, margin: '8px auto', padding: '0 12px' }}>
        <div style={{ marginBottom: 8, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 11, color: '#94a3b8' }}>
          <span><span style={{ color: '#22c55e', fontWeight: 700 }}>●</span> Start</span>
          <span><span style={{ color: '#22c55e', fontWeight: 700 }}>🚪</span> Exit</span>
          <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>🔒</span> Door</span>
          <span><span style={{ color: '#eab308', fontWeight: 700 }}>🪙</span> Coin</span>
          <span><span style={{ color: '#ef4444', fontWeight: 700 }}>⚡</span> Trap</span>
        </div>
        <div ref={scrollRef} style={{
          overflow: 'auto', borderRadius: 16,
          border: '4px solid #475569',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(71,85,105,0.5)',
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 30%, #020617 100%)',
          height: 380,
          minHeight: 320,
          position: 'relative',
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch',
        }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', minWidth: 0, minHeight: 0 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${mazeW}, 1fr)`,
              gridTemplateRows: `repeat(${mazeH}, 1fr)`,
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              position: 'relative',
            }}>
            {maze.map((row, y) => row.map((cell, x) => {
              const isPlayer = playerPos.x === x && playerPos.y === y;

              // Fixed colors — maze never changes; all cells always clearly visible
              let bg = '#1e3a5f';
              let content = null;
              let border = '1px solid rgba(71,85,105,0.5)';
              let boxShadow = 'none';

              if (cell === WALL) {
                bg = '#475569';
                border = '1px solid #64748b';
              } else if (cell === START) {
                bg = '#22c55e';
                border = '2px solid #4ade80';
                content = isPlayer ? null : '▶';
              } else if (cell === PATH) {
                bg = '#1e3a5f';
                border = '1px solid rgba(59,130,246,0.3)';
              } else if (cell === DOOR) {
                bg = '#d97706';
                border = '2px solid #fbbf24';
                content = '🔒';
              } else if (cell === KEY) {
                bg = '#1e3a5f';
                content = '🔑';
              } else if (cell === EXIT) {
                bg = '#16a34a';
                border = '2px solid #86efac';
                content = '🚪';
              } else if (cell === COIN) {
                bg = '#a16207';
                border = '2px solid #fbbf24';
                content = '🪙';
              } else if (cell === TRAP) {
                bg = '#991b1b';
                border = '2px solid #f87171';
                content = '⚡';
              }

              const handleCellTap = () => {
                if (doorQuestion || trapQuestion) return;
                const dx = x - playerPos.x, dy = y - playerPos.y;
                if (Math.abs(dx) + Math.abs(dy) === 1) tryMove(dx, dy);
              };
              return (
                <div
                  key={`${x}-${y}`}
                  onClick={handleCellTap}
                  style={{
                    width: '100%', height: '100%', minWidth: 0, minHeight: 0,
                    boxSizing: 'border-box',
                    background: bg, border, boxShadow,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isPlayer ? 22 : 18,
                    cursor: cell !== WALL && !doorQuestion && !trapQuestion ? 'pointer' : 'default',
                    position: 'relative',
                    borderRadius: cell === WALL ? 2 : 4,
                  }}
                >
                  {isPlayer ? (
                    <div style={{ animation: 'playerBounce 0.8s ease infinite', fontSize: 22 }}>🏃</div>
                  ) : content}
                </div>
              );
            }))}
            </div>
            {/* Particles overlay - outside grid to avoid layout issues */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
              {particles.map(p => (
                <div key={p.id} style={{
                  position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: 16,
                  animation: 'particleFly 0.7s ease-out forwards',
                  '--dx': `${p.dx}px`, '--dy': `${p.dy}px`,
                }}>{p.emoji}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile controls - onPointerDown captures touch before scroll */}
      <div style={{ maxWidth: 200, margin: '10px auto 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 4 }}>
        <div />
        <button type="button" onPointerDown={handleDpadMove(0, -1)} onClick={handleDpadMove(0, -1)} style={dpad}>▲</button>
        <div />
        <button type="button" onPointerDown={handleDpadMove(-1, 0)} onClick={handleDpadMove(-1, 0)} style={dpad}>◀</button>
        <div style={{ ...dpad, background: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e33', color: '#22c55e', fontSize: 10 }}>WASD</div>
        <button type="button" onPointerDown={handleDpadMove(1, 0)} onClick={handleDpadMove(1, 0)} style={dpad}>▶</button>
        <div />
        <button type="button" onPointerDown={handleDpadMove(0, 1)} onClick={handleDpadMove(0, 1)} style={dpad}>▼</button>
        <div />
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 520, margin: '8px auto', padding: '0 12px', display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11, color: '#94a3b8' }}>
        <span>Steps: <strong style={{ color: '#f1f5f9' }}>{moves}</strong></span>
        <span>Doors: <strong style={{ color: '#f1f5f9' }}>{answeredQuestions.filter(q => q.correct).length}</strong></span>
        <span>Level: <strong style={{ color: '#22c55e' }}>{level}</strong></span>
      </div>

      {/* Door question overlay */}
      {doorQuestion && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 20,
            padding: '28px 24px', maxWidth: 380, width: '92%', textAlign: 'center',
            border: doorResult === 'correct' ? '3px solid #22c55e' : doorResult === 'wrong' ? '3px solid #ef4444' : '2px solid #f59e0b44',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
            <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginBottom: 4 }}>LOCKED DOOR</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{doorQuestion.teks}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 16 }}>
              {doorQuestion.q} = ?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {doorQuestion.choices.map((c, i) => {
                let bg = 'rgba(255,255,255,0.04)';
                let border = 'rgba(255,255,255,0.1)';
                let color = '#e2e8f0';
                if (doorResult && c === doorQuestion.ans) { bg = 'rgba(34,197,94,0.15)'; border = '#22c55e'; color = '#22c55e'; }
                else if (doorResult === 'wrong' && c === selectedAnswer) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#ef4444'; }
                return (
                  <button key={i} onClick={() => handleDoorAnswer(c)} disabled={doorResult !== null}
                    style={{ padding: '14px 8px', borderRadius: 10, background: bg, border: `2px solid ${border}`, color, fontSize: 18, fontWeight: 800, cursor: doorResult ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                    {c}
                  </button>
                );
              })}
            </div>
            {doorResult === 'correct' && <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>✅ Door unlocked! +100</div>}
            {doorResult === 'wrong' && <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>❌ Wrong! Answer: {doorQuestion.ans}</div>}
          </div>
        </div>
      )}

      {/* Trap challenge overlay — solve to avoid −25 penalty */}
      {trapQuestion && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'linear-gradient(170deg,#451a1a,#1e293b)', borderRadius: 20,
            padding: '28px 24px', maxWidth: 380, width: '92%', textAlign: 'center',
            border: trapResult === 'correct' ? '3px solid #22c55e' : trapResult === 'wrong' ? '3px solid #ef4444' : '3px solid #991b1b',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
            <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700, marginBottom: 4 }}>TRAP! Solve to disarm</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Correct = pass safely · Wrong = −25 points</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{trapQuestion.teks}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 16 }}>
              {trapQuestion.q} = ?
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {trapQuestion.choices.map((c, i) => {
                let choiceBg = 'rgba(255,255,255,0.04)';
                let choiceBorder = 'rgba(255,255,255,0.1)';
                let choiceColor = '#e2e8f0';
                if (trapResult && c === trapQuestion.ans) { choiceBg = 'rgba(34,197,94,0.15)'; choiceBorder = '#22c55e'; choiceColor = '#22c55e'; }
                else if (trapResult === 'wrong' && c === trapSelectedAnswer) { choiceBg = 'rgba(239,68,68,0.15)'; choiceBorder = '#ef4444'; choiceColor = '#ef4444'; }
                return (
                  <button key={i} onClick={() => handleTrapAnswer(c)} disabled={trapResult !== null}
                    style={{ padding: '14px 8px', borderRadius: 10, background: choiceBg, border: `2px solid ${choiceBorder}`, color: choiceColor, fontSize: 18, fontWeight: 800, cursor: trapResult ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                    {c}
                  </button>
                );
              })}
            </div>
            {trapResult === 'correct' && <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 14 }}>✅ Trap disarmed! No penalty</div>}
            {trapResult === 'wrong' && <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>❌ Trap sprung! −25 points</div>}
          </div>
        </div>
      )}

      {/* Level complete overlay */}
      {levelComplete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 20,
            padding: '32px 28px', maxWidth: 380, width: '92%', textAlign: 'center',
            border: '3px solid #22c55e', animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: '#22c55e' }}>Level {level} Complete!</h2>
            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: 13 }}>Score: {score} · Steps: {moves}</p>
            <QBotGuide msg={pick(QBOT_MSGS.exit)} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              {returnUrl && (
                <button onClick={goBack} style={{ width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg, #059669, #047857)', color: '#fff', border: '2px solid #34d399', borderRadius: 12, boxShadow: '0 0 14px rgba(5,150,105,0.35)' }}>Continue</button>
              )}
              {level < 5 && <button onClick={handleNextLevel} style={btn(returnUrl ? '#6366f1' : '#22c55e')}>Next Level (Lv.{level + 1}) →</button>}
              <button onClick={handleFinish} style={btn('#6366f1')}>Finish & See Results</button>
            </div>
          </div>
        </div>
      )}

      {returnUrl && <LoopContinueButton onClick={goBack} />}

      <style>{`
        @keyframes playerBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes particleFly { 0%{opacity:1;transform:translate(0,0)} 100%{opacity:0;transform:translate(var(--dx),var(--dy))} }
      `}</style>
    </div>
  );
};

/* ── QBot Guide ── */
const QBotGuide = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.05)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(34,197,94,0.1)' }}>
    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#14532d,#052e16)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #22c55e', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 26 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#86efac', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const BG = 'linear-gradient(135deg,#0f172a 0%,#14532d 50%,#0f172a 100%)';
const FONT = '"Inter","Segoe UI",system-ui,sans-serif';
function btn(bg) { return { padding: '12px 24px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, textAlign: 'center' }; }
const dpad = { width: 48, height: 48, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

export default MathMaze;
