import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import {
  getClasses, getGrades, getAssignments, getAuthToken,
  getGradeCategories, getLetterGrade, computeWeightedAverage, getGradeScheme,
  formatGrade, fetchStudentGradesFromServer,
} from '../utils/storage';

const FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const scoreColor = (score) => {
  if (score >= 90) return '#15803d';
  if (score >= 80) return '#0369a1';
  if (score >= 70) return '#d97706';
  if (score >= 60) return '#c2410c';
  return '#dc2626';
};

const scoreBg = (score) => {
  if (score >= 90) return '#f0fdf4';
  if (score >= 80) return '#eff6ff';
  if (score >= 70) return '#fffbeb';
  if (score >= 60) return '#fff7ed';
  return '#fef2f2';
};

const STATUS_STYLES = {
  Graded: { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  Missing: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  Pending: { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const StudentGrades = () => {
  const { classId: routeClassId } = useParams();
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState(null);
  const [classId, setClassId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [scheme, setScheme] = useState([]);
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    const sid = localStorage.getItem('currentStudentId');
    const studentUser = JSON.parse(localStorage.getItem('quantegy-student-user') || 'null');
    const effectiveSid = sid || studentUser?.id;
    const cid = routeClassId || localStorage.getItem('currentClassId');

    if (effectiveSid) setStudentId(effectiveSid);

    const loadData = async () => {
      const token = getAuthToken();
      const isStudentSession = !!studentUser && !!token;
      if (isStudentSession && effectiveSid) {
        const data = await fetchStudentGradesFromServer();
        if (data) {
          setClasses(data.classes);
          setGrades(data.grades);
          setAssignments(data.assignments);
          if (!cid && data.classes?.length) setClassId(data.classes[0]?.id || null);
          else if (cid) setClassId(cid);
          return;
        }
      }
      const allClasses = getClasses();
      setClasses(allClasses);
      setGrades(getGrades());
      setAssignments(getAssignments());
      if (cid) setClassId(cid);
      else if (effectiveSid && allClasses.length) {
        const enrolled = allClasses.find(c => (c.students || []).some(s => s.id === effectiveSid));
        setClassId(enrolled?.id || allClasses[0]?.id || null);
      }
    };
    loadData();
  }, [routeClassId]);

  useEffect(() => {
    if (!classId) return;
    setCategories(getGradeCategories(classId));
    setScheme(getGradeScheme(classId));
  }, [classId]);

  const classAssignments = useMemo(
    () => assignments.filter(a => a.classId === classId),
    [assignments, classId],
  );

  const studentGrades = useMemo(
    () => grades.filter(g => g.studentId === studentId),
    [grades, studentId],
  );

  const filteredAssignments = useMemo(() => {
    if (filterCat === 'all') return classAssignments;
    return classAssignments.filter(a => a.category === filterCat);
  }, [classAssignments, filterCat]);

  const overallAvg = useMemo(() => {
    if (!studentId || !classId) return null;
    return computeWeightedAverage(studentId, classId, classAssignments, grades);
  }, [studentId, classId, classAssignments, grades]);

  const completedCount = useMemo(
    () => classAssignments.filter(a => studentGrades.some(g => g.assignmentId === a.id && g.score != null)).length,
    [classAssignments, studentGrades],
  );

  const missingCount = useMemo(() => {
    const now = new Date();
    return classAssignments.filter(a => {
      const graded = studentGrades.some(g => g.assignmentId === a.id && g.score != null);
      if (graded) return false;
      if (a.dueDate && new Date(a.dueDate) < now) return true;
      return false;
    }).length;
  }, [classAssignments, studentGrades]);

  const categoryBreakdown = useMemo(() => {
    if (!categories.length) return [];
    return categories.map(cat => {
      const catAssignments = classAssignments.filter(a => a.category === cat.id);
      const scored = catAssignments
        .map(a => { const g = studentGrades.find(g2 => g2.assignmentId === a.id); return g?.score ?? null; })
        .filter(s => s !== null);
      const avg = scored.length ? scored.reduce((a, b) => a + b, 0) / scored.length : null;
      return { ...cat, count: catAssignments.length, scored: scored.length, avg };
    });
  }, [categories, classAssignments, studentGrades]);

  const trendData = useMemo(() => {
    const sorted = classAssignments
      .map(a => {
        const g = studentGrades.find(g2 => g2.assignmentId === a.id);
        return g?.score != null ? { name: a.name, score: g.score, date: a.dueDate || g.syncedAt || '' } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.slice(-12);
  }, [classAssignments, studentGrades]);

  const getStatus = (assignment) => {
    const g = studentGrades.find(g2 => g2.assignmentId === assignment.id);
    if (g?.score != null) return 'Graded';
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return 'Missing';
    return 'Pending';
  };

  const currentClass = classes.find(c => c.id === classId);

  if (!studentId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: FONT }}>
        <div style={{ textAlign: 'center', padding: 40, background: '#fff', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>No Student Session</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>Please log in as a student to view your grades.</p>
          <button onClick={() => navigate('/student')} style={{
            marginTop: 16, padding: '10px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
          }}>Go to Student Portal</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff7ed 100%)', fontFamily: FONT }}>
      <main id="student-grades-main">
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
        padding: '32px 24px 28px', color: '#fff',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>My Grades</div>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                {currentClass?.name || 'Student Grades'}
              </h1>
            </div>
            {classes.length > 1 && (
              <select
                value={classId || ''}
                onChange={e => setClassId(e.target.value)}
                aria-label="Select class to view grades"
                style={{
                  padding: '8px 14px', borderRadius: 10, border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', backdropFilter: 'blur(8px)', outline: 'none',
                }}
              >
                {classes.map(c => <option key={c.id} value={c.id} style={{ color: '#0f172a' }}>{c.name}</option>)}
              </select>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
        <Breadcrumb items={[
          { label: 'Dashboard', to: '/student' },
          { label: 'Grades', to: '/student-grades' },
          ...(currentClass ? [{ label: currentClass.name }] : []),
        ]} />
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <SummaryCard icon="🎯" label="Overall Average" value={overallAvg != null ? `${Math.round(overallAvg)}%` : '—'} sub={overallAvg != null ? formatGrade(Math.round(overallAvg), classId) : ''} color={overallAvg != null ? scoreColor(overallAvg) : '#94a3b8'} />
          <SummaryCard icon="📋" label="Total Assignments" value={classAssignments.length} sub="assigned" color="#2563eb" />
          <SummaryCard icon="✅" label="Completed" value={completedCount} sub={`of ${classAssignments.length}`} color="#15803d" />
          <SummaryCard icon="⚠️" label="Missing" value={missingCount} sub="past due" color={missingCount > 0 ? '#dc2626' : '#94a3b8'} />
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0', padding: 24, marginBottom: 28,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📊</span> Grade Breakdown by Category
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {categoryBreakdown.map(cat => (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: cat.color || '#94a3b8', display: 'inline-block',
                      }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{cat.name}</span>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{cat.weight}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#64748b' }}>{cat.scored}/{cat.count} graded</span>
                      {cat.avg != null && (
                        <span style={{
                          fontSize: 13, fontWeight: 800, color: scoreColor(cat.avg),
                          background: scoreBg(cat.avg), padding: '2px 10px', borderRadius: 8,
                        }}>
                          {Math.round(cat.avg)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 6, transition: 'width 0.5s ease',
                      width: cat.avg != null ? `${Math.min(cat.avg, 100)}%` : '0%',
                      background: cat.avg != null
                        ? `linear-gradient(90deg, ${cat.color || '#94a3b8'}, ${cat.color || '#94a3b8'}dd)`
                        : '#e2e8f0',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade Trend */}
        {trendData.length >= 2 && (
          <div style={{
            background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0', padding: 24, marginBottom: 28,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📈</span> Grade Trend
            </h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 4px' }}>
              {trendData.map((d, i) => {
                const h = Math.max(8, (d.score / 100) * 110);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor(d.score) }}>{d.score}</span>
                    <div
                      title={`${d.name}: ${d.score}%`}
                      style={{
                        width: '100%', maxWidth: 48, height: h, borderRadius: '6px 6px 2px 2px',
                        background: `linear-gradient(180deg, ${scoreColor(d.score)}cc, ${scoreColor(d.score)})`,
                        transition: 'height 0.4s ease',
                        cursor: 'default',
                      }}
                    />
                    <span style={{
                      fontSize: 9, color: '#94a3b8', fontWeight: 600, maxWidth: 54,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
                    }}>
                      {d.name.length > 8 ? d.name.slice(0, 7) + '…' : d.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter + Assignments Table */}
        <div style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0', overflow: 'hidden',
        }}>
          <div style={{
            padding: '18px 24px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📝</span> All Assignments
            </h2>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              aria-label="Filter assignments by category"
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
                fontSize: 13, fontWeight: 600, color: '#334155', background: '#f8fafc',
                cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {filteredAssignments.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>No assignments found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} aria-label="All assignments with score, grade, and status">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Assignment', 'Category', 'Due Date', 'Score', 'Grade', 'Status'].map(h => (
                      <th key={h} scope="col" style={{
                        padding: '10px 16px', textAlign: 'left', fontWeight: 700,
                        color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
                        borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(a => {
                    const g = studentGrades.find(g2 => g2.assignmentId === a.id);
                    const score = g?.score ?? null;
                    const status = getStatus(a);
                    const sStyle = STATUS_STYLES[status];
                    const letter = score != null ? getLetterGrade(score, classId) : null;
                    const cat = categories.find(c => c.id === a.category);
                    const hidden = (a.postPolicy === 'manual' || a.postPolicy === 'date') && !a.gradesPosted;
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.name}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {cat ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              fontSize: 12, fontWeight: 600, color: cat.color || '#64748b',
                              background: `${cat.color || '#94a3b8'}14`, padding: '3px 10px',
                              borderRadius: 6, border: `1px solid ${cat.color || '#94a3b8'}30`,
                            }}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat.color }} />
                              {cat.name}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap', fontSize: 12 }}>
                          {a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {hidden ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                              🔒 Grades pending
                            </span>
                          ) : score != null ? (
                            <span style={{
                              fontWeight: 800, fontSize: 14, color: scoreColor(score),
                              background: scoreBg(score), padding: '3px 10px', borderRadius: 8,
                            }}>
                              {score}%
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {hidden ? (
                            <span style={{ color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>Not posted</span>
                          ) : letter ? (
                            <span style={{
                              fontWeight: 800, fontSize: 14, color: letter.color,
                              background: scoreBg(score), padding: '3px 10px', borderRadius: 8,
                            }}>
                              {formatGrade(score, classId)}
                            </span>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-block', fontSize: 11, fontWeight: 700,
                            padding: '3px 10px', borderRadius: 6,
                            color: sStyle.color, background: sStyle.bg, border: `1px solid ${sStyle.border}`,
                          }}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, sub, color }) => (
  <div style={{
    background: '#fff', borderRadius: 14, padding: '20px 22px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.2s',
  }}>
    <div style={{
      width: 46, height: 46, borderRadius: 12, display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: 22,
      background: `${color}14`, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 24, fontWeight: 900, color }}>{value}</span>
        {sub && <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>{sub}</span>}
      </div>
    </div>
  </div>
);

export default StudentGrades;
