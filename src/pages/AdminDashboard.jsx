/**
 * Admin ROI Dashboard — Platform-wide analytics for administrators.
 * Shows engagement metrics, ROI calculations, teacher/class performance,
 * and platform health.
 */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getClasses, getAssignments, getGrades, getGameResults } from '../utils/storage';
import ComplianceAgent from '../components/ComplianceAgent';
import DataInsightsAgent from '../components/DataInsightsAgent';
import AccreditationDashboard from '../components/AccreditationDashboard';
import AccessibilityAudit from '../components/AccessibilityAudit';
import SLODashboard from '../components/SLODashboard';
import AdminAuditLogs from '../components/AdminAuditLogs';
import DistrictHierarchyManager from '../components/DistrictHierarchyManager';
import EnterpriseProvisioningPanel from '../components/EnterpriseProvisioningPanel';
import AdminJobsPanel from '../components/AdminJobsPanel';
import AdminMasteryPanel from '../components/AdminMasteryPanel';
import DistrictOnboardingWizard from '../components/DistrictOnboardingWizard';

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');

  const data = useMemo(() => {
    const classes = getClasses();
    const assignments = getAssignments();
    const grades = getGrades();
    const gameResults = getGameResults();

    const totalStudents = new Set();
    const totalTeachers = new Set();
    let totalGameSessions = gameResults.length;
    const allScores = gameResults.map((r) => r.score).filter((v) => v !== undefined && v !== null);
    const platformAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    const classStats = classes.map((cls) => {
      const sts = cls.students || [];
      sts.forEach((s) => totalStudents.add(s.id));
      if (cls.teacher) totalTeachers.add(cls.teacher);
      const classResults = gameResults.filter((r) => r.classId === cls.id);
      const classScores = classResults.map((r) => r.score).filter((v) => v !== undefined);
      const avg = classScores.length > 0 ? Math.round(classScores.reduce((a, b) => a + b, 0) / classScores.length) : null;
      const classAssignments = assignments.filter((a) => a.classId === cls.id);

      const activeStudents = new Set(classResults.map((r) => r.studentId)).size;
      const engagementRate = sts.length > 0 ? Math.round((activeStudents / sts.length) * 100) : 0;

      // Sessions per student
      const sessionsPerStudent = sts.length > 0 ? Math.round((classResults.length / sts.length) * 10) / 10 : 0;

      // Score trend (first half vs second half)
      let trend = null;
      if (classScores.length >= 4) {
        const first = classScores.slice(0, Math.floor(classScores.length / 2));
        const second = classScores.slice(Math.ceil(classScores.length / 2));
        trend = Math.round((second.reduce((a, b) => a + b, 0) / second.length) - (first.reduce((a, b) => a + b, 0) / first.length));
      }

      return {
        ...cls, avg, studentCount: sts.length, assignmentCount: classAssignments.length,
        sessionCount: classResults.length, activeStudents, engagementRate, sessionsPerStudent, trend,
      };
    });

    // Activity over time (last 30 days)
    const dailyActivity = {};
    gameResults.forEach((r) => {
      if (r.timestamp) {
        const day = new Date(r.timestamp).toISOString().split('T')[0];
        dailyActivity[day] = (dailyActivity[day] || 0) + 1;
      }
    });
    const last30 = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last30.push({ date: key, count: dailyActivity[key] || 0 });
    }
    const maxDaily = Math.max(1, ...last30.map((d) => d.count));

    // ROI metrics
    const avgSessionsPerStudent = totalStudents.size > 0 ? Math.round((totalGameSessions / totalStudents.size) * 10) / 10 : 0;
    const classesWithData = classStats.filter((c) => c.sessionCount > 0);
    const avgEngagement = classesWithData.length > 0 ? Math.round(classesWithData.reduce((s, c) => s + c.engagementRate, 0) / classesWithData.length) : 0;
    const classesImproving = classStats.filter((c) => c.trend !== null && c.trend > 0).length;

    return {
      classes, classStats, totalStudents: totalStudents.size, totalTeachers: totalTeachers.size,
      totalClasses: classes.length, totalAssignments: assignments.length,
      totalGameSessions, platformAvg, last30, maxDaily,
      avgSessionsPerStudent, avgEngagement, classesImproving, classesWithData: classesWithData.length,
    };
  }, []);

  const getMasteryColor = (pct) => {
    if (pct >= 80) return '#22c55e';
    if (pct >= 60) return '#eab308';
    if (pct >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <div style={{
        padding: '12px 24px', background: '#0f172a', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>{'\u2190'} Home</Link>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Admin Dashboard</span>
        </div>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>Platform Analytics & ROI</span>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {/* Hero stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12, marginBottom: 24,
        }}>
          {[
            { label: 'Total Students', value: data.totalStudents, color: '#2563eb', icon: '\uD83C\uDF93' },
            { label: 'Total Classes', value: data.totalClasses, color: '#7c3aed', icon: '\uD83C\uDFEB' },
            { label: 'Game Sessions', value: data.totalGameSessions, color: '#0ea5e9', icon: '\uD83C\uDFAE' },
            { label: 'Platform Average', value: data.platformAvg ? `${data.platformAvg}%` : '--', color: getMasteryColor(data.platformAvg), icon: '\u2B50' },
            { label: 'Avg Engagement', value: `${data.avgEngagement}%`, color: data.avgEngagement >= 70 ? '#22c55e' : '#eab308', icon: '\uD83D\uDCC8' },
            { label: 'Sessions/Student', value: data.avgSessionsPerStudent, color: '#06b6d4', icon: '\uD83D\uDD04' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: '#fff', borderRadius: 12, padding: '18px 16px', textAlign: 'center',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Admin dashboard sections" style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'roi', label: 'ROI Metrics' },
            { id: 'classes', label: 'Class Performance' },
            { id: 'activity', label: 'Activity Trends' },
            { id: 'compliance', label: 'Compliance Agent' },
            { id: 'insights', label: 'Data Insights Agent' },
            { id: 'accreditation', label: 'Accreditation' },
            { id: 'accessibility', label: 'Accessibility Audit' },
            { id: 'slo', label: 'SLO Dashboard' },
            { id: 'audit-logs', label: 'Audit Logs' },
            { id: 'district', label: 'District Hierarchy' },
            { id: 'provisioning', label: 'Enterprise Provisioning' },
            { id: 'onboarding', label: 'Onboarding Wizard' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'mastery', label: 'Mastery Dashboard' },
          ].map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
              aria-controls={`admin-panel-${t.id}`} tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              border: tab === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: tab === t.id ? '#eff6ff' : '#fff',
              color: tab === t.id ? '#1d4ed8' : '#475569',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gap: 16 }}>
            {/* Activity chart */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800 }}>Daily Activity (Last 30 Days)</h3>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#64748b' }}>Game sessions per day across all classes.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
                {data.last30.map((d, i) => (
                  <div key={d.date} title={`${d.date}: ${d.count} sessions`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: '100%', maxWidth: 24, borderRadius: '4px 4px 0 0',
                      height: `${Math.max(2, (d.count / data.maxDaily) * 100)}px`,
                      background: d.count > 0 ? (i >= 23 ? '#2563eb' : '#93c5fd') : '#f1f5f9',
                      transition: 'height 0.3s',
                    }} />
                    {i % 5 === 0 && (
                      <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 4, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
                        {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Top/Bottom classes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: '#065f46' }}>Top Performing Classes</h4>
                {data.classStats.filter((c) => c.avg !== null).sort((a, b) => (b.avg || 0) - (a.avg || 0)).slice(0, 5).map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <Link to={`/teacher-class/${c.id}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>{c.name}</Link>
                    <span style={{ fontWeight: 800, color: getMasteryColor(c.avg) }}>{c.avg}%</span>
                  </div>
                ))}
                {data.classStats.filter((c) => c.avg !== null).length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No data yet.</p>
                )}
              </div>
              <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800, color: '#991b1b' }}>Classes Needing Attention</h4>
                {data.classStats.filter((c) => c.avg !== null && c.avg < 60).sort((a, b) => (a.avg || 0) - (b.avg || 0)).slice(0, 5).map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                    <Link to={`/teacher-class/${c.id}`} style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>{c.name}</Link>
                    <span style={{ fontWeight: 800, color: getMasteryColor(c.avg) }}>{c.avg}%</span>
                  </div>
                ))}
                {data.classStats.filter((c) => c.avg !== null && c.avg < 60).length === 0 && (
                  <p style={{ color: '#22c55e', fontSize: 13, margin: 0, fontWeight: 600 }}>All classes performing above 60%!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ROI METRICS ═══ */}
        {tab === 'roi' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Return on Investment</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {/* Time saved */}
                <div style={{ padding: 18, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', marginBottom: 6 }}>Teacher Time Saved</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#22c55e' }}>
                    {Math.round(data.totalGameSessions * 0.3)}h
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    Based on ~18min saved per auto-graded session vs. manual grading
                  </div>
                </div>

                {/* Student engagement */}
                <div style={{ padding: 18, borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', marginBottom: 6 }}>Student Engagement Lift</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb' }}>
                    {data.avgEngagement}%
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    Active participation rate across {data.classesWithData} class{data.classesWithData !== 1 ? 'es' : ''} with data
                  </div>
                </div>

                {/* Performance improvement */}
                <div style={{ padding: 18, borderRadius: 12, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 6 }}>Classes Improving</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#7c3aed' }}>
                    {data.classesImproving}/{data.classesWithData}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    Classes showing upward score trends over time
                  </div>
                </div>

                {/* Practice volume */}
                <div style={{ padding: 18, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', marginBottom: 6 }}>Practice Volume</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#ea580c' }}>
                    {data.avgSessionsPerStudent}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    Average game sessions per student. Target: 5+ for measurable growth.
                  </div>
                </div>
              </div>
            </div>

            {/* Cost efficiency */}
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800 }}>Cost-Benefit Summary</h4>
              <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                {[
                  { metric: 'Auto-graded assignments', value: `${data.totalGameSessions} sessions`, impact: 'Eliminates manual scoring' },
                  { metric: 'AI-generated feedback', value: 'Instant', impact: 'Replaces hours of written comments' },
                  { metric: 'Early warning alerts', value: 'Real-time', impact: 'Catch at-risk students 2-3 weeks earlier' },
                  { metric: 'Differentiated content', value: 'AI-generated', impact: 'No manual reading-level adaptation needed' },
                  { metric: 'Standards alignment', value: 'Automatic', impact: 'TEKS mapping handled by system' },
                ].map((row) => (
                  <div key={row.metric} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px',
                    borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0',
                  }}>
                    <span style={{ flex: 1, fontWeight: 600, color: '#0f172a' }}>{row.metric}</span>
                    <span style={{ fontWeight: 700, color: '#2563eb', minWidth: 100, textAlign: 'center' }}>{row.value}</span>
                    <span style={{ flex: 1, fontSize: 12, color: '#64748b' }}>{row.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ CLASS PERFORMANCE ═══ */}
        {tab === 'classes' && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800 }}>All Classes Performance</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    {['Class', 'Students', 'Engagement', 'Avg Score', 'Sessions', 'Trend', 'Assignments'].map((h) => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.classStats.sort((a, b) => (b.avg || 0) - (a.avg || 0)).map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <Link to={`/teacher-class/${c.id}`} style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>{c.name}</Link>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.classType === 'texes' ? 'TExES' : 'STAAR'} · {c.gradeLevel}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{c.studentCount}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 40, height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden' }}>
                            <div style={{ width: `${c.engagementRate}%`, height: '100%', background: c.engagementRate >= 70 ? '#22c55e' : '#eab308', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontWeight: 700, color: c.engagementRate >= 70 ? '#22c55e' : '#eab308' }}>{c.engagementRate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: c.avg !== null ? getMasteryColor(c.avg) : '#94a3b8' }}>
                        {c.avg !== null ? `${c.avg}%` : '--'}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>{c.sessionCount}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {c.trend !== null ? (
                          <span style={{
                            padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                            background: c.trend > 0 ? '#dcfce7' : c.trend < -5 ? '#fef2f2' : '#f8fafc',
                            color: c.trend > 0 ? '#166534' : c.trend < -5 ? '#991b1b' : '#64748b',
                          }}>
                            {c.trend > 0 ? '+' : ''}{c.trend}%
                          </span>
                        ) : (
                          <span style={{ color: '#cbd5e1' }}>--</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>{c.assignmentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ ACTIVITY TRENDS ═══ */}
        {tab === 'activity' && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 800 }}>Platform Activity Trends</h3>
              {/* Weekly summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 20 }}>
                {(() => {
                  const thisWeek = data.last30.slice(-7).reduce((s, d) => s + d.count, 0);
                  const lastWeek = data.last30.slice(-14, -7).reduce((s, d) => s + d.count, 0);
                  const change = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
                  const peakDay = [...data.last30].sort((a, b) => b.count - a.count)[0];
                  return [
                    { label: 'This Week', value: thisWeek, sub: `vs ${lastWeek} last week`, color: '#2563eb' },
                    { label: 'Week-over-Week', value: `${change > 0 ? '+' : ''}${change}%`, sub: change > 0 ? 'Growing' : change < 0 ? 'Declining' : 'Stable', color: change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#64748b' },
                    { label: 'Peak Day', value: peakDay?.count || 0, sub: peakDay?.date ? new Date(peakDay.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'N/A', color: '#7c3aed' },
                  ];
                })().map((stat) => (
                  <div key={stat.label} style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Daily chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140 }}>
                {data.last30.map((d, i) => (
                  <div key={d.date} title={`${d.date}: ${d.count} sessions`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>{d.count > 0 ? d.count : ''}</div>
                    <div style={{
                      width: '100%', maxWidth: 28, borderRadius: '4px 4px 0 0',
                      height: `${Math.max(4, (d.count / data.maxDaily) * 110)}px`,
                      background: i >= 23 ? '#2563eb' : i >= 16 ? '#60a5fa' : '#bfdbfe',
                    }} />
                    {i % 3 === 0 && (
                      <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Compliance Agent Tab ── */}
        {tab === 'compliance' && <ComplianceAgent />}

        {/* ── Data Insights Agent Tab ── */}
        {tab === 'insights' && <DataInsightsAgent />}

        {/* ── Accreditation Dashboard Tab ── */}
        {tab === 'accreditation' && <AccreditationDashboard />}

        {/* ── Accessibility Audit Tab ── */}
        {tab === 'accessibility' && <AccessibilityAudit />}

        {/* ── SLO Dashboard Tab ── */}
        {tab === 'slo' && <SLODashboard />}

        {/* ── Admin Audit Logs Tab ── */}
        {tab === 'audit-logs' && <AdminAuditLogs />}

        {/* ── District Hierarchy Tab ── */}
        {tab === 'district' && <DistrictHierarchyManager />}

        {/* ── Enterprise Provisioning Tab ── */}
        {tab === 'provisioning' && <EnterpriseProvisioningPanel />}

        {/* ── District Onboarding Wizard Tab ── */}
        {tab === 'onboarding' && <DistrictOnboardingWizard />}

        {/* ── Jobs Tab ── */}
        {tab === 'jobs' && <AdminJobsPanel />}

        {/* ── Mastery Tab ── */}
        {tab === 'mastery' && <AdminMasteryPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;
