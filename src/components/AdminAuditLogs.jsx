import React, { useEffect, useMemo, useState } from 'react';
import { getAuthToken } from '../utils/storage';
import SkeletonLoader from './SkeletonLoader';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(200);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/admin/audit-logs?limit=${limit}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || 'Failed to load logs');
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (e) {
      setError(e.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [limit]);

  const filtered = useMemo(() => {
    if (filter === 'all') return logs;
    if (filter === 'errors') return logs.filter((l) => (l.statusCode || 0) >= 400);
    return logs.filter((l) => l.method === filter);
  }, [logs, filter]);

  const methodBadge = (method) => {
    const palette = {
      POST: { bg: '#eff6ff', fg: '#1d4ed8' },
      PUT: { bg: '#f0fdf4', fg: '#166534' },
      PATCH: { bg: '#faf5ff', fg: '#7c3aed' },
      DELETE: { bg: '#fef2f2', fg: '#991b1b' },
    };
    const p = palette[method] || { bg: '#f8fafc', fg: '#475569' };
    return (
      <span style={{ padding: '2px 8px', borderRadius: 999, background: p.bg, color: p.fg, fontWeight: 700, fontSize: 11 }}>
        {method}
      </span>
    );
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Admin Audit Logs</h3>
          <div style={{ marginTop: 4, fontSize: 12, color: '#64748b' }}>Tracks mutating API actions for governance and forensics.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}>
            <option value="all">All</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="errors">Errors (4xx/5xx)</option>
          </select>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}>
            <option value={100}>Last 100</option>
            <option value={200}>Last 200</option>
            <option value={500}>Last 500</option>
          </select>
          <button type="button" onClick={loadLogs} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: 10, fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 18 }}>
            <SkeletonLoader variant="table-row" />
            <SkeletonLoader variant="table-row" />
            <SkeletonLoader variant="table-row" />
            <SkeletonLoader variant="table-row" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 18, color: '#94a3b8', fontSize: 13 }}>No audit events for this filter.</div>
        ) : (
          <div style={{ maxHeight: 520, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Time', 'Actor', 'Role', 'Method', 'Path', 'Status', 'Duration'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#64748b', fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => (
                  <tr key={`${log.ts}-${idx}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', color: '#334155', whiteSpace: 'nowrap' }}>{new Date(log.ts).toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{log.actor || 'anonymous'}</td>
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{log.role || 'unknown'}</td>
                    <td style={{ padding: '8px 10px' }}>{methodBadge(log.method)}</td>
                    <td style={{ padding: '8px 10px', color: '#1e293b' }}>{log.path}</td>
                    <td style={{ padding: '8px 10px', color: (log.statusCode || 0) >= 400 ? '#dc2626' : '#166534', fontWeight: 700 }}>{log.statusCode}</td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>{log.durationMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

