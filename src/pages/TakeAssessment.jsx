import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getAssessment, getSubmission, startSubmission, saveAnswer, toggleFlag,
  submitAssessment, updateTimeSpent, logProctoringEvent, PROCTORING_LEVELS,
  QUESTION_TYPES, getStudentSubmissions,
} from '../utils/assessmentEngine';
import { trackPageView, trackAssignmentStart, trackAssignmentSubmit } from '../utils/activityTracker';
import { uploadFile } from '../utils/fileUpload';
import { saveQuizResponse } from '../utils/storage';
import RichTextEditor, { RichTextViewer } from '../components/RichTextEditor';
import SkeletonLoader from '../components/SkeletonLoader';

export default function TakeAssessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const timeRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [tabWarnings, setTabWarnings] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const proctoringRef = useRef(new Set());

  // Load assessment
  useEffect(() => {
    const a = getAssessment(assessmentId);
    if (!a) { setError('Assessment not found'); return; }
    if (a.status !== 'published') { setError('This assessment is not available yet'); return; }
    setAssessment(a);
  }, [assessmentId]);

  // Start or resume submission
  const handleStart = useCallback(() => {
    const studentId = localStorage.getItem('allen-ace-student-id') || 'guest';
    const studentName = localStorage.getItem('allen-ace-student-name') || 'Student';
    const sub = startSubmission(assessmentId, studentId, studentName);
    if (sub?.error) { setError(sub.error); return; }
    setSubmission(sub);
    trackPageView('assessment', assessmentId);
    trackAssignmentStart(assessmentId);

    if (assessment?.settings?.timeLimit > 0) {
      const elapsed = sub.startedAt ? Math.floor((Date.now() - new Date(sub.startedAt).getTime()) / 1000) : 0;
      const totalSeconds = assessment.settings.timeLimit * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      setTimeLeft(remaining);
    }
  }, [assessmentId, assessment]);

  // Timer
  useEffect(() => {
    if (!submission || submission.status !== 'in-progress') return;
    timerRef.current = setInterval(() => {
      timeRef.current++;
      if (timeRef.current % 30 === 0) updateTimeSpent(submission.id, timeRef.current);

      if (timeLeft !== null) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [submission, timeLeft]);

  // ─── Proctoring Hooks ──────────────────────────────────
  useEffect(() => {
    if (!submission || submission.status !== 'in-progress') return;
    const level = assessment?.settings?.proctoringLevel || 'none';
    if (level === 'none') return;
    const features = PROCTORING_LEVELS[level]?.features || [];

    const handlers = [];

    if (features.includes('tab-switch')) {
      const handler = () => {
        if (document.hidden) {
          setTabWarnings((prev) => prev + 1);
          logProctoringEvent(submission.id, { type: 'tab-switch', detail: 'Left assessment window' });
        }
      };
      document.addEventListener('visibilitychange', handler);
      handlers.push(() => document.removeEventListener('visibilitychange', handler));
    }

    if (features.includes('copy-paste')) {
      const copyHandler = (e) => {
        e.preventDefault();
        logProctoringEvent(submission.id, { type: 'copy-attempt', detail: 'Copy blocked' });
      };
      const pasteHandler = (e) => {
        e.preventDefault();
        logProctoringEvent(submission.id, { type: 'paste-attempt', detail: 'Paste blocked' });
      };
      document.addEventListener('copy', copyHandler);
      document.addEventListener('paste', pasteHandler);
      handlers.push(() => { document.removeEventListener('copy', copyHandler); document.removeEventListener('paste', pasteHandler); });
    }

    if (features.includes('right-click')) {
      const handler = (e) => {
        e.preventDefault();
        logProctoringEvent(submission.id, { type: 'right-click', detail: 'Right-click blocked' });
      };
      document.addEventListener('contextmenu', handler);
      handlers.push(() => document.removeEventListener('contextmenu', handler));
    }

    if (features.includes('fullscreen')) {
      const handler = () => {
        if (!document.fullscreenElement) {
          setIsFullscreen(false);
          logProctoringEvent(submission.id, { type: 'exit-fullscreen', detail: 'Left fullscreen mode' });
        }
      };
      document.addEventListener('fullscreenchange', handler);
      handlers.push(() => document.removeEventListener('fullscreenchange', handler));
    }

    proctoringRef.current = new Set(features);
    return () => handlers.forEach((h) => h());
  }, [submission, assessment]);

  const enterFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
  }, []);

  // ─── Submission ────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!submission) return;
    updateTimeSpent(submission.id, timeRef.current);
    const result = submitAssessment(submission.id);
    setSubmission(result);
    setShowConfirm(false);
    trackAssignmentSubmit(assessmentId, submission.id);
    if (document.fullscreenElement) document.exitFullscreen?.();

    try {
      const studentId = localStorage.getItem('allen-ace-student-id') || 'guest';
      saveQuizResponse({
        assessmentId,
        studentId,
        answers: (result.questions || []).map((q, i) => {
          const gradeInfo = result.gradeResult?.results?.[q.id];
          return {
            questionId: q.id || `q-${i}`,
            questionText: q.question || q.statement,
            selected: result.answers?.[q.id]?.value,
            correct: gradeInfo ? gradeInfo.score === gradeInfo.maxPoints : false,
          };
        }),
      });
    } catch (_) { /* item-analysis capture is best-effort */ }

    // Persist graded submission to backend so mastery dashboards can ingest question-level scores.
    try {
      const token = localStorage.getItem('quantegy-auth-token');
      const questionScores = Object.entries(result.gradeResult?.results || {}).map(([questionId, q]) => ({
        questionId,
        score: Number(q?.score ?? 0),
        maxPoints: Number(q?.maxPoints ?? 0),
        status: q?.status || 'graded',
      }));
      const payload = {
        id: result.id,
        assessmentId: result.assessmentId || assessmentId,
        assignmentId: result.assessmentId || assessmentId,
        classId: assessment?.classId || result.classId || null,
        studentId: result.studentId || localStorage.getItem('allen-ace-student-id') || null,
        studentUsername: localStorage.getItem('quantegy-student-user') || null,
        status: result.status,
        submittedAt: result.submittedAt || new Date().toISOString(),
        gradeResult: result.gradeResult || null,
        questionScores,
      };
      fetch('/api/auth/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ submission: payload }),
      }).catch(() => {});
    } catch (_) { /* backend sync is best-effort */ }
  }, [submission, assessmentId, assessment]);

  const handleAnswer = useCallback((questionId, value) => {
    if (!submission) return;
    const updated = saveAnswer(submission.id, questionId, value);
    setSubmission(updated);
  }, [submission]);

  const handleFlag = useCallback((questionId) => {
    if (!submission) return;
    const updated = toggleFlag(submission.id, questionId);
    setSubmission(updated);
  }, [submission]);

  const questions = submission?.questions || [];
  const currentQuestion = questions[currentQ];
  const answers = submission?.answers || {};
  const flagged = submission?.flagged || [];
  const answeredCount = Object.keys(answers).length;

  const formatTime = (s) => {
    if (s == null) return null;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Error / Loading States ────────────────────────────
  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div role="alert" aria-live="assertive" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">{'\u26A0\uFE0F'}</div>
          <h1 style={{ color: '#dc2626', margin: '0 0 8px', fontSize: 22 }}>{error}</h1>
          <Link to="/" style={{ color: '#2563eb', fontSize: 14 }}>Return Home</Link>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <SkeletonLoader variant="card" width={320} height={120} />
        <SkeletonLoader variant="text" count={3} width={280} />
      </div>
    );
  }

  // ─── Pre-Start Screen ─────────────────────────────────
  if (!submission || submission.status === 'graded') {
    const prevSubs = assessment ? getStudentSubmissions(assessmentId, localStorage.getItem('allen-ace-student-id') || 'guest') : [];
    const gradedSubs = prevSubs.filter((s) => s.status === 'graded' || s.status === 'submitted');
    const canRetake = !assessment.settings.maxAttempts || gradedSubs.length < assessment.settings.maxAttempts;

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto', padding: 32 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{assessment.title}</h1>
            {assessment.description && <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{assessment.description}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}>
              <InfoCard icon={'\uD83D\uDCDD'} label="Questions" value={assessment.questions?.length || 0} />
              <InfoCard icon={'\u2B50'} label="Total Points" value={assessment.totalPoints || 0} />
              <InfoCard icon={'\u23F1\uFE0F'} label="Time Limit" value={assessment.settings?.timeLimit ? `${assessment.settings.timeLimit} min` : 'None'} />
              <InfoCard icon={'\uD83D\uDD01'} label="Attempts" value={`${gradedSubs.length} / ${assessment.settings?.maxAttempts || '\u221E'}`} />
              <InfoCard icon={'\u2705'} label="Passing Score" value={`${assessment.settings?.passingScore || 60}%`} />
              <InfoCard icon={'\uD83D\uDD12'} label="Proctoring" value={PROCTORING_LEVELS[assessment.settings?.proctoringLevel]?.label || 'None'} />
            </div>

            {assessment.settings?.proctoringLevel !== 'none' && (
              <div style={{ padding: 12, borderRadius: 8, background: '#fef3c7', border: '1px solid #fbbf24', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
                <strong>Proctoring active:</strong> {PROCTORING_LEVELS[assessment.settings.proctoringLevel]?.features.join(', ')}.
                {assessment.settings.requireLockdown && ' Fullscreen mode required.'}
              </div>
            )}

            {/* Previous attempts */}
            {gradedSubs.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700 }}>Previous Attempts</h4>
                {gradedSubs.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#f8fafc', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                    <span>Attempt {s.attemptNumber || i + 1}</span>
                    <span style={{ fontWeight: 700, color: (s.gradeResult?.percentage || 0) >= (assessment.settings?.passingScore || 60) ? '#059669' : '#dc2626' }}>
                      {s.gradeResult?.percentage || 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={handleStart} disabled={!canRetake}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 10,
                background: canRetake ? '#2563eb' : '#94a3b8', color: '#fff',
                border: 'none', fontWeight: 800, fontSize: 16, cursor: canRetake ? 'pointer' : 'default',
              }}>
              {gradedSubs.length > 0 ? (canRetake ? 'Retake Assessment' : 'No attempts remaining') : 'Begin Assessment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results Screen ────────────────────────────────────
  if (submission.status === 'submitted' || (submission.status === 'graded' && showReview)) {
    const r = submission.gradeResult;
    const passed = r && r.percentage >= (assessment.settings?.passingScore || 60);
    const showFeedback = assessment.settings?.showFeedback === 'after-submit' || assessment.settings?.showFeedback === 'after-each';

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            background: passed ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : 'linear-gradient(135deg, #fef2f2, #fecaca)',
            borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 24,
            border: `2px solid ${passed ? '#10b981' : '#ef4444'}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{passed ? '\uD83C\uDF89' : '\uD83D\uDCAA'}</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: passed ? '#065f46' : '#991b1b' }}>
              {passed ? 'Passed!' : 'Keep Practicing'}
            </h2>
            {assessment.settings?.showScore && r && (
              <div style={{ fontSize: 36, fontWeight: 800, color: passed ? '#059669' : '#dc2626' }}>
                {r.percentage}%
              </div>
            )}
            {r && (
              <p style={{ margin: '8px 0 0', fontSize: 14, color: '#64748b' }}>
                {r.earnedPoints} / {r.totalPoints} points &middot; {r.autoGraded} auto-graded
                {r.needsManual > 0 && ` · ${r.needsManual} awaiting review`}
              </p>
            )}
            {tabWarnings > 0 && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#dc2626' }}>
                {'\u26A0\uFE0F'} {tabWarnings} tab-switch warning{tabWarnings > 1 ? 's' : ''} recorded
              </p>
            )}
          </div>

          {/* Question Review */}
          {showFeedback && r && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: 15 }}>
                Question Review
              </div>
              {questions.map((q, idx) => {
                const result = r.results[q.id];
                const answer = answers[q.id]?.value;
                const isCorrect = result && result.score === result.maxPoints;
                return (
                  <div key={q.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                        background: result?.status === 'needs-review' ? '#fef3c7' : isCorrect ? '#dcfce7' : '#fee2e2',
                        color: result?.status === 'needs-review' ? '#92400e' : isCorrect ? '#166534' : '#991b1b',
                        fontWeight: 800,
                      }}>
                        {result?.status === 'needs-review' ? '?' : isCorrect ? '\u2713' : '\u2717'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          Q{idx + 1}. {(q.question || q.statement)?.startsWith('<') ? <RichTextViewer html={q.question || q.statement} /> : (q.question || q.statement)}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Your answer: <strong>{Array.isArray(answer) ? answer.join(', ') : typeof answer === 'object' ? JSON.stringify(answer) : String(answer || 'No answer')}</strong>
                          {result && <> &middot; Score: {result.score ?? '?'}/{result.maxPoints}</>}
                        </div>
                        {q.explanation && isCorrect !== undefined && (
                          <div style={{ fontSize: 12, color: '#059669', marginTop: 4, fontStyle: 'italic' }}>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
            <Link to="/" style={{
              padding: '10px 24px', borderRadius: 8, background: '#f1f5f9', color: '#475569',
              textDecoration: 'none', fontWeight: 700, fontSize: 14, border: '1px solid #e2e8f0',
            }}>
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Assessment Taking UI ──────────────────────────────
  const needsFullscreen = assessment.settings?.requireLockdown && !isFullscreen && proctoringRef.current.has('fullscreen');

  if (needsFullscreen) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff', padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDD12'}</div>
          <h2 style={{ margin: '0 0 8px' }}>Fullscreen Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 14 }}>
            This assessment requires fullscreen mode for proctoring.
          </p>
          <button type="button" onClick={enterFullscreen}
            style={{ padding: '12px 32px', borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
            Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', userSelect: proctoringRef.current.has('copy-paste') ? 'none' : 'auto' }}>
      {/* Sidebar — Question Navigation */}
      <aside aria-label="Assessment navigation and question list" style={{
        width: 220, minWidth: 220, background: '#fff', borderRight: '1px solid #e2e8f0',
        padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto',
      }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{assessment.title}</h2>

        {/* Timer */}
        {timeLeft !== null && (
          <div style={{
            padding: '8px 12px', borderRadius: 8, textAlign: 'center', fontWeight: 800, fontSize: 18,
            background: timeLeft < 60 ? '#fef2f2' : timeLeft < 300 ? '#fef3c7' : '#f0fdf4',
            color: timeLeft < 60 ? '#dc2626' : timeLeft < 300 ? '#d97706' : '#059669',
          }} role="timer" aria-label={`Time remaining: ${formatTime(timeLeft)}`}>
          {'\u23F1\uFE0F'} {formatTime(timeLeft)}
          </div>
        )}

        {/* Tab warnings */}
        {tabWarnings > 0 && (
          <div style={{ padding: '6px 10px', borderRadius: 6, background: '#fef2f2', fontSize: 11, color: '#dc2626', fontWeight: 700, textAlign: 'center' }}>
            {'\u26A0\uFE0F'} {tabWarnings} warning{tabWarnings > 1 ? 's' : ''}
          </div>
        )}

        {/* Progress */}
        <div style={{ fontSize: 12, color: '#64748b' }}>
          {answeredCount} / {questions.length} answered
        </div>
        <div style={{ height: 4, borderRadius: 2, background: '#e2e8f0' }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#2563eb', width: `${(answeredCount / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Question Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginTop: 4 }}>
          {questions.map((q, idx) => {
            const answered = !!answers[q.id];
            const isFlagged = flagged.includes(q.id);
            const isCurrent = idx === currentQ;
            return (
              <button key={q.id} type="button" onClick={() => setCurrentQ(idx)}
                aria-label={`Question ${idx + 1}${answered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: 6, border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: isFlagged ? '#fef3c7' : answered ? '#dcfce7' : '#fff',
                  cursor: 'pointer', fontWeight: 700, fontSize: 11, color: isCurrent ? '#2563eb' : '#475569',
                  position: 'relative',
                }}>
                {idx + 1}
                {isFlagged && <span style={{ position: 'absolute', top: -2, right: -2, fontSize: 8 }}>{'\uD83D\uDEA9'}</span>}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => setShowConfirm(true)}
          disabled={answeredCount === 0}
          style={{
            marginTop: 'auto', padding: '10px 16px', borderRadius: 8,
            background: answeredCount === questions.length ? '#059669' : '#f59e0b',
            color: '#fff', border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer',
          }}>
          Submit Assessment
        </button>
      </aside>

      {/* Main — Current Question */}
      <main aria-label="Assessment questions" style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {/* Live region so screen readers announce question change */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {currentQuestion ? `Question ${currentQ + 1} of ${questions.length}` : ''}
        </div>
        {currentQuestion && (
          <div role="region" aria-labelledby="take-assessment-question-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div id="take-assessment-question-heading" style={{ fontSize: 13, color: '#64748b' }}>
                Question {currentQ + 1} of {questions.length}
                <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#f1f5f9' }}>
                  {QUESTION_TYPES.find((t) => t.id === currentQuestion.type)?.label}
                </span>
                <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}>
                  {currentQuestion.points || 1} point{(currentQuestion.points || 1) !== 1 ? 's' : ''}
                </span>
              </div>
              <button type="button" onClick={() => handleFlag(currentQuestion.id)}
                aria-pressed={flagged.includes(currentQuestion.id)}
                aria-label={flagged.includes(currentQuestion.id) ? 'Flagged for review. Click to unflag.' : 'Flag question for review'}
                style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  background: flagged.includes(currentQuestion.id) ? '#fef3c7' : '#f1f5f9',
                  border: `1px solid ${flagged.includes(currentQuestion.id) ? '#fbbf24' : '#e2e8f0'}`,
                  color: flagged.includes(currentQuestion.id) ? '#92400e' : '#64748b',
                }}>
                {flagged.includes(currentQuestion.id) ? '\uD83D\uDEA9 Flagged' : 'Flag for Review'}
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700, color: '#0f172a', lineHeight: 1.5 }}>
                {(currentQuestion.question || currentQuestion.statement)?.startsWith('<')
                  ? <RichTextViewer html={currentQuestion.question || currentQuestion.statement} />
                  : (currentQuestion.question || currentQuestion.statement)}
              </h3>

              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]?.value}
                onAnswer={(val) => handleAnswer(currentQuestion.id, val)}
              />
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button type="button" onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                disabled={currentQ === 0 || !assessment.settings?.allowBacktrack}
                style={{ ...navBtn, opacity: currentQ === 0 ? 0.4 : 1 }}>
                {'\u2190'} Previous
              </button>
              <button type="button" onClick={() => setCurrentQ((p) => Math.min(questions.length - 1, p + 1))}
                disabled={currentQ === questions.length - 1}
                style={{ ...navBtn, background: '#2563eb', color: '#fff', opacity: currentQ === questions.length - 1 ? 0.4 : 1 }}>
                Next {'\u2192'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}
          role="dialog" aria-modal="true" aria-label="Confirm submission">
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 440, width: '90%' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 800 }}>Submit Assessment?</h3>
            <p style={{ margin: '0 0 8px', fontSize: 14, color: '#64748b' }}>
              You have answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions.
            </p>
            {answeredCount < questions.length && (
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                {'\u26A0\uFE0F'} {questions.length - answeredCount} question{questions.length - answeredCount > 1 ? 's are' : ' is'} unanswered.
              </p>
            )}
            {flagged.length > 0 && (
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                {'\uD83D\uDEA9'} {flagged.length} question{flagged.length > 1 ? 's are' : ' is'} flagged for review.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}>
                Continue Working
              </button>
              <button type="button" onClick={handleSubmit}
                style={{ flex: 1, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Question Renderers (per type) ───────────────────────

function QuestionRenderer({ question, answer, onAnswer }) {
  const type = question.type;

  if (type === 'multiple-choice') return <MCRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'select-all') return <SelectAllRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'true-false') return <TFRenderer answer={answer} onAnswer={onAnswer} />;
  if (type === 'short-answer') return <ShortAnswerRenderer answer={answer} onAnswer={onAnswer} />;
  if (type === 'fill-blank') return <FillBlankRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'matching') return <MatchingRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'ordering') return <OrderingRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'numeric') return <NumericRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'categorization') return <CategorizationRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'formula') return <FormulaRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'essay') return <EssayRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'file-upload') return <FileUploadRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'url') return <UrlSubmissionRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'hot-spot') return <HotSpotRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'likert') return <LikertRenderer q={question} answer={answer} onAnswer={onAnswer} />;
  if (type === 'url') return <URLRenderer q={question} answer={answer} onAnswer={onAnswer} />;

  return <p style={{ color: '#dc2626' }}>Unknown question type: {type}</p>;
}

function MCRenderer({ q, answer, onAnswer }) {
  const opts = q.options || {};
  const keys = Array.isArray(opts) ? opts.map((_, i) => String.fromCharCode(65 + i)) : Object.keys(opts);
  return (
    <div style={{ display: 'grid', gap: 8 }} role="radiogroup" aria-label="Answer options">
      {keys.map((k) => (
        <label key={k} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
          border: `2px solid ${answer === k ? '#2563eb' : '#e2e8f0'}`,
          background: answer === k ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <input type="radio" name={`q-${q.id}`} value={k} checked={answer === k}
            onChange={() => onAnswer(k)} style={{ accentColor: '#2563eb' }} />
          <span style={{ fontWeight: 700, color: '#475569', width: 20 }}>{k}.</span>
          <span style={{ fontSize: 14, color: '#0f172a' }}>{opts[k]}</span>
        </label>
      ))}
    </div>
  );
}

function SelectAllRenderer({ q, answer, onAnswer }) {
  const selected = Array.isArray(answer) ? answer : [];
  const opts = q.options || [];
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Select all that apply</p>
      {opts.map((opt, i) => (
        <label key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
          border: `2px solid ${selected.includes(i) ? '#2563eb' : '#e2e8f0'}`,
          background: selected.includes(i) ? '#eff6ff' : '#fff', cursor: 'pointer',
        }}>
          <input type="checkbox" checked={selected.includes(i)}
            onChange={() => {
              const newS = selected.includes(i) ? selected.filter((s) => s !== i) : [...selected, i];
              onAnswer(newS);
            }} style={{ accentColor: '#2563eb' }} />
          <span style={{ fontSize: 14, color: '#0f172a' }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function TFRenderer({ answer, onAnswer }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {[{ val: true, label: 'True' }, { val: false, label: 'False' }].map(({ val, label }) => (
        <button key={label} type="button" onClick={() => onAnswer(val)}
          style={{
            flex: 1, padding: '16px 24px', borderRadius: 10, fontSize: 16, fontWeight: 700,
            border: `2px solid ${answer === val ? '#2563eb' : '#e2e8f0'}`,
            background: answer === val ? '#eff6ff' : '#fff',
            color: answer === val ? '#2563eb' : '#475569', cursor: 'pointer',
          }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function ShortAnswerRenderer({ answer, onAnswer }) {
  return (
    <input value={answer || ''} onChange={(e) => onAnswer(e.target.value)}
      placeholder="Type your answer..." aria-label="Your answer"
      style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 15 }} />
  );
}

function FillBlankRenderer({ q, answer, onAnswer }) {
  const blanks = q.blanks || [];
  const answers = Array.isArray(answer) ? answer : new Array(blanks.length).fill('');
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {blanks.map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>Blank {i + 1}:</span>
          <input value={answers[i] || ''} onChange={(e) => {
            const na = [...answers]; na[i] = e.target.value; onAnswer(na);
          }} placeholder="Your answer" aria-label={`Blank ${i + 1}`}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
        </div>
      ))}
    </div>
  );
}

function MatchingRenderer({ q, answer, onAnswer }) {
  const pairs = q.pairs || [];
  const current = answer || {};
  const rights = useMemo(() => pairs.map((p) => p.right).sort(() => Math.random() - 0.5), []);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {pairs.map((p) => (
        <div key={p.left} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', width: '40%' }}>{p.left}</span>
          <span style={{ color: '#94a3b8' }}>{'\u2192'}</span>
          <select value={current[p.left] || ''} onChange={(e) => onAnswer({ ...current, [p.left]: e.target.value })}
            aria-label={`Match for ${p.left}`}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 }}>
            <option value="">Select match...</option>
            {rights.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function OrderingRenderer({ q, answer, onAnswer }) {
  const items = useMemo(() => {
    if (answer && Array.isArray(answer) && answer.length > 0) return answer;
    return [...(q.items || q.correctOrder || [])].sort(() => Math.random() - 0.5);
  }, []);
  const [ordered, setOrdered] = useState(Array.isArray(answer) && answer.length > 0 ? answer : items);

  const move = (idx, dir) => {
    const newO = [...ordered];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= newO.length) return;
    [newO[idx], newO[newIdx]] = [newO[newIdx], newO[idx]];
    setOrdered(newO);
    onAnswer(newO);
  };

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Drag or use arrows to reorder</p>
      {ordered.map((item, idx) => (
        <div key={`${item}-${idx}`} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
          border: '1px solid #e2e8f0', background: '#fff',
        }}>
          <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: 13 }}>{idx + 1}.</span>
          <span style={{ flex: 1, fontSize: 14, color: '#0f172a' }}>{item}</span>
          <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{'\u25B2'}</button>
          <button type="button" onClick={() => move(idx, 1)} disabled={idx === ordered.length - 1} aria-label="Move down"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>{'\u25BC'}</button>
        </div>
      ))}
    </div>
  );
}

function NumericRenderer({ q, answer, onAnswer }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <input type="number" step="any" value={answer ?? ''} onChange={(e) => onAnswer(e.target.value)}
        placeholder="Enter a number" aria-label="Numeric answer"
        style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16, width: 200 }} />
      {q.unit && <span style={{ fontSize: 14, color: '#64748b' }}>{q.unit}</span>}
    </div>
  );
}

function CategorizationRenderer({ q, answer, onAnswer }) {
  const categories = q.categories || {};
  const catNames = Object.keys(categories);
  const allItems = q.allItems || Object.values(categories).flat();
  const current = answer || {};
  const assigned = Object.values(current).flat();
  const unassigned = allItems.filter((item) => !assigned.includes(item));

  const assign = (cat, item) => {
    const newA = { ...current };
    catNames.forEach((c) => { newA[c] = (newA[c] || []).filter((i) => i !== item); });
    newA[cat] = [...(newA[cat] || []), item];
    onAnswer(newA);
  };

  const unassign = (cat, item) => {
    const newA = { ...current, [cat]: (current[cat] || []).filter((i) => i !== item) };
    onAnswer(newA);
  };

  return (
    <div>
      {unassigned.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', margin: '0 0 6px' }}>Unassigned items:</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {unassigned.map((item) => (
              <span key={item} style={{ padding: '6px 12px', borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 13, cursor: 'grab' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(catNames.length, 3)}, 1fr)`, gap: 12 }}>
        {catNames.map((cat) => (
          <div key={cat} style={{ border: '2px dashed #d1d5db', borderRadius: 10, padding: 12, minHeight: 100 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#2563eb' }}>{cat}</h4>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
              {(current[cat] || []).map((item) => (
                <span key={item} onClick={() => unassign(cat, item)}
                  style={{ padding: '4px 10px', borderRadius: 6, background: '#eff6ff', border: '1px solid #93c5fd', fontSize: 12, cursor: 'pointer' }}>
                  {item} {'\u2715'}
                </span>
              ))}
            </div>
            <select onChange={(e) => { if (e.target.value) { assign(cat, e.target.value); e.target.value = ''; } }}
              aria-label={`Add item to ${cat}`}
              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
              <option value="">+ Add item...</option>
              {unassigned.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulaRenderer({ q, answer, onAnswer }) {
  return (
    <div>
      {q.variables && Object.keys(q.variables).length > 0 && (
        <div style={{ marginBottom: 12, padding: 10, background: '#f1f5f9', borderRadius: 8, fontSize: 13 }}>
          <strong>Given:</strong> {Object.entries(q.variables).map(([k, v]) => `${k} = ${v}`).join(', ')}
        </div>
      )}
      <input type="number" step="any" value={answer ?? ''} onChange={(e) => onAnswer(e.target.value)}
        placeholder="Calculate and enter your answer" aria-label="Formula answer"
        style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16, width: 200 }} />
    </div>
  );
}

function EssayRenderer({ q, answer, onAnswer }) {
  const plainText = (answer || '').replace(/<[^>]*>/g, '').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return (
    <div>
      <RichTextEditor value={answer || ''} onChange={onAnswer}
        placeholder="Write your essay here... click ∑ for math equations" minHeight={200} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: '#64748b' }}>
        <span>{wordCount} words</span>
        <span>
          {q.minWords && wordCount < q.minWords && <span style={{ color: '#dc2626' }}>Min: {q.minWords} words</span>}
          {q.maxWords && <span> Max: {q.maxWords} words</span>}
        </span>
      </div>
      {q.rubric && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 12, color: '#2563eb', cursor: 'pointer', fontWeight: 600 }}>View Rubric</summary>
          <div style={{ marginTop: 6, padding: 10, background: '#f8fafc', borderRadius: 6, fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap' }}>
            {q.rubric}
          </div>
        </details>
      )}
    </div>
  );
}

function FileUploadRenderer({ q, answer, onAnswer }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setError('');
    setUploading(true);
    const result = await uploadFile(file, 'submission');
    setUploading(false);
    if (result.success && result.file) {
      onAnswer(JSON.stringify({ name: result.file.originalName, url: result.file.url, type: result.file.type }));
    } else {
      setError(result.error || 'Upload failed');
      onAnswer(file.name);
    }
  };

  const parsed = (() => { try { return JSON.parse(answer); } catch { return null; } })();
  const displayName = parsed?.name || answer;

  return (
    <div>
      <div style={{
        padding: 32, borderRadius: 10, border: '2px dashed #d1d5db', textAlign: 'center',
        background: answer ? '#f0fdf4' : '#f8fafc', position: 'relative',
      }}>
        {uploading ? (
          <div>
            <div style={{ fontSize: 32 }}>{'\u23F3'}</div>
            <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 600, color: '#6366f1' }}>Uploading...</p>
          </div>
        ) : answer ? (
          <div>
            <div style={{ fontSize: 32 }}>{'\u2705'}</div>
            <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 700, color: '#059669' }}>
              Uploaded: {displayName}
            </p>
            {parsed?.url && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>Stored on server</p>}
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32 }}>{'\uD83D\uDCC1'}</div>
            <p style={{ margin: '8px 0 4px', fontSize: 14, fontWeight: 600, color: '#475569' }}>Click to upload or drag and drop</p>
            <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
              Accepted: {(q.allowedTypes || []).join(', ')} &middot; Max: {q.maxSizeMB || 10}MB
            </p>
          </div>
        )}
        {error && <p style={{ margin: '8px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>}
        <input type="file" accept={(q.allowedTypes || []).join(',')}
          onChange={handleUpload} disabled={uploading}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: uploading ? 'wait' : 'pointer' }}
          aria-label="Upload file" />
      </div>
    </div>
  );
}

function UrlSubmissionRenderer({ q, answer, onAnswer }) {
  const [input, setInput] = useState(answer || '');
  const [invalid, setInvalid] = useState(false);

  const urlRegex = /^https?:\/\/[^\s]+$/i;
  const isValidUrl = (s) => s && urlRegex.test(s.trim());

  const handleBlur = () => {
    const v = input.trim();
    if (!v) { onAnswer(''); setInvalid(false); return; }
    if (isValidUrl(v)) { onAnswer(v); setInvalid(false); } else { setInvalid(true); }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    setInvalid(false);
    const v = e.target.value.trim();
    if (isValidUrl(v)) onAnswer(v); else if (!v) onAnswer('');
  };

  return (
    <div>
      <input
        type="url"
        value={input}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="https://..."
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 10, border: `2px solid ${invalid ? '#fecaca' : '#e2e8f0'}`,
          fontSize: 14, color: '#0f172a', marginBottom: 8,
          background: '#fff', outline: 'none', transition: 'border-color 0.2s',
        }}
        aria-label="URL submission"
      />
      {invalid && input.trim() && (
        <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 8px' }}>Please enter a valid URL (e.g. https://example.com)</p>
      )}
      {answer && isValidUrl(answer) && (
        <div style={{ marginTop: 8, padding: 10, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <a href={answer} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13, wordBreak: 'break-all' }}>
            {answer}
          </a>
        </div>
      )}
    </div>
  );
}

function HotSpotRenderer({ q, answer, onAnswer }) {
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    onAnswer({ x, y });
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>Click on the correct area of the image</p>
      <div style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair' }} onClick={handleClick}>
        {q.imageUrl ? (
          <img src={q.imageUrl} alt="Hot spot image" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #e2e8f0' }} />
        ) : (
          <div style={{ width: 400, height: 300, background: '#f1f5f9', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            Image placeholder
          </div>
        )}
        {answer && (
          <div style={{
            position: 'absolute', left: answer.x - 8, top: answer.y - 8,
            width: 16, height: 16, borderRadius: '50%', background: '#dc2626',
            border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }} />
        )}
      </div>
      {answer && <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>Selected: ({answer.x}, {answer.y})</p>}
    </div>
  );
}

function LikertRenderer({ q, answer, onAnswer }) {
  const scale = q.scale || [];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {scale.map((label, i) => (
        <button key={i} type="button" onClick={() => onAnswer(i)}
          style={{
            flex: 1, minWidth: 80, padding: '12px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            border: `2px solid ${answer === i ? '#2563eb' : '#e2e8f0'}`,
            background: answer === i ? '#eff6ff' : '#fff',
            color: answer === i ? '#2563eb' : '#475569', cursor: 'pointer', textAlign: 'center',
          }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function URLRenderer({ q, answer, onAnswer }) {
  const [error, setError] = useState('');
  const isValid = answer && /^https?:\/\/.+/.test(answer);
  let domain = '';
  try { domain = answer ? new URL(answer).hostname : ''; } catch (_) {}

  const handleChange = (e) => {
    const val = e.target.value;
    onAnswer(val);
    if (val && !/^https?:\/\//.test(val)) {
      setError('URL must start with http:// or https://');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="url" value={answer || ''} onChange={handleChange}
          placeholder="https://example.com" aria-label="URL submission"
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 8, fontSize: 15,
            border: `1px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
            outline: 'none', transition: 'border 0.2s',
          }} />
        {isValid && (
          <a href={answer} target="_blank" rel="noopener noreferrer"
            title="Open link"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 8, background: '#eff6ff',
              border: '1px solid #bfdbfe', color: '#2563eb', textDecoration: 'none', fontSize: 18, flexShrink: 0,
            }}>
            ↗
          </a>
        )}
      </div>
      {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#dc2626' }}>{error}</p>}
      {isValid && domain && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: '#f8fafc', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569',
        }}>
          <span style={{ fontSize: 16 }}>🔗</span>
          <span style={{ fontWeight: 600 }}>{domain}</span>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{icon} {label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{value}</div>
    </div>
  );
}

const navBtn = {
  padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#475569',
};
