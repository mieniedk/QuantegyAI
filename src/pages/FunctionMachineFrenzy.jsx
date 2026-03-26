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

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  while (set.size < 4) {
    const delta = randInt(1, 8);
    set.add(String(Number(answer) + (Math.random() > 0.5 ? delta : -delta)));
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
  const mode = randInt(0, 1); // 0 predict output, 1 identify rule
  const slope = hard ? randInt(-5, 6) || 2 : randInt(1, 4);
  const intercept = hard ? randInt(-8, 10) : randInt(-2, 6);
  const x = hard ? randInt(-5, 8) : randInt(0, 8);
  const y = slope * x + intercept;

  if (mode === 0) {
    const missedIntercept = slope * x;
    const addInsteadOfMultiply = x + intercept;
    const usedXAsOne = slope + intercept;
    const signFlip = -y;
    const { options, misconceptions } = buildOptionsWithMisconceptions(y, [
      {
        value: missedIntercept,
        message: 'You multiplied by x but forgot to add/subtract the intercept.',
        hint: 'After mx, include b.',
      },
      {
        value: addInsteadOfMultiply,
        message: 'You added x and intercept instead of computing mx + b.',
        hint: 'Use multiplication first: mx + b.',
      },
      { value: usedXAsOne, message: 'You treated x like 1 and computed m + b.', hint: 'Substitute the given x-value.' },
      { value: signFlip, message: 'You flipped the sign of the final output.', hint: 'Check sign handling at the end.' },
    ]);
    const prompt = `Function machine rule is f(x) = ${slope}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept)}. What is f(${x})?`;
    return {
      prompt,
      answer: String(y),
      options,
      misconceptions,
      explain: `Substitute x=${x}: ${slope}(${x}) ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept)} = ${y}.`,
    };
  }

  const x2 = x + 1;
  const y2 = slope * x2 + intercept;
  const prompt = `A function machine maps ${x} -> ${y} and ${x2} -> ${y2}. Which rule matches?`;
  const correct = `f(x) = ${slope}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept)}`;
  const wrong1 = `f(x) = ${slope + 1}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept)}`; // slope offset error
  const wrong2 = `f(x) = ${slope}x ${-intercept >= 0 ? '+' : '-'} ${Math.abs(-intercept)}`; // sign mistake on intercept
  const wrong3 = `f(x) = ${-slope}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept)}`; // slope sign flip
  const wrong4 = `f(x) = ${slope}x ${y >= 0 ? '+' : '-'} ${Math.abs(y)}`; // using output as intercept
  const options = shuffle(Array.from(new Set([correct, wrong1, wrong2, wrong3, wrong4]))).slice(0, 4);
  const misconceptions = {
    [wrong1]: { message: 'You used the wrong rate of change (slope).', hint: 'Match the slope from both points.' },
    [wrong2]: { message: 'You changed the intercept sign incorrectly.', hint: 'Check the sign of b.' },
    [wrong3]: { message: 'You reversed slope direction (sign error).', hint: 'Recheck slope direction/sign.' },
    [wrong4]: { message: 'You treated an output value like the intercept.', hint: 'Use x=0 to reason about intercept.' },
  };
  return {
    prompt,
    answer: correct,
    options,
    misconceptions,
    explain: `Rate of change is ${y2 - y} per +1 in x, so slope=${slope}; using ${x} -> ${y} gives intercept ${intercept}.`,
  };
}

export default function FunctionMachineFrenzy() {
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
  const [feedback, setFeedback] = useState('Choose the best function answer.');
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
    setFeedback('Choose the best function answer.');
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
      setFeedback(`Correct function output and rule application. ${current.explain}`);
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
        gameName: 'Function Machine Frenzy',
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
        title="Function Machine Frenzy"
        subtitle={`Crack function machine rules and outputs. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Builder' },
            { value: 'challenge', label: 'Engineer' },
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
      title="Function Machine Frenzy"
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
        endTitle="Machine Mastered"
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
    background: '#eef2ff',
    border: '1px solid #a5b4fc',
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
