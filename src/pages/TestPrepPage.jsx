import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GAMES_CATALOG } from '../data/games';
import TeacherLayout from '../components/TeacherLayout';
import SkeletonLoader from '../components/SkeletonLoader';
import {
  COLOR, CARD, PAGE_WRAP, PAGE_HEADER, PAGE_SUBTITLE, SECTION_HEADING,
  BTN_PRIMARY, BTN_ACCENT, BTN_PURPLE, BTN_AMBER, BTN_SECONDARY,
  OPTION_BASE, OPTION_SELECTED, CHIP,
  PROGRESS_TRACK, progressFill,
  resultBanner, resultScore, resultTitle,
} from '../utils/loopStyles';

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const pageStyle = {
  ...PAGE_WRAP,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};
const bigBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '18px 22px',
  borderRadius: 14,
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  fontFamily: PAGE_WRAP.fontFamily,
  fontSize: 14,
  fontWeight: 700,
  transition: 'transform 0.1s, box-shadow 0.15s',
};
function actionBtn(bg) {
  return {
    padding: '12px 22px',
    background: bg,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    transition: 'transform 0.1s, box-shadow 0.15s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };
}
const navBtn = {
  padding: '10px 18px',
  background: COLOR.card,
  color: COLOR.text,
  border: `1px solid ${COLOR.border}`,
  borderRadius: 12,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  transition: 'background 0.15s',
};
const linkBtn = {
  background: 'none',
  border: 'none',
  color: COLOR.blue,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 700,
  padding: 0,
};

/** Render text with exponent notation (2^(5x), x^2) as proper superscripts. */
function formatMathText(text) {
  if (text == null || typeof text !== 'string') return text;
  const parts = [];
  const re = /(\d+|\w)\^\(([^)]+)\)|(\d+|\w)\^(\d+|\w)/g;
  let lastIdx = 0;
  let key = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
    const base = m[1] ?? m[3];
    const exp = m[2] ?? m[4];
    parts.push(base, React.createElement('sup', { key: `e${key++}` }, exp));
    lastIdx = re.lastIndex;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts.length > 0 ? parts : text;
}

export default function TestPrepPage({ config }) {
  const {
    title,
    resultsStorageKey,
    adaptiveStorageKey,
    examOptions,
    defaultExamId,
    getQuestionsForExam: configGetQuestions,
    getDomainsForExam: configGetDomains,
    getTestConfig: configGetTestConfig,
    hasFullExamAccess,
    examLabelsForHistory,
    backLink,
    math712LearningPath,
  } = config;
  const isTexesResultsKey = resultsStorageKey === 'quantegyai-texes-results' || resultsStorageKey === 'allen-ace-texes-results';
  const legacyResultsStorageKey = resultsStorageKey.startsWith('quantegyai-')
    ? resultsStorageKey.replace(/^quantegyai-/, 'allen-ace-')
    : null;
  const legacyAdaptiveStorageKey = adaptiveStorageKey.startsWith('quantegyai-')
    ? adaptiveStorageKey.replace(/^quantegyai-/, 'allen-ace-')
    : null;

  /** Build game URL with grade param when prep is TExES so games open with a playable grade. */
  function getGamePath(path, gameId, currentExamId) {
    if (!path || !currentExamId) return path || '';
    if (!isTexesResultsKey) return path;
    const gradeParam = (() => {
      if (gameId === 'math-match' || gameId === 'math-sprint' || gameId === 'q-blocks') {
        if (currentExamId === 'math712') return 'algebra';
        if (currentExamId === 'math48' || currentExamId === 'ec6' || String(currentExamId).startsWith('ec6')) return 'grade3';
      }
      return null;
    })();
    if (!gradeParam) return path;
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}grade=${encodeURIComponent(gradeParam)}`;
  }

  function getStorageKey() {
    return resultsStorageKey;
  }
  function loadResults() {
    try {
      let raw = localStorage.getItem(getStorageKey());
      if (raw == null && legacyResultsStorageKey) {
        raw = localStorage.getItem(legacyResultsStorageKey);
        if (raw != null) {
          try { localStorage.setItem(getStorageKey(), raw); } catch {}
        }
      }
      return JSON.parse(raw || '[]');
    } catch {
      return [];
    }
  }
  function saveResult(result) {
    const all = loadResults();
    all.push({ ...result, timestamp: Date.now() });
    localStorage.setItem(getStorageKey(), JSON.stringify(all));
  }

  function getAdaptiveStorage() {
    try {
      let raw = localStorage.getItem(adaptiveStorageKey);
      if (raw == null && legacyAdaptiveStorageKey) {
        raw = localStorage.getItem(legacyAdaptiveStorageKey);
        if (raw != null) {
          try { localStorage.setItem(adaptiveStorageKey, raw); } catch {}
        }
      }
      return JSON.parse(raw || '{}');
    } catch {
      return {};
    }
  }
  function getAdaptiveStats(examId) {
    const data = getAdaptiveStorage();
    return data[examId] || {};
  }
  function saveAdaptiveStats(examId, stats) {
    const data = getAdaptiveStorage();
    data[examId] = stats;
    localStorage.setItem(adaptiveStorageKey, JSON.stringify(data));
  }
  function recordAdaptiveResult(examId, compId, qId, correct, difficulty = 1) {
    if (examId == null || compId == null) return;
    const stats = getAdaptiveStats(examId);
    const comp = stats[compId] || { attempts: 0, correct: 0, history: [] };
    comp.attempts += 1;
    if (correct) comp.correct += 1;
    comp.history = (comp.history || []).concat({ qId, correct, difficulty }).slice(-20);
    stats[compId] = comp;
    saveAdaptiveStats(examId, stats);
  }

  /** Count practice sessions per exam from saved results. */
  function getExamSessionCounts() {
    const history = loadResults();
    const counts = {};
    for (const r of history) {
      const id = r.examId || defaultExamId;
      counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }

  /** Return { examId, label, count } for the exam with the most practice sessions. */
  function getMostPracticedExam() {
    const counts = getExamSessionCounts();
    let top = { examId: null, label: '—', count: 0 };
    for (const [id, count] of Object.entries(counts)) {
      const label = examLabelsForHistory[id] || id;
      if (count > top.count) top = { examId: id, label, count };
    }
    return top;
  }

  /** Get competencies ordered by weakest first (for adaptive focus). */
  function getWeakestCompetencies(examId, domains, limit = 5) {
    if (!Array.isArray(domains) || domains.length === 0) return [];
    const bank = configGetQuestions(examId);
    if (!Array.isArray(bank)) return [];
    const stats = getAdaptiveStats(examId);
    const scored = domains.map((dom) => {
      const comp = stats[dom.id] || {};
      const attempts = comp.attempts || 0;
      const correct = comp.correct || 0;
      const acc = attempts > 0 ? correct / attempts : 0;
      const poolSize = bank.filter((q) => q && q.comp === dom.id).length;
      const priority = attempts < 3 ? 100 - attempts : (1 - acc) * 60 + (1 - Math.min(attempts / 20, 1)) * 20;
      return { ...dom, attempts, correct, accuracy: acc, priority, poolSize };
    });
    scored.sort((a, b) => b.priority - a.priority);
    return scored.slice(0, limit);
  }

  /** Build an adaptive session: focus weak competencies + difficulty ramp. */
  function buildAdaptiveSession(examId, count = 20) {
    const bank = configGetQuestions(examId);
    if (!Array.isArray(bank) || bank.length === 0) return [];

    const domains = configGetDomains(examId);
    const weakest = Array.isArray(domains) && domains.length > 0
      ? getWeakestCompetencies(examId, domains, domains.length)
      : [];
    const questions = [];
    const usedIds = new Set();

    if (weakest.length > 0) {
      for (let i = 0; i < count; i++) {
        const compInfo = weakest[i % weakest.length];
        const compId = compInfo.id;
        const pool = bank.filter((q) => q && q.comp === compId && !usedIds.has(q.id));
        if (pool.length === 0) continue;

        const d = compInfo.accuracy >= 0.7 ? 2 : 1;
        const byDiff = pool.filter((q) => (q.difficulty || 1) === d);
        const candidates = byDiff.length > 0 ? byDiff : pool;
        const q = candidates[Math.floor(Math.random() * candidates.length)];
        questions.push(q);
        usedIds.add(q.id);
      }
    }

    if (questions.length < count) {
      const remaining = bank.filter((q) => q && !usedIds.has(q.id));
      const extra = shuffle(remaining).slice(0, count - questions.length);
      questions.push(...extra);
    }

    return shuffle(questions);
  }

  function getReadinessLevel(score, total, examId) {
    const pct = total > 0 ? score / total : 0;
    const cfg = configGetTestConfig(examId || defaultExamId);
    if (pct >= 0.85) return { label: 'Excellent', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' };
    if (pct >= cfg.passingScore) return { label: 'Passing', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
    if (pct >= 0.55) return { label: 'Approaching', color: '#eab308', bg: 'rgba(234,179,8,0.1)' };
    return { label: 'Needs Practice', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  }

  function buildFullTest(examId) {
    const cfg = configGetTestConfig(examId);
    const bank = configGetQuestions(examId);
    const questions = [];
    for (const [compId, count] of Object.entries(cfg.categoryDistribution || {})) {
      const pool = bank.filter((q) => q.comp === compId);
      const picked = shuffle(pool).slice(0, count);
      questions.push(...picked);
    }
    return shuffle(questions).slice(0, Math.min(cfg.totalQuestions, questions.length));
  }

  function buildShortAssessment(examId, count = 10) {
    const cfg = configGetTestConfig(examId);
    const bank = configGetQuestions(examId);
    const compIds = Object.keys(cfg.categoryDistribution || {});
    if (compIds.length === 0) return shuffle(bank).slice(0, Math.min(count, bank.length));
    const perDomain = Math.max(1, Math.floor(count / compIds.length));
    const questions = [];
    for (const compId of compIds) {
      const pool = bank.filter((q) => q.comp === compId);
      questions.push(...shuffle(pool).slice(0, perDomain));
    }
    return shuffle(questions).slice(0, Math.min(count, questions.length));
  }

  function buildCompetencyDrill(compId, count, examId) {
    const bank = configGetQuestions(examId);
    const pool = bank.filter((q) => q.comp === compId);
    return shuffle(pool).slice(0, Math.min(count, pool.length));
  }

  const location = useLocation();
  const [examId, setExamId] = useState(defaultExamId);
  const [mode, setMode] = useState('home');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [drillComp, setDrillComp] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(null);
  const [flagged, setFlagged] = useState(new Set());
  const [showNav, setShowNav] = useState(false);
  const [lastExamId, setLastExamId] = useState(null);
  const [testRunMode, setTestRunMode] = useState(null);
  const [inStudyFlow, setInStudyFlow] = useState(false);
  const [inKeepGoingFlow, setInKeepGoingFlow] = useState(false);
  const [learnCheckIndex, setLearnCheckIndex] = useState(0);
  const [inLearnCheckDrill, setInLearnCheckDrill] = useState(false);
  const timerRef = useRef(null);
  const username = typeof localStorage !== 'undefined' ? localStorage.getItem('quantegy-teacher-user') : null;

  const autoStartedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const examFromUrl = params.get('exam');
    if (examFromUrl && examOptions.some((ex) => ex.id === examFromUrl)) {
      setExamId(examFromUrl);
    }
  }, [location.search, examOptions]);

  useEffect(() => {
    if ((mode === 'test' || mode === 'drill' || mode === 'adaptive') && startTime && !submitted) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, startTime, submitted]);

  const startFullTest = useCallback(() => {
    if (!hasFullExamAccess) return;
    const qs = buildFullTest(examId);
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setTestRunMode('full');
    setMode('test');
  }, [examId, hasFullExamAccess]);

  const startShortAssessment = useCallback(() => {
    const qs = buildShortAssessment(examId, 10);
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setTestRunMode('short');
    setMode('test');
  }, [examId]);

  const startQuickCheck = useCallback(() => {
    const qs = buildShortAssessment(examId, 6);
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setTestRunMode('quick');
    setMode('test');
  }, [examId]);

  /** Continuous study flow: 5-q quiz → game → 10-q assessment → weak-area games → repeat or finish */
  const startStudyFlow = useCallback(() => {
    setInStudyFlow(true);
    const qs = buildShortAssessment(examId, 5);
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setTestRunMode('quick');
    setMode('test');
  }, [examId]);

  const startDrill = useCallback((compId) => {
    const qs = buildCompetencyDrill(compId, 10, examId);
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setDrillComp(compId);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setMode('drill');
  }, [examId]);

  useEffect(() => {
    if (autoStartedRef.current) return;
    const params = new URLSearchParams(location.search);
    const compFromUrl = params.get('comp');
    const examFromUrl = params.get('exam');
    if (compFromUrl && mode === 'home' && (!examFromUrl || examId === examFromUrl)) {
      autoStartedRef.current = true;
      setTimeout(() => startDrill(compFromUrl), 0);
    }
  }, [location.search, mode, startDrill, examId]);

  const startAdaptivePractice = useCallback(() => {
    const qs = buildAdaptiveSession(examId, 20);
    if (!qs || qs.length === 0) return;
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setDrillComp(null);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setMode('adaptive');
  }, [examId]);

  /** Learn & check: show concept (short explanation) → 2-question check → next concept → … → then play a game */
  const startLearnCheck = useCallback(() => {
    setLearnCheckIndex(0);
    setInLearnCheckDrill(true);
    setMode('learncheck');
  }, []);

  const startLearnCheckDrill = useCallback((compId) => {
    const qs = buildCompetencyDrill(compId, 2, examId);
    if (!qs || qs.length === 0) return;
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setDrillComp(compId);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setMode('drill');
  }, [examId]);

  /** Short 3-question adaptive quiz — used by every test prep. Alternates: short quiz → short game → short quiz → … */
  const startQuickAdaptive = useCallback(() => {
    setInKeepGoingFlow(true);
    const qs = buildAdaptiveSession(examId, 3);
    if (!qs || qs.length === 0) return;
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setDrillComp(null);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setMode('adaptive');
  }, [examId]);

  const answerQuestion = useCallback((qId, answer) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  }, []);

  const handleMCAnswer = useCallback(
    (choice) => {
      const q = questions[currentIdx];
      answerQuestion(q.id, choice);
    },
    [questions, currentIdx, answerQuestion]
  );

  const toggleFlag = useCallback(() => {
    const q = questions[currentIdx];
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  }, [questions, currentIdx]);

  const goNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowExplanation(null);
    }
  }, [currentIdx, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setShowExplanation(null);
    }
  }, [currentIdx]);

  const goToQuestion = useCallback((idx) => {
    setCurrentIdx(idx);
    setShowExplanation(null);
    setShowNav(false);
  }, []);

  const submitTest = useCallback(() => {
    clearInterval(timerRef.current);
    setSubmitted(true);
    const score = questions.reduce((s, q) => {
      const a = answers[q.id];
      if (q.type === 'multi') {
        const correct = Array.isArray(q.answer) ? [...q.answer].sort() : [q.answer];
        const student = Array.isArray(a) ? [...a].sort() : [];
        return s + (JSON.stringify(correct) === JSON.stringify(student) ? 1 : 0);
      }
      return s + (String(a) === String(q.answer) ? 1 : 0);
    }, 0);

    if (mode === 'adaptive') {
      questions.forEach((q) => {
        if (!q || q.comp == null) return;
        const a = answers[q.id];
        let correct = false;
        if (q.type === 'multi') {
          const c = Array.isArray(q.answer) ? [...q.answer].sort() : [q.answer];
          const st = Array.isArray(a) ? [...a].sort() : [];
          correct = JSON.stringify(c) === JSON.stringify(st);
        } else {
          correct = String(a) === String(q.answer);
        }
        recordAdaptiveResult(examId, q.comp, q.id, correct, q.difficulty || 1);
      });
    }

    saveResult({
      mode: mode === 'test' ? (testRunMode === 'quick' ? 'quick' : testRunMode === 'short' ? 'short' : 'full') : mode === 'adaptive' ? 'adaptive' : 'drill',
      examId,
      category: drillComp || (mode === 'adaptive' ? 'adaptive' : 'all'),
      score,
      total: questions.length,
      timeSeconds: elapsed,
      answers: { ...answers },
    });
    setLastExamId(examId);
    setCurrentIdx(0);
  }, [questions, answers, elapsed, mode, drillComp, examId, testRunMode]);

  const isCorrect = (q) => {
    const a = answers[q.id];
    if (!a) return null;
    if (q.type === 'multi') {
      const correct = Array.isArray(q.answer) ? [...q.answer].sort() : [q.answer];
      const student = Array.isArray(a) ? [...a].sort() : [];
      return JSON.stringify(correct) === JSON.stringify(student);
    }
    return String(a) === String(q.answer);
  };

  const totalCorrect = submitted ? questions.filter((q) => isCorrect(q)).length : 0;

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const formatTimeMinutes = (min) => {
    if (min === 60) return '60 min';
    if (min === 285) return '4 hr 45 min';
    if (min === 300) return '5 hours';
    return min >= 60 ? `${Math.floor(min / 60)} hr ${min % 60 ? `${min % 60} min` : ''}`.trim() : `${min} min`;
  };

  /* ── Learn & check: concept → assess → next concept → … → game ── */
  const INTRO_VIDEOS = {
    math712: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    math48: 'https://www.youtube.com/embed/jxA8MffVmPs',
    ec6: 'https://www.youtube.com/embed/jxA8MffVmPs',
    physicsMath612: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    ela712: 'https://www.youtube.com/embed/QVmqK6V2eag',
    ela48: 'https://www.youtube.com/embed/QVmqK6V2eag',
    ec6_ela: 'https://www.youtube.com/embed/QVmqK6V2eag',
    str: 'https://www.youtube.com/embed/QVmqK6V2eag',
    readingSpecialist: 'https://www.youtube.com/embed/QVmqK6V2eag',
    physicalScience: 'https://www.youtube.com/embed/8m6hF0fJ28g', // Khan: science; replace if unavailable
    chemistry: 'https://www.youtube.com/embed/8m6hF0fJ28g',
    science712: 'https://www.youtube.com/embed/8m6hF0fJ28g',
    lifeScience712: 'https://www.youtube.com/embed/8m6hF0fJ28g',
    science48: 'https://www.youtube.com/embed/8m6hF0fJ28g',
    ec6_science: 'https://www.youtube.com/embed/8m6hF0fJ28g',
    socialStudies712: 'https://www.youtube.com/embed/6qjq8DQQDCQ',
    history712: 'https://www.youtube.com/embed/6qjq8DQQDCQ',
    socialStudies48: 'https://www.youtube.com/embed/6qjq8DQQDCQ',
    ec6_social: 'https://www.youtube.com/embed/6qjq8DQQDCQ',
    bilingual: 'https://www.youtube.com/embed/QVmqK6V2eag',
    esl: 'https://www.youtube.com/embed/QVmqK6V2eag',
    specialEd: 'https://www.youtube.com/embed/QVmqK6V2eag',
    ppr: 'https://www.youtube.com/embed/QVmqK6V2eag',
    bilingualSpanish: 'https://www.youtube.com/embed/QVmqK6V2eag',
    artEC12: 'https://www.youtube.com/embed/jxA8MffVmPs',
    musicEC12: 'https://www.youtube.com/embed/jxA8MffVmPs',
    peEC12: 'https://www.youtube.com/embed/jxA8MffVmPs',
    cs812: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    techAppEC12: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    schoolCounselor: 'https://www.youtube.com/embed/QVmqK6V2eag',
    loteSpanish: 'https://www.youtube.com/embed/QVmqK6V2eag',
    ec6_full: 'https://www.youtube.com/embed/jxA8MffVmPs',
    praxis_math: 'https://www.youtube.com/embed/jxA8MffVmPs',
    praxis_reading: 'https://www.youtube.com/embed/QVmqK6V2eag',
    sat_math: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    sat_verbal: 'https://www.youtube.com/embed/QVmqK6V2eag',
    gre_quant: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    gre_verbal: 'https://www.youtube.com/embed/QVmqK6V2eag',
    ftce_gk_math: 'https://www.youtube.com/embed/jxA8MffVmPs',
    ftce_gk_reading: 'https://www.youtube.com/embed/QVmqK6V2eag',
    nystce_multi: 'https://www.youtube.com/embed/jxA8MffVmPs',
    cset_math: 'https://www.youtube.com/embed/CLWpkv6ccpA',
    ilts_content: 'https://www.youtube.com/embed/jxA8MffVmPs',
    mtel_comm: 'https://www.youtube.com/embed/QVmqK6V2eag',
    gace_program: 'https://www.youtube.com/embed/jxA8MffVmPs',
    oae_content: 'https://www.youtube.com/embed/jxA8MffVmPs',
    mttc_elem: 'https://www.youtube.com/embed/jxA8MffVmPs',
    west_basic: 'https://www.youtube.com/embed/jxA8MffVmPs',
    numeracy: 'https://www.youtube.com/embed/jxA8MffVmPs',
    literacy: 'https://www.youtube.com/embed/QVmqK6V2eag',
    cpa_aud: 'https://www.youtube.com/embed/jxA8MffVmPs',
    soa_p: 'https://www.youtube.com/embed/CLWpkv6ccpA',
  };
  const introVideoUrl = INTRO_VIDEOS[examId] || 'https://www.youtube.com/embed/jxA8MffVmPs';

  if (mode === 'learncheck') {
    const learnCheckDomains = configGetDomains(examId);
    const domain = learnCheckDomains[learnCheckIndex];
    const totalConcepts = learnCheckDomains.length;
    return (
      <TeacherLayout>
        <div style={pageStyle}>
          <Link to={backLink} style={{ color: COLOR.textMuted, textDecoration: 'none', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>← Back to Dashboard</Link>
          <div style={{ ...PAGE_HEADER, fontSize: 22, marginBottom: 8 }}>Learn & check</div>
          <div style={{ ...PAGE_SUBTITLE, marginBottom: 20 }}>Concept {learnCheckIndex + 1} of {totalConcepts} • {title}</div>

          {/* Quick intro video at the beginning */}
          <div style={{ width: '100%', maxWidth: 520, marginBottom: 20, borderRadius: 16, overflow: 'hidden', background: '#0f172a', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', padding: '10px 20px', background: 'rgba(255,255,255,0.06)' }}>📺 Quick intro — watch first</div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                title="Quick intro"
                src={`${introVideoUrl}?rel=0`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {domain ? (
            <div style={{ width: '100%', maxWidth: 520, padding: 24, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Concept</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>{domain.name}</div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>{domain.desc || 'No short description.'}</div>
              <button type="button" onClick={() => startLearnCheckDrill(domain.id)} style={{ ...bigBtn, background: 'linear-gradient(135deg,#059669,#047857)' }}>
                <span style={{ fontSize: 22 }}>✓</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>Check understanding (2 questions)</div>
                  <div style={{ fontSize: 11, opacity: 0.9 }}>Quick check to see if you got the concept</div>
                </div>
              </button>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 520, padding: 24, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginBottom: 8 }}>All concepts done ✓</div>
              <p style={{ fontSize: 14, color: '#15803d', margin: '0 0 16px', lineHeight: 1.5 }}>Play a game to reinforce what you learned.</p>
              {(() => {
                const firstWithGame = learnCheckDomains.find((d) => d.games && d.games.length);
                const defaultGameId = firstWithGame?.games?.[0] || (isTexesResultsKey ? 'teks-crush' : 'math-sprint');
                const defaultGame = GAMES_CATALOG.find((g) => g.id === defaultGameId) || GAMES_CATALOG.find((g) => g.id === 'math-match');
                return defaultGame ? (
                  <Link to={getGamePath(defaultGame.path, defaultGame.id, examId)} style={{ display: 'inline-block', padding: '12px 24px', background: '#16a34a', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
                    🎮 Play {defaultGame.name}
                  </Link>
                ) : null;
              })()}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => { setMode('home'); setInLearnCheckDrill(false); setLearnCheckIndex(0); }} style={actionBtn('#64748b')}>
              Back to {title}
            </button>
            {domain && learnCheckIndex > 0 && (
              <button type="button" onClick={() => setLearnCheckIndex((i) => i - 1)} style={actionBtn('#94a3b8')}>
                ← Previous concept
              </button>
            )}
          </div>
        </div>
      </TeacherLayout>
    );
  }

  /* ── Home screen ── */
  if (mode === 'home') {
    const effectiveExamId = examId;
    const mostPracticed = getMostPracticedExam();
    const history = loadResults();
    const fullTests = history.filter((r) => r.mode === 'full' && (r.examId || defaultExamId) === effectiveExamId);
    const lastTest = fullTests[fullTests.length - 1];
    const lastReadiness = lastTest ? getReadinessLevel(lastTest.score, lastTest.total, lastTest.examId || effectiveExamId) : null;
    const domains = configGetDomains(effectiveExamId);
    const questionBank = configGetQuestions(effectiveExamId);
    const historyForExam = history.filter((r) => (r.examId || defaultExamId) === effectiveExamId);
    const compStats = domains.map((dom) => {
      const compResults = historyForExam.filter((r) => r.category === dom.id || r.mode === 'full' || r.mode === 'short' || r.mode === 'quick');
      const totalQ = compResults.reduce((s, r) => {
        if (r.mode === 'full' || r.mode === 'short' || r.mode === 'quick') {
          const qs = questionBank.filter((q) => q.comp === dom.id);
          return s + qs.filter((q) => r.answers && r.answers[q.id] !== undefined).length;
        }
        return s + r.total;
      }, 0);
      const totalCorrectCount = compResults.reduce((s, r) => {
        if (r.mode === 'full' || r.mode === 'short' || r.mode === 'quick') {
          const qs = questionBank.filter((q) => q.comp === dom.id);
          return (
            s +
            qs.filter((q) => {
              const a = r.answers && r.answers[q.id];
              if (!a) return false;
              if (q.type === 'multi')
                return (
                  JSON.stringify([...q.answer].sort()) ===
                  JSON.stringify([...(Array.isArray(a) ? a : [])].sort())
                );
              return String(a) === String(q.answer);
            }).length
          );
        }
        return s + r.score;
      }, 0);
      return {
        ...dom,
        totalQ,
        totalCorrect: totalCorrectCount,
        pct: totalQ > 0 ? Math.round((totalCorrectCount / totalQ) * 100) : null,
      };
    });

    const avgPct = historyForExam.length > 0
      ? Math.round(historyForExam.reduce((s, r) => s + (r.total !== 0 ? (r.score / r.total) * 100 : 0), 0) / historyForExam.length)
      : 0;
    const bestPct = historyForExam.length > 0
      ? Math.max(...historyForExam.map((r) => (r.total !== 0 ? Math.round((r.score / r.total) * 100) : 0)))
      : 0;

    const testCfg = configGetTestConfig(effectiveExamId);
    const currentExamOption = examOptions.find((e) => e.id === examId);

    return (
      <TeacherLayout>
        <div style={pageStyle}>
          <Link
            to={backLink}
            style={{
              color: COLOR.textMuted,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              alignSelf: 'flex-start',
              marginBottom: 12,
            }}
          >
            ← Back to Dashboard
          </Link>

          <div style={{ ...PAGE_HEADER, textAlign: 'center', marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ width: '100%', maxWidth: 520, marginBottom: 12 }}>
            <label htmlFor="exam-select" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLOR.textSecondary, marginBottom: 6 }}>
              Which test do you want to take?
            </label>
            <select
              id="exam-select"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: `1px solid ${COLOR.border}`,
                background: COLOR.card,
                fontSize: 15,
                fontWeight: 600,
                color: COLOR.text,
                cursor: 'pointer',
                fontFamily: PAGE_WRAP.fontFamily,
              }}
            >
              {examOptions.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.label} — {ex.examLabel}
                </option>
              ))}
            </select>
            {isTexesResultsKey && (
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Link to={`/domains?exam=${encodeURIComponent(examId)}`} style={{ fontSize: 12, fontWeight: 700, color: COLOR.blue, textDecoration: 'none' }}>
                  View all competencies →
                </Link>
              </div>
            )}
            {examId === 'math712' && math712LearningPath && (
              <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 12, background: '#eff6ff', border: `1px solid ${COLOR.blue}33` }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: COLOR.blue, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Adaptive learning path
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: COLOR.text, lineHeight: 1.5 }}>
                  All 21 Math 7–12 competencies in recommended order with the adaptive loop, spaced review, and per-competency mastery.
                </p>
                <Link to={math712LearningPath} style={{ ...BTN_PRIMARY, display: 'inline-block', textDecoration: 'none', fontSize: 13, padding: '10px 18px' }}>
                  Open learning path →
                </Link>
              </div>
            )}
          </div>
          <div style={{ ...PAGE_SUBTITLE, textAlign: 'center', marginBottom: 20 }}>
            {currentExamOption?.examLabel || ''}
          </div>

          {mostPracticed.count > 0 && (
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, textAlign: 'center' }}>
              Most practiced: <strong style={{ color: '#0f172a' }}>{mostPracticed.label}</strong> ({mostPracticed.count} session{mostPracticed.count !== 1 ? 's' : ''})
            </div>
          )}

          <div
            style={{
              width: '100%',
              maxWidth: 520,
              marginBottom: 20,
              textAlign: 'center',
              padding: '14px 0',
              borderBottom: `1px solid ${COLOR.border}`,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: COLOR.text }}>
              {testCfg.totalQuestions} questions · {formatTimeMinutes(testCfg.timeMinutes)}
            </div>
            <div style={{ fontSize: 12, color: COLOR.textSecondary, marginTop: 2 }}>
              ~{Math.round(testCfg.passingScore * 100)}% to pass · {domains.length} competencies
            </div>
          </div>

          {lastReadiness && (
            <div
              style={{
                ...CARD,
                background: lastReadiness.bg,
                border: `2px solid ${lastReadiness.color}`,
                padding: '16px 22px',
                width: '100%',
                maxWidth: 520,
                marginBottom: 20,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Last Practice Test
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: lastReadiness.color }}>{lastReadiness.label}</div>
              <div style={{ fontSize: 13, color: COLOR.textSecondary, marginTop: 4 }}>
                {lastTest.score} / {lastTest.total} correct ({Math.round((lastTest.score / lastTest.total) * 100)}%)
              </div>
            </div>
          )}

          <div
            style={{
              ...CARD,
              width: '100%',
              maxWidth: 520,
              marginBottom: 24,
              padding: '20px 24px',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, color: COLOR.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
              Competency Breakdown
            </div>
            {historyForExam.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  {historyForExam.length} session{historyForExam.length !== 1 ? 's' : ''}
                </span>
                <span style={{ fontSize: 13, color: '#64748b' }}>·</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Avg {avgPct}%
                </span>
                <span style={{ fontSize: 13, color: '#64748b' }}>·</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#22c55e' }}>
                  Best {bestPct}%
                </span>
              </div>
            )}
            {historyForExam.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                Pick a competency below to start practicing.
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(() => {
                const ROMAN_NUMS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                return domains.map((dom, domIdx) => {
                  const domStds = dom.standards || [];
                  const stat = compStats[domIdx];
                  const pctColor = stat.pct === null ? '#94a3b8' : stat.pct >= 75 ? '#22c55e' : stat.pct >= 55 ? '#eab308' : '#ef4444';

                  const buildLoopUrl = (compId, stdId) => {
                    const p = new URLSearchParams();
                    p.set('comp', compId);
                    if (stdId) p.set('currentStd', stdId);
                    p.set('phase', 'diagnostic');
                    if (examId === 'math712') { p.set('grade', 'grade7-12'); p.set('label', 'Math 7\u201312'); }
                    else if (examId === 'math48') { p.set('grade', 'grade4-8'); p.set('label', 'Math 4\u20138'); }
                    else { p.set('grade', examId === 'ec6' ? 'grade-ec6' : String(examId)); p.set('label', dom.name || examId); }
                    return `/practice-loop?${p.toString()}`;
                  };

                  return (
                    <div key={dom.id} style={{ borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: domStds.length > 0 ? '1px solid #e2e8f0' : 'none' }}>
                        <div style={{ minWidth: 28, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: '#7c3aed', color: '#fff', padding: '0 6px' }}>
                          {ROMAN_NUMS[domIdx] || domIdx + 1}
                        </div>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                          {dom.name}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: stat.pct !== null ? pctColor : '#94a3b8' }}>
                          {stat.pct !== null ? `${stat.pct}%` : 'New'}
                        </div>
                      </div>
                      {domStds.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                          {domStds.map((std, si) => {
                            const compNum = std.name?.match(/Competency\s+(\d+)/)?.[1] || '';
                            const shortName = std.name?.replace(/^Competency\s+\d+\s*[—–-]\s*/, '') || std.name;
                            const standardActionPill = {
                              padding: '3px 10px',
                              minHeight: 24,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 700,
                              borderRadius: 5,
                              cursor: 'pointer',
                              textDecoration: 'none',
                              lineHeight: 1,
                              boxSizing: 'border-box',
                            };
                            return (
                              <div key={std.id} style={{ padding: '8px 14px 8px 52px', borderTop: si > 0 ? '1px solid #f1f5f9' : 'none', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', minWidth: 26 }}>{compNum}</span>
                                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#475569' }}>{shortName}</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button type="button" onClick={() => startDrill(dom.id)} style={{ ...standardActionPill, color: '#7c3aed', background: '#ede9fe', border: '1px solid #c4b5fd' }}>
                                    Drill
                                  </button>
                                  <Link to={buildLoopUrl(dom.id, std.id)} style={{ ...standardActionPill, color: '#2563eb', background: '#eff6ff', border: '1px solid #93c5fd' }}>
                                    Loop →
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {domStds.length === 0 && (
                        <div style={{ padding: '6px 14px 10px', display: 'flex', gap: 8 }}>
                          <button type="button" onClick={() => startDrill(dom.id)} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 6, cursor: 'pointer' }}>
                            Quick drill
                          </button>
                          <Link to={buildLoopUrl(dom.id)} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
                            Practice loop →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
            {historyForExam.length > 0 && (() => {
              const strengthened = compStats.filter((s) => s.pct !== null && s.pct >= 75).map((s) => s.name);
              const needPractice = compStats.filter((s) => s.pct === null || s.pct < 55).map((s) => s.name);
              if (strengthened.length === 0 && needPractice.length === 0) return null;
              return (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Where you stand</div>
                  {strengthened.length > 0 && (
                    <div style={{ fontSize: 12, color: '#166534', marginBottom: 4 }}><strong>Strengthened:</strong> {strengthened.join(', ')}</div>
                  )}
                  {needPractice.length > 0 && (
                    <div style={{ fontSize: 12, color: '#b45309' }}><strong>Keep practicing:</strong> {needPractice.join(', ')}</div>
                  )}
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Progress is saved. Come back anytime to continue.</div>
                </div>
              );
            })()}
          </div>

          <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <Link
                to={(() => {
                  const params = new URLSearchParams();
                  params.set('phase', 'diagnostic');
                  if (isTexesResultsKey) {
                    if (examId === 'math712') {
                      params.set('grade', 'grade7-12');
                      params.set('label', 'Math 7\u201312');
                      const firstDomain = domains[0];
                      const firstStd = firstDomain?.standards?.[0];
                      if (firstDomain?.id) params.set('comp', firstDomain.id);
                      if (firstStd?.id) params.set('currentStd', firstStd.id);
                    } else if (examId === 'math48') {
                      params.set('grade', 'grade4-8');
                      params.set('label', 'Math 4\u20138');
                      const firstDomain = domains[0];
                      const firstStd = firstDomain?.standards?.[0];
                      if (firstDomain?.id) params.set('comp', firstDomain.id);
                      if (firstStd?.id) params.set('currentStd', firstStd.id);
                    } else {
                      const domains = configGetDomains(examId) || [];
                      const first = domains[0];
                      if (first) {
                        params.set('grade', examId === 'ec6' ? 'grade-ec6' : examId === 'ec6_ela' ? 'grade-ec6-ela' : examId === 'ec6_science' ? 'grade-ec6-science' : examId === 'ec6_social' ? 'grade-ec6-social' : examId === 'ec6_full' ? 'grade-ec6-full' : String(examId));
                        params.set('teks', first.id);
                        params.set('label', examLabelsForHistory[examId] || first.name || examId);
                      }
                    }
                  }
                  return `/practice-loop?${params.toString()}`;
                })()}
                style={{ ...bigBtn, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}
              >
                <span style={{ fontSize: 22 }}>🎯</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Continuous study</div>
                  <div style={{ fontSize: 10, opacity: 0.9 }}>Diagnostic → game → mastery flow</div>
                </div>
              </Link>
              <button type="button" onClick={startQuickCheck} style={{ ...bigBtn, background: 'linear-gradient(135deg,#0d9488,#0f766e)', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ fontSize: 22 }}>⏱</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Quick 5-min quiz</div>
                  <div style={{ fontSize: 10, opacity: 0.9 }}>Weak-area games → progress check</div>
                </div>
              </button>
              <button type="button" onClick={startShortAssessment} style={{ ...bigBtn, background: 'linear-gradient(135deg,#059669,#047857)', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ fontSize: 22 }}>✓</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800 }}>Short assessment</div>
                  <div style={{ fontSize: 10, opacity: 0.9 }}>10 questions • Free</div>
                </div>
              </button>
            </div>

            {hasFullExamAccess ? (
              <button type="button" onClick={startFullTest} style={{ ...bigBtn, background: 'linear-gradient(135deg,#7c3aed,#5b21b6)' }}>
                <span style={{ fontSize: 24 }}>📝</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Full practice exam</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>All {testCfg.totalQuestions} questions • Timed • Mirrors exam format</div>
                </div>
              </button>
            ) : (
              <div style={{ ...bigBtn, background: '#f1f5f9', border: '2px dashed #cbd5e1', color: '#64748b', cursor: 'default', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#475569' }}>Full practice exam</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Full-length timed exam • Paid subscription required (not included in free trial)</div>
                  <Link to={username ? `/pricing?user=${username}` : '/teacher'} style={{ display: 'inline-block', padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                    {username ? 'Upgrade to Pro' : 'Sign in to unlock'}
                  </Link>
                </div>
              </div>
            )}

            <button type="button" onClick={startAdaptivePractice} style={{ ...bigBtn, background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
              <span style={{ fontSize: 24 }}>🎯</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Adaptive Practice</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Focus on weak areas • Difficulty ramps with performance • 20 questions</div>
              </div>
            </button>
            {(() => {
              const focus = getWeakestCompetencies(effectiveExamId, domains, 3);
              if (focus.length === 0) return null;
              return (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: -4 }}>
                  Suggested focus: {focus.map((c) => c.name).join(', ')}
                </div>
              );
            })()}
          </div>

          <div style={{ width: '100%', maxWidth: 520, marginBottom: 24 }}>
            <div style={SECTION_HEADING}>Competency Drills</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {domains.map((dom, i) => {
                const stat = compStats[i];
                const pctColor = stat.pct === null ? COLOR.textMuted : stat.pct >= 75 ? '#22c55e' : stat.pct >= 55 ? '#eab308' : '#ef4444';
                const masteryUrl = (() => {
                  const params = new URLSearchParams();
                  params.set('comp', dom.id);
                  params.set('phase', 'diagnostic');
                  if (examId === 'math712') {
                    params.set('grade', 'grade7-12');
                    params.set('label', 'Math 7\u201312');
                    const firstStd = dom.standards?.[0];
                    if (firstStd?.id) params.set('currentStd', firstStd.id);
                  } else if (examId === 'math48') {
                    params.set('grade', 'grade4-8');
                    params.set('label', 'Math 4\u20138');
                    const firstStd = dom.standards?.[0];
                    if (firstStd?.id) params.set('currentStd', firstStd.id);
                  } else {
                    params.set('grade', examId === 'ec6' ? 'grade-ec6' : String(examId));
                    params.set('label', examLabelsForHistory[examId] || dom.name || examId);
                  }
                  return `/practice-loop?${params.toString()}`;
                })();
                return (
                  <div key={dom.id} style={{ ...CARD, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={CHIP(COLOR.purple, COLOR.purpleBg)}>Competency {i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.text, lineHeight: 1.3 }}>{dom.name}</div>
                    {stat.pct !== null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ ...PROGRESS_TRACK, flex: 1, height: 5 }}>
                          <div style={progressFill(stat.pct, pctColor)} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: pctColor }}>{stat.pct}%</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: COLOR.textMuted }}>Not attempted yet</div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button type="button" onClick={() => startDrill(dom.id)} style={{ ...actionBtn(COLOR.purple), padding: '6px 12px', fontSize: 11 }}>10-q drill</button>
                      <Link to={masteryUrl} style={{ ...linkBtn, fontSize: 11, padding: '6px 0' }}>Mastery flow →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 520, marginBottom: 24 }}>
            <div style={SECTION_HEADING}>Games Mapped to Competencies</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {domains.map((dom) => {
                const gameIds = dom.games || [];
                const games = gameIds.map((id) => GAMES_CATALOG.find((g) => g.id === id)).filter(Boolean);
                return (
                  <div key={dom.id} style={{ ...CARD, padding: '16px 18px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.text, marginBottom: 8 }}>{dom.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {games.map((g) => (
                        <Link key={g.id} to={getGamePath(g.path, g.id, examId)} style={{ padding: '6px 12px', background: COLOR.blueBg, color: COLOR.blue, borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600, border: `1px solid ${COLOR.blueBorder}` }}>
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {history.length > 0 && (
            <div style={{ width: '100%', maxWidth: 520 }}>
              <div style={SECTION_HEADING}>Recent Practice</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history
                  .slice(-5)
                  .reverse()
                  .map((r, i) => {
                    const readiness = getReadinessLevel(r.score, r.total, r.examId);
                    const compName =
                      r.mode === 'full'
                        ? 'Full practice exam'
                        : r.mode === 'quick'
                          ? 'Quick 5-min quiz'
                          : r.mode === 'short'
                            ? 'Short assessment'
                            : r.mode === 'adaptive'
                              ? 'Adaptive Practice'
                              : configGetDomains(r.examId || defaultExamId).find((c) => c.id === r.category)?.name || r.category;
                    return (
                      <div
                        key={i}
                        style={{
                          ...CARD,
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.text }}>{compName}</div>
                          <div style={{ fontSize: 11, color: COLOR.textSecondary }}>
                            {new Date(r.timestamp).toLocaleDateString()} • {fmtTime(r.timeSeconds)} • {examLabelsForHistory[r.examId] || r.examId}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: readiness.color }}>{r.score}/{r.total}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: readiness.color }}>{readiness.label}</div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </TeacherLayout>
    );
  }

  /* ── Test / Drill / Adaptive mode ── */
  if ((mode === 'test' || mode === 'drill' || mode === 'adaptive') && questions.length > 0) {
    const q = questions[currentIdx];
    const answered = answers[q.id] !== undefined;
    const totalAnswered = Object.keys(answers).length;
    const resultDomains = configGetDomains(examId);
    const compName =
      mode === 'adaptive'
        ? 'Adaptive Practice'
        : mode === 'drill'
          ? resultDomains.find((c) => c.id === drillComp)?.name
          : testRunMode === 'quick'
            ? 'Quick 5-min quiz'
            : testRunMode === 'short'
              ? 'Short assessment'
              : 'Full practice exam';

    if (submitted) {
      const readiness = getReadinessLevel(totalCorrect, questions.length, examId);
      const compBreakdown = resultDomains
        .map((dom) => {
          const compQs = questions.filter((q) => q.comp === dom.id);
          const compCorrect = compQs.filter((q) => isCorrect(q)).length;
          return { ...dom, total: compQs.length, correct: compCorrect };
        })
        .filter((c) => c.total > 0);

      return (
        <TeacherLayout>
          <div style={pageStyle}>
            <div style={{ ...PAGE_HEADER, textAlign: 'center', marginBottom: 4 }}>Results</div>
            <div style={{ ...PAGE_SUBTITLE, textAlign: 'center', marginBottom: 20 }}>{compName}</div>

            <div
              style={{
                ...CARD,
                background: readiness.bg,
                border: `2px solid ${readiness.color}`,
                width: '100%',
                maxWidth: 520,
                marginBottom: 20,
                textAlign: 'center',
                padding: '28px 24px',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 900, color: readiness.color }}>
                {totalCorrect}/{questions.length}
              </div>
              <div style={{ fontSize: 13, color: COLOR.textSecondary, marginBottom: 8 }}>
                {Math.round((totalCorrect / questions.length) * 100)}% • {fmtTime(elapsed)}
              </div>
              <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 20, background: readiness.color, color: '#fff', fontSize: 14, fontWeight: 800 }}>
                {readiness.label}
              </div>
            </div>

            {compBreakdown.length > 1 && (
              <div style={{ ...CARD, width: '100%', maxWidth: 520, marginBottom: 20, padding: '20px 24px' }}>
                <div style={SECTION_HEADING}>By Competency</div>
                {compBreakdown.map((dom, idx) => {
                  const pct = Math.round((dom.correct / dom.total) * 100);
                  const col = pct >= 75 ? '#22c55e' : pct >= 55 ? '#eab308' : '#ef4444';
                  return (
                    <div key={dom.id} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, color: COLOR.text }}>Comp {idx + 1}: {dom.name}</span>
                        <span style={{ fontWeight: 800, color: col }}>{dom.correct}/{dom.total} ({pct}%)</span>
                      </div>
                      <div style={{ ...PROGRESS_TRACK, height: 6 }}>
                        <div style={progressFill(pct, col)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {inStudyFlow && testRunMode === 'quick' && (() => {
              const doms = configGetDomains(examId);
              const firstWithGame = Array.isArray(doms) ? doms.find((d) => d.games && d.games.length) : null;
              const defaultGameId = firstWithGame?.games?.[0] || (isTexesResultsKey ? 'teks-crush' : 'math-sprint');
              const defaultGame = GAMES_CATALOG.find((g) => g.id === defaultGameId);
              return (
                <div style={{ width: '100%', maxWidth: 500, marginBottom: 20, padding: '18px 20px', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius: 12, border: '1px solid #6ee7b7' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>Step 1 done ✓</div>
                  <p style={{ fontSize: 12, color: '#047857', margin: '0 0 12px', lineHeight: 1.5 }}>
                    Play a game to warm up, then take the 10-question assessment to check progress.
                  </p>
                  {defaultGame && (
                    <Link to={getGamePath(defaultGame.path, defaultGame.id, examId)} style={{ display: 'inline-block', marginBottom: 12, padding: '8px 16px', background: '#fff', border: '1px solid #34d399', color: '#047857', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                      🎮 Play {defaultGame.name}
                    </Link>
                  )}
                  <div style={{ marginTop: 12 }}>
                    <button type="button" onClick={startShortAssessment} style={{ padding: '12px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      Continue to 10-question assessment →
                    </button>
                  </div>
                </div>
              );
            })()}

            {(testRunMode === 'short' || testRunMode === 'quick') && compBreakdown.length > 0 &&
              (() => {
                const weakAreas = compBreakdown.filter((d) => d.correct < d.total);
                const gameIdsSeen = new Set();
                return weakAreas.length > 0 ? (
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 500,
                      marginBottom: 20,
                      padding: '16px 18px',
                      background: '#f0fdf4',
                      borderRadius: 12,
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 10 }}>🎮 Practice weak areas</div>
                    <p style={{ fontSize: 12, color: '#15803d', margin: '0 0 12px', lineHeight: 1.4 }}>
                      Play these games to strengthen the competencies you missed, then take the quiz again to see progress.
                    </p>
                    {weakAreas.map((d) => {
                      const fullDom = resultDomains.find((x) => x.id === d.id);
                      const gameIds = fullDom?.games || [];
                      return (
                        <div key={d.id} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{d.name}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {gameIds
                              .map((id) => GAMES_CATALOG.find((g) => g.id === id))
                              .filter(Boolean)
                              .filter((g) => {
                                if (gameIdsSeen.has(g.id)) return false;
                                gameIdsSeen.add(g.id);
                                return true;
                              })
                              .map((g) => (
                                <Link
                                  key={g.id}
                                  to={getGamePath(g.path, g.id, examId)}
                                  style={{ padding: '6px 12px', background: '#fff', border: '1px solid #86efac', color: '#15803d', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}
                                >
                                  {g.name}
                                </Link>
                              ))}
                            {gameIds.length === 0 && <span style={{ fontSize: 11, color: '#64748b' }}>No games mapped — use competency drills below.</span>}
                          </div>
                        </div>
                      );
                    })}
                    {!inStudyFlow && (
                      <button
                        type="button"
                        onClick={testRunMode === 'quick' ? startQuickCheck : startShortAssessment}
                        style={{ marginTop: 12, padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Quiz again
                      </button>
                    )}
                  </div>
                ) : null;
              })()}

            {inStudyFlow && testRunMode === 'short' && (
              <div style={{ width: '100%', maxWidth: 500, marginBottom: 20, padding: '18px 20px', background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius: 12, border: '1px solid #93c5fd' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e40af', marginBottom: 8 }}>Step 2 done ✓</div>
                <p style={{ fontSize: 12, color: '#1d4ed8', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Use the games above to practice weak areas. Then do another round or finish your session.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <button type="button" onClick={startStudyFlow} style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Do another round (5-q → game → 10-q)
                  </button>
                  <button type="button" onClick={() => { setInStudyFlow(false); setMode('home'); }} style={{ padding: '10px 20px', background: '#fff', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Finish
                  </button>
                </div>
              </div>
            )}

            {inLearnCheckDrill && mode === 'drill' && submitted && (() => {
              const nextIndex = learnCheckIndex + 1;
              const hasNext = nextIndex < resultDomains.length;
              const firstWithGame = resultDomains.find((d) => d.games && d.games.length);
              const defaultGameId = firstWithGame?.games?.[0] || (isTexesResultsKey ? 'teks-crush' : 'math-sprint');
              const defaultGame = GAMES_CATALOG.find((g) => g.id === defaultGameId) || GAMES_CATALOG.find((g) => g.id === 'math-sprint');
              return (
                <div style={{ width: '100%', maxWidth: 500, marginBottom: 20, padding: '18px 20px', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', borderRadius: 12, border: '1px solid #6ee7b7' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>Concept check: {totalCorrect}/{questions.length} correct</div>
                  <p style={{ fontSize: 12, color: '#047857', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {hasNext ? 'Move to the next concept or play a game to reinforce.' : 'All concept checks done. Play a game to reinforce.'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {hasNext ? (
                      <button type="button" onClick={() => { setLearnCheckIndex(nextIndex); setMode('learncheck'); setSubmitted(false); setQuestions([]); }} style={{ padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        Next concept →
                      </button>
                    ) : null}
                    {defaultGame && (
                      <Link to={getGamePath(defaultGame.path, defaultGame.id, examId)} style={{ display: 'inline-block', padding: '10px 20px', background: '#fff', color: '#059669', border: '1px solid #34d399', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                        🎮 Play {defaultGame.name}
                      </Link>
                    )}
                    <button type="button" onClick={() => { setMode('learncheck'); setLearnCheckIndex(resultDomains.length); setSubmitted(false); setQuestions([]); }} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      {hasNext ? 'Skip to game' : 'Back to flow'}
                    </button>
                  </div>
                </div>
              );
            })()}

            {inKeepGoingFlow && mode === 'adaptive' && (() => {
              const doms = configGetDomains(examId);
              const firstWithGame = Array.isArray(doms) ? doms.find((d) => d.games && d.games.length) : null;
              const defaultGameId = firstWithGame?.games?.[0] || (isTexesResultsKey ? 'teks-crush' : 'math-match');
              const defaultGame = GAMES_CATALOG.find((g) => g.id === defaultGameId) || GAMES_CATALOG.find((g) => g.id === 'math-sprint');
              const strengthened = compBreakdown.filter((c) => c.total > 0 && c.correct === c.total).map((c) => c.name);
              const needPractice = compBreakdown.filter((c) => c.total > 0 && c.correct < c.total).map((c) => c.name);
              return (
                <div style={{ width: '100%', maxWidth: 500, marginBottom: 20, padding: '18px 20px', background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', borderRadius: 12, border: '1px solid #a5b4fc' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#3730a3', marginBottom: 8 }}>Short quiz done ✓</div>
                  {strengthened.length > 0 && (
                    <p style={{ fontSize: 12, color: '#166534', margin: '0 0 6px', lineHeight: 1.4 }}>
                      <strong>You strengthened:</strong> {strengthened.join(', ')}
                    </p>
                  )}
                  {needPractice.length > 0 && (
                    <p style={{ fontSize: 12, color: '#b45309', margin: '0 0 10px', lineHeight: 1.4 }}>
                      <strong>Keep practicing:</strong> {needPractice.join(', ')}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: '#4338ca', margin: '0 0 12px', lineHeight: 1.5 }}>
                    Continue: play a short game, then another 3-question quiz (adaptive). Progress is saved — come back anytime to continue.
                  </p>
                  {defaultGame && (
                    <Link to={getGamePath(defaultGame.path, defaultGame.id, examId)} style={{ display: 'inline-block', marginBottom: 12, padding: '8px 16px', background: '#fff', border: '1px solid #818cf8', color: '#4338ca', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                      🎮 Play {defaultGame.name}
                    </Link>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={startQuickAdaptive} style={{ padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      Continue: another 3-question quiz
                    </button>
                    <button type="button" onClick={() => { setInKeepGoingFlow(false); setMode('home'); }} style={{ padding: '10px 20px', background: '#fff', color: '#4338ca', border: '1px solid #a5b4fc', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      Finish
                    </button>
                  </div>
                </div>
              );
            })()}

            <div style={{ width: '100%', maxWidth: 520, marginBottom: 20 }}>
              <div style={SECTION_HEADING}>Question Review</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {questions.map((q, i) => {
                  const correct = isCorrect(q);
                  const studentAnswer = answers[q.id];
                  return (
                    <div key={q.id} style={{
                      ...CARD,
                      padding: '14px 16px',
                      border: `2px solid ${correct ? COLOR.successBorder : '#fca5a5'}`,
                      background: correct ? COLOR.successBg : COLOR.redBg,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: correct ? COLOR.green : COLOR.red }}>{correct ? '✓' : '✗'} Q{i + 1}</div>
                      </div>
                      <div style={{ fontSize: 13, color: COLOR.text, marginBottom: 6, lineHeight: 1.5 }}>{formatMathText(q.q)}</div>
                      {!correct && (
                        <div style={{ fontSize: 12, color: COLOR.textSecondary }}>
                          Your answer: <span style={{ color: COLOR.red, fontWeight: 700 }}>{formatMathText(Array.isArray(studentAnswer) ? studentAnswer.join(', ') : (studentAnswer ?? 'Skipped'))}</span>
                          {' • '}Correct: <span style={{ color: COLOR.green, fontWeight: 700 }}>{formatMathText(Array.isArray(q.answer) ? q.answer.join(', ') : q.answer)}</span>
                        </div>
                      )}
                      {showExplanation === q.id ? (
                        <div style={{ fontSize: 12, color: COLOR.blue, marginTop: 8, lineHeight: 1.55, background: COLOR.blueBg, padding: '10px 12px', borderRadius: 10, border: `1px solid ${COLOR.blueBorder}` }}>
                          {formatMathText(q.explanation)}
                          <button type="button" onClick={() => setShowExplanation(null)} style={{ ...linkBtn, marginLeft: 8, fontSize: 12 }}>Hide</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setShowExplanation(q.id)} style={{ ...linkBtn, marginTop: 6, fontSize: 12 }}>Show explanation</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" onClick={() => { setInStudyFlow(false); setInKeepGoingFlow(false); setInLearnCheckDrill(false); setMode('home'); }} style={actionBtn('#2563eb')}>
                Back to {title}
              </button>
              <button type="button" onClick={startQuickAdaptive} style={actionBtn('#6366f1')}>
                Keep going: 3-question adaptive
              </button>
              <button
                type="button"
                onClick={
                  mode === 'test'
                    ? testRunMode === 'quick'
                      ? startQuickCheck
                      : testRunMode === 'short'
                        ? startShortAssessment
                        : startFullTest
                    : mode === 'adaptive'
                      ? startAdaptivePractice
                      : () => startDrill(drillComp)
                }
                style={actionBtn('#7c3aed')}
              >
                Try Again
              </button>
            </div>
          </div>
        </TeacherLayout>
      );
    }

    return (
      <TeacherLayout>
        <div style={pageStyle}>
          {showNav && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
              onClick={() => setShowNav(false)}
            >
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Question Navigator</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                  {questions.map((q, i) => {
                    const hasAns = answers[q.id] !== undefined;
                    const isFlagged = flagged.has(q.id);
                    const isCurrent = i === currentIdx;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => goToQuestion(i)}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 8,
                          border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: hasAns ? '#dbeafe' : '#fff',
                          color: '#0f172a',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {i + 1}
                        {isFlagged && <span style={{ position: 'absolute', top: -2, right: -2, fontSize: 10 }}>🚩</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
              📋 {mode === 'test' ? (testRunMode === 'short' ? 'Short assessment' : testRunMode === 'quick' ? 'Quick 5-min quiz' : 'Full practice exam') : mode === 'adaptive' ? '🎯 Adaptive Practice' : compName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
              <span>⏱ {fmtTime(elapsed)}</span>
              <span>{totalAnswered}/{questions.length} answered</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Exit without submitting? Your progress will not be saved.')) setMode('home');
                }}
                style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Exit exam
              </button>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 600, marginBottom: 12 }}>
            <div style={{ height: 4, background: '#e2e8f0', borderRadius: 4 }}>
              <div style={{ height: '100%', width: `${(totalAnswered / questions.length) * 100}%`, background: '#7c3aed', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ ...CARD, width: '100%', maxWidth: 600, padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={CHIP(COLOR.purple, COLOR.purpleBg)}>Question {currentIdx + 1} of {questions.length}</div>
              <button type="button" onClick={toggleFlag} aria-label={flagged.has(q.id) ? 'Unflag question' : 'Flag question'} style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {flagged.has(q.id) ? '🚩' : '⚑'}
              </button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLOR.text, lineHeight: 1.6, marginBottom: 20 }}>{formatMathText(q.q)}</div>
            {q.type === 'mc' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.choices.map((choice, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const selected = answers[q.id] === choice;
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleMCAnswer(choice)}
                      style={{
                        ...(selected ? OPTION_SELECTED : OPTION_BASE),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        borderColor: selected ? COLOR.purple : COLOR.border,
                        background: selected ? COLOR.purpleBg : COLOR.card,
                      }}
                    >
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          flexShrink: 0,
                          background: selected ? COLOR.purple : COLOR.borderLight,
                          color: selected ? '#fff' : COLOR.textSecondary,
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        {letter}
                      </span>
                      <span style={{ fontWeight: selected ? 700 : 400, color: COLOR.text }}>{formatMathText(choice)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={goPrev} disabled={currentIdx === 0} style={{ ...navBtn, opacity: currentIdx === 0 ? 0.3 : 1 }}>
              ← Previous
            </button>
            <button type="button" onClick={() => setShowNav(true)} style={{ ...navBtn, background: '#f1f5f9' }}>
              📋 {totalAnswered}/{questions.length}
            </button>
            {currentIdx < questions.length - 1 ? (
              <button type="button" onClick={goNext} style={navBtn}>Next →</button>
            ) : (
              <button type="button" onClick={submitTest} style={{ ...actionBtn('#22c55e'), fontSize: 14 }}>Submit Test ✓</button>
            )}
          </div>

          {totalAnswered === questions.length && currentIdx < questions.length - 1 && (
            <button type="button" onClick={submitTest} style={{ ...actionBtn('#22c55e'), marginTop: 16, fontSize: 14, width: '100%', maxWidth: 600 }}>
              All Questions Answered — Submit Test ✓
            </button>
          )}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
          <SkeletonLoader variant="card" />
          <div style={{ marginTop: 16 }}>
            <SkeletonLoader variant="text" count={4} />
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
