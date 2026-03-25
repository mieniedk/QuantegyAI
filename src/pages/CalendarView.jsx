import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import { getClassesByTeacher, getAssignments, getGrades, saveAssignments, getClassDiscussions, getClassAnnouncements } from '../utils/storage';

/* ═══════════════════════════════════════════════════════════════
   CALENDAR VIEW — Assignment calendar with due dates
   Shows assignments, discussions, and announcements on a monthly grid
   ═══════════════════════════════════════════════════════════════ */

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }
function isSameDay(d1, d2) { return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate(); }
function fmtDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

const EVENT_COLORS = {
  assignment: { bg: '#eff6ff', color: '#2563eb', icon: '🎮' },
  discussion: { bg: '#f5f3ff', color: '#7c3aed', icon: '💬' },
  announcement: { bg: '#fefce8', color: '#ca8a04', icon: '📢' },
  staar: { bg: '#fef2f2', color: '#dc2626', icon: '📋' },
};

export default function CalendarView() {
  const username = localStorage.getItem('quantegy-teacher-user');
  const classes = username ? getClassesByTeacher(username) : [];
  const allAssignments = getAssignments();
  const allGrades = getGrades();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterClass, setFilterClass] = useState('all');
  const [view, setView] = useState('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [showIcalModal, setShowIcalModal] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');
  const [icalLoading, setIcalLoading] = useState(false);
  const [icalCopied, setIcalCopied] = useState(false);

  const fetchIcalToken = async () => {
    setIcalLoading(true);
    try {
      const token = localStorage.getItem('quantegy-auth-token');
      const res = await fetch('/api/calendar/ical-token', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.url) {
        setIcalUrl(data.url);
        setShowIcalModal(true);
      }
    } catch (err) {
      console.warn('Failed to fetch iCal token:', err);
    }
    setIcalLoading(false);
  };

  const revokeIcalToken = async () => {
    try {
      const token = localStorage.getItem('quantegy-auth-token');
      await fetch('/api/calendar/ical-revoke', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setIcalUrl('');
      setShowIcalModal(false);
    } catch (err) {
      console.warn('Failed to revoke iCal token:', err);
    }
  };

  const copyIcalUrl = () => {
    navigator.clipboard.writeText(icalUrl);
    setIcalCopied(true);
    setTimeout(() => setIcalCopied(false), 2000);
  };

  const classIds = classes.map(c => c.id);

  const events = useMemo(() => {
    const items = [];

    const filteredAssignments = allAssignments.filter(a =>
      classIds.includes(a.classId) && (filterClass === 'all' || a.classId === filterClass)
    );
    filteredAssignments.forEach(a => {
      if (a.dueDate) {
        items.push({ id: a.id, type: 'assignment', title: a.name, date: new Date(a.dueDate), classId: a.classId, data: a });
      }
    });

    classes.forEach(cls => {
      if (filterClass !== 'all' && cls.id !== filterClass) return;
      const discussions = getClassDiscussions(cls.id);
      discussions.forEach(d => {
        if (d.dueDate) items.push({ id: d.id, type: 'discussion', title: d.title, date: new Date(d.dueDate), classId: cls.id, data: d });
      });
    });

    items.push({ id: 'staar', type: 'staar', title: 'STAAR Math Grade 3', date: new Date(2026, 3, 7), classId: null, data: null });

    return items;
  }, [allAssignments, classes, filterClass, refresh]);

  const getEventsForDate = (date) => events.filter(e => isSameDay(e.date, date));
  const getClassName = (classId) => classes.find(c => c.id === classId)?.name || '';

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const handleSetDueDate = (assignmentId) => {
    if (!dueDate) return;
    const all = getAssignments();
    const idx = all.findIndex(a => a.id === assignmentId);
    if (idx >= 0) { all[idx].dueDate = dueDate; saveAssignments(all); }
    setEditAssignment(null); setDueDate(''); setRefresh(r => r + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 10);

  const overdueAssignments = allAssignments.filter(a => {
    if (!a.dueDate || !classIds.includes(a.classId)) return false;
    if (filterClass !== 'all' && a.classId !== filterClass) return false;
    return new Date(a.dueDate) < today;
  });

  const unscheduledAssignments = allAssignments.filter(a => {
    if (!classIds.includes(a.classId)) return false;
    if (filterClass !== 'all' && a.classId !== filterClass) return false;
    return !a.dueDate;
  });

  return (
    <TeacherLayout>
      <style>{`
        .cal-cell { transition: all 0.15s; cursor: pointer; }
        .cal-cell:hover { background: #f0f7ff !important; transform: scale(1.02); }
        .cal-event { transition: all 0.15s; }
        .cal-event:hover { transform: translateX(2px); }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24, color: '#0f172a' }}>📅 Calendar</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Assignment due dates, discussions, and important events.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={selectStyle}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="button" onClick={fetchIcalToken} disabled={icalLoading} style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
            fontSize: 13, fontWeight: 600, color: '#2563eb', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, opacity: icalLoading ? 0.6 : 1,
          }}>
            📆 Subscribe to Calendar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Calendar grid */}
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff' }}>
              <button type="button" onClick={prevMonth} style={navBtn}>◀</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{MONTHS[month]} {year}</div>
                <button type="button" onClick={goToday} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 6, padding: '3px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>Today</button>
              </div>
              <button type="button" onClick={nextMonth} style={navBtn}>▶</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' }}>
              {DAYS.map(d => (
                <div key={d} style={{ padding: '8px 4px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} style={{ minHeight: 80, background: '#f8fafc', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }} />)}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const isToday = isSameDay(date, today);
                const dayEvents = getEventsForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <div key={day} className="cal-cell" onClick={() => setSelectedDate(isSelected ? null : date)} style={{
                    minHeight: 80, padding: '4px 6px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9',
                    background: isSelected ? '#eff6ff' : isToday ? '#fefce8' : isWeekend ? '#fafafa' : '#fff',
                    position: 'relative',
                  }}>
                    <div style={{
                      fontSize: 13, fontWeight: isToday ? 900 : 500, color: isToday ? '#fff' : '#334155',
                      width: isToday ? 24 : 'auto', height: isToday ? 24 : 'auto',
                      background: isToday ? '#2563eb' : 'none', borderRadius: '50%',
                      display: isToday ? 'flex' : 'block', alignItems: 'center', justifyContent: 'center',
                    }}>{day}</div>
                    <div style={{ marginTop: 2 }}>
                      {dayEvents.slice(0, 3).map(ev => {
                        const cfg = EVENT_COLORS[ev.type];
                        return (
                          <div key={ev.id} className="cal-event" style={{
                            fontSize: 10, fontWeight: 600, padding: '1px 4px', borderRadius: 4,
                            background: cfg.bg, color: cfg.color, marginBottom: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {cfg.icon} {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected date detail */}
          {selectedDate && (
            <div style={{ marginTop: 12, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              {getEventsForDate(selectedDate).length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13, padding: 12, textAlign: 'center' }}>No events on this date.</div>
              ) : (
                getEventsForDate(selectedDate).map(ev => {
                  const cfg = EVENT_COLORS[ev.type];
                  return (
                    <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: cfg.bg, borderRadius: 10, marginBottom: 8, borderLeft: `4px solid ${cfg.color}` }}>
                      <span style={{ fontSize: 20 }}>{cfg.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{ev.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)} {ev.classId && `· ${getClassName(ev.classId)}`}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: '0 0 280px', minWidth: 250 }}>
          {/* Upcoming */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>📅 Upcoming</div>
            {upcomingEvents.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 12, padding: 8 }}>No upcoming events.</div>
            ) : (
              upcomingEvents.map(ev => {
                const cfg = EVENT_COLORS[ev.type];
                const daysAway = Math.ceil((ev.date - today) / (24*60*60*1000));
                return (
                  <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                    <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11 }}>{ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                      background: daysAway <= 3 ? '#fef2f2' : daysAway <= 7 ? '#fffbeb' : '#f0fdf4',
                      color: daysAway <= 3 ? '#dc2626' : daysAway <= 7 ? '#ca8a04' : '#059669',
                    }}>{daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `${daysAway}d`}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Overdue */}
          {overdueAssignments.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #fecaca', padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', marginBottom: 10 }}>⏰ Overdue ({overdueAssignments.length})</div>
              {overdueAssignments.slice(0, 5).map(a => (
                <div key={a.id} style={{ fontSize: 12, padding: '6px 0', borderBottom: '1px solid #fef2f2', color: '#dc2626', fontWeight: 600 }}>
                  🎮 {a.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {getClassName(a.classId)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Unscheduled */}
          {unscheduledAssignments.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#64748b', marginBottom: 10 }}>📌 Unscheduled ({unscheduledAssignments.length})</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>Click to set a due date:</div>
              {unscheduledAssignments.slice(0, 8).map(a => (
                <div key={a.id} style={{ marginBottom: 6 }}>
                  {editAssignment === a.id ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ flex: 1, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }} autoFocus />
                      <button type="button" onClick={() => handleSetDueDate(a.id)} style={{ padding: '4px 8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Set</button>
                      <button type="button" onClick={() => { setEditAssignment(null); setDueDate(''); }} style={{ padding: '4px 6px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>✕</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => { setEditAssignment(a.id); setDueDate(''); }} style={{
                      width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 8, border: '1px dashed #cbd5e1',
                      background: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#334155',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      🎮 {a.name}
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>+ date</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div style={{ marginTop: 14, padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Legend</div>
            {Object.entries(EVENT_COLORS).map(([type, cfg]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.color, flexShrink: 0 }} />
                <span style={{ color: '#334155', textTransform: 'capitalize' }}>{cfg.icon} {type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showIcalModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} onClick={() => setShowIcalModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: '95%', maxWidth: 500, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>📆 Subscribe to Calendar</div>
              <button type="button" onClick={() => setShowIcalModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px', lineHeight: 1.6 }}>
              Paste this URL in <strong>Google Calendar</strong> (Other calendars &gt; From URL) or <strong>Outlook</strong> (Add calendar &gt; From Internet) to sync your events.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="text" readOnly value={icalUrl} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'monospace', background: '#f8fafc', color: '#334155' }} onClick={e => e.target.select()} />
              <button type="button" onClick={copyIcalUrl} style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: icalCopied ? '#059669' : '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {icalCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <button type="button" onClick={revokeIcalToken} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Revoke Token
            </button>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

const selectStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' };
const navBtn = { background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontSize: 16, fontWeight: 700 };
