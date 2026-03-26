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
    const jitter = randInt(1, 8);
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
  const mode = randInt(0, hard ? 2 : 1);

  if (mode === 0) {
    const k = randInt(2, hard ? 11 : 8);
    const b = randInt(2, hard ? 12 : 9);
    const d = randInt(2, hard ? 14 : 10);
    const a = k * b;
    const c = k * d;
    const answer = c;
    const prompt = `Solve for x: ${a}/${b} = x/${d}`;
    const multipliedWrong = a * d;
    const dividedWrong = Math.round(a / d);
    const usedDenominator = d;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: multipliedWrong, message: 'You multiplied across without dividing by the paired denominator.', hint: 'Cross-multiply, then divide.' },
      { value: dividedWrong, message: 'You divided the wrong quantities.', hint: 'Match corresponding ratios.' },
      { value: usedDenominator, message: 'You treated the denominator as the missing numerator.', hint: 'Scale by the same factor.' },
    ]);
    return {
      prompt,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Scale factor is ${a}/${b} = ${k}. So x = ${k} * ${d} = ${answer}.`,
    };
  }

  if (mode === 1) {
    const cups1 = randInt(2, hard ? 8 : 6);
    const water1 = randInt(2, hard ? 12 : 9);
    const scale = randInt(2, hard ? 6 : 4);
    const cups2 = cups1 * scale;
    const answer = water1 * scale;
    const prompt = `A recipe uses ${water1} cups of water for ${cups1} cups of mix. How much water for ${cups2} cups of mix?`;
    const addInstead = water1 + cups2;
    const divideInstead = Math.round(water1 / scale);
    const invertScale = Math.round((cups1 / cups2) * water1);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: addInstead, message: 'You added values instead of using a scale factor.', hint: 'Use multiplicative scaling.' },
      { value: divideInstead, message: 'You divided when the ratio is scaling up.', hint: 'Scaling up means multiply.' },
      { value: invertScale, message: 'You used the inverse ratio.', hint: 'Keep ratio direction consistent.' },
    ]);
    return {
      prompt,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Scale from ${cups1} to ${cups2} by ${scale}. Multiply water by ${scale}: ${water1} * ${scale} = ${answer}.`,
    };
  }

  const miles = randInt(3, hard ? 12 : 9);
  const hours = randInt(1, hard ? 5 : 4);
  const newHours = hours + randInt(1, hard ? 6 : 4);
  const unitRate = miles / hours;
  const answer = unitRate * newHours;
  const prompt = `${miles} miles in ${hours} hours at constant speed. How many miles in ${newHours} hours?`;
  const wrongKeepRate = unitRate;
  const wrongMultiplyAll = miles * newHours;
  const wrongDivide = Math.round(miles / newHours);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: wrongKeepRate, message: 'You gave the unit rate, not the scaled total.', hint: 'Scale unit rate to new time.' },
    { value: wrongMultiplyAll, message: 'You multiplied totals without finding rate first.', hint: 'Find per-1 rate first.' },
    { value: wrongDivide, message: 'You divided by new time instead of scaling.', hint: 'Multiply rate by new time.' },
  ]);
  return {
    prompt,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Unit rate is ${miles}/${hours} = ${unitRate}. Then ${unitRate} * ${newHours} = ${answer}.`,
  };
}

export default function ProportionRescue() {
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
  const [feedback, setFeedback] = useState('Solve each proportion to rescue the mission.');
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
    setFeedback('Solve each proportion to rescue the mission.');
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
      setFeedback(`Correct proportional setup and solve. ${current.explain}`);
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
        gameName: 'Proportion Rescue',
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
        title="Proportion Rescue"
        subtitle={`Solve ratios and proportions to complete each rescue. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Responder' },
            { value: 'challenge', label: 'Commander' },
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
      title="Proportion Rescue"
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
        endTitle="Rescue Complete"
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
    background: '#f0fdf4',
    border: '1px solid #86efac',
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
