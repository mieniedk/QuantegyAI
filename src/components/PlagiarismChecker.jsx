import React, { useState, useEffect } from 'react';
import { savePlagiarismReport, getPlagiarismReport } from '../utils/storage';

const VERDICT_CONFIG = {
  likely_original: { label: 'Likely Original', bg: '#dcfce7', color: '#166534', border: '#86efac' },
  may_contain_borrowed: { label: 'May Contain Borrowed Content', bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  likely_ai_generated: { label: 'Likely AI-Generated', bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  unknown: { label: 'Inconclusive', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};

function scoreColor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  if (score >= 40) return '#ea580c';
  return '#dc2626';
}

export default function PlagiarismChecker({ content, submissionId, studentName }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (submissionId) {
      const existing = getPlagiarismReport(submissionId);
      if (existing) setReport(existing);
      else setReport(null);
    }
  }, [submissionId]);

  const handleCheck = async () => {
    if (!content || !content.replace(/<[^>]*>/g, '').trim()) {
      setError('No submission content to check.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/plagiarism-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.replace(/<[^>]*>/g, ''), submissionId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Check failed');
      const reportData = {
        submissionId,
        studentName,
        score: data.score,
        confidence: data.confidence,
        verdict: data.verdict,
        flags: data.flags || [],
        analysis: data.analysis,
      };
      const saved = savePlagiarismReport(reportData);
      setReport(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verdict = report ? (VERDICT_CONFIG[report.verdict] || VERDICT_CONFIG.unknown) : null;

  return (
    <div style={{ marginTop: 12 }}>
      {!report && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={loading || !content}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: loading ? '#94a3b8' : '#7c3aed', color: '#fff', fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {loading ? 'Analyzing...' : '\uD83D\uDD0D Check Originality'}
        </button>
      )}

      {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{error}</p>}

      {report && (
        <div style={{ marginTop: 12, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Originality Report</span>
              {studentName && <span style={{ fontSize: 12, color: '#64748b' }}>{studentName}</span>}
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: verdict.bg, color: verdict.color, border: `1px solid ${verdict.border}`,
            }}>
              {verdict.label}
            </span>
          </div>

          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: 100, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor(report.score) }}>{report.score}%</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Originality</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 100, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', textTransform: 'capitalize' }}>{report.confidence}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Confidence</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 100, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{report.flags?.length || 0}</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Flags</div>
              </div>
            </div>

            {report.analysis && (
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: '0 0 14px', padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                {report.analysis}
              </p>
            )}

            {report.flags && report.flags.length > 0 && (
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Flagged Passages</h4>
                <div style={{ display: 'grid', gap: 8 }}>
                  {report.flags.map((f, i) => (
                    <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: '#fefce8', border: '1px solid #fcd34d', fontSize: 13 }}>
                      <div style={{ fontStyle: 'italic', color: '#92400e', marginBottom: 4 }}>"{f.passage}"</div>
                      <div style={{ color: '#78350f', fontSize: 12 }}>
                        <span style={{ padding: '1px 6px', borderRadius: 4, background: '#fde68a', fontSize: 10, fontWeight: 700, marginRight: 6, textTransform: 'uppercase' }}>
                          {(f.type || 'flag').replace(/_/g, ' ')}
                        </span>
                        {f.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setReport(null); setError(null); }}
              style={{ marginTop: 14, padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              Re-check
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
