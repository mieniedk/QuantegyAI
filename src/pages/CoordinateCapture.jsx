import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import QuickGameLayout from '../components/QuickGameLayout';
import MultipleChoiceRound from '../components/MultipleChoiceRound';
import QuickLevelPicker from '../components/QuickLevelPicker';
import { saveGameResult } from '../utils/storage';
import { gameGradeBandLabel, resolveGameGradeBand } from '../utils/gameGradeBands';
import { formatCoordinateOption, formatSignedInteger } from '../utils/quickGameFormatters';

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

function pointText(x, y) {
  return `(${x}, ${y})`;
}

function quadrantOf(x, y) {
  if (x > 0 && y > 0) return 'Quadrant I';
  if (x < 0 && y > 0) return 'Quadrant II';
  if (x < 0 && y < 0) return 'Quadrant III';
  if (x > 0 && y < 0) return 'Quadrant IV';
  if (x === 0 && y === 0) return 'Origin';
  if (x === 0) return 'y-axis';
  return 'x-axis';
}

function buildOptions(answer, wrongs) {
  const options = shuffle([answer, ...wrongs]).slice(0, 4);
  return options.includes(answer) ? options : [answer, ...options.slice(0, 3)];
}

function CoordinatePlane({ x, y, label }) {
  const size = 220;
  const step = 20;
  const center = size / 2;
  const px = center + x * step;
  const py = center - y * step;
  const lines = [];
  for (let i = 0; i <= size; i += step) {
    lines.push(<line key={`v-${i}`} x1={i} y1={0} x2={i} y2={size} stroke={i === center ? '#1f2937' : '#e2e8f0'} strokeWidth={i === center ? 2 : 1} />);
    lines.push(<line key={`h-${i}`} x1={0} y1={i} x2={size} y2={i} stroke={i === center ? '#1f2937' : '#e2e8f0'} strokeWidth={i === center ? 2 : 1} />);
  }
  return (
    <div style={styles.planeWrap}>
      <svg width={size} height={size} role="img" aria-label="Coordinate plane">
        {lines}
        <circle cx={px} cy={py} r={6} fill="#2563eb" />
        <text x={px + 8} y={py - 8} fill="#1e3a8a" fontSize="12" fontWeight="700">{label}</text>
      </svg>
    </div>
  );
}

function buildIdentifyPointQuestion() {
  let x = 0;
  let y = 0;
  while (x === 0 || y === 0) {
    x = randInt(-5, 5);
    y = randInt(-5, 5);
  }
  const answer = pointText(x, y);
  const wrongs = [
    pointText(y, x),
    pointText(-x, y),
    pointText(x, -y),
  ];
  return {
    prompt: 'What are the coordinates of point P?',
    answer,
    options: buildOptions(answer, wrongs),
    visual: <CoordinatePlane x={x} y={y} label="P" />,
    misconceptions: {
      [pointText(y, x)]: { hint: 'Read x first, then y.', message: 'You swapped x- and y-coordinates.' },
      [pointText(-x, y)]: { hint: 'Check left/right position for x sign.', message: 'The x-value sign is incorrect.' },
      [pointText(x, -y)]: { hint: 'Check up/down position for y sign.', message: 'The y-value sign is incorrect.' },
    },
    explain: `Point P is ${answer}: move ${x >= 0 ? 'right' : 'left'} ${Math.abs(x)}, then ${y >= 0 ? 'up' : 'down'} ${Math.abs(y)}.`,
  };
}

function buildQuadrantQuestion() {
  let x = 0;
  let y = 0;
  while (x === 0 || y === 0) {
    x = randInt(-6, 6);
    y = randInt(-6, 6);
  }
  const answer = quadrantOf(x, y);
  const wrongs = ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'].filter((q) => q !== answer).slice(0, 3);
  return {
    prompt: `In which quadrant is point ${pointText(x, y)} located?`,
    answer,
    options: buildOptions(answer, wrongs),
    misconceptions: {
      'Quadrant I': { hint: 'Quadrant I means (+, +).', message: 'Check signs of both coordinates.' },
      'Quadrant II': { hint: 'Quadrant II means (-, +).', message: 'Check signs of both coordinates.' },
      'Quadrant III': { hint: 'Quadrant III means (-, -).', message: 'Check signs of both coordinates.' },
      'Quadrant IV': { hint: 'Quadrant IV means (+, -).', message: 'Check signs of both coordinates.' },
    },
    explain: `${pointText(x, y)} has signs (${x > 0 ? '+' : '-'}, ${y > 0 ? '+' : '-'}) so it is in ${answer}.`,
  };
}

function buildReflectionQuestion() {
  let x = 0;
  let y = 0;
  while (x === 0 || y === 0) {
    x = randInt(-5, 5);
    y = randInt(-5, 5);
  }
  const reflectOverX = Math.random() < 0.5;
  const answer = reflectOverX ? pointText(x, -y) : pointText(-x, y);
  const wrongA = pointText(-x, -y);
  const wrongB = pointText(y, x);
  const wrongC = pointText(x, y);
  return {
    prompt: `Reflect point ${pointText(x, y)} about the ${reflectOverX ? 'x-axis' : 'y-axis'}. What is the image?`,
    answer,
    options: buildOptions(answer, [wrongA, wrongB, wrongC]),
    misconceptions: {
      [wrongA]: { hint: 'A single-axis reflection changes one sign, not both.', message: 'You reflected about both axes.' },
      [wrongB]: { hint: 'Reflection does not swap x and y.', message: 'You swapped coordinates instead of reflecting.' },
      [wrongC]: { hint: 'A reflection must change at least one coordinate sign.', message: 'You kept the original point unchanged.' },
    },
    explain: `Reflection about the ${reflectOverX ? 'x-axis changes y only' : 'y-axis changes x only'}, so the image is ${answer}.`,
  };
}

function buildTranslationQuestion() {
  let x = 0;
  let y = 0;
  while (x === 0 || y === 0) {
    x = randInt(-4, 4);
    y = randInt(-4, 4);
  }
  const dx = randInt(-3, 3);
  const dy = randInt(-3, 3);
  const answer = pointText(x + dx, y + dy);
  const wrongA = pointText(x + dy, y + dx);
  const wrongB = pointText(x - dx, y - dy);
  const wrongC = pointText(x + dx, y - dy);
  return {
    prompt: `Start at ${pointText(x, y)}. Translate by <${formatSignedInteger(dx)}, ${formatSignedInteger(dy)}>. Where do you land?`,
    answer,
    options: buildOptions(answer, [wrongA, wrongB, wrongC]),
    misconceptions: {
      [wrongA]: { hint: 'Add horizontal change to x and vertical change to y.', message: 'You mixed up dx and dy.' },
      [wrongB]: { hint: 'Translate means add the vector, not subtract it.', message: 'You subtracted the translation vector.' },
      [wrongC]: { hint: 'Check dy sign when updating y.', message: 'You changed the y-sign incorrectly.' },
    },
    explain: `Add coordinate-wise: (${x} + ${dx}, ${y} + ${dy}) = ${answer}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 2);
  if (mode === 0) return buildIdentifyPointQuestion();
  if (mode === 1) return buildQuadrantQuestion();
  if (mode === 2) return buildReflectionQuestion();
  return buildTranslationQuestion();
}

export default function CoordinateCapture() {
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
  const [feedback, setFeedback] = useState('Capture the right coordinate target.');
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
    setFeedback('Capture the right coordinate target.');
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
      setFeedback(`Correct coordinate reasoning and value check. ${current.explain}`);
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
        gameName: 'Coordinate Capture',
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
        title="Coordinate Capture"
        subtitle={`Plot, reflect, and translate points. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Grid Scout' },
            { value: 'challenge', label: 'Vector Hunter' },
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
      title="Coordinate Capture"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        renderOptionLabel={(option) => formatCoordinateOption(option)}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Capture Complete"
        score={score}
        total={TOTAL_ROUNDS}
        onRestart={() => startGame(level)}
        feedback={feedback}
        history={history}
        renderHistoryItem={(h, i) => (
          <span style={{ color: h.correct ? '#166534' : '#991b1b' }}>
            {i + 1}. {h.prompt} | You: {formatCoordinateOption(h.selected)} | Correct: {formatCoordinateOption(h.answer)}
          </span>
        )}
        promptStyle={styles.prompt}
        answersStyle={styles.answers}
        optionStyle={styles.answerBtn}
        selectedOptionStyle={{ background: '#dcfce7', borderColor: '#22c55e' }}
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
  planeWrap: {
    border: '1px solid #bfdbfe',
    background: '#eff6ff',
    borderRadius: 10,
    padding: 8,
    display: 'inline-block',
  },
  topSlot: {
    maxWidth: 920,
    margin: '0 auto 12px',
    padding: '10px',
    border: '1px solid #bbf7d0',
    background: '#f0fdf4',
    borderRadius: 10,
    display: 'flex',
    justifyContent: 'center',
  },
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
    color: '#0f172a',
  },
};
