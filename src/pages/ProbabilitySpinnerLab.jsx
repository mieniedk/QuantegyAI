import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import MultipleChoiceRound from '../components/MultipleChoiceRound';
import QuickLevelPicker from '../components/QuickLevelPicker';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';
import { formatProbabilityOption } from '../utils/quickGameFormatters';

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

function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function simplify(n, d) {
  if (d === 0) return { n: 0, d: 1 };
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function frac(n, d) {
  const s = simplify(n, d);
  return `${s.n}/${s.d}`;
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  while (set.size < 4) {
    const nn = randInt(1, 8);
    const dd = randInt(2, 12);
    set.add(frac(nn, dd));
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

function SpinnerVisual({ parts, eventCount }) {
  const angle = 360 / parts;
  const radius = 52;
  const cx = 70;
  const cy = 70;
  const eventIdx = new Set();
  while (eventIdx.size < eventCount) eventIdx.add(eventIdx.size);
  return (
    <div style={styles.visualCard}>
      <svg width={140} height={140}>
        {Array.from({ length: parts }, (_, i) => {
          const start = ((i * angle - 90) * Math.PI) / 180;
          const end = ((((i + 1) * angle) - 90) * Math.PI) / 180;
          const x1 = cx + radius * Math.cos(start);
          const y1 = cy + radius * Math.sin(start);
          const x2 = cx + radius * Math.cos(end);
          const y2 = cy + radius * Math.sin(end);
          const large = angle > 180 ? 1 : 0;
          return (
            <path
              key={`p-${parts}-${i}`}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={eventIdx.has(i) ? 'rgba(34,197,94,0.35)' : 'rgba(148,163,184,0.20)'}
              stroke="rgba(51,65,85,0.8)"
              strokeWidth={1}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={4} fill="#1e293b" />
      </svg>
      <div style={styles.visualLabel}>{eventCount} favorable of {parts}</div>
    </div>
  );
}

function buildSpinnerQuestion(hard) {
  const parts = hard ? [6, 8, 10, 12][randInt(0, 3)] : [4, 6, 8][randInt(0, 2)];
  const favorable = randInt(1, parts - 1);
  const answer = frac(favorable, parts);
  const wrongWhole = frac(parts, favorable);
  const wrongRemaining = frac(parts - favorable, parts);
  const wrongTotal = frac(favorable, parts + 1);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: wrongWhole, message: 'You inverted favorable and total outcomes.', hint: 'Probability is favorable over total.' },
    { value: wrongRemaining, message: 'You used unfavorable outcomes instead of favorable.', hint: 'Count event outcomes only.' },
    { value: wrongTotal, message: 'You used the wrong total number of outcomes.', hint: 'Use all equal sections.' },
  ]);
  return {
    prompt: 'A spinner has equal sections. What is P(event)?',
    visual: <SpinnerVisual parts={parts} eventCount={favorable} />,
    answer,
    options,
    misconceptions,
    explain: `P(event) = favorable/total = ${favorable}/${parts} = ${answer}.`,
  };
}

function buildDieQuestion() {
  const events = ['rolling an even number', 'rolling a number greater than 4', 'rolling a prime number', 'rolling less than 3'];
  const pick = randInt(0, events.length - 1);
  const event = events[pick];
  let favorable = 0;
  if (event === 'rolling an even number') favorable = 3;
  if (event === 'rolling a number greater than 4') favorable = 2;
  if (event === 'rolling a prime number') favorable = 3;
  if (event === 'rolling less than 3') favorable = 2;
  const answer = frac(favorable, 6);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: frac(6 - favorable, 6), message: 'You counted non-event outcomes.', hint: 'Count successful outcomes only.' },
    { value: frac(favorable, 5), message: 'A standard die has 6 outcomes, not 5.', hint: 'Total outcomes is 6.' },
    { value: frac(favorable + 1, 6), message: 'You overcounted favorable outcomes.', hint: 'List outcomes carefully.' },
  ]);
  return {
    prompt: `For a fair six-sided die, find P(${event}).`,
    answer,
    options,
    misconceptions,
    explain: `There are ${favorable} favorable outcomes out of 6 total, so probability is ${answer}.`,
  };
}

function buildCardQuestion() {
  const prompts = [
    { text: 'drawing a heart', favorable: 13, total: 52 },
    { text: 'drawing a face card', favorable: 12, total: 52 },
    { text: 'drawing a king', favorable: 4, total: 52 },
    { text: 'drawing a black card', favorable: 26, total: 52 },
  ];
  const q = prompts[randInt(0, prompts.length - 1)];
  const answer = frac(q.favorable, q.total);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: frac(q.total - q.favorable, q.total), message: 'You computed the complement event probability.', hint: 'Use requested event outcomes.' },
    { value: frac(q.favorable, 13), message: 'You used suit size as the total outcomes.', hint: 'Use full deck total 52.' },
    { value: frac(q.favorable + 1, q.total), message: 'You overcounted favorable cards.', hint: 'Count exact card set.' },
  ]);
  return {
    prompt: `From a standard 52-card deck, find P(${q.text}).`,
    answer,
    options,
    misconceptions,
    explain: `Probability is favorable over total: ${q.favorable}/52 = ${answer}.`,
  };
}

function buildCompoundQuestion() {
  const favorable = 2;
  const total = 6;
  const answer = frac(favorable * favorable, total * total);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: frac(favorable, total), message: 'You used only one event probability.', hint: 'For two independent events, multiply.' },
    { value: frac(favorable + favorable, total + total), message: 'You added probabilities instead of multiplying.', hint: 'Both events together means multiply.' },
    { value: frac(favorable * 2, total * total), message: 'You partially multiplied but missed full product.', hint: 'Multiply both numerators and denominators.' },
  ]);
  return {
    prompt: 'Two fair dice are rolled. What is P(both are greater than 4)?',
    answer,
    options,
    misconceptions,
    explain: `P(>4 on one die)=2/6. For both dice: (2/6)x(2/6)=4/36=1/9.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 2);
  if (mode === 0) return buildSpinnerQuestion(hard);
  if (mode === 1) return buildDieQuestion();
  if (mode === 2) return buildCardQuestion();
  return buildCompoundQuestion();
}

export default function ProbabilitySpinnerLab() {
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
  const [feedback, setFeedback] = useState('Run the probability lab.');
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
    setFeedback('Run the probability lab.');
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
        gameName: 'Probability Spinner Lab',
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
        title="Probability Spinner Lab"
        subtitle={`Find probabilities with spinners, dice, and cards. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Lab Tech' },
            { value: 'challenge', label: 'Lead Analyst' },
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
      title="Probability Spinner Lab"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        renderOptionLabel={(option) => formatProbabilityOption(option)}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Lab Complete"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {formatProbabilityOption(h.selected)} | Correct: {formatProbabilityOption(h.answer)}
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
  visualCard: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#fff',
    padding: '8px 10px',
    textAlign: 'center',
  },
  visualLabel: {
    marginTop: 4,
    fontWeight: 700,
    color: '#1e293b',
    fontSize: 12,
  },
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
