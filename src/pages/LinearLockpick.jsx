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
    const delta = randInt(1, 6);
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
  const mode = randInt(0, hard ? 2 : 1);

  if (mode === 0) {
    const x = hard ? randInt(-10, 12) : randInt(-6, 10);
    const addend = randInt(2, hard ? 12 : 8);
    const addMode = Math.random() > 0.5;
    const rightSide = addMode ? x + addend : x - addend;
    const prompt = addMode ? `Solve: x + ${addend} = ${rightSide}` : `Solve: x - ${addend} = ${rightSide}`;
    const answer = x;
    const addedInstead = addMode ? rightSide + addend : rightSide + addend;
    const signFlip = -x;
    const usedRightSide = rightSide;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: addedInstead, message: 'You moved the constant the wrong way.', hint: 'Use the inverse operation.' },
      { value: signFlip, message: 'You flipped the sign of the solution.', hint: 'Recheck integer signs.' },
      { value: usedRightSide, message: 'You treated the right side as x directly.', hint: 'Isolate x first.' },
    ]);
    return {
      prompt,
      answer: String(answer),
      options,
      misconceptions,
      explain: addMode
        ? `Subtract ${addend} from both sides: x = ${rightSide} - ${addend} = ${answer}.`
        : `Add ${addend} to both sides: x = ${rightSide} + ${addend} = ${answer}.`,
    };
  }

  if (mode === 1) {
    const factor = randInt(2, hard ? 8 : 6);
    const multMode = Math.random() > 0.5;
    const x = multMode
      ? (hard ? randInt(-9, 9) : randInt(-6, 8))
      : (hard ? randInt(-8, 8) : randInt(-6, 6)) * factor;
    const rightSide = multMode ? factor * x : x / factor;
    const prompt = multMode ? `Solve: ${factor}x = ${rightSide}` : `Solve: x / ${factor} = ${rightSide}`;
    const answer = x;
    const multipliedInstead = multMode ? rightSide * factor : rightSide * factor * factor;
    const dividedInstead = multMode ? rightSide / factor : rightSide / factor;
    const signFlip = -answer;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: multipliedInstead, message: 'You applied multiplication in the wrong place.', hint: 'Undo with inverse operation.' },
      { value: dividedInstead, message: 'You divided when you needed to multiply (or vice versa).', hint: 'Use the opposite operation.' },
      { value: signFlip, message: 'You reversed the sign of x.', hint: 'Check the sign of x.' },
    ]);
    return {
      prompt,
      answer: String(answer),
      options,
      misconceptions,
      explain: multMode
        ? `Divide both sides by ${factor}: x = ${rightSide}/${factor} = ${answer}.`
        : `Multiply both sides by ${factor}: x = ${rightSide}(${factor}) = ${answer}.`,
    };
  }

  const x = hard ? randInt(-8, 10) : randInt(-5, 8);
  const coefficient = randInt(2, hard ? 7 : 5);
  const constant = randInt(1, hard ? 12 : 8);
  const plusMode = Math.random() > 0.5;
  const rightSide = plusMode ? coefficient * x + constant : coefficient * x - constant;
  const prompt = plusMode
    ? `Solve: ${coefficient}x + ${constant} = ${rightSide}`
    : `Solve: ${coefficient}x - ${constant} = ${rightSide}`;
  const answer = x;
  const skippedStep = rightSide / coefficient;
  const wrongInverse = plusMode
    ? (rightSide + constant) / coefficient
    : (rightSide - constant) / coefficient;
  const forgotDivide = plusMode ? rightSide - constant : rightSide + constant;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: skippedStep, message: 'You divided before clearing the constant term.', hint: 'Undo +/− term first.' },
    { value: wrongInverse, message: 'You used the wrong inverse for the constant term.', hint: 'Reverse + and − correctly.' },
    { value: forgotDivide, message: 'You forgot to divide by the coefficient.', hint: 'Last step: divide by coefficient.' },
  ]);
  return {
    prompt,
    answer: String(answer),
    options,
    misconceptions,
    explain: plusMode
      ? `Subtract ${constant}: ${coefficient}x=${rightSide - constant}, then divide by ${coefficient}: x=${answer}.`
      : `Add ${constant}: ${coefficient}x=${rightSide + constant}, then divide by ${coefficient}: x=${answer}.`,
  };
}

export default function LinearLockpick() {
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
  const [feedback, setFeedback] = useState('Solve for x to pick the lock.');
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
    setFeedback('Solve for x to pick the lock.');
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
      setFeedback(`Correct linear-equation setup and solve. ${current.explain}`);
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
        gameName: 'Linear Lockpick',
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
        title="Linear Lockpick"
        subtitle={`Unlock equations by isolating x fast. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Practice Locks' },
            { value: 'challenge', label: 'Vault Locks' },
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
      title="Linear Lockpick"
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
        endTitle="Locks Opened"
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
