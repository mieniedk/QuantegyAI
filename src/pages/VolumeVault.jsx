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
const PI_APPROX = 3.14;

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

function roundToTenth(n) {
  return Math.round(n * 10) / 10;
}

function buildOptionSet(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => {
    if (Number.isFinite(c)) set.add(String(c));
  });
  while (set.size < 4) {
    const jitter = randInt(1, 12);
    set.add(String(Math.max(1, roundToTenth(Number(answer) + (Math.random() > 0.5 ? jitter : -jitter)))));
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

  // Rectangular prism volume
  if (mode === 0) {
    const l = randInt(2, hard ? 14 : 10);
    const w = randInt(2, hard ? 12 : 8);
    const h = randInt(2, hard ? 10 : 7);
    const answer = l * w * h;
    const areaOnly = l * w;
    const perimeterTimesH = 2 * (l + w) * h;
    const missingOneFactor = l * h;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: areaOnly, message: 'You used base area only and forgot to multiply by height.', hint: 'Volume = base area × height.' },
      { value: perimeterTimesH, message: 'You mixed perimeter with volume.', hint: 'Use three dimensions multiplied.' },
      { value: missingOneFactor, message: 'You left out one dimension.', hint: 'Include length, width, and height.' },
    ]);
    return {
      prompt: `Rectangular prism dimensions are ${l} by ${w} by ${h}. What is the volume?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `Volume = l × w × h = ${l} × ${w} × ${h} = ${answer}.`,
    };
  }

  // Missing dimension in rectangular prism
  if (mode === 1) {
    const l = randInt(2, hard ? 14 : 10);
    const w = randInt(2, hard ? 10 : 8);
    const h = randInt(2, hard ? 10 : 7);
    const v = l * w * h;
    const answer = h;
    const subtractInstead = v - l - w;
    const multiplyInstead = v * l * w;
    const dividePartial = Math.round(v / l);
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: subtractInstead, message: 'You subtracted dimensions instead of dividing volume.', hint: 'Undo multiplication with division.' },
      { value: multiplyInstead, message: 'You multiplied again instead of solving for missing factor.', hint: 'Solve by dividing by known factors.' },
      { value: dividePartial, message: 'You divided by only one known dimension.', hint: 'Divide by both known dimensions.' },
    ]);
    return {
      prompt: `A rectangular prism has volume ${v}. Its base is ${l} by ${w}. What is the height?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `h = V/(l×w) = ${v}/(${l}×${w}) = ${answer}.`,
    };
  }

  // Cylinder volume (pi approximation)
  if (mode === 2) {
    const r = randInt(2, hard ? 9 : 6);
    const h = randInt(2, hard ? 12 : 9);
    const answer = roundToTenth(PI_APPROX * r * r * h);
    const missedSquare = roundToTenth(PI_APPROX * r * h);
    const usedDiameter = roundToTenth(PI_APPROX * (2 * r) * (2 * r) * h);
    const noPi = r * r * h;
    const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
      { value: missedSquare, message: 'You used r instead of r^2.', hint: 'Square the radius in cylinder volume.' },
      { value: usedDiameter, message: 'You used diameter where radius was needed.', hint: 'Use radius, not diameter.' },
      { value: noPi, message: 'You forgot to include pi.', hint: 'Cylinder volume includes pi.' },
    ]);
    return {
      prompt: `Cylinder with radius ${r} and height ${h}. Using π≈3.14, what is the volume?`,
      answer: String(answer),
      options,
      misconceptions,
      explain: `V = πr²h = 3.14×${r}²×${h} = ${answer}.`,
    };
  }

  // Unit conversion cm^3 to mL (1:1)
  const cm3 = randInt(hard ? 80 : 20, hard ? 600 : 300);
  const answer = cm3;
  const divideBy1000 = roundToTenth(cm3 / 1000);
  const multiplyBy1000 = cm3 * 1000;
  const minusOne = cm3 - 1;
  const { options, misconceptions } = buildOptionsWithMisconceptions(answer, [
    { value: divideBy1000, message: 'You applied a liter conversion instead of cm³ to mL.', hint: '1 cm³ equals 1 mL.' },
    { value: multiplyBy1000, message: 'You scaled in the wrong direction.', hint: 'cm³ and mL are equal numerically.' },
    { value: minusOne, message: 'You adjusted the value unnecessarily.', hint: 'Use direct 1-to-1 conversion.' },
  ]);
  return {
    prompt: `${cm3} cm³ is how many mL?`,
    answer: String(answer),
    options,
    misconceptions,
    explain: `By definition, 1 cm³ = 1 mL, so ${cm3} cm³ = ${answer} mL.`,
  };
}

export default function VolumeVault() {
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
  const [feedback, setFeedback] = useState('Crack the vault with volume mastery.');
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
    setFeedback('Crack the vault with volume mastery.');
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
        gameName: 'Volume Vault',
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
        title="Volume Vault"
        subtitle={`Unlock volume problems for prisms and cylinders. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Vault I' },
            { value: 'challenge', label: 'Vault II' },
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
      title="Volume Vault"
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
        endTitle="Vault Opened"
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
    background: '#f0f9ff',
    border: '1px solid #7dd3fc',
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
