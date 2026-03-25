import React, { useState, useMemo, useCallback } from 'react';
import {
  getAssessment, getAssessmentSubmissions, manualGradeQuestion,
  QUESTION_TYPES, computeItemAnalysis,
} from '../utils/assessmentEngine';

/**
 * Teacher-facing grading + item analysis panel for a single assessment.
 */
export default function AssessmentGrader({ assessmentId, onBack }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const assessment = useMemo(() => getAssessment(assessmentId), [assessmentId, refreshKey]);
  const submissions = useMemo(() => getAssessmentSubmissions(assessmentId), [assessmentId, refreshKey]);
  const analysis = useMemo(() => computeItemAnalysis(assessmentId), [assessmentId, refreshKey]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [tab, setTab] = useState('submissions');

  const gradedSubs = submissions.filter((s) => s.status === 'graded');
  const pendingSubs = submissions.filter((s) => s.status === 'submitted');
  const inProgressSubs = submissions.filter((s) => s.status === 'in-progress');

  const refresh = () => setRefreshKey((k) => k + 1);

  if (!assessment) return <p style={{ color: '#dc2626', padding: 24 }}>Assessment not found.</p>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          {onBack && (
            <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
              {'\u2190'} Back
            </button>
          )}
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{assessment.title}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {submissions.length} submissions &middot; {assessment.questions?.length} questions &middot; {assessment.totalPoints} points
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Stat label="Graded" value={gradedSubs.length} color="#059669" />
          <Stat label="Pending" value={pendingSubs.length} color="#f59e0b" />
          <Stat label="In Progress" value={inProgressSubs.length} color="#3b82f6" />
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 2, borderBottom: '2px solid #e2e8f0', marginBottom: 16 }}>
        {['submissions', 'item-analysis', 'proctoring'].map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            style={{
              padding: '10px 18px', border: 'none', background: tab === t ? '#fff' : 'transparent',
              borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
              color: tab === t ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', marginBottom: -2, textTransform: 'capitalize',
            }}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* ═══ SUBMISSIONS TAB ═══ */}
      {tab === 'submissions' && !selectedSub && (
        <div>
          {submissions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No submissions yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {submissions
                .sort((a, b) => (a.status === 'submitted' ? -1 : 0) - (b.status === 'submitted' ? -1 : 0))
                .map((sub) => {
                  const pct = sub.gradeResult?.percentage;
                  const pass = pct != null && pct >= (assessment.settings?.passingScore || 60);
                  return (
                    <button key={sub.id} type="button" onClick={() => setSelectedSub(sub.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                        borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff',
                        cursor: 'pointer', textAlign: 'left', width: '100%',
                      }}>
                      <StatusBadge status={sub.status} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {sub.studentName || 'Student'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          Attempt {sub.attemptNumber || 1} &middot; {new Date(sub.submittedAt || sub.startedAt).toLocaleString()}
                          {sub.timeSpent > 0 && ` · ${Math.round(sub.timeSpent / 60)} min`}
                          {(sub.proctoringEvents?.length || 0) > 0 && (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}> · {sub.proctoringEvents.length} proctoring events</span>
                          )}
                        </div>
                      </div>
                      {pct != null && (
                        <div style={{ fontSize: 18, fontWeight: 800, color: pass ? '#059669' : '#dc2626' }}>
                          {pct}%
                        </div>
                      )}
                      {sub.gradeResult?.needsManual > 0 && (
                        <span style={{ padding: '3px 8px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontSize: 10, fontWeight: 800 }}>
                          {sub.gradeResult.needsManual} to grade
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ═══ SELECTED SUBMISSION — Grade View ═══ */}
      {tab === 'submissions' && selectedSub && (
        <SubmissionGrader
          submissionId={selectedSub}
          assessment={assessment}
          onBack={() => { setSelectedSub(null); refresh(); }}
        />
      )}

      {/* ═══ ITEM ANALYSIS TAB ═══ */}
      {tab === 'item-analysis' && (
        <ItemAnalysisView analysis={analysis} assessment={assessment} />
      )}

      {/* ═══ PROCTORING TAB ═══ */}
      {tab === 'proctoring' && (
        <ProctoringView submissions={submissions} />
      )}
    </div>
  );
}

function SubmissionGrader({ submissionId, assessment, onBack }) {
  const [sub, setSub] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useMemo(() => {
    const allSubs = getAssessmentSubmissions(assessment.id);
    setSub(allSubs.find((s) => s.id === submissionId) || null);
  }, [submissionId, refreshKey]);

  if (!sub) return <p>Submission not found.</p>;

  const questions = sub.questions || assessment.questions || [];
  const results = sub.gradeResult?.results || {};

  const handleGrade = (qId, score, feedback) => {
    manualGradeQuestion(submissionId, qId, score, feedback);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div>
      <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
        {'\u2190'} Back to Submissions
      </button>
      <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{sub.studentName}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Attempt {sub.attemptNumber} &middot; Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
            &middot; {Math.round(sub.timeSpent / 60)} min
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: sub.gradeResult?.percentage >= (assessment.settings?.passingScore || 60) ? '#059669' : '#dc2626' }}>
            {sub.gradeResult?.percentage ?? '—'}%
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            {sub.gradeResult?.earnedPoints ?? 0} / {sub.gradeResult?.totalPoints ?? 0} points
          </div>
        </div>
      </div>

      {questions.map((q, idx) => {
        const result = results[q.id];
        const answer = sub.answers?.[q.id]?.value;
        const needsGrade = result?.status === 'needs-review';
        const isCorrect = result && result.score === result.maxPoints;

        return (
          <div key={q.id} style={{
            padding: 16, borderRadius: 10, marginBottom: 10,
            border: `1px solid ${needsGrade ? '#fbbf24' : '#e2e8f0'}`,
            background: needsGrade ? '#fffbeb' : '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Q{idx + 1} &middot; {QUESTION_TYPES.find((t) => t.id === q.type)?.label}
                <span style={{ marginLeft: 8, fontWeight: 700, color: '#0f172a' }}>{result?.score ?? '?'} / {result?.maxPoints || q.points || 1}</span>
              </div>
              {!needsGrade && (
                <span style={{
                  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                  background: isCorrect ? '#dcfce7' : '#fee2e2',
                  color: isCorrect ? '#166534' : '#991b1b',
                }}>
                  {isCorrect ? 'Correct' : result?.manuallyGraded ? 'Graded' : 'Incorrect'}
                </span>
              )}
            </div>

            <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
              {q.question || q.statement}
            </div>

            <div style={{ fontSize: 13, color: '#475569', padding: '8px 12px', background: '#f8fafc', borderRadius: 6, marginBottom: 8 }}>
              <strong>Student answer:</strong>{' '}
              {answer == null ? <em style={{ color: '#94a3b8' }}>No answer</em> :
                typeof answer === 'object' ? <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(answer, null, 2)}</pre> :
                /^https?:\/\//i.test(String(answer)) ? (
                  <a href={answer} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, wordBreak: 'break-all' }}>{answer}</a>
                ) : String(answer)}
            </div>

            {needsGrade && (
              <ManualGradeForm maxPoints={result?.maxPoints || q.points || 1} onGrade={(score, feedback) => handleGrade(q.id, score, feedback)} />
            )}

            {result?.feedback && (
              <div style={{ fontSize: 12, color: '#059669', marginTop: 6, fontStyle: 'italic' }}>
                Feedback: {result.feedback}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ManualGradeForm({ maxPoints, onGrade }) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', padding: '10px 12px', background: '#fef3c7', borderRadius: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 700 }}>
        Score (0-{maxPoints}):
        <input type="number" min={0} max={maxPoints} step={0.5} value={score}
          onChange={(e) => setScore(e.target.value)} aria-label="Score"
          style={{ display: 'block', marginTop: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', width: 80 }} />
      </label>
      <label style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 200 }}>
        Feedback:
        <input value={feedback} onChange={(e) => setFeedback(e.target.value)} aria-label="Feedback"
          placeholder="Optional feedback..." style={{ display: 'block', marginTop: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', width: '100%' }} />
      </label>
      <button type="button" onClick={() => {
        const s = parseFloat(score);
        if (!isNaN(s) && s >= 0 && s <= maxPoints) onGrade(s, feedback);
      }} disabled={score === '' || isNaN(parseFloat(score))}
        style={{ padding: '8px 16px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
        Grade
      </button>
    </div>
  );
}

function ItemAnalysisView({ analysis, assessment }) {
  if (!analysis) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDCCA'}</div>
        <p style={{ fontSize: 14 }}>Need at least 2 graded submissions for item analysis.</p>
      </div>
    );
  }

  const diffColor = (d) => d < 0.3 ? '#dc2626' : d > 0.8 ? '#f59e0b' : '#059669';
  const discColor = (d) => d < 0.1 ? '#dc2626' : d < 0.2 ? '#f59e0b' : '#059669';

  return (
    <div>
      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Submissions" value={analysis.totalSubmissions} />
        <StatCard label="Avg Score" value={`${analysis.averageScore}%`} />
        <StatCard label="Median" value={`${analysis.median}%`} />
        <StatCard label="Std Dev" value={analysis.standardDeviation} />
      </div>

      {/* Per-Question Analysis */}
      <div style={{ display: 'grid', gap: 10 }}>
        {analysis.items.map((item, idx) => (
          <div key={item.questionId} style={{ padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  Q{idx + 1}. {item.questionText?.substring(0, 80)}{item.questionText?.length > 80 ? '...' : ''}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {QUESTION_TYPES.find((t) => t.id === item.type)?.label} &middot; {item.correctCount}/{item.totalResponses} correct
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {/* Difficulty */}
              <div style={{ padding: '8px 14px', borderRadius: 8, background: '#f8fafc', minWidth: 120 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Difficulty</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: diffColor(item.difficulty) }}>{item.difficulty}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: diffColor(item.difficulty) }}>{item.difficultyLabel}</div>
              </div>

              {/* Discrimination */}
              <div style={{ padding: '8px 14px', borderRadius: 8, background: '#f8fafc', minWidth: 120 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Discrimination</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: discColor(item.discrimination) }}>{item.discrimination}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: discColor(item.discrimination) }}>{item.discriminationLabel}</div>
              </div>

              {/* Distractor Analysis */}
              {Object.keys(item.distractors).length > 0 && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Response Distribution</div>
                  {Object.entries(item.distractors).map(([key, d]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, width: 24, color: d.isCorrect ? '#059669' : '#475569' }}>
                        {key}{d.isCorrect ? ' \u2713' : ''}
                      </span>
                      <div style={{ flex: 1, height: 12, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3, width: `${d.percentage}%`,
                          background: d.isCorrect ? '#059669' : '#94a3b8',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b', width: 40, textAlign: 'right' }}>{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProctoringView({ submissions }) {
  const events = submissions.flatMap((s) =>
    (s.proctoringEvents || []).map((e) => ({ ...e, studentName: s.studentName, submissionId: s.id }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const byStudent = {};
  submissions.forEach((s) => {
    if (s.proctoringEvents?.length > 0) {
      byStudent[s.studentName] = (byStudent[s.studentName] || 0) + s.proctoringEvents.length;
    }
  });

  return (
    <div>
      {/* Student Risk Summary */}
      {Object.keys(byStudent).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Students with Proctoring Events</h4>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(byStudent).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
              <span key={name} style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: count >= 5 ? '#fee2e2' : count >= 3 ? '#fef3c7' : '#f1f5f9',
                color: count >= 5 ? '#991b1b' : count >= 3 ? '#92400e' : '#475569',
                border: `1px solid ${count >= 5 ? '#fca5a5' : count >= 3 ? '#fde68a' : '#e2e8f0'}`,
              }}>
                {name}: {count} event{count > 1 ? 's' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Event Log */}
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u2705'}</div>
          <p style={{ fontSize: 14 }}>No proctoring events recorded.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 140px 160px 1fr', padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
            <span>Time</span><span>Student</span><span>Event Type</span><span>Detail</span>
          </div>
          {events.slice(0, 50).map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 140px 160px 1fr', padding: '8px 16px', borderBottom: '1px solid #f8fafc', fontSize: 12 }}>
              <span style={{ color: '#94a3b8' }}>{new Date(e.timestamp).toLocaleString()}</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{e.studentName}</span>
              <span style={{
                fontWeight: 700,
                color: e.type === 'tab-switch' ? '#dc2626' : e.type === 'exit-fullscreen' ? '#f59e0b' : '#64748b',
              }}>
                {e.type}
              </span>
              <span style={{ color: '#64748b' }}>{e.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared ────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    'in-progress': { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
    'submitted': { bg: '#fef3c7', color: '#92400e', label: 'Needs Review' },
    'graded': { bg: '#dcfce7', color: '#166534', label: 'Graded' },
  };
  const s = map[status] || map['in-progress'];
  return (
    <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px 14px' }}>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
    </div>
  );
}
