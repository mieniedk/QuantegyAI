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
const SOLIDS = ['Cube', 'Rectangular Prism', 'Triangular Prism', 'Square Pyramid'];

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

function buildOptions(answer) {
  return shuffle([answer, ...SOLIDS.filter((s) => s !== answer)]).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildOptions(answer);
  const misconceptions = {};
  candidates.forEach((c) => {
    const key = String(c.value);
    if (key !== String(answer) && options.includes(key)) {
      misconceptions[key] = { message: c.message, hint: c.hint || c.message };
    }
  });
  return { options, misconceptions };
}

function CubeNet() {
  const s = 28;
  return (
    <svg width={170} height={130}>
      {[1, 2, 3, 4].map((i) => (
        <rect key={`r-${i}`} x={i * s} y={s} width={s} height={s} fill="rgba(59,130,246,0.22)" stroke="#1d4ed8" strokeWidth={2} />
      ))}
      <rect x={2 * s} y={0} width={s} height={s} fill="rgba(59,130,246,0.22)" stroke="#1d4ed8" strokeWidth={2} />
      <rect x={2 * s} y={2 * s} width={s} height={s} fill="rgba(59,130,246,0.22)" stroke="#1d4ed8" strokeWidth={2} />
    </svg>
  );
}

function RectPrismNet() {
  return (
    <svg width={190} height={140}>
      <rect x={25} y={52} width={38} height={24} fill="rgba(16,185,129,0.22)" stroke="#047857" strokeWidth={2} />
      <rect x={63} y={40} width={54} height={36} fill="rgba(16,185,129,0.22)" stroke="#047857" strokeWidth={2} />
      <rect x={117} y={52} width={38} height={24} fill="rgba(16,185,129,0.22)" stroke="#047857" strokeWidth={2} />
      <rect x={63} y={76} width={54} height={36} fill="rgba(16,185,129,0.22)" stroke="#047857" strokeWidth={2} />
      <rect x={63} y={4} width={54} height={36} fill="rgba(16,185,129,0.22)" stroke="#047857" strokeWidth={2} />
      <rect x={155} y={40} width={24} height={36} fill="rgba(16,185,129,0.22)" stroke="#047857" strokeWidth={2} />
    </svg>
  );
}

function TriPrismNet() {
  return (
    <svg width={190} height={130}>
      <polygon points="18,65 42,28 66,65" fill="rgba(245,158,11,0.24)" stroke="#b45309" strokeWidth={2} />
      <rect x={66} y={46} width={34} height={38} fill="rgba(245,158,11,0.24)" stroke="#b45309" strokeWidth={2} />
      <rect x={100} y={46} width={34} height={38} fill="rgba(245,158,11,0.24)" stroke="#b45309" strokeWidth={2} />
      <rect x={134} y={46} width={34} height={38} fill="rgba(245,158,11,0.24)" stroke="#b45309" strokeWidth={2} />
      <polygon points="168,65 192,28 216,65" transform="translate(-24,0)" fill="rgba(245,158,11,0.24)" stroke="#b45309" strokeWidth={2} />
    </svg>
  );
}

function SquarePyramidNet() {
  return (
    <svg width={180} height={150}>
      <rect x={70} y={55} width={40} height={40} fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <polygon points="70,55 90,20 110,55" fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <polygon points="110,55 145,75 110,95" fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <polygon points="70,95 90,130 110,95" fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <polygon points="70,55 35,75 70,95" fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
    </svg>
  );
}

function netVisual(type) {
  if (type === 'Cube') return <CubeNet />;
  if (type === 'Rectangular Prism') return <RectPrismNet />;
  if (type === 'Triangular Prism') return <TriPrismNet />;
  return <SquarePyramidNet />;
}

function buildNetToSolidQuestion() {
  const answer = SOLIDS[randInt(0, SOLIDS.length - 1)];
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: 'Cube', message: 'Count face shapes and total faces in the net.', hint: 'Match both shape and count.' },
    { value: 'Rectangular Prism', message: 'This net has different face structure than a rectangular prism.', hint: 'Check if all faces are rectangles.' },
    { value: 'Triangular Prism', message: 'A triangular prism net needs two triangles.', hint: 'Look for triangle faces.' },
    { value: 'Square Pyramid', message: 'A square pyramid net has one square base and four triangles.', hint: 'Look for triangle sides around base.' },
  ]);
  return {
    prompt: 'Which solid folds from this net?',
    visual: <div style={styles.netBox}>{netVisual(answer)}</div>,
    answer,
    options,
    misconceptions,
    explain: `This net matches a ${answer.toLowerCase()} by its face shapes and arrangement.`,
  };
}

function buildFaceCountQuestion() {
  const solid = SOLIDS[randInt(0, SOLIDS.length - 1)];
  const answer = solid === 'Cube' ? '6' : solid === 'Rectangular Prism' ? '6' : solid === 'Triangular Prism' ? '5' : '5';
  const wrongOne = String(Number(answer) + 1);
  const wrongTwo = String(Number(answer) - 1);
  const wrongThree = solid === 'Square Pyramid' ? '4' : '8';
  const options = shuffle([answer, wrongOne, wrongTwo, wrongThree]).slice(0, 4);
  const misconceptions = {
    [wrongOne]: { message: 'You overcounted the number of faces.', hint: 'Count each unique face once.' },
    [wrongTwo]: { message: 'You undercounted the number of faces.', hint: 'Check hidden/back faces too.' },
    [wrongThree]: { message: 'You likely mixed edges/vertices with faces.', hint: 'Faces are flat surfaces.' },
  };
  return {
    prompt: `How many faces does a ${solid.toLowerCase()} have?`,
    answer,
    options,
    misconceptions,
    explain: `${solid} has ${answer} faces.`,
  };
}

function buildPropertyQuestion() {
  const solid = SOLIDS[randInt(0, SOLIDS.length - 1)];
  let answer;
  let explain;
  let wrongA;
  let wrongB;
  let wrongC;
  if (solid === 'Cube') {
    answer = 'All 6 faces are squares';
    wrongA = 'It has 2 triangular faces';
    wrongB = 'It has only 5 faces';
    wrongC = 'Its base is a triangle';
    explain = 'A cube has 6 congruent square faces.';
  } else if (solid === 'Rectangular Prism') {
    answer = 'It has 6 rectangular faces';
    wrongA = 'All faces are triangles';
    wrongB = 'It has 4 faces total';
    wrongC = 'It has a circular base';
    explain = 'A rectangular prism has 6 rectangular faces.';
  } else if (solid === 'Triangular Prism') {
    answer = 'It has 2 triangular and 3 rectangular faces';
    wrongA = 'It has 1 square and 4 triangular faces';
    wrongB = 'It has 6 square faces';
    wrongC = 'It has only rectangular faces';
    explain = 'A triangular prism has 5 faces: 2 triangles and 3 rectangles.';
  } else {
    answer = 'It has 1 square base and 4 triangular faces';
    wrongA = 'It has 2 triangular bases';
    wrongB = 'It has 6 rectangular faces';
    wrongC = 'It has no triangular faces';
    explain = 'A square pyramid has 1 square base and 4 triangular side faces.';
  }
  const options = shuffle([answer, wrongA, wrongB, wrongC]);
  const misconceptions = {
    [wrongA]: { message: 'That face breakdown belongs to a different solid.', hint: 'Match base shape first.' },
    [wrongB]: { message: 'You mixed this solid with another prism/cube pattern.', hint: 'Recount by solid type.' },
    [wrongC]: { message: 'This ignores required face types for this solid.', hint: 'Identify side faces carefully.' },
  };
  return {
    prompt: `Which statement is true about a ${solid.toLowerCase()}?`,
    answer,
    options,
    misconceptions,
    explain,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 2 : 1);
  if (mode === 0) return buildNetToSolidQuestion();
  if (mode === 1) return buildFaceCountQuestion();
  return buildPropertyQuestion();
}

export default function GeometryNetNinja() {
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
  const [feedback, setFeedback] = useState('Fold the right net mentally.');
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
    setFeedback('Fold the right net mentally.');
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
        gameName: 'Geometry Net Ninja',
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
        title="Geometry Net Ninja"
        subtitle={`Match nets to 3D solids and properties. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Net Scout' },
            { value: 'challenge', label: 'Net Master' },
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
      title="Geometry Net Ninja"
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
        endTitle="Ninja Complete"
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
    display: 'flex',
    justifyContent: 'center',
  },
  netBox: {
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    background: '#fff',
    padding: '8px 10px',
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
