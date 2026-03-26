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

function fmtSlope(m) {
  if (m === 0) return '0';
  return String(m);
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => {
    if (Number.isFinite(c)) set.add(String(c));
  });
  while (set.size < 4) {
    const jitter = randInt(1, 5);
    set.add(String(Number(answer) + (Math.random() > 0.5 ? jitter : -jitter)));
  }
  return shuffle(Array.from(set)).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildOptionSet(answer, candidates.map((c) => c.value));
  const misconceptions = {};
  candidates.forEach((c) => {
    const key = String(c.value);
    if (key !== String(answer) && options.includes(key)) {
      misconceptions[key] = { message: c.message, hint: c.hint || c.message };
    }
  });
  return { options, misconceptions };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, 2);
  const m = hard ? randInt(-6, 6) : randInt(-4, 5);
  const slope = m === 0 ? 2 : m;
  const b = hard ? randInt(-6, 8) : randInt(-3, 6);

  if (mode === 0) {
    const x1 = randInt(-4, 4);
    const x2 = x1 + randInt(1, 5);
    const y1 = slope * x1 + b;
    const y2 = slope * x2 + b;
    const prompt = `What is the slope between points (${x1}, ${y1}) and (${x2}, ${y2})?`;
    const answer = String((y2 - y1) / (x2 - x1));
    const reciprocal = (x2 - x1) / (y2 - y1);
    const unsignedSlope = Math.abs((y2 - y1) / (x2 - x1));
    const riseOnly = y2 - y1;
    const runOnly = x2 - x1;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: reciprocal, message: 'You flipped rise and run (used run/rise).', hint: 'Use rise over run.' },
      { value: unsignedSlope, message: 'You ignored the sign of the slope.', hint: 'Check if slope is negative.' },
      { value: riseOnly, message: 'You used only rise, not rise divided by run.', hint: 'Include run in the denominator.' },
      { value: runOnly, message: 'You used only run, not rise divided by run.', hint: 'Use rise as numerator.' },
    ]);
    return {
      prompt,
      answer,
      options,
      misconceptions,
      explain: `Slope = (y2 - y1)/(x2 - x1) = (${y2 - y1})/(${x2 - x1}) = ${answer}.`,
    };
  }

  if (mode === 1) {
    const prompt = `Line is y = ${slope}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}. What is the slope?`;
    const answer = fmtSlope(slope);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: b, message: 'You selected the intercept b instead of the slope m.', hint: 'm is the coefficient of x.' },
      { value: -slope, message: 'You flipped the sign of the slope.', hint: 'Keep the original sign on m.' },
      { value: 1, message: 'You treated the coefficient as an implied 1.', hint: 'Read the actual coefficient on x.' },
      { value: -b, message: 'You used negative intercept, not the slope.', hint: 'Do not use b for slope.' },
    ]);
    return {
      prompt,
      answer,
      options,
      misconceptions,
      explain: `In y = mx + b form, slope is m. Here m = ${answer}.`,
    };
  }

  const rise = hard ? randInt(-9, 9) : randInt(-6, 6);
  const safeRise = rise === 0 ? 3 : rise;
  const run = randInt(1, hard ? 6 : 4);
  const prompt = `A line rises ${safeRise} units when run is ${run} units. What is the slope?`;
  const answer = String(safeRise / run);
  const reciprocal = run / safeRise;
  const riseOnly = safeRise;
  const runOnly = run;
  const unsignedSlope = Math.abs(safeRise / run);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: reciprocal, message: 'You used run/rise instead of rise/run.', hint: 'Order matters: rise over run.' },
    { value: riseOnly, message: 'You used rise only; slope needs rise divided by run.', hint: 'Divide rise by run.' },
    { value: runOnly, message: 'You used run only; slope needs rise divided by run.', hint: 'Use both rise and run.' },
    { value: unsignedSlope, message: 'You dropped the sign when calculating slope.', hint: 'Keep negative direction if present.' },
  ]);
  return {
    prompt,
    answer,
    options,
    misconceptions,
    explain: `Slope = rise/run = ${safeRise}/${run} = ${answer}.`,
  };
}

export default function SlopeShowdown() {
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
  const [feedback, setFeedback] = useState('Find the slope value.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [misconceptionMisses, setMisconceptionMisses] = useState({});

  const current = questions[index];

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setQuestions(Array.from({ length: TOTAL_ROUNDS }, () => buildQuestion(nextLevel, band)));
    setIndex(0);
    setSelected('');
    setScore(0);
    setFeedback('Find the slope value.');
    setDone(false);
    setHistory([]);
    setMisconceptionMisses({});
  };

  const submit = () => {
    if (!current || !selected) return;
    const correct = selected === current.answer;
    const nextHistory = [...history, { ...current, selected, correct }];
    setHistory(nextHistory);
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Correct slope reasoning and result. ${current.explain}`);
    } else {
      const misconception = current.misconceptions?.[selected];
      let missCount = 0;
      const misconceptionKey = misconception?.message || '';
      if (misconceptionKey) {
        missCount = (misconceptionMisses[misconceptionKey] || 0) + 1;
        setMisconceptionMisses((prev) => ({
          ...prev,
          [misconceptionKey]: (prev[misconceptionKey] || 0) + 1,
        }));
      }
      if (misconception && missCount < 2) {
        setFeedback(`Hint: ${misconception.hint}`);
      } else {
        setFeedback(`${misconception ? `${misconception.message} ` : ''}${current.explain}`);
      }
    }
    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Slope Showdown',
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
        title="Slope Showdown"
        subtitle={`Match slope from equations, points, and rise/run. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Rookie' },
            { value: 'challenge', label: 'Veteran' },
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
      title="Slope Showdown"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Slope Champion"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
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
        endCardStyle={{ maxWidth: 440, margin: '8px auto' }}
        feedbackStyle={{ maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
        reviewStyle={{ maxWidth: 900 }}
      />
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </QuickGameLayout>
  );
}

const styles = {
  row: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 },
  prompt: {
    background: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: 10,
    maxWidth: 760,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  answers: {
    maxWidth: 700,
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
