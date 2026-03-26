import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import QuickGameLayout from '../components/QuickGameLayout';
import useGameReturn from '../hooks/useGameReturn';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';
import { END_CARD_STYLE, FEEDBACK_STYLE, PRIMARY_BTN_STYLE, REVIEW_STYLE, SECONDARY_BTN_STYLE } from '../utils/quickGameStyles';

const TOTAL_ROUNDS = 10;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rangeFor(level, band) {
  if (band === 'g6') return level === 'easy' ? 10 : 15;
  if (band === 'g7') return level === 'easy' ? 15 : 20;
  if (band === 'g8') return level === 'easy' ? 20 : 25;
  return level === 'easy' ? 25 : 35;
}

function buildRound(level, band) {
  const range = rangeFor(level, band);
  const start = randInt(-range, range);
  const op = Math.random() > 0.5 ? '+' : '-';
  const amount = randInt(1, level === 'easy' ? Math.max(8, Math.floor(range * 0.5)) : Math.max(12, Math.floor(range * 0.7)));
  const answer = op === '+' ? start + amount : start - amount;
  return {
    start,
    op,
    amount,
    answer: Math.max(-range, Math.min(range, answer)),
    range,
  };
}

export default function IntegerIsland() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');
  const gradeParam = searchParams.get('grade') || '';
  const { returnUrl, goBack } = useGameReturn();
  const band = resolveGameGradeBand(gradeParam);

  const [level, setLevel] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Pick your answer on the number line.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);

  const current = rounds[index];
  const ticks = useMemo(() => {
    if (!current) return [];
    const t = [];
    for (let i = -current.range; i <= current.range; i += 1) t.push(i);
    return t;
  }, [current]);

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setRounds(Array.from({ length: TOTAL_ROUNDS }, () => buildRound(nextLevel, band)));
    setIndex(0);
    setGuess(null);
    setScore(0);
    setFeedback('Pick your answer on the number line.');
    setDone(false);
    setHistory([]);
  };

  const submit = () => {
    if (guess == null || !current) return;
    const correct = guess === current.answer;
    const nextHistory = [...history, { ...current, guess, correct }];
    setHistory(nextHistory);
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Correct integer operation. ${current.start} ${current.op} ${current.amount} = ${current.answer}.`);
    } else {
      setFeedback(`Not correct yet. Recompute the integer operation: ${current.start} ${current.op} ${current.amount} = ${current.answer}.`);
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Integer Island',
        score: finalScore,
        total: TOTAL_ROUNDS,
        assignmentId,
        classId,
      });
      return;
    }

    setIndex((i) => i + 1);
    setGuess(null);
  };

  if (!level) {
    return (
      <QuickGameLayout
        returnUrl={returnUrl}
        goBack={goBack}
        title="Integer Island"
        subtitle={`Move along the number line with positive and negative jumps. (${gameGradeBandLabel(band)})`}
      >
        <div style={styles.row}>
          <button style={PRIMARY_BTN_STYLE} onClick={() => startGame('easy')}>Easy (-10 to 10)</button>
          <button style={SECONDARY_BTN_STYLE} onClick={() => startGame('challenge')}>Challenge (-20 to 20)</button>
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
      title="Integer Island"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >

      {!done && current && (
        <div style={styles.prompt}>
          Start at <strong>{current.start}</strong>, then move <strong>{current.op}{current.amount}</strong>. Where do you land?
        </div>
      )}

      <div style={styles.lineWrap}>
        {ticks.map((n) => {
          const selected = guess === n;
          const axis = n === 0;
          return (
            <button
              key={n}
              type="button"
              onClick={() => !done && setGuess(n)}
              style={{
                ...styles.tick,
                background: selected ? '#93c5fd' : '#fff',
                borderColor: axis ? '#0f172a' : '#cbd5e1',
                fontWeight: axis ? 900 : 600,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {!done ? (
        <button type="button" onClick={submit} disabled={guess == null} style={PRIMARY_BTN_STYLE}>
          Submit
        </button>
      ) : (
        <div style={{ ...END_CARD_STYLE, maxWidth: 400, margin: '8px auto' }}>
          <div style={{ fontWeight: 800, fontSize: 20 }}>Voyage Complete</div>
          <div style={{ marginTop: 6 }}>Final score: {score}/{TOTAL_ROUNDS} ({percent}%)</div>
          <button type="button" onClick={() => startGame(level)} style={{ ...PRIMARY_BTN_STYLE, marginTop: 12 }}>
            Play Again
          </button>
        </div>
      )}

      <p style={FEEDBACK_STYLE}>{feedback}</p>
      {done && (
        <div style={{ ...REVIEW_STYLE, maxWidth: 560 }}>
          {history.map((h, i) => (
            <div key={`h-${i}`} style={{ color: h.correct ? '#166534' : '#991b1b' }}>
              {i + 1}. {h.start} {h.op} {h.amount} = {h.answer} | You picked {h.guess} - {h.correct ? 'Correct' : 'Miss'}
            </div>
          ))}
        </div>
      )}
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </QuickGameLayout>
  );
}

const styles = {
  row: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 },
  prompt: {
    background: '#ecfeff',
    border: '1px solid #67e8f9',
    borderRadius: 10,
    maxWidth: 520,
    margin: '0 auto 12px',
    padding: '10px 12px',
    fontWeight: 600,
  },
  lineWrap: {
    margin: '8px auto 12px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    maxWidth: 900,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: 10,
  },
  tick: {
    minWidth: 36,
    padding: '7px 6px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    color: '#334155',
    cursor: 'pointer',
    fontSize: 13,
  },
};
