/**
 * Data Insights Agent — Autonomous agent that analyzes platform data to
 * discover patterns, predict trends, detect anomalies, segment cohorts,
 * and generate actionable reports.
 */
import React, { useState, useMemo } from 'react';
import { getClasses, getAssignments, getGameResults, getGrades } from '../utils/storage';

const ANALYSIS_TYPES = [
  { id: 'full-analysis', label: 'Full Analysis', icon: '\uD83E\uDDE0', desc: 'Patterns, anomalies, predictions, cohorts — everything', color: '#2563eb' },
  { id: 'trend-forecast', label: 'Trend Forecast', icon: '\uD83D\uDCC8', desc: 'Predict performance trends for the next 4 weeks', color: '#7c3aed' },
  { id: 'anomaly-detection', label: 'Anomaly Detection', icon: '\u26A0\uFE0F', desc: 'Find outliers and unusual patterns', color: '#ef4444' },
  { id: 'cohort-analysis', label: 'Cohort Segmentation', icon: '\uD83D\uDC65', desc: 'Group students by behavior and performance', color: '#059669' },
];

const trendIcon = (t) => t === 'up' || t === 'improving' ? '\u2191' : t === 'down' || t === 'declining' ? '\u2193' : '\u2192';
const trendColor = (t) => t === 'up' || t === 'improving' ? '#22c55e' : t === 'down' || t === 'declining' ? '#ef4444' : '#64748b';
const severityColor = (s) => ({ critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#22c55e' })[s] || '#94a3b8';

export default function DataInsightsAgent() {
  const [loading, setLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [result, setResult] = useState(null);

  const platformData = useMemo(() => {
    const classes = getClasses();
    const assignments = getAssignments();
    const results = getGameResults();
    const grades = getGrades();

    const students = {};
    classes.forEach((c) => (c.students || []).forEach((s) => {
      if (!students[s.id]) students[s.id] = { name: s.name, classes: [], scores: [], sessions: 0 };
      students[s.id].classes.push(c.name);
    }));

    results.forEach((r) => {
      if (students[r.studentId]) {
        students[r.studentId].scores.push(r.score);
        students[r.studentId].sessions += 1;
      }
    });

    const studentSummaries = Object.entries(students).map(([id, data]) => ({
      id, name: data.name, classCount: data.classes.length,
      sessions: data.sessions,
      avgScore: data.scores.length > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length) : null,
      scoreCount: data.scores.length,
    }));

    const weeklyActivity = {};
    results.forEach((r) => {
      if (r.timestamp) {
        const date = new Date(r.timestamp);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const key = weekStart.toISOString().split('T')[0];
        if (!weeklyActivity[key]) weeklyActivity[key] = { sessions: 0, totalScore: 0, count: 0 };
        weeklyActivity[key].sessions += 1;
        if (r.score != null) { weeklyActivity[key].totalScore += r.score; weeklyActivity[key].count += 1; }
      }
    });

    return {
      classCount: classes.length,
      totalStudents: studentSummaries.length,
      totalSessions: results.length,
      totalAssignments: assignments.length,
      platformAvg: studentSummaries.filter((s) => s.avgScore != null).length > 0
        ? Math.round(studentSummaries.filter((s) => s.avgScore != null).reduce((sum, s) => sum + s.avgScore, 0) / studentSummaries.filter((s) => s.avgScore != null).length)
        : 0,
      students: studentSummaries.slice(0, 50),
      weeklyTrends: Object.entries(weeklyActivity).sort(([a], [b]) => a.localeCompare(b)).map(([week, data]) => ({
        week, sessions: data.sessions,
        avgScore: data.count > 0 ? Math.round(data.totalScore / data.count) : null,
      })),
      classes: classes.map((c) => ({
        name: c.name, type: c.classType, grade: c.gradeLevel || c.gradeId,
        studentCount: (c.students || []).length,
      })),
    };
  }, []);

  const runAnalysis = async (analysisType) => {
    setActiveAnalysis(analysisType);
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/data-insights-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformData, analysisType }),
      });
      const data = await resp.json();
      setResult(data.result || data.rawResult || null);
    } catch (err) {
      setResult({ error: 'Failed to connect to AI. ' + err.message });
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff',
        }}>{'\uD83E\uDDE0'}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Data Insights Agent</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Autonomous pattern detection, forecasting, anomaly detection & reporting.</p>
        </div>
      </div>

      {/* Analysis type buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {ANALYSIS_TYPES.map((a) => (
          <button key={a.id} type="button" onClick={() => runAnalysis(a.id)} disabled={loading} style={{
            padding: '14px', borderRadius: 12, textAlign: 'left', cursor: loading ? 'wait' : 'pointer',
            border: activeAnalysis === a.id ? `2px solid ${a.color}` : '1px solid #e2e8f0',
            background: activeAnalysis === a.id && loading ? '#f8fafc' : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: a.color }}>{a.label}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{a.desc}</div>
            {activeAnalysis === a.id && loading && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: a.color }}>Analyzing data...</div>
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
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0c4a6e', marginBottom: 4 }}>{'\uD83D\uDCCA'} Executive Summary</div>
              <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6 }}>{result.summary}</div>
            </div>
          )}

          {/* Key Metrics */}
          {result.keyMetrics && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Key Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                {result.keyMetrics.map((m, i) => (
                  <div key={i} style={{
                    padding: '12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{m.metric}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: trendColor(m.trend) }}>
                      {trendIcon(m.trend)} {m.trend}
                    </span>
                    {m.significance === 'high' && <span style={{ marginLeft: 4, fontSize: 9, color: '#ef4444', fontWeight: 800 }}>!</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patterns */}
          {result.patterns && result.patterns.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{'\uD83D\uDD0D'} Patterns Discovered</h4>
              {result.patterns.map((p, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#f5f3ff', border: '1px solid #e9d5ff', marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{p.pattern}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{'\uD83D\uDCCA'} Evidence: {p.evidence}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>{'\uD83C\uDFAF'} Impact: {p.impact}</div>
                  <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>{'\u2192'} Action: {p.actionable}</div>
                </div>
              ))}
            </div>
          )}

          {/* Anomalies */}
          {result.anomalies && result.anomalies.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#ef4444' }}>{'\u26A0\uFE0F'} Anomalies Detected</h4>
              {result.anomalies.map((a, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                      background: severityColor(a.severity), color: '#fff',
                    }}>{a.severity}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{a.type || 'Anomaly'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#1e293b', marginBottom: 4 }}>{a.description || a.anomaly}</div>
                  {a.evidence && <div style={{ fontSize: 11, color: '#64748b' }}>Evidence: {a.evidence}</div>}
                  {a.possibleCause && <div style={{ fontSize: 11, color: '#64748b' }}>Cause: {a.possibleCause}</div>}
                  {(a.recommendedAction || a.recommendation) && (
                    <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>{'\u2192'} {a.recommendedAction || a.recommendation}</div>
                  )}
                  {a.affectedEntities && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Affected: {a.affectedEntities.join(', ')}</div>}
                </div>
              ))}
              {result.normalRanges && (
                <div style={{ padding: 10, borderRadius: 6, background: '#f8fafc', marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Normal Ranges</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    Score: {result.normalRanges.avgScore} · Engagement: {result.normalRanges.engagement} · Sessions/week: {result.normalRanges.sessionsPerWeek}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Predictions */}
          {result.predictions && result.predictions.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0891b2' }}>{'\uD83D\uDD2E'} Predictions</h4>
              {result.predictions.map((p, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#ecfeff', border: '1px solid #a5f3fc', marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{p.prediction}</div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11 }}>
                    <span style={{ color: '#0891b2' }}>Confidence: <strong>{p.confidence}</strong></span>
                    <span style={{ color: '#64748b' }}>Timeframe: {p.timeframe}</span>
                  </div>
                  {p.basis && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Based on: {p.basis}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Forecasts */}
          {result.forecasts && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{'\uD83D\uDCC8'} 4-Week Forecasts</h4>
              {result.forecasts.map((f, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#f5f3ff', border: '1px solid #e9d5ff', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{f.metric}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Current: {f.currentValue}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: trendColor(f.trend) }}>
                      {trendIcon(f.trend)} {f.trend}
                    </span>
                  </div>
                  {f.predictedValues && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {f.predictedValues.map((pv, j) => (
                        <div key={j} style={{
                          flex: 1, padding: '8px', borderRadius: 6, background: '#fff', textAlign: 'center',
                          border: '1px solid #e9d5ff',
                        }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{pv.value}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{pv.week}</div>
                          <div style={{ fontSize: 9, color: trendColor(pv.confidence === 'high' ? 'up' : 'stable') }}>{pv.confidence}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cohorts/Segments */}
          {(result.segments || result.cohorts) && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#059669' }}>{'\uD83D\uDC65'} Student Segments</h4>
              {(result.segments || result.cohorts || []).map((seg, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{seg.segment || seg.name}</span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{seg.size} students</span>
                    {seg.riskLevel && (
                      <span style={{
                        padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 800,
                        background: severityColor(seg.riskLevel), color: '#fff', textTransform: 'uppercase',
                      }}>{seg.riskLevel}</span>
                    )}
                  </div>
                  {seg.avgScore != null && <div style={{ fontSize: 11, color: '#475569' }}>Avg Score: {seg.avgScore}%</div>}
                  {seg.characteristics && <div style={{ fontSize: 11, color: '#64748b' }}>{seg.characteristics.join(' · ')}</div>}
                  {seg.recommendation && <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 4 }}>{'\u2192'} {seg.recommendation}</div>}
                </div>
              ))}
              {result.crossCohortInsights && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Cross-Cohort Insights:</div>
                  {result.crossCohortInsights.map((ins, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#1e293b', marginBottom: 2, paddingLeft: 10, borderLeft: '2px solid #059669' }}>{ins}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Report */}
          {result.report && (
            <div style={{ padding: '16px 20px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{'\uD83D\uDCDD'} {result.report.title || 'Insights Report'}</h4>
              {result.report.highlights && result.report.highlights.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>{'\u2713'} Highlights</div>
                  {result.report.highlights.map((h, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#1e293b', marginBottom: 2 }}>{'\u2022'} {h}</div>
                  ))}
                </div>
              )}
              {result.report.concerns && result.report.concerns.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>{'\u26A0\uFE0F'} Concerns</div>
                  {result.report.concerns.map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#1e293b', marginBottom: 2 }}>{'\u2022'} {c}</div>
                  ))}
                </div>
              )}
              {result.report.opportunities && result.report.opportunities.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', marginBottom: 4 }}>{'\uD83D\uDCA1'} Opportunities</div>
                  {result.report.opportunities.map((o, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#1e293b', marginBottom: 2 }}>{'\u2022'} {o}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {result && typeof result === 'string' && (
        <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, whiteSpace: 'pre-wrap' }}>{result}</div>
      )}

      {result?.error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#991b1b' }}>{result.error}</div>
      )}
    </div>
  );
}
