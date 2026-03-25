import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SkeletonLoader from './SkeletonLoader';
import { apiRequest } from '../utils/apiClient';
import { getUserFriendlyError } from '../utils/errorMessages';

export default function ModeratedGrading({ assessmentId, submissionId }) {
  const [grades, setGrades] = useState([]);
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGrades = async () => {
    try {
      const res = await apiRequest(`/api/moderated-grades/${submissionId}`);
      const data = await res.json();
      if (data.success) { setGrades(data.grades || []); setError(''); }
    } catch (err) {
      console.warn('Failed to fetch moderated grades:', err);
      setError(getUserFriendlyError(err, 'load grades'));
    }
    setLoading(false);
  };

  useEffect(() => { if (submissionId) fetchGrades(); }, [submissionId]);

  const submitGrade = async () => {
    if (!score) return;
    setError('');
    try {
      const res = await apiRequest(`/api/moderated-grades/${submissionId}`, {
        method: 'POST',
        body: JSON.stringify({ assessmentId, score: Number(score), maxScore: Number(maxScore), comments }),
      });
      const data = await res.json();
      if (data.success) {
        setScore('');
        setComments('');
        fetchGrades();
      }
    } catch (err) {
      console.warn('Failed to submit moderated grade:', err);
      setError(getUserFriendlyError(err, 'submit grade'));
    }
  };

  const selectFinal = async (gradeId) => {
    setError('');
    try {
      const res = await apiRequest(`/api/moderated-grades/${submissionId}/finalize`, {
        method: 'POST',
        body: JSON.stringify({ gradeId }),
      });
      const data = await res.json();
      if (data.success) fetchGrades();
    } catch (err) {
      console.warn('Failed to finalize moderated grade:', err);
      setError(getUserFriendlyError(err, 'select final grade'));
    }
  };

  const finalGrade = grades.find(g => g.isFinal);
  const provisionalGrades = grades.filter(g => !g.isFinal);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Moderated Grading</h3>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748b' }}>Multiple graders submit scores; moderator selects the final grade.</p>
        {error && <p style={{ margin: '6px 0 0', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>{error}</p>}
      </div>

      {/* Final grade banner */}
      {finalGrade && (
        <div style={{ padding: 12, background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
            Final Grade: {finalGrade.score}/{finalGrade.maxScore} — selected by {finalGrade.selectedBy || 'moderator'}
          </div>
          {finalGrade.comments && <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>{finalGrade.comments}</div>}
        </div>
      )}

      {/* Provisional grades */}
      <div style={{ padding: 12 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#334155' }}>
          Grader Submissions ({provisionalGrades.length})
        </h4>
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" style={{ marginTop: 16 }} />
          </div>
        ) :
          provisionalGrades.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No grades submitted yet.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: '#64748b' }}>Grader</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: '#64748b' }}>Score</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: '#64748b' }}>Comments</th>
                  <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 700, color: '#64748b' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {provisionalGrades.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px' }}>{g.graderName || g.graderId}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{g.score}/{g.maxScore}</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>{g.comments || '—'}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      {!finalGrade && (
                        <button onClick={() => selectFinal(g.id)} style={{ border: 0, background: '#2563eb', color: '#fff', borderRadius: 4, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          Select as Final
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Add grade form */}
      {!finalGrade && (
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="number" value={score} onChange={e => setScore(e.target.value)} placeholder="Score" style={{ width: 70, border: '1px solid #cbd5e1', borderRadius: 6, padding: '7px 8px', fontSize: 13 }} />
          <span style={{ color: '#64748b', fontSize: 13 }}>/</span>
          <input type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} style={{ width: 70, border: '1px solid #cbd5e1', borderRadius: 6, padding: '7px 8px', fontSize: 13 }} />
          <input value={comments} onChange={e => setComments(e.target.value)} placeholder="Comments (optional)" style={{ flex: '1 1 150px', border: '1px solid #cbd5e1', borderRadius: 6, padding: '7px 10px', fontSize: 13 }} />
          <button onClick={submitGrade} disabled={!score} style={{ border: 0, background: '#2563eb', color: '#fff', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: score ? 1 : 0.5 }}>
            Submit Grade
          </button>
        </div>
      )}
    </div>
  );
}

ModeratedGrading.propTypes = {
  assessmentId: PropTypes.string.isRequired,
  submissionId: PropTypes.string.isRequired,
};
