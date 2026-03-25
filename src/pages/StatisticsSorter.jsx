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

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  if (s.length % 2 === 1) return s[mid];
  return (s[mid - 1] + s[mid]) / 2;
}

function range(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[s.length - 1] - s[0];
}

function mode(arr) {
  const counts = new Map();
  arr.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  let bestVal = null;
  let bestCount = 1;
  counts.forEach((c, v) => {
    if (c > bestCount) {
      bestVal = v;
      bestCount = c;
    }
  });
  return bestVal;
}

function fmt(n) {
  return Number.isInteger(n) ? String(n) : Number(n).toFixed(1).replace(/\.0$/, '');
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  while (set.size < 4) {
    const base = Number(answer);
    const jitter = randInt(1, 8);
    if (Number.isFinite(base)) set.add(fmt(base + (Math.random() > 0.5 ? jitter : -jitter)));
    else {
      const labels = ['Mean', 'Median', 'Mode', 'Range'];
      set.add(labels[randInt(0, labels.length - 1)]);
    }
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

function buildComputeQuestion(hard) {
  const data = Array.from({ length: hard ? 7 : 5 }, () => randInt(4, hard ? 42 : 28));
  const metric = ['mean', 'median', 'range', 'mode'][randInt(0, hard ? 3 : 2)];
  if (metric === 'mode') {
    const idx = randInt(0, data.length - 1);
    data[idx] = data[0];
  }
  const answerVal = metric === 'mean' ? mean(data) : metric === 'median' ? median(data) : metric === 'range' ? range(data) : (mode(data) ?? data[0]);
  const answer = fmt(answerVal);
  const sorted = [...data].sort((a, b) => a - b);
  const wrongSum = fmt(data.reduce((a, b) => a + b, 0));
  const wrongMiddleIndex = fmt(sorted[Math.floor(sorted.length / 2) + 1] ?? sorted[sorted.length - 1]);
  const wrongMax = fmt(sorted[sorted.length - 1]);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: wrongSum, message: 'You used the total sum instead of the requested statistic.', hint: 'Check which measure is asked.' },
    { value: wrongMiddleIndex, message: 'You picked the wrong middle position.', hint: 'Sort first, then find center.' },
    { value: wrongMax, message: 'You selected a data value, not the statistic.', hint: 'Compute the measure.' },
  ]);
  return {
    prompt: `Data: ${data.join(', ')}. Find the ${metric}.`,
    answer,
    options,
    misconceptions,
    explain:
      metric === 'mean'
        ? `Mean = total ÷ count = ${data.reduce((a, b) => a + b, 0)} ÷ ${data.length} = ${answer}.`
        : metric === 'median'
          ? `Median is the middle of sorted data (${sorted.join(', ')}), so ${answer}.`
          : metric === 'range'
            ? `Range = max - min = ${sorted[sorted.length - 1]} - ${sorted[0]} = ${answer}.`
            : `Mode is the most frequent value, so ${answer}.`,
  };
}

function buildBestMeasureQuestion() {
  const scenario = randInt(0, 2);
  if (scenario === 0) {
    const answer = 'Median';
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: 'Mean', message: 'Mean is pulled by extreme values here.', hint: 'Outliers affect mean a lot.' },
      { value: 'Mode', message: 'Mode does not describe center well for this set.', hint: 'Need middle measure.' },
      { value: 'Range', message: 'Range is spread, not center.', hint: 'Choose a center measure.' },
    ]);
    return {
      prompt: 'Class scores include one very low outlier. Which measure best describes typical performance?',
      answer,
      options,
      misconceptions,
      explain: 'Median resists outliers and better represents the typical score here.',
    };
  }
  if (scenario === 1) {
    const answer = 'Mode';
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: 'Mean', message: 'Mean gives an average, not the most common category.', hint: 'Need most frequent value.' },
      { value: 'Median', message: 'Median is middle position, not most common.', hint: 'Look for repeated value.' },
      { value: 'Range', message: 'Range is spread only.', hint: 'Need frequency measure.' },
    ]);
    return {
      prompt: 'A store wants the most common shoe size sold. Which measure should they use?',
      answer,
      options,
      misconceptions,
      explain: 'Mode gives the most frequently occurring value.',
    };
  }
  const answer = 'Range';
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: 'Mean', message: 'Mean measures center, not spread.', hint: 'Ask: center or spread?' },
    { value: 'Median', message: 'Median measures center only.', hint: 'Need variability measure.' },
    { value: 'Mode', message: 'Mode measures frequency, not spread.', hint: 'Need max-min difference.' },
  ]);
  return {
    prompt: 'A coach wants to know how spread out race times are. Which measure is best?',
    answer,
    options,
    misconceptions,
    explain: 'Range shows spread by max - min.',
  };
}

function buildOutlierQuestion(hard) {
  const base = Array.from({ length: hard ? 6 : 5 }, () => randInt(10, 30));
  const outlier = randInt(55, 95);
  const before = mean(base);
  const after = mean([...base, outlier]);
  const answer = after > before ? 'Increase' : 'Decrease';
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: 'Decrease', message: 'A high outlier typically pulls the mean upward, not downward.', hint: 'Outlier value is much larger.' },
    { value: 'No change', message: 'Adding a very different value changes the mean.', hint: 'Mean uses every value.' },
  ]);
  return {
    prompt: `Data: ${base.join(', ')}. Add outlier ${outlier}. What happens to the mean?`,
    answer,
    options,
    misconceptions,
    explain: `Original mean ${fmt(before)}; new mean ${fmt(after)}. The mean increases.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 2 : 1);
  if (mode === 0) return buildComputeQuestion(hard);
  if (mode === 1) return buildBestMeasureQuestion();
  return buildOutlierQuestion(hard);
}

export default function StatisticsSorter() {
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
  const [feedback, setFeedback] = useState('Sort scenarios by the best statistic.');
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
    setFeedback('Sort scenarios by the best statistic.');
    setDone(false);
    setHistory([]);
    setMisconceptionMisses({});
  };

  const submit = () => {
    if (!current || !selected) return;
    const correct = String(selected) === String(current.answer);
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
        gameName: 'Statistics Sorter',
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
        title="Statistics Sorter"
        subtitle={`Use mean, median, mode, and range strategically. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Data Scout' },
            { value: 'challenge', label: 'Data Strategist' },
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
      title="Statistics Sorter"
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
        endTitle="Sort Complete"
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
        endCardStyle={{ maxWidth: 460, margin: '8px auto' }}
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
    background: '#fffbeb',
    border: '1px solid #fcd34d',
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
