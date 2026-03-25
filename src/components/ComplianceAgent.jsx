/**
 * Admin Compliance Agent — Autonomous agent that monitors platform compliance:
 * TEKS alignment, accessibility (WCAG), data privacy (FERPA/COPPA),
 * content quality, assessment integrity, and usage policies.
 */
import React, { useState, useMemo } from 'react';
import { getClasses, getAssignments, getGameResults } from '../utils/storage';

const SCAN_TYPES = [
  { id: 'full-audit', label: 'Full Compliance Audit', icon: '\uD83D\uDD0D', desc: 'All categories — TEKS, accessibility, privacy, content', color: '#2563eb' },
  { id: 'teks-alignment', label: 'TEKS Alignment', icon: '\uD83D\uDCCB', desc: 'Verify all classes are properly standards-aligned', color: '#7c3aed' },
  { id: 'privacy-check', label: 'Privacy & Security', icon: '\uD83D\uDD12', desc: 'FERPA, COPPA, data handling audit', color: '#059669' },
  { id: 'content-review', label: 'Content Quality', icon: '\uD83D\uDCD6', desc: 'Bias detection, readability, grade-level checks', color: '#d97706' },
];

const STATUS_STYLES = {
  pass: { bg: '#dcfce7', color: '#166534', label: 'PASS' },
  warning: { bg: '#fef9c3', color: '#854d0e', label: 'WARNING' },
  fail: { bg: '#fee2e2', color: '#991b1b', label: 'FAIL' },
  compliant: { bg: '#dcfce7', color: '#166534', label: 'COMPLIANT' },
  'at-risk': { bg: '#fef9c3', color: '#854d0e', label: 'AT RISK' },
  'non-compliant': { bg: '#fee2e2', color: '#991b1b', label: 'NON-COMPLIANT' },
};

const gradeColor = (score) => {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#84cc16';
  if (score >= 70) return '#eab308';
  if (score >= 60) return '#f97316';
  return '#ef4444';
};

export default function ComplianceAgent() {
  const [loading, setLoading] = useState(false);
  const [activeScan, setActiveScan] = useState(null);
  const [result, setResult] = useState(null);
  const [lastScan, setLastScan] = useState(null);

  const platformData = useMemo(() => {
    const classes = getClasses();
    const assignments = getAssignments();
    const results = getGameResults();
    const totalStudents = new Set();
    classes.forEach((c) => (c.students || []).forEach((s) => totalStudents.add(s.id)));

    return {
      classCount: classes.length,
      studentCount: totalStudents.size,
      assignmentCount: assignments.length,
      gameSessionCount: results.length,
      classes: classes.map((c) => ({
        name: c.name,
        gradeLevel: c.gradeLevel || c.gradeId,
        classType: c.classType,
        studentCount: (c.students || []).length,
        teksStandards: c.teksStandards || [],
        texesDomains: c.texesDomains || [],
        hasGames: (c.games || []).length > 0,
      })),
      platform: {
        name: 'Quantegy AI',
        dataStorage: 'localStorage + server sync',
        authMethod: 'username/password',
        contentTypes: ['games', 'discussions', 'exit-tickets', 'warm-ups', 'modules'],
      },
    };
  }, []);

  const runScan = async (scanType) => {
    setActiveScan(scanType);
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch('/api/compliance-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformData, scanType }),
      });
      const data = await resp.json();
      setResult(data.result || data.rawResult || null);
      setLastScan(new Date().toISOString());
    } catch (err) {
      setResult({ error: 'Failed to connect to AI. ' + err.message });
    }
    setLoading(false);
  };

  const renderStatusBadge = (status) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.warning;
    return (
      <span style={{
        padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 800,
        background: s.bg, color: s.color, textTransform: 'uppercase',
      }}>{s.label}</span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff',
        }}>{'\uD83D\uDEE1\uFE0F'}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Compliance Agent</h3>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Autonomous audits for TEKS, accessibility, privacy & content quality.
            {lastScan && <span style={{ marginLeft: 8, color: '#94a3b8' }}>Last scan: {new Date(lastScan).toLocaleString()}</span>}
          </p>
        </div>
      </div>

      {/* Scan type buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {SCAN_TYPES.map((s) => (
          <button key={s.id} type="button" onClick={() => runScan(s.id)} disabled={loading} style={{
            padding: '14px', borderRadius: 12, textAlign: 'left', cursor: loading ? 'wait' : 'pointer',
            border: activeScan === s.id ? `2px solid ${s.color}` : '1px solid #e2e8f0',
            background: activeScan === s.id && loading ? '#f8fafc' : '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.desc}</div>
            {activeScan === s.id && loading && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: s.color }}>Scanning...</div>
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      {result && typeof result === 'object' && !result.error && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>

          {/* Overall score (full-audit) */}
          {result.overallScore != null && (
            <div style={{
              padding: '20px 24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff',
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', border: `4px solid ${gradeColor(result.overallScore)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{result.overallScore}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>/100</div>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                  Compliance Grade: <span style={{ color: gradeColor(result.overallScore) }}>{result.overallGrade}</span>
                </div>
                {result.nextAuditDate && (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Next recommended audit: {result.nextAuditDate}</div>
                )}
              </div>
            </div>
          )}

          {/* Category breakdown */}
          {result.categories && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 800 }}>Category Scores</h4>
              <div style={{ display: 'grid', gap: 10 }}>
                {result.categories.map((cat, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', flex: 1 }}>{cat.name}</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: gradeColor(cat.score) }}>{cat.score}</span>
                      {renderStatusBadge(cat.status)}
                    </div>
                    <div style={{
                      height: 6, borderRadius: 3, background: '#e2e8f0', overflow: 'hidden', marginBottom: 8,
                    }}>
                      <div style={{ width: `${cat.score}%`, height: '100%', borderRadius: 3, background: gradeColor(cat.score), transition: 'width 0.5s' }} />
                    </div>
                    {cat.findings && cat.findings.length > 0 && (
                      <div style={{ marginBottom: 4 }}>
                        {cat.findings.map((f, j) => (
                          <div key={j} style={{ fontSize: 11, color: '#64748b', marginBottom: 2, paddingLeft: 10, borderLeft: '2px solid #e2e8f0' }}>{f}</div>
                        ))}
                      </div>
                    )}
                    {cat.actions && cat.actions.length > 0 && (
                      <div>
                        {cat.actions.map((a, j) => (
                          <div key={j} style={{ fontSize: 11, color: '#2563eb', marginBottom: 2 }}>{'\u2192'} {a}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical issues */}
          {result.criticalIssues && result.criticalIssues.length > 0 && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#dc2626' }}>{'\uD83D\uDEA8'} Critical Issues</h4>
              {result.criticalIssues.map((iss, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      padding: '1px 6px', borderRadius: 3, fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                      background: iss.severity === 'critical' ? '#ef4444' : iss.severity === 'high' ? '#f97316' : '#eab308',
                      color: '#fff',
                    }}>{iss.severity}</span>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{iss.issue}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{iss.remediation}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Deadline: {iss.deadline}</div>
                </div>
              ))}
            </div>
          )}

          {/* TEKS audit */}
          {result.teksAudit && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#7c3aed' }}>{'\uD83D\uDCCB'} TEKS Alignment Audit</h4>
              {result.teksAudit.map((cls, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: '#f5f3ff', border: '1px solid #e9d5ff', marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{cls.className} ({cls.gradeLevel})</div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>
                    Coverage: <strong>{cls.coverage}</strong> · Aligned: {cls.alignedCount} · Misaligned: {cls.misalignedCount}
                  </div>
                  {cls.gaps?.length > 0 && <div style={{ fontSize: 11, color: '#dc2626' }}>Gaps: {cls.gaps.join(', ')}</div>}
                  {cls.recommendations?.length > 0 && cls.recommendations.map((r, j) => (
                    <div key={j} style={{ fontSize: 11, color: '#7c3aed', marginTop: 2 }}>{'\u2192'} {r}</div>
                  ))}
                </div>
              ))}
              {result.summary && <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>{result.summary}</div>}
            </div>
          )}

          {/* Privacy check */}
          {result.privacyScore != null && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#059669' }}>{'\uD83D\uDD12'} Privacy & Security</h4>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 13 }}>
                  Score: <strong style={{ color: gradeColor(result.privacyScore) }}>{result.privacyScore}</strong>
                </div>
                <div style={{ padding: '8px 14px', borderRadius: 8, background: result.ferpaCompliant ? '#dcfce7' : '#fee2e2', fontSize: 12, fontWeight: 700 }}>
                  FERPA: {result.ferpaCompliant ? '\u2713' : '\u2717'}
                </div>
                <div style={{ padding: '8px 14px', borderRadius: 8, background: result.coppaCompliant ? '#dcfce7' : '#fee2e2', fontSize: 12, fontWeight: 700 }}>
                  COPPA: {result.coppaCompliant ? '\u2713' : '\u2717'}
                </div>
              </div>
              {result.findings?.map((f, i) => (
                <div key={i} style={{
                  padding: 10, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <strong style={{ fontSize: 12 }}>{f.area}</strong>
                    {renderStatusBadge(f.status)}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569' }}>{f.detail}</div>
                  {f.action && <div style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>{'\u2192'} {f.action}</div>}
                </div>
              ))}
              {result.summary && <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>{result.summary}</div>}
            </div>
          )}

          {/* Content quality */}
          {result.contentScore != null && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800, color: '#d97706' }}>{'\uD83D\uDCD6'} Content Quality</h4>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 13 }}>
                  Content Score: <strong style={{ color: gradeColor(result.contentScore) }}>{result.contentScore}</strong>
                </div>
                {result.biasCheck && (
                  <div style={{ padding: '8px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12 }}>
                    Bias Score: <strong style={{ color: gradeColor(result.biasCheck.score) }}>{result.biasCheck.score}</strong>
                  </div>
                )}
                {result.readabilityCheck && (
                  <div style={{ padding: '8px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12 }}>
                    Reading Level: <strong>{result.readabilityCheck.avgGradeLevel}</strong>
                  </div>
                )}
              </div>
              {result.summary && <div style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>{result.summary}</div>}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ padding: '16px 20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800, color: '#0891b2' }}>{'\uD83D\uDCA1'} Recommendations</h4>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: '#1e293b', marginBottom: 4, paddingLeft: 12, borderLeft: '2px solid #06b6d4' }}>{r}</div>
              ))}
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
