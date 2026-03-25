import React, { useState, useRef } from 'react';
import { getAuthToken } from '../utils/storage';

export default function SISPanel({ classId, className }) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const headers = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const res = await fetch(`/api/sis/import-roster?classId=${classId}`, {
        method: 'POST', headers: { ...headers(), 'Content-Type': 'text/csv' }, body: text,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    }
    setImporting(false);
  };

  const exportGrades = () => {
    const token = getAuthToken();
    window.open(`/api/sis/export-grades?classId=${classId}&token=${token}`, '_blank');
  };

  const exportRoster = () => {
    const token = getAuthToken();
    window.open(`/api/sis/export-roster?classId=${classId}&token=${token}`, '_blank');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>SIS Integration</h3>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Import rosters and export grades for {className || 'this class'}.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={importing}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', fontWeight: 600, fontSize: 13, color: '#334155' }}>
          {importing ? 'Importing...' : '📥 Import Roster (CSV)'}
        </button>
        <button type="button" onClick={exportRoster}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', fontWeight: 600, fontSize: 13, color: '#334155' }}>
          📤 Export Roster
        </button>
        <button type="button" onClick={exportGrades}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc', fontWeight: 600, fontSize: 13, color: '#334155' }}>
          📊 Export Grades
        </button>
      </div>

      {result && (
        <div style={{
          padding: 12, borderRadius: 8, fontSize: 13,
          background: result.success ? '#f0fdf4' : '#fef2f2',
          color: result.success ? '#065f46' : '#991b1b',
          border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {result.success ? (
            <>
              <strong>Import complete:</strong> {result.imported} new, {result.existing} existing, {result.total} total
              {result.errors?.length > 0 && (
                <ul style={{ margin: '4px 0 0 16px', fontSize: 12 }}>
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </>
          ) : (
            <><strong>Error:</strong> {result.error}</>
          )}
        </div>
      )}

      <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b' }}>
        <strong>CSV Format:</strong> Include headers like <code>name</code>, <code>email</code>, <code>student_id</code>.
        Minimum: a <code>name</code> or <code>email</code> column. Students will be auto-enrolled in this class.
      </div>
    </div>
  );
}
