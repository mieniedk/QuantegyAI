import React, { useState, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import LoopContinueButton from '../components/LoopContinueButton';
import useGameReturn from '../hooks/useGameReturn';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   GRAPH EXPLORER — Bar Graphs, Pictographs & Dot Plots
   Interactive data-reading game (TEKS 3.8A, 3.8B)
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  correct: () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 80); setTimeout(() => tone(784, 0.15), 160); },
  wrong:   () => tone(200, 0.3, 'sawtooth', 0.06),
  pop:     () => tone(600, 0.06, 'sine', 0.08),
  win:     () => { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 90)); },
  whoosh:  () => { tone(300, 0.1, 'sine', 0.05); setTimeout(() => tone(500, 0.1, 'sine', 0.05), 50); },
};

const pick = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const COLORS = ['#f87171','#60a5fa','#34d399','#fbbf24','#c084fc','#fb923c','#f472b6','#22d3ee'];
const ICONS = ['🍎','🍕','🏀','📚','🐶','🌮','⭐','🎮','🌈','🎵','🚀','🍦'];

const THEMES = [
  { title: 'Favorite Fruits',      cats: ['Apples','Bananas','Grapes','Oranges','Strawberries'] },
  { title: 'Pets at Home',         cats: ['Dogs','Cats','Fish','Birds','Hamsters'] },
  { title: 'Favorite Sports',      cats: ['Soccer','Basketball','Baseball','Swimming','Tennis'] },
  { title: 'School Lunches',       cats: ['Pizza','Tacos','Burgers','Salad','Pasta'] },
  { title: 'Weekend Activities',   cats: ['Video Games','Reading','Sports','Drawing','Cooking'] },
  { title: 'Favorite Colors',      cats: ['Blue','Red','Green','Purple','Yellow'] },
  { title: 'Books Read This Month', cats: ['Fiction','Comics','Science','History','Poetry'] },
  { title: 'Snack Votes',          cats: ['Chips','Cookies','Fruit','Popcorn','Pretzels'] },
];

const DIFFICULTY = {
  easy:   { label: 'Explorer',    emoji: '🌱', rounds: 8,  maxVal: 8,  minCats: 3, maxCats: 4, types: ['bar','pictograph'], qTypes: ['most','least','value','total'] },
  medium: { label: 'Analyst',     emoji: '🔥', rounds: 10, maxVal: 12, minCats: 4, maxCats: 5, types: ['bar','pictograph','dot'], qTypes: ['most','least','value','total','difference','how_many_more','combined'] },
  hard:   { label: 'Data Master', emoji: '💎', rounds: 12, maxVal: 20, minCats: 4, maxCats: 5, types: ['bar','pictograph','dot'], qTypes: ['most','least','value','total','difference','how_many_more','combined','fewer','scale'] },
};

const QBOT_MSGS = {
  start: ["Let's explore some data! 📊🤖", "Time to read some graphs! Can you find the answers? 📈", "Data Detective mode activated! 🔍"],
  correct: ["Correct graph read - your count/value extraction is accurate. 📊", "Exactly right - category-to-value mapping is correct. ⭐", "Correct result - data comparison is sound. 🎉", "QBot confirms your graph interpretation. 🤖✅"],
  wrong: ["Not correct yet - re-read axis labels and category values. 📊", "Close - recount bars/dots or icon scale carefully. 🔍", "Check totals/differences from the graph one more time. 💪"],
  win: ["You finished with strong data-analysis reasoning. 🏆📊", "Graph interpretation skills are improving well. 🌟", "Data exploration complete with mathematical evidence. 🤖🎉"],
};

function generateDataSet(diff) {
  const theme = pick(THEMES);
  const numCats = randInt(diff.minCats, diff.maxCats);
  const cats = shuffle(theme.cats).slice(0, numCats);
  const values = cats.map(() => randInt(1, diff.maxVal));
  const icon = pick(ICONS);
  const graphType = pick(diff.types);
  const scale = graphType === 'pictograph' && diff.maxVal > 10 ? 2 : 1;

  return { title: theme.title, cats, values, icon, graphType, scale };
}

function generateQuestion(data, diff) {
  const { cats, values, scale } = data;
  const qType = pick(diff.qTypes);

  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const maxIdx = values.indexOf(maxVal);
  const minIdx = values.indexOf(minVal);
  const total = values.reduce((s, v) => s + v, 0);

  let prompt, correctAnswer, options;

  switch (qType) {
    case 'most': {
      prompt = `Which category has the most?`;
      correctAnswer = cats[maxIdx];
      options = shuffle(cats).slice(0, 4);
      if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      options = shuffle(options);
      break;
    }
    case 'least': {
      prompt = `Which category has the fewest?`;
      correctAnswer = cats[minIdx];
      options = shuffle(cats).slice(0, 4);
      if (!options.includes(correctAnswer)) options[0] = correctAnswer;
      options = shuffle(options);
      break;
    }
    case 'value': {
      const idx = randInt(0, cats.length - 1);
      prompt = `How many for "${cats[idx]}"?`;
      correctAnswer = values[idx];
      options = genNumericOptions(correctAnswer, diff.maxVal);
      break;
    }
    case 'total': {
      prompt = `What is the total of all categories combined?`;
      correctAnswer = total;
      options = genNumericOptions(total, total + 10);
      break;
    }
    case 'difference': {
      const [i, j] = pickTwoDiff(cats.length);
      prompt = `What is the difference between "${cats[i]}" and "${cats[j]}"?`;
      correctAnswer = Math.abs(values[i] - values[j]);
      options = genNumericOptions(correctAnswer, diff.maxVal);
      break;
    }
    case 'how_many_more': {
      const sorted = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
      const hi = sorted[0], lo = sorted[sorted.length - 1];
      prompt = `How many more does "${cats[hi.i]}" have than "${cats[lo.i]}"?`;
      correctAnswer = hi.v - lo.v;
      options = genNumericOptions(correctAnswer, diff.maxVal);
      break;
    }
    case 'combined': {
      const [i, j] = pickTwoDiff(cats.length);
      prompt = `How many do "${cats[i]}" and "${cats[j]}" have combined?`;
      correctAnswer = values[i] + values[j];
      options = genNumericOptions(correctAnswer, diff.maxVal * 2);
      break;
    }
    case 'fewer': {
      const threshold = randInt(Math.floor(maxVal / 2), maxVal - 1);
      const count = values.filter(v => v < threshold).length;
      prompt = `How many categories have fewer than ${threshold}?`;
      correctAnswer = count;
      options = genNumericOptions(count, cats.length);
      break;
    }
    case 'scale': {
      if (scale > 1) {
        const idx = randInt(0, cats.length - 1);
        const icons = Math.ceil(values[idx] / scale);
        prompt = `Each ${data.icon} = ${scale}. "${cats[idx]}" shows ${icons} icons. What is the actual value?`;
        correctAnswer = values[idx];
        options = genNumericOptions(correctAnswer, diff.maxVal);
      } else {
        const idx = randInt(0, cats.length - 1);
        prompt = `How many for "${cats[idx]}"?`;
        correctAnswer = values[idx];
        options = genNumericOptions(correctAnswer, diff.maxVal);
      }
      break;
    }
    default: {
      prompt = `How many for "${cats[0]}"?`;
      correctAnswer = values[0];
      options = genNumericOptions(correctAnswer, diff.maxVal);
    }
  }

  return { prompt, correctAnswer, options: options.map(String) };
}

function genNumericOptions(correct, max) {
  const opts = new Set([correct]);
  let attempts = 0;
  while (opts.size < 4 && attempts < 50) {
    const offset = pick([-3, -2, -1, 1, 2, 3, 4, 5]);
    const v = correct + offset;
    if (v >= 0 && v <= max + 5) opts.add(v);
    attempts++;
  }
  while (opts.size < 4) opts.add(correct + opts.size);
  return shuffle([...opts]);
}

function pickTwoDiff(len) {
  const i = randInt(0, len - 1);
  let j = randInt(0, len - 2);
  if (j >= i) j++;
  return [i, j];
}

/* ── Bar Graph ── */
function BarGraph({ data, highlight, onBarTap }) {
  const { cats, values, title } = data;
  const maxVal = Math.max(...values, 1);
  const barW = Math.min(60, Math.floor(280 / cats.length));
  const gapW = Math.max(6, Math.floor(barW * 0.3));
  const chartW = cats.length * (barW + gapW) + 40;
  const chartH = 200;
  const yLabels = [];
  const step = maxVal <= 10 ? 1 : maxVal <= 20 ? 2 : 5;
  for (let v = 0; v <= maxVal; v += step) yLabels.push(v);
  if (yLabels[yLabels.length - 1] < maxVal) yLabels.push(maxVal);

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      <svg width={chartW} height={chartH + 50} style={{ display: 'block', margin: '0 auto', touchAction: 'pan-x' }}>
        {/* Y-axis labels & grid */}
        {yLabels.map(v => {
          const y = chartH - (v / maxVal) * (chartH - 20) + 10;
          return (
            <g key={`y${v}`}>
              <line x1={35} y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
              <text x={30} y={y + 4} fill="#64748b" fontSize={10} fontWeight={600} textAnchor="end">{v}</text>
            </g>
          );
        })}

        {/* Bars */}
        {cats.map((cat, i) => {
          const x = 40 + i * (barW + gapW);
          const barH = (values[i] / maxVal) * (chartH - 20);
          const y = chartH - barH + 10;
          const isHi = highlight === i;
          return (
            <g key={cat} style={{ cursor: onBarTap ? 'pointer' : 'default' }}
              onPointerUp={() => onBarTap?.(i)}>
              <rect x={x} y={y} width={barW} height={barH} rx={4}
                fill={COLORS[i % COLORS.length]}
                opacity={isHi ? 1 : 0.85}
                stroke={isHi ? '#fff' : 'none'} strokeWidth={isHi ? 2 : 0}
                style={{ transition: 'all 0.3s ease' }}
              />
              {/* Value label on bar */}
              <text x={x + barW / 2} y={y - 5} fill="#e2e8f0" fontSize={11} fontWeight={800} textAnchor="middle">
                {values[i]}
              </text>
              {/* Category label */}
              <text x={x + barW / 2} y={chartH + 24} fill="#94a3b8" fontSize={9} fontWeight={600} textAnchor="middle"
                style={{ pointerEvents: 'none' }}>
                {cat.length > 8 ? cat.slice(0, 7) + '…' : cat}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Pictograph ── */
function Pictograph({ data, highlight }) {
  const { cats, values, title, icon, scale } = data;
  const maxIcons = Math.ceil(Math.max(...values) / scale);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      {scale > 1 && (
        <div style={{ fontSize: 10, color: '#a855f7', textAlign: 'center', marginBottom: 6, fontWeight: 700 }}>
          Each {icon} = {scale}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 400, margin: '0 auto' }}>
        {cats.map((cat, i) => {
          const count = Math.ceil(values[i] / scale);
          const remainder = values[i] % scale;
          const isHi = highlight === i;
          return (
            <div key={cat} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10,
              background: isHi ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)',
              border: isHi ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.04)',
              transition: 'all 0.3s',
            }}>
              <div style={{ minWidth: 70, fontSize: 11, fontWeight: 700, color: COLORS[i % COLORS.length] }}>
                {cat.length > 10 ? cat.slice(0, 9) + '…' : cat}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, flex: 1 }}>
                {Array.from({ length: count }, (_, j) => {
                  const isPartial = j === count - 1 && scale > 1 && remainder > 0;
                  return (
                    <span key={j} style={{
                      fontSize: 18, lineHeight: 1,
                      opacity: isPartial ? 0.5 : 1,
                      filter: isPartial ? 'grayscale(0.5)' : 'none',
                    }}>{icon}</span>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', minWidth: 20, textAlign: 'right' }}>
                {values[i]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dot Plot ── */
function DotPlot({ data, highlight }) {
  const { cats, values, title } = data;
  const maxVal = Math.max(...values, 1);
  const dotR = Math.min(8, Math.floor(200 / (maxVal + 1)) / 2);
  const colW = Math.min(60, Math.floor(280 / cats.length));
  const chartW = cats.length * colW + 40;
  const chartH = maxVal * (dotR * 2 + 4) + 40;

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#e2e8f0', textAlign: 'center', marginBottom: 6 }}>{title}</div>
      <svg width={chartW} height={chartH + 30} style={{ display: 'block', margin: '0 auto', touchAction: 'pan-x' }}>
        {/* Base line */}
        <line x1={30} y1={chartH} x2={chartW} y2={chartH} stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />

        {cats.map((cat, i) => {
          const cx = 40 + i * colW + colW / 2;
          const isHi = highlight === i;
          return (
            <g key={cat}>
              {Array.from({ length: values[i] }, (_, j) => (
                <circle key={j}
                  cx={cx} cy={chartH - (j + 1) * (dotR * 2 + 4) + dotR}
                  r={dotR} fill={COLORS[i % COLORS.length]}
                  stroke={isHi ? '#fff' : 'none'} strokeWidth={isHi ? 1.5 : 0}
                  opacity={0.9}
                />
              ))}
              <text x={cx} y={chartH + 16} fill="#94a3b8" fontSize={9} fontWeight={600} textAnchor="middle">
                {cat.length > 8 ? cat.slice(0, 7) + '…' : cat}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const NAV_HEIGHT = 44;
const BOTTOM_BAR = 56;

/* ── Main Component ── */
export default function GraphExplorer() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');
  const { returnUrl, goBack, isEmbedded } = useGameReturn();

  const [difficulty, setDifficulty] = useState(null);
  const [diff, setDiff] = useState(null);
  const [dataSet, setDataSet] = useState(null);
  const [question, setQuestion] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT_MSGS.start));
  const [showHowTo, setShowHowTo] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [highlightBar, setHighlightBar] = useState(null);
  const lockRef = useRef(false);

  const newRound = useCallback((d) => {
    const ds = generateDataSet(d);
    const q = generateQuestion(ds, d);
    setDataSet(ds);
    setQuestion(q);
    setSelectedOpt(null);
    setHighlightBar(null);
    setFeedback(null);
    lockRef.current = false;
    SFX.whoosh();
  }, []);

  const startGame = useCallback((level) => {
    const d = DIFFICULTY[level];
    setDifficulty(level);
    setDiff(d);
    setRoundIdx(0);
    setScore(0);
    setTotalRounds(d.rounds);
    setGameOver(false);
    setHistory([]);
    setStreak(0);
    setQbotMsg(pick(QBOT_MSGS.start));
    newRound(d);
  }, [newRound]);

  const submitAnswer = useCallback((answer) => {
    if (lockRef.current || !question) return;
    lockRef.current = true;
    setSelectedOpt(answer);

    const correct = String(answer) === String(question.correctAnswer);

    if (correct) {
      SFX.correct();
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ correct: true, msg: `Correct graph interpretation - answer is ${question.correctAnswer}` });
      setQbotMsg(pick(QBOT_MSGS.correct));
    } else {
      SFX.wrong();
      setStreak(0);
      setFeedback({ correct: false, msg: `The answer was ${question.correctAnswer}. You chose ${answer}` });
      setQbotMsg(pick(QBOT_MSGS.wrong));
    }

    setHistory(prev => [...prev, {
      question: question.prompt,
      correctAnswer: String(question.correctAnswer),
      studentAnswer: String(answer),
      correct,
      graphType: dataSet?.graphType,
    }]);

    setTimeout(() => {
      const nextIdx = roundIdx + 1;
      if (nextIdx >= totalRounds) {
        setGameOver(true);
        setQbotMsg(pick(QBOT_MSGS.win));
        SFX.win();
        saveGameResult({
          gameName: 'Graph Explorer',
          score: score + (correct ? 1 : 0),
          total: totalRounds,
          assignmentId, classId,
        });
      } else {
        setRoundIdx(nextIdx);
        newRound(diff);
      }
    }, 1800);
  }, [question, dataSet, roundIdx, totalRounds, score, diff, assignmentId, classId, newRound]);

  const handleBarTap = useCallback((idx) => {
    if (lockRef.current) return;
    setHighlightBar(idx);
    SFX.pop();

    if (question && question.options.includes(String(dataSet.values[idx]))) {
      submitAnswer(String(dataSet.values[idx]));
    }
  }, [question, dataSet, submitAnswer]);

  if (showReview) {
    return <GameReview gameName="Graph Explorer" results={history} onBack={() => setShowReview(false)} />;
  }

  const hasBottomBar = !!returnUrl;
  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : 1;
  const graphTypeLabel = dataSet?.graphType === 'bar' ? 'Bar Graph' : dataSet?.graphType === 'pictograph' ? 'Pictograph' : 'Dot Plot';

  /* ── Difficulty select ── */
  if (!difficulty) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif', color: '#fff' }}>
        {/* Top nav */}
        <div style={{
          flexShrink: 0, height: NAV_HEIGHT, padding: '0 16px', boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {!isEmbedded && <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>{'\u2190'} Back</Link>}
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{'\uD83D\uDCCA'} Graph Explorer</div>
          <div style={{ width: 50 }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px' }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 4, textAlign: 'center', marginTop: 8 }}>{'\uD83D\uDCCA'} Graph Explorer</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center', maxWidth: 360 }}>
            Read bar graphs, pictographs & dot plots!
          </div>

          <QBotBubble msg="Welcome, Data Explorer! Can you read graphs and find the answers hidden in the data? Let's find out!" />

          <div style={{ maxWidth: 400, width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>How It Works</div>
            <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>{'\uD83D\uDCCA'} QBot shows you a <strong style={{ color: '#60a5fa' }}>graph</strong> — a bar graph, pictograph, or dot plot with real data.</div>
              <div style={{ marginBottom: 8 }}>{'\uD83D\uDD0D'} Read the question and <strong style={{ color: '#fbbf24' }}>study the graph</strong> to find the answer. You can tap bars to highlight them!</div>
              <div style={{ marginBottom: 8 }}>{'\uD83C\uDFAF'} Pick the correct answer from the <strong style={{ color: '#34d399' }}>multiple-choice options</strong>.</div>
              <div>{'\uD83D\uDCC8'} Questions get trickier — totals, differences, "how many more" and reading scales!</div>
            </div>
          </div>

          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>Choose Your Level</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460, width: '100%' }}>
            {Object.entries(DIFFICULTY).map(([key, d]) => (
              <button type="button" key={key} onPointerUp={() => startGame(key)} style={{
                ...btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)'),
                minWidth: 130, padding: '14px 16px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 4, flex: '1 1 auto',
              }}>
                <div style={{ fontSize: 26 }}>{d.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{d.label}</div>
                <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'center', lineHeight: 1.3 }}>
                  {key === 'easy' && 'Bar graphs & pictographs'}
                  {key === 'medium' && '+ Dot plots & differences'}
                  {key === 'hard' && 'All types + scales & logic'}
                </div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>{d.rounds} questions</div>
              </button>
            ))}
          </div>

          {hasBottomBar && <div style={{ height: BOTTOM_BAR + 8 }} />}
        </div>

        {/* Bottom bar */}
        {hasBottomBar && (
          <div style={{
            flexShrink: 0, height: BOTTOM_BAR, padding: '0 16px', boxSizing: 'border-box',
            display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(34,197,94,0.3)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
          }}>
            <LoopContinueButton fixed={false} onClick={goBack} label="Continue \u2192" />
          </div>
        )}
      </div>
    );
  }

  /* ── Game screen ── */
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif', color: '#fff' }}>
      {/* How-to overlay */}
      {showHowTo && (
        <div style={overlayBg}>
          <div style={overlayBox}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, textAlign: 'center' }}>{'\uD83D\uDCCA'} How to Play</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>1. Study the graph carefully.</div>
              <div style={{ marginBottom: 8 }}>2. Read the question from QBot.</div>
              <div style={{ marginBottom: 8 }}>3. Tap bars/dots on the graph to highlight and count.</div>
              <div>4. Pick the correct answer!</div>
            </div>
            <button type="button" onPointerUp={() => setShowHowTo(false)} style={{ ...btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)'), width: '100%', marginTop: 16 }}>Got it!</button>
          </div>
        </div>
      )}

      {/* Game over overlay */}
      {gameOver && (
        <div style={overlayBg}>
          <div style={{ ...overlayBox, maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>{'\uD83D\uDCCA'}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score === totalRounds ? 'Data Mastery Achieved!' : score >= totalRounds * 0.7 ? 'Strong Data Analysis' : 'Data Skills Building'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1,2,3].map(s => <span key={s} style={{ fontSize: 28, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>{'\u2B50'}</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{score}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>CORRECT</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444' }}>{totalRounds - score}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>MISSED</div>
              </div>
            </div>
            <QBotBubble msg={qbotMsg} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <button type="button" onPointerUp={() => startGame(difficulty)} style={btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)')}>Play Again</button>
              <button type="button" onPointerUp={() => setDifficulty(null)} style={btnStyle('linear-gradient(135deg,#475569,#334155)')}>Change Level</button>
              <button type="button" onPointerUp={() => setShowReview(true)} style={btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)')}>Review Solutions</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top nav bar ── */}
      <div style={{
        flexShrink: 0, height: NAV_HEIGHT, padding: '0 16px', boxSizing: 'border-box',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {!isEmbedded && <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>{'\u2190'} Back</Link>}
        <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>{'\uD83D\uDCCA'} Graph Explorer</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{diff.emoji} {diff.label}</span>
          <button type="button" onPointerUp={() => setShowHowTo(true)} style={helpBtn}>?</button>
        </div>
      </div>

      {/* ── Scrollable game area ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 12px 24px' }}>
        {/* Progress */}
        <div style={{ width: '100%', maxWidth: 500, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>
            <span>Question {roundIdx + 1} / {totalRounds}</span>
            <span>Score: {score}</span>
            {streak >= 2 && <span style={{ color: '#f59e0b' }}>{'\uD83D\uDD25'} {streak} streak</span>}
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
            <div style={{ height: '100%', width: `${((roundIdx + (feedback ? 1 : 0)) / totalRounds) * 100}%`, background: 'linear-gradient(90deg,#2563eb,#60a5fa)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* QBot */}
        <div style={{ maxWidth: 500, width: '100%', marginBottom: 8 }}>
          <QBotBubble msg={qbotMsg} />
        </div>

        {dataSet && question && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', marginBottom: 6, textAlign: 'center' }}>
              {graphTypeLabel}
            </div>

            <div style={{
              maxWidth: 500, width: '100%', background: 'rgba(255,255,255,0.03)',
              borderRadius: 14, padding: '12px 8px', marginBottom: 10,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {dataSet.graphType === 'bar' && (
                <BarGraph data={dataSet} highlight={highlightBar} onBarTap={!feedback ? handleBarTap : undefined} />
              )}
              {dataSet.graphType === 'pictograph' && (
                <Pictograph data={dataSet} highlight={highlightBar} />
              )}
              {dataSet.graphType === 'dot' && (
                <DotPlot data={dataSet} highlight={highlightBar} />
              )}
            </div>

            <div style={{
              maxWidth: 500, width: '100%', background: 'rgba(37,99,235,0.08)',
              borderRadius: 14, padding: '12px 16px', marginBottom: 12,
              border: '1px solid rgba(37,99,235,0.15)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.5 }}>
                {question.prompt}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 400, width: '100%' }}>
              {question.options.map((opt, i) => {
                const isCorrect = String(opt) === String(question.correctAnswer);
                const isSelected = selectedOpt === opt;
                let bg, border, color;

                if (feedback) {
                  if (isCorrect) { bg = 'rgba(34,197,94,0.2)'; border = '2px solid #22c55e'; color = '#22c55e'; }
                  else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.2)'; border = '2px solid #ef4444'; color = '#ef4444'; }
                  else { bg = 'rgba(255,255,255,0.03)'; border = '1px solid rgba(255,255,255,0.06)'; color = '#64748b'; }
                } else {
                  bg = 'rgba(37,99,235,0.08)'; border = '1px solid rgba(37,99,235,0.2)'; color = '#e2e8f0';
                }

                return (
                  <button type="button" key={i}
                    onPointerUp={() => !feedback && submitAnswer(opt)}
                    disabled={!!feedback}
                    style={{
                      padding: '14px 16px', minHeight: 52, borderRadius: 12,
                      cursor: feedback ? 'default' : 'pointer',
                      fontSize: 15, fontWeight: 800, textAlign: 'center',
                      background: bg, border, color,
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'all 0.2s ease',
                    }}
                  >{opt}</button>
                );
              })}
            </div>

            {feedback && (
              <div style={{
                maxWidth: 500, width: '100%', padding: '10px 16px', borderRadius: 12, marginTop: 12,
                background: feedback.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${feedback.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                textAlign: 'center', fontSize: 13, fontWeight: 800,
                color: feedback.correct ? '#22c55e' : '#ef4444',
                animation: 'fadeIn 0.3s ease',
              }}>
                {feedback.correct ? '\u2713 ' : '\u2717 '}{feedback.msg}
              </div>
            )}
          </>
        )}

        {hasBottomBar && <div style={{ height: BOTTOM_BAR + 8 }} />}
      </div>

      {/* ── Bottom bar: Continue (non-overlapping) ── */}
      {hasBottomBar && (
        <div style={{
          flexShrink: 0, height: BOTTOM_BAR, padding: '0 16px', boxSizing: 'border-box',
          display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(34,197,94,0.3)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        }}>
          {gameOver && (
            <button type="button" onClick={() => setShowReview(true)} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(245,158,11,0.2)', color: '#fbbf24',
              border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10,
            }}>Review Solutions</button>
          )}
          <LoopContinueButton fixed={false} onClick={goBack} label="Continue \u2192" />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        button:active { transform: scale(0.96); opacity: 0.85; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

/* ── Shared styles ── */
const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(37,99,235,0.06)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(37,99,235,0.12)' }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1e3a8a,#1e1b4b)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #3b82f6', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

function btnStyle(bg) { return { padding: '14px 22px', minHeight: 48, background: bg, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, WebkitTapHighlightColor: 'transparent' }; }
const helpBtn = { width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(37,99,235,0.3)', background: 'rgba(37,99,235,0.1)', color: '#60a5fa', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const overlayBg = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' };
const overlayBox = { background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20, padding: 24, maxWidth: 400, width: '100%', border: '1px solid rgba(37,99,235,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' };
