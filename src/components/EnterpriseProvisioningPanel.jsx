import React, { useMemo, useState } from 'react';
import { getClasses } from '../utils/storage';

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const defaultProvisioningPayload = {
  districtId: '',
  subAccountId: '',
  schoolId: '',
  dryRun: true,
  teachers: [{ username: 'teacher.demo', password: 'Teacher123!' }],
  classes: [{ id: 'class-demo-1', name: 'Algebra 1 - Period 1', teacher: 'teacher.demo', classCode: 'ALG1P1' }],
  students: [{ username: 'student.demo1', displayName: 'Demo Student 1', classCode: 'ALG1P1', password: 'student1234' }],
  enrollments: [{ classId: 'class-demo-1', studentUsername: 'student.demo1' }],
};

const defaultRosterPayload = {
  mode: 'upsert',
  deactivateMissing: false,
  students: [
    { username: 'student.demo1', displayName: 'Demo Student 1' },
    { username: 'student.demo2', displayName: 'Demo Student 2' },
  ],
};

const defaultScopePayload = {
  districtIds: [],
  subAccountIds: [],
  schoolIds: [],
  canProvision: true,
  canSyncRoster: true,
  canManageUsers: true,
  superAdmin: false,
};

const TEMPLATE_KEY = 'allen-ace-provisioning-templates-v1';
const HISTORY_KEY = 'allen-ace-provisioning-history-v1';

const CSV_SCHEMAS = {
  teacher: ['username', 'password'],
  class: ['id', 'name', 'teacher', 'classCode', 'districtId', 'subAccountId', 'schoolId'],
  student: ['username', 'displayName', 'classCode', 'password'],
  enrollment: ['classId', 'studentUsername'],
};

function parseCSV(text) {
  const input = String(text || '').trim();
  if (!input) return { headers: [], rows: [] };
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;
  const pushField = () => { row.push(current); current = ''; };
  const pushRow = () => { if (row.some((v) => String(v || '').trim() !== '')) rows.push(row); row = []; };

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      pushField();
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      pushField();
      pushRow();
    } else {
      current += ch;
    }
  }
  pushField();
  pushRow();
  if (rows.length < 2) return { headers: [], rows: [] };

  const headers = rows[0].map((h) => String(h || '').trim());
  const data = rows.slice(1).map((vals) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = String(vals[idx] || '').trim(); });
    return obj;
  });
  return { headers, rows: data };
}

function readTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATE_KEY) || '{}'); } catch { return {}; }
}

function writeTemplates(data) {
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(data));
}

function readHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function writeHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 120)));
}

export default function EnterpriseProvisioningPanel() {
  const [scopeUsername, setScopeUsername] = useState('');
  const [scopeJson, setScopeJson] = useState(JSON.stringify(defaultScopePayload, null, 2));
  const [scopeResult, setScopeResult] = useState(null);

  const [bulkJson, setBulkJson] = useState(JSON.stringify(defaultProvisioningPayload, null, 2));
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [asyncMode, setAsyncMode] = useState(true);

  const classes = useMemo(() => getClasses(), []);
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [rosterJson, setRosterJson] = useState(JSON.stringify(defaultRosterPayload, null, 2));
  const [rosterResult, setRosterResult] = useState(null);
  const [rosterBusy, setRosterBusy] = useState(false);

  const [error, setError] = useState('');
  const [csvTarget, setCsvTarget] = useState('student');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [csvMap, setCsvMap] = useState({});
  const [csvStatus, setCsvStatus] = useState('');

  const [templateDistrictId, setTemplateDistrictId] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templatesByDistrict, setTemplatesByDistrict] = useState(readTemplates);

  const [history, setHistory] = useState(readHistory);
  const [auditTimeline, setAuditTimeline] = useState([]);
  const [auditBusy, setAuditBusy] = useState(false);

  const addHistory = (type, payload, response) => {
    const entry = {
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      type,
      ok: !!response?.success,
      payload,
      response,
    };
    const next = [entry, ...history];
    setHistory(next);
    writeHistory(next);
  };

  const waitForJob = async (jobId, { timeoutMs = 120000, pollMs = 1500 } = {}) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const res = await fetch(`/api/admin/jobs/${encodeURIComponent(jobId)}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch job status.');
      const job = data.job;
      if (job.status === 'succeeded' || job.status === 'failed') return job;
      await new Promise((r) => setTimeout(r, pollMs));
    }
    throw new Error(`Job ${jobId} timed out.`);
  };

  const runSetScope = async () => {
    try {
      setError('');
      setScopeResult(null);
      const username = scopeUsername.trim();
      if (!username) {
        setError('Enter admin username first.');
        return;
      }
      const parsed = JSON.parse(scopeJson);
      const res = await fetch(`/api/admin/scopes/${encodeURIComponent(username)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ scope: parsed }),
      });
      const data = await res.json();
      setScopeResult(data);
      addHistory('scope.update', { username, scope: parsed }, data);
      if (!data.success) setError(data.error || 'Failed to save scope.');
    } catch (e) {
      setError(e.message);
    }
  };

  const runBulkProvisioning = async (dryRunOverride = null) => {
    try {
      setError('');
      setBulkBusy(true);
      setBulkResult(null);
      const parsed = JSON.parse(bulkJson);
      if (dryRunOverride !== null) parsed.dryRun = dryRunOverride;
      const url = asyncMode ? '/api/admin/provisioning/bulk?async=1' : '/api/admin/provisioning/bulk';
      const reqBody = asyncMode ? { ...parsed, enqueue: true } : parsed;
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!data.success) {
        setBulkResult(data);
        addHistory('provisioning.bulk', parsed, data);
        setError(data.error || 'Bulk provisioning failed.');
        return;
      }
      if (data.queued && data.jobId) {
        setBulkResult({ success: true, queued: true, jobId: data.jobId, message: 'Job queued. Waiting for completion...' });
        const job = await waitForJob(data.jobId);
        const finalData = { success: job.status === 'succeeded', queued: true, job };
        setBulkResult(finalData);
        addHistory('provisioning.bulk.job', parsed, finalData);
        if (job.status !== 'succeeded') setError(job.error || 'Provisioning job failed.');
      } else {
        setBulkResult(data);
        addHistory('provisioning.bulk', parsed, data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const runRosterSync = async () => {
    try {
      setError('');
      if (!selectedClassId) {
        setError('Select a class for roster sync.');
        return;
      }
      setRosterBusy(true);
      setRosterResult(null);
      const parsed = JSON.parse(rosterJson);
      const url = asyncMode
        ? `/api/admin/roster/sync/${encodeURIComponent(selectedClassId)}?async=1`
        : `/api/admin/roster/sync/${encodeURIComponent(selectedClassId)}`;
      const reqBody = asyncMode ? { ...parsed, enqueue: true } : parsed;
      const res = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(reqBody),
      });
      const data = await res.json();
      if (!data.success) {
        setRosterResult(data);
        addHistory('roster.sync', { classId: selectedClassId, ...parsed }, data);
        setError(data.error || 'Roster sync failed.');
        return;
      }
      if (data.queued && data.jobId) {
        setRosterResult({ success: true, queued: true, jobId: data.jobId, message: 'Job queued. Waiting for completion...' });
        const job = await waitForJob(data.jobId);
        const finalData = { success: job.status === 'succeeded', queued: true, job };
        setRosterResult(finalData);
        addHistory('roster.sync.job', { classId: selectedClassId, ...parsed }, finalData);
        if (job.status !== 'succeeded') setError(job.error || 'Roster sync job failed.');
      } else {
        setRosterResult(data);
        addHistory('roster.sync', { classId: selectedClassId, ...parsed }, data);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setRosterBusy(false);
    }
  };

  const onUploadCSV = async (file) => {
    if (!file) return;
    const text = await file.text();
    const parsed = parseCSV(text);
    setCsvHeaders(parsed.headers);
    setCsvRows(parsed.rows);
    const schema = CSV_SCHEMAS[csvTarget] || [];
    const nextMap = {};
    schema.forEach((k) => {
      const match = parsed.headers.find((h) => h.toLowerCase() === k.toLowerCase());
      nextMap[k] = match || '';
    });
    setCsvMap(nextMap);
    setCsvStatus(`Loaded ${parsed.rows.length} rows, ${parsed.headers.length} columns.`);
  };

  const appendMappedRowsToPayload = () => {
    try {
      const payload = JSON.parse(bulkJson);
      const target = csvTarget;
      const rows = csvRows.map((r) => {
        const obj = {};
        (CSV_SCHEMAS[target] || []).forEach((k) => {
          const source = csvMap[k];
          obj[k] = source ? String(r[source] || '').trim() : '';
        });
        return obj;
      }).filter((r) => Object.values(r).some((v) => v));

      if (!payload[`${target}s`]) payload[`${target}s`] = [];
      if (target === 'class') payload.classes = [...(payload.classes || []), ...rows];
      else if (target === 'teacher') payload.teachers = [...(payload.teachers || []), ...rows];
      else if (target === 'student') payload.students = [...(payload.students || []), ...rows];
      else if (target === 'enrollment') payload.enrollments = [...(payload.enrollments || []), ...rows];

      setBulkJson(JSON.stringify(payload, null, 2));
      setCsvStatus(`Mapped ${rows.length} ${target} rows into provisioning payload.`);
    } catch (e) {
      setError(`Failed to merge CSV rows: ${e.message}`);
    }
  };

  const saveTemplate = () => {
    try {
      const districtId = templateDistrictId.trim();
      const name = templateName.trim();
      if (!districtId || !name) {
        setError('Template requires district ID and template name.');
        return;
      }
      const payload = JSON.parse(bulkJson);
      const all = { ...templatesByDistrict };
      const list = [...(all[districtId] || [])];
      const id = `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      list.unshift({ id, name, districtId, payload, createdAt: new Date().toISOString() });
      all[districtId] = list.slice(0, 40);
      setTemplatesByDistrict(all);
      writeTemplates(all);
      setTemplateId(id);
      setCsvStatus(`Template "${name}" saved for district ${districtId}.`);
    } catch (e) {
      setError(`Template save failed: ${e.message}`);
    }
  };

  const loadTemplate = () => {
    const districtId = templateDistrictId.trim();
    const list = templatesByDistrict[districtId] || [];
    const tpl = list.find((t) => t.id === templateId);
    if (!tpl) {
      setError('Select a valid template to load.');
      return;
    }
    setBulkJson(JSON.stringify(tpl.payload, null, 2));
    setCsvStatus(`Loaded template "${tpl.name}".`);
  };

  const deleteTemplate = () => {
    const districtId = templateDistrictId.trim();
    const all = { ...templatesByDistrict };
    all[districtId] = (all[districtId] || []).filter((t) => t.id !== templateId);
    setTemplatesByDistrict(all);
    writeTemplates(all);
    setTemplateId('');
    setCsvStatus('Template deleted.');
  };

  const refreshAuditTimeline = async () => {
    try {
      setAuditBusy(true);
      const res = await fetch('/api/admin/audit-logs?limit=200', { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load audit logs.');
      const logs = (data.logs || []).filter((l) => {
        const p = String(l.path || '');
        return p.includes('/api/admin/scopes') || p.includes('/api/admin/provisioning/bulk') || p.includes('/api/admin/roster/sync');
      });
      setAuditTimeline(logs);
    } catch (e) {
      setError(e.message);
    } finally {
      setAuditBusy(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      ) : null}

      <section style={card}>
        <h3 style={h3}>District-Level Admin Scope Editor</h3>
        <p style={sub}>Grant scoped admin permissions for district / sub-account / school boundaries.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            value={scopeUsername}
            onChange={(e) => setScopeUsername(e.target.value)}
            placeholder="Admin username"
            style={{ ...input, flex: 1 }}
          />
          <button onClick={runSetScope} style={btn}>Save Scope</button>
        </div>
        <textarea value={scopeJson} onChange={(e) => setScopeJson(e.target.value)} style={textarea} />
        {scopeResult ? <ResultBox title="Scope API Result" data={scopeResult} /> : null}
      </section>

      <section style={card}>
        <h3 style={h3}>Bulk Provisioning Runner</h3>
        <p style={sub}>Create teachers/classes/students/enrollments from one payload.</p>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155', marginBottom: 8 }}>
          <input type="checkbox" checked={asyncMode} onChange={(e) => setAsyncMode(e.target.checked)} />
          Run as background job queue (recommended for large imports)
        </label>
        <div style={{ display: 'grid', gap: 8, marginBottom: 10, padding: 10, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <strong style={{ fontSize: 12, color: '#334155' }}>CSV Import Mapper</strong>
            <select value={csvTarget} onChange={(e) => setCsvTarget(e.target.value)} style={input}>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="class">Classes</option>
              <option value="enrollment">Enrollments</option>
            </select>
            <label style={{ ...btnAlt, display: 'inline-flex', alignItems: 'center' }}>
              Upload CSV
              <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(e) => onUploadCSV(e.target.files?.[0])} />
            </label>
            <button onClick={appendMappedRowsToPayload} style={btn}>Append mapped rows</button>
          </div>
          {csvHeaders.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
              {(CSV_SCHEMAS[csvTarget] || []).map((k) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{k}</div>
                  <select value={csvMap[k] || ''} onChange={(e) => setCsvMap((m) => ({ ...m, [k]: e.target.value }))} style={{ ...input, width: '100%' }}>
                    <option value="">-- not mapped --</option>
                    {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          ) : null}
          {csvStatus ? <div style={{ fontSize: 12, color: '#475569' }}>{csvStatus}</div> : null}
        </div>

        <div style={{ display: 'grid', gap: 8, marginBottom: 10, padding: 10, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc' }}>
          <strong style={{ fontSize: 12, color: '#334155' }}>Saved Provisioning Templates by District</strong>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input value={templateDistrictId} onChange={(e) => setTemplateDistrictId(e.target.value)} placeholder="districtId" style={input} />
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="template name" style={{ ...input, flex: 1 }} />
            <button onClick={saveTemplate} style={btn}>Save Template</button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={{ ...input, minWidth: 280 }}>
              <option value="">Select template</option>
              {(templatesByDistrict[templateDistrictId.trim()] || []).map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({new Date(t.createdAt).toLocaleString()})</option>
              ))}
            </select>
            <button onClick={loadTemplate} style={btnAlt}>Load</button>
            <button onClick={deleteTemplate} style={btnDanger}>Delete</button>
          </div>
        </div>

        <textarea value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} style={textarea} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button disabled={bulkBusy} onClick={() => runBulkProvisioning(true)} style={btnAlt}>{bulkBusy ? 'Running...' : 'Run Dry-Run'}</button>
          <button disabled={bulkBusy} onClick={() => runBulkProvisioning(false)} style={btnDanger}>{bulkBusy ? 'Running...' : 'Run Apply Provisioning'}</button>
        </div>
        {bulkResult ? <ResultBox title="Bulk Provisioning Result" data={bulkResult} /> : null}
      </section>

      <section style={card}>
        <h3 style={h3}>Roster Sync Runner</h3>
        <p style={sub}>Sync class roster (upsert or full mode with deactivateMissing).</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} style={{ ...input, minWidth: 260 }}>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
          </select>
          <button disabled={rosterBusy} onClick={runRosterSync} style={btn}>{rosterBusy ? 'Running...' : 'Run Roster Sync'}</button>
        </div>
        <textarea value={rosterJson} onChange={(e) => setRosterJson(e.target.value)} style={textarea} />
        {rosterResult ? <ResultBox title="Roster Sync Result" data={rosterResult} /> : null}
      </section>

      <section style={card}>
        <h3 style={h3}>Operation History / Audit Timeline</h3>
        <p style={sub}>Track provisioning/scope/sync operations from this panel plus server audit logs.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button onClick={refreshAuditTimeline} style={btnAlt}>{auditBusy ? 'Refreshing...' : 'Refresh Server Audit Timeline'}</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }}>Local Panel History</div>
            <div style={{ maxHeight: 260, overflowY: 'auto', padding: 10 }}>
              {history.length === 0 ? <div style={{ fontSize: 12, color: '#94a3b8' }}>No local operations yet.</div> : history.map((h) => (
                <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <strong style={{ color: h.ok ? '#166534' : '#991b1b' }}>{h.type}</strong>
                    <span style={{ color: '#94a3b8' }}>{new Date(h.at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{h.ok ? 'success' : 'failed'}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ background: '#f8fafc', padding: '8px 10px', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700 }}>Server Audit Timeline</div>
            <div style={{ maxHeight: 260, overflowY: 'auto', padding: 10 }}>
              {auditTimeline.length === 0 ? <div style={{ fontSize: 12, color: '#94a3b8' }}>No server audit rows loaded.</div> : auditTimeline.map((a, idx) => (
                <div key={`${a.timestamp || a.at || idx}-${idx}`} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <strong style={{ color: '#334155' }}>{a.method} {a.path}</strong>
                    <span style={{ color: '#94a3b8' }}>{new Date(a.timestamp || a.at || Date.now()).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    actor: {a.actor || a.user || a.username || 'unknown'} | status: {a.status || 'n/a'} | ms: {a.durationMs ?? a.duration ?? 'n/a'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResultBox({ title, data }) {
  return (
    <div style={{ marginTop: 10, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#334155' }}>{title}</div>
      <pre style={{ margin: 0, padding: 10, fontSize: 12, background: '#fff', color: '#334155', overflowX: 'auto' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

const card = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
};

const h3 = { margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: '#0f172a' };
const sub = { margin: '0 0 10px', fontSize: 12, color: '#64748b' };

const input = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 13,
};

const textarea = {
  width: '100%',
  minHeight: 170,
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: 10,
  fontSize: 12,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
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

const btnAlt = {
  ...btn,
  background: '#0ea5e9',
};

const btnDanger = {
  ...btn,
  background: '#dc2626',
};

