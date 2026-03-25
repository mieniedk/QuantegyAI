import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import MultipleChoiceRound from '../components/MultipleChoiceRound';
import QuickLevelPicker from '../components/QuickLevelPicker';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';
import { formatPercentOption } from '../utils/quickGameFormatters';

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
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

function toDecimalString(v) {
  return Number(v).toFixed(2).replace(/\.?0+$/, (m) => (m === '.00' ? '' : m));
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  while (set.size < 4) {
    if (String(answer).includes('%')) {
      const base = parseFloat(String(answer).replace('%', '')) || 0;
      set.add(`${Math.max(0, base + (Math.random() > 0.5 ? randInt(5, 20) : -randInt(5, 20)))}%`);
    } else if (String(answer).includes('/')) {
      const [n, d] = String(answer).split('/').map(Number);
      const nn = Math.max(1, n + (Math.random() > 0.5 ? 1 : -1));
      const dd = Math.max(2, d + (Math.random() > 0.5 ? 1 : -1));
      set.add(`${nn}/${dd}`);
    } else {
      const base = Number(answer) || 0;
      set.add(toDecimalString(Math.max(0, base + (Math.random() > 0.5 ? randInt(1, 20) : -randInt(1, 20)) / 100)));
    }
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

function triadCard(fraction, decimal, percent) {
  return (
    <div style={styles.triadCard}>
      <div style={styles.triadItem}><strong>Fraction:</strong> {fraction}</div>
      <div style={styles.triadItem}><strong>Decimal:</strong> {decimal}</div>
      <div style={styles.triadItem}><strong>Percent:</strong> {percent}</div>
    </div>
  );
}

function buildTriadQuestion(hard) {
  const pool = hard
    ? [[1, 8], [3, 8], [5, 8], [7, 8], [2, 5], [3, 5], [7, 10], [9, 20]]
    : [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 10]];
  const [n, d] = pool[randInt(0, pool.length - 1)];
  const s = simplify(n, d);
  const dec = s.n / s.d;
  const pct = dec * 100;
  const ask = randInt(0, 2); // 0 ask fraction, 1 decimal, 2 percent
  const fraction = `${s.n}/${s.d}`;
  const decimal = toDecimalString(dec);
  const percent = `${toDecimalString(pct)}%`;

  if (ask === 0) {
    const wrongDecimalAsFraction = `${Math.round(dec * 100)}/${100}`;
    const wrongInvert = `${s.d}/${s.n}`;
    const { options, misconceptions } = buildOptionsWithMisconceptions(fraction, [
      { value: wrongDecimalAsFraction, message: 'You used the unsimplified decimal-over-100 form.', hint: 'Simplify fraction form.' },
      { value: wrongInvert, message: 'You inverted numerator and denominator.', hint: 'Keep part/whole order.' },
    ]);
    return {
      prompt: `What fraction matches decimal ${decimal} and percent ${percent}?`,
      visual: triadCard('?', decimal, percent),
      answer: fraction,
      options,
      misconceptions,
      explain: `${decimal} = ${fraction}, and ${percent} is the same amount.`,
    };
  }

  if (ask === 1) {
    const wrongWhole = toDecimalString(pct);
    const wrongMove = toDecimalString(dec / 10);
    const { options, misconceptions } = buildOptionsWithMisconceptions(decimal, [
      { value: wrongWhole, message: 'You forgot to divide percent by 100.', hint: 'Percent means per hundred.' },
      { value: wrongMove, message: 'You moved the decimal the wrong way.', hint: 'Percent to decimal moves left 2.' },
    ]);
    return {
      prompt: `What decimal matches fraction ${fraction} and percent ${percent}?`,
      visual: triadCard(fraction, '?', percent),
      answer: decimal,
      options,
      misconceptions,
      explain: `${percent} = ${decimal} as a decimal, which also equals ${fraction}.`,
    };
  }

  const wrongNoScale = `${toDecimalString(dec)}%`;
  const wrongTenScale = `${toDecimalString(dec * 10)}%`;
  const { options, misconceptions } = buildOptionsWithMisconceptions(percent, [
    { value: wrongNoScale, message: 'You did not scale decimal to percent.', hint: 'Multiply decimal by 100.' },
    { value: wrongTenScale, message: 'You moved decimal one place instead of two.', hint: 'Move two places right.' },
  ]);
  return {
    prompt: `What percent matches fraction ${fraction} and decimal ${decimal}?`,
    visual: triadCard(fraction, decimal, '?'),
    answer: percent,
    options,
    misconceptions,
    explain: `${decimal} x 100 = ${toDecimalString(pct)}, so the percent is ${percent}.`,
  };
}

function buildPercentOfQuestion(hard) {
  const perc = [5, 10, 15, 20, 25, 30, 40, 50][randInt(0, hard ? 7 : 5)];
  const base = randInt(8, hard ? 180 : 120);
  const answerNum = (perc / 100) * base;
  const answer = toDecimalString(answerNum);
  const wrongDivide = toDecimalString(base / perc);
  const wrongAdd = toDecimalString(base + perc);
  const wrongWhole = toDecimalString((perc / 10) * base);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: wrongDivide, message: 'You divided by percent value directly.', hint: 'Convert percent to decimal first.' },
    { value: wrongAdd, message: 'You added values instead of finding part.', hint: 'Percent-of uses multiplication.' },
    { value: wrongWhole, message: 'You used percent as tenths instead of hundredths.', hint: '25% = 0.25, not 2.5.' },
  ]);
  return {
    prompt: `Find ${perc}% of ${base}.`,
    visual: (
      <div style={styles.visualRow}>
        <span style={styles.pill}>{perc}%</span>
        <span style={styles.operator}>of</span>
        <span style={styles.pill}>{base}</span>
      </div>
    ),
    answer,
    options,
    misconceptions,
    explain: `${perc}% = ${toDecimalString(perc / 100)}. Then ${toDecimalString(perc / 100)} x ${base} = ${answer}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 2 : 1);
  if (mode <= 1) return buildTriadQuestion(hard);
  return buildPercentOfQuestion(hard);
}

export default function PercentPop() {
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
  const [feedback, setFeedback] = useState('Pop the matching percent form.');
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
    setFeedback('Pop the matching percent form.');
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
        gameName: 'Percent Pop',
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
        title="Percent Pop"
        subtitle={`Convert fraction/decimal/percent quickly. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Pop Starter' },
            { value: 'challenge', label: 'Pop Pro' },
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
      title="Percent Pop"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        renderOptionLabel={(option) => formatPercentOption(option, toDecimalString)}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Pop Complete"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {formatPercentOption(h.selected, toDecimalString)} | Correct: {formatPercentOption(h.answer, toDecimalString)}
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
  triadCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
    width: '100%',
    maxWidth: 760,
  },
  triadItem: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '10px 8px',
    background: '#fff',
    color: '#1e293b',
    fontWeight: 700,
    textAlign: 'center',
  },
  pill: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '8px 12px',
    background: '#fff',
    fontWeight: 800,
    color: '#1e293b',
    minWidth: 80,
    textAlign: 'center',
  },
  operator: { fontWeight: 900, color: '#1d4ed8', fontSize: 22 },
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
