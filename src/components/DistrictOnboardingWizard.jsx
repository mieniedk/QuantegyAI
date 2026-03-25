import React, { useEffect, useMemo, useState } from 'react';
import SkeletonLoader from './SkeletonLoader';

function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function parseRosterCsv(text) {
  const input = String(text || '').trim();
  if (!input) return { headers: [], rows: [], errors: ['CSV is empty.'] };
  const lines = input.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return { headers: [], rows: [], errors: ['CSV needs a header row and at least one data row.'] };

  const headers = lines[0].split(',').map((h) => String(h || '').trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => String(c || '').trim());
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] || ''; });
    return obj;
  });
  return { headers, rows, errors: [] };
}

function passBadge(ok) {
  return {
    display: 'inline-block',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 700,
    background: ok ? '#dcfce7' : '#fee2e2',
    color: ok ? '#166534' : '#991b1b',
  };
}

export default function DistrictOnboardingWizard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState('');

  const [hierarchy, setHierarchy] = useState({ districts: [] });
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [owner, setOwner] = useState('');

  const [rosterPreview, setRosterPreview] = useState([]);
  const [rosterStats, setRosterStats] = useState(null);
  const [rosterBusy, setRosterBusy] = useState(false);

  const [standards, setStandards] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [masteryRows, setMasteryRows] = useState([]);
  const [standardsBusy, setStandardsBusy] = useState(false);

  const [providers, setProviders] = useState([]);
  const [ltiPlatforms, setLtiPlatforms] = useState([]);
  const [ltiConfig, setLtiConfig] = useState(null);
  const [classes, setClasses] = useState([]);
  const [ownerAssignments, setOwnerAssignments] = useState([]);
  const [reportBusy, setReportBusy] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [readyBusy, setReadyBusy] = useState(false);
  const [readyMessage, setReadyMessage] = useState('');
  const [historyBusy, setHistoryBusy] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);

  const selectedDistrict = useMemo(
    () => (hierarchy.districts || []).find((d) => d.id === selectedDistrictId) || null,
    [hierarchy, selectedDistrictId],
  );

  const scopedClasses = useMemo(() => {
    if (!selectedDistrictId) return classes;
    return classes.filter((c) => String(c.districtId || '') === String(selectedDistrictId));
  }, [classes, selectedDistrictId]);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) || null,
    [classes, selectedClassId],
  );

  const mappingCoverage = useMemo(() => {
    if (ownerAssignments.length === 0) return { total: 0, mapped: 0, pct: 0 };
    const mappedAssignmentIds = new Set((mappings || []).map((m) => String(m.assignmentId || '')));
    const mapped = ownerAssignments.filter((a) => mappedAssignmentIds.has(String(a.id))).length;
    const total = ownerAssignments.length;
    return { total, mapped, pct: total > 0 ? Math.round((mapped / total) * 100) : 0 };
  }, [ownerAssignments, mappings]);

  const checks = useMemo(() => {
    const districtCheck = !!selectedDistrict;
    const rosterCheck = !!rosterStats?.success;
    const standardsCheck = (standards || []).length > 0;
    const mappingCheck = (mappings || []).length > 0;
    const masteryCheck = (masteryRows || []).length > 0;
    const ssoCheck = providers.some((p) => p.configured);
    const ltiCheck = (ltiPlatforms || []).length > 0 && !!ltiConfig?.oidcInitiationUrl;
    const completeCount = [districtCheck, rosterCheck, standardsCheck, mappingCheck, masteryCheck, ssoCheck, ltiCheck].filter(Boolean).length;
    return {
      districtCheck,
      rosterCheck,
      standardsCheck,
      mappingCheck,
      masteryCheck,
      ssoCheck,
      ltiCheck,
      scorePct: Math.round((completeCount / 7) * 100),
    };
  }, [selectedDistrict, rosterStats, standards, mappings, masteryRows, providers, ltiPlatforms, ltiConfig]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        const [districtRes, classesRes, providerRes, ltiRes, ltiConfigRes] = await Promise.all([
          fetch('/api/admin/district-hierarchy', { headers: authHeaders() }),
          fetch('/api/admin/classes', { headers: authHeaders() }),
          fetch('/api/sso/providers'),
          fetch('/api/lti/platforms'),
          fetch('/api/lti/config'),
        ]);
        const [districtData, classesData, providerData, ltiData, ltiConfigData] = await Promise.all([
          districtRes.json(),
          classesRes.json(),
          providerRes.json(),
          ltiRes.json(),
          ltiConfigRes.json(),
        ]);

        if (!districtData.success) throw new Error(districtData.error || 'Failed to load district hierarchy.');
        if (!classesData.success) throw new Error(classesData.error || 'Failed to load classes.');
        setHierarchy(districtData.hierarchy || { districts: [] });
        const loadedClasses = Array.isArray(classesData.classes) ? classesData.classes : [];
        setClasses(loadedClasses);
        const firstDistrictId = districtData.hierarchy?.districts?.[0]?.id || '';
        if (firstDistrictId) setSelectedDistrictId(firstDistrictId);
        const firstClass = loadedClasses[0];
        if (firstClass?.id) {
          setSelectedClassId(firstClass.id);
          setOwner(firstClass.teacher || '');
        }

        setProviders(providerData.providers || []);
        setLtiPlatforms(ltiData.platforms || []);
        setLtiConfig(ltiConfigData.config || null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedDistrictId) {
      setHistoryRows([]);
      return;
    }
    refreshOnboardingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictId]);

  useEffect(() => {
    setOwnerAssignments([]);
  }, [owner]);

  const handleRosterCsvUpload = async (file) => {
    if (!file) return;
    try {
      setError('');
      const text = await file.text();
      const parsed = parseRosterCsv(text);
      if (parsed.errors.length) {
        setRosterPreview([]);
        setError(parsed.errors[0]);
        return;
      }
      const students = parsed.rows.map((row) => {
        const username = String(row.username || row.email || '').trim().toLowerCase();
        const displayName = String(row.displayname || row.display_name || row.name || username || 'Student').trim();
        return { username, displayName };
      }).filter((s) => s.username);
      setRosterPreview(students);
      setSavedAt(new Date().toLocaleString());
    } catch (e) {
      setError(e.message);
    }
  };

  const runRosterDryRun = async () => {
    try {
      setError('');
      if (!selectedClassId) {
        setError('Select a class first.');
        return;
      }
      if (rosterPreview.length === 0) {
        setError('Upload roster CSV before running verification.');
        return;
      }
      setRosterBusy(true);
      const res = await fetch(`/api/admin/roster/sync/${encodeURIComponent(selectedClassId)}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          mode: 'upsert',
          deactivateMissing: false,
          dryRun: true,
          students: rosterPreview,
        }),
      });
      const data = await res.json();
      setRosterStats(data);
      if (!data.success) setError(data.error || 'Roster dry-run failed.');
    } catch (e) {
      setError(e.message);
    } finally {
      setRosterBusy(false);
    }
  };

  const refreshStandardsHealth = async () => {
    try {
      setError('');
      if (!owner.trim()) {
        setError('Enter an owner/teacher username.');
        return;
      }
      setStandardsBusy(true);
      const [stdRes, mapRes, masteryRes] = await Promise.all([
        fetch(`/api/admin/standards/${encodeURIComponent(owner.trim())}`, { headers: authHeaders() }),
        fetch(`/api/admin/standards-mappings/${encodeURIComponent(owner.trim())}`, { headers: authHeaders() }),
        fetch(`/api/admin/mastery-dashboard/${encodeURIComponent(owner.trim())}?level=class`, { headers: authHeaders() }),
      ]);
      const assignmentsRes = await fetch(`/api/auth/assignments/${encodeURIComponent(owner.trim())}`, { headers: authHeaders() });
      const [stdData, mapData, masteryData, assignmentsData] = await Promise.all([
        stdRes.json(),
        mapRes.json(),
        masteryRes.json(),
        assignmentsRes.json(),
      ]);
      if (!stdData.success) throw new Error(stdData.error || 'Failed to load standards.');
      if (!mapData.success) throw new Error(mapData.error || 'Failed to load mappings.');
      if (!masteryData.success) throw new Error(masteryData.error || 'Failed to load mastery dashboard.');
      if (!assignmentsData.success) throw new Error(assignmentsData.error || 'Failed to load owner assignments.');
      setStandards(stdData.standards || []);
      setMappings(mapData.mappings || []);
      setMasteryRows(masteryData.rows || []);
      setOwnerAssignments(Array.isArray(assignmentsData.assignments) ? assignmentsData.assignments : []);
      setSavedAt(new Date().toLocaleString());
    } catch (e) {
      setError(e.message);
    } finally {
      setStandardsBusy(false);
    }
  };

  const refreshServerReport = async () => {
    try {
      setError('');
      if (!selectedDistrictId || !owner.trim() || !selectedClassId) {
        setError('Select district, class, and owner before generating server report.');
        return;
      }
      setReportBusy(true);
      const params = new URLSearchParams({
        districtId: selectedDistrictId,
        owner: owner.trim(),
        classId: selectedClassId,
      });
      const res = await fetch(`/api/admin/onboarding/report?${params.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load onboarding report.');
      setReportData(data.report || null);
      setSavedAt(new Date().toLocaleString());
    } catch (e) {
      setError(e.message);
    } finally {
      setReportBusy(false);
    }
  };

  const exportServerReportCsv = async () => {
    try {
      setError('');
      if (!selectedDistrictId || !owner.trim() || !selectedClassId) {
        setError('Select district, class, and owner before exporting report.');
        return;
      }
      const params = new URLSearchParams({
        districtId: selectedDistrictId,
        owner: owner.trim(),
        classId: selectedClassId,
        format: 'csv',
      });
      const res = await fetch(`/api/admin/onboarding/report?${params.toString()}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to export onboarding report CSV.');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `onboarding-report-${selectedDistrictId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  };

  const markDistrictReady = async () => {
    try {
      setError('');
      setReadyMessage('');
      if (!selectedDistrictId || !owner.trim() || !selectedClassId) {
        setError('Select district, class, and owner before marking ready.');
        return;
      }
      setReadyBusy(true);
      const res = await fetch(`/api/admin/onboarding/ready/${encodeURIComponent(selectedDistrictId)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          owner: owner.trim(),
          classId: selectedClassId,
          notes: 'Marked from district onboarding wizard',
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setReportData(data.report || null);
        throw new Error(data.error || 'Failed to mark district ready.');
      }
      setReportData(data.report || null);
      setReadyMessage('District marked onboarding-ready.');
      setSavedAt(new Date().toLocaleString());
      await refreshOnboardingHistory();
    } catch (e) {
      setError(e.message);
    } finally {
      setReadyBusy(false);
    }
  };

  const markDistrictNotReady = async () => {
    try {
      setError('');
      setReadyMessage('');
      if (!selectedDistrictId) {
        setError('Select district before rollback.');
        return;
      }
      setReadyBusy(true);
      const res = await fetch(`/api/admin/onboarding/not-ready/${encodeURIComponent(selectedDistrictId)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          owner: owner.trim(),
          classId: selectedClassId,
          notes: 'Rollback from district onboarding wizard',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to mark district not-ready.');
      setReadyMessage('District marked not-ready.');
      setSavedAt(new Date().toLocaleString());
      await refreshOnboardingHistory();
      await refreshServerReport();
    } catch (e) {
      setError(e.message);
    } finally {
      setReadyBusy(false);
    }
  };

  const refreshOnboardingHistory = async () => {
    try {
      setError('');
      if (!selectedDistrictId) {
        setHistoryRows([]);
        return;
      }
      setHistoryBusy(true);
      const res = await fetch(`/api/admin/onboarding/history/${encodeURIComponent(selectedDistrictId)}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load onboarding history.');
      setHistoryRows(Array.isArray(data.history) ? data.history : []);
      setSavedAt(new Date().toLocaleString());
    } catch (e) {
      setError(e.message);
    } finally {
      setHistoryBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <SkeletonLoader variant="card" />
        <div style={{ marginTop: 16 }}>
          <SkeletonLoader variant="text" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {error ? <div style={{ ...card, borderColor: '#fecaca', background: '#fef2f2', color: '#991b1b', fontWeight: 700 }}>{error}</div> : null}

      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <h3 style={h3}>District Onboarding Wizard</h3>
            <p style={sub}>Validate district readiness across roster, standards mastery, and SSO/LTI integrations.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: checks.scorePct >= 85 ? '#166534' : '#92400e' }}>{checks.scorePct}%</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Onboarding score</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={passBadge(checks.districtCheck)}>District selected</span>
          <span style={passBadge(checks.rosterCheck)}>Roster dry-run</span>
          <span style={passBadge(checks.standardsCheck)}>Standards loaded</span>
          <span style={passBadge(checks.mappingCheck)}>Mappings loaded</span>
          <span style={passBadge(checks.masteryCheck)}>Mastery rows</span>
          <span style={passBadge(checks.ssoCheck)}>SSO configured</span>
          <span style={passBadge(checks.ltiCheck)}>LTI configured</span>
        </div>
        {selectedClass ? (
          <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
            Selected class: {selectedClass.name} ({selectedClass.id})
          </div>
        ) : null}
        {savedAt ? <div style={{ marginTop: 8, fontSize: 11, color: '#64748b' }}>Last refresh: {savedAt}</div> : null}
      </section>

      <section style={card}>
        <h4 style={h4}>Step 5: Export Report + Readiness Gate</h4>
        <p style={sub}>Generate server-side onboarding report, export CSV, and mark district ready only when all checks pass.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" style={btn} onClick={refreshServerReport} disabled={reportBusy}>
            {reportBusy ? 'Generating...' : 'Generate Server Report'}
          </button>
          <button type="button" style={btnAlt} onClick={exportServerReportCsv}>
            Export Report CSV
          </button>
          <button
            type="button"
            style={{ ...btnDanger, opacity: reportData?.readyToMark ? 1 : 0.7 }}
            onClick={markDistrictReady}
            disabled={readyBusy || !reportData?.readyToMark}
          >
            {readyBusy ? 'Marking...' : 'Mark District Ready'}
          </button>
          <button
            type="button"
            style={{ ...btnDanger, background: '#9f1239' }}
            onClick={markDistrictNotReady}
            disabled={readyBusy || !selectedDistrictId}
          >
            {readyBusy ? 'Working...' : 'Mark Not Ready'}
          </button>
        </div>
        {readyMessage ? <div style={{ marginTop: 8, fontSize: 12, color: '#166534', fontWeight: 700 }}>{readyMessage}</div> : null}
        {reportData ? (
          <div style={{ marginTop: 10, border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: 10 }}>
            <div style={{ fontSize: 12, color: '#334155', fontWeight: 700 }}>
              Server score: {reportData.scorePct}% | Ready: {String(!!reportData.readyToMark)}
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(reportData.checks || {}).map(([id, ok]) => (
                <span key={id} style={passBadge(!!ok)}>{id}</span>
              ))}
            </div>
            {Array.isArray(reportData.failedChecks) && reportData.failedChecks.length > 0 ? (
              <div style={{ marginTop: 8, fontSize: 12, color: '#991b1b' }}>
                Blocking checks: {reportData.failedChecks.join(', ')}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section style={card}>
        <h4 style={h4}>Step 6: Onboarding Timeline</h4>
        <p style={sub}>Audit trail for ready/not-ready transitions by actor.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button type="button" style={btnAlt} onClick={refreshOnboardingHistory}>
            {historyBusy ? 'Refreshing...' : 'Refresh Timeline'}
          </button>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', padding: 10, maxHeight: 220, overflowY: 'auto' }}>
          {historyRows.length === 0 ? (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>No onboarding timeline entries yet.</div>
          ) : (
            historyRows.map((row, idx) => (
              <div key={row.id || `${row.at || idx}-${idx}`} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <strong style={{ color: row.action === 'mark-ready' ? '#166534' : '#991b1b' }}>{row.action}</strong>
                  <span style={{ color: '#94a3b8' }}>{new Date(row.at || Date.now()).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  actor: {row.actor || 'unknown'} | owner: {row.owner || '-'} | class: {row.classId || '-'} | score: {row.scorePct ?? '-'}
                </div>
                {row.notes ? <div style={{ fontSize: 11, color: '#64748b' }}>notes: {row.notes}</div> : null}
              </div>
            ))
          )}
        </div>
      </section>

      <section style={card}>
        <h4 style={h4}>Step 1: District Context</h4>
        <p style={sub}>Select district/school context used for onboarding checks.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={selectedDistrictId} onChange={(e) => setSelectedDistrictId(e.target.value)} style={{ ...input, minWidth: 260 }}>
            <option value="">Select district</option>
            {(hierarchy.districts || []).map((d) => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
          </select>
          <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} style={{ ...input, minWidth: 280 }}>
            <option value="">Select class</option>
            {scopedClasses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.id})</option>)}
          </select>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="owner / teacher username"
            style={{ ...input, minWidth: 260 }}
          />
        </div>
        {selectedDistrict ? (
          <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
            District summary: {(selectedDistrict.subAccounts || []).length} sub-account(s), {(selectedDistrict.schools || []).length} top-level school(s).
          </div>
        ) : null}
      </section>

      <section style={card}>
        <h4 style={h4}>Step 2: Roster Import Verification (Dry-Run)</h4>
        <p style={sub}>Upload `username,email,name` style CSV and run non-mutating class roster validation.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={btnAlt}>
            Upload Roster CSV
            <input type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={(e) => handleRosterCsvUpload(e.target.files?.[0])} />
          </label>
          <button type="button" style={btn} onClick={runRosterDryRun} disabled={rosterBusy || rosterPreview.length === 0}>
            {rosterBusy ? 'Running...' : 'Run Dry-Run Check'}
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>{rosterPreview.length} student row(s) queued</span>
        </div>
        {rosterStats ? (
          <div style={{ marginTop: 10, fontSize: 12, color: '#334155', display: 'grid', gap: 4 }}>
            <div>Success: {String(!!rosterStats.success)} | Dry-run: {String(!!rosterStats.dryRun)}</div>
            <div>Created: {rosterStats.summary?.created ?? 0} | Existing: {rosterStats.summary?.existing ?? 0} | Enrolled: {rosterStats.summary?.enrolled ?? 0}</div>
            <div>Errors: {(rosterStats.summary?.errors || []).length}</div>
          </div>
        ) : null}
      </section>

      <section style={card}>
        <h4 style={h4}>Step 3: Standards + Mastery Readiness</h4>
        <p style={sub}>Check if this owner has standards, mappings, and live mastery rows.</p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" style={btn} onClick={refreshStandardsHealth} disabled={standardsBusy}>
            {standardsBusy ? 'Refreshing...' : 'Refresh Standards Health'}
          </button>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Owner assignments mapped: {mappingCoverage.mapped}/{mappingCoverage.total} ({mappingCoverage.pct}%)
          </span>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
          <Metric label="Standards" value={standards.length} ok={standards.length > 0} />
          <Metric label="Mappings" value={mappings.length} ok={mappings.length > 0} />
          <Metric label="Mastery Rows" value={masteryRows.length} ok={masteryRows.length > 0} />
          <Metric label="Coverage %" value={`${mappingCoverage.pct}%`} ok={mappingCoverage.pct >= 70} />
        </div>
      </section>

      <section style={card}>
        <h4 style={h4}>Step 4: SSO/LTI Verification</h4>
        <p style={sub}>Confirm district login providers and LTI platform integration are configured.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={miniCard}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>SSO Providers</div>
            {(providers || []).map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                <span>{p.name}</span>
                <span style={{ color: p.configured ? '#166534' : '#991b1b', fontWeight: 700 }}>{p.configured ? 'Configured' : 'Not set'}</span>
              </div>
            ))}
          </div>
          <div style={miniCard}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>LTI</div>
            <div style={{ fontSize: 12, color: '#475569' }}>Platforms registered: {(ltiPlatforms || []).length}</div>
            <div style={{ fontSize: 12, color: '#475569' }}>OIDC URL present: {ltiConfig?.oidcInitiationUrl ? 'Yes' : 'No'}</div>
            <a href="/lti-admin" style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>Open LTI admin</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, ok }) {
  return (
    <div style={{ border: `1px solid ${ok ? '#bbf7d0' : '#fecaca'}`, borderRadius: 10, background: ok ? '#f0fdf4' : '#fef2f2', padding: 10 }}>
      <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: ok ? '#166534' : '#991b1b' }}>{value}</div>
    </div>
  );
}

const card = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  background: '#fff',
  padding: 14,
};

const miniCard = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  background: '#f8fafc',
  padding: 10,
};

const h3 = { margin: '0 0 2px', fontSize: 17, fontWeight: 800, color: '#0f172a' };
const h4 = { margin: '0 0 2px', fontSize: 14, fontWeight: 800, color: '#0f172a' };
const sub = { margin: '0 0 8px', fontSize: 12, color: '#64748b' };

const input = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 13,
};

const btn = {
  border: 0,
  borderRadius: 8,
  background: '#2563eb',
  color: '#fff',
  fontSize: 12,
  fontWeight: 700,
  padding: '8px 10px',
  cursor: 'pointer',
};

const btnAlt = {
  ...btn,
  background: '#0ea5e9',
  display: 'inline-flex',
  alignItems: 'center',
};

const btnDanger = {
  ...btn,
  background: '#dc2626',
};
