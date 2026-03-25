import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { STAAR_QUESTIONS, STAAR_REPORTING_CATEGORIES, STAAR_TEST_CONFIG } from '../data/staar-questions';
import qbotImg from '../assets/qbot.svg';
import SkeletonLoader from '../components/SkeletonLoader';

/* ═══════════════════════════════════════════════════════════════
   STAAR TEST PREP — Grade 3 Math
   Full practice test, category drills, readiness tracker
   Mirrors the real STAAR format
   ═══════════════════════════════════════════════════════════════ */

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

const STAAR_DATE_2026 = new Date(2026, 3, 7); // April 7, 2026

function daysUntilSTAAR() {
  const now = new Date();
  const diff = STAAR_DATE_2026 - now;
  if (diff < 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStorageKey() { return 'allen-ace-staar-results'; }
function loadResults() { try { return JSON.parse(localStorage.getItem(getStorageKey()) || '[]'); } catch { return []; } }
function saveResult(result) { const all = loadResults(); all.push({ ...result, timestamp: Date.now() }); localStorage.setItem(getStorageKey(), JSON.stringify(all)); }

function getReadinessLevel(score, total) {
  const pct = total > 0 ? score / total : 0;
  const cfg = STAAR_TEST_CONFIG.grade3;
  if (pct >= cfg.masteringScore) return { label: 'Masters', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' };
  if (pct >= cfg.passingScore) return { label: 'Meets', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (pct >= cfg.approachingScore) return { label: 'Approaches', color: '#eab308', bg: 'rgba(234,179,8,0.1)' };
  return { label: 'Did Not Meet', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
}

function buildFullTest() {
  const cfg = STAAR_TEST_CONFIG.grade3;
  const questions = [];
  for (const [catId, count] of Object.entries(cfg.categoryDistribution)) {
    const pool = STAAR_QUESTIONS.filter(q => q.cat === catId);
    const picked = shuffle(pool).slice(0, count);
    questions.push(...picked);
  }
  return shuffle(questions).slice(0, cfg.totalQuestions);
}

function buildCategoryDrill(catId, count = 10) {
  const pool = STAAR_QUESTIONS.filter(q => q.cat === catId);
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

/* ═══════════════════════════════════════════════════════════════ */
export default function STAARPrep() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('home'); // home | test | drill | results | history
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [gridInput, setGridInput] = useState('');
  const [multiSelect, setMultiSelect] = useState([]);
  const [drillCat, setDrillCat] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(null);
  const [flagged, setFlagged] = useState(new Set());
  const [showNav, setShowNav] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (mode === 'test' && startTime && !submitted) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [mode, startTime, submitted]);

  const startFullTest = useCallback(() => {
    const qs = buildFullTest();
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setGridInput('');
    setMultiSelect([]);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setMode('test');
  }, []);

  const startDrill = useCallback((catId) => {
    const qs = buildCategoryDrill(catId);
    setQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setSubmitted(false);
    setGridInput('');
    setMultiSelect([]);
    setDrillCat(catId);
    setFlagged(new Set());
    setStartTime(Date.now());
    setElapsed(0);
    setShowExplanation(null);
    setMode('drill');
  }, []);

  const answerQuestion = useCallback((qId, answer) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  }, []);

  const handleMCAnswer = useCallback((choice) => {
    const q = questions[currentIdx];
    answerQuestion(q.id, choice);
  }, [questions, currentIdx, answerQuestion]);

  const handleGridSubmit = useCallback(() => {
    const q = questions[currentIdx];
    answerQuestion(q.id, gridInput.trim());
    setGridInput('');
  }, [questions, currentIdx, gridInput, answerQuestion]);

  const handleMultiToggle = useCallback((choice) => {
    setMultiSelect(prev => prev.includes(choice) ? prev.filter(c => c !== choice) : [...prev, choice]);
  }, []);

  const handleMultiSubmit = useCallback(() => {
    const q = questions[currentIdx];
    answerQuestion(q.id, [...multiSelect].sort());
    setMultiSelect([]);
  }, [questions, currentIdx, multiSelect, answerQuestion]);

  const toggleFlag = useCallback(() => {
    const q = questions[currentIdx];
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id); else next.add(q.id);
      return next;
    });
  }, [questions, currentIdx]);

  const goNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setGridInput('');
      setMultiSelect([]);
      setShowExplanation(null);
    }
  }, [currentIdx, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setGridInput('');
      setMultiSelect([]);
      setShowExplanation(null);
    }
  }, [currentIdx]);

  const goToQuestion = useCallback((idx) => {
    setCurrentIdx(idx);
    setGridInput('');
    setMultiSelect([]);
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

    saveResult({
      mode: mode === 'test' ? 'full' : 'drill',
      category: drillCat || 'all',
      score,
      total: questions.length,
      timeSeconds: elapsed,
      answers: { ...answers },
    });
    setCurrentIdx(0);
  }, [questions, answers, elapsed, mode, drillCat]);

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

  const totalCorrect = submitted ? questions.filter(q => isCorrect(q)).length : 0;

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* ── Home screen ── */
  if (mode === 'home') {
    const days = daysUntilSTAAR();
    const history = loadResults();
    const fullTests = history.filter(r => r.mode === 'full');
    const lastTest = fullTests[fullTests.length - 1];
    const lastReadiness = lastTest ? getReadinessLevel(lastTest.score, lastTest.total) : null;

    const catStats = STAAR_REPORTING_CATEGORIES.map(cat => {
      const catResults = history.filter(r => r.category === cat.id || r.mode === 'full');
      const totalQ = catResults.reduce((s, r) => {
        if (r.mode === 'full') {
          const qs = STAAR_QUESTIONS.filter(q => q.cat === cat.id);
          return s + qs.filter(q => r.answers[q.id] !== undefined).length;
        }
        return s + r.total;
      }, 0);
      const totalCorrect = catResults.reduce((s, r) => {
        if (r.mode === 'full') {
          const qs = STAAR_QUESTIONS.filter(q => q.cat === cat.id);
          return s + qs.filter(q => {
            const a = r.answers[q.id];
            if (!a) return false;
            if (q.type === 'multi') return JSON.stringify([...q.answer].sort()) === JSON.stringify([...(Array.isArray(a) ? a : [])].sort());
            return String(a) === String(q.answer);
          }).length;
        }
        return s + r.score;
      }, 0);
      return { ...cat, totalQ, totalCorrect, pct: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : null };
    });

    return (
      <div style={pageStyle}>
        <Link to="/games" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 600, alignSelf: 'flex-start', marginBottom: 12 }}>← Back to Games</Link>

        <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 4, textAlign: 'center' }}>📋 STAAR Test Prep</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, textAlign: 'center' }}>Grade 3 Mathematics</div>

        {/* STAAR countdown */}
        <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#1e1b4b)', borderRadius: 16, padding: '20px 24px', width: '100%', maxWidth: 500, marginBottom: 20, color: '#fff', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <img src={qbotImg} alt="QBot" style={{ width: 32, borderRadius: '50%', border: '2px solid #3b82f6' }} />
            <span style={{ fontSize: 14, fontWeight: 700 }}>STAAR Math — April 7, 2026</span>
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: days <= 30 ? '#fbbf24' : '#60a5fa' }}>
            {days > 0 ? days : 'Today!'}
          </div>
          <div style={{ fontSize: 12, color: '#93c5fd' }}>{days > 0 ? 'days until STAAR' : 'STAAR day is here!'}</div>
        </div>

        {/* HB 8 transition banner */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', width: '100%', maxWidth: 500, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📢</span>
          <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
            <strong>Coming 2027-28:</strong> Texas HB 8 will replace STAAR with the <strong>Student Success Tool</strong> — three shorter adaptive tests (BOY, MOY, EOY) spread across the year. STAAR remains active through 2026-27. We'll update this platform when the new format launches.
          </div>
        </div>

        {/* Readiness badge */}
        {lastReadiness && (
          <div style={{ background: lastReadiness.bg, border: `2px solid ${lastReadiness.color}`, borderRadius: 14, padding: '14px 20px', width: '100%', maxWidth: 500, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Last Practice Test</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: lastReadiness.color }}>{lastReadiness.label}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{lastTest.score} / {lastTest.total} correct ({Math.round(lastTest.score / lastTest.total * 100)}%)</div>
          </div>
        )}

        {/* Modes */}
        <div style={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button type="button" onClick={startFullTest} style={{ ...bigBtn, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
            <span style={{ fontSize: 24 }}>📝</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Full Practice Test</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>36 questions • All categories • Timed</div>
            </div>
          </button>
        </div>

        {/* Category drills */}
        <div style={{ width: '100%', maxWidth: 500, marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Category Drills</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {STAAR_REPORTING_CATEGORIES.map((cat, i) => {
              const stat = catStats[i];
              const pctColor = stat.pct === null ? '#94a3b8' : stat.pct >= 75 ? '#22c55e' : stat.pct >= 55 ? '#eab308' : '#ef4444';
              return (
                <button type="button" key={cat.id} onClick={() => startDrill(cat.id)} style={{
                  padding: '14px 12px', background: '#fff', borderRadius: 12,
                  border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb' }}>Category {i + 1}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{cat.name}</div>
                  {stat.pct !== null ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${stat.pct}%`, background: pctColor, borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: pctColor }}>{stat.pct}%</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Not attempted yet</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Recent Practice</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.slice(-5).reverse().map((r, i) => {
                const readiness = getReadinessLevel(r.score, r.total);
                const catName = r.mode === 'full' ? 'Full Test' : STAAR_REPORTING_CATEGORIES.find(c => c.id === r.category)?.name || r.category;
                return (
                  <div key={i} style={{ padding: '12px 16px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{catName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(r.timestamp).toLocaleDateString()} • {fmtTime(r.timeSeconds)}</div>
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
    );
  }

  /* ── Test / Drill mode ── */
  if ((mode === 'test' || mode === 'drill') && questions.length > 0) {
    const q = questions[currentIdx];
    const answered = answers[q.id] !== undefined;
    const totalAnswered = Object.keys(answers).length;
    const catName = mode === 'drill'
      ? STAAR_REPORTING_CATEGORIES.find(c => c.id === drillCat)?.name
      : 'Full Practice Test';

    if (submitted) {
      const readiness = getReadinessLevel(totalCorrect, questions.length);
      const catBreakdown = STAAR_REPORTING_CATEGORIES.map(cat => {
        const catQs = questions.filter(q => q.cat === cat.id);
        const catCorrect = catQs.filter(q => isCorrect(q)).length;
        return { ...cat, total: catQs.length, correct: catCorrect };
      }).filter(c => c.total > 0);

      return (
        <div style={pageStyle}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', marginBottom: 4, textAlign: 'center' }}>📋 Results</div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20, textAlign: 'center' }}>{catName}</div>

          {/* Score + Readiness */}
          <div style={{ background: readiness.bg, border: `2px solid ${readiness.color}`, borderRadius: 16, padding: '24px 20px', width: '100%', maxWidth: 500, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: readiness.color }}>{totalCorrect}/{questions.length}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{Math.round(totalCorrect / questions.length * 100)}% • {fmtTime(elapsed)}</div>
            <div style={{ display: 'inline-block', padding: '6px 20px', borderRadius: 20, background: readiness.color, color: '#fff', fontSize: 14, fontWeight: 800 }}>
              {readiness.label} Grade Level
            </div>
          </div>

          {/* Category breakdown */}
          {catBreakdown.length > 1 && (
            <div style={{ width: '100%', maxWidth: 500, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>By Reporting Category</div>
              {catBreakdown.map(cat => {
                const pct = Math.round((cat.correct / cat.total) * 100);
                const col = pct >= 75 ? '#22c55e' : pct >= 55 ? '#eab308' : '#ef4444';
                return (
                  <div key={cat.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{cat.name}</span>
                      <span style={{ fontWeight: 800, color: col }}>{cat.correct}/{cat.total} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 6 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 6, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Question review */}
          <div style={{ width: '100%', maxWidth: 500, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>Question Review</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questions.map((q, i) => {
                const correct = isCorrect(q);
                const studentAnswer = answers[q.id];
                return (
                  <div key={q.id} style={{ padding: '12px 14px', background: '#fff', borderRadius: 10, border: `1px solid ${correct ? '#bbf7d0' : '#fecaca'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: correct ? '#22c55e' : '#ef4444' }}>
                        {correct ? '✓' : '✗'} Q{i + 1} — {q.teks}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', marginBottom: 6, lineHeight: 1.4 }}>{q.q}</div>
                    {!correct && (
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        Your answer: <span style={{ color: '#ef4444', fontWeight: 700 }}>{Array.isArray(studentAnswer) ? studentAnswer.join(', ') : studentAnswer || 'Skipped'}</span>
                        {' • '}Correct: <span style={{ color: '#22c55e', fontWeight: 700 }}>{Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}</span>
                      </div>
                    )}
                    {showExplanation === q.id ? (
                      <div style={{ fontSize: 11, color: '#2563eb', marginTop: 6, lineHeight: 1.5, background: 'rgba(37,99,235,0.05)', padding: '8px 10px', borderRadius: 8 }}>
                        {q.explanation}
                        <button type="button" onClick={() => setShowExplanation(null)} style={{ ...linkBtn, marginLeft: 8 }}>Hide</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setShowExplanation(q.id)} style={{ ...linkBtn, marginTop: 4 }}>Show explanation</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button type="button" onClick={() => setMode('home')} style={actionBtn('#2563eb')}>Back to STAAR Prep</button>
            <button type="button" onClick={mode === 'test' ? startFullTest : () => startDrill(drillCat)} style={actionBtn('#7c3aed')}>Try Again</button>
          </div>
        </div>
      );
    }

    return (
      <div style={pageStyle}>
        {/* Question nav overlay */}
        {showNav && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowNav(false)}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '100%', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>Question Navigator</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {questions.map((q, i) => {
                  const hasAns = answers[q.id] !== undefined;
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = i === currentIdx;
                  return (
                    <button type="button" key={i} onClick={() => goToQuestion(i)} style={{
                      width: 42, height: 42, borderRadius: 8, border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: hasAns ? '#dbeafe' : '#fff', color: '#0f172a', fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {i + 1}
                      {isFlagged && <span style={{ position: 'absolute', top: -2, right: -2, fontSize: 10 }}>🚩</span>}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, fontSize: 11, color: '#64748b' }}>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#dbeafe', borderRadius: 3, marginRight: 4, verticalAlign: 'middle' }} /> Answered</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 3, marginRight: 4, verticalAlign: 'middle' }} /> Unanswered</span>
                <span>🚩 Flagged</span>
              </div>
            </div>
          </div>
        )}

        {/* Header bar */}
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>📋 {mode === 'test' ? 'STAAR Practice' : catName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            <span>⏱ {fmtTime(elapsed)}</span>
            <span>{totalAnswered}/{questions.length} answered</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', maxWidth: 600, marginBottom: 12 }}>
          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 4 }}>
            <div style={{ height: '100%', width: `${(totalAnswered / questions.length) * 100}%`, background: '#2563eb', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{ width: '100%', maxWidth: 600, background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>Question {currentIdx + 1} of {questions.length}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', padding: '2px 8px', background: '#f1f5f9', borderRadius: 6 }}>{q.teks}</span>
              <button type="button" onClick={toggleFlag} aria-label={flagged.has(q.id) ? 'Unflag question' : 'Flag question'} style={{ fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {flagged.has(q.id) ? '🚩' : '⚑'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.6, marginBottom: 20 }}>{q.q}</div>

          {/* MC options */}
          {q.type === 'mc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.choices.map((choice, i) => {
                const letter = String.fromCharCode(65 + i);
                const selected = answers[q.id] === choice;
                return (
                  <button type="button" key={i} onClick={() => handleMCAnswer(choice)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                    borderRadius: 10, border: selected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: selected ? 'rgba(37,99,235,0.05)' : '#fff',
                    cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#0f172a',
                  }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0,
                      background: selected ? '#2563eb' : '#f1f5f9', color: selected ? '#fff' : '#64748b',
                    }}>{letter}</span>
                    <span style={{ fontWeight: selected ? 700 : 400 }}>{choice}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Gridded response */}
          {q.type === 'grid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Type your answer:</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  aria-label="Type your answer"
                  value={answers[q.id] || gridInput}
                  onChange={e => { setGridInput(e.target.value); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleGridSubmit(); }}
                  style={{ flex: 1, padding: '12px 16px', fontSize: 18, fontWeight: 700, borderRadius: 10, border: '2px solid #e2e8f0', outline: 'none', textAlign: 'center' }}
                  placeholder="Enter number"
                />
                <button type="button" onClick={handleGridSubmit} style={actionBtn('#2563eb')}>Lock In</button>
              </div>
              {answers[q.id] !== undefined && (
                <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>Answer locked: {answers[q.id]}</div>
              )}
            </div>
          )}

          {/* Multi-select */}
          {q.type === 'multi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Select ALL that apply:</div>
              {q.choices.map((choice, i) => {
                const currentAnswer = answers[q.id];
                const isLocked = currentAnswer !== undefined;
                const selected = isLocked
                  ? (Array.isArray(currentAnswer) && currentAnswer.includes(choice))
                  : multiSelect.includes(choice);
                return (
                  <button type="button" key={i}
                    onClick={() => { if (!isLocked) handleMultiToggle(choice); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      borderRadius: 10, border: selected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      background: selected ? 'rgba(124,58,237,0.05)' : '#fff',
                      cursor: isLocked ? 'default' : 'pointer', textAlign: 'left', fontSize: 14, color: '#0f172a',
                    }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, flexShrink: 0, border: selected ? 'none' : '2px solid #cbd5e1',
                      background: selected ? '#7c3aed' : '#fff', color: selected ? '#fff' : '#64748b',
                    }}>{selected ? '✓' : ''}</span>
                    <span style={{ fontWeight: selected ? 700 : 400 }}>{choice}</span>
                  </button>
                );
              })}
              {answers[q.id] === undefined && (
                <button type="button" onClick={handleMultiSubmit} disabled={multiSelect.length === 0}
                  style={{ ...actionBtn('#7c3aed'), opacity: multiSelect.length === 0 ? 0.4 : 1, alignSelf: 'flex-end', marginTop: 4 }}>
                  Lock In Selection
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div style={{ width: '100%', maxWidth: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={goPrev} disabled={currentIdx === 0}
            style={{ ...navBtn, opacity: currentIdx === 0 ? 0.3 : 1 }}>← Previous</button>

          <button type="button" onClick={() => setShowNav(true)} style={{ ...navBtn, background: '#f1f5f9' }}>
            📋 {totalAnswered}/{questions.length}
          </button>

          {currentIdx < questions.length - 1 ? (
            <button type="button" onClick={goNext} style={navBtn}>Next →</button>
          ) : (
            <button type="button" onClick={submitTest}
              style={{ ...actionBtn('#22c55e'), fontSize: 14 }}>
              Submit Test ✓
            </button>
          )}
        </div>

        {/* Submit early */}
        {totalAnswered === questions.length && currentIdx < questions.length - 1 && (
          <button type="button" onClick={submitTest}
            style={{ ...actionBtn('#22c55e'), marginTop: 16, fontSize: 14, width: '100%', maxWidth: 600 }}>
            All Questions Answered — Submit Test ✓
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>
        <SkeletonLoader variant="card" />
        <div style={{ marginTop: 16 }}>
          <SkeletonLoader variant="text" count={4} />
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const pageStyle = { minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter","Segoe UI",system-ui,sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px' };
const bigBtn = { display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 14, border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' };
function actionBtn(bg) { return { padding: '10px 20px', background: bg, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }; }
const navBtn = { padding: '10px 18px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const linkBtn = { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: 11, fontWeight: 700, padding: 0 };
