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
    const delta = randInt(1, 7);
    set.add(String(Math.max(1, Number(answer) + (Math.random() > 0.5 ? delta : -delta))));
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
  const mode = randInt(0, 1);
  const qty = hard ? randInt(4, 18) : randInt(2, 12);
  const unitRate = hard ? randInt(3, 15) : randInt(2, 10);
  const total = qty * unitRate;

  if (mode === 0) {
    const multipliedInstead = total * qty;
    const forgotDivideUsedTotal = total;
    const usedQuantity = qty;
    const addError = total + qty;
    const { options, misconceptions } = buildOptionsWithMisconceptions(unitRate, [
      { value: multipliedInstead, message: 'You multiplied instead of finding per-1.', hint: 'Divide to find per-1 rate.' },
      { value: forgotDivideUsedTotal, message: 'You used the total value, not the unit rate.', hint: 'Convert total to per-1.' },
      { value: usedQuantity, message: 'You used the quantity instead of dividing total by quantity.', hint: 'Use total ÷ quantity.' },
      { value: addError, message: 'You added values instead of dividing to find the unit rate.', hint: 'Use division, not addition.' },
    ]);
    const prompt = `${qty} notebooks cost $${total}. What is the unit rate (cost per notebook)?`;
    return {
      prompt,
      answer: String(unitRate),
      options,
      misconceptions,
      explain: `Unit rate = total / quantity = ${total} / ${qty} = ${unitRate}.`,
    };
  }

  const newQty = hard ? randInt(8, 24) : randInt(5, 16);
  const prompt = `A car travels ${total} miles in ${qty} hours. At the same rate, how far in ${newQty} hours?`;
  const answer = unitRate * newQty;
  const keepOldTotal = total;
  const addInsteadMultiply = unitRate + newQty;
  const divideInstead = Math.max(1, Math.round(total / newQty));
  const productError = qty * newQty;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: keepOldTotal, message: 'You kept the old total instead of scaling to the new quantity.', hint: 'Scale to the new amount.' },
    { value: addInsteadMultiply, message: 'You added values instead of multiplying by the unit rate.', hint: 'Distance = rate × time.' },
    { value: divideInstead, message: 'You divided by the new quantity instead of scaling from the unit rate.', hint: 'Find unit rate, then multiply.' },
    { value: productError, message: 'You multiplied the two time/quantity values directly.', hint: "Don't multiply the two quantities." },
  ]);
  return {
    prompt,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Unit rate is ${total}/${qty} = ${unitRate} miles/hour. Multiply by ${newQty}: ${unitRate * newQty}.`,
  };
}

export default function UnitRateRally() {
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
  const [feedback, setFeedback] = useState('Find the unit rate value.');
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
    setFeedback('Find the unit rate value.');
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
      setFeedback(`Correct unit-rate setup and computation. ${current.explain}`);
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
        gameName: 'Unit Rate Rally',
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
        title="Unit Rate Rally"
        subtitle={`Convert totals into per-1 rates and scale fast. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Road' },
            { value: 'challenge', label: 'Highway' },
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
      title="Unit Rate Rally"
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
        endTitle="Rally Complete"
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
