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

function sortedSample(size, min, max) {
  const arr = Array.from({ length: size }, () => randInt(min, max));
  return arr.sort((a, b) => a - b);
}

function sum(arr) {
  return arr.reduce((acc, n) => acc + n, 0);
}

function median(arr) {
  const mid = Math.floor(arr.length / 2);
  if (arr.length % 2 === 1) return arr[mid];
  return (arr[mid - 1] + arr[mid]) / 2;
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => {
    if (Number.isFinite(c)) set.add(String(c));
  });
  while (set.size < 4) {
    const jitter = randInt(1, 6);
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
  const mode = randInt(0, hard ? 3 : 2);
  const size = hard ? randInt(6, 8) : randInt(5, 7);
  const data = sortedSample(size, hard ? 2 : 1, hard ? 28 : 20);
  const min = data[0];
  const max = data[data.length - 1];
  const total = sum(data);
  const avg = Number((total / data.length).toFixed(1));
  const med = median(data);
  const range = max - min;

  if (mode === 0) {
    const answer = avg;
    const noDivide = total;
    const divideWrongCount = Number((total / (data.length - 1)).toFixed(1));
    const middleOnly = med;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: noDivide, message: 'You found the sum, not the mean.', hint: 'Mean is total divided by count.' },
      { value: divideWrongCount, message: 'You divided by the wrong number of data points.', hint: 'Count all data values.' },
      { value: middleOnly, message: 'You used the median instead of the mean.', hint: 'Mean uses every value.' },
    ]);
    return {
      prompt: `Data set: ${data.join(', ')}\nWhat is the mean?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Mean = total ÷ count = ${total} ÷ ${data.length} = ${answer}.`,
    };
  }

  if (mode === 1) {
    const answer = med;
    const meanInstead = avg;
    const rangeInstead = range;
    const wrongMiddle = data[Math.max(0, Math.floor(data.length / 2) - 1)];
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: meanInstead, message: 'You used mean instead of median.', hint: 'Median is the middle value.' },
      { value: rangeInstead, message: 'You used range instead of median.', hint: 'Median is not max minus min.' },
      { value: wrongMiddle, message: 'You selected the wrong middle position.', hint: 'Order data and locate center.' },
    ]);
    return {
      prompt: `Data set: ${data.join(', ')}\nWhat is the median?`,
      answer: String(answer),
      options,
      misconceptions,
      explain:
        data.length % 2 === 1
          ? `Median is the middle of ordered data, which is ${answer}.`
          : `Median is the average of the two middle values, which is ${answer}.`,
    };
  }

  if (mode === 2) {
    const answer = range;
    const maxOnly = max;
    const minOnly = min;
    const addInstead = max + min;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: maxOnly, message: 'You used the maximum only, not the range.', hint: 'Range uses max and min.' },
      { value: minOnly, message: 'You used the minimum only, not the range.', hint: 'Subtract min from max.' },
      { value: addInstead, message: 'You added max and min instead of subtracting.', hint: 'Range is max minus min.' },
    ]);
    return {
      prompt: `Data set: ${data.join(', ')}\nWhat is the range?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Range = maximum - minimum = ${max} - ${min} = ${answer}.`,
    };
  }

  // Outlier effect on mean
  const outlier = hard ? randInt(45, 70) : randInt(30, 50);
  const answer = 'Increase';
  const choices = ['Increase', 'Decrease', 'Stay the same', 'Cannot be determined'];
  return {
    prompt: `Data set: ${data.join(', ')}\nIf we add an outlier value ${outlier}, what happens to the mean?`,
    answer,
    options: shuffle(choices),
    misconceptions: {
      Decrease: { message: 'A high outlier pulls the mean up, not down.', hint: 'Large outlier raises average.' },
      'Stay the same': { message: 'Adding a large new value changes the mean.', hint: 'New data point shifts mean.' },
      'Cannot be determined': { message: 'This can be determined from the outlier being much larger.', hint: 'Compare outlier to current values.' },
    },
    explain: `Because ${outlier} is much higher than the existing values, the mean increases.`,
  };
}

export default function DataDetective() {
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
  const [feedback, setFeedback] = useState('Analyze the data and choose the best answer.');
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
    setFeedback('Analyze the data and choose the best answer.');
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
      setFeedback(`Correct! ${current.explain}`);
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
        gameName: 'Data Detective',
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
        title="Data Detective"
        subtitle={`Investigate mean, median, range, and outlier effects. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Investigator' },
            { value: 'challenge', label: 'Chief Analyst' },
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
      title="Data Detective"
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
        endTitle="Case Closed"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt.split('\n')[0]} | You: {h.selected} | Correct: {h.answer}
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
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: 10,
    maxWidth: 780,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
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
