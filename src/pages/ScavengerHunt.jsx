import React, { useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';

/* ═══════════════════════════════════════════════════════════
   MATH SCAVENGER HUNT — Follow clues, solve problems,
   and find the hidden treasure!
   ═══════════════════════════════════════════════════════════ */

function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

const CLUES = [
  { id: 1, place: 'Library', icon: '📚', riddle: 'Where stories live and numbers hide. Your first clue is waiting inside!' },
  { id: 2, place: 'Cafeteria', icon: '🍎', riddle: 'Where lunch is served and trays are stacked. The next clue is in the back!' },
  { id: 3, place: 'Gym', icon: '🏃', riddle: 'Balls bounce and runners race. Solve this to reach the next place!' },
  { id: 4, place: 'Science Lab', icon: '🔬', riddle: 'Beakers bubble, formulas flow. One more answer, then you go!' },
  { id: 5, place: 'Art Room', icon: '🎨', riddle: 'Paint and clay and colors bright. Almost there — one more right!' },
  { id: 6, place: 'Treasure Chest', icon: '💎', riddle: 'The final challenge! Solve to claim your reward!' },
];

function genPuzzle(index) {
  const gens = [
    () => { const a = randInt(15, 60); const b = randInt(5, 20); return { q: `${a} + ${b} = ?`, ans: a + b }; },
    () => { const a = randInt(30, 80); const b = randInt(10, 25); return { q: `${a} − ${b} = ?`, ans: a - b }; },
    () => { const a = randInt(2, 9); const b = randInt(2, 9); return { q: `${a} × ${b} = ?`, ans: a * b }; },
    () => { const b = randInt(2, 7); const ans = randInt(3, 9); return { q: `${b * ans} ÷ ${b} = ?`, ans }; },
    () => { const n = randInt(2, 4); const ans = randInt(2, 8); const d = n * ans; return { q: `⅟${n} of ${d} = ?`, ans }; },
    () => { const a = randInt(100, 300); const b = randInt(50, 100); return { q: `${a} + ${b} = ?`, ans: a + b }; },
  ];
  const g = gens[index % gens.length]();
  const wrongs = [g.ans + randInt(1, 6), g.ans - randInt(1, 5), g.ans + randInt(7, 15)].filter((w) => w > 0 && w !== g.ans);
  const choices = [...new Set([g.ans, ...wrongs])].slice(0, 4).sort(() => Math.random() - 0.5);
  return { ...g, choices };
}

export default function ScavengerHunt() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('sid') || '';
  const classId = searchParams.get('cid') || '';
  const assignmentId = searchParams.get('aid') || '';

  const [clueIndex, setClueIndex] = useState(0);
  const [puzzle, setPuzzle] = useState(() => genPuzzle(0));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [startTime] = useState(() => Date.now());
  const [won, setWon] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const clue = CLUES[clueIndex];
  const isLast = clueIndex === CLUES.length - 1;

  const handleAnswer = useCallback(
    (choice) => {
      if (feedback) return;
      setSelected(choice);
      const correct = choice === puzzle.ans;
      if (correct) {
        setFeedback('correct');
        setTimeout(() => {
          setFeedback(null);
          setSelected(null);
          if (isLast) {
            setWon(true);
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const score = Math.max(0, 100 - wrongAttempts * 8);
            if (studentId || assignmentId || classId) {
              let aid = assignmentId;
              if (!aid && classId) {
                const match = findMatchingAssignment(classId, 'scavenger-hunt');
                if (match) aid = match.id;
              }
              saveGameResult({
                studentId,
                assignmentId: aid || `unassigned-${Date.now()}`,
                classId: classId || '',
                gameId: 'scavenger-hunt',
                score,
                correct: CLUES.length - wrongAttempts,
                total: CLUES.length,
                time: elapsed,
              });
            }
          } else {
            setClueIndex((i) => i + 1);
            setPuzzle(genPuzzle(clueIndex + 1));
          }
        }, 900);
      } else {
        setWrongAttempts((w) => w + 1);
        setFeedback('wrong');
        setTimeout(() => {
          setFeedback(null);
          setSelected(null);
        }, 1200);
      }
    },
    [puzzle, feedback, isLast, clueIndex, wrongAttempts, startTime, studentId, assignmentId, classId]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0c4a6e 0%, #075985 30%, #0e7490 70%, #0c4a6e 100%)',
        fontFamily: '"Inter","Segoe UI",system-ui,sans-serif',
        color: '#fff',
        padding: '24px 20px 48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Link
        to="/games"
        style={{
          color: 'rgba(255,255,255,0.8)',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
          alignSelf: 'flex-start',
          marginBottom: 12,
        }}
      >
        ← Back to Games
      </Link>

      {!won ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 36 }}>🗺️</span>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>Math Scavenger Hunt</h1>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>
            Follow the clues! Solve each problem to find the treasure.
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CLUES.map((c, i) => (
              <div
                key={c.id}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: i < clueIndex ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : i === clueIndex ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                  border: i === clueIndex ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                {i < clueIndex ? '✓' : c.icon}
              </div>
            ))}
          </div>

          {/* Clue card */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding: 28,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 48 }}>{clue.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Clue {clueIndex + 1}: {clue.place}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                  {clue.riddle}
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{puzzle.q}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {puzzle.choices.map((c) => {
                  const isSelected = selected === c;
                  const isCorrect = feedback === 'correct' && c === puzzle.ans;
                  const isWrong = feedback === 'wrong' && c === selected;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleAnswer(c)}
                      disabled={!!feedback}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: `2px solid ${isCorrect ? '#22c55e' : isWrong ? '#ef4444' : isSelected ? '#fbbf24' : 'rgba(255,255,255,0.3)'}`,
                        background: isCorrect ? 'rgba(34,197,94,0.3)' : isWrong ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 20,
                        fontWeight: 800,
                        cursor: feedback ? 'default' : 'pointer',
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {wrongAttempts > 0 && (
            <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(251,191,36,0.9)' }}>
              Wrong attempts: {wrongAttempts}
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            maxWidth: 420,
            background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.3))',
            borderRadius: 24,
            padding: 40,
            border: '2px solid #fbbf24',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, margin: '0 0 8px' }}>Treasure Found!</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
            You solved all {CLUES.length} clues and found the treasure. Amazing work!
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, fontSize: 14 }}>
              Score: {Math.max(0, 100 - wrongAttempts * 8)}%
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.2)', borderRadius: 10, fontSize: 14 }}>
              Time: {Math.round((Date.now() - startTime) / 1000)}s
            </div>
          </div>
          <Link
            to="/games"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
              color: '#0c4a6e',
              borderRadius: 12,
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 15,
            }}
          >
            Back to Games
          </Link>
        </div>
      )}
    </div>
  );
}
