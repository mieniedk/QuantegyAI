import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { queryBank } from '../data/testBank';
import { TEKS_STANDARDS } from '../data/teks';
import { getAllConcepts, getConceptById, getTeksForConcept } from '../data/taxonomy';
import { recordResult, getMasteryLevel, getAccuracy, MASTERY_COLORS, MASTERY_LABELS } from '../utils/conceptTracker';
import { saveGameResult, findMatchingAssignment } from '../utils/storage';
import QBotExplainer from '../components/QBotExplainer';
import BaseTenBlocks, { parseBaseTenBlocks } from '../components/BaseTenBlocks';
import MiniLesson from '../components/MiniLesson';
import { getLecture } from '../data/lectures';

const WARMUP_COUNT = 5; // questions per warm-up

// ─── Shuffle helper ───────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Encouraging messages ─────────────────────────────────────
const CORRECT_MSGS = [
  'Correct setup and computation.',
  'Correct answer - your math steps are aligned.',
  'Nice work: expression and value match.',
  'Strong solve: your operation sequence is correct.',
];
const WRONG_MSGS = [
  'Not correct yet - compare your operation choice to the prompt.',
  'Check the setup first, then recompute.',
  'Rebuild the equation carefully and verify each step.',
  'Close - recheck signs, units, or place value.',
];
const PERFECT_MSGS = [
  'Perfect score - consistent math reasoning across all items.',
  'Flawless run - every setup and calculation checked out.',
  'Full accuracy - your work stayed precise start to finish.',
];
const GOOD_MSGS = [
  'Strong performance - most items were mathematically sound.',
  'Good accuracy - tighten one or two setup steps.',
  'Nice result - small arithmetic checks will raise it further.',
];
const OK_MSGS = [
  'You are building skill - focus on equation setup and verification.',
  'Progress made - rework missed items line by line for accuracy.',
];
const NEEDS_WORK_MSGS = [
  'Use worked solutions to rebuild each problem structure, then retry.',
  'Focus on one missed concept at a time and verify with substitution.',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ─── Review Item sub-component (avoids useState-in-map) ──────
const ReviewItem = ({ q, r }) => {
  const [expanded, setExpanded] = React.useState(!r.correct);
  const borderColor = r.correct ? '#bbf7d0' : r.skipped ? '#fde68a' : '#fecaca';
  const bgColor = r.correct ? '#f0fdf4' : r.skipped ? '#fffbeb' : '#fef2f2';
  const icon = r.correct ? '✅' : r.skipped ? '⏭️' : '❌';
  const textColor = r.correct ? '#065f46' : r.skipped ? '#92400e' : '#991b1b';

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Question header */}
      <div
        style={{
          padding: '12px 14px',
          background: bgColor,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
            {icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: '0 0 4px', fontSize: 14, fontWeight: 600,
              color: textColor,
            }}>
              {q.question || q.statement}
            </p>
            {r.skipped && (
              <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>
                Skipped {' · '}Correct: <strong>{r.correctAnswer}) {q.options?.[r.correctAnswer]}</strong>
              </p>
            )}
            {!r.correct && !r.skipped && (
              <p style={{ margin: 0, fontSize: 13, color: '#b91c1c' }}>
                Your answer: <strong>{r.userAnswer}) {q.options?.[r.userAnswer]}</strong>
                {' · '}Correct: <strong>{r.correctAnswer}) {q.options?.[r.correctAnswer]}</strong>
              </p>
            )}
          </div>
          <span style={{
            fontSize: 12, color: '#94a3b8', flexShrink: 0, marginTop: 3,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}>▼</span>
        </div>
      </div>

      {/* Expandable QBot explanation */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f1f5f9' }}>
          <QBotExplainer
            question={q.question || q.statement}
            explanation={q.explanation}
            misconception={!r.correct ? q.misconception : null}
            correctAnswer={q.options?.[q.correct] || q.correct}
          />
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// WARM-UP COMPONENT
// ═══════════════════════════════════════════════════════════════

const WarmUp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const teks = searchParams.get('teks') || '';
  const grade = searchParams.get('grade') || 'grade3';
  const conceptId = searchParams.get('concept') || '';
  // Resolve student identity: URL params first, then fall back to saved session
  const _session = (() => {
    try {
      const saved = localStorage.getItem('quantegy-student-session');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  })();
  const studentId = searchParams.get('sid') || _session?.studentId || '';
  const classId = searchParams.get('cid') || _session?.classId || '';
  const label = searchParams.get('label') || '';

  // Load questions
  const questions = useMemo(() => {
    let pool = queryBank({ teks, grade, format: 'multiple-choice' });
    if (pool.length < WARMUP_COUNT) {
      // Fall back to any MC questions for this grade
      pool = queryBank({ grade, format: 'multiple-choice' });
    }
    return shuffle(pool).slice(0, WARMUP_COUNT);
  }, [teks, grade]);

  // State
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // { correct, message, explanation }
  const [results, setResults] = useState([]); // { questionId, correct, userAnswer, correctAnswer }
  const [phase, setPhase] = useState('intro'); // intro | playing | summary
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null); // for MiniLesson modal

  // Standard description
  const allStandards = TEKS_STANDARDS[grade] || [];
  const standard = allStandards.find((s) => s.id === teks);
  const concept = conceptId ? getConceptById(conceptId) : null;
  const displayLabel = label || concept?.label || standard?.description || teks;

  const startWarmUp = () => {
    setPhase('playing');
    setCurrent(0);
    setSelected(null);
    setFeedback(null);
    setResults([]);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  const handleSelect = (optionKey) => {
    if (feedback) return; // already answered
    setSelected(optionKey);

    const q = questions[current];
    const isCorrect = optionKey === q.correct;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    setFeedback({
      correct: isCorrect,
      message: isCorrect ? pick(CORRECT_MSGS) : pick(WRONG_MSGS),
      explanation: q.explanation || null,
      misconception: !isCorrect ? q.misconception : null,
      correctAnswer: q.correct,
      correctText: q.options?.[q.correct] || '',
    });

    setResults((prev) => [...prev, {
      questionId: q.id,
      teks: q.teks,
      correct: isCorrect,
      userAnswer: optionKey,
      correctAnswer: q.correct,
      time: timeSpent,
    }]);

    // Record to concept tracker
    if (conceptId) {
      recordResult(conceptId, { correct: isCorrect, time: timeSpent, gameId: 'warmup' });
    } else {
      // Try to find concept by TEKS
      const concepts = getAllConcepts(grade);
      const matched = concepts.filter((c) => c.standardCode === q.teks);
      for (const c of matched) {
        recordResult(c.conceptId, { correct: isCorrect, time: timeSpent, gameId: 'warmup' });
      }
    }
  };

  const handleSkip = () => {
    if (feedback) return;
    const q = questions[current];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    setSelected(null);
    setFeedback({
      correct: false,
      skipped: true,
      message: 'Skipped - use the explanation to model the correct setup before the next item.',
      explanation: q.explanation || null,
      misconception: q.misconception || null,
      correctAnswer: q.correct,
      correctText: q.options?.[q.correct] || '',
    });

    setResults((prev) => [...prev, {
      questionId: q.id,
      teks: q.teks,
      correct: false,
      skipped: true,
      userAnswer: null,
      correctAnswer: q.correct,
      time: timeSpent,
    }]);

    // Record as incorrect to concept tracker so it surfaces for review
    if (conceptId) {
      recordResult(conceptId, { correct: false, time: timeSpent, gameId: 'warmup' });
    } else {
      const concepts = getAllConcepts(grade);
      const matched = concepts.filter((c) => c.standardCode === q.teks);
      for (const c of matched) {
        recordResult(c.conceptId, { correct: false, time: timeSpent, gameId: 'warmup' });
      }
    }
  };

  const nextQuestion = () => {
    if (current + 1 >= questions.length) {
      // Save aggregate result for gradebook
      const correct = results.filter((r) => r.correct).length;
      const pctScore = Math.round((correct / results.length) * 100);
      const totalTime = Math.round((Date.now() - startTime) / 1000);

      if (studentId) {
        let resolvedAid = '';
        if (classId) {
          const match = findMatchingAssignment(classId, 'math-sprint', teks);
          if (match) resolvedAid = match.id;
        }
        saveGameResult({
          studentId,
          assignmentId: resolvedAid || `unassigned-${Date.now()}`,
          classId: classId || '',
          gameId: 'warmup', teks,
          score: pctScore, correct, total: results.length,
          time: totalTime, grade,
        });
      }

      setPhase('summary');
    } else {
      setCurrent(current + 1);
      setSelected(null);
      setFeedback(null);
      setQuestionStartTime(Date.now());
    }
  };

  const goToPractice = () => {
    const params = new URLSearchParams();
    params.set('phase', 'diagnostic');
    if (teks) params.set('teks', teks);
    if (label) params.set('label', label);
    if (conceptId) params.set('concept', conceptId);
    if (grade) params.set('grade', grade);
    if (studentId) params.set('sid', studentId);
    if (classId) params.set('cid', classId);
    const mode = pct < 70 ? 'remedial' : 'adaptive';
    params.set('mode', mode);
    navigate('/practice-loop?' + params.toString());
  };

  const goBack = () => {
    navigate('/student');
  };

  const goToFeed = () => {
    navigate('/student?tab=feed');
  };

  // ── Summary stats ──
  const totalCorrect = results.filter((r) => r.correct).length;
  const totalSkipped = results.filter((r) => r.skipped).length;
  const pct = results.length > 0 ? Math.round((totalCorrect / results.length) * 100) : 0;
  const totalTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
  const masteryAfter = conceptId ? getMasteryLevel(conceptId) : null;
  const accuracyAfter = conceptId ? getAccuracy(conceptId) : null;

  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════

  if (questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h2 style={{ color: '#0f172a', margin: '0 0 8px' }}>No questions available</h2>
          <p style={{ color: '#64748b', margin: '0 0 20px' }}>
            There aren&apos;t enough warm-up questions for {teks || 'this standard'} yet.
          </p>
          <Link to="/student" style={{
            padding: '10px 24px', background: '#2563eb', color: '#fff',
            borderRadius: 10, textDecoration: 'none', fontWeight: 700,
          }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top bar */}
      <div style={{
        padding: '10px 20px', background: '#fff', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button type="button" onClick={goBack} style={{
          background: 'none', border: 'none', color: '#2563eb',
          fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 18 }}>&larr;</span> Dashboard
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          Warm-Up <span style={{ color: '#f59e0b' }}>Assessment</span>
        </span>
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* ════════════════════════════════════════════
            INTRO SCREEN
            ════════════════════════════════════════════ */}
        {phase === 'intro' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              padding: '36px 28px', marginBottom: 24,
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
              borderRadius: 24, color: '#fff',
              boxShadow: '0 8px 32px rgba(245,158,11,0.25)',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px', fontSize: 36,
              }}>
                🔥
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800 }}>Quick Warm-Up</h1>
              <p style={{ margin: 0, fontSize: 15, opacity: 0.9 }}>
                {WARMUP_COUNT} quick questions to check your understanding
              </p>
            </div>

            <div style={{
              background: '#fff', borderRadius: 16, padding: '24px 22px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
              marginBottom: 20, textAlign: 'left',
            }}>
              {teks && (
                <div style={{
                  display: 'inline-block', padding: '4px 12px', background: '#e8f0fe',
                  color: '#1a5cba', borderRadius: 6, fontSize: 13, fontWeight: 700, marginBottom: 10,
                }}>
                  TEKS {teks}
                </div>
              )}
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                {displayLabel}
              </h2>
              {standard?.description && (
                <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                  {standard.description}
                </p>
              )}
            </div>

            <div style={{
              background: '#fff', borderRadius: 14, padding: '18px 22px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
              marginBottom: 24, textAlign: 'left',
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#475569' }}>What to expect:</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { icon: '📝', text: `${WARMUP_COUNT} multiple-choice questions` },
                  { icon: '⏱️', text: 'Takes about 2-3 minutes' },
                  { icon: '💡', text: 'Instant feedback after each question' },
                  { icon: '📊', text: 'See your mastery level at the end' },
                ].map((item) => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span style={{ fontSize: 14, color: '#334155' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" onClick={startWarmUp} style={{
              width: '100%', padding: '16px 24px', fontSize: 18, fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
              transition: 'transform 0.15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Start Warm-Up
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════
            QUESTION SCREEN
            ════════════════════════════════════════════ */}
        {phase === 'playing' && questions[current] && (() => {
          const q = questions[current];
          return (
            <div>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
                {questions.map((_, i) => {
                  const r = results[i];
                  let bg = '#e2e8f0';
                  if (r?.correct === true) bg = '#22c55e';
                  else if (r?.skipped) bg = '#f59e0b';
                  else if (r?.correct === false) bg = '#ef4444';
                  else if (i === current) bg = '#f59e0b';
                  return (
                    <div key={i} style={{
                      width: i === current ? 32 : 12, height: 12, borderRadius: 6,
                      background: bg, transition: 'all 0.3s',
                    }} />
                  );
                })}
              </div>

              {/* Question counter */}
              <div style={{
                textAlign: 'center', marginBottom: 16, fontSize: 13, fontWeight: 700, color: '#94a3b8',
              }}>
                Question {current + 1} of {questions.length}
                {q.teks && (
                  <span style={{
                    marginLeft: 8, padding: '2px 8px', background: '#e8f0fe',
                    color: '#1a5cba', borderRadius: 4, fontSize: 11, fontWeight: 700,
                  }}>{q.teks}</span>
                )}
              </div>

              {/* Question card */}
              {(() => {
                const baseTenData = parseBaseTenBlocks(q.question || q.statement || '');
                return (
                  <div style={{
                    background: '#fff', borderRadius: 18, padding: '28px 24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                    marginBottom: 16,
                  }}>
                    <p style={{
                      margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a',
                      lineHeight: 1.5,
                    }}>
                      {q.question || q.statement}
                    </p>
                    {baseTenData && (
                      <div style={{ marginTop: 14 }}>
                        <BaseTenBlocks
                          thousands={baseTenData.thousands}
                          hundreds={baseTenData.hundreds}
                          tens={baseTenData.tens}
                          ones={baseTenData.ones}
                          size="md"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Options */}
              <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                {Object.entries(q.options || {}).map(([key, value]) => {
                  const isSelected = selected === key;
                  const isCorrectAnswer = feedback?.correctAnswer === key;
                  const isWrongSelection = feedback && isSelected && !feedback.correct;

                  let bg = '#fff';
                  let border = '2px solid #e2e8f0';
                  let color = '#0f172a';

                  if (feedback) {
                    if (isCorrectAnswer) {
                      bg = '#ecfdf5';
                      border = '2px solid #22c55e';
                      color = '#065f46';
                    } else if (isWrongSelection) {
                      bg = '#fef2f2';
                      border = '2px solid #ef4444';
                      color = '#991b1b';
                    } else {
                      bg = '#f8fafc';
                      border = '2px solid #f1f5f9';
                      color = '#94a3b8';
                    }
                  } else if (isSelected) {
                    bg = '#eff6ff';
                    border = '2px solid #2563eb';
                    color = '#1e40af';
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelect(key)}
                      disabled={!!feedback}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '16px 18px', borderRadius: 14,
                        background: bg, border, color,
                        cursor: feedback ? 'default' : 'pointer',
                        textAlign: 'left', fontSize: 16, fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800,
                        background: feedback
                          ? (isCorrectAnswer ? '#22c55e' : isWrongSelection ? '#ef4444' : '#f1f5f9')
                          : (isSelected ? '#2563eb' : '#f1f5f9'),
                        color: (feedback && (isCorrectAnswer || isWrongSelection)) || isSelected ? '#fff' : '#64748b',
                      }}>
                        {feedback && isCorrectAnswer ? '✓' : feedback && isWrongSelection ? '✗' : key}
                      </span>
                      <span>{value}</span>
                    </button>
                  );
                })}
              </div>

              {/* Skip button — only visible before answering */}
              {!feedback && (
                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={handleSkip}
                    style={{
                      padding: '8px 20px', borderRadius: 8,
                      background: 'none', border: '1.5px solid #e2e8f0',
                      color: '#94a3b8', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#64748b'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    Skip this question →
                  </button>
                </div>
              )}

              {/* Feedback banner */}
              {feedback && (
                <div style={{ animation: 'fadeInSlide 0.3s ease', marginBottom: 16 }}>
                  {/* Correct/Incorrect/Skipped header */}
                  <div style={{
                    padding: '14px 18px', borderRadius: '14px 14px 0 0',
                    background: feedback.correct
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : feedback.skipped
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                      {feedback.correct ? '✅' : feedback.skipped ? '⏭️' : '❌'} {feedback.message}
                    </div>
                    {!feedback.correct && (
                      <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>
                        The correct answer is <strong>{feedback.correctAnswer}) {feedback.correctText}</strong>
                      </div>
                    )}
                  </div>

                  {/* QBot Teacher explanation with chalkboard */}
                  <QBotExplainer
                    question={questions[current]?.question}
                    explanation={feedback.explanation}
                    misconception={feedback.misconception}
                    correctAnswer={feedback.correctText || feedback.correctAnswer}
                  />
                </div>
              )}

              {/* Next button */}
              {feedback && (
                <button type="button" onClick={nextQuestion} style={{
                  width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 800,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
                  transition: 'transform 0.15s',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
                </button>
              )}
            </div>
          );
        })()}

        {/* ════════════════════════════════════════════
            SUMMARY SCREEN
            ════════════════════════════════════════════ */}
        {phase === 'summary' && (
          <div>
            {/* Score hero */}
            <div style={{
              textAlign: 'center', padding: '32px 24px', marginBottom: 20,
              background: pct >= 80
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : pct >= 60
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: 24, color: '#fff',
              boxShadow: `0 8px 32px ${pct >= 80 ? 'rgba(34,197,94,0.3)' : pct >= 60 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>
                {pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'}
              </div>
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
                {totalCorrect}/{questions.length}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4, opacity: 0.9 }}>
                {pct}% Correct
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 15, opacity: 0.85 }}>
                {pct === 100 ? pick(PERFECT_MSGS)
                  : pct >= 80 ? pick(GOOD_MSGS)
                    : pct >= 50 ? pick(OK_MSGS)
                      : pick(NEEDS_WORK_MSGS)}
              </p>
              <div style={{
                marginTop: 12, display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13, opacity: 0.8,
              }}>
                <span>⏱ {totalTime}s</span>
                <span>📝 {questions.length} questions</span>
                {totalSkipped > 0 && <span>⏭️ {totalSkipped} skipped</span>}
              </div>
            </div>

            {/* Mastery level card */}
            {conceptId && masteryAfter && (
              <div style={{
                background: '#fff', borderRadius: 16, padding: '18px 22px', marginBottom: 16,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 2 }}>
                    Your Mastery Level
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 800,
                    color: MASTERY_COLORS[masteryAfter],
                  }}>
                    {MASTERY_LABELS[masteryAfter]}
                  </div>
                  {accuracyAfter !== null && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      Overall accuracy: {accuracyAfter}%
                    </div>
                  )}
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: `conic-gradient(${MASTERY_COLORS[masteryAfter]} ${(accuracyAfter || 0) * 3.6}deg, #e2e8f0 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: MASTERY_COLORS[masteryAfter],
                  }}>
                    {accuracyAfter ?? 0}%
                  </div>
                </div>
              </div>
            )}

            {/* Question-by-question review */}
            <div style={{
              background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
            }}>
              <h3 style={{
                margin: '0 0 14px', fontSize: 17, fontWeight: 800, color: '#0f172a',
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                padding: '10px 16px', borderRadius: 10, border: '1px solid #fbbf24',
              }}>
                <span style={{ fontSize: 20 }}>📝</span> Review Your Answers
              </h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {questions.map((q, i) => {
                  const r = results[i];
                  if (!r) return null;
                  return <ReviewItem key={q.id} q={q} r={r} />;
                })}
              </div>
            </div>

            {/* ── QBot's Recommendation — What to do next ── */}
            {pct < 100 && (() => {
              const missedCount = results.filter((r) => !r.correct && !r.skipped).length;
              const lecture = teks ? getLecture(teks) : null;
              return (
                <div style={{
                  background: '#fff', borderRadius: 16, padding: '20px 22px', marginBottom: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)', border: '2px solid #bfdbfe',
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22,
                    }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                        QBot's Recommendation
                      </div>
                      <p style={{ margin: '0 0 12px', fontSize: 14, color: '#1e293b', lineHeight: 1.5, fontWeight: 600 }}>
                        {pct < 50
                          ? `You missed ${missedCount} question${missedCount !== 1 ? 's' : ''}${totalSkipped > 0 ? ` and skipped ${totalSkipped}` : ''}. Let me teach you this topic first, then try the practice game!`
                          : pct < 80
                            ? `You are close${totalSkipped > 0 ? ` (${totalSkipped} skipped)` : ''} - review the missed math setup, then use game practice to reinforce it.`
                            : `Almost perfect${totalSkipped > 0 ? ` (${totalSkipped} skipped)` : ''}! A quick practice game will help you master this topic.`}
                      </p>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {/* Step 1: Learn (if lesson available and scored < 80%) */}
                        {lecture && pct < 80 && (
                          <button type="button" onClick={() => {
                            setActiveLecture({ lecture, concept: concept || { label: displayLabel, standardCode: teks }, teks });
                          }} style={{
                            width: '100%', padding: '12px 20px', fontSize: 14, fontWeight: 700,
                            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(37,99,235,0.25)',
                            display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                          }}>
                            <span>📚</span> Learn This Topic with QBot
                          </button>
                        )}
                        {/* Step 2: Practice Game */}
                        <button type="button" onClick={goToPractice} style={{
                          width: '100%', padding: '12px 20px', fontSize: 14, fontWeight: 700,
                          background: lecture && pct < 80
                            ? '#fff' : 'linear-gradient(135deg, #059669, #047857)',
                          color: lecture && pct < 80 ? '#059669' : '#fff',
                          border: lecture && pct < 80 ? '2px solid #059669' : 'none',
                          borderRadius: 10, cursor: 'pointer',
                          boxShadow: lecture && pct < 80 ? 'none' : '0 2px 10px rgba(5,150,105,0.25)',
                          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                        }}>
                          <span>🎮</span> Practice with Games
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Action buttons */}
            <div style={{ display: 'grid', gap: 10 }}>
              <button type="button" onClick={goToFeed} style={{
                width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(124,58,237,0.3)',
              }}>
                💬 Continue to Discussions & Feed
              </button>
              <button type="button" onClick={startWarmUp} style={{
                width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 700,
                background: pct >= 80 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#fff',
                color: pct >= 80 ? '#fff' : '#2563eb',
                border: pct >= 80 ? 'none' : '2px solid #2563eb',
                borderRadius: 12, cursor: 'pointer',
              }}>
                🔄 Retake Warm-Up
              </button>
              <button type="button" onClick={goBack} style={{
                width: '100%', padding: '12px 24px', fontSize: 15, fontWeight: 600,
                background: '#f1f5f9', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: 12, cursor: 'pointer',
              }}>
                ← Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MiniLesson modal ── */}
      {activeLecture && (
        <MiniLesson
          lecture={activeLecture.lecture}
          concept={activeLecture.concept}
          teks={activeLecture.teks}
          onClose={() => setActiveLecture(null)}
          onPractice={() => {
            setActiveLecture(null);
            goToPractice();
          }}
          onWarmUp={() => {
            setActiveLecture(null);
            startWarmUp();
          }}
        />
      )}
    </div>
  );
};

export default WarmUp;
