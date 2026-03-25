import React, { useMemo, useState } from 'react';
import { getAssignments, getClasses } from '../utils/storage';

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

function uniqBy(arr, key) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function splitCSVLine(line) {
  const cells = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(cell.trim());
      cell = '';
      continue;
    }
    cell += ch;
  }
  cells.push(cell.trim());
  return cells;
}

function parseCSV(text) {
  const lines = String(text || '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function normalizeStandardRow(row) {
  const code = row.code || row.standardcode || row.standard_code || row.id || '';
  if (!code) return null;
  return {
    code: String(code).trim(),
    label: String(row.label || row.standardlabel || row.name || row.title || code).trim(),
    framework: String(row.framework || row.source || '').trim(),
    subject: String(row.subject || row.domain || '').trim(),
    gradeBand: String(row.gradeband || row.grade || row.grade_level || '').trim(),
  };
}

export default function AdminMasteryPanel() {
  const [owner, setOwner] = useState(localStorage.getItem('quantegy-teacher-user') || 'admin');
  const [standards, setStandards] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [level, setLevel] = useState('district');
  const [scopeValue, setScopeValue] = useState('');
  const [dashboard, setDashboard] = useState({ rows: [], summary: { averageMastery: 0, standards: 0, records: 0 } });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [csvStatus, setCsvStatus] = useState('');
  const [standardForm, setStandardForm] = useState({ code: '', label: '', framework: '', subject: '', gradeBand: '' });
  const [mappingForm, setMappingForm] = useState({ classId: '', assignmentId: '', questionId: '', standardCode: '', standardLabel: '', weight: 1 });

  const classes = useMemo(() => getClasses(), []);
  const assignments = useMemo(() => getAssignments(), []);
  const ownerClasses = useMemo(() => classes.filter((c) => !owner || c.teacher === owner), [classes, owner]);
  const classIds = new Set(ownerClasses.map((c) => c.id));
  const ownerAssignments = useMemo(() => assignments.filter((a) => classIds.has(a.classId)), [assignments, classIds]);
  const selectedAssignment = useMemo(
    () => ownerAssignments.find((a) => a.id === mappingForm.assignmentId) || null,
    [ownerAssignments, mappingForm.assignmentId]
  );
  const questionCandidates = useMemo(() => {
    if (!selectedAssignment) return [];
    const raw = Array.isArray(selectedAssignment.questions) ? selectedAssignment.questions : [];
    return raw.map((q, i) => ({
      id: q.id || `q${i + 1}`,
      label: q.prompt || q.question || q.text || `Question ${i + 1}`,
    }));
  }, [selectedAssignment]);
  const mappingKey = (m) => `${String(m.classId || '')}|${String(m.assignmentId || '')}|${String(m.questionId || '')}|${String(m.standardCode || '').trim().toLowerCase()}`;
  const existingMapKeys = useMemo(() => new Set((mappings || []).map(mappingKey)), [mappings]);
  const pendingKey = mappingKey(mappingForm);
  const isDuplicatePendingMapping = Boolean(
    mappingForm.classId &&
    mappingForm.assignmentId &&
    mappingForm.standardCode.trim() &&
    existingMapKeys.has(pendingKey)
  );

  const fetchAll = async () => {
    if (!owner.trim()) return;
    try {
      setBusy(true);
      setError('');
      const [sRes, mRes] = await Promise.all([
        fetch(`/api/admin/standards/${encodeURIComponent(owner.trim())}`, { headers: authHeaders() }),
        fetch(`/api/admin/standards-mappings/${encodeURIComponent(owner.trim())}`, { headers: authHeaders() }),
      ]);
      const sData = await sRes.json();
      const mData = await mRes.json();
      if (!sData.success) throw new Error(sData.error || 'Failed to load standards.');
      if (!mData.success) throw new Error(mData.error || 'Failed to load mappings.');
      setStandards(sData.standards || []);
      setMappings(mData.mappings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveStandards = async (next) => {
    try {
      setBusy(true);
      setError('');
      const res = await fetch(`/api/admin/standards/${encodeURIComponent(owner.trim())}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ standards: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save standards.');
      setStandards(data.standards || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveMappings = async (next) => {
    try {
      setBusy(true);
      setError('');
      const res = await fetch(`/api/admin/standards-mappings/${encodeURIComponent(owner.trim())}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ mappings: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save mappings.');
      setMappings(data.mappings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const runDashboard = async () => {
    try {
      setBusy(true);
      setError('');
      const p = new URLSearchParams({ level });
      if (scopeValue.trim()) p.set('scopeValue', scopeValue.trim());
      const res = await fetch(`/api/admin/mastery-dashboard/${encodeURIComponent(owner.trim())}?${p.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load dashboard.');
      setDashboard({ rows: data.rows || [], summary: data.summary || {} });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = async () => {
    try {
      setBusy(true);
      setError('');
      const p = new URLSearchParams({ level, format: 'csv' });
      if (scopeValue.trim()) p.set('scopeValue', scopeValue.trim());
      const res = await fetch(`/api/admin/mastery-dashboard/${encodeURIComponent(owner.trim())}?${p.toString()}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mastery-${owner.trim() || 'owner'}-${level}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addStandard = () => {
    const code = standardForm.code.trim();
    if (!code) return;
    const next = uniqBy(
      [...standards, { ...standardForm, code, label: standardForm.label.trim() || code }],
      (s) => `${s.code}`.toLowerCase()
    );
    setStandardForm({ code: '', label: '', framework: '', subject: '', gradeBand: '' });
    saveStandards(next);
  };

  const onUploadStandardsCSV = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = parseCSV(text).map(normalizeStandardRow).filter(Boolean);
      if (!parsed.length) {
        setCsvStatus('No valid standards found in CSV.');
        return;
      }
      const merged = uniqBy([...standards, ...parsed], (s) => `${s.code}`.toLowerCase());
      setCsvStatus(`Imported ${parsed.length} row(s), total ${merged.length} standard(s).`);
      saveStandards(merged);
    } catch (e) {
      setCsvStatus(`Import failed: ${e.message}`);
    } finally {
      if (event?.target) event.target.value = '';
    }
  };

  const addMapping = () => {
    if (!mappingForm.classId || !mappingForm.assignmentId || !mappingForm.standardCode.trim()) return;
    if (isDuplicatePendingMapping) {
      setError('This mapping already exists for the same class, assignment, question, and standard.');
      return;
    }
    const next = [
      ...mappings,
      {
        classId: mappingForm.classId,
        assignmentId: mappingForm.assignmentId,
        questionId: mappingForm.questionId || null,
        standardCode: mappingForm.standardCode.trim(),
        standardLabel: mappingForm.standardLabel.trim(),
        weight: Number(mappingForm.weight) > 0 ? Number(mappingForm.weight) : 1,
      },
    ];
    setMappingForm((m) => ({ ...m, questionId: '', standardCode: '', standardLabel: '', weight: 1 }));
    saveMappings(next);
  };

  const removeStandard = (code) => saveStandards(standards.filter((s) => s.code !== code));
  const removeMapping = (idx) => saveMappings(mappings.filter((_, i) => i !== idx));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {error ? <div style={errStyle}>{error}</div> : null}
      <div style={card}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Standards Mapping and Mastery</h3>
        <p style={{ margin: '6px 0 10px', fontSize: 12, color: '#64748b' }}>
          Map standards to assignment/question items, calculate mastery, and export district/school/class analytics.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input aria-label="Mastery owner username" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Teacher owner username" style={input} />
          <button onClick={fetchAll} style={btn}>{busy ? 'Loading...' : 'Load Owner Data'}</button>
        </div>
      </div>

      <div style={{ ...card, display: 'grid', gap: 8 }}>
        <h4 style={h4}>Standards Catalog</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input type="file" accept=".csv,text/csv" onChange={onUploadStandardsCSV} />
          <span style={{ fontSize: 11, color: '#64748b' }}>CSV headers: code,label,framework,subject,gradeBand</span>
        </div>
        {csvStatus ? <div style={{ fontSize: 11, color: '#334155' }}>{csvStatus}</div> : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(120px, 1fr)) auto', gap: 8 }}>
          <input aria-label="Standard code" value={standardForm.code} onChange={(e) => setStandardForm((s) => ({ ...s, code: e.target.value }))} placeholder="Code (TEKS.3.4C)" style={input} />
          <input aria-label="Standard label" value={standardForm.label} onChange={(e) => setStandardForm((s) => ({ ...s, label: e.target.value }))} placeholder="Label" style={input} />
          <input aria-label="Standard framework" value={standardForm.framework} onChange={(e) => setStandardForm((s) => ({ ...s, framework: e.target.value }))} placeholder="Framework" style={input} />
          <input aria-label="Standard subject" value={standardForm.subject} onChange={(e) => setStandardForm((s) => ({ ...s, subject: e.target.value }))} placeholder="Subject" style={input} />
          <input aria-label="Standard grade band" value={standardForm.gradeBand} onChange={(e) => setStandardForm((s) => ({ ...s, gradeBand: e.target.value }))} placeholder="Grade Band" style={input} />
          <button onClick={addStandard} style={btn}>Add</button>
        </div>
        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          {standards.length === 0 ? <div style={empty}>No standards yet.</div> : standards.map((s) => (
            <div key={s.code} style={row}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{s.code}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{s.label || '-'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{s.framework || ''} {s.subject ? `| ${s.subject}` : ''} {s.gradeBand ? `| ${s.gradeBand}` : ''}</div>
              <button onClick={() => removeStandard(s.code)} style={dangerBtn}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, display: 'grid', gap: 8 }}>
        <h4 style={h4}>Assignment / Question Mapping</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 120px auto', gap: 8 }}>
          <select aria-label="Mapping class" value={mappingForm.classId} onChange={(e) => setMappingForm((m) => ({ ...m, classId: e.target.value, assignmentId: '', questionId: '' }))} style={input}>
            <option value="">Class</option>
            {ownerClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label="Mapping assignment" value={mappingForm.assignmentId} onChange={(e) => setMappingForm((m) => ({ ...m, assignmentId: e.target.value, questionId: '' }))} style={input}>
            <option value="">Assignment</option>
            {ownerAssignments.filter((a) => !mappingForm.classId || a.classId === mappingForm.classId).map((a) => (
              <option key={a.id} value={a.id}>{a.title || a.name || a.id}</option>
            ))}
          </select>
          <select aria-label="Mapping question" value={mappingForm.questionId || ''} onChange={(e) => setMappingForm((m) => ({ ...m, questionId: e.target.value || '' }))} style={input}>
            <option value="">Whole assignment</option>
            {questionCandidates.map((q) => <option key={q.id} value={q.id}>{q.id}: {q.label.slice(0, 40)}</option>)}
          </select>
          <input aria-label="Mapping standard code" value={mappingForm.standardCode} onChange={(e) => setMappingForm((m) => ({ ...m, standardCode: e.target.value }))} placeholder="Standard code" style={input} />
          <input aria-label="Mapping weight" type="number" min="0.1" step="0.1" value={mappingForm.weight} onChange={(e) => setMappingForm((m) => ({ ...m, weight: e.target.value }))} placeholder="Weight" style={input} />
          <button onClick={addMapping} style={{ ...btn, ...(isDuplicatePendingMapping ? disabledBtn : null) }} disabled={isDuplicatePendingMapping}>
            {isDuplicatePendingMapping ? 'Already mapped' : 'Map'}
          </button>
        </div>
        {isDuplicatePendingMapping ? (
          <div style={{ fontSize: 11, color: '#b45309' }}>
            Duplicate mapping detected. Choose a different standard or question.
          </div>
        ) : null}
        <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          {mappings.length === 0 ? <div style={empty}>No mappings yet.</div> : mappings.map((m, i) => (
            <div key={`${m.assignmentId}-${m.standardCode}-${m.questionId || 'all'}-${i}`} style={row}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{m.standardCode}</div>
              <div style={{ fontSize: 12, color: '#334155' }}>{m.assignmentId}{m.questionId ? ` / ${m.questionId}` : ''}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>class {m.classId} | weight {m.weight || 1}</div>
              <button onClick={() => removeMapping(i)} style={dangerBtn}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, display: 'grid', gap: 8 }}>
        <h4 style={h4}>Mastery Dashboards</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select aria-label="Dashboard level" value={level} onChange={(e) => setLevel(e.target.value)} style={input}>
            <option value="district">District</option>
            <option value="school">School</option>
            <option value="class">Class</option>
          </select>
          <input value={scopeValue} onChange={(e) => setScopeValue(e.target.value)} placeholder="Optional scope id (district/school/class id)" style={input} />
          <button onClick={runDashboard} style={btn}>Run Dashboard</button>
          <button onClick={exportCsv} style={ghostBtn}>Export CSV</button>
        </div>
        <div style={{ fontSize: 12, color: '#334155', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span><strong>Average:</strong> {dashboard.summary?.averageMastery ?? 0}%</span>
          <span><strong>Standards:</strong> {dashboard.summary?.standards ?? 0}</span>
          <span><strong>Rows:</strong> {dashboard.summary?.records ?? 0}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                {['Level', 'Standard', 'Source', 'Mastery', 'Mapped Items', 'Assessed/Enrolled'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: 8, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(dashboard.rows || []).map((r, i) => (
                <tr key={`${r.standardCode}-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: 8 }}>{level === 'district' ? (r.districtName || r.districtId) : level === 'school' ? (r.schoolName || r.schoolId) : (r.className || r.classId)}</td>
                  <td style={{ padding: 8 }}>{r.standardCode}</td>
                  <td style={{ padding: 8, fontSize: 11, color: '#475569' }}>{r.scoreSource || 'gradebook'}</td>
                  <td style={{ padding: 8, fontWeight: 700, color: r.mastery >= 80 ? '#15803d' : r.mastery >= 60 ? '#ca8a04' : '#dc2626' }}>{r.mastery}%</td>
                  <td style={{ padding: 8 }}>{r.mappedItems || 1}</td>
                  <td style={{ padding: 8 }}>{r.studentsAssessed || 0}/{r.studentsEnrolled || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(dashboard.rows || []).length ? <div style={empty}>No dashboard data yet. Add mappings and scores first.</div> : null}
        </div>
      </div>
    </div>
  );
}

const card = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 12,
};

const input = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12,
  minWidth: 120,
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

const disabledBtn = {
  background: '#94a3b8',
  cursor: 'not-allowed',
};

const ghostBtn = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#334155',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
};

const dangerBtn = {
  border: 0,
  background: '#dc2626',
  color: '#fff',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 11,
  fontWeight: 700,
  cursor: 'pointer',
};

const row = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr auto',
  gap: 8,
  alignItems: 'center',
  padding: 8,
  borderBottom: '1px solid #f1f5f9',
};

const h4 = { margin: 0, fontSize: 14, fontWeight: 800 };

const empty = {
  padding: 10,
  color: '#94a3b8',
  fontSize: 12,
};

const errStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12,
  fontWeight: 700,
};
