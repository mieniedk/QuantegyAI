import React, { useMemo, useState } from 'react';
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

function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

function fmtMoney(n) {
  return `$${n.toFixed(2)}`;
}

function makeOptions(correct) {
  const set = new Set([correct]);
  while (set.size < 4) {
    const shift = randInt(-6, 6);
    const delta = roundMoney(Math.max(0.25, Math.abs(shift) * 0.75));
    const val = roundMoney(Math.max(0.01, correct + (Math.random() > 0.5 ? delta : -delta)));
    set.add(val);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function buildQuestion(level, band) {
  const easy = level === 'easy';
  const centsAllowed = band !== 'g6';
  const lowPrice = band === 'g6' ? 6 : band === 'g7' ? 8 : 12;
  const highPrice = band === 'g6' ? 80 : band === 'g7' ? 120 : band === 'g8' ? 180 : 260;
  const price = roundMoney(randInt(easy ? lowPrice : lowPrice + 4, easy ? highPrice : highPrice + 60) + (centsAllowed ? randInt(0, 99) / 100 : 0));
  const rates = band === 'g6'
    ? (easy ? [5, 10, 20] : [5, 10, 15, 20, 25])
    : easy
      ? [5, 10, 15, 20, 25]
      : [6, 8, 12, 15, 18, 20, 22, 25, 30];
  const rate = rates[randInt(0, rates.length - 1)];
  const typeRoll = Math.random();
  const type = band === 'g6'
    ? (typeRoll < 0.5 ? 'discount' : 'tax')
    : (typeRoll < 0.34 ? 'discount' : typeRoll < 0.67 ? 'tax' : 'tip');

  if (type === 'discount') {
    const discount = roundMoney((price * rate) / 100);
    const final = roundMoney(price - discount);
    return {
      type,
      prompt: `Item price is ${fmtMoney(price)} with a ${rate}% discount. What is the final price?`,
      answer: final,
      explain: `${rate}% of ${fmtMoney(price)} is ${fmtMoney(discount)}, so ${fmtMoney(price)} - ${fmtMoney(discount)} = ${fmtMoney(final)}.`,
      options: makeOptions(final),
    };
  }

  if (type === 'tax') {
    const tax = roundMoney((price * rate) / 100);
    const final = roundMoney(price + tax);
    return {
      type,
      prompt: `Purchase is ${fmtMoney(price)} and sales tax is ${rate}%. What is the total cost?`,
      answer: final,
      explain: `${rate}% of ${fmtMoney(price)} is ${fmtMoney(tax)}, so ${fmtMoney(price)} + ${fmtMoney(tax)} = ${fmtMoney(final)}.`,
      options: makeOptions(final),
    };
  }

  const tip = roundMoney((price * rate) / 100);
  const total = roundMoney(price + tip);
  return {
    type,
    prompt: `Restaurant bill is ${fmtMoney(price)}. Leave a ${rate}% tip. What total do you pay?`,
    answer: total,
    explain: `${rate}% of ${fmtMoney(price)} is ${fmtMoney(tip)}, so ${fmtMoney(price)} + ${fmtMoney(tip)} = ${fmtMoney(total)}.`,
    options: makeOptions(total),
  };
}

export default function PercentHeist() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');
  const gradeParam = searchParams.get('grade') || '';
  const { returnUrl, goBack } = useGameReturn();
  const band = resolveGameGradeBand(gradeParam);

  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Choose the best answer.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);

  const current = useMemo(() => questions[index], [questions, index]);

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setQuestions(Array.from({ length: TOTAL_ROUNDS }, () => buildQuestion(nextLevel, band)));
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFeedback('Choose the best answer.');
    setDone(false);
    setHistory([]);
  };

  const submit = () => {
    if (selected == null || !current) return;
    const correct = roundMoney(selected) === roundMoney(current.answer);
    const nextHistory = [...history, { ...current, selected, correct }];
    setHistory(nextHistory);
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Correct percent reasoning and computation. ${current.explain}`);
    } else {
      setFeedback(`Not correct yet. Rebuild the percent setup and recompute. ${current.explain}`);
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Percent Heist',
        score: finalScore,
        total: TOTAL_ROUNDS,
        assignmentId,
        classId,
      });
      return;
    }

    setIndex((i) => i + 1);
    setSelected(null);
  };

  if (!level) {
    return (
      <QuickGameLayout
        returnUrl={returnUrl}
        goBack={goBack}
        title="Percent Heist"
        subtitle={`Solve discount, tax, and tip missions to crack the vault. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Rookie' },
            { value: 'challenge', label: 'Mastermind' },
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
      title="Percent Heist"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={selected == null}
        renderOptionLabel={(opt) => fmtMoney(opt)}
        endTitle="Vault Opened"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {fmtMoney(h.selected)} | Correct: {fmtMoney(h.answer)}
          </span>
        )}
        promptStyle={styles.prompt}
        answersStyle={styles.answers}
        optionStyle={styles.answerBtn}
        selectedOptionStyle={{ background: '#bfdbfe', borderColor: '#3b82f6' }}
        endCardStyle={{ maxWidth: 400, margin: '8px auto' }}
        feedbackStyle={{ maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}
        reviewStyle={{ maxWidth: 760 }}
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
    maxWidth: 620,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  answers: {
    maxWidth: 520,
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
