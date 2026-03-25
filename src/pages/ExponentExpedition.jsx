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

function pow(base, exp) {
  return base ** exp;
}

function expForm(base, exp) {
  return `${base}^${exp}`;
}

function buildStringOptions(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  return shuffle(Array.from(set)).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildStringOptions(answer, candidates.map((c) => c.value));
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

  if (mode === 0) {
    const base = randInt(2, hard ? 7 : 5);
    const exp = hard ? randInt(0, 5) : randInt(1, 4);
    const answer = String(pow(base, exp));
    const multiplyInstead = String(base * exp);
    const addInstead = String(base + exp);
    const offByOne = String(pow(base, Math.max(0, exp - 1)));
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: multiplyInstead, message: 'You multiplied base and exponent instead of repeated multiplication.', hint: 'Exponent means repeated multiplication.' },
      { value: addInstead, message: 'You added base and exponent instead of evaluating the power.', hint: 'Do not add base and exponent.' },
      { value: offByOne, message: 'You used the wrong number of factors.', hint: 'Count exponent factors carefully.' },
    ]);
    return {
      prompt: `Evaluate: ${base}^${exp}`,
      answer,
      options,
      misconceptions,
      explain: `${base}^${exp} means multiplying ${base} by itself ${exp} times, which equals ${answer}.`,
    };
  }

  if (mode === 1) {
    const base = randInt(2, hard ? 9 : 7);
    const m = randInt(1, hard ? 7 : 5);
    const n = randInt(1, hard ? 7 : 5);
    const answer = expForm(base, m + n);
    const multiplyExponents = expForm(base, m * n);
    const subtractExponents = expForm(base, Math.max(0, m - n));
    const addBases = expForm(base + base, m + n);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: multiplyExponents, message: 'You multiplied exponents for a product with the same base.', hint: 'Product rule adds exponents.' },
      { value: subtractExponents, message: 'You subtracted exponents instead of adding.', hint: 'For multiplication, add exponents.' },
      { value: addBases, message: 'You changed the base when it should stay the same.', hint: 'Keep the same base.' },
    ]);
    return {
      prompt: `Simplify: ${base}^${m} * ${base}^${n}`,
      answer,
      options,
      misconceptions,
      explain: `Same base product rule: ${base}^${m} * ${base}^${n} = ${base}^(${m}+${n}) = ${answer}.`,
    };
  }

  if (mode === 2) {
    const base = randInt(2, hard ? 8 : 6);
    const m = randInt(2, hard ? 6 : 4);
    const n = randInt(2, hard ? 5 : 4);
    const answer = expForm(base, m * n);
    const addExponents = expForm(base, m + n);
    const basePower = expForm(base ** m, n);
    const keepInner = expForm(base, m);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: addExponents, message: 'You added exponents for a power of a power.', hint: 'Power of power multiplies exponents.' },
      { value: basePower, message: 'You changed the base incorrectly while simplifying.', hint: 'Keep original base form.' },
      { value: keepInner, message: 'You ignored the outer exponent.', hint: 'Apply both exponents.' },
    ]);
    return {
      prompt: `Simplify: (${base}^${m})^${n}`,
      answer,
      options,
      misconceptions,
      explain: `Power of a power rule: (${base}^${m})^${n} = ${base}^(${m}*${n}) = ${answer}.`,
    };
  }

  const base = randInt(2, hard ? 9 : 7);
  const n = randInt(1, hard ? 5 : 4);
  const answer = '1';
  const keepBase = String(base);
  const useExponent = String(n);
  const zeroValue = '0';
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: keepBase, message: 'You treated exponent 0 as keeping the base.', hint: 'Any nonzero base to 0 is 1.' },
    { value: useExponent, message: 'You used the exponent as the value.', hint: 'Exponent 0 gives 1.' },
    { value: zeroValue, message: 'You treated x^0 as 0.', hint: 'Nonzero base to 0 equals 1.' },
  ]);
  return {
    prompt: `Evaluate: ${base}^0`,
    answer,
    options,
    misconceptions,
    explain: `Any nonzero base to the zero power equals 1, so ${base}^0 = 1.`,
  };
}

export default function ExponentExpedition() {
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
  const [feedback, setFeedback] = useState('Solve each exponent challenge.');
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
    setFeedback('Solve each exponent challenge.');
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
        gameName: 'Exponent Expedition',
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
        title="Exponent Expedition"
        subtitle={`Master powers and exponent rules in fast rounds. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Explorer' },
            { value: 'challenge', label: 'Navigator' },
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
      title="Exponent Expedition"
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
        endTitle="Expedition Complete"
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
    background: '#f5f3ff',
    border: '1px solid #c4b5fd',
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
