import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   CROSSES & KNOTS — Math Tic-Tac-Toe
   Get 3 in a row where all expressions equal the same value!
   e.g.  "5", "8 − 3", "2 + 3"  →  all equal 5  →  YOU WIN!
   ═══════════════════════════════════════════════════════════════ */

let _ac = null;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  select: () => tone(600, 0.05),
  place: () => { tone(440, 0.06); setTimeout(() => tone(550, 0.06), 50); },
  botPlace: () => { tone(300, 0.06, 'triangle'); setTimeout(() => tone(380, 0.06, 'triangle'), 50); },
  win: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.15), i * 80)); },
  lose: () => { tone(200, 0.25, 'sawtooth', 0.06); setTimeout(() => tone(160, 0.3, 'sawtooth', 0.05), 150); },
  draw: () => { tone(440, 0.1); setTimeout(() => tone(350, 0.15), 120); },
  rowMatch: () => { [880, 1100, 1320].forEach((f, i) => setTimeout(() => tone(f, 0.08), i * 40)); },
};

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = randInt(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

function evalExpr(expr) {
  const s = expr.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
  const m = s.match(/^(\d+)([+\-*/])(\d+)$/);
  if (m) {
    const [, a, op, b] = m;
    const na = parseInt(a), nb = parseInt(b);
    if (op === '+') return na + nb;
    if (op === '-') return na - nb;
    if (op === '*') return na * nb;
    if (op === '/') return nb !== 0 ? na / nb : NaN;
  }
  const n = parseInt(s);
  return isNaN(n) ? 0 : n;
}

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const VALUE_HUES = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'];

/* ── Expression pools (verified correct math) ── */
const POOLS = [
  { v: 4,  e: ['4','2 + 2','7 − 3','1 + 3','10 − 6','8 − 4','6 − 2'] },
  { v: 5,  e: ['5','2 + 3','8 − 3','1 + 4','10 − 5','7 − 2','9 − 4'] },
  { v: 6,  e: ['6','2 + 4','9 − 3','1 + 5','10 − 4','8 − 2','3 + 3'] },
  { v: 7,  e: ['7','3 + 4','10 − 3','2 + 5','12 − 5','1 + 6','9 − 2'] },
  { v: 8,  e: ['8','3 + 5','10 − 2','6 + 2','1 + 7','11 − 3','5 + 3'] },
  { v: 9,  e: ['9','4 + 5','12 − 3','7 + 2','15 − 6','3 + 6','11 − 2'] },
  { v: 10, e: ['10','4 + 6','13 − 3','7 + 3','15 − 5','2 + 8','6 + 4'] },
  { v: 11, e: ['11','5 + 6','14 − 3','8 + 3','17 − 6','4 + 7','9 + 2'] },
  { v: 12, e: ['12','7 + 5','15 − 3','9 + 3','20 − 8','4 + 8','6 + 6'] },
  { v: 15, e: ['15','8 + 7','20 − 5','9 + 6','18 − 3','6 + 9','11 + 4'] },
  // Medium (multiplication)
  { v: 6,  e: ['2 × 3','3 × 2','9 − 3','12 − 6','1 + 5','8 − 2'], d: 2 },
  { v: 8,  e: ['2 × 4','4 × 2','11 − 3','3 + 5','14 − 6','1 + 7'], d: 2 },
  { v: 10, e: ['2 × 5','5 × 2','7 + 3','13 − 3','4 + 6','15 − 5'], d: 2 },
  { v: 12, e: ['3 × 4','4 × 3','7 + 5','20 − 8','6 + 6','15 − 3'], d: 2 },
  { v: 15, e: ['3 × 5','5 × 3','8 + 7','20 − 5','9 + 6','18 − 3'], d: 2 },
  { v: 16, e: ['4 × 4','2 × 8','8 × 2','9 + 7','20 − 4','11 + 5'], d: 2 },
  { v: 20, e: ['4 × 5','5 × 4','2 × 10','12 + 8','25 − 5','15 + 5'], d: 2 },
  // Hard (division)
  { v: 4,  e: ['12 ÷ 3','8 ÷ 2','2 × 2','7 − 3','16 ÷ 4','20 ÷ 5'], d: 3 },
  { v: 5,  e: ['15 ÷ 3','10 ÷ 2','20 ÷ 4','8 − 3','2 + 3','25 ÷ 5'], d: 3 },
  { v: 6,  e: ['18 ÷ 3','12 ÷ 2','24 ÷ 4','2 × 3','30 ÷ 5','9 − 3'], d: 3 },
  { v: 8,  e: ['24 ÷ 3','16 ÷ 2','32 ÷ 4','2 × 4','40 ÷ 5','11 − 3'], d: 3 },
  { v: 10, e: ['20 ÷ 2','30 ÷ 3','40 ÷ 4','2 × 5','50 ÷ 5','7 + 3'], d: 3 },
];

function generateRound(round, maxPoolDiff = 3, tilesPerGroup = 5) {
  const available = POOLS.filter(p => (p.d || 1) <= maxPoolDiff);
  const shuffled = shuffle(available);
  const chosen = [];
  const usedVals = new Set();
  for (const pool of shuffled) {
    if (!usedVals.has(pool.v)) {
      chosen.push(pool);
      usedVals.add(pool.v);
      if (chosen.length === 3) break;
    }
  }
  const tiles = [];
  chosen.forEach((pool, gi) => {
    const count = Math.min(tilesPerGroup, pool.e.length);
    const exprs = shuffle(pool.e).slice(0, count);
    exprs.forEach((expr, ei) => {
      tiles.push({
        id: `${gi}-${ei}-${Date.now()}`,
        expr,
        value: evalExpr(expr),
        groupIndex: gi,
      });
    });
  });
  return { tiles: shuffle(tiles), groups: chosen.map((p) => ({ value: p.v })) };
}

/* ── Win check — 3 matching values in a row wins for whoever just played ── */
function checkWinner(board, lastPlayer) {
  for (const line of WIN_LINES) {
    const cells = line.map(i => board[i]);
    if (cells.every(c => c !== null)) {
      const val = evalExpr(cells[0].expr);
      if (cells.every(c => evalExpr(c.expr) === val)) {
        return { winner: lastPlayer, line, value: val };
      }
    }
  }
  if (board.every(c => c !== null)) return { winner: 'draw', line: null, value: null };
  return null;
}

/* ── Bot AI — win condition is any 3 matching values in a row ── */
function botDecide(board, availTiles, blunderChance = 0) {
  const botTiles = [...availTiles];
  if (botTiles.length === 0) return null;

  const tileWithValue = (val) => botTiles.find(t => evalExpr(t.expr) === val);
  const emptyCells = board.map((c, i) => c === null ? i : -1).filter(i => i >= 0);

  const makeBlunder = () => {
    if (emptyCells.length === 0) return null;
    return { tileId: botTiles[randInt(0, botTiles.length - 1)].id, cell: emptyCells[randInt(0, emptyCells.length - 1)] };
  };

  // 1. Can bot win? (complete any line where 2 cells already have matching values)
  for (const line of WIN_LINES) {
    const cells = line.map(i => board[i]);
    const filled = cells.filter(c => c !== null);
    const emptyIdxs = line.filter(i => board[i] === null);
    if (filled.length === 2 && emptyIdxs.length === 1) {
      const v0 = evalExpr(filled[0].expr), v1 = evalExpr(filled[1].expr);
      if (v0 === v1) {
        const tile = tileWithValue(v0);
        if (tile) return { tileId: tile.id, cell: emptyIdxs[0] };
      }
    }
  }

  if (blunderChance > 0 && Math.random() < blunderChance) {
    return makeBlunder();
  }

  // 2. Block — prevent human from completing a matching line on their next turn
  for (const line of WIN_LINES) {
    const cells = line.map(i => board[i]);
    const filled = cells.filter(c => c !== null);
    const emptyIdxs = line.filter(i => board[i] === null);
    if (filled.length === 2 && emptyIdxs.length === 1) {
      const v0 = evalExpr(filled[0].expr), v1 = evalExpr(filled[1].expr);
      if (v0 === v1) {
        // Place a tile with a DIFFERENT value to block
        const blockTile = botTiles.find(t => evalExpr(t.expr) !== v0) || botTiles[0];
        return { tileId: blockTile.id, cell: emptyIdxs[0] };
      }
    }
  }

  // 3. Build — extend a line where bot has 1 tile and can match
  for (const line of WIN_LINES) {
    const cells = line.map(i => board[i]);
    const filled = cells.filter(c => c !== null);
    const emptyIdxs = line.filter(i => board[i] === null);
    if (filled.length === 1 && emptyIdxs.length === 2) {
      const val = evalExpr(filled[0].expr);
      const tile = tileWithValue(val);
      if (tile) return { tileId: tile.id, cell: emptyIdxs[0] };
    }
  }

  // 4. Strategic: center, then corners
  const preferred = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  for (const cell of preferred) {
    if (board[cell] === null) {
      return { tileId: botTiles[0].id, cell };
    }
  }
  return null;
}

/* ── Difficulty configuration ── */
const DIFFICULTY = {
  easy: {
    label: 'Easy', emoji: '🟢', color: '#22c55e',
    desc: 'Addition & subtraction only. QBot goes easy on you.',
    ops: 'Addition & Subtraction',
    maxPoolDiff: 1, rounds: 5, winPts: 50, drawPts: 15,
    botBlunderChance: 0.35,
    tilesPerGroup: 6,
  },
  medium: {
    label: 'Medium', emoji: '🟡', color: '#f59e0b',
    desc: 'Adds multiplication. QBot plays smart!',
    ops: '+ Multiplication',
    maxPoolDiff: 2, rounds: 5, winPts: 100, drawPts: 25,
    botBlunderChance: 0.12,
    tilesPerGroup: 5,
  },
  hard: {
    label: 'Hard', emoji: '🔴', color: '#ef4444',
    desc: 'All operations including division. QBot is ruthless!',
    ops: '+ Division',
    maxPoolDiff: 3, rounds: 7, winPts: 150, drawPts: 40,
    botBlunderChance: 0,
    tilesPerGroup: 5,
  },
};

const QBOT_MSGS = {
  start: ["Complete a row of 3 matching values to win — even using your opponent's tiles! 🎯", "Match values across a row, column, or diagonal — any tiles count! 🧠", "Place the tile that makes 3 in a row equal the same answer and YOU win! ✨"],
  yourTurn: ["Your turn! Pick a tile and place it 📝", "Choose wisely — which tiles equal the same? 🤔", "Tap a tile, then tap a cell! 🎮"],
  botTurn: ["My turn! Let me think... 🤖", "Hmm, where should I go? 🧐", "Watch this move! 😏"],
  playerWin: ["You formed three equivalent values in a row with valid evaluation. 🎉", "Win confirmed - your row matches by equal numeric value. 🏆", "Strong equivalence reasoning - line completed. ⭐"],
  botWin: ["I completed a row of equivalent values first. Review each tile's computed value. 🤖", "Close round - check each expression's value before placing next time. 💪", "This round goes to me. Recompute candidate tiles before your next move. 😊"],
  drawGame: ["Draw game - no completed line of equivalent values. 🤝", "No winner this time. Re-evaluate value matches and run a rematch. ⚡", "Tie result - both sides blocked each other's value lines. 🔥"],
  goodMove: ["Strong placement based on equal value. 👍", "Good move - value matching logic is working. 🧠", "Accurate tile placement by computation. ✅"],
};

/* ═══════════════════════ COMPONENT ═══════════════════════ */
const CrossesKnots = () => {
  const [searchParams] = useSearchParams();
  const sid = searchParams.get('sid');
  const aid = searchParams.get('aid');
  const cid = searchParams.get('cid');

  const [difficulty, setDifficulty] = useState(null); // null = show level select
  const [board, setBoard] = useState(Array(9).fill(null));
  const [tiles, setTiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [turn, setTurn] = useState('human');
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT_MSGS.start));
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(-1);
  const [lastPlaced, setLastPlaced] = useState(-1);
  const [showHowTo, setShowHowTo] = useState(false);
  const boardRef = useRef(null);

  const { returnUrl, goBack, isEmbedded } = useGameReturn();
  const diff = difficulty ? DIFFICULTY[difficulty] : DIFFICULTY.medium;
  const TOTAL_ROUNDS = diff.rounds;

  const initRound = useCallback((r) => {
    const { tiles: newTiles, groups: newGroups } = generateRound(r, diff.maxPoolDiff, diff.tilesPerGroup);
    setBoard(Array(9).fill(null));
    setTiles(newTiles);
    setGroups(newGroups);
    setSelectedTileId(null);
    setResult(null);
    setTurn('human');
    setLastPlaced(-1);
    setHoveredCell(-1);
    setQbotMsg(pick(QBOT_MSGS.start));
  }, [diff]);

  useEffect(() => { if (difficulty) initRound(round); }, [round, initRound, difficulty]);

  // Available tiles (not yet placed)
  const availTiles = tiles.filter(t => !board.some(c => c && c.id === t.id));

  // Place a tile
  const placeTile = useCallback((cellIdx) => {
    if (board[cellIdx] !== null || result || turn !== 'human') return;
    const tile = tiles.find(t => t.id === selectedTileId);
    if (!tile || board.some(c => c && c.id === tile.id)) return;

    SFX.place();
    const newBoard = [...board];
    newBoard[cellIdx] = { ...tile, player: 'human' };
    setBoard(newBoard);
    setSelectedTileId(null);
    setLastPlaced(cellIdx);

    const winResult = checkWinner(newBoard, 'human');
    if (winResult) {
      handleRoundEnd(winResult, newBoard);
    } else {
      setTurn('bot');
      setQbotMsg(pick(QBOT_MSGS.botTurn));
    }
  }, [board, selectedTileId, tiles, result, turn]);

  // Bot turn
  useEffect(() => {
    if (turn !== 'bot' || result) return;
    const botAvail = tiles.filter(t => !board.some(c => c && c.id === t.id));
    if (botAvail.length === 0) return;

    const delay = 600 + Math.random() * 400;
    const timer = setTimeout(() => {
      const move = botDecide(board, botAvail, diff.botBlunderChance);
      if (!move) return;

      SFX.botPlace();
      const tile = tiles.find(t => t.id === move.tileId);
      const newBoard = [...board];
      newBoard[move.cell] = { ...tile, player: 'bot' };
      setBoard(newBoard);
      setLastPlaced(move.cell);

      const winResult = checkWinner(newBoard, 'bot');
      if (winResult) {
        handleRoundEnd(winResult, newBoard);
      } else {
        setTurn('human');
        setQbotMsg(pick(QBOT_MSGS.yourTurn));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [turn, board, tiles, result]);

  const handleRoundEnd = (winResult, finalBoard) => {
    setResult(winResult);
    if (winResult.winner === 'human') {
      SFX.win();
      setScore(s => s + diff.winPts);
      setWins(w => w + 1);
      setQbotMsg(pick(QBOT_MSGS.playerWin));
    } else if (winResult.winner === 'bot') {
      SFX.lose();
      setLosses(l => l + 1);
      setQbotMsg(pick(QBOT_MSGS.botWin));
    } else {
      SFX.draw();
      setScore(s => s + diff.drawPts);
      setDraws(d => d + 1);
      setQbotMsg(pick(QBOT_MSGS.drawGame));
    }
    setRoundHistory(prev => [...prev, {
      round, winner: winResult.winner, board: finalBoard,
      question: `Round ${round}`,
      correctAnswer: winResult.winner === 'human' ? 'Win' : winResult.winner === 'bot' ? 'Loss' : 'Draw',
      studentAnswer: winResult.winner === 'human' ? 'Win' : winResult.winner === 'bot' ? 'Loss' : 'Draw',
      correct: winResult.winner === 'human',
      teks: '3.5A',
    }]);
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      saveGameResult('crosses-knots', {
        score, total: TOTAL_ROUNDS * 100,
        percentage: Math.round((score / (TOTAL_ROUNDS * 100)) * 100),
        teksStandards: ['3.4A', '3.4C', '3.5A'],
        questions: roundHistory,
      }, { sid, aid, cid });
    } else {
      setRound(r => r + 1);
    }
  };

  const resetGame = () => {
    setDifficulty(null);
    setRound(1); setScore(0); setWins(0); setLosses(0); setDraws(0);
    setGameOver(false); setShowReview(false); setRoundHistory([]);
  };

  const replayDifficulty = () => {
    setRound(1); setScore(0); setWins(0); setLosses(0); setDraws(0);
    setGameOver(false); setShowReview(false); setRoundHistory([]);
    initRound(1);
  };

  // ── Drag & drop via pointer events ──
  const handleTilePointerDown = (tileId, e) => {
    if (turn !== 'human' || result) return;
    e.preventDefault();
    SFX.select();
    setSelectedTileId(tileId);
    setDragging({ tileId, x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setDragging(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
      if (boardRef.current) {
        const cells = boardRef.current.querySelectorAll('[data-cell]');
        let found = -1;
        cells.forEach(cell => {
          const r = cell.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            found = parseInt(cell.dataset.cell);
          }
        });
        setHoveredCell(found);
      }
    };
    const onUp = (e) => {
      if (hoveredCell >= 0 && board[hoveredCell] === null) {
        placeTile(hoveredCell);
      }
      setDragging(null);
      setHoveredCell(-1);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [dragging, hoveredCell, board, placeTile]);

  // Tap a cell to place the selected tile
  const handleCellClick = (idx) => {
    if (selectedTileId && turn === 'human' && !result && board[idx] === null) {
      placeTile(idx);
    }
  };

  // ── Level select screen ──
  if (!difficulty) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, padding: 16 }}>
        <div style={{ maxWidth: 420, width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>✖○</div>
            <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 900, color: '#a855f7', letterSpacing: 1 }}>Crosses & Knots</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Math Tic-Tac-Toe — Outsmart QBot!</p>
          </div>

          {/* QBot intro */}
          <div style={{ marginBottom: 20 }}>
            <QBotBubble msg="Pick a difficulty! Easy is great for practice, Hard is for math champions! 🤖" />
          </div>

          {/* Difficulty cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(DIFFICULTY).map(([key, d]) => (
              <button
                key={key}
                onClick={() => { SFX.select(); setDifficulty(key); setShowHowTo(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: `2px solid ${d.color}33`,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                  color: '#fff',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${d.color}15`; e.currentTarget.style.borderColor = `${d.color}88`; e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = `${d.color}33`; e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: `${d.color}18`, border: `2px solid ${d.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, flexShrink: 0,
                }}>{d.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: d.color, marginBottom: 2 }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{d.desc}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: '#64748b' }}>
                    <span>{d.ops}</span>
                    <span>·</span>
                    <span>{d.rounds} rounds</span>
                    <span>·</span>
                    <span>{d.winPts} pts/win</span>
                  </div>
                </div>
                <div style={{ color: `${d.color}88`, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>▸</div>
              </button>
            ))}
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            {returnUrl ? (
              <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
            ) : !isEmbedded ? (
              <Link to="/games" style={{ color: '#64748b', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Back to Games</Link>
            ) : (
              <span />
            )}
          </div>
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  // ── Game over screen ──
  if (showReview) {
    return (
      <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
        <GameReview questions={roundHistory} score={score} total={TOTAL_ROUNDS * 100} gameName="Crosses & Knots" onClose={() => setShowReview(false)} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <button onClick={replayDifficulty} style={btn(diff.color)}>Play Again ({diff.label})</button>
          <button onClick={resetGame} style={btn('#6366f1')}>Change Difficulty</button>
          {!isEmbedded && <Link to="/games" style={{ ...btn('#475569'), textDecoration: 'none' }}>Back to Games</Link>}
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  if (gameOver) {
    const majorityWin = wins > TOTAL_ROUNDS / 2;
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>
        <div style={{ background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 24, padding: '40px 36px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.1)', maxWidth: 420, width: '92%', color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{majorityWin ? '🏆' : wins >= Math.floor(TOTAL_ROUNDS / 2) ? '⭐' : '🎮'}</div>
          <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: majorityWin ? '#22c55e' : '#f1f5f9' }}>
            {majorityWin ? 'You Won!' : wins >= Math.floor(TOTAL_ROUNDS / 2) ? 'Good Game!' : 'Keep Practicing!'}
          </h2>
          <div style={{ fontSize: 11, color: diff.color, fontWeight: 700, marginBottom: 8 }}>
            {diff.emoji} {diff.label} Mode · {TOTAL_ROUNDS} Rounds
          </div>
          <QBotBubble msg={
            majorityWin && difficulty === 'hard' ? "You beat me on HARD! You're a legend! 🤖👑" :
            majorityWin ? "You're a math champion! Try a harder level? 🌟" :
            "Great effort! Want to try again? 💪"
          } />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, margin: '14px 0' }}>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{wins}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Wins</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: '#ef4444' }}>{losses}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Losses</div></div>
            <div><div style={{ fontSize: 22, fontWeight: 900, color: '#fbbf24' }}>{draws}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>Draws</div></div>
          </div>
          <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>Score: <strong style={{ color: '#00f5ff' }}>{score}</strong></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={replayDifficulty} style={btn(diff.color)}>Play Again ({diff.label})</button>
            <button onClick={resetGame} style={btn('#6366f1')}>Change Difficulty</button>
            <button onClick={() => setShowReview(true)} style={btn('#475569')}>Review Rounds</button>
            {!isEmbedded && <Link to="/games" style={{ ...btn('#334155'), textDecoration: 'none', display: 'block' }}>Back to Games</Link>}
          </div>
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  // ── Main game UI ──
  const selectedTile = tiles.find(t => t.id === selectedTileId);

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : !isEmbedded ? (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>← Games</Link>
        ) : (
          <span />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, color: '#a855f7' }}>✖ CROSSES & KNOTS ○</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: diff.color, opacity: 0.8 }}>{diff.emoji} {diff.label}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 11, alignItems: 'center' }}>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {score}</span>
          <span style={{ color: '#94a3b8' }}>Rd {round}/{TOTAL_ROUNDS}</span>
          <button onClick={() => setShowHowTo(true)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.1)', color: '#a855f7', fontWeight: 800, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>?</button>
        </div>
      </div>

      {/* How To Play overlay */}
      {showHowTo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'linear-gradient(170deg,#1e293b,#0f172a)', borderRadius: 20,
            padding: '28px 24px', maxWidth: 400, width: '100%',
            border: '2px solid rgba(168,85,247,0.25)', color: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #a855f7', overflow: 'hidden', flexShrink: 0 }}>
                <img src={qbotImg} alt="QBot" style={{ width: 28 }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#a855f7' }}>✖ Crosses & Knots ○</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>QBot explains how to play!</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#e2e8f0' }}>
                This is Tic-Tac-Toe with a math twist!
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16, lineHeight: '20px' }}>1.</span>
                <span>You and QBot take turns placing <strong style={{ color: '#3b82f6' }}>math expression tiles</strong> (like "2 + 3", "8 − 3", "5") onto a 3×3 board.</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16, lineHeight: '20px' }}>2.</span>
                <span>To <strong style={{ color: '#22c55e' }}>win</strong>, complete a row of <strong>3 tiles</strong> (horizontal, vertical, or diagonal) where all 3 expressions <strong style={{ color: '#fbbf24' }}>equal the same number</strong> — it doesn't matter who placed the other tiles!</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16, lineHeight: '20px' }}>3.</span>
                <span>For example: <strong>"5"</strong>, <strong>"8 − 3"</strong>, and <strong>"2 + 3"</strong> all equal <strong style={{ color: '#a855f7' }}>5</strong> — that's a winning row!</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16, lineHeight: '20px' }}>4.</span>
                <span><strong>Tap a tile</strong> at the bottom to select it, then <strong>tap a cell</strong> on the board — or <strong>drag</strong> the tile directly onto the board.</span>
              </div>
              <div style={{ background: 'rgba(168,85,247,0.08)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(168,85,247,0.15)', fontSize: 11, color: '#94a3b8' }}>
                <strong style={{ color: '#c4b5fd' }}>Tip:</strong> Solve the math on each tile in your head! Find tiles that equal the same number and place them in a row to win!
              </div>
            </div>
            <button onClick={() => setShowHowTo(false)} style={{
              width: '100%', marginTop: 16, padding: '14px 0', background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
              color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(168,85,247,0.3)',
            }}>
              Got it — Let's Play! 🎮
            </button>
          </div>
        </div>
      )}

      {/* QBot */}
      <div style={{ maxWidth: 400, margin: '8px auto 0', padding: '0 12px', width: '100%' }}>
        <QBotBubble msg={qbotMsg} />
      </div>

      

      {/* Board */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 12px' }}>
        <div ref={boardRef} style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
          width: '100%', maxWidth: 320, aspectRatio: '1',
        }}>
          {board.map((cell, idx) => {
            const isWin = result && result.line && result.line.includes(idx);
            const isHovered = hoveredCell === idx && !cell;
            const isLast = lastPlaced === idx;
            return (
              <div
                key={idx}
                data-cell={idx}
                onClick={() => handleCellClick(idx)}
                style={{
                  background: isWin
                    ? result.winner === 'human' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'
                    : isHovered ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.03)',
                  border: isWin
                    ? `2px solid ${result.winner === 'human' ? '#22c55e' : '#ef4444'}`
                    : isHovered ? '2px dashed #a855f7' : '2px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: !cell && turn === 'human' && selectedTileId ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                  position: 'relative',
                  animation: isLast ? 'tilePlace 0.3s ease' : isWin ? 'winPulse 0.6s ease infinite alternate' : 'none',
                }}
              >
                {cell ? (
                  <>
                    <div style={{
                      fontSize: cell.expr.length > 6 ? 13 : 16, fontWeight: 800,
                      color: cell.player === 'human' ? '#3b82f6' : '#f59e0b',
                      textShadow: isWin ? '0 0 10px currentColor' : 'none',
                      lineHeight: 1.1,
                    }}>{cell.expr}</div>
                    
                    <div style={{
                      position: 'absolute', top: 3, right: 5, fontSize: 8, fontWeight: 700,
                      color: cell.player === 'human' ? '#3b82f680' : '#f59e0b80',
                    }}>{cell.player === 'human' ? '✖' : '○'}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.06)' }}>
                    {idx + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Turn indicator */}
        {!result && (
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: turn === 'human' ? '#3b82f6' : '#f59e0b', textAlign: 'center' }}>
            {turn === 'human' ? '✖ Your turn — tap a tile, then a cell' : '○ QBot is thinking...'}
          </div>
        )}

        {/* Round result */}
        {result && (
          <div style={{ marginTop: 12, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
            <div style={{
              fontSize: 20, fontWeight: 900, marginBottom: 4,
              color: result.winner === 'human' ? '#22c55e' : result.winner === 'bot' ? '#ef4444' : '#fbbf24',
            }}>
              {result.winner === 'human' ? '🎉 You Win!' : result.winner === 'bot' ? '😅 QBot Wins!' : '🤝 Draw!'}
            </div>
            {result.value && (
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                Winning row: all equal <strong style={{ color: '#a855f7' }}>{result.value}</strong>
              </div>
            )}
            <button onClick={nextRound} style={{ ...btn('#a855f7'), marginTop: 10, padding: '10px 28px' }}>
              {round < TOTAL_ROUNDS ? `Next Round (${round + 1}/${TOTAL_ROUNDS})` : 'See Results'}
            </button>
          </div>
        )}
      </div>

      {/* Tile pool */}
      {!result && (
        <div style={{
          padding: '10px 12px 16px', background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center', marginBottom: 6, fontWeight: 600 }}>
            YOUR TILES — tap one, then tap a cell on the board (or drag it)
          </div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            justifyContent: 'center', maxWidth: 400, margin: '0 auto',
          }}>
            {tiles.map(tile => {
              const used = board.some(c => c && c.id === tile.id);
              if (used) return null;
              const isSelected = selectedTileId === tile.id;
              return (
                <div
                  key={tile.id}
                  onPointerDown={(e) => handleTilePointerDown(tile.id, e)}
                  onClick={() => { if (turn === 'human' && !result) { SFX.select(); setSelectedTileId(tile.id); } }}
                  style={{
                    padding: '8px 14px', borderRadius: 10,
                    background: isSelected ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                    border: isSelected ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.08)',
                    color: '#e2e8f0', fontSize: 14, fontWeight: 700,
                    cursor: turn === 'human' ? 'grab' : 'default',
                    transition: 'all 0.15s',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 12px rgba(168,85,247,0.3)' : 'none',
                    touchAction: 'none',
                    userSelect: 'none',
                    position: 'relative',
                  }}
                >
                  <span>{tile.expr}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating drag ghost */}
      {dragging && (() => {
        const tile = tiles.find(t => t.id === dragging.tileId);
        if (!tile) return null;
        return (
          <div style={{
            position: 'fixed', left: dragging.x - 35, top: dragging.y - 22,
            padding: '8px 16px', borderRadius: 10,
            background: 'rgba(168,85,247,0.25)', border: '2px solid #a855f7',
            color: '#fff', fontSize: 15, fontWeight: 800,
            pointerEvents: 'none', zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            transform: 'rotate(-3deg)',
          }}>{tile.expr}</div>
        );
      })()}

      <style>{`
        @keyframes tilePlace { 0%{transform:scale(0.7);opacity:0} 50%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        @keyframes winPulse { 0%{box-shadow:0 0 5px rgba(255,255,255,0.1)} 100%{box-shadow:0 0 20px rgba(255,255,255,0.2)} }
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(6px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
};

/* ── QBot Bubble ── */
const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(168,85,247,0.06)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(168,85,247,0.12)' }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #a855f7', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const BG = 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)';
const FONT = '"Inter","Segoe UI",system-ui,sans-serif';
function btn(bg) { return { padding: '12px 24px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, textAlign: 'center' }; }

export default CrossesKnots;
