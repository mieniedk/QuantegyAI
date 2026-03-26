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
  candidates.forEach((c) => {
    if (Number.isFinite(c)) set.add(String(c));
  });
  while (set.size < 4) {
    const jitter = randInt(1, 12);
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

function makeQuestionA() {
  const a = randInt(2, 15);
  const b = randInt(2, 12);
  const c = randInt(2, 9);
  const answer = a + b * c;
  const addFirst = (a + b) * c;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: addFirst, message: 'You added before multiplying.', hint: 'Multiply before add.' },
  ]);
  return {
    prompt: `Evaluate: ${a} + ${b} x ${c}`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Multiply first: ${b} x ${c} = ${b * c}, then add ${a} to get ${answer}.`,
  };
}

function makeQuestionB() {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const answer = a * (b + c);
  const ignoreParens = a * b + c;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: ignoreParens, message: 'You ignored the parentheses.', hint: 'Parentheses first.' },
  ]);
  return {
    prompt: `Evaluate: ${a} x (${b} + ${c})`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Parentheses first: ${b}+${c}=${b + c}. Then multiply: ${a} x ${b + c} = ${answer}.`,
  };
}

function makeQuestionC() {
  const a = randInt(10, 25);
  const b = randInt(2, 8);
  const c = randInt(2, 7);
  const d = randInt(2, 12);
  const answer = a - b * c + d;
  const leftToRight = (a - b) * c + d;
  const subFirst = a - b * (c + d);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: leftToRight, message: 'You worked left to right too early.', hint: 'Do multiply first.' },
    { value: subFirst, message: 'You grouped terms that are not grouped.', hint: 'No hidden parentheses.' },
  ]);
  return {
    prompt: `Evaluate: ${a} - ${b} x ${c} + ${d}`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Multiply first: ${b} x ${c} = ${b * c}. Then compute ${a} - ${b * c} + ${d} = ${answer}.`,
  };
}

function makeQuestionD() {
  const a = randInt(2, 10);
  const b = randInt(2, 10);
  const c = randInt(4, 12);
  const d = randInt(1, 6);
  const answer = (a + b) * (c - d);
  const partialParens = (a + b) * c - d;
  const noParens = a + b * c - d;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: partialParens, message: 'You only used one set of parentheses.', hint: 'Both groups first.' },
    { value: noParens, message: 'You ignored grouped operations.', hint: 'Parentheses drive order.' },
  ]);
  return {
    prompt: `Evaluate: (${a} + ${b}) x (${c} - ${d})`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Compute groups first: ${a}+${b}=${a + b} and ${c}-${d}=${c - d}. Then multiply: ${a + b} x ${c - d} = ${answer}.`,
  };
}

function makeQuestionE() {
  const b = randInt(2, 8);
  const c = randInt(2, 7);
  const prod = b * c;
  const d = randInt(2, 6);
  const a = randInt(2, 12);
  const answer = a + prod / d;
  const multiplyLast = (a + b) * c / d;
  const addFirst = (a + prod) / d;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: multiplyLast, message: 'You added before multiply/divide.', hint: 'x and / before +.' },
    { value: addFirst, message: 'You divided the whole sum.', hint: 'Only divide product.' },
  ]);
  return {
    prompt: `Evaluate: ${a} + ${b} x ${c} / ${d}`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Multiply/divide left-to-right: ${b} x ${c} = ${prod}, ${prod} / ${d} = ${prod / d}. Then add ${a}: ${answer}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 4 : 2);
  if (mode === 0) return makeQuestionA();
  if (mode === 1) return makeQuestionB();
  if (mode === 2) return makeQuestionC();
  if (mode === 3) return makeQuestionD();
  return makeQuestionE();
}

export default function OrderOfOperationsDash() {
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
  const [feedback, setFeedback] = useState('Use PEMDAS to unlock each round.');
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
    setFeedback('Use PEMDAS to unlock each round.');
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
      setFeedback(`Correct operation-order reasoning and result. ${current.explain}`);
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
        gameName: 'Order of Operations Dash',
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
        title="Order of Operations Dash"
        subtitle={`Choose the correct PEMDAS result. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Operator' },
            { value: 'challenge', label: 'Order Master' },
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
      title="Order of Operations Dash"
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
        endTitle="Dash Complete"
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
    background: '#eff6ff',
    border: '1px solid #93c5fd',
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
