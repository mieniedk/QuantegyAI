import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import SkeletonLoader from './SkeletonLoader';

const API_BASE = '/api/peer-reviews';

function getAuthHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function PeerReviewSetup({ students, assignment, classId, onAssign }) {
  const [reviewsPerStudent, setReviewsPerStudent] = useState(2);
  const [anonymous, setAnonymous] = useState(true);
  const [rubric, setRubric] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!assignment?.id) return;
    setLoading(true);
    fetch(`${API_BASE}/${assignment.id}`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setExisting(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [assignment?.id]);

  const handleAssign = async () => {
    const safeStudents = Array.isArray(students) ? students : [];
    const studentIds = safeStudents.map(s => typeof s === 'string' ? s : s.id || s.name);
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/assign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          assignmentId: assignment?.id,
          classId,
          anonymous,
          rubric,
          studentIds,
          reviewsPerStudent,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to assign reviewers');
      const data = await res.json();
      setExisting(data);
      onAssign?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !existing) {
    return (
      <div style={{ padding: 20 }}>
        <SkeletonLoader variant="card" />
        <div style={{ marginTop: 16 }}>
          <SkeletonLoader variant="text" count={4} />
        </div>
      </div>
    );
  }

  if (existing) {
    const pairings = existing.pairings || existing.reviews || [];
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Peer Review Assigned</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Reviews are set up for: <strong>{assignment?.name || 'Assignment'}</strong>
          {existing.anonymous && <span style={{ marginLeft: 8, fontSize: 11, background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>Anonymous</span>}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(Array.isArray(pairings) ? pairings : Object.entries(pairings).map(([reviewer, reviewees]) =>
            (Array.isArray(reviewees) ? reviewees : [reviewees]).map(reviewee => ({ reviewer, reviewee, status: 'pending' }))
          ).flat()).map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: 13, color: '#334155' }}>
                {p.reviewerName || p.reviewer} → {p.revieweeName || p.reviewee}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 12,
                background: p.status === 'submitted' ? '#dcfce7' : '#fef3c7',
                color: p.status === 'submitted' ? '#166534' : '#92400e',
              }}>
                {p.status === 'submitted' ? '✓ Submitted' : '⏳ Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Set Up Peer Review</h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Students will review each other's work for: <strong>{assignment?.name || 'Assignment'}</strong></p>

      {error && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
          Reviews per student:
          <select value={reviewsPerStudent} onChange={e => setReviewsPerStudent(parseInt(e.target.value))}
            style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)}
            style={{ width: 16, height: 16 }} />
          Anonymous reviews
        </label>
      </div>

      <button type="button" onClick={handleAssign} disabled={loading}
        style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: loading ? 'wait' : 'pointer', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Assigning...' : `Assign Reviewers (${students?.length || 0} students × ${reviewsPerStudent} reviews)`}
      </button>
    </div>
  );
}

export function PeerReviewForm({ reviewId, reviewee, assignment, anonymous, onSubmit }) {
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    if (!reviewId) return;
    fetch(`${API_BASE}/review/${reviewId}`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setReviewData(data);
          if (data.status === 'submitted') {
            setSubmitted(true);
            setScores(data.rubricScores || {});
            setFeedback(data.feedback || '');
          }
        }
      })
      .catch(() => {});
  }, [reviewId]);

  const criteria = [
    { id: 'quality', label: 'Quality of Work', description: 'Is the work complete and accurate?' },
    { id: 'clarity', label: 'Clarity', description: 'Is the work clearly presented and easy to follow?' },
    { id: 'effort', label: 'Effort & Depth', description: 'Does the work show genuine effort and understanding?' },
  ];

  const handleSubmit = async () => {
    const id = reviewId || reviewData?.id;
    if (!id) {
      onSubmit?.({
        reviewee: anonymous ? undefined : reviewee,
        scores,
        feedback,
        totalScore: Object.values(scores).reduce((s, v) => s + v, 0),
        submittedAt: new Date().toISOString(),
      });
      setSubmitted(true);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}/submit`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          score: Object.values(scores).reduce((s, v) => s + v, 0),
          feedback,
          rubricScores: scores,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to submit review');
      setSubmitted(true);
      onSubmit?.({ scores, feedback });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#059669' }}>Review Submitted!</h3>
        <p style={{ color: '#64748b', fontSize: 13 }}>Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Peer Review</h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
        {anonymous ? 'Review your peer\'s work' : `Reviewing: ${reviewee}`} — {assignment?.name || 'Assignment'}
      </p>

      {error && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      {criteria.map(c => (
        <div key={c.id} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 2 }}>{c.label}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{c.description}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setScores(prev => ({ ...prev, [c.id]: n }))}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontWeight: 800, fontSize: 14,
                  background: scores[c.id] === n ? '#2563eb' : '#f1f5f9',
                  color: scores[c.id] === n ? '#fff' : '#64748b',
                  transition: 'all 0.15s',
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 4 }}>Written Feedback</div>
        <RichTextEditor value={feedback} onChange={setFeedback}
          placeholder="What did they do well? What could be improved?" compact minHeight={60} />
      </div>

      <button type="button" onClick={handleSubmit}
        disabled={Object.keys(scores).length < criteria.length || !feedback.replace(/<[^>]*>/g, '').trim() || loading}
        style={{
          padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: Object.keys(scores).length >= criteria.length && feedback.replace(/<[^>]*>/g, '').trim() && !loading ? '#2563eb' : '#e2e8f0',
          color: Object.keys(scores).length >= criteria.length && feedback.replace(/<[^>]*>/g, '').trim() && !loading ? '#fff' : '#94a3b8',
          fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1,
        }}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
