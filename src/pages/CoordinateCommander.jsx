import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import { saveGameResult } from '../utils/storage';
import { resolveGameGradeBand } from '../utils/gameGradeBands';
import { END_CARD_STYLE, FEEDBACK_STYLE, PRIMARY_BTN_STYLE, REVIEW_STYLE, SECONDARY_BTN_STYLE } from '../utils/quickGameStyles';

const TOTAL_ROUNDS = 8;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gradeConfig(band) {
  if (band === 'g6') return { min: -4, max: 4, label: 'Grade 6' };
  if (band === 'g7') return { min: -6, max: 6, label: 'Grade 7' };
  if (band === 'g8') return { min: -8, max: 8, label: 'Grade 8' };
  return { min: -10, max: 10, label: 'Algebra/HS' };
}

function buildTargets(mode, bounds) {
  const points = [];
  while (points.length < TOTAL_ROUNDS) {
    const x = mode === 'all' ? randInt(bounds.min, bounds.max) : randInt(1, bounds.max);
    const y = mode === 'all' ? randInt(bounds.min, bounds.max) : randInt(1, bounds.max);
    if (x === 0 || y === 0) continue;
    if (!points.some((p) => p.x === x && p.y === y)) points.push({ x, y });
  }
  return points;
}

function quadrantOf(point) {
  if (point.x > 0 && point.y > 0) return 'I';
  if (point.x < 0 && point.y > 0) return 'II';
  if (point.x < 0 && point.y < 0) return 'III';
  return 'IV';
}

export default function CoordinateCommander() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');
  const gradeParam = searchParams.get('grade') || '';
  const { returnUrl, goBack } = useGameReturn();
  const band = resolveGameGradeBand(gradeParam);
  const bounds = gradeConfig(band);

  const [mode, setMode] = useState(null); // q1 | all
  const [targets, setTargets] = useState([]);
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);

  const current = targets[round];
  const board = useMemo(() => {
    const rows = [];
    for (let y = bounds.max; y >= bounds.min; y -= 1) {
      const row = [];
      for (let x = bounds.min; x <= bounds.max; x += 1) {
        row.push({ x, y });
      }
      rows.push(row);
    }
    return rows;
  }, [bounds.max, bounds.min]);

  const startGame = (nextMode) => {
    setMode(nextMode);
    setTargets(buildTargets(nextMode, bounds));
    setRound(0);
    setGuess(null);
    setScore(0);
    setFeedback('Click the coordinate where the target should be.');
    setDone(false);
    setHistory([]);
  };

  const submitGuess = () => {
    if (!guess || !current) return;
    const correct = guess.x === current.x && guess.y === current.y;
    const nextHistory = [...history, { target: current, guess, correct }];
    setHistory(nextHistory);
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Great hit! (${current.x}, ${current.y}) is in quadrant ${quadrantOf(current)}.`);
    } else {
      setFeedback(`Close! Target was (${current.x}, ${current.y}), you chose (${guess.x}, ${guess.y}).`);
    }

    if (round + 1 >= TOTAL_ROUNDS) {
      setDone(true);
      saveGameResult({
        gameName: 'Coordinate Commander',
        score: correct ? score + 1 : score,
        total: TOTAL_ROUNDS,
        assignmentId,
        classId,
      });
      return;
    }

    setRound((r) => r + 1);
    setGuess(null);
  };

  if (!mode) {
    return (
      <QuickGameLayout
        returnUrl={returnUrl}
        goBack={goBack}
        title="Coordinate Commander"
        subtitle={`Plot points on the coordinate plane and train graphing accuracy. (${bounds.label})`}
      >
        <div style={styles.row}>
          <button style={PRIMARY_BTN_STYLE} onClick={() => startGame('q1')}>Quadrant I Only</button>
          <button style={SECONDARY_BTN_STYLE} onClick={() => startGame('all')}>All Four Quadrants</button>
        </div>
        {returnUrl && <LoopContinueButton onClick={goBack} />}
      </QuickGameLayout>
    );
  }

  const percent = Math.round((score / TOTAL_ROUNDS) * 100);

  return (
    <QuickGameLayout
      returnUrl={returnUrl}
      goBack={goBack}
      title="Coordinate Commander"
      subtitle={`Round ${Math.min(round + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${bounds.label}`}
    >

      {!done && current && (
        <div style={styles.prompt}>
          Target: <strong>({current.x}, {current.y})</strong> - click the matching point.
        </div>
      )}

      <div style={styles.gridWrap}>
        {board.map((row) => (
          <div key={`row-${row[0].y}`} style={styles.gridRow}>
            {row.map((cell) => {
              const isAxis = cell.x === 0 || cell.y === 0;
              const isOrigin = cell.x === 0 && cell.y === 0;
              const isGuess = guess && guess.x === cell.x && guess.y === cell.y;
              return (
                <button
                  key={`${cell.x},${cell.y}`}
                  type="button"
                  onClick={() => !done && setGuess(cell)}
                  style={{
                    ...styles.cell,
                    background: isGuess ? '#60a5fa' : isAxis ? '#f1f5f9' : '#ffffff',
                    borderColor: isOrigin ? '#0f172a' : '#cbd5e1',
                    cursor: done ? 'default' : 'pointer',
                  }}
                >
                  {isOrigin ? '0' : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {!done ? (
        <button type="button" onClick={submitGuess} disabled={!guess} style={PRIMARY_BTN_STYLE}>
          Submit Guess
        </button>
      ) : (
        <div style={{ ...END_CARD_STYLE, maxWidth: 400, margin: '8px auto' }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Mission Complete</div>
          <div style={{ marginTop: 6 }}>Final score: {score}/{TOTAL_ROUNDS} ({percent}%)</div>
          <button type="button" onClick={() => startGame(mode)} style={{ ...PRIMARY_BTN_STYLE, marginTop: 12 }}>
            Play Again
          </button>
        </div>
      )}

      <p style={{ ...FEEDBACK_STYLE }}>{feedback}</p>
      {done && (
        <div style={{ ...REVIEW_STYLE, maxWidth: 460 }}>
          {history.map((h, i) => (
            <div key={`r-${i}`} style={{ color: h.correct ? '#166534' : '#991b1b' }}>
              {i + 1}. Target ({h.target.x}, {h.target.y}) - Guess ({h.guess.x}, {h.guess.y}) - {h.correct ? 'Correct' : 'Miss'}
            </div>
          ))}
        </div>
      )}
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </QuickGameLayout>
  );
}

const styles = {
  prompt: {
    background: '#e0f2fe',
    border: '1px solid #7dd3fc',
    borderRadius: 10,
    maxWidth: 460,
    margin: '0 auto 12px',
    padding: '10px 12px',
    fontWeight: 600,
  },
  row: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 },
  gridWrap: {
    margin: '10px auto 12px',
    display: 'inline-flex',
    flexDirection: 'column',
    border: '2px solid #cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#fff',
  },
  gridRow: { display: 'flex' },
  cell: {
    width: 28,
    height: 28,
    border: '1px solid #cbd5e1',
    fontSize: 11,
    fontWeight: 700,
    color: '#334155',
  },
};
