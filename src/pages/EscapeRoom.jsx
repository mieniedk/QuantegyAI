import React, { useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';

/* ═══════════════════════════════════════════════════════════
   ESCAPE ROOM — Solve math puzzles to crack the code & escape!
   Each room has a locked door. Answer correctly to get a digit.
   ═══════════════════════════════════════════════════════════ */

function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

const ROOMS = [
  { id: 1, name: 'The Study', icon: '📚', hint: 'Check the bookshelf...' },
  { id: 2, name: 'The Lab', icon: '🔬', hint: 'Numbers on the chalkboard...' },
  { id: 3, name: 'The Vault', icon: '🔐', hint: 'Solve the equation...' },
  { id: 4, name: 'The Exit', icon: '🚪', hint: 'One last puzzle, then enter the code!' },
];

function genPuzzle(roomIndex) {
  const gens = [
    () => {
      const a = randInt(20, 80);
      const b = randInt(5, 25);
      return { q: `${a} + ${b} = ?`, ans: a + b, teks: '3.4A' };
    },
    () => {
      const a = randInt(40, 99);
      const b = randInt(10, a - 10);
      return { q: `${a} − ${b} = ?`, ans: a - b, teks: '3.4A' };
    },
    () => {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      return { q: `${a} × ${b} = ?`, ans: a * b, teks: '3.4C' };
    },
    () => {
      const b = randInt(2, 8);
      const ans = randInt(2, 9);
      return { q: `${b * ans} ÷ ${b} = ?`, ans, teks: '3.4D' };
    },
    () => {
      const n = randInt(2, 4);
      const d = randInt(2, 8) * n;
      return { q: `⅟${n} of ${d} = ?`, ans: Math.floor(d / n), teks: '3.3F' };
    },
    () => {
      const a = randInt(100, 400);
      const b = randInt(50, 150);
      return { q: `${a} + ${b} = ?`, ans: a + b, teks: '3.4A' };
    },
  ];
  const gen = gens[roomIndex % gens.length];
  const puzzle = gen();
  const ans = puzzle.ans;
  const wrongs = [
    ans + randInt(1, 5),
    ans - randInt(1, 5),
    ans + randInt(6, 12),
  ].map((w) => (w <= 0 ? ans + 7 : w));
  const choices = [...new Set([ans, ...wrongs])].slice(0, 4).sort(() => Math.random() - 0.5);
  return { ...puzzle, choices };
}

export default function EscapeRoom() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('sid') || '';
  const classId = searchParams.get('cid') || '';
  const assignmentId = searchParams.get('aid') || '';

  const [room, setRoom] = useState(1);
  const [code, setCode] = useState([null, null, null, null]);
  const [puzzle, setPuzzle] = useState(() => genPuzzle(0));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [startTime] = useState(() => Date.now());
  const [escaped, setEscaped] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const digitForAnswer = (ans) => Math.abs(ans) % 10;

  const handleAnswer = useCallback(
    (choice) => {
      if (feedback) return;
      setSelected(choice);
      const correct = choice === puzzle.ans;
      if (correct) {
        const digit = digitForAnswer(puzzle.ans);
        setCode((prev) => {
          const next = [...prev];
          next[room - 1] = digit;
          return next;
        });
        setFeedback('correct');
        setTimeout(() => {
          setFeedback(null);
          setSelected(null);
          if (room < 4) {
            setRoom((r) => r + 1);
            setPuzzle(genPuzzle(room));
          }
        }, 800);
      } else {
        setWrongAttempts((w) => w + 1);
        setFeedback('wrong');
        setTimeout(() => {
          setFeedback(null);
          setSelected(null);
        }, 1200);
      }
    },
    [puzzle, room, feedback]
  );

  const handleSubmitCode = useCallback(() => {
    const allFilled = code.every((d) => d !== null);
    if (!allFilled) return;
    setEscaped(true);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const score = Math.max(0, 100 - wrongAttempts * 10);
    if (studentId || assignmentId || classId) {
      let aid = assignmentId;
      if (!aid && classId) {
        const match = findMatchingAssignment(classId, 'escape-room');
        if (match) aid = match.id;
      }
      saveGameResult({
        studentId,
        assignmentId: aid || `unassigned-${Date.now()}`,
        classId: classId || '',
        gameId: 'escape-room',
        score,
        correct: 4 - wrongAttempts,
        total: 4,
        time: elapsed,
      });
    }
  }, [code, wrongAttempts, startTime, studentId, assignmentId, classId]);

  const roomInfo = ROOMS[room - 1];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
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
          color: 'rgba(255,255,255,0.6)',
          textDecoration: 'none',
          fontSize: 13,
          fontWeight: 600,
          alignSelf: 'flex-start',
          marginBottom: 16,
        }}
      >
        ← Back to Games
      </Link>

      <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4, textAlign: 'center' }}>
        🔓 Math Escape Room
      </div>
      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24, textAlign: 'center' }}>
        Solve each room&apos;s puzzle to reveal the escape code!
      </div>

      {/* Progress: 4 code digits */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 32,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: code[i] !== null ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.08)',
              border: `2px solid ${code[i] !== null ? '#22c55e' : 'rgba(255,255,255,0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              boxShadow: code[i] !== null ? '0 0 20px rgba(34,197,94,0.3)' : 'none',
            }}
          >
            {code[i] !== null ? code[i] : '?'}
          </div>
        ))}
      </div>

      {!escaped ? (
        <>
          {/* Current room */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              background: 'rgba(30,41,59,0.8)',
              borderRadius: 20,
              padding: 28,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span style={{ fontSize: 40 }}>{roomInfo.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Room {room}: {roomInfo.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{roomInfo.hint}</div>
              </div>
            </div>

            {room < 4 || code[3] === null ? (
              <>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 20,
                    lineHeight: 1.5,
                  }}
                >
                  {puzzle.q}
                </div>
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
                          padding: 18,
                          borderRadius: 12,
                          border: `2px solid ${
                            isCorrect ? '#22c55e' : isWrong ? '#ef4444' : isSelected ? '#3b82f6' : 'rgba(255,255,255,0.2)'
                          }`,
                          background: isCorrect ? 'rgba(34,197,94,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                          color: '#fff',
                          fontSize: 20,
                          fontWeight: 800,
                          cursor: feedback ? 'default' : 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, marginBottom: 16, color: 'rgba(255,255,255,0.8)' }}>
                  You have all 4 digits! The code is:
                </div>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    letterSpacing: 8,
                    marginBottom: 24,
                    color: '#22c55e',
                  }}
                >
                  {code.map((d) => d ?? '?').join(' ')}
                </div>
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  style={{
                    padding: '16px 48px',
                    borderRadius: 14,
                    border: 'none',
                    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
                  }}
                >
                  🚪 Unlock & Escape!
                </button>
              </div>
            )}
          </div>

          {wrongAttempts > 0 && (
            <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(239,68,68,0.9)' }}>
              Wrong attempts: {wrongAttempts} (each −10 pts)
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(34,197,94,0.15)',
            borderRadius: 20,
            padding: 32,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>You Escaped!</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>
            Amazing work! You cracked the code.
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 10,
                fontSize: 14,
              }}
            >
              Score: {Math.max(0, 100 - wrongAttempts * 10)}%
            </div>
            <div
              style={{
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 10,
                fontSize: 14,
              }}
            >
              Time: {Math.round((Date.now() - startTime) / 1000)}s
            </div>
          </div>
          <Link
            to="/games"
            style={{
              display: 'inline-block',
              marginTop: 24,
              padding: '12px 28px',
              background: '#22c55e',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Back to Games
          </Link>
        </div>
      )}
    </div>
  );
}
