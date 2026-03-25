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

function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

function simplifyFraction(n, d) {
  if (d < 0) return simplifyFraction(-n, -d);
  if (n === 0) return { n: 0, d: 1 };
  const g = gcd(Math.abs(n), Math.abs(d));
  return { n: n / g, d: d / g };
}

function fracToText(n, d) {
  const s = simplifyFraction(n, d);
  if (s.d === 1) return String(s.n);
  return `${s.n}/${s.d}`;
}

function fracToMixedText(n, d) {
  const s = simplifyFraction(n, d);
  if (s.d === 1) return String(s.n);
  const sign = s.n < 0 ? -1 : 1;
  const absNum = Math.abs(s.n);
  const whole = Math.floor(absNum / s.d);
  const rem = absNum % s.d;
  if (whole === 0) return fracToText(s.n, s.d);
  if (rem === 0) return String(sign * whole);
  const wholeText = sign < 0 ? `-${whole}` : String(whole);
  return `${wholeText} ${rem}/${s.d}`;
}

function parseFractionText(text) {
  const raw = String(text).trim();
  if (!raw.includes('/')) return { n: Number(raw), d: 1 };
  if (raw.includes(' ')) {
    const [wholePart, fracPart] = raw.split(' ');
    const whole = Number(wholePart);
    const [nPart, dPart] = fracPart.split('/').map(Number);
    const sign = whole < 0 ? -1 : 1;
    const absWhole = Math.abs(whole);
    const num = absWhole * dPart + nPart;
    return simplifyFraction(sign * num, dPart);
  }
  const [n, d] = raw.split('/').map(Number);
  return simplifyFraction(n, d);
}

function equivalentText(a, b) {
  const fa = parseFractionText(a);
  const fb = parseFractionText(b);
  return fa.n === fb.n && fa.d === fb.d;
}

function buildOptionSet(answer, candidates) {
  const normalized = [answer, ...candidates].map((v) => fracToText(parseFractionText(v).n, parseFractionText(v).d));
  const seen = [];
  normalized.forEach((v) => {
    if (!seen.some((x) => equivalentText(x, v))) seen.push(v);
  });
  while (seen.length < 4) {
    const den = [2, 3, 4, 5, 6, 8, 10, 12][randInt(0, 7)];
    const num = randInt(1, den * 2);
    const candidate = fracToText(num, den);
    if (!seen.some((x) => equivalentText(x, candidate))) seen.push(candidate);
  }
  return shuffle(seen).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildOptionSet(answer, candidates.map((c) => c.value));
  const misconceptions = {};
  candidates.forEach((c) => {
    const normalized = fracToText(parseFractionText(c.value).n, parseFractionText(c.value).d);
    const included = options.find((opt) => equivalentText(opt, normalized));
    if (included && !equivalentText(included, answer)) {
      misconceptions[included] = { message: c.message, hint: c.hint || c.message };
    }
  });
  return { options, misconceptions };
}

function FractionCard({ n, d, label }) {
  const width = 220;
  const height = 26;
  const segmentW = width / d;
  return (
    <div style={styles.card}>
      {label && <div style={styles.cardLabel}>{label}</div>}
      <svg width={width} height={height}>
        {Array.from({ length: d }, (_, i) => (
          <rect
            key={`${n}-${d}-${i}`}
            x={i * segmentW + 1}
            y={1}
            width={segmentW - 2}
            height={height - 2}
            rx={3}
            fill={i < n ? '#60a5fa' : 'rgba(148,163,184,0.18)'}
            stroke="rgba(148,163,184,0.35)"
            strokeWidth={1}
          />
        ))}
      </svg>
      <div style={styles.fracText}>{fracToText(n, d)}</div>
    </div>
  );
}

function MixedFractionCard({ whole, n, d, label }) {
  return (
    <div style={styles.card}>
      {label && <div style={styles.cardLabel}>{label}</div>}
      <div style={styles.mixedWholeRow}>
        {Array.from({ length: whole }, (_, i) => (
          <span key={`${label}-w-${i}`} style={styles.wholeChip}>1</span>
        ))}
      </div>
      <FractionCard n={n} d={d} />
      <div style={styles.fracText}>{`${whole} ${fracToText(n, d)}`}</div>
    </div>
  );
}

function buildCompareQuestion(hard) {
  const pool = hard
    ? [[2, 3], [3, 4], [4, 5], [5, 6], [4, 8], [5, 10], [3, 6], [7, 8]]
    : [[2, 3], [1, 2], [3, 4], [2, 4], [3, 6], [4, 8], [5, 10]];
  let [aN, aD] = pool[randInt(0, pool.length - 1)];
  let [bN, bD] = pool[randInt(0, pool.length - 1)];
  if (aN === bN && aD === bD) bN = Math.max(1, bN - 1);
  const left = simplifyFraction(aN, aD);
  const right = simplifyFraction(bN, bD);
  const leftVal = left.n / left.d;
  const rightVal = right.n / right.d;
  const answer = leftVal > rightVal ? fracToText(left.n, left.d) : fracToText(right.n, right.d);
  const optionsRaw = [
    fracToText(left.n, left.d),
    fracToText(right.n, right.d),
    fracToText(left.n + right.n, lcm(left.d, right.d)),
  ];
  const misconceptions = [];
  if (left.d === right.d) {
    misconceptions.push({
      value: fracToText(Math.min(left.n, right.n), left.d),
      message: 'You picked the smaller numerator with same denominator.',
      hint: 'Bigger numerator wins.',
    });
  } else if (left.n === right.n) {
    misconceptions.push({
      value: fracToText(left.n, Math.max(left.d, right.d)),
      message: 'You chose the larger denominator as larger fraction.',
      hint: 'Larger denominator, smaller pieces.',
    });
  }
  misconceptions.push({
    value: fracToText(left.n + right.n, left.d + right.d),
    message: 'You combined fractions instead of comparing values.',
    hint: 'Compare sizes only.',
  });
  const { options, misconceptions: map } = buildOptionsWithMisconceptions(answer, [
    ...misconceptions,
    ...optionsRaw.map((v) => ({ value: v, message: 'Check each fraction value carefully.', hint: 'Use visual bars.' })),
  ]);
  return {
    prompt: `Which fraction is greater?`,
    visual: (
      <div style={styles.visualRow}>
        <FractionCard n={left.n} d={left.d} label="A" />
        <div style={styles.vsText}>vs</div>
        <FractionCard n={right.n} d={right.d} label="B" />
      </div>
    ),
    answer,
    options,
    misconceptions: map,
    explain: `${fracToText(left.n, left.d)} = ${(leftVal * 100).toFixed(0)}% and ${fracToText(right.n, right.d)} = ${(rightVal * 100).toFixed(0)}%.`,
  };
}

function buildAddSubQuestion(hard, op) {
  const pairs = hard
    ? [[2, 3], [3, 4], [4, 6], [5, 10], [3, 6], [4, 8]]
    : [[2, 4], [3, 6], [4, 8], [1, 2], [1, 3]];
  const [aN, aD] = pairs[randInt(0, pairs.length - 1)];
  const [bN, bD] = pairs[randInt(0, pairs.length - 1)];
  const l = lcm(aD, bD);
  const aScaled = aN * (l / aD);
  const bScaled = bN * (l / bD);
  let resN = op === '+' ? aScaled + bScaled : aScaled - bScaled;
  if (op === '-' && resN <= 0) {
    resN = Math.abs(resN) + randInt(1, 2);
  }
  const result = simplifyFraction(resN, l);
  const answer = fracToText(result.n, result.d);
  const addDenoms = fracToText(
    op === '+' ? aN + bN : Math.max(1, aN - bN),
    Math.max(1, aD + bD),
  );
  const noCommonDen = fracToText(op === '+' ? aN + bN : Math.max(0, aN - bN), l);
  const wrongSubtract = fracToText(Math.max(0, aScaled - bScaled), l);
  const wrongAdd = fracToText(aScaled + bScaled, l);
  const distractors = [
    { value: addDenoms, message: 'You changed denominators by adding/subtracting them.', hint: 'Use common denominator.' },
    { value: noCommonDen, message: 'You combined numerators before making equivalent fractions.', hint: 'Convert first.' },
    { value: op === '+' ? wrongSubtract : wrongAdd, message: 'You used the wrong operation sign.', hint: 'Check plus/minus sign.' },
  ];
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, distractors);
  const leftA = simplifyFraction(aN, aD);
  const leftB = simplifyFraction(bN, bD);
  return {
    prompt: `Find: ${fracToText(leftA.n, leftA.d)} ${op} ${fracToText(leftB.n, leftB.d)}`,
    visual: (
      <div style={styles.visualRow}>
        <FractionCard n={leftA.n} d={leftA.d} label="A" />
        <div style={styles.operator}>{op}</div>
        <FractionCard n={leftB.n} d={leftB.d} label="B" />
      </div>
    ),
    answer,
    options,
    misconceptions,
    explain: `Use denominator ${l}: ${aScaled}/${l} ${op} ${bScaled}/${l} = ${resN}/${l} = ${answer}.`,
  };
}

function buildMixedNumberQuestion() {
  const den = [4, 6, 8][randInt(0, 2)];
  const wholeA = randInt(1, 3);
  const numA = randInt(1, den - 1);
  const wholeB = randInt(0, 2);
  const numB = randInt(1, den - 1);
  const op = Math.random() > 0.5 ? '+' : '-';
  const aImproper = wholeA * den + numA;
  const bImproper = wholeB * den + numB;
  const safeOp = op === '-' && aImproper <= bImproper ? '+' : op;
  const resultImproper = safeOp === '+' ? aImproper + bImproper : aImproper - bImproper;
  const answer = fracToText(resultImproper, den);
  const onlyFractionPart = fracToText(
    safeOp === '+' ? numA + numB : Math.max(0, numA - numB),
    den,
  );
  const onlyWholePart = fracToText(
    (safeOp === '+' ? wholeA + wholeB : Math.max(0, wholeA - wholeB)) * den,
    den,
  );
  const wrongOp = fracToText(safeOp === '+' ? aImproper - bImproper : aImproper + bImproper, den);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: onlyFractionPart, message: 'You combined only fractional parts.', hint: 'Include whole numbers too.' },
    { value: onlyWholePart, message: 'You combined only whole numbers.', hint: 'Include fraction parts too.' },
    { value: wrongOp, message: 'You used the wrong operation.', hint: 'Check the operation sign.' },
  ]);
  return {
    prompt: `Find: ${wholeA} ${numA}/${den} ${safeOp} ${wholeB} ${numB}/${den}`,
    visual: (
      <div style={styles.visualRow}>
        <MixedFractionCard whole={wholeA} n={numA} d={den} label="A" />
        <div style={styles.operator}>{safeOp}</div>
        <MixedFractionCard whole={wholeB} n={numB} d={den} label="B" />
      </div>
    ),
    answer,
    options,
    misconceptions,
    mixedDisplayOptions: true,
    explain: `${wholeA} ${numA}/${den} = ${aImproper}/${den}, ${wholeB} ${numB}/${den} = ${bImproper}/${den}. So ${aImproper}/${den} ${safeOp} ${bImproper}/${den} = ${fracToText(resultImproper, den)} (${fracToMixedText(resultImproper, den)}).`,
  };
}

function buildConversionQuestion() {
  const den = [3, 4, 5, 6, 8][randInt(0, 4)];
  const whole = randInt(1, 4);
  const rem = randInt(1, den - 1);
  const improperNum = whole * den + rem;
  const toMixed = Math.random() > 0.5;

  if (toMixed) {
    const answer = `${whole} ${rem}/${den}`;
    const wrongWhole = `${whole + 1} ${rem}/${den}`;
    const wrongRem = `${whole} ${Math.max(1, Math.min(den - 1, rem + (Math.random() > 0.5 ? 1 : -1)))}/${den}`;
    const wrongComp = `${whole} ${den - rem}/${den}`;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: wrongWhole, message: 'You made the whole-number part too large.', hint: 'Divide numerator by denominator.' },
      { value: wrongRem, message: 'You used the wrong remainder.', hint: 'Remainder is what is left.' },
      { value: wrongComp, message: 'You flipped the fractional remainder.', hint: 'Use actual remainder over denominator.' },
    ]);
    return {
      prompt: `Convert to a mixed number: ${improperNum}/${den}`,
      visual: (
        <div style={styles.visualRow}>
          <FractionCard n={improperNum} d={den} label="Improper Fraction" />
        </div>
      ),
      answer,
      options,
      misconceptions,
      mixedDisplayOptions: true,
      explain: `${improperNum} ÷ ${den} = ${whole} remainder ${rem}, so ${improperNum}/${den} = ${whole} ${rem}/${den}.`,
    };
  }

  const answer = `${improperNum}/${den}`;
  const wrongAdd = `${whole + rem}/${den}`;
  const wrongSub = `${Math.max(1, whole * den - rem)}/${den}`;
  const wrongDen = `${improperNum}/${den + 1}`;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: wrongAdd, message: 'You added whole and numerator without scaling.', hint: 'Multiply whole by denominator first.' },
    { value: wrongSub, message: 'You subtracted instead of adding parts.', hint: 'Improper numerator is whole*den + numerator.' },
    { value: wrongDen, message: 'You changed the denominator.', hint: 'Denominator stays the same.' },
  ]);
  return {
    prompt: `Convert to an improper fraction: ${whole} ${rem}/${den}`,
    visual: (
      <div style={styles.visualRow}>
        <MixedFractionCard whole={whole} n={rem} d={den} label="Mixed Number" />
      </div>
    ),
    answer,
    options,
    misconceptions,
    explain: `${whole} ${rem}/${den} = (${whole} x ${den} + ${rem})/${den} = ${improperNum}/${den}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 4 : 1);
  if (mode === 0) return buildCompareQuestion(hard);
  if (mode === 1) return buildAddSubQuestion(hard, '+');
  if (mode === 2) return buildAddSubQuestion(hard, '-');
  if (mode === 3) return buildMixedNumberQuestion();
  return buildConversionQuestion();
}

export default function FractionFaceoff() {
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
  const [feedback, setFeedback] = useState('Compare, add, and subtract fractions with models.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [misconceptionMisses, setMisconceptionMisses] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  const current = questions[index];

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setQuestions(Array.from({ length: TOTAL_ROUNDS }, () => buildQuestion(nextLevel, band)));
    setIndex(0);
    setSelected('');
    setScore(0);
    setFeedback('Compare, add, and subtract fractions with models.');
    setDone(false);
    setHistory([]);
    setMisconceptionMisses({});
    setShowSteps(false);
  };

  const submit = () => {
    if (!current || !selected) return;
    const correct = equivalentText(selected, current.answer);
    const explainText = showSteps ? current.explain : 'Turn on Show Steps for full work.';
    const nextHistory = [...history, { ...current, selected, correct }];
    setHistory(nextHistory);
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Correct! ${explainText}`);
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
        setFeedback(`${misconception ? `${misconception.message} ` : ''}${explainText}`);
      }
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Fraction Faceoff',
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
        title="Fraction Faceoff"
        subtitle={`Compare/add/subtract fractions with visual cards. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Rookie Rival' },
            { value: 'challenge', label: 'Fraction Champ' },
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
      title="Fraction Faceoff"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <div style={styles.stepsToggleWrap}>
        <button
          type="button"
          onClick={() => setShowSteps((v) => !v)}
          style={showSteps ? { ...styles.stepsToggleBtn, ...styles.stepsToggleBtnOn } : styles.stepsToggleBtn}
        >
          {showSteps ? 'Show Steps: ON' : 'Show Steps: OFF'}
        </button>
      </div>
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Faceoff Complete"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderOptionLabel={(opt) => (current?.mixedDisplayOptions ? fracToMixedText(parseFractionText(opt).n, parseFractionText(opt).d) : String(opt))}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {h.mixedDisplayOptions ? fracToMixedText(parseFractionText(h.selected).n, parseFractionText(h.selected).d) : h.selected} | Correct: {h.mixedDisplayOptions ? fracToMixedText(parseFractionText(h.answer).n, parseFractionText(h.answer).d) : h.answer}
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
  stepsToggleWrap: {
    display: 'flex',
    justifyContent: 'center',
    margin: '2px 0 10px',
  },
  stepsToggleBtn: {
    border: '1px solid #cbd5e1',
    borderRadius: 999,
    background: '#f8fafc',
    color: '#334155',
    fontWeight: 700,
    fontSize: 12,
    padding: '6px 12px',
    cursor: 'pointer',
  },
  stepsToggleBtnOn: {
    borderColor: '#3b82f6',
    background: '#dbeafe',
    color: '#1e3a8a',
  },
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
  card: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#ffffff',
    padding: '8px 10px',
    minWidth: 240,
    textAlign: 'center',
  },
  mixedWholeRow: {
    display: 'flex',
    gap: 5,
    justifyContent: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  wholeChip: {
    minWidth: 18,
    height: 18,
    borderRadius: 5,
    background: '#bfdbfe',
    border: '1px solid #60a5fa',
    color: '#1e3a8a',
    fontSize: 11,
    fontWeight: 800,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
  },
  cardLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 700,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fracText: {
    marginTop: 5,
    fontWeight: 800,
    color: '#1e293b',
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
