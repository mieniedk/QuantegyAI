import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getAttendanceRecords,
  saveAttendanceRecord,
  getAttendanceForDate,
  getStudentAttendanceSummary,
} from '../utils/storage';

const STATUS_CONFIG = {
  present: { label: 'Present', color: '#15803d', bg: '#dcfce7', icon: '✓' },
  absent:  { label: 'Absent',  color: '#dc2626', bg: '#fee2e2', icon: '✗' },
  tardy:   { label: 'Tardy',   color: '#d97706', bg: '#fef3c7', icon: '⏱' },
  excused: { label: 'Excused', color: '#2563eb', bg: '#dbeafe', icon: 'E' },
};

const STATUSES = ['present', 'absent', 'tardy', 'excused'];

const toDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const card = {
  background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
  padding: '20px 24px',
};

export default function AttendanceManager({ classId, students }) {
  const [view, setView] = useState('rollcall');
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [entries, setEntries] = useState({});
  const [notes, setNotes] = useState({});
  const [expandedNote, setExpandedNote] = useState(null);
  const [saved, setSaved] = useState(false);
  const [dateRange, setDateRange] = useState('30');
  const [copyMsg, setCopyMsg] = useState('');

  useEffect(() => {
    const record = getAttendanceForDate(classId, selectedDate);
    if (record) {
      const e = {};
      const n = {};
      (record.entries || []).forEach((ent) => {
        e[ent.studentId] = ent.status;
        if (ent.note) n[ent.studentId] = ent.note;
      });
      setEntries(e);
      setNotes(n);
    } else {
      setEntries({});
      setNotes({});
    }
    setSaved(false);
  }, [classId, selectedDate]);

  const setStatus = useCallback((studentId, status) => {
    setEntries((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }, []);

  const markAllPresent = useCallback(() => {
    const e = {};
    students.forEach((s) => { e[s.id] = 'present'; });
    setEntries(e);
    setSaved(false);
  }, [students]);

  const handleSave = useCallback(() => {
    const entryList = students.map((s) => ({
      studentId: s.id,
      status: entries[s.id] || 'absent',
      note: notes[s.id] || '',
    }));
    saveAttendanceRecord(classId, { date: selectedDate, entries: entryList });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, [classId, selectedDate, students, entries, notes]);

  const statusCounts = useMemo(() => {
    const c = { present: 0, absent: 0, tardy: 0, excused: 0, unmarked: 0 };
    students.forEach((s) => {
      const st = entries[s.id];
      if (st && c[st] !== undefined) c[st]++;
      else c.unmarked++;
    });
    return c;
  }, [students, entries]);

  // ── Reports data ──
  const records = useMemo(() => getAttendanceRecords(classId), [classId, view]);

  const filteredRecords = useMemo(() => {
    if (dateRange === 'all') return records;
    const days = parseInt(dateRange, 10);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = toDateString(cutoff);
    return records.filter((r) => r.date >= cutoffStr);
  }, [records, dateRange]);

  const reportData = useMemo(() => {
    if (view !== 'reports') return null;
    const summaries = students.map((s) => {
      let present = 0, absent = 0, tardy = 0, excused = 0;
      filteredRecords.forEach((r) => {
        const entry = (r.entries || []).find((e) => e.studentId === s.id);
        if (!entry) return;
        if (entry.status === 'present') present++;
        else if (entry.status === 'absent') absent++;
        else if (entry.status === 'tardy') tardy++;
        else if (entry.status === 'excused') excused++;
      });
      const total = filteredRecords.length;
      const pct = total > 0 ? Math.round(((present + tardy + excused) / total) * 100) : 0;
      return { ...s, present, absent, tardy, excused, total, pct };
    });

    const totalDays = filteredRecords.length;
    const avgRate = summaries.length > 0
      ? Math.round(summaries.reduce((a, s) => a + s.pct, 0) / summaries.length)
      : 0;
    const mostAbsent = summaries.length > 0
      ? summaries.reduce((max, s) => s.absent > max.absent ? s : max, summaries[0])
      : null;
    const perfectCount = summaries.filter((s) => s.absent === 0 && s.total > 0).length;

    return { summaries, totalDays, avgRate, mostAbsent, perfectCount };
  }, [view, students, filteredRecords]);

  // ── Calendar heatmap data ──
  const heatmapData = useMemo(() => {
    if (view !== 'reports') return [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dt = new Date(year, month, d);
      const dateStr = toDateString(dt);
      const record = filteredRecords.find((r) => r.date === dateStr);
      let rate = null;
      if (record && record.entries && record.entries.length > 0) {
        const presentish = record.entries.filter(
          (e) => e.status === 'present' || e.status === 'tardy' || e.status === 'excused'
        ).length;
        rate = Math.round((presentish / record.entries.length) * 100);
      }
      days.push({ date: d, dateStr, dayOfWeek: dt.getDay(), rate });
    }
    return { days, firstDayOfWeek: firstDay.getDay(), monthName: firstDay.toLocaleString('default', { month: 'long', year: 'numeric' }) };
  }, [view, filteredRecords]);

  const handleCopyCSV = useCallback(() => {
    if (!reportData) return;
    const header = 'Student,Present,Absent,Tardy,Excused,Attendance %';
    const rows = reportData.summaries.map(
      (s) => `"${s.name}",${s.present},${s.absent},${s.tardy},${s.excused},${s.pct}%`
    );
    navigator.clipboard.writeText([header, ...rows].join('\n')).then(() => {
      setCopyMsg('Copied!');
      setTimeout(() => setCopyMsg(''), 2000);
    });
  }, [reportData]);

  const pctColor = (pct) => {
    if (pct >= 95) return '#15803d';
    if (pct >= 85) return '#0369a1';
    if (pct >= 75) return '#d97706';
    return '#dc2626';
  };

  const heatColor = (rate) => {
    if (rate === null) return '#f1f5f9';
    if (rate >= 95) return '#bbf7d0';
    if (rate >= 85) return '#86efac';
    if (rate >= 75) return '#fde68a';
    if (rate >= 60) return '#fed7aa';
    return '#fecaca';
  };

  if (!students || students.length === 0) {
    return (
      <div style={card}>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontFamily: 'system-ui' }}>Attendance</h2>
        <p style={{ color: '#64748b' }}>Add students to this class to begin taking attendance.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'rollcall', label: 'Roll Call', icon: '📋' },
          { id: 'reports', label: 'Reports', icon: '📊' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              padding: '10px 20px', border: 'none', borderRadius: 10, cursor: 'pointer',
              fontWeight: 600, fontSize: 14, fontFamily: 'inherit',
              background: view === v.id
                ? 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)'
                : '#f1f5f9',
              color: view === v.id ? '#fff' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* ── ROLL CALL VIEW ── */}
      {view === 'rollcall' && (
        <div style={card}>
          {/* Date picker row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontWeight: 600, fontSize: 14, color: '#334155' }}>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
                  fontSize: 14, fontFamily: 'inherit',
                }}
              />
            </div>
            <button
              onClick={markAllPresent}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: 13,
                fontFamily: 'inherit', transition: 'all 0.15s',
              }}
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: saved ? '#dcfce7' : 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
                color: saved ? '#15803d' : '#fff',
                fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                transition: 'all 0.2s', marginLeft: 'auto',
              }}
            >
              {saved ? '✓ Saved!' : 'Save Attendance'}
            </button>
          </div>

          {/* Student list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {students.map((student) => {
              const currentStatus = entries[student.id];
              return (
                <div key={student.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10,
                  background: currentStatus ? STATUS_CONFIG[currentStatus]?.bg + '33' : '#f8fafc',
                  border: `1px solid ${currentStatus ? STATUS_CONFIG[currentStatus]?.color + '30' : '#e2e8f0'}`,
                  flexWrap: 'wrap',
                }}>
                  {/* Status dot */}
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: currentStatus ? STATUS_CONFIG[currentStatus].color : '#cbd5e1',
                  }} />

                  {/* Name */}
                  <span style={{ fontWeight: 600, fontSize: 14, minWidth: 140, color: '#0f172a' }}>
                    {student.name}
                  </span>

                  {/* Status buttons */}
                  <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                    {STATUSES.map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = currentStatus === status;
                      return (
                        <button
                          key={status}
                          onClick={() => setStatus(student.id, status)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                            fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                            background: isActive ? cfg.color : cfg.bg,
                            color: isActive ? '#fff' : cfg.color,
                            opacity: isActive ? 1 : 0.75,
                            transition: 'all 0.12s',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          {cfg.icon} {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Note toggle */}
                  <button
                    onClick={() => setExpandedNote(expandedNote === student.id ? null : student.id)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
                      background: notes[student.id] ? '#fffbeb' : '#fff',
                      cursor: 'pointer', fontSize: 12, color: '#64748b', fontFamily: 'inherit',
                    }}
                    title="Add note"
                  >
                    {notes[student.id] ? '📝' : '💬'}
                  </button>

                  {/* Note input */}
                  {expandedNote === student.id && (
                    <div style={{ width: '100%', marginTop: 6 }}>
                      <input
                        type="text"
                        placeholder="Optional note (e.g., left early, doctor's appointment)"
                        value={notes[student.id] || ''}
                        onChange={(e) => {
                          setNotes((prev) => ({ ...prev, [student.id]: e.target.value }));
                          setSaved(false);
                        }}
                        style={{
                          width: '100%', padding: '8px 12px', borderRadius: 8,
                          border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'inherit',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Count summary */}
          <div style={{
            display: 'flex', gap: 16, marginTop: 20, padding: '12px 16px',
            background: '#f8fafc', borderRadius: 10, flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {STATUSES.map((s) => (
              <span key={s} style={{ fontSize: 13, fontWeight: 600, color: STATUS_CONFIG[s].color }}>
                {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}: {statusCounts[s]}
              </span>
            ))}
            {statusCounts.unmarked > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>
                Unmarked: {statusCounts.unmarked}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── REPORTS VIEW ── */}
      {view === 'reports' && reportData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Date range filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: '#475569' }}>Period:</label>
            {[
              { val: '7', label: 'Last 7 days' },
              { val: '30', label: 'Last 30 days' },
              { val: 'all', label: 'All time' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => setDateRange(opt.val)}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                  background: dateRange === opt.val ? '#1e3a5f' : '#f1f5f9',
                  color: dateRange === opt.val ? '#fff' : '#475569',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {[
              { label: 'Days Tracked', value: reportData.totalDays, icon: '📅', color: '#0f172a' },
              { label: 'Avg Attendance', value: `${reportData.avgRate}%`, icon: '📊', color: pctColor(reportData.avgRate) },
              { label: 'Most Absences', value: reportData.mostAbsent?.name || '—', sub: reportData.mostAbsent ? `${reportData.mostAbsent.absent} days` : '', icon: '⚠️', color: '#dc2626' },
              { label: 'Perfect Attendance', value: reportData.perfectCount, icon: '🌟', color: '#15803d' },
            ].map((c, i) => (
              <div key={i} style={{
                ...card, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{c.icon} {c.label}</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</span>
                {c.sub && <span style={{ fontSize: 11, color: '#94a3b8' }}>{c.sub}</span>}
              </div>
            ))}
          </div>

          {/* Per-student table */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Student Breakdown</h3>
              <button
                onClick={handleCopyCSV}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: copyMsg ? '#dcfce7' : '#fff', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                  color: copyMsg ? '#15803d' : '#475569',
                }}
              >
                {copyMsg || '📋 Copy as CSV'}
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={thStyle}>Student</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Present</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Absent</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Tardy</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Excused</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.summaries.map((s) => (
                    <tr key={s.id}>
                      <td style={tdStyle}><span style={{ fontWeight: 600 }}>{s.name}</span></td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#15803d', fontWeight: 600 }}>{s.present}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#dc2626', fontWeight: 600 }}>{s.absent}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#d97706', fontWeight: 600 }}>{s.tardy}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', color: '#2563eb', fontWeight: 600 }}>{s.excused}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                          fontWeight: 700, fontSize: 12,
                          background: pctColor(s.pct) + '18',
                          color: pctColor(s.pct),
                        }}>
                          {s.pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calendar Heatmap */}
          {heatmapData.days && (
            <div style={card}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                📅 {heatmapData.monthName} — Daily Attendance
              </h3>
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} style={{
                    width: 36, height: 20, textAlign: 'center',
                    fontSize: 10, fontWeight: 700, color: '#94a3b8',
                  }}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {Array.from({ length: heatmapData.firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ width: 36, height: 36 }} />
                ))}
                {heatmapData.days.map((day) => (
                  <div
                    key={day.date}
                    title={day.rate !== null ? `${day.dateStr}: ${day.rate}% attendance` : `${day.dateStr}: No data`}
                    style={{
                      width: 36, height: 36, borderRadius: 6,
                      background: heatColor(day.rate),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600,
                      color: day.rate !== null ? '#334155' : '#cbd5e1',
                      cursor: 'default',
                    }}
                  >
                    {day.date}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: '#64748b', alignItems: 'center' }}>
                <span>Legend:</span>
                {[
                  { label: '95%+', color: '#bbf7d0' },
                  { label: '85%+', color: '#86efac' },
                  { label: '75%+', color: '#fde68a' },
                  { label: '60%+', color: '#fed7aa' },
                  { label: '<60%', color: '#fecaca' },
                  { label: 'No data', color: '#f1f5f9' },
                ].map((l) => (
                  <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: l.color, display: 'inline-block' }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, borderBottom: '2px solid #e2e8f0', color: '#64748b' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9' };
