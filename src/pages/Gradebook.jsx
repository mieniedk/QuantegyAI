import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import {
  getClasses, getGrades, getAssignments, saveGrades, saveAssignments,
  syncGradebook, getGameResults, getAuthToken,
  getGradeCategories, saveGradeCategories, getGradeScheme, saveGradeScheme,
  getLetterGrade, computeWeightedAverage, getSections,
  getSchemeType, saveSchemeType, getPassFailThreshold, savePassFailThreshold, formatGrade,
} from '../utils/storage';
const AUTH_HEADERS = () => ({ 'Content-Type': 'application/json', ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}) });

const SOURCE_BADGE = {
  game: { label: 'Game', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', icon: '\uD83C\uDFAE' },
  discussion: { label: 'Discussion', color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff', icon: '\uD83D\uDCAC' },
  exitTicket: { label: 'Exit Ticket', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '\uD83C\uDFAB' },
  manual: { label: 'Manual', color: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: '\u270F\uFE0F' },
};

const DEFAULT_CATEGORIES = [
  { id: 'homework', name: 'Homework', weight: 20, color: '#2563eb' },
  { id: 'quizzes', name: 'Quizzes', weight: 20, color: '#7c3aed' },
  { id: 'tests', name: 'Tests', weight: 40, color: '#dc2626' },
  { id: 'participation', name: 'Participation', weight: 10, color: '#15803d' },
  { id: 'projects', name: 'Projects', weight: 10, color: '#d97706' },
];

const Gradebook = () => {
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentCategory, setNewAssignmentCategory] = useState('');
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [syncStats, setSyncStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState([]);
  const [gradeScheme, setGradeSchemeState] = useState([]);
  const [useWeighted, setUseWeighted] = useState(false);
  const [schemeType, setSchemeTypeState] = useState('letter');
  const [passFailThreshold, setPassFailThresholdState] = useState(60);
  const [groups, setGroups] = useState([]);
  const location = useLocation();

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/classes/${selectedClass}/groups`, { headers: AUTH_HEADERS() })
      .then(r => r.ok ? r.json() : {})
      .then(d => setGroups(d.groups || []))
      .catch(() => setGroups([]));
  }, [selectedClass]);

  const refresh = useCallback(() => {
    setClasses(getClasses());
    setGrades(getGrades());
    setAssignments(getAssignments());
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const cats = getGradeCategories(selectedClass);
      setCategories(cats.length ? cats : []);
      setUseWeighted(cats.length > 0);
      setGradeSchemeState(getGradeScheme(selectedClass));
      setSchemeTypeState(getSchemeType(selectedClass));
      setPassFailThresholdState(getPassFailThreshold(selectedClass));
    }
  }, [selectedClass]);

  const runSync = useCallback((classId) => {
    setSyncing(true);
    try {
      const stats = syncGradebook(classId || undefined);
      setSyncStats(stats);
      refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [location.pathname, refresh]);

  // Auto-sync when a class is selected
  useEffect(() => {
    if (selectedClass) runSync(selectedClass);
  }, [selectedClass, runSync]);

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (newAssignmentName && selectedClass) {
      const all = getAssignments();
      const newA = { id: `a-${Date.now()}`, name: newAssignmentName, classId: selectedClass, source: 'manual', category: newAssignmentCategory || undefined, postPolicy: 'auto', gradesPosted: true };
      saveAssignments([...all, newA]);
      refresh();
      setNewAssignmentName('');
      setNewAssignmentCategory('');
      setShowAddAssignment(false);
    }
  };

  const handleSaveCategories = (cats) => {
    setCategories(cats);
    saveGradeCategories(selectedClass, cats);
    setUseWeighted(cats.length > 0);
  };

  const handleSaveScheme = (scheme) => {
    setGradeSchemeState(scheme);
    saveGradeScheme(selectedClass, scheme);
  };

  const handleSaveSchemeType = (type) => {
    setSchemeTypeState(type);
    saveSchemeType(selectedClass, type);
  };

  const handleSavePassFailThreshold = (t) => {
    const v = Math.max(0, Math.min(100, parseInt(t) || 60));
    setPassFailThresholdState(v);
    savePassFailThreshold(selectedClass, v);
  };

  const handleTogglePostGrades = async (assignment) => {
    const posting = !assignment.gradesPosted;
    const endpoint = posting
      ? `/api/auth/assignments/${assignment.id}/post-grades`
      : `/api/auth/assignments/${assignment.id}/hide-grades`;
    try {
      const token = getAuthToken();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const all = getAssignments().map(a =>
          a.id === assignment.id
            ? { ...a, gradesPosted: posting, postedAt: posting ? new Date().toISOString() : null }
            : a
        );
        saveAssignments(all);
        refresh();
      }
    } catch (err) {
      console.warn('Failed to post grades:', err);
    }
  };

  const computeLatePenalty = (assignment, gradeData) => {
    if (!assignment.dueDate || !assignment.latePolicy || assignment.latePolicy === 'accept' || assignment.latePolicy === 'none') return null;
    const submittedAt = gradeData?.syncedAt || gradeData?.submittedAt;
    if (!submittedAt) return null;
    const grace = (assignment.gracePeriodMinutes || 0) * 60000;
    const due = new Date(assignment.dueDate).getTime() + grace;
    const sub = new Date(submittedAt).getTime();
    if (sub <= due) return null;
    const daysLate = Math.ceil((sub - due) / 86400000);
    const original = gradeData.score;
    if (original == null) return null;
    let adjusted, label;
    if (assignment.latePolicy === 'deduct10') {
      const penalty = daysLate * 10;
      adjusted = Math.max(0, original - (original * penalty / 100));
      label = `-${penalty}% late`;
    } else if (assignment.latePolicy === 'deduct20') {
      const penalty = daysLate * 20;
      adjusted = Math.max(0, original - (original * penalty / 100));
      label = `-${penalty}% late`;
    } else if (assignment.latePolicy === 'half') {
      adjusted = Math.min(original, 50);
      label = 'capped 50%';
    } else return null;
    return { original, adjusted: Math.round(adjusted), label, daysLate };
  };

  const handleAssignCategory = (assignmentId, categoryId) => {
    const all = getAssignments();
    saveAssignments(all.map(a => a.id === assignmentId ? { ...a, category: categoryId || undefined } : a));
    refresh();
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);
  const classStudents = selectedClassData?.students || [];
  const classSections = selectedClass ? getSections(selectedClass) : [];

  const isStudentAssigned = useCallback((studentId, assignment) => {
    if (!assignment.assignedTo || assignment.assignedTo === 'all') return true;
    if (!Array.isArray(assignment.assignedTo)) return true;
    return assignment.assignedTo.some((secId) => {
      const sec = classSections.find((s) => s.id === secId);
      return sec && (sec.studentIds || []).includes(studentId);
    });
  }, [classSections]);

  const classAssignments = useMemo(() => {
    let filtered = assignments.filter((a) => a.classId === selectedClass);
    if (filter === 'game') filtered = filtered.filter((a) => a.gameId);
    else if (filter === 'discussion') filtered = filtered.filter((a) => a.source === 'discussion');
    else if (filter === 'exitTicket') filtered = filtered.filter((a) => a.source === 'exitTicket');
    else if (filter === 'manual') filtered = filtered.filter((a) => !a.gameId && !a.source);
    return filtered;
  }, [assignments, selectedClass, filter]);

  const getGradeData = (studentId, assignmentId) => {
    return grades.find((g) => g.studentId === studentId && g.assignmentId === assignmentId) || null;
  };

  const updateGrade = (studentId, assignmentId, score) => {
    const numScore = score === '' ? null : parseInt(score, 10);
    const valid = numScore !== null && !isNaN(numScore) && numScore >= 0 && numScore <= 100;
    const existing = grades.findIndex((g) => g.studentId === studentId && g.assignmentId === assignmentId);
    let newGrades;
    if (!valid && score === '') {
      newGrades = existing >= 0 ? grades.filter((_, i) => i !== existing) : grades;
    } else if (valid) {
      const entry = { studentId, assignmentId, score: numScore, source: 'manual', syncedAt: new Date().toISOString() };
      newGrades = existing >= 0 ? grades.map((g, i) => (i === existing ? entry : g)) : [...grades, entry];
    } else return;
    setGrades(newGrades);
    saveGrades(newGrades);
  };

  const studentRows = useMemo(() => {
    const rows = classStudents.map((s) => {
      const studentGrades = classAssignments.map((a) => {
        if (!isStudentAssigned(s.id, a)) return null;
        const g = getGradeData(s.id, a.id);
        return g ? g.score : null;
      });
      const applicableAssignments = classAssignments.filter((a) => isStudentAssigned(s.id, a));
      const avg = useWeighted && categories.length
        ? computeWeightedAverage(s.id, selectedClass, applicableAssignments, grades)
        : (() => { const nums = studentGrades.filter((g) => g !== null); return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null; })();
      const letter = avg != null ? getLetterGrade(avg, selectedClass) : null;
      return { student: s, grades: studentGrades, avg, letter };
    });

    if (sortCol === 'name') {
      rows.sort((a, b) => sortDir === 'asc'
        ? a.student.name.localeCompare(b.student.name)
        : b.student.name.localeCompare(a.student.name));
    } else if (sortCol === 'avg') {
      rows.sort((a, b) => {
        const aVal = a.avg ?? -1;
        const bVal = b.avg ?? -1;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    } else if (sortCol != null) {
      const colIdx = classAssignments.findIndex((a) => a.id === sortCol);
      if (colIdx >= 0) {
        rows.sort((a, b) => {
          const aVal = a.grades[colIdx] ?? -1;
          const bVal = b.grades[colIdx] ?? -1;
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }
    }
    return rows;
  }, [classStudents, classAssignments, grades, sortCol, sortDir, useWeighted, categories, selectedClass]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  // Class-wide stats
  const classAvg = useMemo(() => {
    const all = studentRows.filter((r) => r.avg !== null).map((r) => r.avg);
    return all.length ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1) : '—';
  }, [studentRows]);

  const totalGraded = useMemo(() => grades.filter((g) => classAssignments.some((a) => a.id === g.assignmentId)).length, [grades, classAssignments]);
  const autoCount = useMemo(() => grades.filter((g) => g.source && g.source !== 'manual' && classAssignments.some((a) => a.id === g.assignmentId)).length, [grades, classAssignments]);

  const getScoreColor = (score) => {
    if (score >= 90) return '#15803d';
    if (score >= 80) return '#0369a1';
    if (score >= 70) return '#d97706';
    if (score >= 60) return '#c2410c';
    return '#dc2626';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return '#f0fdf4';
    if (score >= 80) return '#eff6ff';
    if (score >= 70) return '#fffbeb';
    if (score >= 60) return '#fff7ed';
    return '#fef2f2';
  };

  const SortArrow = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3, fontSize: 10 }}> ↕</span>;
    return <span style={{ fontSize: 10 }}> {sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/teacher-dashboard' },
            { label: 'Gradebook', to: selectedClass ? undefined : '/gradebook' },
            ...(selectedClass ? [{ label: (classes.find(c => c.id === selectedClass) || {}).name || 'Class' }] : []),
          ]} />
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Gradebook</h1>
        </div>
      </div>

      {classes.length === 0 ? (
        <div style={{ padding: 40, background: '#f8fafc', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b' }}>No classes yet. <Link to="/teacher-class-new" style={{ color: '#2563eb' }}>Create a class</Link> first.</p>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value || null)}
              aria-label="Select class"
              style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, minWidth: 220 }}>
              <option value="">Choose a class...</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.gradeLevel})</option>
              ))}
            </select>

            {selectedClass && (
              <>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by type"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                  <option value="all">All Assignments</option>
                  <option value="game">Games Only</option>
                  <option value="discussion">Discussions Only</option>
                  <option value="exitTicket">Exit Tickets Only</option>
                  <option value="manual">Manual Only</option>
                </select>
                <button type="button" onClick={() => runSync(selectedClass)} disabled={syncing}
                  style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: syncing ? '#f1f5f9' : '#fff', cursor: syncing ? 'wait' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span aria-hidden="true">{syncing ? '\u23F3' : '\uD83D\uDD04'}</span> {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button type="button" onClick={() => setShowSettings(!showSettings)}
                  style={{ padding: '10px 16px', borderRadius: 8, border: showSettings ? '2px solid #2563eb' : '1px solid #e2e8f0', background: showSettings ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, color: showSettings ? '#2563eb' : '#475569' }}>
                  ⚙️ Grade Settings
                </button>
              </>
            )}
          </div>

          {/* Grade Settings Panel */}
          {showSettings && selectedClass && (
            <GradeSettingsPanel
              categories={categories}
              onSaveCategories={handleSaveCategories}
              scheme={gradeScheme}
              onSaveScheme={handleSaveScheme}
              useWeighted={useWeighted}
              onToggleWeighted={(v) => { setUseWeighted(v); if (!v) handleSaveCategories([]); }}
              assignments={classAssignments}
              onAssignCategory={handleAssignCategory}
              groups={groups}
              onAssignGroup={(assignmentId, groupId) => {
                const all = getAssignments().map(a => a.id === assignmentId ? { ...a, groupId: groupId || undefined } : a);
                saveAssignments(all);
                refresh();
              }}
              schemeType={schemeType}
              onSaveSchemeType={handleSaveSchemeType}
              passFailThreshold={passFailThreshold}
              onSavePassFailThreshold={handleSavePassFailThreshold}
              selectedClass={selectedClass}
              onRefresh={refresh}
            />
          )}

          {/* Sync Stats Banner */}
          {syncStats && selectedClass && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Grades', value: totalGraded, color: '#2563eb', bg: '#eff6ff' },
                { label: 'Auto-Populated', value: autoCount, color: '#15803d', bg: '#f0fdf4' },
                { label: 'Class Average', value: classAvg, color: '#7c3aed', bg: '#faf5ff' },
                { label: 'Assignments', value: classAssignments.length, color: '#0369a1', bg: '#f0f9ff' },
              ].map((s) => (
                <div key={s.label} style={{ padding: '10px 16px', borderRadius: 10, background: s.bg, flex: '1 1 120px', minWidth: 100 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Source Legend */}
          {selectedClass && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              {Object.entries(SOURCE_BADGE).map(([key, badge]) => (
                <span key={key} style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span aria-hidden="true">{badge.icon}</span> {badge.label}
                </span>
              ))}
            </div>
          )}

          {/* Gradebook Table */}
          {selectedClassData && (
            <div>
              {classStudents.length === 0 ? (
                <div style={{ padding: 32, background: '#f8fafc', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b' }}>No students in this class yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} role="grid" aria-label="Gradebook">
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th onClick={() => toggleSort('name')} style={{ padding: '12px 14px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', cursor: 'pointer', fontWeight: 700, color: '#0f172a', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1, minWidth: 140 }}>
                          Student <SortArrow col="name" />
                        </th>
                        {classAssignments.map((a) => {
                          const srcBadge = a.source ? SOURCE_BADGE[a.source] : (a.gameId ? SOURCE_BADGE.game : null);
                          const sectionNames = (Array.isArray(a.assignedTo) && a.assignedTo.length > 0)
                            ? a.assignedTo.map((secId) => { const sec = classSections.find((s) => s.id === secId); return sec ? sec.name : null; }).filter(Boolean)
                            : null;
                          return (
                            <th key={a.id} onClick={() => toggleSort(a.id)} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', cursor: 'pointer', fontWeight: 600, color: '#0f172a', minWidth: 90, maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <div title={a.name} style={{ fontSize: 12 }}>{a.name?.length > 18 ? a.name.slice(0, 18) + '...' : a.name}</div>
                              {srcBadge && (
                                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: srcBadge.bg, color: srcBadge.color, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>
                                  {srcBadge.icon} {srcBadge.label}
                                </span>
                              )}
                              {sectionNames && (
                                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#faf5ff', color: '#7c3aed', fontWeight: 700, display: 'inline-block', marginTop: 2, border: '1px solid #e9d5ff' }}>
                                  📂 {sectionNames.join(', ')}
                                </span>
                              )}
                              {useWeighted && a.category && (() => { const cat = categories.find(c => c.id === a.category); return cat ? <div style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: cat.color + '18', color: cat.color, fontWeight: 700, display: 'inline-block', marginTop: 2 }}>{cat.name}</div> : null; })()}
                              {a.teks?.length > 0 && (
                                <div style={{ fontSize: 9, color: '#2563eb', fontWeight: 400, marginTop: 1 }}>{a.teks.slice(0, 3).join(', ')}</div>
                              )}
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleTogglePostGrades(a); }}
                                style={{
                                  display: 'inline-block', marginTop: 3, padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, cursor: 'pointer',
                                  border: 'none', background: a.gradesPosted ? '#e2e8f0' : '#2563eb', color: a.gradesPosted ? '#64748b' : '#fff',
                                }}>
                                {a.gradesPosted ? 'Hide Grades' : 'Post Grades'}
                              </button>
                              <SortArrow col={a.id} />
                            </th>
                          );
                        })}
                        <th onClick={() => toggleSort('avg')} style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', cursor: 'pointer', fontWeight: 700, color: '#0f172a', minWidth: 90 }}>
                          {useWeighted ? 'Weighted' : 'Avg'} <SortArrow col="avg" />
                          {useWeighted && <div style={{ fontSize: 9, color: '#7c3aed', fontWeight: 600 }}>+ Letter</div>}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRows.map(({ student, avg }) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 14px', fontWeight: 600, color: '#0f172a', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                            {student.name}
                          </td>
                          {classAssignments.map((a) => {
                            const assigned = isStudentAssigned(student.id, a);
                            if (!assigned) {
                              return (
                                <td key={a.id} style={{
                                  padding: '4px 6px', textAlign: 'center',
                                  background: '#f8fafc', borderLeft: '1px solid #f1f5f9',
                                }}>
                                  <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 600 }} title="Not assigned to this student's section">—</span>
                                </td>
                              );
                            }
                            const gradeData = getGradeData(student.id, a.id);
                            const score = gradeData?.score;
                            const source = gradeData?.source || 'manual';
                            const isAuto = source !== 'manual';
                            const badge = SOURCE_BADGE[source] || SOURCE_BADGE.manual;
                            const penalty = computeLatePenalty(a, gradeData);
                            const displayScore = penalty ? penalty.adjusted : score;
                            return (
                              <td key={a.id} style={{
                                padding: '4px 6px', textAlign: 'center',
                                background: displayScore != null ? getScoreBg(displayScore) : '#fff',
                                borderLeft: '1px solid #f1f5f9',
                              }}>
                                {isAuto && score != null ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <span style={{ fontSize: 15, fontWeight: 800, color: getScoreColor(displayScore) }}>{displayScore}</span>
                                    {penalty && <span style={{ fontSize: 8, color: '#dc2626', fontWeight: 700 }}>({penalty.label})</span>}
                                    <span style={{ fontSize: 8, padding: '0 4px', borderRadius: 3, background: badge.bg, color: badge.color, fontWeight: 700, border: `1px solid ${badge.border}` }}>
                                      {badge.icon} AUTO
                                    </span>
                                    {schemeType !== 'letter' && <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{formatGrade(displayScore, selectedClass)}</span>}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <input
                                      type="number" min="0" max="100"
                                      value={score ?? ''}
                                      onChange={(e) => updateGrade(student.id, a.id, e.target.value)}
                                      aria-label={`Grade for ${student.name} on ${a.name}`}
                                      style={{
                                        width: 52, padding: '6px 4px', textAlign: 'center', borderRadius: 6,
                                        border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 700,
                                        color: displayScore != null ? getScoreColor(displayScore) : '#94a3b8',
                                        background: 'transparent',
                                      }}
                                    />
                                    {penalty && <span style={{ fontSize: 8, color: '#dc2626', fontWeight: 700 }}>({penalty.label})</span>}
                                    {schemeType !== 'letter' && score != null && <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>{formatGrade(displayScore, selectedClass)}</span>}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                          <td style={{ padding: '8px', textAlign: 'center', fontWeight: 800, fontSize: 14, color: avg != null ? getScoreColor(avg) : '#94a3b8', background: avg != null ? getScoreBg(avg) : '#fff', borderLeft: '2px solid #e2e8f0' }}>
                            {avg != null ? (
                              <div>
                                <div>{avg.toFixed(1)}</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: getLetterGrade(avg, selectedClass).color, marginTop: 1 }}>{formatGrade(avg, selectedClass)}</div>
                              </div>
                            ) : '\u2014'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Class averages footer */}
                    {studentRows.length > 1 && (
                      <tfoot>
                        <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a', fontSize: 12, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1 }}>CLASS AVG</td>
                          {classAssignments.map((a) => {
                            const scores = studentRows.map((r) => {
                              const g = getGradeData(r.student.id, a.id);
                              return g ? g.score : null;
                            }).filter((s) => s !== null);
                            const colAvg = scores.length ? (scores.reduce((x, y) => x + y, 0) / scores.length) : null;
                            return (
                              <td key={a.id} style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, fontSize: 13, color: colAvg != null ? getScoreColor(colAvg) : '#94a3b8' }}>
                                {colAvg != null ? colAvg.toFixed(1) : '\u2014'}
                              </td>
                            );
                          })}
                          <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, fontSize: 14, color: classAvg !== '\u2014' ? getScoreColor(parseFloat(classAvg)) : '#94a3b8', borderLeft: '2px solid #e2e8f0' }}>
                            {classAvg}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}

              {/* Add Assignment */}
              {classStudents.length > 0 && (
                <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {!showAddAssignment ? (
                    <button type="button" onClick={() => setShowAddAssignment(true)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      + Add Manual Assignment
                    </button>
                  ) : (
                    <form onSubmit={handleAddAssignment} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="text" placeholder="Assignment name..." value={newAssignmentName}
                        onChange={(e) => setNewAssignmentName(e.target.value)}
                        aria-label="New assignment name" autoFocus
                        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 200 }} />
                      <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
                      <button type="button" onClick={() => { setShowAddAssignment(false); setNewAssignmentName(''); }}
                        style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                    </form>
                  )}
                </div>
              )}

              {/* Recent Auto-Sync Activity */}
              {syncStats && syncStats.synced > 0 && (
                <div role="status" style={{ marginTop: 16, padding: '10px 16px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                  Synced {syncStats.synced} new grade{syncStats.synced > 1 ? 's' : ''} from:
                  {syncStats.bySource.game > 0 && ` ${syncStats.bySource.game} game result${syncStats.bySource.game > 1 ? 's' : ''}`}
                  {syncStats.bySource.discussion > 0 && ` ${syncStats.bySource.discussion} discussion${syncStats.bySource.discussion > 1 ? 's' : ''}`}
                  {syncStats.bySource.exitTicket > 0 && ` ${syncStats.bySource.exitTicket} exit ticket${syncStats.bySource.exitTicket > 1 ? 's' : ''}`}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

function GradeSettingsPanel({ categories, onSaveCategories, scheme, onSaveScheme, useWeighted, onToggleWeighted, assignments, onAssignCategory, groups = [], onAssignGroup, schemeType, onSaveSchemeType, passFailThreshold, onSavePassFailThreshold, selectedClass, onRefresh }) {
  const [cats, setCats] = useState(categories.length ? categories : []);
  const [sch, setSch] = useState(scheme);
  const [tab, setTab] = useState('categories');
  const [newCatName, setNewCatName] = useState('');
  const [newCatWeight, setNewCatWeight] = useState(10);

  const totalWeight = cats.reduce((s, c) => s + c.weight, 0);

  const handleAddCat = () => {
    if (!newCatName.trim()) return;
    const id = newCatName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const colors = ['#2563eb', '#7c3aed', '#dc2626', '#15803d', '#d97706', '#0891b2', '#be185d', '#4f46e5'];
    setCats([...cats, { id, name: newCatName.trim(), weight: newCatWeight, color: colors[cats.length % colors.length] }]);
    setNewCatName('');
    setNewCatWeight(10);
  };

  const removeCat = (id) => setCats(cats.filter(c => c.id !== id));
  const updateCatWeight = (id, w) => setCats(cats.map(c => c.id === id ? { ...c, weight: Math.max(0, Math.min(100, parseInt(w) || 0)) } : c));

  const handleApplyPreset = () => {
    setCats(DEFAULT_CATEGORIES);
  };

  const handleSave = () => {
    onSaveCategories(cats);
  };

  const handleUpdateSchemeMin = (idx, min) => {
    const updated = [...sch];
    updated[idx] = { ...updated[idx], min: Math.max(0, Math.min(100, parseInt(min) || 0)) };
    setSch(updated);
  };

  return (
    <div style={{ marginBottom: 16, background: '#fff', border: '2px solid #2563eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        {[{ id: 'categories', label: '📊 Weights' }, { id: 'scheme', label: '🔤 Scheme' }, { id: 'schemeType', label: '📐 Scheme Type' }, { id: 'postPolicy', label: '📮 Post Policy' }, { id: 'assign', label: '🏷️ Assign' }, { id: 'group', label: '👥 Group' }].map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: tab === t.id ? '#eff6ff' : '#f8fafc', color: tab === t.id ? '#2563eb' : '#64748b',
            borderBottom: tab === t.id ? '3px solid #2563eb' : '3px solid transparent',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {tab === 'categories' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                <input type="checkbox" checked={useWeighted} onChange={(e) => { onToggleWeighted(e.target.checked); if (e.target.checked && !cats.length) handleApplyPreset(); }} />
                Enable weighted grading
              </label>
              {!cats.length && <button type="button" onClick={handleApplyPreset} style={{ fontSize: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Load preset</button>}
            </div>

            {cats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {cats.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: c.color + '10', borderRadius: 8, border: `1px solid ${c.color}30` }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', flex: 1 }}>{c.name}</span>
                    <input type="number" value={c.weight} onChange={(e) => updateCatWeight(c.id, e.target.value)} min={0} max={100}
                      style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, fontSize: 13 }} />
                    <span style={{ fontSize: 12, color: '#64748b' }}>%</span>
                    <button type="button" onClick={() => removeCat(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#dc2626', padding: '0 4px' }}>×</button>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: totalWeight === 100 ? '#15803d' : '#dc2626' }}>Total: {totalWeight}%</span>
                  {totalWeight !== 100 && <span style={{ color: '#dc2626', fontSize: 11 }}>(should equal 100%)</span>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Category name..."
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, flex: 1 }} />
              <input type="number" value={newCatWeight} onChange={(e) => setNewCatWeight(e.target.value)} min={0} max={100}
                style={{ width: 60, padding: '8px', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center', fontSize: 13 }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>%</span>
              <button type="button" onClick={handleAddCat} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add</button>
            </div>

            <button type="button" onClick={handleSave} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Save Categories
            </button>
          </div>
        )}

        {tab === 'scheme' && (
          <div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Configure minimum percentage for each letter grade:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {sch.map((tier, i) => (
                <div key={tier.letter} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: tier.color + '10', borderRadius: 8, border: `1px solid ${tier.color}30` }}>
                  <span style={{ fontWeight: 800, fontSize: 18, color: tier.color, width: 30, textAlign: 'center' }}>{tier.letter}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Min:</span>
                  <input type="number" value={tier.min} onChange={(e) => handleUpdateSchemeMin(i, e.target.value)} min={0} max={100}
                    style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, fontSize: 13 }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>%</span>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onSaveScheme(sch)} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Save Scheme
            </button>
          </div>
        )}

        {tab === 'assign' && (
          <div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Assign each assignment to a grade category:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {assignments.map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.name}</span>
                  <select value={a.category || ''} onChange={(e) => onAssignCategory(a.id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}>
                    <option value="">Uncategorized</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.name} ({c.weight}%)</option>)}
                  </select>
                </div>
              ))}
              {assignments.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No assignments yet.</div>}
            </div>
          </div>
        )}

        {tab === 'schemeType' && (
          <div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Choose how grades are displayed:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {[
                { value: 'letter', label: 'Letter Grade', desc: 'A, B, C, D, F' },
                { value: 'gpa', label: 'GPA (4.0 Scale)', desc: '4.0, 3.0, 2.0, 1.0, 0.0' },
                { value: 'passfail', label: 'Pass / Fail', desc: `Pass ≥ ${passFailThreshold}%, Fail < ${passFailThreshold}%` },
                { value: 'percentage', label: 'Percentage', desc: 'Shows 85%, 92%, etc.' },
                { value: 'points', label: 'Points', desc: 'Shows raw score number' },
              ].map(opt => (
                <label key={opt.value} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  background: schemeType === opt.value ? '#eff6ff' : '#f8fafc',
                  border: schemeType === opt.value ? '2px solid #2563eb' : '1px solid #e2e8f0',
                }}>
                  <input type="radio" name="schemeType" value={opt.value} checked={schemeType === opt.value}
                    onChange={() => onSaveSchemeType(opt.value)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {schemeType === 'passfail' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Pass threshold:</label>
                <input type="number" min={0} max={100} value={passFailThreshold}
                  onChange={(e) => onSavePassFailThreshold(e.target.value)}
                  style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', textAlign: 'center', fontWeight: 700, fontSize: 13 }} />
                <span style={{ fontSize: 12, color: '#92400e' }}>%</span>
              </div>
            )}
          </div>
        )}

        {tab === 'group' && (
          <div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Assign group assignments: one submission counts for all group members.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {assignments.map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.name}</span>
                  <select value={a.groupId || ''} onChange={(e) => onAssignGroup?.(a.id, e.target.value || null)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}>
                    <option value="">Individual</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name} ({(g.members || g.memberIds || []).length} members)</option>
                    ))}
                  </select>
                </div>
              ))}
              {assignments.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No assignments yet.</div>}
            </div>
          </div>
        )}

        {tab === 'postPolicy' && (
          <div>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>Set post policy per assignment. "Manual" requires clicking "Post Grades" before students see scores.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {assignments.map((a) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{a.name}</span>
                  <select value={a.postPolicy || 'auto'}
                    onChange={(e) => {
                      const all = getAssignments().map(x => x.id === a.id ? { ...x, postPolicy: e.target.value } : x);
                      saveAssignments(all);
                      onRefresh();
                    }}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600 }}>
                    <option value="auto">Auto (visible immediately)</option>
                    <option value="manual">Manual (must post)</option>
                    <option value="date">Post on date</option>
                  </select>
                  <span style={{ fontSize: 11, fontWeight: 700, color: a.gradesPosted ? '#15803d' : '#94a3b8' }}>
                    {a.gradesPosted ? '✓ Posted' : '○ Not posted'}
                  </span>
                </div>
              ))}
              {assignments.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No assignments yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Gradebook;
