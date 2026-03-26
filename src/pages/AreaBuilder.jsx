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

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => {
    if (Number.isFinite(c)) set.add(String(c));
  });
  while (set.size < 4) {
    const jitter = randInt(1, 10);
    set.add(String(Math.max(1, Number(answer) + (Math.random() > 0.5 ? jitter : -jitter))));
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

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 2);

  if (mode === 0) {
    const length = randInt(3, hard ? 18 : 12);
    const width = randInt(2, hard ? 14 : 10);
    const answer = length * width;
    const addInstead = length + width;
    const perimeter = 2 * (length + width);
    const oneSideDouble = 2 * length * width;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: addInstead, message: 'You added dimensions instead of multiplying for area.', hint: 'Area uses multiplication.' },
      { value: perimeter, message: 'You calculated perimeter, not area.', hint: 'Area counts square units inside.' },
      { value: oneSideDouble, message: 'You doubled unnecessarily while finding area.', hint: 'Use length × width only.' },
    ]);
    return {
      prompt: `Rectangle has length ${length} and width ${width}. What is the area?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Area of a rectangle is length × width = ${length} × ${width} = ${answer}.`,
    };
  }

  if (mode === 1) {
    const length = randInt(3, hard ? 16 : 11);
    const width = randInt(2, hard ? 12 : 9);
    const answer = 2 * (length + width);
    const area = length * width;
    const onePairOnly = length + width;
    const doubledArea = 2 * length * width;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: area, message: 'You found area instead of perimeter.', hint: 'Perimeter is around the shape.' },
      { value: onePairOnly, message: 'You only added one length and one width.', hint: 'Perimeter uses all four sides.' },
      { value: doubledArea, message: 'You doubled area instead of adding side lengths.', hint: 'Use 2(l + w).' },
    ]);
    return {
      prompt: `Rectangle has length ${length} and width ${width}. What is the perimeter?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Perimeter of a rectangle is 2(l + w) = 2(${length}+${width}) = ${answer}.`,
    };
  }

  if (mode === 2) {
    const width = randInt(2, hard ? 12 : 9);
    const length = randInt(3, hard ? 15 : 11);
    const area = length * width;
    const answer = length;
    const subtractInstead = area - width;
    const multiplyInstead = area * width;
    const quotientFlip = width !== 0 ? width / area : 0;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: subtractInstead, message: 'You subtracted instead of dividing to find missing side length.', hint: 'Missing side = area ÷ known side.' },
      { value: multiplyInstead, message: 'You multiplied instead of reversing with division.', hint: 'Undo multiplication with division.' },
      { value: quotientFlip, message: 'You inverted the division order.', hint: 'Divide area by the known side.' },
    ]);
    return {
      prompt: `A rectangle has area ${area} and width ${width}. What is the length?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Area = length × width, so length = area ÷ width = ${area} ÷ ${width} = ${answer}.`,
    };
  }

  const base = randInt(4, hard ? 18 : 12);
  const height = randInt(2, hard ? 12 : 8) * 2; // keep integer area
  const answer = (base * height) / 2;
  const noHalf = base * height;
  const halfBaseOnly = base / 2;
  const halfHeightOnly = height / 2;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: noHalf, message: 'You forgot the 1/2 factor for triangle area.', hint: 'Triangle area is one-half bh.' },
    { value: halfBaseOnly, message: 'You halved only the base without multiplying by height.', hint: 'Use (1/2) × b × h.' },
    { value: halfHeightOnly, message: 'You halved only height without completing multiplication.', hint: 'Multiply both dimensions with 1/2.' },
  ]);
  return {
    prompt: `A triangle has base ${base} and height ${height}. What is the area?`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `Area of a triangle is (1/2)bh = (1/2)(${base})(${height}) = ${answer}.`,
  };
}

export default function AreaBuilder() {
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
  const [feedback, setFeedback] = useState('Build area and perimeter mastery.');
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
    setFeedback('Build area and perimeter mastery.');
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
      setFeedback(`Correct area model and calculation. ${current.explain}`);
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
        gameName: 'Area Builder',
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
        title="Area Builder"
        subtitle={`Compute area and perimeter across shapes. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Draftsman' },
            { value: 'challenge', label: 'Architect' },
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
      title="Area Builder"
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
        endTitle="Blueprint Complete"
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
