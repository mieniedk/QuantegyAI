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

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const type = randInt(0, 2);

  if (type === 0) {
    const coinIsCompound = hard && band !== 'g6';
    const prompt = coinIsCompound
      ? 'Two fair coins are flipped. What is the probability of getting exactly one head?'
      : 'A fair coin is flipped. What is the probability of getting heads?';
    const answer = '1/2';
    const options = coinIsCompound ? shuffle(['1/2', '1/4', '3/4', '1/8']) : shuffle(['1/2', '1/3', '2/3', '1/4']);
    const explain = coinIsCompound
      ? 'Out of HH, HT, TH, TT, exactly one head happens in HT or TH: 2 out of 4 = 1/2.'
      : 'A fair coin has 2 equal outcomes, and one is heads: 1/2.';
    return { prompt, answer, options, explain, topic: 'coin' };
  }

  if (type === 1) {
    const dieSides = band === 'g6' ? 6 : (hard ? 12 : 8);
    const target = randInt(1, dieSides);
    const prompt = `A fair ${dieSides}-sided die is rolled. What is the probability of rolling a ${target}?`;
    const answer = `1/${dieSides}`;
    const options = shuffle([
      `1/${dieSides}`,
      `2/${dieSides}`,
      `1/${Math.max(2, dieSides - 1)}`,
      `1/${dieSides + 1}`,
    ]);
    const explain = `Each side is equally likely, so one specific result out of ${dieSides} outcomes is 1/${dieSides}.`;
    return { prompt, answer, options, explain, topic: 'die' };
  }

  const totalSlices = band === 'g6' ? 8 : hard ? 12 : 10;
  const redSlices = band === 'g6' ? randInt(1, 4) : hard ? randInt(2, 7) : randInt(2, 6);
  const prompt = `A spinner has ${totalSlices} equal sections. ${redSlices} are red. What is P(red)?`;
  const answer = `${redSlices}/${totalSlices}`;
  const options = shuffle([
    `${redSlices}/${totalSlices}`,
    `${totalSlices - redSlices}/${totalSlices}`,
    `${redSlices + 1}/${totalSlices}`,
    `${Math.max(1, redSlices - 1)}/${totalSlices}`,
  ]);
  const explain = `Probability = favorable outcomes / total outcomes = ${redSlices}/${totalSlices}.`;
  return { prompt, answer, options, explain, topic: 'spinner' };
}

export default function ProbabilityLab() {
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
  const [feedback, setFeedback] = useState('Pick the best probability.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);

  const current = questions[index];

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setQuestions(Array.from({ length: TOTAL_ROUNDS }, () => buildQuestion(nextLevel, band)));
    setIndex(0);
    setSelected('');
    setScore(0);
    setFeedback('Pick the best probability.');
    setDone(false);
    setHistory([]);
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
      setFeedback(`Not quite. ${current.explain}`);
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Probability Lab',
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
        title="Probability Lab"
        subtitle={`Run quick coin, dice, and spinner probability missions. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Explorer' },
            { value: 'challenge', label: 'Analyst' },
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
      title="Probability Lab"
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
        endTitle="Lab Report Complete"
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
        endCardStyle={{ maxWidth: 420, margin: '8px auto' }}
        feedbackStyle={{ maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}
        reviewStyle={{ maxWidth: 860 }}
      />
      {returnUrl && <LoopContinueButton onClick={goBack} />}
    </QuickGameLayout>
  );
}

const styles = {
  row: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 },
  prompt: {
    background: '#eef2ff',
    border: '1px solid #a5b4fc',
    borderRadius: 10,
    maxWidth: 640,
    margin: '0 auto 12px',
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  answers: {
    maxWidth: 520,
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
