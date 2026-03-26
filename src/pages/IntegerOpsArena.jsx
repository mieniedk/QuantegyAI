import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import MultipleChoiceRound from '../components/MultipleChoiceRound';
import QuickLevelPicker from '../components/QuickLevelPicker';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';
import { formatIntegerOption } from '../utils/quickGameFormatters';

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

function NumberLine({ a, b, label = '' }) {
  const min = -10;
  const max = 10;
  const width = 320;
  const y = 38;
  const xFor = (n) => ((n - min) / (max - min)) * (width - 20) + 10;
  const ax = xFor(a);
  const bx = xFor(b);
  const ticks = [];
  for (let n = min; n <= max; n += 1) {
    const x = xFor(n);
    ticks.push(
      <g key={n}>
        <line x1={x} y1={y - 7} x2={x} y2={y + 7} stroke="#64748b" strokeWidth={n % 5 === 0 ? 1.4 : 1} />
        {n % 5 === 0 && (
          <text x={x} y={y + 22} textAnchor="middle" fill="#334155" fontSize="10">
            {n}
          </text>
        )}
      </g>,
    );
  }
  return (
    <div style={styles.numberLineWrap}>
      <svg width={width} height={72} role="img" aria-label="Integer number line">
        <line x1={10} y1={y} x2={width - 10} y2={y} stroke="#334155" strokeWidth={2} />
        {ticks}
        <circle cx={ax} cy={y} r={5} fill="#2563eb" />
        <circle cx={bx} cy={y} r={5} fill="#16a34a" />
      </svg>
      <div style={styles.lineLegend}>
        <span style={{ color: '#1d4ed8' }}>A</span> = {a}, <span style={{ color: '#15803d' }}>B</span> = {b}
        {label ? ` | ${label}` : ''}
      </div>
    </div>
  );
}

function buildOptions(answer, wrongs) {
  const options = shuffle([answer, ...wrongs]).slice(0, 4);
  if (!options.includes(answer)) options[0] = answer;
  return shuffle(options);
}

function formatPromptWithSignedValue(a, op, b) {
  if (b < 0) return `Compute: ${a} ${op} (${b})`;
  return `Compute: ${a} ${op} ${b}`;
}

function buildCompareQuestion() {
  let a = 0;
  let b = 0;
  while (a === b) {
    a = randInt(-12, 12);
    b = randInt(-12, 12);
  }
  const answer = a > b ? `${a} > ${b}` : `${a} < ${b}`;
  const wrongA = a > b ? `${a} < ${b}` : `${a} > ${b}`;
  const wrongB = `${b} ${a > b ? '>' : '<'} ${a}`;
  const wrongC = `${a} = ${b}`;
  return {
    prompt: 'Choose the true inequality.',
    answer,
    options: buildOptions(answer, [wrongA, wrongB, wrongC]),
    visual: <NumberLine a={a} b={b} label="Right is greater." />,
    misconceptions: {
      [wrongA]: { hint: 'On a number line, values farther right are greater.', message: 'You reversed the inequality sign.' },
      [wrongB]: { hint: 'Keep the original order of numbers in the expression.', message: 'You changed the order instead of comparing as written.' },
      [wrongC]: { hint: 'Equal means same location on number line.', message: 'These integers are not equal.' },
    },
    explain: `${a > b ? a : b} is farther right on the number line, so ${answer}.`,
  };
}

function buildAddSubQuestion() {
  const a = randInt(-15, 15);
  const b = randInt(-15, 15);
  const add = Math.random() < 0.5;
  const op = add ? '+' : '-';
  const result = add ? a + b : a - b;
  const answer = String(result);
  const wrongA = String(add ? a - b : a + b);
  const wrongB = String(-result);
  const wrongC = String((Math.abs(a) + Math.abs(b)) * (result < 0 ? -1 : 1));
  return {
    prompt: formatPromptWithSignedValue(a, op, b),
    answer,
    options: buildOptions(answer, [wrongA, wrongB, wrongC]),
    misconceptions: {
      [wrongA]: { hint: 'Double-check operation sign and apply it first.', message: 'You used the opposite operation.' },
      [wrongB]: { hint: 'Check final sign based on integer rules.', message: 'Your sign is flipped.' },
      [wrongC]: { hint: 'For unlike signs, subtract magnitudes; for like signs, add.', message: 'You treated magnitudes incorrectly.' },
    },
    explain: `Applying integer rules gives ${a} ${op} ${b} = ${result}.`,
  };
}

function buildMultiplyDivideQuestion() {
  const multiply = Math.random() < 0.5;
  const a = randInt(-12, 12) || -8;
  const b = randInt(-12, 12) || 6;
  const prompt = multiply ? `Compute: ${a} × ${b}` : `Compute: ${a * b} ÷ ${a}`;
  const result = multiply ? a * b : (a * b) / a;
  const answer = String(result);
  const wrongA = String(-result);
  const wrongB = String(Math.abs(result));
  const wrongC = String(Math.abs(a) * Math.abs(b));
  return {
    prompt,
    answer,
    options: buildOptions(answer, [wrongA, wrongB, wrongC]),
    misconceptions: {
      [wrongA]: { hint: 'Same signs -> positive, different signs -> negative.', message: 'Sign rule for multiplication/division is off.' },
      [wrongB]: { hint: 'Don’t ignore sign when calculating product/quotient.', message: 'You dropped negative sign information.' },
      [wrongC]: { hint: 'Magnitude rule is right, but include sign rule too.', message: 'You used absolute values only.' },
    },
    explain: `Use sign rules with magnitude: result is ${result}.`,
  };
}

function buildAbsoluteValueQuestion() {
  const n = randInt(-20, 20);
  const answer = String(Math.abs(n));
  const wrongA = String(-Math.abs(n));
  const wrongB = String(n);
  const wrongC = String(Math.abs(n) + 1);
  return {
    prompt: `What is |${n}|?`,
    answer,
    options: buildOptions(answer, [wrongA, wrongB, wrongC]),
    misconceptions: {
      [wrongA]: { hint: 'Absolute value is never negative.', message: 'Absolute value cannot be less than zero.' },
      [wrongB]: { hint: 'Absolute value is distance from 0.', message: 'You kept the original sign instead of distance.' },
      [wrongC]: { hint: 'Distance counts exact units from zero.', message: 'You added an extra unit.' },
    },
    explain: `|${n}| is ${Math.abs(n)} because it is distance from 0.`,
  };
}

function pickWeightedMode(weights) {
  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    roll -= weights[i].weight;
    if (roll <= 0) return weights[i].mode;
  }
  return weights[weights.length - 1].mode;
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = hard
    ? pickWeightedMode([
      { mode: 0, weight: 2 }, // compare
      { mode: 1, weight: 3 }, // add/sub
      { mode: 2, weight: 3 }, // multiply/divide
      { mode: 3, weight: 2 }, // absolute value
    ])
    : pickWeightedMode([
      { mode: 0, weight: 4 }, // compare
      { mode: 1, weight: 4 }, // add/sub
      { mode: 2, weight: 1 }, // multiply/divide
      { mode: 3, weight: 1 }, // absolute value
    ]);
  if (mode === 0) return buildCompareQuestion();
  if (mode === 1) return buildAddSubQuestion();
  if (mode === 2) return buildMultiplyDivideQuestion();
  return buildAbsoluteValueQuestion();
}

export default function IntegerOpsArena() {
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
  const [feedback, setFeedback] = useState('Apply integer rules and capture the win.');
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
    setFeedback('Apply integer rules and capture the win.');
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
      setFeedback(`Correct integer-operation sequence and result. ${current.explain}`);
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
      if (misconception && missCount < 2) setFeedback(`Hint: ${misconception.hint}`);
      else setFeedback(`${misconception ? `${misconception.message} ` : ''}${current.explain}`);
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Integer Ops Arena',
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
        title="Integer Ops Arena"
        subtitle={`Compare, operate, and reason with integers. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Sign Starter' },
            { value: 'challenge', label: 'Arena Pro' },
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
      title="Integer Ops Arena"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        renderOptionLabel={(option) => formatIntegerOption(option)}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Arena Complete"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {formatIntegerOption(h.selected)} | Correct: {formatIntegerOption(h.answer)}
          </span>
        )}
        promptStyle={styles.prompt}
        answersStyle={styles.answers}
        optionStyle={styles.answerBtn}
        selectedOptionStyle={{ background: '#fef3c7', borderColor: '#f59e0b' }}
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
  topSlot: {
    maxWidth: 920,
    margin: '0 auto 12px',
    padding: '10px',
    border: '1px solid #fde68a',
    background: '#fffbeb',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
  },
  numberLineWrap: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#fff',
    padding: '6px 8px',
  },
  lineLegend: {
    marginTop: 4,
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    fontWeight: 600,
  },
  prompt: {
    background: '#fef9c3',
    border: '1px solid #fde047',
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
    color: '#0f172a',
  },
};
