import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import MultipleChoiceRound from '../components/MultipleChoiceRound';
import QuickLevelPicker from '../components/QuickLevelPicker';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';
import { formatDecimalOption } from '../utils/quickGameFormatters';

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

function formatDecimal(n) {
  return Number(n).toFixed(2).replace(/\.?0+$/, (m) => (m === '.00' ? '' : m));
}

function buildOptionSet(answer, candidates) {
  const set = new Set([formatDecimal(answer)]);
  candidates.forEach((c) => set.add(formatDecimal(c)));
  while (set.size < 4) {
    const jitter = randInt(1, 9) / 100;
    const guess = Math.max(0, Number(answer) + (Math.random() > 0.5 ? jitter : -jitter));
    set.add(formatDecimal(guess));
  }
  return shuffle(Array.from(set)).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildOptionSet(answer, candidates.map((c) => c.value));
  const misconceptions = {};
  candidates.forEach((c) => {
    const key = formatDecimal(c.value);
    if (key !== formatDecimal(answer) && options.includes(key)) {
      misconceptions[key] = { message: c.message, hint: c.hint || c.message };
    }
  });
  return { options, misconceptions };
}

function NumberLine({ min, max, marks, highlight }) {
  const width = 420;
  const toX = (v) => ((v - min) / (max - min)) * width;
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width={width + 24} height={58} style={{ display: 'block', margin: '0 auto' }}>
        <line x1={12} y1={30} x2={width + 12} y2={30} stroke="#64748b" strokeWidth={2} />
        {marks.map((v) => {
          const x = 12 + toX(v);
          const isHighlight = highlight && Number(v) === Number(highlight);
          return (
            <g key={`m-${v}`}>
              <line x1={x} y1={22} x2={x} y2={38} stroke={isHighlight ? '#2563eb' : '#94a3b8'} strokeWidth={isHighlight ? 3 : 2} />
              <text x={x} y={52} textAnchor="middle" fill={isHighlight ? '#1d4ed8' : '#334155'} fontSize="11" fontWeight={isHighlight ? 800 : 600}>
                {formatDecimal(v)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function buildCompareQuestion(hard) {
  const a = randInt(12, hard ? 289 : 199) / 100;
  let b = randInt(12, hard ? 289 : 199) / 100;
  if (a === b) b += 0.01;
  const answer = a > b ? a : b;
  const wrongPlaceValue = Number(`${Math.floor(a)}.${String(Math.round((a % 1) * 100)).padStart(2, '0').split('').reverse().join('')}`);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: a < b ? a : b, message: 'You selected the smaller decimal.', hint: 'Compare tenths first.' },
    { value: wrongPlaceValue, message: 'You reversed place value digits.', hint: 'Read digits by place.' },
  ]);
  return {
    prompt: `Which decimal is greater?`,
    visual: (
      <div style={styles.visualRow}>
        <span style={styles.decChip}>{formatDecimal(a)}</span>
        <span style={styles.vsText}>vs</span>
        <span style={styles.decChip}>{formatDecimal(b)}</span>
      </div>
    ),
    answer: formatDecimal(answer),
    options,
    misconceptions,
    explain: `Compare place values left to right. ${formatDecimal(answer)} has the greater value.`,
  };
}

function buildAddSubQuestion(hard, op) {
  const a = randInt(20, hard ? 540 : 360) / 100;
  const b = randInt(10, hard ? 260 : 180) / 100;
  const result = op === '+' ? a + b : Math.max(0, a - b);
  const answer = formatDecimal(result);
  const noAlign = formatDecimal((Math.floor(a) + Math.floor(b)) + ((Math.round((a % 1) * 10) + Math.round((b % 1) * 10)) / 10));
  const wrongOp = formatDecimal(op === '+' ? a - b : a + b);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: noAlign, message: 'You did not align decimal places correctly.', hint: 'Line up decimal points.' },
    { value: wrongOp, message: 'You used the wrong operation sign.', hint: 'Check plus/minus sign.' },
  ]);
  return {
    prompt: `Compute: ${formatDecimal(a)} ${op} ${formatDecimal(b)}`,
    visual: (
      <div style={styles.visualRow}>
        <span style={styles.decChip}>{formatDecimal(a)}</span>
        <span style={styles.operator}>{op}</span>
        <span style={styles.decChip}>{formatDecimal(b)}</span>
      </div>
    ),
    answer,
    options,
    misconceptions,
    explain: `${formatDecimal(a)} ${op} ${formatDecimal(b)} = ${answer}. Keep decimal points aligned.`,
  };
}

function buildOrderQuestion(hard) {
  const count = hard ? 4 : 3;
  const vals = [];
  while (vals.length < count) {
    const v = randInt(5, hard ? 299 : 199) / 100;
    if (!vals.some((x) => Number(x) === Number(v))) vals.push(v);
  }
  const shuffled = shuffle(vals);
  const ascending = [...vals].sort((a, b) => a - b).map(formatDecimal).join(', ');
  const descending = [...vals].sort((a, b) => b - a).map(formatDecimal).join(', ');
  const randomWrong = shuffle(vals).map(formatDecimal).join(', ');
  const answer = ascending;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: descending, message: 'You ordered greatest to least instead of least to greatest.', hint: 'Read direction carefully.' },
    { value: randomWrong, message: 'Place values are not in order.', hint: 'Compare tenths, then hundredths.' },
  ]);
  return {
    prompt: `Order least to greatest: ${shuffled.map(formatDecimal).join(', ')}`,
    visual: <NumberLine min={0} max={hard ? 3.2 : 2.2} marks={shuffled} />,
    answer,
    options,
    misconceptions,
    explain: `In least-to-greatest order: ${ascending}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 2);
  if (mode === 0) return buildCompareQuestion(hard);
  if (mode === 1) return buildAddSubQuestion(hard, '+');
  if (mode === 2) return buildAddSubQuestion(hard, '-');
  return buildOrderQuestion(hard);
}

export default function DecimalDrift() {
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
  const [feedback, setFeedback] = useState('Use place value precision.');
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
    setFeedback('Use place value precision.');
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
        gameName: 'Decimal Drift',
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
        title="Decimal Drift"
        subtitle={`Compare/order/add/subtract decimals. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Navigator' },
            { value: 'challenge', label: 'Drift Master' },
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
      title="Decimal Drift"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        renderOptionLabel={(option) => formatDecimalOption(option, formatDecimal)}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Drift Complete"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {formatDecimalOption(h.selected, formatDecimal)} | Correct: {formatDecimalOption(h.answer, formatDecimal)}
          </span>
        )}
        promptStyle={styles.prompt}
        answersStyle={styles.answers}
        optionStyle={styles.answerBtn}
        selectedOptionStyle={{ background: '#dbeafe', borderColor: '#3b82f6' }}
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
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    borderRadius: 10,
  },
  visualRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  decChip: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '8px 12px',
    background: '#fff',
    fontWeight: 800,
    color: '#1e293b',
    minWidth: 70,
    textAlign: 'center',
  },
  vsText: { fontWeight: 900, color: '#475569', fontSize: 17 },
  operator: { fontWeight: 900, color: '#1d4ed8', fontSize: 28 },
  prompt: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
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
