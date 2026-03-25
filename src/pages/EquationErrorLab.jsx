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

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 2);

  if (mode === 0) {
    const x = hard ? randInt(-9, 12) : randInt(-6, 9);
    const a = randInt(2, hard ? 14 : 10);
    const b = x + a;
    const step2 = `x = ${b} + ${a}`;
    const step3 = `x = ${b + a}`;
    const step4 = `x = ${b + a}`;
    const answer = 'Step 2';
    return {
      prompt: `Solve and find the first mistake:\n1) x + ${a} = ${b}\n2) ${step2}\n3) ${step3}\n4) ${step4}`,
      answer,
      options: shuffle(['Step 2', 'Step 3', 'Step 4', 'No mistake']),
      misconceptions: {
        'Step 3': { message: 'Step 3 follows the error from Step 2.', hint: 'Find the first wrong step.' },
        'Step 4': { message: 'Step 4 is not the first error.', hint: 'Check earlier steps first.' },
        'No mistake': { message: 'There is an error in the work.', hint: 'There is a mistake in these steps.' },
      },
      explain: `From x + ${a} = ${b}, subtract ${a} from both sides: x = ${b} - ${a} = ${x}.`,
    };
  }

  if (mode === 1) {
    const p = randInt(2, hard ? 8 : 6);
    const q = randInt(2, hard ? 9 : 6);
    const x = hard ? randInt(-5, 10) : randInt(-4, 8);
    const r = p * (x + q);
    const step2 = `${p}x + ${q} = ${r}`;
    const step3 = `${p}x = ${r - q}`;
    const step4 = `x = ${(r - q) / p}`;
    const answer = 'Step 2';
    return {
      prompt: `Solve and find the first mistake:\n1) ${p}(x + ${q}) = ${r}\n2) ${step2}\n3) ${step3}\n4) ${step4}`,
      answer,
      options: shuffle(['Step 2', 'Step 3', 'Step 4', 'No mistake']),
      misconceptions: {
        'Step 3': { message: 'Step 3 comes after the first error.', hint: 'Look at distribution first.' },
        'Step 4': { message: 'Step 4 is based on earlier incorrect work.', hint: 'Find the earliest mistake.' },
        'No mistake': { message: 'Distribution is incorrect in the work shown.', hint: 'Check how the parentheses were expanded.' },
      },
      explain: `Distribute ${p} to both terms: ${p}x + ${p * q} = ${r}, not ${p}x + ${q} = ${r}.`,
    };
  }

  if (mode === 2) {
    const p = randInt(2, hard ? 8 : 6);
    const x = hard ? randInt(-8, 10) : randInt(-6, 8);
    const q = randInt(2, hard ? 12 : 8);
    const r = p * x - q;
    const step2 = `${p}x = ${r - q}`;
    const step3 = `x = ${(r - q) / p}`;
    const step4 = `x = ${(r - q) / p}`;
    const answer = 'Step 2';
    return {
      prompt: `Solve and find the first mistake:\n1) ${p}x - ${q} = ${r}\n2) ${step2}\n3) ${step3}\n4) ${step4}`,
      answer,
      options: shuffle(['Step 2', 'Step 3', 'Step 4', 'No mistake']),
      misconceptions: {
        'Step 3': { message: 'Step 3 is not the first mistake.', hint: 'Check inverse operation in Step 2.' },
        'Step 4': { message: 'The first mistake appears earlier than Step 4.', hint: 'Look before the final step.' },
        'No mistake': { message: 'A sign/inverse error is present in the steps.', hint: 'Undo subtraction correctly.' },
      },
      explain: `From ${p}x - ${q} = ${r}, add ${q}: ${p}x = ${r + q}, then divide by ${p}.`,
    };
  }

  const p = randInt(2, hard ? 9 : 7);
  const q = randInt(2, hard ? 12 : 8);
  const x = hard ? randInt(-7, 10) : randInt(-5, 8);
  const r = p * x + q;
  const step2 = `${p}x = ${r - q}`;
  const step3 = `x = ${(r - q) * p}`;
  const step4 = `x = ${(r - q) * p}`;
  const answer = 'Step 3';
  return {
    prompt: `Solve and find the first mistake:\n1) ${p}x + ${q} = ${r}\n2) ${step2}\n3) ${step3}\n4) ${step4}`,
    answer,
    options: shuffle(['Step 2', 'Step 3', 'Step 4', 'No mistake']),
    misconceptions: {
      'Step 2': { message: 'Step 2 is correct; the error appears later.', hint: 'Step 2 is valid.' },
      'Step 4': { message: 'Step 4 repeats the mistake from Step 3.', hint: 'Find the first wrong step.' },
      'No mistake': { message: 'There is a division/multiplication error in the work.', hint: 'Check the division step.' },
    },
    explain: `After ${p}x = ${r - q}, divide by ${p}: x = ${(r - q)}/${p} = ${x}.`,
  };
}

export default function EquationErrorLab() {
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
  const [feedback, setFeedback] = useState('Find the first error in the work.');
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
    setFeedback('Find the first error in the work.');
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
        gameName: 'Equation Error Lab',
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
        title="Equation Error Lab"
        subtitle={`Detect the first mistake in solved equations. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Analyst' },
            { value: 'challenge', label: 'Auditor' },
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
      title="Equation Error Lab"
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
        endTitle="Error Expert"
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
    background: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: 10,
    maxWidth: 780,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.6,
    textAlign: 'left',
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
