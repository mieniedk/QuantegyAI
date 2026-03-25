import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const STATUS_OPTIONS = ['', 'queued', 'running', 'cancel_requested', 'succeeded', 'failed', 'cancelled'];
const TYPE_OPTIONS = ['', 'admin.provisioning.bulk', 'admin.roster.sync'];

export default function AdminJobsPanel() {
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [limit, setLimit] = useState(100);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [streamMode, setStreamMode] = useState('off');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [toasts, setToasts] = useState([]);
  const seenEventsRef = useRef(new Map());
  const toastTimersRef = useRef(new Set());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((message, level = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, level }]);
    const timeoutId = setTimeout(() => {
      removeToast(id);
      toastTimersRef.current.delete(timeoutId);
    }, 4500);
    toastTimersRef.current.add(timeoutId);
  }, [removeToast]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (type) p.set('type', type);
    p.set('limit', String(limit));
    return p.toString();
  }, [status, type, limit]);

  const fetchJobs = useCallback(async () => {
    try {
      setBusy(true);
      setError('');
      const res = await fetch(`/api/admin/jobs?${query}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load jobs.');
      setJobs(data.jobs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [query]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    if (!autoRefresh) {
      setStreamMode('off');
      return;
    }
    const token = localStorage.getItem('quantegy-auth-token');
    if (typeof EventSource === 'undefined' || !token) {
      setStreamMode('polling');
      return;
    }
    setStreamMode('connecting');
    const stream = new EventSource(`/api/admin/jobs-stream?token=${encodeURIComponent(token)}`);
    let debounce = null;
    const scheduleRefresh = () => {
      if (debounce) return;
      debounce = setTimeout(() => {
        debounce = null;
        fetchJobs();
      }, 250);
    };

    stream.onopen = () => setStreamMode('live');
    stream.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data || '{}');
        if (payload?.type === 'job' || payload?.type === 'connected') {
          scheduleRefresh();
        }
        if (payload?.type === 'job' && payload?.job?.id && payload?.event) {
          const dedupeKey = `${payload.job.id}:${payload.event}:${payload.job.status}`;
          const now = Date.now();
          const lastAt = seenEventsRef.current.get(dedupeKey) || 0;
          if (now - lastAt > 3000) {
            seenEventsRef.current.set(dedupeKey, now);
            if (payload.event === 'succeeded') pushToast(`Job ${payload.job.id.slice(0, 8)} succeeded.`, 'success');
            if (payload.event === 'failed') pushToast(`Job ${payload.job.id.slice(0, 8)} failed.`, 'error');
            if (payload.event === 'cancelled') pushToast(`Job ${payload.job.id.slice(0, 8)} cancelled.`, 'warn');
            if (payload.event === 'retry') pushToast(`Job ${payload.job.id.slice(0, 8)} queued for retry.`, 'info');
          }
        }
      } catch (err) {
        console.debug('Malformed job stream payload:', err);
      }
    };
    stream.onerror = () => setStreamMode('polling');

    return () => {
      if (debounce) clearTimeout(debounce);
      stream.close();
    };
  }, [autoRefresh, fetchJobs, pushToast]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (streamMode === 'live' || streamMode === 'connecting') return;
    const id = setInterval(fetchJobs, 4000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchJobs, streamMode]);

  useEffect(() => () => {
    toastTimersRef.current.forEach((id) => clearTimeout(id));
    toastTimersRef.current.clear();
  }, []);

  const act = async (jobId, action) => {
    try {
      const res = await fetch(`/api/admin/jobs/${encodeURIComponent(jobId)}/${action}`, {
        method: 'POST',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || `${action} failed`);
      if (action === 'retry') pushToast(`Retry requested for job ${jobId.slice(0, 8)}.`, 'info');
      if (action === 'cancel') pushToast(`Cancel requested for job ${jobId.slice(0, 8)}.`, 'warn');
      await fetchJobs();
      if (selectedJob?.id === jobId) {
        const r2 = await fetch(`/api/admin/jobs/${encodeURIComponent(jobId)}`, { headers: authHeaders() });
        const d2 = await r2.json();
        if (d2.success) setSelectedJob(d2.job);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const openDetails = async (jobId) => {
    try {
      const res = await fetch(`/api/admin/jobs/${encodeURIComponent(jobId)}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load job details');
      setSelectedJob(data.job);
    } catch (e) {
      setError(e.message);
    }
  };

  const badge = (s) => {
    const colors = {
      queued: ['#e0f2fe', '#0369a1'],
      running: ['#ede9fe', '#5b21b6'],
      cancel_requested: ['#fef3c7', '#92400e'],
      succeeded: ['#dcfce7', '#166534'],
      failed: ['#fee2e2', '#991b1b'],
      cancelled: ['#e5e7eb', '#374151'],
    };
    const [bg, fg] = colors[s] || ['#f1f5f9', '#475569'];
    return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px' }}>{s}</span>;
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 600 }}>{error}</div> : null}
      {toasts.length ? (
        <div style={{ position: 'sticky', top: 6, zIndex: 2, display: 'grid', gap: 6 }}>
          {toasts.map((t) => (
            <div key={t.id} style={{ ...toastStyle(t.level), display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>{t.message}</span>
              <button onClick={() => removeToast(t.id)} style={toastCloseBtn} aria-label="Dismiss notification">x</button>
            </div>
          ))}
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
          {STATUS_OPTIONS.map((s) => <option key={s || 'all'} value={s}>{s || 'all statuses'}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
          {TYPE_OPTIONS.map((t) => <option key={t || 'all'} value={t}>{t || 'all job types'}</option>)}
        </select>
        <select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))} style={input}>
          {[50, 100, 200, 500].map((n) => <option key={n} value={String(n)}>limit {n}</option>)}
        </select>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          live refresh
        </label>
        <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>
          mode: {streamMode}
        </span>
        <button onClick={fetchJobs} style={btn}>{busy ? 'Refreshing...' : 'Refresh now'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Jobs ({jobs.length})
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {jobs.length === 0 ? <div style={{ padding: 14, fontSize: 12, color: '#94a3b8' }}>No jobs found.</div> : jobs.map((j) => (
              <div key={j.id} style={{ borderBottom: '1px solid #f1f5f9', padding: 10, display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{j.type}</div>
                  {badge(j.status)}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' }}>{j.id}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  attempts {j.attempts}/{j.maxAttempts} | created {new Date(j.createdAt).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button onClick={() => openDetails(j.id)} style={btnGhost}>Details</button>
                  {(j.status === 'failed' || j.status === 'cancelled') ? <button onClick={() => act(j.id, 'retry')} style={btnAlt}>Retry</button> : null}
                  {(j.status === 'queued' || j.status === 'running' || j.status === 'cancel_requested')
                    ? <button onClick={() => act(j.id, 'cancel')} style={btnDanger}>Cancel</button>
                    : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Job Details
          </div>
          {!selectedJob ? (
            <div style={{ padding: 14, fontSize: 12, color: '#94a3b8' }}>Select a job to inspect full payload/result.</div>
          ) : (
            <pre style={{ margin: 0, padding: 12, maxHeight: 520, overflow: 'auto', fontSize: 11, background: '#fff', color: '#334155' }}>
              {JSON.stringify(selectedJob, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

const input = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12,
  background: '#fff',
  color: '#334155',
};

const btn = {
  border: 0,
  background: '#2563eb',
  color: '#fff',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const btnAlt = { ...btn, background: '#0ea5e9' };
const btnDanger = { ...btn, background: '#dc2626' };
const btnGhost = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const toastStyle = (level) => {
  if (level === 'success') return { background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 700 };
  if (level === 'error') return { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 700 };
  if (level === 'warn') return { background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 700 };
  return { background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 700 };
};

const toastCloseBtn = {
  border: 0,
  background: 'transparent',
  color: 'inherit',
  fontWeight: 800,
  cursor: 'pointer',
};

