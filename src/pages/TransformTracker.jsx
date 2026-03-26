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

function point(x, y) {
  return `(${x}, ${y})`;
}

function buildOptions(answer, candidates) {
  const set = new Set([answer, ...candidates]);
  return shuffle(Array.from(set)).slice(0, 4);
}

function buildOptionsWithMisconceptions(answer, candidates) {
  const options = buildOptions(answer, candidates.map((c) => c.value));
  const misconceptions = {};
  candidates.forEach((c) => {
    if (c.value !== answer && options.includes(c.value)) {
      misconceptions[c.value] = { message: c.message, hint: c.hint || c.message };
    }
  });
  return { options, misconceptions };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 2);
  const x = randInt(-6, 6);
  const y = randInt(-6, 6);
  const safeX = x === 0 ? 2 : x;
  const safeY = y === 0 ? -3 : y;

  // Translation
  if (mode === 0) {
    const dx = randInt(-5, 5) || 3;
    const dy = randInt(-5, 5) || -2;
    const ansX = safeX + dx;
    const ansY = safeY + dy;
    const answer = point(ansX, ansY);
    const swapDelta = point(safeX + dy, safeY + dx);
    const signFlip = point(safeX - dx, safeY - dy);
    const xOnly = point(safeX + dx, safeY);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: swapDelta, message: 'You swapped horizontal and vertical movement.', hint: 'x changes by dx, y by dy.' },
      { value: signFlip, message: 'You moved in the opposite direction.', hint: 'Follow translation signs carefully.' },
      { value: xOnly, message: 'You changed only one coordinate.', hint: 'Translate both x and y.' },
    ]);
    return {
      prompt: `Point A is ${point(safeX, safeY)}. Translate by (${dx}, ${dy}). What is A'?`,
      answer,
      options,
      misconceptions,
      explain: `Add dx to x and dy to y: (${safeX}+${dx}, ${safeY}+${dy}) = ${answer}.`,
    };
  }

  // Reflection
  if (mode === 1) {
    const reflectXaxis = Math.random() > 0.5;
    const answer = reflectXaxis ? point(safeX, -safeY) : point(-safeX, safeY);
    const wrongKeep = point(safeX, safeY);
    const wrongBoth = point(-safeX, -safeY);
    const wrongSwap = point(safeY, safeX);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: wrongKeep, message: 'You did not apply reflection.', hint: 'One coordinate sign must change.' },
      { value: wrongBoth, message: 'You changed both signs instead of reflecting about one axis.', hint: 'Only one coordinate changes sign.' },
      { value: wrongSwap, message: 'You swapped coordinates instead of reflecting.', hint: 'Reflection does not swap x and y.' },
    ]);
    return {
      prompt: `Point A is ${point(safeX, safeY)}. Reflect about the ${reflectXaxis ? 'x-axis' : 'y-axis'}. What is A'?`,
      answer,
      options,
      misconceptions,
      explain: reflectXaxis
        ? `Reflection about the x-axis keeps x and flips y: ${answer}.`
        : `Reflection about the y-axis keeps y and flips x: ${answer}.`,
    };
  }

  // Rotation 90 degrees
  if (mode === 2) {
    const clockwise = Math.random() > 0.5;
    const answer = clockwise ? point(safeY, -safeX) : point(-safeY, safeX);
    const oppositeTurn = clockwise ? point(-safeY, safeX) : point(safeY, -safeX);
    const signFlipOnly = point(-safeX, -safeY);
    const unchanged = point(safeX, safeY);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: oppositeTurn, message: 'You rotated in the opposite direction.', hint: 'Check clockwise vs counterclockwise.' },
      { value: signFlipOnly, message: 'You flipped signs without rotating coordinates.', hint: '90° rotation swaps coordinate roles.' },
      { value: unchanged, message: 'You did not apply the rotation.', hint: 'Rotate around origin to new quadrant.' },
    ]);
    return {
      prompt: `Point A is ${point(safeX, safeY)}. Rotate 90° ${clockwise ? 'clockwise' : 'counterclockwise'} about the origin. What is A'?`,
      answer,
      options,
      misconceptions,
      explain: clockwise
        ? `For 90° clockwise, (x, y) -> (y, -x): ${answer}.`
        : `For 90° counterclockwise, (x, y) -> (-y, x): ${answer}.`,
    };
  }

  // Dilation
  const scale = hard ? randInt(2, 4) : randInt(2, 3);
  const answer = point(safeX * scale, safeY * scale);
  const addInstead = point(safeX + scale, safeY + scale);
  const divideInstead = point(Math.trunc(safeX / scale), Math.trunc(safeY / scale));
  const oneCoord = point(safeX * scale, safeY);
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: addInstead, message: 'You added the scale factor instead of multiplying coordinates.', hint: 'Dilation scales multiplicatively.' },
    { value: divideInstead, message: 'You divided coordinates instead of scaling up.', hint: 'Scale factor > 1 enlarges.' },
    { value: oneCoord, message: 'You scaled only one coordinate.', hint: 'Multiply both x and y.' },
  ]);
  return {
    prompt: `Point A is ${point(safeX, safeY)}. Dilate from the origin by scale factor ${scale}. What is A'?`,
    answer,
    options,
    misconceptions,
    explain: `Multiply both coordinates by ${scale}: (${safeX}*${scale}, ${safeY}*${scale}) = ${answer}.`,
  };
}

export default function TransformTracker() {
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
  const [feedback, setFeedback] = useState('Track each transformation carefully.');
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
    setFeedback('Track each transformation carefully.');
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
      setFeedback(`Correct transformation reasoning and identification. ${current.explain}`);
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
        gameName: 'Transform Tracker',
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
        title="Transform Tracker"
        subtitle={`Follow translations, reflections, rotations, and dilations. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Mapper' },
            { value: 'challenge', label: 'Navigator' },
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
      title="Transform Tracker"
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
        endTitle="Tracker Complete"
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
    background: '#ecfeff',
    border: '1px solid #67e8f9',
    borderRadius: 10,
    maxWidth: 780,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  answers: {
    maxWidth: 720,
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
