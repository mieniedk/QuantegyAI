/**
 * Actionable Analytics — Predictive performance, engagement heatmaps,
 * drop-off detection, automated interventions, cohort clustering.
 */
import React, { useState, useMemo } from 'react';

export default function ActionableAnalytics({
  students,
  gameResults,
  classAssignments,
  classId,
  classAvg,
  gradeId,
  allStandards,
  teksPerformance,
}) {
  const [predictions, setPredictions] = useState(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [cohorts, setCohorts] = useState(null);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [interventionResult, setInterventionResult] = useState(null);
  const [interventionStudent, setInterventionStudent] = useState(null);
  const [interventionLoading, setInterventionLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('heatmap');

  // ─── Compute per-student enriched data ──────────────────────
  const studentData = useMemo(() => {
    return students.map((s) => {
      const results = gameResults.filter((r) => r.studentId === s.id);
      const scores = results.map((r) => r.score).filter((v) => v !== undefined);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      const gamesPlayed = results.length;
      let trend = null;
      if (scores.length >= 4) {
        const recent = scores.slice(-Math.ceil(scores.length / 2));
        const earlier = scores.slice(0, Math.floor(scores.length / 2));
        trend = Math.round((recent.reduce((a, b) => a + b, 0) / recent.length) - (earlier.reduce((a, b) => a + b, 0) / earlier.length));
      }
      const timestamps = results.map((r) => new Date(r.timestamp).getTime()).filter(Boolean);
      const lastActive = timestamps.length > 0 ? Math.max(...timestamps) : null;
      const daysSinceActive = lastActive ? Math.round((Date.now() - lastActive) / 86400000) : null;
      const weakResults = results.filter((r) => r.score < 60 && r.teks);
      const weakStandards = [...new Set(weakResults.map((r) => r.teks))].slice(0, 4);

      // Engagement: sessions per day over last 14 days
      const dailyActivity = {};
      results.forEach((r) => {
        if (r.timestamp) {
          const day = new Date(r.timestamp).toISOString().split('T')[0];
          dailyActivity[day] = (dailyActivity[day] || 0) + 1;
        }
      });

      return { ...s, avg, gamesPlayed, trend, lastActive, daysSinceActive, weakStandards, dailyActivity, scores };
    });
  }, [students, gameResults]);

  // ─── Engagement Heatmap data (last 14 days × students) ──────
  const heatmapData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return { days, students: studentData };
  }, [studentData]);

  // ─── Drop-off detection ─────────────────────────────────────
  const dropoffs = useMemo(() => {
    return studentData
      .filter((s) => {
        if (s.gamesPlayed === 0) return false;
        return (s.daysSinceActive !== null && s.daysSinceActive >= 3) || (s.trend !== null && s.trend < -15);
      })
      .map((s) => ({
        ...s,
        reason: s.daysSinceActive >= 7 ? 'Inactive 7+ days'
          : s.daysSinceActive >= 3 ? `Inactive ${s.daysSinceActive} days`
          : `Score dropped ${Math.abs(s.trend)}%`,
        severity: s.daysSinceActive >= 7 ? 'critical'
          : s.daysSinceActive >= 5 ? 'high'
          : s.trend < -15 ? 'high'
          : 'medium',
      }))
      .sort((a, b) => {
        const sev = { critical: 3, high: 2, medium: 1 };
        return (sev[b.severity] || 0) - (sev[a.severity] || 0);
      });
  }, [studentData]);

  // ─── AI: Predictive performance ─────────────────────────────
  const runPredictions = async () => {
    setPredictLoading(true);
    try {
      const stdData = Object.entries(teksPerformance || {}).map(([teks, d]) => {
        const avg = Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length);
        return `${teks}: ${avg}%`;
      }).join(', ');

      const resp = await fetch('/api/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: studentData.map((s) => ({
            name: s.name, avg: s.avg, gamesPlayed: s.gamesPlayed,
            trend: s.trend ? `${s.trend > 0 ? '+' : ''}${s.trend}%` : 'N/A',
          })),
          classAvg,
          standardsData: stdData || 'No data',
          totalSessions: gameResults.length,
        }),
      });
      const data = await resp.json();
      if (data.success !== false) setPredictions(data);
    } catch (err) { console.warn('Predictive analytics failed:', err.message); }
    setPredictLoading(false);
  };

  // ─── AI: Cohort clustering ──────────────────────────────────
  const runCohortAnalysis = async () => {
    setCohortLoading(true);
    try {
      const resp = await fetch('/api/cohort-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: studentData.map((s) => ({
            name: s.name, avg: s.avg, gamesPlayed: s.gamesPlayed,
            trend: s.trend ? `${s.trend > 0 ? '+' : ''}${s.trend}%` : 'N/A',
            weakStandards: s.weakStandards.join(', ') || 'none',
          })),
          standardsData: Object.entries(teksPerformance || {}).map(([t, d]) =>
            `${t}: ${Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length)}%`
          ).join(', '),
        }),
      });
      const data = await resp.json();
      if (data.success !== false) setCohorts(data);
    } catch (err) { console.warn('Cohort analysis failed:', err.message); }
    setCohortLoading(false);
  };

  // ─── AI: Intervention suggestions ───────────────────────────
  const runIntervention = async (student) => {
    setInterventionStudent(student.name);
    setInterventionLoading(true);
    try {
      const resp = await fetch('/api/intervention-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          avg: student.avg,
          trend: student.trend ? `${student.trend > 0 ? '+' : ''}${student.trend}%` : 'no data',
          weakStandards: student.weakStandards.join(', ') || 'none identified',
          gamesPlayed: student.gamesPlayed,
          gradeLevel: gradeId || 'Grade 3',
        }),
      });
      const data = await resp.json();
      if (data.interventions) setInterventionResult(data.interventions);
    } catch (err) { console.warn('Intervention suggestions failed:', err.message); }
    setInterventionLoading(false);
  };

  const sevColors = { critical: '#dc2626', high: '#ea580c', medium: '#eab308' };
  const sevBg = { critical: '#fef2f2', high: '#fff7ed', medium: '#fffbeb' };

  const sections = [
    { id: 'heatmap', label: 'Engagement Heatmap', icon: '\uD83D\uDFE9' },
    { id: 'dropoff', label: 'Drop-off Detection', icon: '\u26A0\uFE0F' },
    { id: 'predict', label: 'Predictive Model', icon: '\uD83D\uDD2E' },
    { id: 'cohorts', label: 'Cohort Clusters', icon: '\uD83E\uDDEC' },
    { id: 'interventions', label: 'Interventions', icon: '\uD83D\uDCA1' },
  ];

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 22 }}>{'\uD83D\uDCCA'}</span>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Actionable Analytics</h3>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {sections.map((s) => (
          <button key={s.id} type="button" onClick={() => setActiveSection(s.id)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            border: activeSection === s.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: activeSection === s.id ? '#eff6ff' : '#fff',
            color: activeSection === s.id ? '#1d4ed8' : '#475569',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span> {s.label}
            {s.id === 'dropoff' && dropoffs.length > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 800,
                background: '#fef2f2', color: '#dc2626',
              }}>{dropoffs.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ ENGAGEMENT HEATMAP ═══ */}
      {activeSection === 'heatmap' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, overflow: 'auto' }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Student Engagement Heatmap</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
            Activity intensity over the last 14 days. Darker = more sessions. Hover for details.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%', minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>Student</th>
                  {heatmapData.days.map((d) => (
                    <th key={d} style={{ padding: '4px 2px', textAlign: 'center', fontWeight: 600, color: '#94a3b8', fontSize: 9, borderBottom: '1px solid #e2e8f0', minWidth: 30 }}>
                      {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                    </th>
                  ))}
                  <th style={{ padding: '4px 8px', textAlign: 'center', fontWeight: 700, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.students.map((s) => {
                  const total = Object.values(s.dailyActivity).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={s.id}>
                      <td style={{ padding: '6px 10px', fontWeight: 600, color: '#0f172a', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                        {s.name}
                      </td>
                      {heatmapData.days.map((d) => {
                        const count = s.dailyActivity[d] || 0;
                        const intensity = count === 0 ? '#f8fafc' : count === 1 ? '#dcfce7' : count === 2 ? '#86efac' : count <= 4 ? '#22c55e' : '#15803d';
                        return (
                          <td key={d} title={`${s.name}: ${count} session${count !== 1 ? 's' : ''} on ${d}`} style={{
                            padding: 2, textAlign: 'center', borderBottom: '1px solid #f1f5f9',
                          }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 4, background: intensity, margin: '0 auto',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: count >= 3 ? '#fff' : count > 0 ? '#065f46' : '#cbd5e1',
                            }}>
                              {count > 0 ? count : ''}
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, borderBottom: '1px solid #f1f5f9', color: total > 0 ? '#0f172a' : '#cbd5e1' }}>
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', fontSize: 11, color: '#64748b' }}>
            <span>Less</span>
            {['#f8fafc', '#dcfce7', '#86efac', '#22c55e', '#15803d'].map((c, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: '1px solid #e2e8f0' }} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}

      {/* ═══ DROP-OFF DETECTION ═══ */}
      {activeSection === 'dropoff' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Real-Time Drop-off Detection</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
            Students showing signs of disengagement or declining performance.
          </p>
          {dropoffs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: 28 }}>{'\u2705'}</span>
              <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#065f46' }}>No drop-offs detected. All active students are engaged.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {dropoffs.map((s) => (
                <div key={s.id} style={{
                  padding: '14px 18px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 14,
                  background: sevBg[s.severity], border: `1.5px solid ${sevColors[s.severity]}30`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: sevColors[s.severity] + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, color: sevColors[s.severity],
                  }}>
                    {s.severity === 'critical' ? '!!' : s.severity === 'high' ? '!' : '~'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {s.reason} · Avg: {s.avg !== null ? `${s.avg}%` : 'N/A'} · {s.gamesPlayed} games played
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                      background: sevColors[s.severity], color: '#fff', textTransform: 'uppercase',
                    }}>{s.severity}</span>
                    <button type="button" onClick={() => runIntervention(s)} style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer',
                    }}>AI Intervene</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ PREDICTIVE PERFORMANCE ═══ */}
      {activeSection === 'predict' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Predictive Performance Model</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                AI predicts end-of-unit scores, identifies at-risk students, and suggests intervention priority.
              </p>
            </div>
            <button type="button" onClick={runPredictions} disabled={predictLoading} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: predictLoading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff', cursor: predictLoading ? 'wait' : 'pointer',
            }}>
              {predictLoading ? 'Analyzing...' : 'Run Predictions'}
            </button>
          </div>

          {predictions && (
            <div style={{ display: 'grid', gap: 14 }}>
              {/* Class trajectory */}
              {predictions.classTrajectory && (
                <div style={{ padding: 14, borderRadius: 10, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0c4a6e', marginBottom: 6 }}>Class Trajectory</div>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0284c7' }}>{predictions.classTrajectory.currentAvg}%</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Current</div>
                    </div>
                    <div style={{ fontSize: 20, color: predictions.classTrajectory.trend === 'improving' ? '#22c55e' : predictions.classTrajectory.trend === 'declining' ? '#ef4444' : '#64748b' }}>
                      {predictions.classTrajectory.trend === 'improving' ? '\u2192' : predictions.classTrajectory.trend === 'declining' ? '\u2192' : '\u2192'}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{predictions.classTrajectory.predictedAvg}%</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Predicted</div>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                      background: predictions.classTrajectory.trend === 'improving' ? '#dcfce7' : predictions.classTrajectory.trend === 'declining' ? '#fef2f2' : '#f1f5f9',
                      color: predictions.classTrajectory.trend === 'improving' ? '#166534' : predictions.classTrajectory.trend === 'declining' ? '#991b1b' : '#475569',
                    }}>
                      {predictions.classTrajectory.trend}
                    </div>
                  </div>
                </div>
              )}

              {/* Student predictions table */}
              {predictions.predictions && predictions.predictions.length > 0 && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 8 }}>Student Predictions</div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {predictions.predictions.map((p, i) => {
                      const riskColor = p.riskLevel === 'critical' ? '#dc2626' : p.riskLevel === 'high' ? '#ea580c' : p.riskLevel === 'medium' ? '#eab308' : '#22c55e';
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                          borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {(p.keyFactors || []).join(' · ')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'center', minWidth: 50 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#475569' }}>{p.currentAvg}%</div>
                            <div style={{ fontSize: 9, color: '#94a3b8' }}>now</div>
                          </div>
                          <span style={{ color: '#94a3b8' }}>{'\u2192'}</span>
                          <div style={{ textAlign: 'center', minWidth: 50 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb' }}>{p.predictedEndOfUnit}%</div>
                            <div style={{ fontSize: 9, color: '#94a3b8' }}>predicted</div>
                          </div>
                          <span style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                            background: riskColor + '18', color: riskColor, textTransform: 'uppercase',
                          }}>{p.riskLevel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Intervention priority */}
              {predictions.interventionPriority && predictions.interventionPriority.length > 0 && (
                <div style={{ padding: 14, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#9a3412', marginBottom: 8 }}>Intervention Priority Queue</div>
                  {predictions.interventionPriority.map((ip, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 6, background: '#fff', border: '1px solid #fed7aa', marginBottom: 6,
                    }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
                        background: ip.urgency === 'immediate' ? '#fef2f2' : ip.urgency === 'this_week' ? '#fffbeb' : '#f8fafc',
                        color: ip.urgency === 'immediate' ? '#dc2626' : ip.urgency === 'this_week' ? '#92400e' : '#475569',
                        textTransform: 'uppercase',
                      }}>{ip.urgency}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: '#0f172a' }}>{ip.name}</span>
                        <span style={{ fontSize: 11, color: '#64748b', marginLeft: 6 }}>{ip.reason}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>{ip.action}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Raw analysis fallback */}
              {predictions.rawAnalysis && (
                <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{predictions.rawAnalysis}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ COHORT CLUSTERING ═══ */}
      {activeSection === 'cohorts' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Cohort Clustering Analysis</h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                AI groups students with similar learning patterns for targeted instruction.
              </p>
            </div>
            <button type="button" onClick={runCohortAnalysis} disabled={cohortLoading} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700,
              background: cohortLoading ? '#94a3b8' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: '#fff', cursor: cohortLoading ? 'wait' : 'pointer',
            }}>
              {cohortLoading ? 'Clustering...' : 'Run Analysis'}
            </button>
          </div>

          {cohorts && (
            <div style={{ display: 'grid', gap: 12 }}>
              {cohorts.insights && (
                <div style={{ padding: 12, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', fontSize: 13, color: '#0c4a6e', lineHeight: 1.6 }}>
                  {cohorts.insights}
                </div>
              )}
              {(cohorts.cohorts || []).map((c, i) => (
                <div key={i} style={{
                  padding: '16px 18px', borderRadius: 12,
                  border: `2px solid ${c.color || '#e2e8f0'}`,
                  background: (c.color || '#f8fafc') + '08',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color || '#3b82f6' }} />
                      <h5 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{c.label}</h5>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>
                      {c.groupSize || (c.students || []).length} students
                      {c.avgScore && ` · ${c.avgScore}% avg`}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#475569' }}>{c.characteristics}</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {(c.students || []).map((name, j) => (
                      <span key={j} style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: (c.color || '#3b82f6') + '18', color: c.color || '#3b82f6',
                      }}>{name}</span>
                    ))}
                  </div>
                  {c.sharedWeaknesses && c.sharedWeaknesses.length > 0 && (
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                      Weaknesses: {c.sharedWeaknesses.join(', ')}
                    </div>
                  )}
                  <div style={{
                    padding: '8px 12px', borderRadius: 6, background: '#f8fafc',
                    border: '1px solid #e2e8f0', fontSize: 12, color: '#1e293b',
                  }}>
                    <strong>Strategy:</strong> {c.recommendation}
                  </div>
                </div>
              ))}

              {cohorts.rawAnalysis && (
                <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{cohorts.rawAnalysis}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══ INTERVENTIONS ═══ */}
      {activeSection === 'interventions' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20 }}>
          <h4 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Automated Intervention Suggestions</h4>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b' }}>
            Click any student to get AI-generated, personalized intervention strategies.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginBottom: 16 }}>
            {studentData.filter((s) => s.avg !== null).sort((a, b) => (a.avg || 100) - (b.avg || 100)).map((s) => {
              const isSelected = interventionStudent === s.name;
              return (
                <button key={s.id} type="button" onClick={() => runIntervention(s)} disabled={interventionLoading} style={{
                  padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                  border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                  background: isSelected ? '#faf5ff' : '#fff',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {s.avg}% avg · {s.gamesPlayed} games
                    {s.trend && <span style={{ color: s.trend > 0 ? '#22c55e' : '#ef4444', marginLeft: 4 }}>
                      {s.trend > 0 ? '+' : ''}{s.trend}%
                    </span>}
                  </div>
                </button>
              );
            })}
          </div>

          {interventionLoading && (
            <div style={{ padding: 20, textAlign: 'center', color: '#7c3aed', fontWeight: 600 }}>
              Generating interventions for {interventionStudent}...
            </div>
          )}

          {interventionResult && !interventionLoading && (
            <div style={{
              padding: 16, borderRadius: 12, background: '#faf5ff', border: '1px solid #e9d5ff',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#7c3aed', marginBottom: 8 }}>
                Interventions for {interventionStudent}
              </div>
              <div style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {interventionResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
