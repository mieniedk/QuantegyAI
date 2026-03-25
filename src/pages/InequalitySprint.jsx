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

function ineqText(symbol, value) {
  return `x ${symbol} ${value}`;
}

function buildOptionSet(answer, candidates) {
  const set = new Set([answer]);
  candidates.forEach((c) => set.add(c));
  while (set.size < 4) {
    const fallbackValue = randInt(-10, 14);
    const symbols = ['>', '<', '>=', '<='];
    set.add(ineqText(symbols[randInt(0, symbols.length - 1)], fallbackValue));
  }
  return shuffle(Array.from(set)).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildOptionSet(answer, candidates.map((c) => c.value));
  const misconceptions = {};
  candidates.forEach((c) => {
    if (c.value !== answer && options.includes(c.value)) {
      misconceptions[c.value] = { message: c.message, hint: c.hint || c.message };
    }
  });
  return { options, misconceptions };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 2 : 1);

  // One-step add/sub inequalities
  if (mode === 0) {
    const x = hard ? randInt(-10, 12) : randInt(-7, 9);
    const delta = randInt(2, hard ? 10 : 7);
    const dir = Math.random() > 0.5 ? '>' : '<';
    const op = Math.random() > 0.5 ? '+' : '-';
    const rhs = op === '+' ? x + delta : x - delta;
    const prompt = `Solve: x ${op} ${delta} ${dir} ${rhs}`;
    const answer = ineqText(dir, x);
    const wrongInverse = ineqText(dir, op === '+' ? rhs + delta : rhs - delta);
    const flipSign = ineqText(dir, -x);
    const flipDirection = ineqText(dir === '>' ? '<' : '>', x);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: wrongInverse, message: 'You used the wrong inverse operation.', hint: 'Undo with the opposite operation.' },
      { value: flipSign, message: 'You changed the sign of the boundary value.', hint: 'Keep boundary sign consistent.' },
      { value: flipDirection, message: 'You flipped the inequality direction unnecessarily.', hint: 'Only flip with negative multiply/divide.' },
    ]);
    return {
      prompt,
      answer,
      options,
      misconceptions,
      explain:
        op === '+'
          ? `Subtract ${delta} on both sides. Inequality direction stays the same, so ${answer}.`
          : `Add ${delta} on both sides. Inequality direction stays the same, so ${answer}.`,
    };
  }

  // One-step multiply/divide, including sign-flip cases
  if (mode === 1) {
    const x = hard ? randInt(-9, 10) : randInt(-6, 8);
    const factor = randInt(2, hard ? 9 : 6);
    const negative = hard ? Math.random() > 0.35 : Math.random() > 0.6;
    const coeff = negative ? -factor : factor;
    const dir = Math.random() > 0.5 ? '>=' : '<=';
    const rhs = coeff * x;
    const prompt = `Solve: ${coeff}x ${dir} ${rhs}`;
    const finalDir = coeff < 0 ? (dir === '>=' ? '<=' : '>=') : dir;
    const answer = ineqText(finalDir, x);
    const noFlip = ineqText(dir, x);
    const wrongBoundary = ineqText(finalDir, rhs / Math.abs(coeff));
    const oppositeDir = ineqText(finalDir === '>=' ? '<=' : '>=', x);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: noFlip, message: 'You did not flip the inequality after dividing by a negative.', hint: 'Negative division flips direction.' },
      { value: wrongBoundary, message: 'You used the wrong boundary value for x.', hint: 'Divide by the full coefficient.' },
      { value: oppositeDir, message: 'You flipped to the wrong direction symbol.', hint: 'Flip once, to the opposite symbol.' },
    ]);
    return {
      prompt,
      answer,
      options,
      misconceptions,
      explain:
        coeff < 0
          ? `Divide by ${coeff}. Because it is negative, flip the inequality: ${answer}.`
          : `Divide by ${coeff}. Coefficient is positive, so direction stays: ${answer}.`,
    };
  }

  // Two-step with negative coefficient
  const x = hard ? randInt(-8, 9) : randInt(-6, 7);
  const factor = randInt(2, hard ? 8 : 6);
  const coeff = -factor;
  const constant = randInt(2, hard ? 12 : 8);
  const dir = Math.random() > 0.5 ? '>' : '<';
  const rhs = coeff * x + constant;
  const prompt = `Solve: ${coeff}x + ${constant} ${dir} ${rhs}`;
  const normalized = rhs - constant;
  const finalDir = dir === '>' ? '<' : '>';
  const answer = ineqText(finalDir, x);
  const forgotSubtract = ineqText(finalDir, rhs / coeff);
  const forgotFlip = ineqText(dir, normalized / coeff);
  const wrongSign = ineqText(finalDir, -x);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: forgotSubtract, message: 'You skipped isolating the x-term before dividing.', hint: 'Undo constant first.' },
    { value: forgotFlip, message: 'You forgot to flip the inequality after dividing by a negative.', hint: 'Negative division flips inequality.' },
    { value: wrongSign, message: 'You changed the boundary sign incorrectly.', hint: 'Recompute boundary value carefully.' },
  ]);
  return {
    prompt,
    answer,
    options,
    misconceptions,
    explain: `Subtract ${constant}: ${coeff}x ${dir} ${normalized}. Divide by ${coeff} (negative), so flip direction: ${answer}.`,
  };
}

export default function InequalitySprint() {
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
  const [feedback, setFeedback] = useState('Solve each inequality for x.');
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
    setFeedback('Solve each inequality for x.');
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
        gameName: 'Inequality Sprint',
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
        title="Inequality Sprint"
        subtitle={`Solve inequalities and track direction changes. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Runner' },
            { value: 'challenge', label: 'Sprinter' },
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
      title="Inequality Sprint"
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
        endTitle="Sprint Complete"
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
    background: '#ecfeff',
    border: '1px solid #67e8f9',
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
