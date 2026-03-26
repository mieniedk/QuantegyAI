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

function uniqueOptions(answer, candidates) {
  const set = new Set([String(answer)]);
  candidates.forEach((c) => set.add(String(c)));
  while (set.size < 4) {
    set.add(String(Number(answer) + randInt(-12, 12)));
  }
  return shuffle(Array.from(set)).slice(0, 4);
}

function cubeNet(size) {
  const s = 24;
  return (
    <svg width={170} height={130}>
      {[1, 2, 3, 4].map((i) => (
        <rect key={`c-${i}`} x={i * s} y={s} width={s} height={s} fill="rgba(59,130,246,0.22)" stroke="#1d4ed8" strokeWidth={2} />
      ))}
      <rect x={2 * s} y={0} width={s} height={s} fill="rgba(59,130,246,0.22)" stroke="#1d4ed8" strokeWidth={2} />
      <rect x={2 * s} y={2 * s} width={s} height={s} fill="rgba(59,130,246,0.22)" stroke="#1d4ed8" strokeWidth={2} />
      <text x={2.5 * s} y={s + 16} textAnchor="middle" fill="#1e3a8a" fontSize="11" fontWeight="700">{size}</text>
    </svg>
  );
}

function rectPrismNet(l, w, h) {
  return (
    <svg width={220} height={140}>
      <rect x={26} y={58} width={40} height={22} fill="rgba(16,185,129,0.24)" stroke="#047857" strokeWidth={2} />
      <rect x={66} y={44} width={66} height={36} fill="rgba(16,185,129,0.24)" stroke="#047857" strokeWidth={2} />
      <rect x={132} y={58} width={40} height={22} fill="rgba(16,185,129,0.24)" stroke="#047857" strokeWidth={2} />
      <rect x={66} y={80} width={66} height={36} fill="rgba(16,185,129,0.24)" stroke="#047857" strokeWidth={2} />
      <rect x={66} y={8} width={66} height={36} fill="rgba(16,185,129,0.24)" stroke="#047857" strokeWidth={2} />
      <text x={99} y={66} textAnchor="middle" fill="#065f46" fontSize="10" fontWeight="700">{l} x {w}</text>
      <text x={99} y={30} textAnchor="middle" fill="#065f46" fontSize="10" fontWeight="700">{l} x {h}</text>
      <text x={46} y={72} textAnchor="middle" fill="#065f46" fontSize="10" fontWeight="700">{w} x {h}</text>
    </svg>
  );
}

function triPrismNet(b, triH, len) {
  return (
    <svg width={240} height={130}>
      <polygon points="12,76 36,36 60,76" fill="rgba(245,158,11,0.25)" stroke="#b45309" strokeWidth={2} />
      <rect x={60} y={56} width={44} height={30} fill="rgba(245,158,11,0.25)" stroke="#b45309" strokeWidth={2} />
      <rect x={104} y={56} width={44} height={30} fill="rgba(245,158,11,0.25)" stroke="#b45309" strokeWidth={2} />
      <rect x={148} y={56} width={44} height={30} fill="rgba(245,158,11,0.25)" stroke="#b45309" strokeWidth={2} />
      <polygon points="192,76 216,36 240,76" fill="rgba(245,158,11,0.25)" stroke="#b45309" strokeWidth={2} />
      <text x={36} y={90} textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="700">b={b}</text>
      <text x={126} y={75} textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="700">len={len}</text>
      <text x={36} y={30} textAnchor="middle" fill="#92400e" fontSize="10" fontWeight="700">h={triH}</text>
    </svg>
  );
}

function cylinderNet(r, h) {
  return (
    <svg width={230} height={140}>
      <circle cx={40} cy={70} r={22} fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <rect x={70} y={48} width={110} height={44} fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <circle cx={190} cy={70} r={22} fill="rgba(168,85,247,0.24)" stroke="#7e22ce" strokeWidth={2} />
      <text x={40} y={76} textAnchor="middle" fill="#6b21a8" fontSize="10" fontWeight="700">r={r}</text>
      <text x={125} y={74} textAnchor="middle" fill="#6b21a8" fontSize="10" fontWeight="700">h={h}</text>
      <text x={125} y={104} textAnchor="middle" fill="#6b21a8" fontSize="10" fontWeight="700">width = 2πr</text>
    </svg>
  );
}

function buildCubeQuestion() {
  const s = randInt(2, 10);
  const answer = 6 * s * s;
  const wrongOneFace = s * s;
  const wrongVolume = s * s * s;
  const wrongHalf = 3 * s * s;
  const options = uniqueOptions(answer, [wrongOneFace, wrongVolume, wrongHalf]);
  return {
    prompt: `This net folds into a cube with side length ${s}. What is its surface area?`,
    visual: <div style={styles.netWrap}>{cubeNet(s)}</div>,
    formula: 'Cube SA: 6s^2',
    answer: String(answer),
    options,
    misconceptions: {
      [String(wrongOneFace)]: { hint: 'A cube has 6 congruent faces.', message: 'You used area of one face only.' },
      [String(wrongVolume)]: { hint: 'Surface area is square units, not cubic units.', message: 'You computed volume instead of surface area.' },
      [String(wrongHalf)]: { hint: 'Count all six faces, not half the net.', message: 'You counted too few faces.' },
    },
    explain: `Surface area of a cube is 6s^2 = 6(${s}^2) = ${answer}.`,
  };
}

function buildRectPrismQuestion() {
  const l = randInt(3, 12);
  const w = randInt(2, 9);
  const h = randInt(2, 9);
  const answer = 2 * (l * w + l * h + w * h);
  const wrongMissing2 = l * w + l * h + w * h;
  const wrongVolume = l * w * h;
  const wrongTwoFaces = 2 * l * w;
  const options = uniqueOptions(answer, [wrongMissing2, wrongVolume, wrongTwoFaces]);
  return {
    prompt: `Find surface area of a rectangular prism with l=${l}, w=${w}, h=${h}.`,
    visual: <div style={styles.netWrap}>{rectPrismNet(l, w, h)}</div>,
    formula: 'Rectangular Prism SA: 2(lw + lh + wh)',
    answer: String(answer),
    options,
    misconceptions: {
      [String(wrongMissing2)]: { hint: 'Each pair of congruent faces appears twice.', message: 'You forgot the factor of 2.' },
      [String(wrongVolume)]: { hint: 'Volume multiplies three dimensions; surface area adds face areas.', message: 'You found volume, not surface area.' },
      [String(wrongTwoFaces)]: { hint: 'Use all three face-pairs: lw, lh, and wh.', message: 'You counted only one face-pair.' },
    },
    explain: `SA = 2(lw + lh + wh) = 2(${l * w} + ${l * h} + ${w * h}) = ${answer}.`,
  };
}

function buildTriPrismQuestion() {
  const b = randInt(4, 10);
  const triH = randInt(3, 8);
  const len = randInt(5, 12);
  const side = Math.round(Math.sqrt((b / 2) ** 2 + triH ** 2) * 10) / 10;
  const triArea = 0.5 * b * triH;
  const lateral = len * (b + 2 * side);
  const answer = Math.round((2 * triArea + lateral) * 10) / 10;
  const wrongNoTriangles = Math.round(lateral * 10) / 10;
  const wrongOneTriangle = Math.round((triArea + lateral) * 10) / 10;
  const wrongDoubleLateral = Math.round((2 * lateral) * 10) / 10;
  const options = uniqueOptions(answer, [wrongNoTriangles, wrongOneTriangle, wrongDoubleLateral]);
  return {
    prompt: `A triangular prism has base ${b}, triangle height ${triH}, and prism length ${len}. What is its surface area?`,
    visual: <div style={styles.netWrap}>{triPrismNet(b, triH, len)}</div>,
    formula: 'Triangular Prism SA: 2B + Ph',
    answer: String(answer),
    options,
    misconceptions: {
      [String(wrongNoTriangles)]: { hint: 'Include both triangular bases too.', message: 'You counted lateral area only.' },
      [String(wrongOneTriangle)]: { hint: 'There are two congruent triangular ends.', message: 'You included only one triangle base.' },
      [String(wrongDoubleLateral)]: { hint: 'Don’t double the lateral strip; add two triangle areas.', message: 'You doubled the wrong part of the formula.' },
    },
    explain: `SA = 2B + Ph = 2(${triArea}) + (${b} + 2*${side})(${len}) = ${answer}.`,
  };
}

function buildCylinderQuestion() {
  const r = randInt(2, 8);
  const h = randInt(4, 12);
  const pi = 3.14;
  const answer = Number((2 * pi * r * (r + h)).toFixed(2));
  const wrongLateralOnly = Number((2 * pi * r * h).toFixed(2));
  const wrongOneBase = Number(((2 * pi * r * h) + (pi * r * r)).toFixed(2));
  const wrongVolume = Number((pi * r * r * h).toFixed(2));
  const options = uniqueOptions(answer, [wrongLateralOnly, wrongOneBase, wrongVolume]);
  return {
    prompt: `Find the surface area of a cylinder with r=${r} and h=${h} (use π = 3.14).`,
    visual: <div style={styles.netWrap}>{cylinderNet(r, h)}</div>,
    formula: 'Cylinder SA: 2πr^2 + 2πrh',
    answer: String(answer),
    options,
    misconceptions: {
      [String(wrongLateralOnly)]: { hint: 'Add the two circular bases too.', message: 'You used lateral area only.' },
      [String(wrongOneBase)]: { hint: 'A closed cylinder has two congruent circular bases.', message: 'You counted only one base.' },
      [String(wrongVolume)]: { hint: 'Volume and surface area use different formulas and units.', message: 'You computed volume instead of surface area.' },
    },
    explain: `SA = 2πr^2 + 2πrh = 2(3.14)(${r}^2) + 2(3.14)(${r})(${h}) = ${answer}.`,
  };
}

function buildQuestion(level, band) {
  const hard = level === 'challenge' || band === 'hs';
  const mode = randInt(0, hard ? 3 : 1);
  if (mode === 0) return buildCubeQuestion();
  if (mode === 1) return buildRectPrismQuestion();
  if (mode === 2) return buildTriPrismQuestion();
  return buildCylinderQuestion();
}

export default function SurfaceAreaScramble() {
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
  const [feedback, setFeedback] = useState('Scramble the net into full surface area.');
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [misconceptionMisses, setMisconceptionMisses] = useState({});
  const [showFormulaHint, setShowFormulaHint] = useState(false);

  const current = questions[index];

  const startGame = (nextLevel) => {
    setLevel(nextLevel);
    setQuestions(Array.from({ length: TOTAL_ROUNDS }, () => buildQuestion(nextLevel, band)));
    setIndex(0);
    setSelected('');
    setScore(0);
    setFeedback('Scramble the net into full surface area.');
    setDone(false);
    setHistory([]);
    setMisconceptionMisses({});
    setShowFormulaHint(false);
  };

  const submit = () => {
    if (!current || !selected) return;
    const correct = String(selected) === String(current.answer);
    const nextHistory = [...history, { ...current, selected, correct }];
    setHistory(nextHistory);
    const formulaText = showFormulaHint && current?.formula ? ` Formula: ${current.formula}.` : ' Turn on Formula Hint for a formula reminder.';
    if (correct) {
      setScore((s) => s + 1);
      setFeedback(`Correct surface-area setup and computation. ${current.explain}${formulaText}`);
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
        setFeedback(`${misconception ? `${misconception.message} ` : ''}${current.explain}${formulaText}`);
      }
    }

    if (index + 1 >= TOTAL_ROUNDS) {
      const finalScore = correct ? score + 1 : score;
      setDone(true);
      saveGameResult({
        gameName: 'Surface Area Scramble',
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
        title="Surface Area Scramble"
        subtitle={`Find total exposed area from nets and dimensions. (${gameGradeBandLabel(band)})`}
      >
        <QuickLevelPicker
          options={[
            { value: 'easy', label: 'Face Finder' },
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
      title="Surface Area Scramble"
      subtitle={`Round ${Math.min(index + 1, TOTAL_ROUNDS)} / ${TOTAL_ROUNDS} | Score: ${score} | ${gameGradeBandLabel(band)}`}
    >
      <div style={styles.formulaToggleWrap}>
        <button
          type="button"
          onClick={() => setShowFormulaHint((v) => !v)}
          style={showFormulaHint ? { ...styles.formulaToggleBtn, ...styles.formulaToggleBtnOn } : styles.formulaToggleBtn}
        >
          {showFormulaHint ? 'Formula Hint: ON' : 'Formula Hint: OFF'}
        </button>
      </div>
      {showFormulaHint && current?.formula && (
        <div style={styles.formulaHintCard}>
          {current.formula}
        </div>
      )}
      <MultipleChoiceRound
        topSlot={current?.visual ? <div style={styles.topSlot}>{current.visual}</div> : null}
        done={done}
        prompt={current?.prompt || ''}
        options={current?.options || []}
        selected={selected}
        onSelect={setSelected}
        onSubmit={submit}
        submitDisabled={!selected}
        endTitle="Scramble Complete"
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
  formulaToggleWrap: {
    display: 'flex',
    justifyContent: 'center',
    margin: '2px 0 10px',
  },
  formulaToggleBtn: {
    border: '1px solid #cbd5e1',
    borderRadius: 999,
    background: '#fff',
    color: '#1e293b',
    fontWeight: 700,
    fontSize: 13,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  formulaToggleBtnOn: {
    background: '#eff6ff',
    borderColor: '#93c5fd',
    color: '#1d4ed8',
  },
  formulaHintCard: {
    maxWidth: 760,
    margin: '0 auto 10px',
    border: '1px solid #bfdbfe',
    background: '#f8fbff',
    color: '#1e40af',
    borderRadius: 10,
    padding: '8px 12px',
    fontWeight: 700,
    textAlign: 'center',
  },
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
  netWrap: {
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
