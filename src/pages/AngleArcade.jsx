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

function classifyAngle(deg) {
  if (deg < 90) return 'Acute';
  if (deg === 90) return 'Right';
  if (deg < 180) return 'Obtuse';
  if (deg === 180) return 'Straight';
  return 'Reflex';
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  while (set.size < 4) {
    if (typeof answer === 'number' || /^\d+$/.test(String(answer))) {
      const base = Number(answer);
      set.add(String(Math.max(1, base + (Math.random() > 0.5 ? randInt(3, 25) : -randInt(3, 25)))));
    } else {
      const labels = ['Acute', 'Right', 'Obtuse', 'Straight', 'Reflex', 'Vertical', 'Complementary', 'Supplementary'];
      set.add(labels[randInt(0, labels.length - 1)]);
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

function ArcDiagram({ leftLabel, rightLabel, totalLabel }) {
  return (
    <div style={styles.diagramCard}>
      <svg width={260} height={120}>
        <line x1={25} y1={95} x2={235} y2={95} stroke="#475569" strokeWidth={3} />
        <line x1={130} y1={95} x2={50} y2={30} stroke="#2563eb" strokeWidth={3} />
        <line x1={130} y1={95} x2={210} y2={30} stroke="#f59e0b" strokeWidth={3} />
        <path d="M80 72 A56 56 0 0 1 130 40" stroke="#2563eb" fill="none" strokeWidth={2} />
        <path d="M130 40 A56 56 0 0 1 180 72" stroke="#f59e0b" fill="none" strokeWidth={2} />
        <text x={92} y={62} fontSize={14} fontWeight={800} fill="#1d4ed8">{leftLabel}</text>
        <text x={156} y={62} fontSize={14} fontWeight={800} fill="#b45309">{rightLabel}</text>
        {totalLabel ? <text x={112} y={110} fontSize={12} fontWeight={700} fill="#334155">{totalLabel}</text> : null}
      </svg>
    </div>
  );
}

function CrossDiagram({ topLeft, topRight, bottomLeft, bottomRight }) {
  return (
    <div style={styles.diagramCard}>
      <svg width={240} height={140}>
        <line x1={25} y1={20} x2={215} y2={120} stroke="#475569" strokeWidth={3} />
        <line x1={25} y1={120} x2={215} y2={20} stroke="#475569" strokeWidth={3} />
        <text x={80} y={45} fontSize={14} fontWeight={800} fill="#1d4ed8">{topLeft}</text>
        <text x={150} y={45} fontSize={14} fontWeight={800} fill="#b45309">{topRight}</text>
        <text x={75} y={100} fontSize={14} fontWeight={800} fill="#b45309">{bottomLeft}</text>
        <text x={152} y={100} fontSize={14} fontWeight={800} fill="#1d4ed8">{bottomRight}</text>
      </svg>
    </div>
  );
}

function TriangleDiagram({ a, b, c }) {
  return (
    <div style={styles.diagramCard}>
      <svg width={250} height={160}>
        <polygon points="30,130 220,130 125,25" fill="rgba(59,130,246,0.08)" stroke="#2563eb" strokeWidth={3} />
        <text x={58} y={122} fontSize={13} fontWeight={800} fill="#1e3a8a">{a}</text>
        <text x={177} y={122} fontSize={13} fontWeight={800} fill="#1e3a8a">{b}</text>
        <text x={119} y={50} fontSize={13} fontWeight={800} fill="#1e3a8a">{c}</text>
      </svg>
    </div>
  );
}

function buildClassifyQuestion(hard) {
  const deg = hard ? randInt(25, 330) : randInt(20, 190);
  const answer = classifyAngle(deg);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: deg < 90 ? 'Obtuse' : 'Acute', message: 'You mixed acute and obtuse ranges.', hint: 'Acute < 90, obtuse between 90 and 180.' },
    { value: 'Right', message: 'Right angles are exactly 90°.', hint: 'Check if angle is exactly 90°.' },
    { value: 'Straight', message: 'Straight angles are exactly 180°.', hint: 'Check if angle is exactly 180°.' },
  ]);
  return {
    prompt: `Classify an angle of ${deg}°.`,
    visual: <div style={styles.metricCard}>{deg}°</div>,
    answer,
    options,
    misconceptions,
    explain: `${deg}° is a ${answer.toLowerCase()} angle.`,
  };
}

function buildSupplementaryQuestion() {
  const known = randInt(20, 155);
  const answer = 180 - known;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: 90 - known, message: 'You used complement rule instead of supplement.', hint: 'Supplementary angles sum to 180.' },
    { value: 180 + known, message: 'You added instead of subtracting from 180.', hint: 'Missing angle = 180 - known.' },
  ]);
  return {
    prompt: `Angles on a line are supplementary. Find the missing angle.`,
    visual: <ArcDiagram leftLabel={`${known}°`} rightLabel="x°" totalLabel="Straight line (180°)" />,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Supplementary angles add to 180°, so x = 180 - ${known} = ${answer}.`,
  };
}

function buildComplementaryQuestion() {
  const known = randInt(12, 78);
  const answer = 90 - known;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: 180 - known, message: 'You used supplementary rule instead of complementary.', hint: 'Complementary angles sum to 90.' },
    { value: 90 + known, message: 'You added instead of subtracting from 90.', hint: 'Missing angle = 90 - known.' },
  ]);
  return {
    prompt: `Angles in a right angle are complementary. Find x.`,
    visual: <ArcDiagram leftLabel={`${known}°`} rightLabel="x°" totalLabel="Right angle (90°)" />,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Complementary angles add to 90°, so x = 90 - ${known} = ${answer}.`,
  };
}

function buildVerticalQuestion() {
  const known = randInt(25, 155);
  const answer = known;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: 180 - known, message: 'You solved for an adjacent supplementary angle, not vertical angle.', hint: 'Vertical angles are equal.' },
    { value: known + 10, message: 'You adjusted instead of using equality.', hint: 'Opposite vertical angles match exactly.' },
  ]);
  return {
    prompt: `Find x using vertical angles.`,
    visual: <CrossDiagram topLeft={`${known}°`} topRight="x°" bottomLeft="x°" bottomRight={`${known}°`} />,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Vertical angles are congruent, so x = ${known}°.`,
  };
}

function buildTriangleQuestion() {
  const a = randInt(20, 70);
  const b = randInt(20, 70);
  const c = 180 - a - b;
  const answer = c;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: a + b, message: 'You added known angles instead of subtracting from 180.', hint: 'Triangle angles sum to 180.' },
    { value: 90 - a, message: 'You used right-angle logic instead of triangle sum.', hint: 'Use 180 total for triangles.' },
  ]);
  return {
    prompt: `Find the missing interior angle of the triangle.`,
    visual: <TriangleDiagram a={`${a}°`} b={`${b}°`} c="x°" />,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Triangle interior angles sum to 180°, so x = 180 - ${a} - ${b} = ${answer}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 4 : 3);
  if (mode === 0) return buildClassifyQuestion(hard);
  if (mode === 1) return buildSupplementaryQuestion();
  if (mode === 2) return buildComplementaryQuestion();
  if (mode === 3) return buildVerticalQuestion();
  return buildTriangleQuestion();
}

export default function AngleArcade() {
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
  const [feedback, setFeedback] = useState('Find angles with confidence.');
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
    setFeedback('Find angles with confidence.');
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
      setFeedback(`Correct angle reasoning and computation. ${current.explain}`);
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
        gameName: 'Angle Arcade',
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
        title="Angle Arcade"
        subtitle={`Classify and solve missing angles quickly. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Angle Rookie' },
            { value: 'challenge', label: 'Angle Ace' },
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
      title="Angle Arcade"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Arcade Complete"
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
  diagramCard: {
    display: 'flex',
    justifyContent: 'center',
    background: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '8px 10px',
    minWidth: 280,
  },
  visualRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricCard: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#fff',
    color: '#1e293b',
    fontWeight: 900,
    fontSize: 24,
    textAlign: 'center',
    minWidth: 120,
    padding: '14px 12px',
  },
  vsText: { fontWeight: 900, color: '#475569', fontSize: 17 },
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
