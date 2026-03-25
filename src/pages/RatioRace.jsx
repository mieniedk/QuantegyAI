import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import MultipleChoiceRound from '../components/MultipleChoiceRound';
import QuickLevelPicker from '../components/QuickLevelPicker';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';

const TOTAL_ROUNDS = 10;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const maxTerm = band === 'g6' ? 8 : hard ? 14 : 10;
  const a = randInt(1, maxTerm);
  const b = randInt(1, maxTerm);
  const scale = randInt(2, hard ? 8 : 5);
  const c = a * scale;
  const d = b * scale;
  const formatType = band === 'g6' ? randInt(0, 1) : randInt(0, 2);

  if (formatType === 0) {
    const prompt = `${a}:${b} = ${c}:?`;
    const answer = `${d}`;
    const options = shuffle([`${d}`, `${c}`, `${a * b}`, `${Math.max(1, d - scale)}`]);
    const explain = `Scale factor from ${a} to ${c} is ${scale}, so ${b} x ${scale} = ${d}.`;
    return { prompt, answer, options, explain };
  }

  if (formatType === 1) {
    const prompt = `${a}/${b} = ?/${d}`;
    const answer = `${c}`;
    const options = shuffle([`${c}`, `${d}`, `${a + b}`, `${Math.max(1, c - scale)}`]);
    const explain = `To keep an equivalent ratio, multiply both terms by ${scale}: ${a} x ${scale} = ${c}.`;
    return { prompt, answer, options, explain };
  }

  const unit = hard ? randInt(3, 12) : randInt(2, 8);
  const totalA = a * unit;
  const totalB = b * unit;
  const prompt = `A mix uses ratio ${a}:${b}. If first ingredient is ${totalA}, how much of second ingredient is needed?`;
  const answer = `${totalB}`;
  const options = shuffle([`${totalB}`, `${totalA}`, `${a + b}`, `${Math.max(1, totalB - unit)}`]);
  const explain = `${a} became ${totalA}, so scale factor is ${unit}. Apply same factor: ${b} x ${unit} = ${totalB}.`;
  return { prompt, answer, options, explain };
}

export default function RatioRace() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');
  const gradeParam = searchParams.get('grade') || '';
  const { returnUrl, goBack } = useGameReturn();
  const band = resolveGameGradeBand(gradeParam);

  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Choose the equivalent ratio value.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);

  const current = questions[index];
  const progressPct = Math.min(100, Math.round((score / TOTAL_ROUNDS) * 100));

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setQuestions(Array.from({ length: TOTAL_ROUNDS }, () => buildQuestion(nextLevel, band)));
    setIndex(0);
    setSelected('');
    setScore(0);
    setFeedback('Choose the equivalent ratio value.');
    setDone(false);
    setHistory([]);
  };

  const submit = () => {
    if (!current || !selected) return;
    const correct = selected === current.answer;
    const nextHistory = [...history, { ...current, selected, correct }];
    setHistory(nextHistory);

    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Nice! ${current.explain}`);
    } else {
      setFeedback(`Not this time. ${current.explain}`);
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Ratio Race',
        score: finalScore,
        total: TOTAL_ROUNDS,
        assignmentId,
        classId,
      });
      return;
    }

    setIndex((i) => i + 1);
    setSelected('');
  };

  if (!level) {
    return (
      <QuickGameLayout
        returnUrl={returnUrl}
        goBack={goBack}
        title="Ratio Race"
        subtitle={`Solve equivalent ratio checkpoints to keep your racer moving. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Cruise' },
            { value: 'challenge', label: 'Turbo' },
          ]}
          onSelect={startGame}
          returnUrl={returnUrl}
          goBack={goBack}
          rowStyle={styles.row}
        />
      </QuickGameLayout>
    );
  }

  return (
    <QuickGameLayout
      returnUrl={returnUrl}
      goBack={goBack}
      title="Ratio Race"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={(
          <div style={styles.trackWrap}>
            <div style={styles.track}>
              <div style={{ ...styles.runner, left: `${progressPct}%` }}>🏎️</div>
            </div>
          </div>
        )}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Finish Line Crossed"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        restartLabel="Race Again"
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {h.selected} | Correct: {h.answer}
          </span>
        )}
        promptStyle={styles.prompt}
        answersStyle={styles.answers}
        optionStyle={styles.answerBtn}
        selectedOptionStyle={{ background: '#dbeafe', borderColor: '#3b82f6' }}
        endCardStyle={{ maxWidth: 420, margin: '8px auto' }}
        feedbackStyle={{ maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
        reviewStyle={{ maxWidth: 860 }}
      />
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </QuickGameLayout>
  );
}

const styles = {
  row: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 },
  trackWrap: { maxWidth: 700, margin: '4px auto 12px' },
  track: {
    position: 'relative',
    height: 34,
    borderRadius: 999,
    border: '1px solid #cbd5e1',
    background: 'linear-gradient(90deg,#e2e8f0,#f8fafc)',
    overflow: 'hidden',
  },
  runner: {
    position: 'absolute',
    top: 4,
    transform: 'translateX(-50%)',
    transition: 'left 0.3s ease',
    fontSize: 22,
  },
  prompt: {
    background: '#f0f9ff',
    border: '1px solid #7dd3fc',
    borderRadius: 10,
    maxWidth: 640,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 700,
    lineHeight: 1.5,
  },
  answers: {
    maxWidth: 520,
    margin: '0 auto 12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  answerBtn: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#1e293b',
  },
};
