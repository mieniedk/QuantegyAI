import React, { useEffect, useMemo, useState } from 'react';
import { getClasses } from '../utils/storage';

const KEY = 'allen-ace-district-hierarchy';

function readHierarchy() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{"districts":[]}');
  } catch {
    return { districts: [] };
  }
}

function writeHierarchy(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export default function DistrictHierarchyManager() {
  const [data, setData] = useState(readHierarchy);
  const [classes, setClasses] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [subAccountName, setSubAccountName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');

  function authHeaders() {
    const token = localStorage.getItem('quantegy-auth-token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }

  const loadAdminClasses = async () => {
    const res = await fetch('/api/admin/classes', { headers: authHeaders() });
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || 'Failed to load classes.');
    setClasses(Array.isArray(payload.classes) ? payload.classes : []);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setBusy(true);
        const [hierarchyRes, classesRes] = await Promise.all([
          fetch('/api/admin/district-hierarchy', { headers: authHeaders() }),
          fetch('/api/admin/classes', { headers: authHeaders() }),
        ]);
        const payload = await hierarchyRes.json();
        const classesPayload = await classesRes.json();
        if (!payload.success) throw new Error(payload.error || 'Failed to load district hierarchy.');
        if (!classesPayload.success) throw new Error(classesPayload.error || 'Failed to load classes.');
        const hierarchy = payload.hierarchy || { districts: [] };
        if (!cancelled) {
          setData({ districts: Array.isArray(hierarchy.districts) ? hierarchy.districts : [] });
          writeHierarchy({ districts: Array.isArray(hierarchy.districts) ? hierarchy.districts : [] });
          setClasses(Array.isArray(classesPayload.classes) ? classesPayload.classes : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const fallbackClasses = useMemo(() => getClasses(), []);
  const classesForUI = classes.length > 0 ? classes : fallbackClasses;
  const schools = useMemo(() => {
    return data.districts.flatMap(d =>
      d.subAccounts.flatMap(sa =>
        sa.schools.map(s => ({ ...s, districtId: d.id, subAccountId: sa.id, districtName: d.name, subAccountName: sa.name })),
      ),
    );
  }, [data]);

  const mutate = async (next) => {
    setData(next);
    writeHierarchy(next);
    try {
      setBusy(true);
      setError('');
      const res = await fetch('/api/admin/district-hierarchy', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ hierarchy: next }),
      });
      const payload = await res.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to save district hierarchy.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const addDistrict = () => {
    const name = districtName.trim();
    if (!name) return;
    void mutate({
      ...data,
      districts: [...data.districts, { id: `d-${Date.now()}`, name, subAccounts: [] }],
    });
    setDistrictName('');
  };

  const addSubAccount = () => {
    const name = subAccountName.trim();
    if (!selectedDistrict || !name) return;
    void mutate({
      ...data,
      districts: data.districts.map((d) => d.id !== selectedDistrict
        ? d
        : { ...d, subAccounts: [...d.subAccounts, { id: `sa-${Date.now()}`, name, schools: [] }] }),
    });
    setSubAccountName('');
  };

  const addSchool = () => {
    const name = schoolName.trim();
    if (!selectedDistrict || !name) return;
    const district = data.districts.find(d => d.id === selectedDistrict);
    if (!district || district.subAccounts.length === 0) return;
    const subAccountId = district.subAccounts[0].id;
    void mutate({
      ...data,
      districts: data.districts.map((d) => d.id !== selectedDistrict
        ? d
        : {
          ...d,
          subAccounts: d.subAccounts.map((sa) => sa.id !== subAccountId
            ? sa
            : {
              ...sa,
              schools: [...sa.schools, { id: `s-${Date.now()}`, name, schoolCode: schoolCode.trim() || '' }],
            }),
        }),
    });
    setSchoolName('');
    setSchoolCode('');
  };

  const assignSchoolToClass = (classId, schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    const payload = {
      schoolId: schoolId || '',
      schoolName: school?.name || '',
      districtId: school?.districtId || '',
      districtName: school?.districtName || '',
      subAccountId: school?.subAccountId || '',
      subAccountName: school?.subAccountName || '',
    };
    void (async () => {
      try {
        setBusy(true);
        setError('');
        const res = await fetch(`/api/admin/classes/${encodeURIComponent(classId)}/meta`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ meta: payload }),
        });
        const out = await res.json();
        if (!out.success) throw new Error(out.error || 'Failed to update class school mapping.');
        await loadAdminClasses();
      } catch (e) {
        setError(e.message);
      } finally {
        setBusy(false);
      }
    })();
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {error ? <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 10, padding: '8px 10px', fontSize: 12, fontWeight: 700 }}>{error}</div> : null}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>District Hierarchy</h3>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
          Manage district {'>'} sub-account {'>'} school structure for SIS/LTI mappings.
        </p>
        <div style={{ marginBottom: 8, fontSize: 11, color: '#64748b' }}>{busy ? 'Saving...' : 'Synced with server'}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={districtName} onChange={(e) => setDistrictName(e.target.value)} placeholder="Add district (e.g., Allen ISD)" style={input} />
          <button onClick={addDistrict} style={btn}>Add District</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={input}>
            <option value="">Select district</option>
            {data.districts.map((d) => {
              const ready = !!d?.onboarding?.ready;
              return <option key={d.id} value={d.id}>{d.name} {ready ? '(Ready)' : '(Not Ready)'}</option>;
            })}
          </select>
          <input value={subAccountName} onChange={(e) => setSubAccountName(e.target.value)} placeholder="Add sub-account (e.g., High Schools)" style={input} />
          <button onClick={addSubAccount} style={btn}>Add Sub-account</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="Add school (e.g., Allen High School)" style={input} />
          <input value={schoolCode} onChange={(e) => setSchoolCode(e.target.value)} placeholder="School code (optional)" style={input} />
          <button onClick={addSchool} style={btn}>Add School</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800 }}>Hierarchy Snapshot</h4>
        {data.districts.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>No districts configured yet.</p>
        ) : data.districts.map((d) => (
          <div key={d.id} style={{ marginBottom: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <strong>{d.name}</strong>
              <span style={statusChip(!!d?.onboarding?.ready)}>
                {d?.onboarding?.ready ? 'Onboarding Ready' : 'Onboarding Not Ready'}
              </span>
              {d?.onboarding?.readyAt ? (
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {new Date(d.onboarding.readyAt).toLocaleString()} by {d.onboarding.readyBy || 'unknown'}
                </span>
              ) : null}
            </div>
            {d.subAccounts.map((sa) => (
              <div key={sa.id} style={{ marginLeft: 16, color: '#475569' }}>
                • {sa.name}
                {sa.schools.map((s) => (
                  <div key={s.id} style={{ marginLeft: 16, color: '#64748b' }}>
                    - {s.name}{s.schoolCode ? ` (${s.schoolCode})` : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
        <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 800 }}>Class to School Mapping</h4>
        <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b' }}>
          Assign each class to a school to improve SIS exports and LTI roster scoping.
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          {classesForUI.map((c) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600 }}>{c.name}</div>
              <select
                value={c.schoolId || ''}
                onChange={(e) => assignSchoolToClass(c.id, e.target.value)}
                style={{ ...input, margin: 0 }}
              >
                <option value="">No school assigned</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.districtName} / {s.subAccountName} / {s.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const input = {
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: 13,
  minWidth: 220,
  flex: '1 1 220px',
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

const statusChip = (ready) => ({
  display: 'inline-block',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 700,
  background: ready ? '#dcfce7' : '#fee2e2',
  color: ready ? '#166534' : '#991b1b',
  border: `1px solid ${ready ? '#86efac' : '#fecaca'}`,
});
