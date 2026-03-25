import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getUserFriendlyError } from '../utils/errorMessages';

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function SCORMPlayer({ classId, studentId, isTeacher = false }) {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');
  const iframeRef = useRef(null);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`/api/scorm/${classId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) { setPackages(data.packages || []); setError(''); }
    } catch (err) {
      console.warn('Failed to fetch SCORM packages:', err);
      setError(getUserFriendlyError(err, 'load SCORM packages'));
    }
  };

  useEffect(() => { if (classId) fetchPackages(); }, [classId]);

  const uploadPackage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('scorm', file);
    formData.append('title', file.name.replace(/\.\w+$/, ''));
    setError('');
    try {
      const token = localStorage.getItem('quantegy-auth-token');
      const res = await fetch(`/api/scorm/${classId}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.success) fetchPackages();
    } catch (err) {
      console.warn('Failed to upload SCORM package:', err);
      setError(getUserFriendlyError(err, 'upload package'));
    }
    e.target.value = '';
  };

  const launchPackage = async (pkg) => {
    setSelectedPkg(pkg);
    setLaunching(true);
    setError('');
    try {
      const res = await fetch(`/api/scorm/${classId}/${pkg.id}/launch`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ studentId }),
      });
      const data = await res.json();
      if (data.success) setAttempt(data.attempt);
    } catch (err) {
      console.warn('Failed to launch SCORM package:', err);
      setError(getUserFriendlyError(err, 'launch package'));
    }
    setLaunching(false);
  };

  const commitData = useCallback(async (key, value) => {
    if (!attempt) return;
    try {
      await fetch(`/api/scorm/${classId}/${selectedPkg.id}/commit`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ attemptId: attempt.id, key, value }),
      });
    } catch (err) {
      console.warn('SCORM commit failed:', err);
    }
  }, [attempt, selectedPkg, classId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'scorm-commit') {
        commitData(e.data.key, e.data.value);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [commitData]);

  const deletePackage = async (id) => {
    if (!confirm('Delete this SCORM package?')) return;
    setError('');
    try {
      await fetch(`/api/scorm/${classId}/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (selectedPkg?.id === id) { setSelectedPkg(null); setAttempt(null); }
      fetchPackages();
    } catch (err) {
      console.warn('Failed to delete SCORM package:', err);
      setError(getUserFriendlyError(err, 'delete package'));
    }
  };

  if (attempt && selectedPkg) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <strong style={{ fontSize: 14, color: '#0f172a' }}>{selectedPkg.title}</strong>
            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>SCORM {selectedPkg.version}</span>
          </div>
          <button onClick={() => { setAttempt(null); setSelectedPkg(null); }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Exit</button>
        </div>
        <iframe
          ref={iframeRef}
          src={selectedPkg.entryUrl || '/scorm-placeholder.html'}
          style={{ flex: 1, border: 0 }}
          title={selectedPkg.title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>SCORM / xAPI Content</h2>
        {isTeacher && (
          <label style={{ border: 0, background: '#2563eb', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Upload Package
            <input type="file" accept=".zip,.scorm" onChange={uploadPackage} style={{ display: 'none' }} />
          </label>
        )}
      </div>
      {packages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <p style={{ fontSize: 14 }}>No SCORM packages uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260, 1fr))', gap: 12 }}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>{pkg.title}</h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>SCORM {pkg.version} — {new Date(pkg.createdAt).toLocaleDateString()}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => launchPackage(pkg)} disabled={launching} style={{ border: 0, background: '#2563eb', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {launching ? 'Loading...' : 'Launch'}
                </button>
                {isTeacher && (
                  <button onClick={() => deletePackage(pkg.id)} style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

SCORMPlayer.propTypes = {
  classId: PropTypes.string.isRequired,
  studentId: PropTypes.string,
  isTeacher: PropTypes.bool,
};
