import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   MATH MEMORY MATCH
   Flip cards to find pairs of expressions that equal the same value.
   e.g. "2 + 3" and "7 − 2" both equal 5 → that's a match!
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  flip:  () => tone(600, 0.1, 'sine', 0.08),
  match: () => { tone(523, 0.15); setTimeout(() => tone(659, 0.15), 80); setTimeout(() => tone(784, 0.2), 160); },
  miss:  () => tone(200, 0.25, 'triangle', 0.08),
  win:   () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => tone(f, 0.3, 'sine', 0.1), i * 120)); },
  perfect: () => { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => tone(f, 0.25, 'sine', 0.12), i * 100)); },
};

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ── Expression groups: each sub-array has expressions that share the same value ── */
const GROUPS = {
  easy: [
    { value: 5,  exprs: ['2 + 3', '4 + 1', '7 − 2', '10 − 5', '1 + 4'] },
    { value: 9,  exprs: ['6 + 3', '10 − 1', '5 + 4', '1 + 8'] },
    { value: 7,  exprs: ['3 + 4', '8 − 1', '5 + 2', '10 − 3'] },
    { value: 10, exprs: ['5 + 5', '2 + 8', '3 + 7', '6 + 4'] },
    { value: 6,  exprs: ['9 − 3', '4 + 2', '3 + 3', '10 − 4'] },
    { value: 8,  exprs: ['1 + 7', '10 − 2', '6 + 2', '3 + 5'] },
    { value: 4,  exprs: ['9 − 5', '1 + 3', '6 − 2', '10 − 6'] },
    { value: 3,  exprs: ['8 − 5', '1 + 2', '9 − 6', '7 − 4'] },
    { value: 2,  exprs: ['6 − 4', '8 − 6', '1 + 1', '5 − 3'] },
    { value: 1,  exprs: ['7 − 6', '3 − 2', '9 − 8', '4 − 3'] },
  ],
  medium: [
    { value: 18, exprs: ['6 × 3', '9 × 2', '3 × 6', '2 × 9'] },
    { value: 20, exprs: ['4 × 5', '10 × 2', '5 × 4', '2 × 10'] },
    { value: 24, exprs: ['3 × 8', '6 × 4', '4 × 6', '8 × 3'] },
    { value: 30, exprs: ['5 × 6', '6 × 5', '3 × 10', '10 × 3'] },
    { value: 36, exprs: ['9 × 4', '6 × 6', '4 × 9', '12 × 3'] },
    { value: 35, exprs: ['7 × 5', '5 × 7', '70 − 35'] },
    { value: 21, exprs: ['7 × 3', '3 × 7', '42 ÷ 2'] },
    { value: 28, exprs: ['7 × 4', '4 × 7', '14 × 2'] },
    { value: 40, exprs: ['5 × 8', '8 × 5', '4 × 10', '10 × 4'] },
    { value: 27, exprs: ['9 × 3', '3 × 9', '54 ÷ 2'] },
    { value: 32, exprs: ['8 × 4', '4 × 8', '16 × 2'] },
    { value: 15, exprs: ['3 × 5', '5 × 3', '30 ÷ 2'] },
  ],
  hard: [
    { value: 48, exprs: ['12 × 4', '8 × 6', '6 × 8', '4 × 12'] },
    { value: 63, exprs: ['7 × 9', '9 × 7', '126 ÷ 2'] },
    { value: 56, exprs: ['8 × 7', '7 × 8', '14 × 4', '4 × 14'] },
    { value: 72, exprs: ['9 × 8', '8 × 9', '12 × 6', '6 × 12'] },
    { value: 45, exprs: ['9 × 5', '5 × 9', '15 × 3', '3 × 15'] },
    { value: 66, exprs: ['11 × 6', '6 × 11', '33 × 2', '2 × 33'] },
    { value: 60, exprs: ['12 × 5', '5 × 12', '15 × 4', '4 × 15'] },
    { value: 55, exprs: ['11 × 5', '5 × 11', '110 ÷ 2'] },
    { value: 88, exprs: ['11 × 8', '8 × 11', '44 × 2', '2 × 44'] },
    { value: 42, exprs: ['7 × 6', '6 × 7', '21 × 2', '14 × 3'] },
    { value: 36, exprs: ['12 × 3', '3 × 12', '9 × 4', '4 × 9'] },
    { value: 81, exprs: ['9 × 9', '27 × 3', '3 × 27'] },
  ],
};

const DIFFICULTY = {
  easy:   { label: 'Easy',   emoji: '🌱', pairs: 6,  gridCols: 4, starThresh: [8, 12] },
  medium: { label: 'Medium', emoji: '🔥', pairs: 8,  gridCols: 4, starThresh: [12, 18] },
  hard:   { label: 'Hard',   emoji: '💎', pairs: 10, gridCols: 5, starThresh: [16, 24] },
};

const QBOT_MSGS = {
  start: [
    "Flip two cards — find expressions that equal the same number! 🧠",
    "Memory + math! Match expressions with equal values! 🎯",
    "Solve the math in your head to find the pairs! 🤖",
  ],
  match: [
    "Great match! 🎉", "You found a pair! 🌟", "Nice memory! Keep going! ⭐",
    "Boom! That's a match! 💥", "Your brain is on fire! 🔥",
  ],
  miss: [
    "Not a match — try to remember those! 🤔", "Close! Remember where those are! 📝",
    "Hmm, not quite. You'll get it! 💪", "Keep those positions in mind! 🧠",
  ],
  win: [
    "Amazing memory! You found all the pairs! 🏆",
    "You did it! What a brain workout! 🧠✨",
    "All pairs matched! You're a memory champion! 🎉",
  ],
  perfect: [
    "PERFECT SCORE! Not a single mistake! 🤩🏆",
    "Flawless! Zero missed matches — unbelievable! ⭐⭐⭐",
    "Incredible! Perfect memory! You're a genius! 🧠💎",
  ],
};

/* ── Build board: each pair = two expressions with the same value ── */
function buildBoard(difficulty) {
  const diff = DIFFICULTY[difficulty];
  const groups = shuffle(GROUPS[difficulty]).slice(0, diff.pairs);

  const cards = [];
  groups.forEach((group, pairIdx) => {
    const picked = shuffle(group.exprs).slice(0, 2);
    cards.push({ id: `a-${pairIdx}`, pairId: pairIdx, display: picked[0], value: group.value });
    cards.push({ id: `b-${pairIdx}`, pairId: pairIdx, display: picked[1], value: group.value });
  });

  return { cards: shuffle(cards), pairs: groups.map(g => ({ value: g.value })) };
}

/* ── Main component ── */
export default function MathMemory() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');

  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [pairInfo, setPairInfo] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT_MSGS.start));
  const [showReview, setShowReview] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [comboAnim, setComboAnim] = useState(false);
  const [lastMatchPair, setLastMatchPair] = useState(-1);
  const [revealValue, setRevealValue] = useState(null);
  const timerRef = useRef(null);
  const lockRef = useRef(false);
  const missesRef = useRef(0);

  const { returnUrl, goBack } = useGameReturn();
  const diff = difficulty ? DIFFICULTY[difficulty] : null;
  const totalPairs = diff ? diff.pairs : 0;

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [running]);

  const startGame = useCallback((level) => {
    const { cards: c, pairs } = buildBoard(level);
    setDifficulty(level);
    setCards(c);
    setPairInfo(pairs);
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setMisses(0);
    missesRef.current = 0;
    setTimer(0);
    setRunning(true);
    setGameOver(false);
    setStreak(0);
    setBestStreak(0);
    setLastMatchPair(-1);
    setRevealValue(null);
    setQbotMsg(pick(QBOT_MSGS.start));
    lockRef.current = false;
  }, []);

  const flipCard = useCallback((idx) => {
    if (lockRef.current || gameOver) return;
    if (flipped.includes(idx) || matched.has(cards[idx]?.pairId)) return;

    SFX.flip();
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (!running) setRunning(true);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      const cardA = cards[a], cardB = cards[b];

      if (cardA.pairId === cardB.pairId) {
        setTimeout(() => {
          SFX.match();
          setLastMatchPair(cardA.pairId);
          setRevealValue(cardA.value);
          setTimeout(() => setRevealValue(null), 1200);

          const newMatched = new Set(matched);
          newMatched.add(cardA.pairId);
          setMatched(newMatched);
          setFlipped([]);
          lockRef.current = false;

          setStreak(s => {
            const ns = s + 1;
            setBestStreak(b => Math.max(b, ns));
            if (ns >= 3) {
              setComboAnim(true);
              setTimeout(() => setComboAnim(false), 800);
            }
            return ns;
          });

          const numPairs = DIFFICULTY[difficulty]?.pairs || 0;
          if (newMatched.size === numPairs) {
            const isPerfect = missesRef.current === 0;
            setGameOver(true);
            setRunning(false);
            setQbotMsg(pick(isPerfect ? QBOT_MSGS.perfect : QBOT_MSGS.win));
            isPerfect ? SFX.perfect() : SFX.win();
            saveGameResult({
              gameName: 'Math Memory Match',
              score: numPairs - missesRef.current,
              total: numPairs,
              assignmentId, classId,
            });
          } else {
            setQbotMsg(pick(QBOT_MSGS.match));
          }
        }, 500);
      } else {
        setTimeout(() => {
          SFX.miss();
          setFlipped([]);
          missesRef.current += 1;
          setMisses(m => m + 1);
          setStreak(0);
          setQbotMsg(pick(QBOT_MSGS.miss));
          lockRef.current = false;
        }, 1000);
      }
    }
  }, [flipped, matched, cards, gameOver, running, difficulty, assignmentId, classId]);

  const getStars = () => {
    if (!diff) return 0;
    if (moves <= diff.starThresh[0]) return 3;
    if (moves <= diff.starThresh[1]) return 2;
    return 1;
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (showReview) {
    const results = pairInfo.map((p, i) => {
      const pairCards = cards.filter(c => c.pairId === i);
      return {
        question: pairCards.map(c => c.display).join('  and  '),
        correctAnswer: `Both equal ${p.value}`,
        studentAnswer: matched.has(i) ? `Matched ✓` : 'Not found',
        correct: matched.has(i),
      };
    });
    return <GameReview gameName="Math Memory Match" results={results} onBack={() => setShowReview(false)} />;
  }

  /* ── How to play overlay ── */
  const howToOverlay = showHowTo && (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      backdropFilter: 'blur(6px)', animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20,
        padding: 24, maxWidth: 380, width: '100%',
        border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 14, textAlign: 'center' }}>
          🧠 How to Play
        </div>
        <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16 }}>1.</span>
            <span>Tap a card to <strong style={{ color: '#fff' }}>flip</strong> it and see the math expression underneath.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16 }}>2.</span>
            <span>Flip a <strong style={{ color: '#fff' }}>second card</strong>. Solve both expressions in your head!</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16 }}>3.</span>
            <span>If both expressions <strong style={{ color: '#22c55e' }}>equal the same number</strong>, it's a match! They stay face up.</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ color: '#a855f7', fontWeight: 800, fontSize: 16 }}>4.</span>
            <span>If not, they flip back. <strong style={{ color: '#fbbf24' }}>Remember their positions!</strong></span>
          </div>
          <div style={{ background: 'rgba(168,85,247,0.08)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(168,85,247,0.15)', fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
            <strong style={{ color: '#c4b5fd' }}>Example:</strong> "2 + 3" and "7 − 2" are a match because both equal <strong style={{ color: '#a855f7' }}>5</strong>!
          </div>
        </div>
        <button onClick={() => setShowHowTo(false)} style={{
          ...btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)'),
          width: '100%', marginTop: 16,
        }}>Got it!</button>
      </div>
    </div>
  );

  /* ── Difficulty select ── */
  if (!difficulty) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ position: 'absolute', top: 16, left: 16, background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        )}
        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 6, textAlign: 'center' }}>🧠 Math Memory Match</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, textAlign: 'center', maxWidth: 340 }}>
          Flip cards and match expressions that equal the same number!
        </div>

        <div style={{ marginBottom: 20 }}>
          <QBotBubble msg="Find the pairs! Two expressions that equal the same number = a match! 🤖" />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <button key={key} onClick={() => startGame(key)} style={{
              ...btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)'),
              minWidth: 140, padding: '16px 20px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ fontSize: 28 }}>{d.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{d.label}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{d.pairs} pairs · {d.pairs * 2} cards</div>
            </button>
          ))}
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </div>
    );
  }

  /* ── Game screen ── */
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 12px 24px' }}>
      {howToOverlay}

      {/* Value reveal toast */}
      {revealValue !== null && (
        <div style={{
          position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
          fontSize: 48, fontWeight: 900, color: '#22c55e',
          textShadow: '0 0 30px rgba(34,197,94,0.5)', zIndex: 150,
          animation: 'valueReveal 1.2s ease forwards', pointerEvents: 'none',
        }}>= {revealValue}!</div>
      )}

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        {returnUrl ? (
          <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}>← Continue</button>
        ) : (
          <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        )}
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>🧠 Memory Match</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{diff.emoji} {diff.label}</div>
          <button onClick={() => setShowHowTo(true)} style={{
            width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.3)',
            background: 'rgba(168,85,247,0.1)', color: '#a855f7', fontSize: 13, fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>?</button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ width: '100%', maxWidth: 540, display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8, flexWrap: 'wrap' }}>
        <StatBadge label="Matches" value={`${matched.size}/${totalPairs}`} color="#22c55e" />
        <StatBadge label="Moves" value={moves} color="#3b82f6" />
        <StatBadge label="Misses" value={misses} color="#ef4444" />
        <StatBadge label="Time" value={fmtTime(timer)} color="#f59e0b" />
        {streak >= 2 && (
          <div style={{
            fontSize: 12, fontWeight: 800, color: '#f59e0b', padding: '2px 10px',
            background: 'rgba(245,158,11,0.1)', borderRadius: 8,
            animation: comboAnim ? 'comboPop 0.4s ease' : 'none',
          }}>
            🔥 {streak} streak!
          </div>
        )}
      </div>

      {/* QBot */}
      <div style={{ maxWidth: 540, width: '100%', marginBottom: 10, padding: '0 4px' }}>
        <QBotBubble msg={qbotMsg} />
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${diff.gridCols}, 1fr)`,
        gap: 8,
        maxWidth: 540,
        width: '100%',
        padding: '0 4px',
      }}>
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx);
          const isMatched = matched.has(card.pairId);
          const isLastMatch = card.pairId === lastMatchPair && isMatched;
          const showFront = isFlipped || isMatched;

          return (
            <div
              key={card.id}
              onClick={() => flipCard(idx)}
              style={{
                aspectRatio: '1',
                perspective: 600,
                cursor: isMatched ? 'default' : 'pointer',
              }}
            >
              <div style={{
                width: '100%', height: '100%',
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                transform: showFront ? 'rotateY(180deg)' : 'rotateY(0)',
              }}>
                {/* Card back */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
                  border: '2px solid rgba(168,85,247,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}>
                  <div style={{ fontSize: 22, opacity: 0.4 }}>🤖</div>
                </div>

                {/* Card front */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 12,
                  background: isMatched
                    ? 'linear-gradient(135deg, #065f46, #047857)'
                    : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                  border: isMatched ? '2px solid #22c55e' : '2px solid rgba(139,92,246,0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isMatched ? '0 0 20px rgba(34,197,94,0.25)' : '0 4px 16px rgba(0,0,0,0.3)',
                  animation: isLastMatch ? 'matchPop 0.5s ease' : 'none',
                  padding: 6,
                }}>
                  <div style={{
                    fontSize: card.display.length > 7 ? 12 : card.display.length > 5 ? 14 : 17,
                    fontWeight: 800, color: '#fff',
                    textAlign: 'center', lineHeight: 1.2,
                  }}>{card.display}</div>
                  {isMatched && (
                    <div style={{ fontSize: 9, color: '#86efac', fontWeight: 700, marginTop: 4 }}>= {card.value} ✓</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Game over overlay */}
      {gameOver && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(6px)', padding: 20,
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20,
            padding: 28, maxWidth: 360, width: '100%', textAlign: 'center',
            border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>
              {misses === 0 ? '🤩' : '🎉'}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {misses === 0 ? 'Perfect Memory!' : 'All Pairs Found!'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1,2,3].map(s => (
                <span key={s} style={{ fontSize: 28, filter: s <= getStars() ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
              <MiniStat label="Moves" value={moves} />
              <MiniStat label="Misses" value={misses} />
              <MiniStat label="Time" value={fmtTime(timer)} />
              <MiniStat label="Best Streak" value={bestStreak} />
            </div>

            <QBotBubble msg={qbotMsg} />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button onClick={() => startGame(difficulty)} style={btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)')}>
                Play Again
              </button>
              <button onClick={() => setDifficulty(null)} style={btnStyle('linear-gradient(135deg,#475569,#334155)')}>
                Change Level
              </button>
              <button onClick={() => setShowReview(true)} style={btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)')}>
                Review Pairs
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes matchPop { 0%{transform:rotateY(180deg) scale(1)} 40%{transform:rotateY(180deg) scale(1.15)} 100%{transform:rotateY(180deg) scale(1)} }
        @keyframes comboPop { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes valueReveal { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)} 20%{opacity:1;transform:translate(-50%,-50%) scale(1.2)} 40%{transform:translate(-50%,-50%) scale(1)} 80%{opacity:1} 100%{opacity:0;transform:translate(-50%,-70%) scale(0.8)} }
      `}</style>
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </div>
  );
}

/* ── Small components ── */
const StatBadge = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
  </div>
);

const MiniStat = ({ label, value }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{value}</div>
    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
  </div>
);

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
function btnStyle(bg) { return { padding: '12px 20px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }; }
