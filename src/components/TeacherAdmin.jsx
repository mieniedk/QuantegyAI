/**
 * Teacher Admin Reducer — Auto-grading, attendance, feedback drafts,
 * content transformation, accessibility checks, class duplication, hours-saved tracker.
 */
import React, { useState, useMemo } from 'react';
import {
  getClassDiscussions, gradeDiscussion, getStudentAttendance,
  getHoursSaved, trackTimeSaved, getClassResults,
  getClassExitTicketActivities, getResponsesForExitTicket,
} from '../utils/storage';
import RichTextEditor from './RichTextEditor';
import AccessibilityAudit from './AccessibilityAudit';

export default function TeacherAdmin({ cls, classId, students, onRefresh }) {
  const [section, setSection] = useState('hours');
  const [autoGradeLoading, setAutoGradeLoading] = useState(false);
  const [autoGradeResult, setAutoGradeResult] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [transformLoading, setTransformLoading] = useState(false);
  const [transformResult, setTransformResult] = useState(null);
  const [transformInput, setTransformInput] = useState('');
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessResult, setAccessResult] = useState(null);
  const [accessInput, setAccessInput] = useState('');

  const hoursSaved = useMemo(() => getHoursSaved(), [autoGradeResult, feedbackResult, transformResult]);
  const attendance = useMemo(() => getStudentAttendance(classId), [classId]);
  const gradeId = cls?.gradeId || 'grade3';

  // Calculate total hours saved
  const totalMinutes = (hoursSaved.autoGraded || 0) * 2 + (hoursSaved.aiGraded || 0) * 5 +
    (hoursSaved.feedbackDrafts || 0) * 8 + (hoursSaved.duplications || 0) * 30 +
    (hoursSaved.transformations || 0) * 20;
  const totalHours = Math.round(totalMinutes / 6) / 10;
  const weeklyHours = Math.round(totalHours / Math.max(1, Math.ceil((Date.now() - new Date(cls?.createdAt || Date.now()).getTime()) / (7 * 86400000))) * 10) / 10;

  // ─── Bulk auto-grade discussions ────────────────────────────
  const runBulkAutoGrade = async () => {
    setAutoGradeLoading(true);
    try {
      const discussions = getClassDiscussions(classId);
      const ungradedItems = [];
      for (const disc of discussions) {
        for (const student of students) {
          if (disc.grades?.[student.id]) continue;
          const replies = (disc.replies || []).filter((r) => r.authorId === student.id);
          if (replies.length === 0) continue;
          ungradedItems.push({
            discussionId: disc.id,
            studentId: student.id,
            studentName: student.name,
            response: replies.map((r) => r.body).join(' | '),
          });
        }
      }

      if (ungradedItems.length === 0) {
        setAutoGradeResult({ message: 'All discussions are already graded!', grades: [] });
        setAutoGradeLoading(false);
        return;
      }

      const resp = await fetch('/api/auto-grade-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: ungradedItems.slice(0, 30),
          rubricScale: '1-5',
          gradeLevel: cls?.gradeLevel || 'Grade 3',
        }),
      });
      const data = await resp.json();

      if (data.grades && Array.isArray(data.grades)) {
        let graded = 0;
        for (const g of data.grades) {
          const item = ungradedItems.find((u) => u.studentId === g.studentId);
          if (item && g.grade) {
            gradeDiscussion(item.discussionId, g.studentId, g.grade);
            graded++;
          }
        }
        trackTimeSaved('aiGraded', graded);
        setAutoGradeResult({
          message: `Auto-graded ${graded} of ${ungradedItems.length} discussion responses.`,
          grades: data.grades,
        });
        onRefresh?.();
      } else {
        setAutoGradeResult({ message: 'AI response received.', raw: data.rawGrades || 'No structured data.' });
      }
    } catch (err) { console.warn('Auto-grade failed:', err.message); setAutoGradeResult({ message: 'Error: ' + err.message }); }
    setAutoGradeLoading(false);
  };

  // ─── Generate feedback drafts ───────────────────────────────
  const runFeedbackDrafts = async () => {
    setFeedbackLoading(true);
    try {
      const gameResults = getClassResults(classId);
      const studentData = students.map((s) => {
        const results = gameResults.filter((r) => r.studentId === s.id);
        const scores = results.map((r) => r.score).filter((v) => v !== undefined);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
        let trend = null;
        if (scores.length >= 4) {
          const recent = scores.slice(-Math.ceil(scores.length / 2));
          const earlier = scores.slice(0, Math.floor(scores.length / 2));
          trend = Math.round((recent.reduce((a, b) => a + b, 0) / recent.length) - (earlier.reduce((a, b) => a + b, 0) / earlier.length));
        }
        return { name: s.name, avg, gamesPlayed: results.length, trend: trend ? `${trend > 0 ? '+' : ''}${trend}%` : 'N/A' };
      }).filter((s) => s.avg !== null);

      const resp = await fetch('/api/generate-feedback-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: studentData,
          classAvg: studentData.length > 0 ? Math.round(studentData.reduce((s, d) => s + (d.avg || 0), 0) / studentData.length) : null,
          gradeLevel: cls?.gradeLevel || 'Grade 3',
          context: 'Weekly progress update',
        }),
      });
      const data = await resp.json();
      if (data.feedbacks) {
        trackTimeSaved('feedbackDrafts', data.feedbacks.length);
        setFeedbackResult(data.feedbacks);
      } else {
        setFeedbackResult([{ name: 'Result', feedback: data.rawFeedback || 'No data' }]);
      }
    } catch (err) { console.warn('Feedback generation failed:', err.message); }
    setFeedbackLoading(false);
  };

  // ─── Content transformation ─────────────────────────────────
  const runTransform = async () => {
    if (!transformInput.replace(/<[^>]*>/g, '').trim()) return;
    setTransformLoading(true);
    try {
      const resp = await fetch('/api/transform-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: transformInput, gradeLevel: cls?.gradeLevel, contentType: 'text/PDF' }),
      });
      const data = await resp.json();
      trackTimeSaved('transformations', 1);
      setTransformResult(data.module || data.rawModule);
    } catch (err) { console.warn('Content transform failed:', err.message); }
    setTransformLoading(false);
  };

  // ─── Accessibility check ────────────────────────────────────
  const runAccessCheck = async () => {
    if (!accessInput.replace(/<[^>]*>/g, '').trim()) return;
    setAccessLoading(true);
    try {
      const resp = await fetch('/api/accessibility-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: accessInput, contentType: 'educational text' }),
      });
      const data = await resp.json();
      setAccessResult(data);
    } catch (err) { console.warn('Accessibility check failed:', err.message); }
    setAccessLoading(false);
  };

  const sections = [
    { id: 'hours', label: 'Hours Saved', icon: '\u23F1\uFE0F' },
    { id: 'autograde', label: 'Bulk Auto-Grade', icon: '\u2705' },
    { id: 'attendance', label: 'Attendance', icon: '\uD83D\uDCCB' },
    { id: 'feedback', label: 'Feedback Drafts', icon: '\uD83D\uDCDD' },
    { id: 'transform', label: 'Content Transform', icon: '\uD83D\uDD04' },
    { id: 'accessibility', label: 'Accessibility', icon: '\u267F' },
    { id: 'wcag-audit', label: 'WCAG Audit', icon: '\uD83D\uDEE1\uFE0F' },
  ];

  const sevColor = { high: '#dc2626', medium: '#eab308', low: '#22c55e' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{'\u26A1'}</span>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Admin Load Reducer</h3>
        <span style={{
          padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: '#dcfce7', color: '#166534',
        }}>~{totalHours}h saved total</span>
      </div>

      <div role="tablist" aria-label="Admin tools" style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={section === s.id} tabIndex={section === s.id ? 0 : -1}
            onClick={() => setSection(s.id)} style={{
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            border: section === s.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: section === s.id ? '#eff6ff' : '#fff',
            color: section === s.id ? '#1d4ed8' : '#475569',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ fontSize: 13 }} aria-hidden="true">{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* ═══ HOURS SAVED TRACKER ═══ */}
      {section === 'hours' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Time Saved Dashboard</h4>
          <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>Estimated hours saved through automation vs. manual workflow.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{totalHours}h</div>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>Total Saved</div>
            </div>
            <div style={{ padding: 16, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{weeklyHours}h</div>
              <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Per Week Avg</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { label: 'Game auto-grading', count: hoursSaved.autoGraded || 0, time: '2 min each', icon: '\uD83C\uDFAE' },
              { label: 'AI discussion grading', count: hoursSaved.aiGraded || 0, time: '5 min each', icon: '\uD83E\uDD16' },
              { label: 'Feedback drafts generated', count: hoursSaved.feedbackDrafts || 0, time: '8 min each', icon: '\uD83D\uDCDD' },
              { label: 'Class duplications', count: hoursSaved.duplications || 0, time: '30 min each', icon: '\uD83D\uDCCB' },
              { label: 'Content transformations', count: hoursSaved.transformations || 0, time: '20 min each', icon: '\uD83D\uDD04' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Saves ~{item.time} per instance</div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#2563eb' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ BULK AUTO-GRADE ═══ */}
      {section === 'autograde' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Bulk Auto-Grade Discussions</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                AI grades all ungraded discussion responses in one click using the 5-point rubric.
              </p>
            </div>
            <button type="button" onClick={runBulkAutoGrade} disabled={autoGradeLoading} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: autoGradeLoading ? '#94a3b8' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff', cursor: autoGradeLoading ? 'wait' : 'pointer',
            }}>
              {autoGradeLoading ? 'Grading...' : 'Auto-Grade All'}
            </button>
          </div>

          {autoGradeResult && (
            <div style={{ padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#065f46', marginBottom: 8 }}>{autoGradeResult.message}</div>
              {autoGradeResult.grades && autoGradeResult.grades.length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {autoGradeResult.grades.map((g, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 6, background: '#fff', border: '1px solid #dcfce7', fontSize: 12,
                    }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', minWidth: 100 }}>{g.studentId?.replace?.('s-', '') || g.name || 'Student'}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontWeight: 800,
                        background: g.grade >= 4 ? '#dcfce7' : g.grade >= 3 ? '#fef9c3' : '#fef2f2',
                        color: g.grade >= 4 ? '#166534' : g.grade >= 3 ? '#854d0e' : '#991b1b',
                      }}>{g.grade}/5</span>
                      <span style={{ flex: 1, color: '#64748b' }}>{g.feedback}</span>
                    </div>
                  ))}
                </div>
              )}
              {autoGradeResult.raw && (
                <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap', marginTop: 8 }}>{autoGradeResult.raw}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ ATTENDANCE ═══ */}
      {section === 'attendance' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, overflow: 'auto' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Activity-Based Attendance</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
            Presence detected from game sessions, discussion replies, and exit ticket submissions. Last 14 days.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>Student</th>
                {(attendance[0]?.days || []).map((d) => (
                  <th key={d} style={{ padding: '4px 2px', textAlign: 'center', fontWeight: 600, color: '#94a3b8', fontSize: 9, borderBottom: '1px solid #e2e8f0', minWidth: 28 }}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                  </th>
                ))}
                <th style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((s) => (
                <tr key={s.id}>
                  <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                    {s.name}
                  </td>
                  {(s.days || []).map((d) => {
                    const present = (s.activityByDay[d] || 0) > 0;
                    return (
                      <td key={d} style={{ padding: 2, textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 4, margin: '0 auto',
                          background: present ? '#22c55e' : '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, color: present ? '#fff' : '#cbd5e1',
                        }}>
                          {present ? '\u2713' : ''}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{
                    padding: '6px 8px', textAlign: 'center', fontWeight: 800, borderBottom: '1px solid #f1f5f9',
                    color: s.attendanceRate >= 70 ? '#22c55e' : s.attendanceRate >= 40 ? '#eab308' : '#ef4444',
                  }}>
                    {s.attendanceRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ FEEDBACK DRAFTS ═══ */}
      {section === 'feedback' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>AI Feedback Drafts</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Generate personalized feedback for every student in one click. Includes parent-friendly versions.
              </p>
            </div>
            <button type="button" onClick={runFeedbackDrafts} disabled={feedbackLoading} style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: feedbackLoading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', cursor: feedbackLoading ? 'wait' : 'pointer',
            }}>
              {feedbackLoading ? 'Generating...' : 'Generate All Feedback'}
            </button>
          </div>

          {feedbackResult && (
            <div style={{ display: 'grid', gap: 10 }}>
              {feedbackResult.map((f, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#6d28d9', marginBottom: 6 }}>{f.name}</div>
                  <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, marginBottom: 8 }}>{f.feedback}</div>
                  {f.parentVersion && (
                    <details>
                      <summary style={{ fontSize: 12, color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>Parent Communication Version</summary>
                      <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, marginTop: 6, padding: '8px 12px', background: '#fff', borderRadius: 6 }}>{f.parentVersion}</div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ CONTENT TRANSFORM ═══ */}
      {section === 'transform' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Content Transformer</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
            Paste text or PDF content to transform it into a structured, interactive learning module.
          </p>
          <RichTextEditor value={transformInput} onChange={setTransformInput} placeholder="Paste your lesson text, PDF content, or textbook excerpt here..." compact minHeight={60} />
          <button type="button" onClick={runTransform} disabled={transformLoading || !transformInput.replace(/<[^>]*>/g, '').trim()} style={{
            marginTop: 10, padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
            background: transformLoading ? '#94a3b8' : '#2563eb', color: '#fff', cursor: 'pointer',
          }}>
            {transformLoading ? 'Transforming...' : 'Transform to Interactive Module'}
          </button>

          {transformResult && typeof transformResult === 'object' && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
              <h5 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: '#0c4a6e' }}>{transformResult.title}</h5>
              {transformResult.objectives && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>Learning Objectives:</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {transformResult.objectives.map((o, i) => <li key={i} style={{ fontSize: 12, color: '#1e293b', marginBottom: 2 }}>{o}</li>)}
                  </ul>
                </div>
              )}
              {transformResult.vocabulary && transformResult.vocabulary.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 4 }}>Key Vocabulary:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {transformResult.vocabulary.map((v, i) => (
                      <span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: '#fff', border: '1px solid #bae6fd', fontSize: 11 }}>
                        <strong>{v.term}</strong>: {v.definition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(transformResult.sections || []).map((s, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#fff', border: '1px solid #e0f2fe' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{s.header}</div>
                  {s.type === 'content' && <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{s.content}</div>}
                  {s.type === 'quiz' && s.questions && s.questions.map((q, j) => (
                    <div key={j} style={{ marginTop: 8, padding: 8, borderRadius: 6, background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#92400e', marginBottom: 4 }}>{q.question}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(q.options || []).map((opt, k) => (
                          <span key={k} style={{
                            padding: '3px 10px', borderRadius: 4, fontSize: 11,
                            background: opt === q.correct ? '#dcfce7' : '#fff',
                            border: opt === q.correct ? '1px solid #22c55e' : '1px solid #e2e8f0',
                            fontWeight: opt === q.correct ? 700 : 400,
                          }}>{opt}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {transformResult.summary && (
                <div style={{ padding: 10, borderRadius: 6, background: '#ecfdf5', border: '1px solid #a7f3d0', fontSize: 12, color: '#065f46' }}>
                  <strong>Summary:</strong> {transformResult.summary}
                </div>
              )}
            </div>
          )}
          {transformResult && typeof transformResult === 'string' && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap' }}>{transformResult}</div>
          )}
        </div>
      )}

      {/* ═══ ACCESSIBILITY CHECK ═══ */}
      {section === 'accessibility' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800 }}>Content Accessibility Checker</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
            Paste any content to check reading level, inclusivity, cognitive load, and accessibility.
          </p>
          <RichTextEditor value={accessInput} onChange={setAccessInput} placeholder="Paste assignment text, discussion prompt, or any content to check..." compact minHeight={60} />
          <button type="button" onClick={runAccessCheck} disabled={accessLoading || !accessInput.replace(/<[^>]*>/g, '').trim()} style={{
            marginTop: 10, padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
            background: accessLoading ? '#94a3b8' : '#0ea5e9', color: '#fff', cursor: 'pointer',
          }}>
            {accessLoading ? 'Checking...' : 'Run Accessibility Check'}
          </button>

          {accessResult && (
            <div style={{ marginTop: 16 }}>
              {/* Score header */}
              {accessResult.score != null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12,
                  background: accessResult.score >= 80 ? '#f0fdf4' : accessResult.score >= 60 ? '#fffbeb' : '#fef2f2',
                  border: `1px solid ${accessResult.score >= 80 ? '#bbf7d0' : accessResult.score >= 60 ? '#fde68a' : '#fecaca'}`,
                  marginBottom: 14,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: accessResult.score >= 80 ? '#22c55e' : accessResult.score >= 60 ? '#eab308' : '#ef4444',
                    color: '#fff', fontSize: 20, fontWeight: 800,
                  }}>{accessResult.grade || accessResult.score}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>Accessibility Score: {accessResult.score}/100</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Reading Level: {accessResult.readingLevel || 'N/A'}
                      {accessResult.summary && ` · ${accessResult.summary}`}
                    </div>
                  </div>
                </div>
              )}

              {/* Issues */}
              {accessResult.issues && accessResult.issues.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>Issues Found ({accessResult.issues.length})</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {accessResult.issues.map((issue, i) => (
                      <div key={i} style={{
                        padding: '10px 14px', borderRadius: 8, background: '#fff',
                        border: `1px solid ${(sevColor[issue.severity] || '#e2e8f0')}40`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                            background: (sevColor[issue.severity] || '#94a3b8') + '18',
                            color: sevColor[issue.severity] || '#94a3b8', textTransform: 'uppercase',
                          }}>{issue.severity}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{issue.category}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{issue.issue}</div>
                        <div style={{ fontSize: 11, color: '#2563eb', marginTop: 2 }}>{issue.suggestion}</div>
                        {issue.line && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, fontStyle: 'italic' }}>"{issue.line}"</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {accessResult.strengths && accessResult.strengths.length > 0 && (
                <div style={{ padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#065f46', marginBottom: 4 }}>Strengths</div>
                  {accessResult.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#166534', marginBottom: 2 }}>{'\u2713'} {s}</div>
                  ))}
                </div>
              )}

              {accessResult.rawCheck && (
                <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', fontSize: 12, whiteSpace: 'pre-wrap', color: '#475569' }}>{accessResult.rawCheck}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ WCAG AUDIT & COMPLIANCE ═══ */}
      {section === 'wcag-audit' && <AccessibilityAudit />}
    </div>
  );
}
