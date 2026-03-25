import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { saveGameResult } from '../utils/storage';
import GameReview from '../components/GameReview';
import qbotImg from '../assets/qbot.svg';

/* ═══════════════════════════════════════════════════════════════
   TIME TRAVELER — Analog Clock Elapsed Time Game
   Read clocks, solve elapsed time puzzles, drag the hands!
   ═══════════════════════════════════════════════════════════════ */

let _ac;
function ac() { if (!_ac) _ac = new (window.AudioContext || window.webkitAudioContext)(); if (_ac.state === 'suspended') _ac.resume(); return _ac; }
function tone(f, d, t = 'sine', v = 0.12) { try { const c = ac(), o = c.createOscillator(), g = c.createGain(); o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d); o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d); } catch (_) {} }
const SFX = {
  tick:    () => tone(800, 0.03, 'sine', 0.04),
  correct: () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 80); setTimeout(() => tone(784, 0.15), 160); },
  wrong:   () => tone(200, 0.3, 'sawtooth', 0.06),
  warp:    () => { [400,600,800,1000,1200].forEach((f,i) => setTimeout(() => tone(f, 0.08, 'sine', 0.06), i * 40)); },
  win:     () => { [523,659,784,1047,1319].forEach((f,i) => setTimeout(() => tone(f, 0.2, 'sine', 0.1), i * 90)); },
};

const pick = a => a[Math.floor(Math.random() * a.length)];
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

const DIFFICULTY = {
  easy:   { label: 'Apprentice', emoji: '🌱', rounds: 8,  types: ['read', 'elapsed_simple'], minuteSnap: 15, maxElapsed: 120 },
  medium: { label: 'Explorer',   emoji: '🔥', rounds: 10, types: ['read', 'elapsed_simple', 'elapsed_end', 'elapsed_start'], minuteSnap: 5, maxElapsed: 300 },
  hard:   { label: 'Time Lord',  emoji: '💎', rounds: 12, types: ['read', 'elapsed_simple', 'elapsed_end', 'elapsed_start', 'elapsed_duration'], minuteSnap: 1, maxElapsed: 480 },
};

const QBOT_MSGS = {
  start: ["Welcome, Time Traveler! Let's master the clock! ⏰", "Time waits for no one — let's practice! 🤖", "The gears are turning... ready to read some clocks? ⚙️"],
  correct: ["Perfect timing! ⏰", "You nailed it! ⭐", "Exactly right! The clock agrees! 🎉", "A true Time Traveler! 🕐"],
  wrong: ["Not quite — check the hands again! 🤔", "Almost! Remember, the short hand is hours! ⏰", "Try again — you'll get it! 💪"],
  win: ["You've mastered time itself! 🏆", "Incredible clock skills! Come back anytime! ⏰✨", "The Time Traveler has completed their journey! 🌟"],
};

const SCENARIOS = [
  { pre: "School starts at", post: "What time does the bell ring?" },
  { pre: "The wizard's potion finishes brewing at", post: "Set the clock!" },
  { pre: "The dragon falls asleep at", post: "Show this time!" },
  { pre: "The train arrives at", post: "What does the clock show?" },
  { pre: "Lunch begins at", post: "Set the clock to this time!" },
  { pre: "The movie starts at", post: "Show the time!" },
  { pre: "Soccer practice is at", post: "What time is it?" },
];

const ELAPSED_SCENARIOS = [
  { activity: "The potion brews for", activityBack: "The potion brewed for" },
  { activity: "The spell lasts for", activityBack: "The spell lasted for" },
  { activity: "The journey lasts", activityBack: "The journey lasted" },
  { activity: "The class runs for", activityBack: "The class ran for" },
  { activity: "The game goes on for", activityBack: "The game went on for" },
  { activity: "The movie runs for", activityBack: "The movie ran for" },
  { activity: "The nap lasts", activityBack: "The nap lasted" },
];

function fmtTime(h, m) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} minute${m !== 1 ? 's' : ''}`;
  if (m === 0) return `${h} hour${h !== 1 ? 's' : ''}`;
  return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`;
}

function snapMinute(m, snap) {
  return Math.round(m / snap) * snap;
}

function generateQuestion(diff) {
  const type = pick(diff.types);
  const snap = diff.minuteSnap;

  const rHour = () => randInt(1, 12);
  const rMin = () => snapMinute(randInt(0, 59), snap) % 60;
  const rElapsed = () => {
    const raw = randInt(15, diff.maxElapsed);
    return snapMinute(raw, Math.max(snap, 5));
  };

  if (type === 'read') {
    const h = rHour(), m = rMin();
    const sc = pick(SCENARIOS);
    return {
      type: 'set_clock',
      prompt: `${sc.pre} ${fmtTime(h, m)}. ${sc.post}`,
      answerH: h % 12 || 12,
      answerM: m,
      display: fmtTime(h, m),
      animFromH: 12, animFromM: 0,
      animToH: h % 12 || 12, animToM: m,
      animLabel: `Watch the hands move to ${fmtTime(h, m)}`,
      elapsedTotal: 0,
    };
  }

  const startH = randInt(6, 11);
  const startM = rMin();
  const elapsed = rElapsed();
  const totalMin = startH * 60 + startM + elapsed;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  const sc = pick(ELAPSED_SCENARIOS);

  if (type === 'elapsed_simple' || type === 'elapsed_end') {
    return {
      type: 'set_clock',
      prompt: `${sc.activity} ${fmtDuration(elapsed)}, starting at ${fmtTime(startH, startM)}. What time does it end?`,
      answerH: (endH % 12) || 12,
      answerM: endM,
      display: fmtTime(endH, endM),
      animFromH: startH % 12 || 12, animFromM: startM,
      animToH: (endH % 12) || 12, animToM: endM,
      animLabel: `Starting at ${fmtTime(startH, startM)}, watch ${fmtDuration(elapsed)} pass...`,
      elapsedTotal: elapsed,
    };
  }

  if (type === 'elapsed_start') {
    return {
      type: 'set_clock',
      prompt: `${sc.activityBack} ${fmtDuration(elapsed)} and ended at ${fmtTime(endH, endM)}. What time did it start?`,
      answerH: (startH % 12) || 12,
      answerM: startM,
      display: fmtTime(startH, startM),
      animFromH: startH % 12 || 12, animFromM: startM,
      animToH: (endH % 12) || 12, animToM: endM,
      animLabel: `Starting at ${fmtTime(startH, startM)}, watch ${fmtDuration(elapsed)} pass to reach ${fmtTime(endH, endM)}`,
      elapsedTotal: elapsed,
    };
  }

  if (type === 'elapsed_duration') {
    const opts = [elapsed];
    while (opts.length < 4) {
      const wrong = elapsed + pick([-30, -15, 15, 30, 45, -45, 60, -60].filter(d => elapsed + d > 0));
      if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
    }
    opts.sort(() => Math.random() - 0.5);
    return {
      type: 'multiple_choice',
      prompt: `It's ${fmtTime(startH, startM)} now. The quest ends at ${fmtTime(endH, endM)}. How long is the quest?`,
      correctAnswer: fmtDuration(elapsed),
      options: opts.map(o => fmtDuration(o)),
      startH, startM, endH, endM,
      animFromH: startH % 12 || 12, animFromM: startM,
      animToH: (endH % 12) || 12, animToM: endM,
      animLabel: `Watch: ${fmtDuration(elapsed)} from ${fmtTime(startH, startM)} to ${fmtTime(endH, endM)}`,
      elapsedTotal: elapsed,
    };
  }

  return generateQuestion(diff);
}

function totalMinsOf(h, m) { return ((h % 12) || 12) * 60 + m; }
function hFromTotal(t) { const h = Math.floor(((t % 720) + 720) % 720 / 60); return h === 0 ? 12 : h; }
function mFromTotal(t) { return ((t % 60) + 60) % 60; }

/* ── SVG Analog Clock (touch-optimized) ── */
function AnalogClock({ hour, minute, size = 220, interactive = false, onChangeH, onChangeM, onMinuteWrap, snap = 1 }) {
  const svgRef = useRef(null);
  const dragging = useRef(null);
  const prevMinAngle = useRef(null);
  const lastTickM = useRef(null);
  const activeTouch = useRef(null);

  const cbRef = useRef({ onChangeH, onChangeM, onMinuteWrap, snap, interactive });
  cbRef.current = { onChangeH, onChangeM, onMinuteWrap, snap, interactive };

  const cx = size / 2, cy = size / 2, r = size / 2 - 10;

  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
  const minAngle = minute * 6 - 90;

  const handCoords = (angle, len) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + Math.cos(rad) * len, y: cy + Math.sin(rad) * len };
  };

  const hourEnd = handCoords(hourAngle, r * 0.5);
  const minEnd = handCoords(minAngle, r * 0.75);

  const getPointerInfo = useCallback((e) => {
    if (!svgRef.current) return { angle: 0, dist: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else if (e.changedTouches && e.changedTouches.length > 0) { clientX = e.changedTouches[0].clientX; clientY = e.changedTouches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
    const dist = Math.hypot(x, y) / (rect.width / 2);
    return { angle, dist, clientX, clientY };
  }, []);

  const getAngleFromClient = useCallback((clientX, clientY) => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    return (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) return;

    function onStart(e) {
      e.preventDefault();
      e.stopPropagation();
      const { angle, dist } = getPointerInfo(e);
      const hand = dist > 0.42 ? 'minute' : 'hour';
      dragging.current = hand;
      if (hand === 'minute') prevMinAngle.current = angle;
      if (e.touches) activeTouch.current = e.touches[0].identifier;

      const { onChangeH: cH, onChangeM: cM, snap: sn } = cbRef.current;
      if (hand === 'minute') {
        let rawM = Math.round(angle / 6);
        if (rawM >= 60) rawM = 0;
        let m = snapMinute(rawM, sn) % 60;
        lastTickM.current = m;
        cM?.(m);
      } else {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        cH?.(h);
      }
    }

    function onMove(e) {
      if (!dragging.current) return;
      e.preventDefault();

      let clientX, clientY;
      if (e.touches) {
        const t = activeTouch.current !== null
          ? Array.from(e.touches).find(tt => tt.identifier === activeTouch.current)
          : e.touches[0];
        if (!t) return;
        clientX = t.clientX; clientY = t.clientY;
      } else {
        clientX = e.clientX; clientY = e.clientY;
      }

      const { onChangeH: cH, onChangeM: cM, onMinuteWrap: cW, snap: sn } = cbRef.current;
      const angle = getAngleFromClient(clientX, clientY);

      if (dragging.current === 'minute') {
        let rawM = Math.round(angle / 6);
        if (rawM >= 60) rawM = 0;
        let m = snapMinute(rawM, sn) % 60;

        const prev = prevMinAngle.current;
        prevMinAngle.current = angle;

        if (prev !== null) {
          if (prev > 270 && angle < 90) cW?.(1);
          else if (prev < 90 && angle > 270) cW?.(-1);
        }

        if (lastTickM.current !== m) {
          lastTickM.current = m;
          if (m % 5 === 0) SFX.tick();
        }
        cM?.(m);
      } else if (dragging.current === 'hour') {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        cH?.(h);
      }
    }

    function onEnd() {
      if (!dragging.current) return;
      dragging.current = null;
      prevMinAngle.current = null;
      lastTickM.current = null;
      activeTouch.current = null;
    }

    const pOpts = { passive: false };
    svg.addEventListener('mousedown', onStart, pOpts);
    svg.addEventListener('touchstart', onStart, pOpts);
    window.addEventListener('mousemove', onMove, pOpts);
    window.addEventListener('touchmove', onMove, pOpts);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    return () => {
      svg.removeEventListener('mousedown', onStart);
      svg.removeEventListener('touchstart', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [interactive, getPointerInfo, getAngleFromClient]);

  const zoneR = r * 0.42;

  return (
    <svg ref={svgRef} width={size} height={size}
      style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none', cursor: interactive ? 'pointer' : 'default' }}>
      {/* Clock face */}
      <circle cx={cx} cy={cy} r={r} fill="#0f172a" stroke="#b45309" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r - 4} fill="none" stroke="rgba(180,83,9,0.15)" strokeWidth={1} />

      {/* Zone divider — outer = minutes, inner = hours */}
      {interactive && (
        <circle cx={cx} cy={cy} r={zoneR} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 4" />
      )}

      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const isMain = i % 3 === 0;
        const outerR = r - 8;
        const innerR = isMain ? r - 22 : r - 16;
        return (
          <g key={i}>
            <line
              x1={cx + Math.cos(angle) * innerR} y1={cy + Math.sin(angle) * innerR}
              x2={cx + Math.cos(angle) * outerR} y2={cy + Math.sin(angle) * outerR}
              stroke={isMain ? '#fbbf24' : '#78716c'} strokeWidth={isMain ? 3 : 1.5} strokeLinecap="round"
            />
            <text
              x={cx + Math.cos(angle) * (r - 32)} y={cy + Math.sin(angle) * (r - 32)}
              fill="#fde68a" fontSize={isMain ? 14 : 11} fontWeight={isMain ? 800 : 600}
              textAnchor="middle" dominantBaseline="central" fontFamily="Inter,system-ui,sans-serif"
            >
              {i === 0 ? 12 : i}
            </text>
          </g>
        );
      })}

      {/* Minute ticks */}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const angle = (i * 6 - 90) * Math.PI / 180;
        return (
          <line key={`m${i}`}
            x1={cx + Math.cos(angle) * (r - 8)} y1={cy + Math.sin(angle) * (r - 8)}
            x2={cx + Math.cos(angle) * (r - 12)} y2={cy + Math.sin(angle) * (r - 12)}
            stroke="#3f3f46" strokeWidth={1} strokeLinecap="round"
          />
        );
      })}

      {/* Hour hand */}
      <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y}
        stroke="#fbbf24" strokeWidth={6} strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))', pointerEvents: 'none' }}
      />
      {interactive && (
        <circle cx={hourEnd.x} cy={hourEnd.y} r={8}
          fill="#fbbf24" stroke="#fde68a" strokeWidth={2} style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Minute hand */}
      <line x1={cx} y1={cy} x2={minEnd.x} y2={minEnd.y}
        stroke="#c4b5fd" strokeWidth={4} strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))', pointerEvents: 'none' }}
      />
      {interactive && (
        <circle cx={minEnd.x} cy={minEnd.y} r={7}
          fill="#c4b5fd" stroke="#e9d5ff" strokeWidth={2} style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={6} fill="#b45309" stroke="#fde68a" strokeWidth={2} style={{ pointerEvents: 'none' }} />
    </svg>
  );
}

/* ── Main Component ── */
export default function TimeTraveler() {
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const classId = searchParams.get('classId');

  const [difficulty, setDifficulty] = useState(null);
  const [diff, setDiff] = useState(null);
  const [question, setQuestion] = useState(null);
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [playerH, setPlayerH] = useState(12);
  const [playerM, setPlayerM] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [history, setHistory] = useState([]);
  const [qbotMsg, setQbotMsg] = useState(pick(QBOT_MSGS.start));
  const [showHowTo, setShowHowTo] = useState(false);
  const [streak, setStreak] = useState(0);
  const lockRef = useRef(false);

  const [reviewPhase, setReviewPhase] = useState(null);
  const [animH, setAnimH] = useState(12);
  const [animM, setAnimM] = useState(0);
  const [animElapsed, setAnimElapsed] = useState(0);
  const animRef = useRef(null);
  const pendingCorrectRef = useRef(false);

  const startGame = useCallback((level) => {
    const d = DIFFICULTY[level];
    setDifficulty(level);
    setDiff(d);
    setRoundIdx(0);
    setQuestion(generateQuestion(d));
    setScore(0);
    setTotalRounds(d.rounds);
    setPlayerH(12);
    setPlayerM(0);
    setFeedback(null);
    setGameOver(false);
    setHistory([]);
    setStreak(0);
    setReviewPhase(null);
    setQbotMsg(pick(QBOT_MSGS.start));
    lockRef.current = false;
    SFX.warp();
  }, []);

  const startReviewAnimation = useCallback((q) => {
    if (animRef.current) clearInterval(animRef.current);

    const fromTotal = totalMinsOf(q.animFromH, q.animFromM);
    const toTotal = totalMinsOf(q.animToH, q.animToM);
    let diff = toTotal - fromTotal;
    if (diff <= 0) diff += 720;

    const totalSteps = diff;
    const maxDurationMs = 3500;
    const minInterval = 20;
    const stepSize = Math.max(1, Math.ceil(totalSteps / (maxDurationMs / minInterval)));
    const interval = Math.min(80, Math.max(minInterval, maxDurationMs / Math.ceil(totalSteps / stepSize)));

    let current = 0;
    setAnimH(q.animFromH);
    setAnimM(q.animFromM);
    setAnimElapsed(0);
    setReviewPhase('animating');

    animRef.current = setInterval(() => {
      current += stepSize;
      if (current >= totalSteps) {
        current = totalSteps;
        clearInterval(animRef.current);
        animRef.current = null;
        setReviewPhase('done');
      }
      const t = fromTotal + current;
      setAnimH(hFromTotal(t));
      setAnimM(mFromTotal(t));
      setAnimElapsed(current);
      if (current % (stepSize * 3) === 0) SFX.tick();
    }, interval);
  }, []);

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  const submitClock = useCallback(() => {
    if (lockRef.current || !question || question.type !== 'set_clock') return;
    lockRef.current = true;

    const correct = playerH === question.answerH && playerM === question.answerM;
    pendingCorrectRef.current = correct;

    if (correct) {
      SFX.correct();
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ correct: true, msg: `Correct! The answer is ${question.display}` });
      setQbotMsg(pick(QBOT_MSGS.correct));
    } else {
      SFX.wrong();
      setStreak(0);
      setFeedback({ correct: false, msg: `The answer was ${question.display}. You set ${fmtTime(playerH, playerM)}` });
      setQbotMsg(pick(QBOT_MSGS.wrong));
    }

    setHistory(prev => [...prev, {
      question: question.prompt,
      correctAnswer: question.display,
      studentAnswer: fmtTime(playerH, playerM),
      correct,
    }]);

    setTimeout(() => {
      setQbotMsg("Watch the clock — let me show you the solution! 🤖⏰");
      setReviewPhase('pre');
      setTimeout(() => startReviewAnimation(question), 1500);
    }, 1200);
  }, [question, playerH, playerM, startReviewAnimation]);

  const submitChoice = useCallback((choice) => {
    if (lockRef.current || !question || question.type !== 'multiple_choice') return;
    lockRef.current = true;

    const correct = choice === question.correctAnswer;
    pendingCorrectRef.current = correct;

    if (correct) {
      SFX.correct();
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback({ correct: true, msg: `Correct! ${question.correctAnswer}` });
      setQbotMsg(pick(QBOT_MSGS.correct));
    } else {
      SFX.wrong();
      setStreak(0);
      setFeedback({ correct: false, msg: `The answer was ${question.correctAnswer}` });
      setQbotMsg(pick(QBOT_MSGS.wrong));
    }

    setHistory(prev => [...prev, {
      question: question.prompt,
      correctAnswer: question.correctAnswer,
      studentAnswer: choice,
      correct,
    }]);

    setTimeout(() => {
      setQbotMsg("Watch the clock — let me show you the solution! 🤖⏰");
      setReviewPhase('pre');
      setTimeout(() => startReviewAnimation(question), 1500);
    }, 1200);
  }, [question, startReviewAnimation]);

  const goNext = useCallback(() => {
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
    const wasCorrect = pendingCorrectRef.current;
    const nextIdx = roundIdx + 1;
    if (nextIdx >= totalRounds) {
      setGameOver(true);
      setQbotMsg(pick(QBOT_MSGS.win));
      SFX.win();
      setReviewPhase(null);
      saveGameResult({
        gameName: 'Time Traveler',
        score,
        total: totalRounds,
        assignmentId, classId,
      });
    } else {
      setRoundIdx(nextIdx);
      setQuestion(generateQuestion(diff));
      setPlayerH(12);
      setPlayerM(0);
      setFeedback(null);
      setReviewPhase(null);
      lockRef.current = false;
      SFX.warp();
    }
  }, [roundIdx, totalRounds, score, diff, assignmentId, classId]);

  if (showReview) {
    return <GameReview gameName="Time Traveler" results={history} onBack={() => setShowReview(false)} />;
  }

  /* ── Difficulty select ── */
  if (!difficulty) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px', overflowY: 'auto' }}>
        <Link to="/games" style={{ position: 'absolute', top: 16, left: 16, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>

        <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 4, textAlign: 'center', marginTop: 8 }}>⏰ Time Traveler</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, textAlign: 'center', maxWidth: 360 }}>
          Master clocks and elapsed time!
        </div>

        <QBotBubble msg="Welcome, Time Traveler! Can you read clocks and figure out how much time has passed? Let's find out! 🤖" />

        {/* Demo clock */}
        <div style={{ margin: '16px 0' }}>
          <AnalogClock hour={10} minute={30} size={160} />
        </div>

        {/* How it works */}
        <div style={{
          maxWidth: 400, width: '100%', background: 'rgba(255,255,255,0.03)',
          borderRadius: 14, padding: 16, marginBottom: 16, border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>How It Works</div>
          <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.6 }}>
            <div style={{ marginBottom: 8 }}>⏰ QBot gives you a <strong style={{ color: '#fbbf24' }}>time puzzle</strong> — read a time, or figure out when something starts or ends.</div>
            <div style={{ marginBottom: 8 }}>🖐️ <strong style={{ color: '#c4b5fd' }}>Drag the clock hands</strong> to set your answer! The <span style={{ color: '#fbbf24' }}>gold hand</span> is hours, the <span style={{ color: '#c4b5fd' }}>purple hand</span> is minutes.</div>
            <div>✅ Hit <strong style={{ color: '#22c55e' }}>Submit</strong> when the clock shows the right time!</div>
          </div>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 10, textAlign: 'center' }}>Choose Your Level</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 460, width: '100%' }}>
          {Object.entries(DIFFICULTY).map(([key, d]) => (
            <button type="button" key={key} onPointerUp={() => startGame(key)} style={{
              ...btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)'),
              minWidth: 130, padding: '14px 16px', flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 4, flex: '1 1 auto',
            }}>
              <div style={{ fontSize: 26 }}>{d.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{d.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, textAlign: 'center', lineHeight: 1.3 }}>
                {key === 'easy' && 'Read clocks · 15-min steps'}
                {key === 'medium' && 'Elapsed time · 5-min steps'}
                {key === 'hard' && 'All puzzles · exact minutes'}
              </div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>{d.rounds} questions</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : 1;

  /* ── Game screen ── */
  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 12px 24px', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>

      {/* How-to overlay */}
      {showHowTo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20, padding: 24, maxWidth: 380, width: '100%', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 12, textAlign: 'center' }}>⏰ How to Play</div>
            <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>1. Read the time puzzle from QBot.</div>
              <div style={{ marginBottom: 8 }}>2. <strong style={{ color: '#fbbf24' }}>Drag the gold hand</strong> to set the hour.</div>
              <div style={{ marginBottom: 8 }}>3. <strong style={{ color: '#c4b5fd' }}>Drag the purple hand</strong> to set the minutes.</div>
              <div>4. Hit Submit when the clock shows your answer!</div>
            </div>
            <button type="button" onPointerUp={() => setShowHowTo(false)} style={{ ...btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)'), width: '100%', marginTop: 16 }}>Got it!</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>← Games</Link>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>⏰ Time Traveler</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{diff.emoji} {diff.label}</span>
          <button onClick={() => setShowHowTo(true)} style={{
            width: 24, height: 24, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.3)',
            background: 'rgba(168,85,247,0.1)', color: '#a855f7', fontSize: 13, fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>?</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 480, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>
          <span>Question {roundIdx + 1} / {totalRounds}</span>
          <span>Score: {score}</span>
          {streak >= 2 && <span style={{ color: '#f59e0b' }}>🔥 {streak} streak</span>}
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${((roundIdx + (feedback ? 1 : 0)) / totalRounds) * 100}%`, background: 'linear-gradient(90deg,#7c3aed,#a855f7)', borderRadius: 4, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* QBot */}
      <div style={{ maxWidth: 480, width: '100%', marginBottom: 10, padding: '0 4px' }}>
        <QBotBubble msg={qbotMsg} />
      </div>

      {question && (
        <>
          {/* Question prompt */}
          <div style={{
            maxWidth: 480, width: '100%', background: 'rgba(168,85,247,0.06)',
            borderRadius: 14, padding: '12px 16px', marginBottom: 12,
            border: '1px solid rgba(168,85,247,0.12)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.5 }}>
              {question.prompt}
            </div>
          </div>

          {/* ── REVIEW ANIMATION PHASE ── */}
          {reviewPhase && question && (
            <>
              {reviewPhase === 'pre' && (
                <div style={{
                  maxWidth: 480, width: '100%', textAlign: 'center', marginBottom: 12,
                  padding: '14px 18px', borderRadius: 14,
                  background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e2e8f0' }}>
                    Watch the clock — let me show you the solution!
                  </div>
                </div>
              )}

              {reviewPhase !== 'pre' && (
                <div style={{
                  maxWidth: 480, width: '100%', textAlign: 'center', marginBottom: 8,
                  padding: '8px 14px', borderRadius: 12,
                  background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)',
                  animation: 'fadeIn 0.3s ease',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', marginBottom: 2 }}>
                    {reviewPhase === 'animating' ? '🤖 QBot is showing you...' : '🤖 Review complete!'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                    {question.animLabel}
                  </div>
                </div>
              )}

              <div style={{ position: 'relative', marginBottom: 8 }}>
                <AnalogClock
                  hour={reviewPhase === 'pre' ? question.animFromH : animH}
                  minute={reviewPhase === 'pre' ? question.animFromM : animM}
                  size={280}
                />
                {reviewPhase === 'animating' && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    width: 12, height: 12, borderRadius: '50%',
                    background: '#a855f7', animation: 'clockPulse 0.6s ease infinite',
                  }} />
                )}
              </div>

              <div style={{
                fontSize: 26, fontWeight: 900, fontFamily: 'monospace', letterSpacing: 2, marginBottom: 4,
                color: reviewPhase === 'done' ? '#22c55e' : reviewPhase === 'pre' ? '#94a3b8' : '#fbbf24',
                transition: 'color 0.3s',
              }}>
                {reviewPhase === 'pre' ? fmtTime(question.animFromH, question.animFromM) : fmtTime(animH, animM)}
              </div>

              {question.elapsedTotal > 0 && (
                <div style={{
                  fontSize: 14, fontWeight: 800, marginBottom: 8,
                  color: reviewPhase === 'done' ? '#a855f7' : '#64748b',
                  transition: 'color 0.3s',
                }}>
                  Elapsed: {fmtDuration(Math.min(animElapsed, question.elapsedTotal))}
                </div>
              )}

              {/* Feedback badge */}
              {feedback && (
                <div style={{
                  maxWidth: 480, width: '100%', padding: '8px 14px', borderRadius: 10, marginBottom: 10,
                  background: feedback.correct ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${feedback.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                  textAlign: 'center', fontSize: 12, fontWeight: 800,
                  color: feedback.correct ? '#22c55e' : '#ef4444',
                }}>
                  {feedback.correct ? '✓ ' : '✗ '}{feedback.msg}
                </div>
              )}

              <button type="button" onPointerUp={goNext} style={{
                ...btnStyle(reviewPhase === 'done'
                  ? 'linear-gradient(135deg,#7c3aed,#6d28d9)'
                  : 'linear-gradient(135deg,#475569,#334155)'),
                padding: '16px 40px', fontSize: 16, minHeight: 54, minWidth: 200, marginTop: 4,
                animation: reviewPhase === 'done' ? 'fadeIn 0.3s ease' : 'none',
              }}>
                {reviewPhase === 'done' ? 'Next →' : 'Skip Review →'}
              </button>
            </>
          )}

          {/* ── INTERACTIVE PHASE (no review) ── */}
          {!reviewPhase && question.type === 'set_clock' && (
            <>
              {/* Clock */}
              <div style={{
                position: 'relative', marginBottom: 8,
                animation: feedback && !reviewPhase ? (feedback.correct ? 'correctPulse 0.5s ease' : 'wrongShake 0.4s ease') : 'none',
              }}>
                <AnalogClock
                  hour={playerH}
                  minute={playerM}
                  size={280}
                  interactive={!feedback}
                  onChangeH={setPlayerH}
                  onChangeM={setPlayerM}
                  onMinuteWrap={(dir) => setPlayerH(h => {
                    let next = h + dir;
                    if (next > 12) next = 1;
                    if (next < 1) next = 12;
                    return next;
                  })}
                  snap={diff.minuteSnap}
                />
              </div>

              {/* Zone hint */}
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4, textAlign: 'center' }}>
                Touch <span style={{ color: '#c4b5fd' }}>outer ring</span> = minutes · <span style={{ color: '#fbbf24' }}>inner</span> = hours
              </div>

              {/* Digital readout */}
              <div style={{
                fontSize: 28, fontWeight: 900, marginBottom: 10,
                color: '#fff',
                fontFamily: 'monospace', letterSpacing: 2,
              }}>
                {fmtTime(playerH, playerM)}
              </div>

              {/* Adjust buttons */}
              {!feedback && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14, maxWidth: 300, width: '100%' }}>
                  <button type="button" onPointerUp={() => setPlayerH(h => h === 12 ? 1 : h + 1)} style={adjBtn}>Hour +</button>
                  <button type="button" onPointerUp={() => setPlayerH(h => h === 1 ? 12 : h - 1)} style={adjBtn}>Hour −</button>
                  <button type="button" onPointerUp={() => {
                    const n = (playerM + diff.minuteSnap) % 60;
                    if (n < playerM) setPlayerH(h => h === 12 ? 1 : h + 1);
                    setPlayerM(n);
                  }} style={adjBtn}>Min +</button>
                  <button type="button" onPointerUp={() => {
                    const n = (playerM - diff.minuteSnap + 60) % 60;
                    if (n > playerM) setPlayerH(h => h === 1 ? 12 : h - 1);
                    setPlayerM(n);
                  }} style={adjBtn}>Min −</button>
                </div>
              )}

              {/* Submit */}
              {!feedback && (
                <button type="button" onPointerUp={submitClock} style={{ ...btnStyle('linear-gradient(135deg,#059669,#047857)'), padding: '16px 40px', fontSize: 16, minHeight: 54, minWidth: 200 }}>
                  ✓ Submit: {fmtTime(playerH, playerM)}
                </button>
              )}
            </>
          )}

          {!reviewPhase && question.type === 'multiple_choice' && (
            <>
              {/* Show two clocks: start and end */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>START</div>
                  <AnalogClock hour={question.startH} minute={question.startM} size={130} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginTop: 4 }}>{fmtTime(question.startH, question.startM)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, color: '#64748b' }}>→</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>END</div>
                  <AnalogClock hour={question.endH} minute={question.endM} size={130} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', marginTop: 4 }}>{fmtTime(question.endH, question.endM)}</div>
                </div>
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 380, width: '100%' }}>
                {question.options.map((opt, i) => (
                  <button type="button" key={i} onPointerUp={() => !feedback && submitChoice(opt)} disabled={!!feedback}
                    style={{
                      padding: '14px 16px', minHeight: 52, borderRadius: 12, cursor: feedback ? 'default' : 'pointer',
                      fontSize: 14, fontWeight: 700, textAlign: 'center', WebkitTapHighlightColor: 'transparent',
                      background: feedback
                        ? opt === question.correctAnswer ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.03)'
                        : 'rgba(168,85,247,0.08)',
                      border: feedback
                        ? opt === question.correctAnswer ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.06)'
                        : '1px solid rgba(168,85,247,0.15)',
                      color: feedback
                        ? opt === question.correctAnswer ? '#22c55e' : '#64748b'
                        : '#e2e8f0',
                    }}
                  >{opt}</button>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Game over */}
      {gameOver && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(6px)', padding: 20, animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{
            background: 'linear-gradient(135deg,#1e1b4b,#0f172a)', borderRadius: 20,
            padding: 28, maxWidth: 380, width: '100%', textAlign: 'center',
            border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>⏰</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
              {score === totalRounds ? 'Time Master!' : score >= totalRounds * 0.7 ? 'Great Timing!' : 'Journey Complete!'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
              {[1,2,3].map(s => <span key={s} style={{ fontSize: 28, filter: s <= stars ? 'none' : 'grayscale(1) opacity(0.3)' }}>⭐</span>)}
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
              <button type="button" onPointerUp={() => startGame(difficulty)} style={btnStyle('linear-gradient(135deg,#7c3aed,#6d28d9)')}>Play Again</button>
              <button type="button" onPointerUp={() => setDifficulty(null)} style={btnStyle('linear-gradient(135deg,#475569,#334155)')}>Change Level</button>
              <button type="button" onPointerUp={() => setShowReview(true)} style={btnStyle('linear-gradient(135deg,#2563eb,#1d4ed8)')}>Review</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes correctPulse { 0%{transform:scale(1)} 50%{transform:scale(1.05)} 100%{transform:scale(1)} }
        @keyframes wrongShake { 0%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} 100%{transform:translateX(0)} }
        @keyframes clockPulse { 0%{transform:translate(-50%,-50%) scale(1);opacity:0.7} 50%{transform:translate(-50%,-50%) scale(1.8);opacity:0} 100%{transform:translate(-50%,-50%) scale(1);opacity:0.7} }
        button:active { transform: scale(0.96); opacity: 0.85; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}

/* ── Helpers ── */
const QBotBubble = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(168,85,247,0.06)', borderRadius: 12, padding: '8px 12px', border: '1px solid rgba(168,85,247,0.12)' }}>
    <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#4c1d95,#2e1065)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #a855f7', overflow: 'hidden' }}>
      <img src={qbotImg} alt="QBot" style={{ width: 24 }} />
    </div>
    <div style={{ fontSize: 12, fontWeight: 600, color: '#c4b5fd', lineHeight: 1.4 }}>{msg}</div>
  </div>
);

const BG = 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)';
const FONT = '"Inter","Segoe UI",system-ui,sans-serif';
function btnStyle(bg) { return { padding: '14px 22px', minHeight: 48, background: bg, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 700, WebkitTapHighlightColor: 'transparent' }; }
const adjBtn = { padding: '10px 18px', minHeight: 44, minWidth: 70, background: 'rgba(168,85,247,0.12)', color: '#c4b5fd', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, WebkitTapHighlightColor: 'transparent' };
