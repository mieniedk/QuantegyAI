/**
 * Agentic Workflow — AI that autonomously scans class data and takes
 * multi-step actions: suggest assignments, auto-grade, intervene with
 * struggling students, generate feedback — all without manual prompting.
 */
import React, { useState, useMemo } from 'react';
import { getClassResults, getClassDiscussions, getAssignments, saveAssignments } from '../utils/storage';

const ACTIONS = [
  { id: 'full-scan', label: 'Full Class Scan', icon: '\uD83D\uDD0D', desc: 'Comprehensive health check — assignments, grades, interventions', color: '#2563eb' },
  { id: 'suggest-assignments', label: 'Suggest Assignments', icon: '\uD83D\uDCDD', desc: 'AI recommends targeted assignments based on gaps', color: '#7c3aed' },
  { id: 'auto-intervene', label: 'Auto-Intervene', icon: '\uD83D\uDEA8', desc: 'Identify at-risk students and generate action plans', color: '#ef4444' },
  { id: 'grade-and-feedback', label: 'Grade & Feedback', icon: '\u2705', desc: 'Auto-generate grades and feedback for all students', color: '#22c55e' },
];

export default function AgenticWorkflow({ cls, classId, students, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [result, setResult] = useState(null);
  const [executedActions, setExecutedActions] = useState([]);

  const classData = useMemo(() => {
    const results = getClassResults(classId);
    const discussions = getClassDiscussions(classId);
    const assignments = getAssignments().filter((a) => a.classId === classId);

    const studentSummaries = (students || []).map((s) => {
      const studentResults = results.filter((r) => r.studentId === s.id);
      const scores = studentResults.map((r) => r.score).filter((v) => v != null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const replyCount = discussions.reduce((sum, d) => sum + (d.replies || []).filter((r) => r.authorId === s.id).length, 0);
      return { name: s.name, id: s.id, avg, gamesPlayed: studentResults.length, replies: replyCount };
    });

    return {
      className: cls?.name,
      gradeLevel: cls?.gradeLevel,
      classType: cls?.classType,
      studentCount: students?.length || 0,
      assignmentCount: assignments.length,
      students: studentSummaries,
      classAvg: studentSummaries.filter((s) => s.avg != null).length > 0
        ? Math.round(studentSummaries.filter((s) => s.avg != null).reduce((sum, s) => sum + s.avg, 0) / studentSummaries.filter((s) => s.avg != null).length)
        : null,
    };
  }, [cls, classId, students]);

  const runAction = async (actionId) => {
    setActiveAction(actionId);
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/agentic-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classData, action: actionId }),
      });
      const data = await resp.json();
      setResult(data.result || data.rawResult || null);
    } catch (err) {
      setResult({ error: 'Failed to connect to AI. ' + err.message });
    }
    setLoading(false);
  };

  const executeAction = (action, label) => {
    setExecutedActions((prev) => [...prev, { ...action, label, executedAt: new Date().toISOString() }]);
  };

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e', critical: '#dc2626', immediate: '#ef4444', 'this-week': '#f59e0b', 'this_week': '#f59e0b', monitor: '#22c55e' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>{'\uD83E\uDD16'}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Agentic Workflow</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>AI scans your class and takes action autonomously.</p>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {ACTIONS.map((a) => (
          <button key={a.id} type="button" onClick={() => runAction(a.id)} disabled={loading} style={{
            padding: '16px 14px', borderRadius: 12, textAlign: 'left', cursor: loading ? 'wait' : 'pointer',
            border: activeAction === a.id ? `2px solid ${a.color}` : '1px solid #e2e8f0',
            background: activeAction === a.id && loading ? '#f8fafc' : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: a.color }}>{a.label}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{a.desc}</div>
            {activeAction === a.id && loading && (
              <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: a.color }}>AI analyzing...</div>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {result && typeof result === 'object' && !result.error && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Summary */}
          {result.summary && (
            <div style={{ padding: '16px 20px', background: '#f0f9ff', borderBottom: '1px solid #bae6fd' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0c4a6e', marginBottom: 4 }}>{'\uD83D\uDCCB'} AI Assessment</div>
              <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6 }}>{result.summary}</div>
            </div>
          )}

          {/* Urgent Actions */}
          {result.urgentActions && result.urgentActions.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{'\uD83D\uDEA8'} Urgent Actions</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {result.urgentActions.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca',
                  }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                      background: (priorityColor[a.priority] || '#94a3b8') + '18',
                      color: priorityColor[a.priority] || '#94a3b8', textTransform: 'uppercase',
                    }}>{a.priority}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: '#0f172a' }}>{a.action}: {a.target}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{a.reason}</div>
                    </div>
                    <button type="button" onClick={() => executeAction(a, 'urgent')} style={{
                      padding: '4px 10px', borderRadius: 5, border: 'none', background: '#ef4444',
                      color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}>Execute</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment Suggestions */}
          {(result.assignmentSuggestions || result.assignments) && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{'\uD83D\uDCDD'} Suggested Assignments</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {(result.assignmentSuggestions || result.assignments || []).map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 8, background: '#f5f3ff', border: '1px solid #e9d5ff',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {a.targetTeks || a.teks || ''} {a.difficulty ? `· ${a.difficulty}` : ''} {a.gameType ? `· ${a.gameType}` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: '#7c3aed' }}>{a.reason}</div>
                    </div>
                    <button type="button" onClick={() => executeAction(a, 'assignment')} style={{
                      padding: '6px 12px', borderRadius: 5, border: 'none', background: '#7c3aed',
                      color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>Assign</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interventions */}
          {result.interventions && result.interventions.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#dc2626' }}>{'\uD83D\uDEA8'} Student Interventions</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                {result.interventions.map((intv, i) => (
                  <div key={i} style={{
                    padding: 14, borderRadius: 10, background: '#fff', border: '1px solid #fecaca',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{intv.studentName || intv.student}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                        background: (priorityColor[intv.riskLevel || intv.urgency] || '#94a3b8') + '18',
                        color: priorityColor[intv.riskLevel || intv.urgency] || '#94a3b8', textTransform: 'uppercase',
                      }}>{intv.riskLevel || intv.urgency}</span>
                    </div>
                    {intv.indicators && (
                      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                        Indicators: {(intv.indicators || []).join(', ')}
                      </div>
                    )}
                    {(intv.suggestedActions || []).map((sa, j) => (
                      <div key={j} style={{ fontSize: 12, color: '#1e293b', marginBottom: 2 }}>
                        {'\u2022'} {sa.action || sa} <span style={{ color: '#94a3b8', fontSize: 10 }}>{sa.timeframe || ''}</span>
                      </div>
                    ))}
                    {intv.draftMessage && (
                      <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: '#fef2f2', fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>
                        "{intv.draftMessage}"
                      </div>
                    )}
                    {intv.message && !intv.draftMessage && (
                      <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: '#fef2f2', fontSize: 12, color: '#7f1d1d' }}>{intv.message}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {result.feedback && result.feedback.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#22c55e' }}>{'\u2705'} Auto-Generated Feedback</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                {result.feedback.map((f, i) => (
                  <div key={i} style={{
                    padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{f.studentName}</span>
                      {f.overallGrade && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800,
                          background: f.overallGrade === 'A' || f.overallGrade === 'B' ? '#dcfce7' : f.overallGrade === 'C' ? '#fef9c3' : '#fef2f2',
                          color: f.overallGrade === 'A' || f.overallGrade === 'B' ? '#166534' : f.overallGrade === 'C' ? '#854d0e' : '#991b1b',
                        }}>{f.overallGrade}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, marginBottom: 6 }}>{f.feedbackDraft}</div>
                    {f.strengths && <div style={{ fontSize: 11, color: '#22c55e' }}>{'\u2713'} Strengths: {f.strengths.join(', ')}</div>}
                    {f.improvements && <div style={{ fontSize: 11, color: '#f59e0b' }}>{'\u25B2'} Improve: {f.improvements.join(', ')}</div>}
                    {f.parentNote && (
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ fontSize: 11, color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>Parent Note</summary>
                        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{f.parentNote}</div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {result.insights && result.insights.length > 0 && (
            <div style={{ padding: '16px 20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: '#0891b2' }}>{'\uD83D\uDCA1'} Insights</h4>
              {result.insights.map((ins, i) => (
                <div key={i} style={{ fontSize: 12, color: '#1e293b', marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid #06b6d4' }}>{ins}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raw text result */}
      {result && typeof result === 'string' && (
        <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap', color: '#1e293b' }}>{result}</div>
      )}

      {result?.error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#991b1b' }}>{result.error}</div>
      )}

      {/* Executed actions log */}
      {executedActions.length > 0 && (
        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontWeight: 700, fontSize: 12, color: '#065f46', marginBottom: 6 }}>{'\u2705'} Actions Executed ({executedActions.length})</div>
          {executedActions.map((a, i) => (
            <div key={i} style={{ fontSize: 11, color: '#166534', marginBottom: 2 }}>
              {'\u2022'} {a.label}: {a.name || a.action || a.target || 'Action'} — {new Date(a.executedAt).toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
