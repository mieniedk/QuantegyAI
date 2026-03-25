import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getClasses, getGrades, getAssignments, getClassResults, getClassDiscussions } from '../utils/storage';
import { TEKS_STANDARDS } from '../data/teks';
import { GAMES_CATALOG } from '../data/games';

/* ═══════════════════════════════════════════════════════════════
   PARENT PORTAL — read-only view of student grades, progress,
   and class information. Parents enter their child's student ID
   and the class join code to access.
   ═══════════════════════════════════════════════════════════════ */

const SESSION_KEY = 'allen-ace-parent-session';

export default function ParentPortal() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  });
  const [studentId, setStudentId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const handleLogin = () => {
    setError('');
    if (!studentId.trim() || !joinCode.trim()) { setError('Please enter both the student ID and class code.'); return; }
    const classes = getClasses();
    const cls = classes.find(c => c.joinCode && c.joinCode.toLowerCase() === joinCode.trim().toLowerCase());
    if (!cls) { setError('Class code not found. Please check with your child\'s teacher.'); return; }
    const student = (cls.students || []).find(s => s.id === studentId.trim() || s.name.toLowerCase() === studentId.trim().toLowerCase());
    if (!student) { setError('Student not found in this class. Please check the student name or ID.'); return; }
    const s = { classId: cls.id, className: cls.name, studentId: student.id, studentName: student.name, grade: cls.grade, teacherName: cls.teacher || '' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => { localStorage.removeItem(SESSION_KEY); setSession(null); };

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 50%,#fef3c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👨‍👩‍👧‍👦</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Parent Portal</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>View your child's grades, progress, and class activity.</p>

          <input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student name or ID"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
          <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Class join code"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{error}</div>}

          <button type="button" onClick={handleLogin} style={{
            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: 15,
          }}>View Progress</button>

          <div style={{ marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
            Don't have a code? Ask your child's teacher for the class join code and student name.
          </div>
          <Link to="/" style={{ display: 'inline-block', marginTop: 16, fontSize: 13, color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  const classes = getClasses();
  const cls = classes.find(c => c.id === session.classId);
  const student = cls ? (cls.students || []).find(s => s.id === session.studentId) : null;
  const allGrades = getGrades();
  const allAssignments = getAssignments();
  const classResults = cls ? getClassResults(session.classId) : [];

  const studentGrades = allGrades.filter(g => g.classId === session.classId && g.studentId === session.studentId);
  const studentResults = classResults.filter(r => r.studentId === session.studentId || r.playerName === session.studentName);

  const overallAvg = useMemo(() => {
    if (studentGrades.length === 0) return null;
    const total = studentGrades.reduce((sum, g) => sum + (g.score || 0), 0);
    return Math.round(total / studentGrades.length);
  }, [studentGrades]);

  const assignmentSummary = useMemo(() => {
    const assigned = allAssignments.filter(a => a.classId === session.classId);
    const completed = assigned.filter(a => studentGrades.find(g => g.assignmentId === a.id));
    return { total: assigned.length, completed: completed.length };
  }, [allAssignments, studentGrades, session.classId]);

  const recentGames = studentResults.sort((a, b) => new Date(b.playedAt || 0) - new Date(a.playedAt || 0)).slice(0, 10);

  const gradesByStandard = useMemo(() => {
    const map = {};
    studentGrades.forEach(g => {
      const assignment = allAssignments.find(a => a.id === g.assignmentId);
      if (assignment?.teks) {
        assignment.teks.forEach(t => {
          if (!map[t]) map[t] = [];
          map[t].push(g.score || 0);
        });
      }
    });
    return map;
  }, [studentGrades, allAssignments]);

  const gradeColor = (score) => {
    if (score >= 90) return '#059669';
    if (score >= 70) return '#ca8a04';
    return '#dc2626';
  };

  const tabBtn = (id, label) => (
    <button key={id} type="button" onClick={() => setTab(id)} style={{
      padding: '8px 16px', borderRadius: 8, border: `2px solid ${tab === id ? '#2563eb' : '#e2e8f0'}`,
      background: tab === id ? '#eff6ff' : '#fff', color: tab === id ? '#2563eb' : '#64748b',
      fontWeight: 700, fontSize: 13, cursor: 'pointer',
    }}>{label}</button>
  );

  // ── Weekly & Daily Progress Report ──
  const now = new Date();
  const startOfWeek = (d) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); x.setHours(0,0,0,0); return x; };
  const endOfWeek = (d) => { const x = startOfWeek(d); x.setDate(x.getDate() + 6); x.setHours(23,59,59,999); return x; };
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart); lastWeekEnd.setSeconds(lastWeekEnd.getSeconds() - 1);

  const discussions = session?.classId ? getClassDiscussions(session.classId) : [];
  const discussionReplies = discussions.reduce((arr, d) => {
    (d.replies || []).filter(r => r.authorId === session.studentId).forEach(r => {
      arr.push({ type: 'discussion', title: d.title, date: r.createdAt, discussionId: d.id });
    });
    return arr;
  }, []);

  const getResultDate = (r) => new Date(r.playedAt || r.timestamp || 0);
  const thisWeekResults = studentResults.filter(r => { const d = getResultDate(r); return d >= thisWeekStart && d <= thisWeekEnd; });
  const lastWeekResults = studentResults.filter(r => { const d = getResultDate(r); return d >= lastWeekStart && d <= lastWeekEnd; });
  const thisWeekReplies = discussionReplies.filter(r => { const d = new Date(r.date); return d >= thisWeekStart && d <= thisWeekEnd; });
  const lastWeekReplies = discussionReplies.filter(r => { const d = new Date(r.date); return d >= lastWeekStart && d <= lastWeekEnd; });

  const thisWeekGames = thisWeekResults.filter(r => r.gameId !== 'warmup').length;
  const thisWeekWarmups = thisWeekResults.filter(r => r.gameId === 'warmup').length;
  const lastWeekGames = lastWeekResults.filter(r => r.gameId !== 'warmup').length;
  const lastWeekWarmups = lastWeekResults.filter(r => r.gameId === 'warmup').length;

  const weekTrend = lastWeekGames + lastWeekWarmups === 0
    ? 'new' : (thisWeekGames + thisWeekWarmups) > (lastWeekGames + lastWeekWarmups)
      ? 'up' : (thisWeekGames + thisWeekWarmups) < (lastWeekGames + lastWeekWarmups)
        ? 'down' : 'steady';

  const totalTimeThisWeek = thisWeekResults.reduce((s, r) => s + (r.time || 0), 0);
  const estMinutes = Math.round(totalTimeThisWeek / 60) || Math.max(0, thisWeekResults.length * 3);

  const dayByDay = useMemo(() => {
    const days = {};
    const add = (dateStr, item) => {
      const d = new Date(dateStr);
      d.setHours(0,0,0,0);
      const key = d.toISOString().slice(0,10);
      if (!days[key]) days[key] = { date: key, games: [], warmups: [], replies: [] };
      if (item.type === 'game') days[key].games.push(item);
      else if (item.type === 'warmup') days[key].warmups.push(item);
      else if (item.type === 'reply') days[key].replies.push(item);
    };
    studentResults.forEach(r => {
      const d = getResultDate(r);
      const item = { ...r, label: GAMES_CATALOG.find(g => g.id === r.gameId)?.name || r.gameId, score: r.score };
      if (r.gameId === 'warmup') add(r.playedAt || r.timestamp, { ...item, type: 'warmup' });
      else add(r.playedAt || r.timestamp, { ...item, type: 'game' });
    });
    discussionReplies.forEach(r => add(r.date, { ...r, type: 'reply' }));
    return Object.values(days).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  }, [studentResults, discussionReplies]);

  const reportRef = React.useRef(null);
  const handlePrint = () => {
    const el = reportRef.current;
    if (!el) return;
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Progress Report - ${session.studentName}</title></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.print();
    w.close();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff', padding: '20px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>👨‍👩‍👧‍👦 Parent Portal</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{session.studentName}'s Progress</h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{session.className} {session.grade && `· ${session.grade}`}</div>
          </div>
          <button type="button" onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#64748b' }}>Sign Out</button>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Overall Average', value: overallAvg != null ? `${overallAvg}%` : '—', color: overallAvg != null ? gradeColor(overallAvg) : '#94a3b8', icon: '📊' },
            { label: 'Assignments', value: `${assignmentSummary.completed}/${assignmentSummary.total}`, color: '#2563eb', icon: '📝' },
            { label: 'Games Played', value: studentResults.length, color: '#7c3aed', icon: '🎮' },
            { label: 'TEKS Covered', value: Object.keys(gradesByStandard).length, color: '#059669', icon: '📚' },
          ].map(card => (
            <div key={card.label} style={{ background: '#fff', borderRadius: 14, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{card.icon}</span>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {tabBtn('overview', '📊 Overview')}
          {tabBtn('grades', '📝 Grades')}
          {tabBtn('games', '🎮 Game History')}
          {tabBtn('standards', '📚 Standards')}
          {tabBtn('report', '📋 Progress Report')}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Recent Activity</h2>
            {recentGames.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No game activity yet.</div>
            ) : (
              recentGames.slice(0, 5).map((r, i) => {
                const game = GAMES_CATALOG.find(g => g.id === r.gameId);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                    <span style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{game?.icon || '🎮'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{game?.name || r.gameId}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{r.playedAt ? new Date(r.playedAt).toLocaleDateString() : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 18, color: gradeColor(r.score || 0) }}>{r.score || 0}%</div>
                      {r.correct != null && <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.correct}/{r.total || '?'} correct</div>}
                    </div>
                  </div>
                );
              })
            )}

            {overallAvg != null && (
              <div style={{ marginTop: 20, padding: 16, background: overallAvg >= 70 ? '#f0fdf4' : '#fef2f2', borderRadius: 12, border: `1px solid ${overallAvg >= 70 ? '#bbf7d0' : '#fecaca'}` }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: overallAvg >= 70 ? '#059669' : '#dc2626', marginBottom: 4 }}>
                  {overallAvg >= 90 ? '🌟 Excellent work!' : overallAvg >= 70 ? '✅ On track' : '📌 Needs support'}
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  {overallAvg >= 90 ? `${session.studentName} is performing excellently across assignments.` :
                   overallAvg >= 70 ? `${session.studentName} is meeting expectations. Encourage regular practice with the games.` :
                   `${session.studentName} may benefit from extra practice. Consider reviewing the standards below.`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grades */}
        {tab === 'grades' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Assignment Grades</h2>
            {studentGrades.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No graded assignments yet.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748b' }}>Assignment</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Score</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.sort((a, b) => new Date(b.gradedAt || 0) - new Date(a.gradedAt || 0)).map((g, i) => {
                      const assignment = allAssignments.find(a => a.id === g.assignmentId);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>{assignment?.name || g.assignmentId}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{ fontWeight: 900, color: gradeColor(g.score || 0), background: `${gradeColor(g.score || 0)}15`, padding: '4px 12px', borderRadius: 8, fontSize: 14 }}>
                              {g.score}%
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>{g.gradedAt ? new Date(g.gradedAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Game History */}
        {tab === 'games' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Game History</h2>
            {recentGames.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No games played yet.</div>
            ) : (
              recentGames.map((r, i) => {
                const game = GAMES_CATALOG.find(g => g.id === r.gameId);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: i % 2 === 0 ? '#f8fafc' : '#fff', borderRadius: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 28, width: 40, textAlign: 'center' }}>{game?.icon || '🎮'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{game?.name || r.gameId}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {r.playedAt ? new Date(r.playedAt).toLocaleDateString() : ''} · {r.correct ?? '?'}/{r.total ?? '?'} correct
                      </div>
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 20, color: gradeColor(r.score || 0) }}>{r.score || 0}%</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Progress Report */}
        {tab === 'report' && (
          <div ref={reportRef} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>📋 Progress Report</h2>
              <button type="button" onClick={handlePrint} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🖨️ Print / Export</button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>This Week</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Games</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#2563eb' }}>{thisWeekGames}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Warm-ups</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#7c3aed' }}>{thisWeekWarmups}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Discussion replies</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#059669' }}>{thisWeekReplies.length}</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Est. time</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{estMinutes} min</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, color: '#475569' }}>
                {weekTrend === 'up' && '📈 More activity than last week.'}
                {weekTrend === 'down' && '📉 Less activity than last week.'}
                {weekTrend === 'steady' && '➡️ Similar activity to last week.'}
                {weekTrend === 'new' && '🆕 First week of data.'}
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Day-by-day activity</h3>
              {dayByDay.length === 0 ? (
                <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No activity recorded yet.</div>
              ) : (
                dayByDay.map((day) => (
                  <div key={day.date} style={{ marginBottom: 16, padding: 14, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 10 }}>
                      {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {day.games.map((g, i) => (
                        <span key={i} style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>🎮 {g.label} ({g.score ?? '—'}%)</span>
                      ))}
                      {day.warmups.map((w, i) => (
                        <span key={i} style={{ background: '#f5f3ff', color: '#7c3aed', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>🏃 Warm-up ({w.score ?? '—'}%)</span>
                      ))}
                      {day.replies.map((r, i) => (
                        <span key={i} style={{ background: '#f0fdf4', color: '#059669', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>💬 Reply: {r.title}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Standards breakdown */}
        {tab === 'standards' && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800 }}>Standards Progress</h2>
            {Object.keys(gradesByStandard).length === 0 ? (
              <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>No standards data yet. Grades will appear once assignments are completed.</div>
            ) : (
              Object.entries(gradesByStandard).sort((a, b) => a[0].localeCompare(b[0])).map(([teks, scores]) => {
                const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
                const allTeks = TEKS_STANDARDS[cls?.grade || 'grade3'] || {};
                const desc = allTeks[teks] || teks;
                return (
                  <div key={teks} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{teks}</span>
                        <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>{desc.substring(0, 80)}{desc.length > 80 ? '…' : ''}</span>
                      </div>
                      <span style={{ fontWeight: 900, fontSize: 16, color: gradeColor(avg) }}>{avg}%</span>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${avg}%`, background: gradeColor(avg), borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 20 }}>
          <Link to="/" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>← Back to Home</Link>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Allen ACE — Powered by QBot 🤖</div>
        </div>
      </div>
    </div>
  );
}
