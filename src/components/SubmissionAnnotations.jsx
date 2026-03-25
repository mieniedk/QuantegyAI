import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { getUserFriendlyError } from '../utils/errorMessages';

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const COLORS = ['#facc15', '#fb923c', '#f87171', '#34d399', '#60a5fa', '#c084fc'];

export default function SubmissionAnnotations({ submissionId, readOnly = false }) {
  const [annotations, setAnnotations] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [placing, setPlacing] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const fetchAnnotations = async () => {
    try {
      const res = await fetch(`/api/annotations/${submissionId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) { setAnnotations(data.annotations || []); setError(''); }
    } catch (err) {
      console.warn('Failed to fetch annotations:', err);
      setError(getUserFriendlyError(err, 'load annotations'));
    }
  };

  useEffect(() => { if (submissionId) fetchAnnotations(); }, [submissionId]);

  const addAnnotation = async (x, y) => {
    if (!newComment.trim()) return;
    setError('');
    try {
      const res = await fetch(`/api/annotations/${submissionId}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ pageNum, x, y, type: 'comment', content: newComment, color: selectedColor }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnotations(prev => [...prev, data.annotation]);
        setNewComment('');
        setPlacing(false);
      }
    } catch (err) {
      console.warn('Failed to add annotation:', err);
      setError(getUserFriendlyError(err, 'add annotation'));
    }
  };

  const deleteAnnotation = async (id) => {
    setError('');
    try {
      await fetch(`/api/annotations/${submissionId}/${id}`, { method: 'DELETE', headers: authHeaders() });
      setAnnotations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.warn('Failed to delete annotation:', err);
      setError(getUserFriendlyError(err, 'delete annotation'));
    }
  };

  const handleCanvasClick = (e) => {
    if (!placing || readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    addAnnotation(x, y);
  };

  const pageAnnotations = annotations.filter(a => a.pageNum === pageNum);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Annotations</h3>
        {error && <span style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>{error}</span>}
        <span style={{ fontSize: 12, color: '#64748b' }}>Page {pageNum}</span>
        <button onClick={() => setPageNum(p => Math.max(1, p - 1))} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>Prev</button>
        <button onClick={() => setPageNum(p => p + 1)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>Next</button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{annotations.length} total</span>
      </div>

      {/* Annotation canvas overlay */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: 'relative', minHeight: 400, background: '#f1f5f9',
          cursor: placing ? 'crosshair' : 'default',
          border: placing ? '2px dashed #2563eb' : '2px solid transparent',
        }}
      >
        {pageAnnotations.map(a => (
          <div key={a.id} style={{
            position: 'absolute', left: `${a.x}%`, top: `${a.y}%`,
            transform: 'translate(-50%, -100%)', zIndex: 10,
          }}>
            <div style={{
              background: a.color || '#facc15', borderRadius: 8, padding: '6px 10px',
              fontSize: 12, maxWidth: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#0f172a', fontWeight: 600,
            }}>
              {a.content}
              <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{a.authorName || 'Teacher'}</div>
              {!readOnly && (
                <button onClick={(e) => { e.stopPropagation(); deleteAnnotation(a.id); }}
                  style={{ border: 0, background: 'none', color: '#dc2626', fontSize: 10, cursor: 'pointer', padding: 0, marginTop: 2, fontWeight: 700 }}>
                  Remove
                </button>
              )}
            </div>
            <div style={{ width: 0, height: 0, margin: '0 auto', borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid ${a.color || '#facc15'}` }} />
          </div>
        ))}
        {!placing && !readOnly && (
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#94a3b8' }}>
            Click "Add Annotation" below, then click on the document to place it
          </div>
        )}
      </div>

      {/* Controls */}
      {!readOnly && (
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Type annotation comment..."
            style={{ flex: '1 1 200px', border: '1px solid #cbd5e1', borderRadius: 6, padding: '7px 10px', fontSize: 13 }}
          />
          <div style={{ display: 'flex', gap: 3 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setSelectedColor(c)} style={{
                width: 20, height: 20, borderRadius: '50%', border: selectedColor === c ? '2px solid #0f172a' : '2px solid transparent',
                background: c, cursor: 'pointer',
              }} />
            ))}
          </div>
          <button onClick={() => setPlacing(!placing)} disabled={!newComment.trim()} style={{
            border: 0, borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: placing ? '#dc2626' : '#2563eb', color: '#fff',
            opacity: newComment.trim() ? 1 : 0.5,
          }}>
            {placing ? 'Cancel Placing' : 'Add Annotation'}
          </button>
        </div>
      )}

      {/* List view */}
      {annotations.length > 0 && (
        <div style={{ padding: 12, borderTop: '1px solid #e2e8f0', maxHeight: 200, overflowY: 'auto' }}>
          {annotations.map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: a.color || '#facc15', flexShrink: 0, marginTop: 3 }} />
              <div style={{ flex: 1 }}>
                <strong>{a.authorName || 'Teacher'}</strong> (p.{a.pageNum}): {a.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SubmissionAnnotations.propTypes = {
  submissionId: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
};
