import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { showAppToast } from '../utils/appToast';
import {
  getClasses, getGrades, getAssignments, saveGrades, saveAssignments, saveClasses,
  getClassResults, getStudentAssignmentScore, generateClassCode,
  getClassDiscussions, getClassExitTicketActivities, getResponsesForExitTicket,
  scanClassForCertificates, getSections,
} from '../utils/storage';
import { TEKS_STANDARDS } from '../data/teks';
import { GAMES_CATALOG, getGamesByTeks } from '../data/games';
import { getDomainsForGradeId } from '../data/texesExams';
import TeacherLayout from '../components/TeacherLayout';
import Breadcrumb from '../components/Breadcrumb';
import SkeletonLoader from '../components/SkeletonLoader';
import AssessmentBuilder from '../components/AssessmentBuilder';
import AssessmentGrader from '../components/AssessmentGrader';
import { getAssessments as getAssessmentList, publishAssessment, deleteAssessment as removeAssessment } from '../utils/assessmentEngine';
import ClassFeed from '../components/ClassFeed';
import ContentModules from '../components/ContentModules';
import ClassChat from '../components/ClassChat';
import ItemAnalysis from '../components/ItemAnalysis';
import VideoMeet from '../components/VideoMeet';
import CollaborativeSpaces from '../components/CollaborativeSpaces';
import ActionableAnalytics from '../components/ActionableAnalytics';
import TeacherAdmin from '../components/TeacherAdmin';
import AgenticWorkflow from '../components/AgenticWorkflow';
import SectionManager from '../components/SectionManager';
import MasteryPathBuilder from '../components/MasteryPathBuilder';
import AttendanceManager from '../components/AttendanceManager';

const ClassView = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('overview'); // overview | gradebook | progress | games
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentDue, setNewAssignmentDue] = useState('');
  const [newAssignmentLatePolicy, setNewAssignmentLatePolicy] = useState('accept');
  const [newAssignmentGracePeriod, setNewAssignmentGracePeriod] = useState(0);
  const [newAssignmentAssignedTo, setNewAssignmentAssignedTo] = useState('all');
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [expandedStandard, setExpandedStandard] = useState(null); // which TEKS chip is expanded (overview tab)
  const [selectedStandards, setSelectedStandards] = useState(new Set()); // multi-select for Assign Games tab
  const [assignedMsg, setAssignedMsg] = useState(''); // flash message for assigned games
  const [autoGradePrefs, setAutoGradePrefs] = useState({}); // { [gameId]: boolean } — per-game auto-grade preference for assigning
  const [toast, setToast] = useState(null); // { message, detail, type } — global success toast
  const toastTimerRef = React.useRef(null);
  const [earlyWarning, setEarlyWarning] = useState(null);
  const [earlyWarningLoading, setEarlyWarningLoading] = useState(false);
  const [misconceptionResult, setMisconceptionResult] = useState(null);
  const [misconceptionStudent, setMisconceptionStudent] = useState(null);
  const [misconceptionLoading, setMisconceptionLoading] = useState(false);
  const [homePageMenuOpen, setHomePageMenuOpen] = useState(false);
  const homePageMenuRef = React.useRef(null);
  const username = localStorage.getItem('quantegy-teacher-user');
  const { t } = useLanguage();

  const refresh = () => {
    const classes = getClasses();
    let found = classes.find((c) => c.id === classId);
    // Backfill joinCode for classes created before this feature
    if (found && !found.joinCode) {
      let code;
      do { code = generateClassCode(); } while (classes.some((c) => c.joinCode === code));
      found.joinCode = code;
      saveClasses(classes);
    }
    setCls(found || null);
    setGrades(getGrades());
    setAssignments(getAssignments());
  };

  useEffect(() => {
    refresh();
    // Auto-check certificate eligibility for all students when teacher views class
    try { scanClassForCertificates(classId); } catch (err) { console.warn('Certificate scan failed:', err); }
  }, [classId]);

  // Apply class "home page" (default tab) when opening this class
  useEffect(() => {
    if (!cls || cls.id !== classId) return;
    const validTab = cls.defaultTab && ['overview', 'feed', 'spaces', 'modules', 'chat', 'meet', 'gradebook', 'progress', 'games', 'sections', 'attendance', 'mastery-paths', 'admin'].includes(cls.defaultTab);
    setTab(validTab ? cls.defaultTab : 'overview');
  }, [classId, cls?.id, cls?.defaultTab]);

  if (!cls) {
    return (
      <TeacherLayout>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <h2>Class not found</h2>
          <Link to="/teacher-dashboard" style={{ color: '#2563eb' }}>Back to Dashboard</Link>
        </div>
      </TeacherLayout>
    );
  }

  const students = cls.students || [];
  const classAssignments = assignments.filter((a) => a.classId === classId);
  const classGrades = grades.filter((g) =>
    classAssignments.some((a) => a.id === g.assignmentId)
  );
  const classType = cls.classType || 'staar';
  const gradeId = cls.gradeId || 'grade3';
  const teksStandards = cls.teksStandards || [];
  const texesDomains = cls.texesDomains || [];
  const allStandards = classType === 'texes' ? [] : (TEKS_STANDARDS[gradeId] || []);
  const texesDomainsList = getDomainsForGradeId(gradeId);
  const gameGradeId = classType === 'texes' ? (gradeId === 'texes' ? 'algebra' : gradeId) : gradeId;

  const getGrade = (studentId, assignmentId) => {
    // Check manual grade first
    const grade = grades.find((g) => g.studentId === studentId && g.assignmentId === assignmentId);
    if (grade?.score !== undefined && grade?.score !== null) return grade.score;
    // Check auto-grade from game results (only if assignment has autoGrade enabled)
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment?.autoGrade === false) return ''; // auto-grade disabled
    const gameResult = getStudentAssignmentScore(studentId, assignmentId);
    if (gameResult?.score !== undefined) return gameResult.score;
    return '';
  };

  const isAutoGrade = (studentId, assignmentId) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment?.autoGrade === false) return false; // auto-grade disabled
    const manual = grades.find((g) => g.studentId === studentId && g.assignmentId === assignmentId);
    if (manual?.score !== undefined && manual?.score !== null) return false;
    const gameResult = getStudentAssignmentScore(studentId, assignmentId);
    return gameResult?.score !== undefined;
  };

  /** Build a game URL that includes student/assignment context for auto-grading */
  const buildStudentGameLink = (assignment, student) => {
    if (!assignment.gamePath) return null;
    const sep = assignment.gamePath.includes('?') ? '&' : '?';
    return `${assignment.gamePath}${sep}sid=${student.id}&aid=${assignment.id}&cid=${classId}`;
  };

  const updateGrade = (studentId, assignmentId, score) => {
    const numScore = score === '' ? null : parseInt(score, 10);
    const valid = numScore !== null && !isNaN(numScore) && numScore >= 0 && numScore <= 100;
    const existing = grades.findIndex((g) => g.studentId === studentId && g.assignmentId === assignmentId);
    let newGrades;
    if (!valid && score === '') {
      newGrades = existing >= 0 ? grades.filter((_, i) => i !== existing) : grades;
    } else if (valid) {
      const entry = { studentId, assignmentId, score: numScore };
      newGrades = existing >= 0 ? grades.map((g, i) => (i === existing ? entry : g)) : [...grades, entry];
    } else return;
    setGrades(newGrades);
    saveGrades(newGrades);
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (newAssignmentName) {
      const all = getAssignments();
      const newA = {
        id: `a-${Date.now()}`, name: newAssignmentName, classId,
        dueDate: newAssignmentDue || null,
        latePolicy: newAssignmentLatePolicy,
        gracePeriodMinutes: newAssignmentGracePeriod || 0,
        assignedTo: newAssignmentAssignedTo === 'all' ? 'all' : [newAssignmentAssignedTo],
        postPolicy: 'auto',
        gradesPosted: true,
        createdAt: new Date().toISOString(),
      };
      saveAssignments([...all, newA]);
      setAssignments([...all, newA]);
      setNewAssignmentName('');
      setNewAssignmentDue('');
      setNewAssignmentLatePolicy('accept');
      setNewAssignmentGracePeriod(0);
      setNewAssignmentAssignedTo('all');
      setShowAddAssignment(false);
    }
  };

  const showToast = (message, detail, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, detail, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const handleAssignGame = (game, teksIdOrArray, autoGradeEnabled = true) => {
    const all = getAssignments();
    const teksArr = Array.isArray(teksIdOrArray) ? teksIdOrArray
      : teksIdOrArray ? [teksIdOrArray]
      : (game.teksByGrade?.[gameGradeId] || []);
    const labelItems = teksArr.map((id) => (classType === 'texes' ? (texesDomainsList.find((d) => d.id === id)?.name || id) : id));
    const teksLabel = labelItems.length > 0 && labelItems.length <= 3
      ? labelItems.join(', ')
      : labelItems.length > 3 ? `${labelItems.slice(0, 3).join(', ')} +${labelItems.length - 3}` : '';
    const name = teksArr.length > 0 ? `${game.name} (${teksLabel})` : game.name;
    const focusKey = teksArr.length > 0 ? teksArr.sort().join(',') : null;
    const exists = all.some((a) => a.classId === classId && a.gameId === game.id && a.focusTeks === focusKey);
    if (exists) {
      showToast(
        `${name} is already assigned`,
        `This game was previously assigned to ${cls.name}.`,
        'info'
      );
      return;
    }
    const gamePath = teksArr.length > 0
      ? `${game.path}?teks=${teksArr.join(',')}&label=${encodeURIComponent(teksLabel)}`
      : game.path;
    const newA = {
      id: `a-${Date.now()}`,
      name,
      classId,
      gameId: game.id,
      gamePath,
      teks: teksArr,
      focusTeks: focusKey,
      autoGrade: autoGradeEnabled,
      assignedTo: 'all',
    };
    saveAssignments([...all, newA]);
    setAssignments([...all, newA]);

    const studentCount = students.length;
    const teksToastLabel = labelItems.length > 0 ? labelItems.slice(0, 3).join(', ') + (labelItems.length > 3 ? ` +${labelItems.length - 3} more` : '') : '';
    const gradeMode = autoGradeEnabled ? 'Auto-graded' : 'Manual grading';
    showToast(
      `${name} assigned!`,
      `Assigned to ${cls.name}${studentCount > 0 ? ` \u00B7 ${studentCount} student${studentCount !== 1 ? 's' : ''} can now play` : ''}${teksToastLabel ? ` \u00B7 ${classType === 'texes' ? 'Domains' : 'TEKS'}: ${teksToastLabel}` : ''} \u00B7 ${gradeMode}`,
      'success'
    );
  };

  /** Toggle auto-grade on/off for an existing assignment */
  const toggleAutoGrade = (assignmentId) => {
    const all = getAssignments();
    const updated = all.map((a) => {
      if (a.id === assignmentId) {
        const newAutoGrade = a.autoGrade === false ? true : false;
        return { ...a, autoGrade: newAutoGrade };
      }
      return a;
    });
    saveAssignments(updated);
    setAssignments(updated);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    const classes = getClasses();
    const updatedClasses = classes.map((c) => {
      if (c.id !== classId) return c;
      return {
        ...c,
        students: [...(c.students || []), { id: `s-${Date.now()}`, name: newStudentName.trim() }],
      };
    });
    saveClasses(updatedClasses);
    setNewStudentName('');
    refresh();
  };

  const studentAvg = (studentId) => {
    const scores = classAssignments
      .map((a) => getGrade(studentId, a.id))
      .filter((g) => g !== '')
      .map(Number);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
  };

  const CLASS_TABS = [
    { id: 'overview', labelKey: 'overview', icon: '📋' },
    { id: 'feed', labelKey: 'feedDiscussions', icon: '📜' },
    { id: 'spaces', labelKey: 'collaborativeSpaces', icon: '👥' },
    { id: 'modules', labelKey: 'content', icon: '📚' },
    { id: 'chat', labelKey: 'chat', icon: '💬' },
    { id: 'meet', labelKey: 'videoMeet', icon: '📹' },
    { id: 'gradebook', labelKey: 'gradebook', icon: '📝' },
    { id: 'progress', labelKey: 'progress', icon: '📈' },
    { id: 'games', labelKey: 'assignGames', icon: '🎮' },
    { id: 'sections', labelKey: 'sections', icon: '📂' },
    { id: 'attendance', labelKey: 'attendance', icon: '📋' },
    { id: 'mastery-paths', labelKey: 'masteryPaths', icon: '🛠' },
    { id: 'admin', labelKey: 'adminTools', icon: '⚙' },
  ];

  const setClassHomePage = (tabId) => {
    const classes = getClasses();
    const idx = classes.findIndex((c) => c.id === classId);
    if (idx < 0) return;
    classes[idx] = { ...classes[idx], defaultTab: tabId };
    saveClasses(classes);
    setCls(classes[idx]);
    setTab(tabId);
    const label = CLASS_TABS.find((t) => t.id === tabId);
    showToast('Homepage updated', `When you open this class, you'll see "${label ? t(label.labelKey) : tabId}" first.`, 'success');
  };

  // Always show games — filter by class TEKS first, but fall back to ALL grade games if none match
  const teksMatched = classType === 'staar' && teksStandards.length > 0 ? getGamesByTeks(teksStandards) : [];
  const gradeGames = GAMES_CATALOG.filter((g) => g.grades.includes(gameGradeId));
  const alignedGames = teksMatched.length > 0 ? teksMatched : gradeGames;

  return (
    <TeacherLayout>
      <style>{`
        @media (max-width: 900px) {
          .class-view-layout { flex-direction: column !important; }
          .class-view-sidebar { width: 100% !important; min-width: 0 !important; flex-direction: row !important; flex-wrap: wrap !important; margin-right: 0 !important; margin-bottom: 16px !important; }
          .class-view-sidebar button { flex: 1 1 auto !important; min-width: 100px !important; }
        }
      `}</style>
      <Breadcrumb items={[
        { label: t('dashboard'), to: '/teacher-dashboard' },
        { label: cls.name },
      ]} />

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)',
        color: 'white', padding: '20px 24px', borderRadius: 12, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 26 }}>{cls.name}</h1>
            {cls.description && <p style={{ margin: '0 0 12px', opacity: 0.8, fontSize: 14 }}>{cls.description}</p>}
          </div>
          {cls.joinCode && (
            <div style={{
              background: 'rgba(255,255,255,0.15)', border: '2px dashed rgba(255,255,255,0.4)',
              borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 130,
            }}>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: 0.5, marginBottom: 4 }}>CLASS CODE</div>
              <div style={{
                fontSize: 28, fontWeight: 900, letterSpacing: 6, fontFamily: 'monospace',
                color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.3)',
              }}>{cls.joinCode}</div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
                <button type="button" onClick={() => {
                  navigator.clipboard.writeText(cls.joinCode);
                  showAppToast('Class code copied!', { type: 'success' });
                }} style={{
                  padding: '4px 12px', background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
                  color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>Copy Code</button>
                <button type="button" onClick={() => {
                  const joinUrl = `${window.location.origin}/student?code=${cls.joinCode}`;
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`;
                  const win = window.open('', '_blank');
                  if (!win) { showAppToast('Please allow popups.', { type: 'warning' }); return; }
                  win.document.write(`<!DOCTYPE html><html><head><title>Join ${cls.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;text-align:center}
.card{background:#fff;border-radius:20px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.1);max-width:420px}
h1{font-size:20px;color:#0f172a;margin-bottom:4px}
.code{font-size:48px;font-weight:900;letter-spacing:8px;font-family:monospace;color:#2563eb;margin:16px 0}
.url{font-size:12px;color:#64748b;word-break:break-all;margin-top:12px}
@media print{body{background:#fff}.card{box-shadow:none}}</style></head><body>
<div class="card"><h1>Join ${cls.name}</h1><p style="color:#64748b;font-size:14px">Scan the QR code or enter the class code</p>
<div class="code">${cls.joinCode}</div>
<img src="${qrUrl}" alt="QR Code" style="width:200px;height:200px;border-radius:12px;border:2px solid #e2e8f0"/>
<div class="url">${joinUrl}</div></div>
<script>setTimeout(()=>{window.print()},600)<\/script></body></html>`);
                  win.document.close();
                }} style={{
                  padding: '4px 12px', background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6,
                  color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}>QR Code</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 13, flexWrap: 'wrap', marginTop: 8 }}>
          <span style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
          }}>{cls.gradeLevel}</span>
          <button type="button" onClick={() => setTab('overview')} style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            👥 {students.length} student{students.length !== 1 ? 's' : ''}
          </button>
          <button type="button" onClick={() => setTab('gradebook')} style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            📝 {classAssignments.length} assignment{classAssignments.length !== 1 ? 's' : ''}
          </button>
          <button type="button" onClick={() => setTab('games')} style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            🎮 {alignedGames.length} game{alignedGames.length !== 1 ? 's' : ''}
          </button>
          <button type="button" onClick={() => setTab('progress')} style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            📊 {classType === 'texes' ? texesDomains.length + ' TExES domain' + (texesDomains.length !== 1 ? 's' : '') : teksStandards.length + ' TEKS standard' + (teksStandards.length !== 1 ? 's' : '')}
          </button>
          <button type="button" onClick={() => setTab('assessments')} style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            📝 Assessments
          </button>
          <button type="button" onClick={() => setTab('feed')} style={{
            padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.12)',
            border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            💬 Feed
          </button>
          <div style={{ position: 'relative', marginLeft: 4 }} ref={homePageMenuRef}>
            <button
              type="button"
              onClick={() => setHomePageMenuOpen((o) => !o)}
              aria-label="Choose homepage"
              aria-expanded={homePageMenuOpen}
              style={{
                padding: '4px 12px', borderRadius: 6, background: homePageMenuOpen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer', fontSize: 13,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={(e) => { if (!homePageMenuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
              onMouseLeave={(e) => { if (!homePageMenuOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            >
              🏠 Choose homepage
            </button>
            {homePageMenuOpen && (
              <>
                <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 9999 }} onClick={() => setHomePageMenuOpen(false)} aria-hidden="true" />
                <div
                  role="menu"
                  aria-label="Choose course homepage"
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 10000,
                    minWidth: 200, padding: 6, background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  }}
                >
                  <div style={{ padding: '6px 10px 8px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Open this class to…
                  </div>
                  {CLASS_TABS.map((tabItem) => (
                    <button
                      key={tabItem.id}
                      type="button"
                      role="menuitem"
                      onClick={() => { setClassHomePage(tabItem.id); setHomePageMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px 12px', border: 'none', borderRadius: 6, background: 'none',
                        fontSize: 14, color: cls.defaultTab === tabItem.id ? '#1d4ed8' : '#334155',
                        fontWeight: cls.defaultTab === tabItem.id ? 700 : 500,
                        cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span style={{ fontSize: 15 }}>{tabItem.icon}</span>
                      {t(tabItem.labelKey)}
                      {cls.defaultTab === tabItem.id && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#16a34a' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="class-view-layout" style={{ display: 'flex', gap: 0, alignItems: 'flex-start', marginTop: 20 }}>
        {/* Class nav sidebar */}
        <nav className="class-view-sidebar" aria-label="Class navigation" role="tablist" aria-orientation="vertical" style={{
          width: 200, minWidth: 200, flexShrink: 0,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '8px 0', marginRight: 24, display: 'flex', flexDirection: 'column',
        }}>
          {CLASS_TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              role="tab"
              id={`cv-tab-${tabItem.id}`}
              aria-selected={tab === tabItem.id}
              aria-controls={`cv-panel-${tabItem.id}`}
              tabIndex={tab === tabItem.id ? 0 : -1}
              onClick={() => setTab(tabItem.id)}
              onKeyDown={(e) => {
                const idx = CLASS_TABS.findIndex((t2) => t2.id === tabItem.id);
                if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  const next = CLASS_TABS[(idx + 1) % CLASS_TABS.length];
                  setTab(next.id); document.getElementById(`cv-tab-${next.id}`)?.focus();
                } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const prev = CLASS_TABS[(idx - 1 + CLASS_TABS.length) % CLASS_TABS.length];
                  setTab(prev.id); document.getElementById(`cv-tab-${prev.id}`)?.focus();
                } else if (e.key === 'Home') {
                  e.preventDefault(); setTab(CLASS_TABS[0].id); document.getElementById(`cv-tab-${CLASS_TABS[0].id}`)?.focus();
                } else if (e.key === 'End') {
                  e.preventDefault(); setTab(CLASS_TABS[CLASS_TABS.length - 1].id); document.getElementById(`cv-tab-${CLASS_TABS[CLASS_TABS.length - 1].id}`)?.focus();
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', margin: '0 6px', border: 'none', borderRadius: 8,
                background: tab === tabItem.id ? '#eff6ff' : 'transparent',
                color: tab === tabItem.id ? '#1d4ed8' : '#475569',
                fontSize: 14, fontWeight: tab === tabItem.id ? 600 : 500,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (tab !== tabItem.id) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={(e) => { if (tab !== tabItem.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 15 }} aria-hidden="true">{tabItem.icon}</span>
              <span>{t(tabItem.labelKey)}</span>
            </button>
          ))}
        </nav>

        {/* Main content area */}
        <div role="tabpanel" id={`cv-panel-${tab}`} aria-labelledby={`cv-tab-${tab}`} style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
      {/* â”€â”€ Global Toast Notification â”€â”€ */}
      {toast && (
        <div
          style={{
            padding: '14px 20px',
            marginBottom: 20,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            animation: 'fadeInSlide 0.3s ease',
            background: toast.type === 'success' ? '#ecfdf5' : toast.type === 'info' ? '#eff6ff' : '#fefce8',
            border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : toast.type === 'info' ? '#bfdbfe' : '#fde68a'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <span style={{ fontSize: 22, flexShrink: 0, marginTop: -1 }}>
            {toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '\u26A0\uFE0F'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: 15,
              color: toast.type === 'success' ? '#065f46' : toast.type === 'info' ? '#1e40af' : '#854d0e',
            }}>
              {toast.message}
            </div>
            {toast.detail && (
              <div style={{
                fontSize: 13, marginTop: 2,
                color: toast.type === 'success' ? '#047857' : toast.type === 'info' ? '#2563eb' : '#a16207',
              }}>
                {toast.detail}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, color: '#94a3b8', padding: '0 4px', lineHeight: 1,
              flexShrink: 0,
            }}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      )}

      {/* â”€â”€ Assessments â”€â”€ */}
      {tab === 'assessments' && (
        <AssessmentsPanel classId={classId} />
      )}

      {/* â”€â”€ Feed & Discussions â”€â”€ */}
      {tab === 'feed' && (
        <ClassFeed classId={classId} cls={cls} isTeacher={true} />
      )}

      {/* â”€â”€ Collaborative Spaces â”€â”€ */}
      {tab === 'spaces' && (
        <CollaborativeSpaces classId={classId} cls={cls} isTeacher={true} />
      )}

      {/* â”€â”€ Content Modules â”€â”€ */}
      {tab === 'modules' && (
        <ContentModules classId={classId} isTeacher={true} />
      )}

      {/* â”€â”€ Chat â”€â”€ */}
      {tab === 'chat' && (
        <ClassChat classId={classId} isTeacher={true} userId="teacher" userName={username || 'Teacher'} students={students} />
      )}

      {/* â”€â”€ Video Meet â”€â”€ */}
      {tab === 'meet' && (
        <VideoMeet classId={classId} userName={username || 'Teacher'} isTeacher={true} />
      )}

      {/* â”€â”€ Overview â”€â”€ */}
      {tab === 'overview' && (
        <div style={{ maxWidth: 560 }}>
          {/* AI Early Warning — predictive risk */}
          {students.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#64748b' }}>⚠️ Early Warning</h3>
                <button
                  type="button"
                  onClick={async () => {
                    setEarlyWarningLoading(true);
                    setEarlyWarning(null);
                    try {
                      const studentData = students.map((s) => {
                        const avg = studentAvg(s.id);
                        const subCount = classAssignments.filter((a) => getGrade(s.id, a.id) !== '').length;
                        return {
                          name: s.name,
                          avgGrade: avg,
                          assignmentsCompleted: subCount,
                          totalAssignments: classAssignments.length,
                          recentTrend: avg !== null ? (avg >= 80 ? 'up' : avg < 60 ? 'down' : 'stable') : 'unknown',
                        };
                      });
                      const res = await fetch('/api/early-warning', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ students: studentData, gradeLevel: gradeId }),
                      });
                      const data = await res.json();
                      if (data.success) setEarlyWarning(data.content);
                      else setEarlyWarning('Error: ' + (data.error || 'Unknown'));
                    } catch (e) {
                      setEarlyWarning('Error: ' + e.message);
                    } finally {
                      setEarlyWarningLoading(false);
                    }
                  }}
                  disabled={earlyWarningLoading}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid #f59e0b',
                    background: earlyWarningLoading ? '#f8fafc' : '#fffbeb',
                    color: '#b45309', fontWeight: 700, fontSize: 12, cursor: earlyWarningLoading ? 'default' : 'pointer',
                  }}
                >
                  {earlyWarningLoading ? 'Analyzing...' : '\uD83E\uDD16 AI Risk Analysis'}
                </button>
              </div>
              {earlyWarning && (
                <div style={{
                  padding: 16, background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 10, fontSize: 13, color: '#334155',
                  whiteSpace: 'pre-wrap', lineHeight: 1.6,
                }}>
                  {earlyWarning}
                </div>
              )}
            </section>
          )}

          {/* Students — minimal list */}
          <section style={{ marginBottom: 40 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#64748b' }}>{t('students')}</h3>
            {students.length === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>{t('noStudentsYet')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {students.map((s, i) => {
                  const avg = studentAvg(s.id);
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: i < students.length - 1 ? '1px solid #f1f5f9' : 'none',
                        fontSize: 14,
                        gap: 8,
                      }}
                    >
                      <span style={{ color: '#0f172a', fontWeight: 500, flex: 1 }}>{s.name}</span>
                      {avg !== null && (
                        <span style={{
                          fontWeight: 600,
                          fontSize: 13,
                          color: avg >= 80 ? '#059669' : avg >= 60 ? '#d97706' : '#dc2626',
                        }}>
                          {avg}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={async () => {
                          const discussions = getClassDiscussions(classId) || [];
                          const exitActivities = getClassExitTicketActivities(classId) || [];
                          const responses = [];
                          discussions.forEach((d) => {
                            (d.replies || []).filter(r => r.authorId === s.id).forEach(r => responses.push(r.body || ''));
                          });
                          exitActivities.forEach((act) => {
                            getResponsesForExitTicket(act.id)
                              .filter(r => r.studentId === s.id)
                              .forEach(r => responses.push(r.response || ''));
                          });
                          if (responses.filter(Boolean).length === 0) {
                            setMisconceptionResult('No written responses yet. Have this student participate in discussions or exit tickets first.');
                            setMisconceptionStudent(s.id);
                            return;
                          }
                          setMisconceptionLoading(true);
                          setMisconceptionResult(null);
                          setMisconceptionStudent(s.id);
                          try {
                            const res = await fetch('/api/detect-misconceptions', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                gradeLevel: gradeId,
                                teksStandard: classType === 'texes' ? (texesDomains?.[0] || null) : (teksStandards?.[0] || null),
                                studentResponses: responses.filter(Boolean),
                              }),
                            });
                            const data = await res.json();
                            setMisconceptionResult(data.success ? data.content : (data.error || 'Error'));
                          } catch (e) {
                            setMisconceptionResult('Error: ' + e.message);
                          } finally {
                            setMisconceptionLoading(false);
                          }
                        }}
                        disabled={misconceptionLoading}
                        title="AI misconception detection"
                        style={{
                          padding: '4px 10px', borderRadius: 6, border: '1px solid #7c3aed',
                          background: misconceptionStudent === s.id && misconceptionResult ? '#faf5ff' : '#fff',
                          color: '#7c3aed', fontWeight: 600, fontSize: 11, cursor: misconceptionLoading ? 'default' : 'pointer',
                        }}
                      >
                        {misconceptionLoading && misconceptionStudent === s.id ? '…' : '🤖'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {misconceptionResult && (
              <div style={{
                marginTop: 16, padding: 16, background: '#faf5ff', border: '1px solid #e9d5ff',
                borderRadius: 10, fontSize: 13, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.6,
              }}>
                <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>🤖 Misconception Analysis</div>
                {misconceptionResult}
              </div>
            )}
            <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input
                type="text"
                id="classview-add-student-name"
                aria-label={t('addStudent') || 'Student name'}
                placeholder={t('addStudent')}
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  fontSize: 14,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 18px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {t('add')}
              </button>
            </form>
          </section>

          {/* TAs — manage teaching assistants */}
          <TASection cls={cls} classId={classId} onRefresh={refresh} />

          {/* Standards — collapsible, minimal */}
          {((classType === 'texes' && texesDomains.length > 0) || (classType === 'staar' && teksStandards.length > 0)) && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#64748b' }}>{classType === 'texes' ? 'Focus Domains' : t('focusStandards')}</h3>
              <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94a3b8' }}>{t('clickToAssignGames')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(classType === 'texes' ? texesDomains : teksStandards).map((t) => {
                  const std = classType === 'texes' ? texesDomainsList.find((d) => d.id === t) : allStandards.find((s) => s.id === t);
                  const isExpanded = expandedStandard === t;
                  const matchingGames = classType === 'texes'
                    ? (texesDomainsList.find((d) => d.id === t)?.games || []).map((gid) => GAMES_CATALOG.find((g) => g.id === gid)).filter(Boolean)
                    : getGamesByTeks([t]).filter((g) => g.grades.includes(gameGradeId));
                  const alreadyAssigned = classAssignments.filter((a) => a.focusTeks === t || (a.focusTeks || '').split(',').includes(t)).map((a) => a.gameId);
                  return (
                    <div key={t} style={{ marginBottom: 4 }}>
                      <button
                        type="button"
                        onClick={() => setExpandedStandard(isExpanded ? null : t)}
                        title={std?.description || std?.desc || t}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: isExpanded ? '#eff6ff' : 'transparent',
                          color: isExpanded ? '#1d4ed8' : '#334155',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 500,
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{std?.name || std?.id || t}</span>
                        {matchingGames.length > 0 && (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>
                            {matchingGames.length} game{matchingGames.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </button>

                      {/* Expanded: games for selected standard/domain */}
                      {isExpanded && (() => {
                        const expStd = classType === 'texes'
                          ? texesDomainsList.find((d) => d.id === expandedStandard)
                          : allStandards.find((s) => s.id === expandedStandard);
                        const expGames = classType === 'texes'
                          ? (texesDomainsList.find((d) => d.id === expandedStandard)?.games || []).map((gid) => GAMES_CATALOG.find((g) => g.id === gid)).filter(Boolean)
                          : getGamesByTeks([expandedStandard]).filter((g) => g.grades.includes(gameGradeId));
                        return (
                          <div style={{ marginTop: 12, paddingLeft: 4 }}>
                            {(expStd?.description || expStd?.desc) && (
                              <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{expStd.description || expStd.desc}</p>
                            )}
                            {expGames.length === 0 ? (
                              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>{t('noGamesForStandard')}</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {expGames.map((game) => {
                          const teksGameKey = `${game.id}-${expandedStandard}`;
                          const isAlreadyAssigned = classAssignments.some(
                            (a) => a.gameId === game.id && (a.focusTeks === expandedStandard || (a.focusTeks || '').split(',').includes(expandedStandard))
                          );
                          const assignedA = classAssignments.find(
                            (a) => a.gameId === game.id && (a.focusTeks === expandedStandard || (a.focusTeks || '').split(',').includes(expandedStandard))
                          );
                          const teksAutoGrade = autoGradePrefs[teksGameKey] !== undefined ? autoGradePrefs[teksGameKey] : true;
                                  return (
                                    <div key={game.id} style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '10px 0',
                                      borderBottom: '1px solid #f1f5f9',
                                      gap: 12,
                                    }}>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 500, fontSize: 14, color: '#0f172a' }}>{game.name}</div>
                                        {game.description && (
                                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{game.description}</div>
                                        )}
                                      </div>
                                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                        <Link to={`${game.path}?teks=${expandedStandard}&label=${encodeURIComponent(expandedStandard)}`} style={{
                                          padding: '6px 12px', background: 'transparent', color: '#2563eb',
                                          border: '1px solid #2563eb', borderRadius: 6, textDecoration: 'none',
                                          fontSize: 12, fontWeight: 500,
                                        }}>{t('preview')}</Link>
                                        {isAlreadyAssigned ? (
                                          <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>{t('assigned')}</span>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleAssignGame(game, expandedStandard, teksAutoGrade)}
                                            style={{
                                              padding: '6px 14px', background: '#2563eb', color: '#fff',
                                              border: 'none', borderRadius: 6, cursor: 'pointer',
                                              fontSize: 12, fontWeight: 500,
                                            }}
                                          >
                                            {t('assign')}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Assignments */}
          <section style={{ marginTop: 40 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#64748b' }}>{t('assignments')} ({classAssignments.length})</h3>
            {classAssignments.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                {t('noAssignmentsYet')}{' '}
                <button type="button" onClick={() => setTab('games')} style={{
                  color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14, textDecoration: 'underline', padding: 0,
                }}>{t('assignGame')}</button>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {classAssignments.filter((a) => a.gamePath).map((a, i, arr) => (
                  <div key={a.id} style={{
                    padding: '12px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ fontWeight: 500, fontSize: 14, color: '#0f172a' }}>{a.name}</span>
                        {a.teks?.length > 0 && (
                          <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>
                            {a.teks.slice(0, 3).join(', ')}{a.teks.length > 3 ? '…' : ''}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Link to={a.gamePath} style={{
                padding: '6px 12px', color: '#2563eb', border: '1px solid #2563eb',
                borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: 'none',
              }}>{t('preview')}</Link>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {students.map((s) => {
                            const link = buildStudentGameLink(a, s);
                            const result = getStudentAssignmentScore(s.id, a.id);
                            const style = {
                              padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                              textDecoration: 'none',
                              background: result ? '#ecfdf5' : 'transparent',
                              color: result ? '#059669' : '#2563eb',
                              border: '1px solid ' + (result ? '#a7f3d0' : '#e2e8f0'),
                            };
                            if (!link) {
                              return (
                                <span key={s.id} style={{ ...style, cursor: 'default', opacity: 0.8 }} title="No game link">
                                  {s.name}{result ? ` ${result.score}%` : ''}
                                </span>
                              );
                            }
                            return (
                              <Link
                                key={s.id}
                                to={link}
                                style={style}
                                title={result ? `Scored ${result.score}%` : `Play link for ${s.name}`}
                              >
                                {s.name}{result ? ` ${result.score}%` : ''}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {classAssignments.filter((a) => !a.gamePath).map((a) => (
                  <div key={a.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 0', borderTop: '1px solid #f1f5f9',
                  }}>
                        <span style={{ fontWeight: 500, fontSize: 14, color: '#0f172a' }}>{a.name}</span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{t('manual')}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* â”€â”€ Gradebook â”€â”€ */}
      {tab === 'gradebook' && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '20px 24px',
        }}>
          {students.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No students in this class yet.</p>
          ) : classAssignments.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>
              No assignments yet. <button type="button" onClick={() => setTab('games')} style={{
                color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: 600, textDecoration: 'underline', padding: 0,
              }}>Assign a game first</button>
            </p>
          ) : (
            <>
            {/* Grading mode info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
              marginBottom: 14, padding: '10px 16px',
              background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe',
              fontSize: 13, color: '#1e40af',
            }}>
              <span style={{ fontWeight: 700 }}>Grading Mode:</span>
              <span>Click the <strong>Auto / Manual</strong> toggle in each column header to choose how that assignment is graded.</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={thStyle}>Student</th>
                    {classAssignments.map((a) => {
                      const isAuto = a.autoGrade !== false;
                      return (
                        <th key={a.id} style={{ ...thStyle, textAlign: 'center', minWidth: 110 }}>
                          <div>{a.name}</div>
                          {a.teks?.length > 0 && (
                            <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 400 }}>
                              {a.teks.slice(0, 2).join(', ')}
                            </div>
                          )}
                          {/* Auto-grade toggle switch */}
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleAutoGrade(a.id); }}
                            title={isAuto ? 'Auto-graded — click to switch to manual grading' : 'Manual grading — click to enable auto-grade'}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              marginTop: 6, padding: '4px 10px',
                              background: isAuto ? '#ecfdf5' : '#f1f5f9',
                              border: `1.5px solid ${isAuto ? '#86efac' : '#cbd5e1'}`,
                              borderRadius: 12, cursor: 'pointer',
                              fontSize: 11, fontWeight: 700,
                              color: isAuto ? '#065f46' : '#64748b',
                              transition: 'all 0.2s',
                              userSelect: 'none',
                            }}
                          >
                            {/* Toggle track */}
                            <span style={{
                              position: 'relative', display: 'inline-block',
                              width: 30, height: 16, borderRadius: 8,
                              background: isAuto ? '#22c55e' : '#cbd5e1',
                              transition: 'background 0.2s',
                              flexShrink: 0,
                            }}>
                              {/* Toggle knob */}
                              <span style={{
                                position: 'absolute', top: 2,
                                left: isAuto ? 16 : 2,
                                width: 12, height: 12, borderRadius: '50%',
                                background: '#fff',
                                transition: 'left 0.2s',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }} />
                            </span>
                            {isAuto ? 'Auto' : 'Manual'}
                          </button>
                        </th>
                      );
                    })}
                    <th style={{ ...thStyle, textAlign: 'center' }}>Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const avg = studentAvg(s.id);
                    return (
                      <tr key={s.id}>
                        <td style={tdStyle}>{s.name}</td>
                        {classAssignments.map((a) => {
                          const auto = isAutoGrade(s.id, a.id);
                          const val = getGrade(s.id, a.id);
                          return (
                            <td key={a.id} style={{ ...tdStyle, textAlign: 'center', padding: '4px 6px', position: 'relative' }}>
                              <input
                                type="number" min="0" max="100"
                                value={val}
                                onChange={(e) => updateGrade(s.id, a.id, e.target.value)}
                                aria-label={`Grade for ${a.name || 'assignment'}${auto ? ' (auto-graded from game)' : ''}`}
                                style={{
                                  width: 52, padding: '6px 4px', textAlign: 'center',
                                  border: auto ? '2px solid #22c55e' : '1px solid #e2e8f0',
                                  borderRadius: 5, fontSize: 14, outline: 'none',
                                  background: auto ? '#f0fdf4' : '#fff',
                                }}
                                title={auto ? 'Auto-graded from game play' : 'Manual entry'}
                              />
                              {auto && (
                                <span style={{
                                  position: 'absolute', top: 2, right: 4,
                                  fontSize: 8, color: '#22c55e', fontWeight: 700,
                                }}>AUTO</span>
                              )}
                            </td>
                          );
                        })}
                        <td style={{
                          ...tdStyle, textAlign: 'center', fontWeight: 700,
                          color: avg >= 80 ? '#22c55e' : avg >= 60 ? '#eab308' : avg ? '#ef4444' : '#94a3b8',
                        }}>
                          {avg !== null ? `${avg}%` : '\u2014'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}

          {/* Legend */}
          <div style={{ marginTop: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid #22c55e', borderRadius: 3, background: '#f0fdf4', marginRight: 4, verticalAlign: 'middle' }}></span> Auto-graded from game play</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 12, border: '1px solid #e2e8f0', borderRadius: 3, background: '#fff', marginRight: 4, verticalAlign: 'middle' }}></span> Manual entry</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>Click the Auto/Manual button in column headers to toggle grading mode</span>
          </div>

          {/* Recent Game Activity */}
          {(() => {
            const recentResults = getClassResults(classId)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 10);
            if (recentResults.length === 0) return null;
            return (
              <div style={{
                marginTop: 20, padding: '18px 22px', background: '#f8fafc',
                borderRadius: 12, border: '1px solid #e2e8f0',
              }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#0f172a' }}>
                  Recent Game Activity
                </h4>
                <div style={{ display: 'grid', gap: 6 }}>
                  {recentResults.map((r) => {
                    const student = students.find((s) => s.id === r.studentId);
                    const game = GAMES_CATALOG.find((g) => g.id === r.gameId);
                    const time = r.timestamp ? new Date(r.timestamp) : null;
                    return (
                      <div key={r.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', background: '#fff', borderRadius: 8,
                        border: '1px solid #f1f5f9', gap: 10, flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontWeight: 700, fontSize: 14, color: '#0f172a',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {student?.name || 'Unknown'}
                          </span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>
                            played {game?.name || r.gameId}
                          </span>
                          {r.teks && (
                            <span style={{
                              padding: '1px 6px', background: '#e8f0fe', color: '#1a5cba',
                              borderRadius: 3, fontSize: 10, fontWeight: 600,
                            }}>{typeof r.teks === 'string' ? r.teks.split(',')[0] : r.teks}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          <span style={{
                            fontWeight: 800, fontSize: 15,
                            color: r.score >= 80 ? '#22c55e' : r.score >= 60 ? '#eab308' : '#ef4444',
                          }}>
                            {r.score}%
                          </span>
                          {time && (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {time.toLocaleDateString()} {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Add manual assignment */}
          <div style={{ marginTop: 16 }}>
            {!showAddAssignment ? (
              <button type="button" onClick={() => setShowAddAssignment(true)} style={{
                padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#475569',
              }}>+ Add Manual Assignment</button>
            ) : (
              <form onSubmit={handleAddAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" id="classview-assignment-name" aria-label="Assignment name" placeholder="Assignment name" value={newAssignmentName}
                    onChange={(e) => setNewAssignmentName(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none' }} autoFocus />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Due: <input type="datetime-local" value={newAssignmentDue} onChange={e => setNewAssignmentDue(e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }} />
                  </label>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Late: <select value={newAssignmentLatePolicy} onChange={e => setNewAssignmentLatePolicy(e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }}>
                      <option value="accept">Accept late</option>
                      <option value="deduct10">-10% per day</option>
                      <option value="deduct20">-20% per day</option>
                      <option value="half">50% max if late</option>
                      <option value="none">No late submissions</option>
                    </select>
                  </label>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Grace (min): <input type="number" min="0" value={newAssignmentGracePeriod} onChange={e => setNewAssignmentGracePeriod(parseInt(e.target.value) || 0)}
                      style={{ width: 60, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, textAlign: 'center' }} />
                  </label>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Assign to: <select value={newAssignmentAssignedTo} onChange={e => setNewAssignmentAssignedTo(e.target.value)}
                      style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }}>
                      <option value="all">All Students</option>
                      {getSections(classId).map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{
                  padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 6, cursor: 'pointer', fontWeight: 600,
                }}>Add</button>
                <button type="button" onClick={() => { setShowAddAssignment(false); setNewAssignmentName(''); }} style={{
                  padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0',
                  borderRadius: 6, cursor: 'pointer',
                }}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* â”€â”€ Progress & Insights â”€â”€ */}
      {tab === 'progress' && (() => {
        const gameResults = getClassResults(classId);
        // Per-student stats
        const studentProgress = students.map((s) => {
          const results = gameResults.filter((r) => r.studentId === s.id);
          const scores = results.map((r) => r.score).filter((v) => v !== undefined);
          const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
          const totalPlayed = results.length;
          const lastPlayed = results.length > 0
            ? new Date(results[results.length - 1].timestamp).toLocaleDateString()
            : null;
          // Performance trend (last 5 vs previous 5)
          let trend = null;
          if (scores.length >= 4) {
            const recent = scores.slice(-Math.ceil(scores.length / 2));
            const earlier = scores.slice(0, Math.floor(scores.length / 2));
            const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
            const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
            trend = recentAvg - earlierAvg;
          }
          return { ...s, avg, totalPlayed, lastPlayed, trend, scores };
        });

        // Class-level stats
        const allScores = gameResults.map((r) => r.score).filter((v) => v !== undefined);
        const classAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;
        const totalSessions = gameResults.length;
        const activeStudents = studentProgress.filter((s) => s.totalPlayed > 0).length;

        // Per-TEKS performance
        const teksPerformance = {};
        gameResults.forEach((r) => {
          const t = r.teks || 'unknown';
          if (!teksPerformance[t]) teksPerformance[t] = { scores: [], count: 0 };
          teksPerformance[t].scores.push(r.score);
          teksPerformance[t].count += 1;
        });

        const getMasteryColor = (pct) => {
          if (pct >= 80) return '#22c55e';
          if (pct >= 60) return '#eab308';
          if (pct >= 40) return '#f97316';
          return '#ef4444';
        };
        const getMasteryLabel = (pct) => {
          if (pct >= 80) return 'Mastered';
          if (pct >= 60) return 'Proficient';
          if (pct >= 40) return 'Developing';
          return 'Struggling';
        };

        return (
          <div>
            {/* Class summary stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12, marginBottom: 24,
            }}>
              {[
                { label: 'Class Average', value: classAvg !== null ? `${classAvg}%` : '--', color: classAvg ? getMasteryColor(classAvg) : '#94a3b8' },
                { label: 'Game Sessions', value: totalSessions, color: '#2563eb' },
                { label: 'Active Students', value: `${activeStudents}/${students.length}`, color: '#7c3aed' },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: '#fff', borderRadius: 10, padding: '16px 14px',
                  border: '1px solid #e2e8f0', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Student progress cards */}
            <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Student Progress</h3>
            {studentProgress.every((s) => s.totalPlayed === 0) ? (
              <div style={{
                padding: '32px 24px', background: '#fff', borderRadius: 12,
                border: '1px solid #e2e8f0', textAlign: 'center',
              }}>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 12px' }}>
                  No game results yet. Students need to play games from their assignments.
                </p>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                  Share the student play links from the Overview tab, or have students join via the Student Portal.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {studentProgress.map((s) => (
                  <div key={s.id} style={{
                    background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                    padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: 16, flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 150 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>{s.name}</div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#64748b' }}>
                        <span>{s.totalPlayed} game{s.totalPlayed !== 1 ? 's' : ''} played</span>
                        {s.lastPlayed && <span>Last: {s.lastPlayed}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {s.avg !== null ? (
                        <>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              fontSize: 24, fontWeight: 800, color: getMasteryColor(s.avg),
                            }}>{s.avg}%</div>
                            <div style={{
                              fontSize: 10, fontWeight: 600, color: getMasteryColor(s.avg),
                            }}>{getMasteryLabel(s.avg)}</div>
                          </div>
                          {s.trend !== null && (
                            <div style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                              background: s.trend > 0 ? '#ecfdf5' : s.trend < -5 ? '#fef2f2' : '#f8fafc',
                              color: s.trend > 0 ? '#22c55e' : s.trend < -5 ? '#ef4444' : '#64748b',
                            }}>
                              {s.trend > 0 ? '+' : ''}{Math.round(s.trend)}% trend
                            </div>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>No data yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TEKS performance breakdown */}
            {Object.keys(teksPerformance).length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Performance by Standard</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {Object.entries(teksPerformance)
                    .map(([teks, data]) => ({
                      teks,
                      avg: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
                      count: data.count,
                    }))
                    .sort((a, b) => a.avg - b.avg)
                    .map(({ teks, avg, count }) => {
                      const std = allStandards.find((s) => s.id === teks);
                      return (
                        <div key={teks} style={{
                          background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0',
                          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                          <span style={{
                            padding: '3px 10px', background: '#e8f0fe', color: '#1a5cba',
                            borderRadius: 5, fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>{teks}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 13, color: '#475569' }}>
                                {std?.description ? (std.description.length > 60 ? std.description.slice(0, 60) + '...' : std.description) : teks}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: getMasteryColor(avg) }}>{avg}%</span>
                            </div>
                            <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${avg}%`, height: '100%', background: getMasteryColor(avg), borderRadius: 3 }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{count} plays</span>
                        </div>
                      );
                    })}
                </div>
                {/* â”€â”€ Enhanced Teacher Insights â”€â”€ */}
                {(() => {
                  const allTeksEntries = Object.entries(teksPerformance).map(([teks, data]) => {
                    const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
                    const std = allStandards.find((s) => s.id === teks);
                    const shortDesc = std?.description ? (std.description.length > 80 ? std.description.slice(0, 80) + '...' : std.description) : '';
                    return { teks, avg, count: data.count, scores: data.scores, description: shortDesc };
                  });
                  const weakStandards = allTeksEntries.filter((s) => s.avg < 60).sort((a, b) => a.avg - b.avg);
                  const strongStandards = allTeksEntries.filter((s) => s.avg >= 80).sort((a, b) => b.avg - a.avg);
                  const middleStandards = allTeksEntries.filter((s) => s.avg >= 60 && s.avg < 80).sort((a, b) => a.avg - b.avg);
                  const strugglingStudents = studentProgress.filter((s) => s.avg !== null && s.avg < 60);
                  const inactiveStudents = studentProgress.filter((s) => s.totalPlayed === 0);
                  const decliningStudents = studentProgress.filter((s) => s.trend !== null && s.trend < -8);
                  const improvingStudents = studentProgress.filter((s) => s.trend !== null && s.trend > 8);
                  const masteryStudents = studentProgress.filter((s) => s.avg !== null && s.avg >= 80 && s.totalPlayed >= 2);
                  const activeCount = studentProgress.filter((s) => s.totalPlayed > 0).length;
                  const engagementPct = students.length > 0 ? Math.round((activeCount / students.length) * 100) : 0;

                  // Per-student weak TEKS for small-group suggestions
                  const studentWeakTeks = {};
                  gameResults.forEach((r) => {
                    if (r.score < 60 && r.teks && r.studentId) {
                      const key = r.teks;
                      if (!studentWeakTeks[key]) studentWeakTeks[key] = new Set();
                      studentWeakTeks[key].add(r.studentId);
                    }
                  });
                  const smallGroups = weakStandards
                    .filter((ws) => studentWeakTeks[ws.teks]?.size > 0)
                    .map((ws) => {
                      const sIds = studentWeakTeks[ws.teks];
                      const names = studentProgress.filter((s) => sIds.has(s.id)).map((s) => s.name);
                      return { teks: ws.teks, avg: ws.avg, description: ws.description, students: names };
                    })
                    .filter((g) => g.students.length > 0)
                    .slice(0, 4);

                  const hasAnyInsight = weakStandards.length > 0 || strongStandards.length > 0 || strugglingStudents.length > 0 || inactiveStudents.length > 0 || improvingStudents.length > 0 || decliningStudents.length > 0;
                  if (!hasAnyInsight && allScores.length === 0) return null;

                  const insightCard = (icon, title, bg, border, titleColor, children) => (
                    <div style={{
                      padding: '16px 18px', background: bg, border: `1.5px solid ${border}`,
                      borderRadius: 12, marginBottom: 12,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>{icon}</span>
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: titleColor }}>{title}</h4>
                      </div>
                      {children}
                    </div>
                  );

                  return (
                    <div style={{ marginTop: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <span style={{ fontSize: 22 }}>\uD83E\uDDE0</span>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Teacher Insights & Action Plan</h3>
                      </div>

                      {/* Class Health Overview */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: 10, marginBottom: 16,
                      }}>
                        <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Engagement</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: engagementPct >= 80 ? '#22c55e' : engagementPct >= 50 ? '#eab308' : '#ef4444' }}>{engagementPct}%</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{activeCount} of {students.length} students active</div>
                        </div>
                        <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Standards Covered</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{allTeksEntries.length}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{strongStandards.length} mastered, {weakStandards.length} need work</div>
                        </div>
                        <div style={{ padding: '14px 16px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Avg. Games/Student</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#7c3aed' }}>
                            {activeCount > 0 ? (totalSessions / activeCount).toFixed(1) : '0'}
                          </div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{totalSessions} total sessions</div>
                        </div>
                      </div>

                      {/* Urgent: Declining students */}
                      {decliningStudents.length > 0 && insightCard('\u26A0\uFE0F', 'Declining Performance — Act Now', '#fef2f2', '#fecaca', '#991b1b',
                        <div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
                            These students&apos; scores are trending downward. Early intervention can prevent further gaps.
                          </p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {decliningStudents.map((s) => (
                              <div key={s.id} style={{
                                padding: '6px 12px', background: '#fff', borderRadius: 8,
                                border: '1px solid #fecaca', fontSize: 12,
                              }}>
                                <strong style={{ color: '#991b1b' }}>{s.name}</strong>
                                <span style={{ color: '#ef4444', marginLeft: 6, fontWeight: 700 }}>{Math.round(s.trend)}% drop</span>
                                <span style={{ color: '#94a3b8', marginLeft: 6 }}>avg {s.avg}%</span>
                              </div>
                            ))}
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b91c1c', fontStyle: 'italic' }}>
                            💡 Try a quick 1-on-1 check-in or pair them with a peer tutor.
                          </p>
                        </div>
                      )}

                      {/* Standards needing attention — with detail */}
                      {weakStandards.length > 0 && insightCard('\uD83D\uDCC8', `${weakStandards.length} Standard${weakStandards.length > 1 ? 's' : ''} Need Targeted Review`, '#fff1f2', '#fecdd3', '#9f1239',
                        <div>
                          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#881337', lineHeight: 1.6 }}>
                            Class average is below 60% on these standards. Students need additional instruction before moving on.
                          </p>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {weakStandards.map((ws) => {
                              const games = getGamesByTeks([ws.teks]).filter((g) => g.grades.includes(gameGradeId));
                              return (
                                <div key={ws.teks} style={{
                                  padding: '10px 14px', background: '#fff', borderRadius: 8,
                                  border: '1px solid #fecdd3',
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <span style={{
                                      padding: '2px 8px', background: '#fee2e2', color: '#991b1b',
                                      borderRadius: 4, fontSize: 11, fontWeight: 800,
                                    }}>{ws.teks}</span>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>{ws.avg}%</span>
                                  </div>
                                  {ws.description && <p style={{ margin: '2px 0 6px', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{ws.description}</p>}
                                  <div style={{ fontSize: 11, color: '#9f1239' }}>
                                    <strong>Suggested:</strong>{' '}
                                    {games.length > 0
                                      ? <>Assign focused practice â†’ {games.map((g) => g.name).join(', ')}</>
                                      : 'Use small-group instruction with manipulatives or whiteboard practice.'}
                                    {' Â· '}{ws.count} attempt{ws.count !== 1 ? 's' : ''} so far
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Almost there — standards close to proficiency */}
                      {middleStandards.length > 0 && insightCard('🟡', `${middleStandards.length} Standard${middleStandards.length > 1 ? 's' : ''} Almost There`, '#fffbeb', '#fde68a', '#92400e',
                        <div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#78350f', lineHeight: 1.6 }}>
                            These are between 60–80%. A little more practice could push them to mastery.
                          </p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {middleStandards.map((ms) => (
                              <span key={ms.teks} style={{
                                padding: '4px 10px', background: '#fff', border: '1px solid #fde68a',
                                borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#92400e',
                              }}>
                                {ms.teks} — {ms.avg}%
                              </span>
                            ))}
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#a16207', fontStyle: 'italic' }}>
                            \uD83D\uDCA1 One or two more focused game sessions could move these to mastery.
                          </p>
                        </div>
                      )}

                      {/* Small-group suggestions */}
                      {smallGroups.length > 0 && insightCard('\uD83D\uDC65', 'Suggested Small Groups', '#eff6ff', '#bfdbfe', '#1e40af',
                        <div>
                          <p style={{ margin: '0 0 10px', fontSize: 13, color: '#1e3a5f', lineHeight: 1.6 }}>
                            Group these students together for targeted re-teaching based on shared skill gaps.
                          </p>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {smallGroups.map((g) => (
                              <div key={g.teks} style={{
                                padding: '10px 14px', background: '#fff', borderRadius: 8,
                                border: '1px solid #bfdbfe',
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{
                                    padding: '2px 8px', background: '#dbeafe', color: '#1e40af',
                                    borderRadius: 4, fontSize: 11, fontWeight: 800,
                                  }}>{g.teks}</span>
                                  <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 700 }}>class avg {g.avg}%</span>
                                </div>
                                {g.description && <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748b' }}>{g.description}</p>}
                                <div style={{ fontSize: 12, color: '#1e3a5f' }}>
                                  <strong>Group:</strong> {g.students.join(', ')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Students needing support */}
                      {strugglingStudents.length > 0 && insightCard('😖', `${strugglingStudents.length} Student${strugglingStudents.length > 1 ? 's' : ''} Need Extra Support`, '#fef2f2', '#fecaca', '#991b1b',
                        <div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#7f1d1d', lineHeight: 1.6 }}>
                            Overall average below 60%. Consider one-on-one intervention, modified assignments, or peer-pairing.
                          </p>
                          <div style={{ display: 'grid', gap: 6 }}>
                            {strugglingStudents.map((s) => {
                              const results = gameResults.filter((r) => r.studentId === s.id && r.teks && r.score < 60);
                              const weakTeksSet = [...new Set(results.map((r) => r.teks))].slice(0, 3);
                              return (
                                <div key={s.id} style={{
                                  padding: '8px 12px', background: '#fff', borderRadius: 8,
                                  border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between',
                                  alignItems: 'center', flexWrap: 'wrap', gap: 6,
                                }}>
                                  <div>
                                    <strong style={{ fontSize: 13, color: '#991b1b' }}>{s.name}</strong>
                                    <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>{s.totalPlayed} game{s.totalPlayed !== 1 ? 's' : ''} Â· avg {s.avg}%</span>
                                  </div>
                                  {weakTeksSet.length > 0 && (
                                    <div style={{ display: 'flex', gap: 4 }}>
                                      {weakTeksSet.map((t) => (
                                        <span key={t} style={{
                                          padding: '2px 6px', background: '#fee2e2', color: '#991b1b',
                                          borderRadius: 4, fontSize: 10, fontWeight: 700,
                                        }}>{t}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#b91c1c', fontStyle: 'italic' }}>
                            \uD83D\uDCA1 Try shorter, more frequent practice sessions focused on their weakest standards.
                          </p>
                        </div>
                      )}

                      {/* Inactive students */}
                      {inactiveStudents.length > 0 && insightCard('😴', `${inactiveStudents.length} Student${inactiveStudents.length > 1 ? 's' : ''} Haven't Started Yet`, '#f8fafc', '#e2e8f0', '#475569',
                        <div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                            These students haven&apos;t played any games. They may need help logging in or a nudge to get started.
                          </p>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {inactiveStudents.map((s) => (
                              <span key={s.id} style={{
                                padding: '4px 12px', background: '#fff', border: '1px solid #e2e8f0',
                                borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#64748b',
                              }}>
                                {s.name}
                              </span>
                            ))}
                          </div>
                          <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                            \uD83D\uDCA1 Share the class join code or walk them through the Student Portal in class.
                          </p>
                        </div>
                      )}

                      {/* Celebrations! */}
                      {(improvingStudents.length > 0 || masteryStudents.length > 0 || strongStandards.length > 0) && insightCard('🎉', 'Wins & Celebrations', '#ecfdf5', '#a7f3d0', '#065f46',
                        <div>
                          {improvingStudents.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#065f46' }}>\uD83D\uDCC8 Improving Fast</p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {improvingStudents.map((s) => (
                                  <span key={s.id} style={{
                                    padding: '4px 12px', background: '#fff', border: '1px solid #a7f3d0',
                                    borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#065f46',
                                  }}>
                                    {s.name} <span style={{ color: '#22c55e', fontWeight: 800 }}>+{Math.round(s.trend)}%</span>
                                  </span>
                                ))}
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#059669' }}>Scores trending upward — great progress! Consider recognizing their effort.</p>
                            </div>
                          )}
                          {masteryStudents.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#065f46' }}>â­ At Mastery Level (80%+)</p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {masteryStudents.map((s) => (
                                  <span key={s.id} style={{
                                    padding: '4px 12px', background: '#fff', border: '1px solid #a7f3d0',
                                    borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#065f46',
                                  }}>
                                    {s.name} — {s.avg}%
                                  </span>
                                ))}
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#059669' }}>These students could serve as peer tutors or tackle enrichment challenges.</p>
                            </div>
                          )}
                          {strongStandards.length > 0 && (
                            <div>
                              <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#065f46' }}>✅ Standards Mastered by the Class</p>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {strongStandards.map((ss) => (
                                  <span key={ss.teks} style={{
                                    padding: '4px 10px', background: '#fff', border: '1px solid #a7f3d0',
                                    borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#065f46',
                                  }}>
                                    {ss.teks} — {ss.avg}%
                                  </span>
                                ))}
                              </div>
                              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#059669' }}>Class average above 80%. Safe to move forward or reduce practice time on these.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Action Checklist */}
                      {insightCard('\uD83D\uDCCB', 'This Week\'s Action Checklist', '#f8fafc', '#e2e8f0', '#334155',
                        <div style={{ fontSize: 13, color: '#334155', lineHeight: 2 }}>
                          {weakStandards.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>â˜</span>
                              <span>Re-teach <strong>{weakStandards[0].teks}</strong> (lowest at {weakStandards[0].avg}%) using manipulatives or visual models</span>
                            </div>
                          )}
                          {smallGroups.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>â˜</span>
                              <span>Pull small group for <strong>{smallGroups[0].teks}</strong>: {smallGroups[0].students.join(', ')}</span>
                            </div>
                          )}
                          {strugglingStudents.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>â˜</span>
                              <span>Check in 1-on-1 with <strong>{strugglingStudents[0].name}</strong> ({strugglingStudents[0].avg}% avg)</span>
                            </div>
                          )}
                          {inactiveStudents.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>â˜</span>
                              <span>Help <strong>{inactiveStudents.slice(0, 2).map((s) => s.name).join(' & ')}</strong> log in and play their first game</span>
                            </div>
                          )}
                          {improvingStudents.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>â˜</span>
                              <span>Recognize <strong>{improvingStudents[0].name}</strong> for great improvement (+{Math.round(improvingStudents[0].trend)}%)</span>
                            </div>
                          )}
                          {middleStandards.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>â˜</span>
                              <span>Assign one more round of <strong>{middleStandards[0].teks}</strong> practice to push toward mastery</span>
                            </div>
                          )}
                          {weakStandards.length === 0 && strugglingStudents.length === 0 && inactiveStudents.length === 0 && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>✅</span>
                              <span>Class is on track! Consider introducing the next set of standards or enrichment activities.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* â”€â”€ Actionable Analytics (Predictive, Heatmap, Drop-off, Cohorts, Interventions) â”€â”€ */}
            <ActionableAnalytics
              students={students}
              gameResults={gameResults}
              classAssignments={classAssignments}
              classId={classId}
              classAvg={classAvg}
              gradeId={gradeId}
              allStandards={allStandards}
              teksPerformance={teksPerformance}
            />

            {/* â”€â”€ Student Activity (page views + time on task) â”€â”€ */}
            <StudentActivitySection classId={classId} />
          </div>
        );
      })()}

      {/* â”€â”€ Assign Games â”€â”€ */}
      {tab === 'games' && (() => {
        // Build the list of standards/domains to show
        const standardsList = classType === 'texes'
          ? (texesDomains.length > 0 ? texesDomains.map((id) => texesDomainsList.find((d) => d.id === id) || { id, name: id, description: id }) : texesDomainsList)
          : (teksStandards.length > 0 ? teksStandards.map((id) => allStandards.find((s) => s.id === id) || { id, description: id }) : allStandards);
        const selectedArr = [...selectedStandards];
        const gamesForSelected = selectedArr.length > 0
          ? (classType === 'texes'
            ? [...new Set(selectedArr.flatMap((d) => texesDomainsList.find((x) => x.id === d)?.games || []))].map((gid) => GAMES_CATALOG.find((g) => g.id === gid)).filter(Boolean)
            : getGamesByTeks(selectedArr).filter((g) => g.grades.includes(gameGradeId)))
          : [];
        const toggleStandard = (id) => {
          setSelectedStandards((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
          });
        };
        const selectedLabel = selectedArr.length <= 3
          ? selectedArr.join(', ')
          : `${selectedArr.slice(0, 3).join(', ')} +${selectedArr.length - 3}`;

        return (
          <div>
            {/* Step 1: Pick TEKS standards (multi-select) */}
            <div style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
              padding: '20px 24px', marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>
                  Step 1 — Select {classType === 'texes' ? 'TExES Domains' : 'TEKS Standards'}
                </h3>
                {selectedArr.length > 0 && (
                  <button type="button" onClick={() => setSelectedStandards(new Set())} style={{
                    padding: '4px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#64748b', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  }}>Clear all</button>
                )}
              </div>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#64748b' }}>
                Select one or more standards, then assign a game. Games will cover all selected standards.
                {selectedArr.length > 0 && (
                  <span style={{ fontWeight: 700, color: '#2563eb', marginLeft: 6 }}>
                    {selectedArr.length} selected
                  </span>
                )}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {standardsList.map((std) => {
                  const isActive = selectedStandards.has(std.id);
                  const gamesCount = classType === 'texes'
                    ? (texesDomainsList.find((d) => d.id === std.id)?.games?.length || 0)
                    : getGamesByTeks([std.id]).filter((g) => g.grades.includes(gameGradeId)).length;
                  const isAssignedForTeks = classAssignments.some((a) => (a.focusTeks || '').split(',').includes(std.id));
                  return (
                    <button
                      key={std.id}
                      type="button"
                      onClick={() => toggleStandard(std.id)}
                      title={std.description || std.desc || std.name || std.id}
                      style={{
                        padding: '6px 14px', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 700,
                        background: isActive ? '#2563eb' : isAssignedForTeks ? '#ecfdf5' : '#f1f5f9',
                        color: isActive ? '#fff' : isAssignedForTeks ? '#065f46' : '#475569',
                        border: isActive ? '2px solid #2563eb' : isAssignedForTeks ? '2px solid #a7f3d0' : '1.5px solid #e2e8f0',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      {isActive && <span style={{ marginRight: 4 }}>✅</span>}
                      {!isActive && isAssignedForTeks && <span style={{ marginRight: 4 }}>✅</span>}
                      {std.name || std.id}
                      <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>
                        ({gamesCount})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Games for the selected standards */}
            {selectedArr.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 12, border: '2px solid #bfdbfe',
                padding: '20px 24px', marginBottom: 20,
              }}>
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#0f172a' }}>
                    Step 2 — Play or Assign a Game for {selectedLabel}
                  </h3>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                    {selectedArr.map((t) => {
                      const s = allStandards.find((st) => st.id === t);
                      return (
                        <span key={t} title={s?.description || t} style={{
                          padding: '2px 8px', background: '#dbeafe', color: '#1e40af',
                          borderRadius: 4, fontSize: 11, fontWeight: 700,
                        }}>{t}</span>
                      );
                    })}
                  </div>
                </div>

                {gamesForSelected.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', background: '#f8fafc', borderRadius: 10 }}>
                    <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
                      No games available for the selected standards yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {gamesForSelected.map((game) => {
                      const focusKey = selectedArr.sort().join(',');
                      const teksGameKey = `${game.id}-${focusKey}`;
                      const isAlreadyAssigned = classAssignments.some(
                        (a) => a.gameId === game.id && a.focusTeks === focusKey
                      );
                      const assignedA = classAssignments.find(
                        (a) => a.gameId === game.id && a.focusTeks === focusKey
                      );
                      const teksAutoGrade = autoGradePrefs[teksGameKey] !== undefined ? autoGradePrefs[teksGameKey] : true;
                      const playUrl = `${game.path}?teks=${selectedArr.join(',')}&label=${encodeURIComponent(selectedLabel)}`;

                      return (
                        <div key={game.id} style={{
                          padding: '16px 20px', borderRadius: 10,
                          background: isAlreadyAssigned ? '#f0fdf4' : '#f8fafc',
                          border: isAlreadyAssigned ? '2px solid #a7f3d0' : '1.5px solid #e2e8f0',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 20 }}>🎮</span>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{game.name}</div>
                                {isAlreadyAssigned && (
                                  <span style={{
                                    padding: '2px 8px', background: '#dcfce7', color: '#065f46',
                                    borderRadius: 12, fontSize: 10, fontWeight: 700,
                                  }}>\u2705 Assigned</span>
                                )}
                              </div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{game.description}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              {/* Play / Preview button */}
                              <Link to={playUrl} style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                color: '#fff', borderRadius: 10, textDecoration: 'none',
                                fontSize: 13, fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: 6,
                                boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
                                transition: 'transform 0.15s',
                              }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                â–¶ Play
                              </Link>
                              {/* Assign button */}
                              {isAlreadyAssigned ? (
                                <span style={{
                                  padding: '10px 16px', background: '#ecfdf5', color: '#065f46',
                                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                                  border: '1px solid #a7f3d0',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                }}>\u2705 Assigned</span>
                              ) : (
                                <button type="button" onClick={() => {
                                  handleAssignGame(game, selectedArr, teksAutoGrade);
                                }} style={{
                                  padding: '10px 20px',
                                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                  color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
                                  fontSize: 13, fontWeight: 700,
                                  boxShadow: '0 2px 8px rgba(34,197,94,0.25)',
                                  transition: 'transform 0.15s',
                                }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                  Assign to Class
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Auto-grade toggle row */}
                          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {isAlreadyAssigned ? (
                              <button type="button" onClick={() => toggleAutoGrade(assignedA.id)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  padding: '3px 10px', border: 'none', borderRadius: 6,
                                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                  background: assignedA.autoGrade !== false ? '#ecfdf5' : '#f1f5f9',
                                  color: assignedA.autoGrade !== false ? '#065f46' : '#64748b',
                                }}
                              >
                                <span style={{
                                  position: 'relative', display: 'inline-block',
                                  width: 26, height: 14, borderRadius: 7,
                                  background: assignedA.autoGrade !== false ? '#22c55e' : '#cbd5e1',
                                  transition: 'background 0.2s',
                                }}>
                                  <span style={{
                                    position: 'absolute', top: 2,
                                    left: assignedA.autoGrade !== false ? 14 : 2,
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: '#fff', transition: 'left 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                  }} />
                                </span>
                                {assignedA.autoGrade !== false ? 'Auto-graded' : 'Manual'}
                              </button>
                            ) : (
                              <button type="button"
                                onClick={() => setAutoGradePrefs((prev) => ({ ...prev, [teksGameKey]: !teksAutoGrade }))}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 5,
                                  padding: '3px 10px', border: 'none', borderRadius: 6,
                                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                                  background: teksAutoGrade ? '#ecfdf5' : '#f1f5f9',
                                  color: teksAutoGrade ? '#065f46' : '#64748b',
                                }}
                              >
                                <span style={{
                                  position: 'relative', display: 'inline-block',
                                  width: 26, height: 14, borderRadius: 7,
                                  background: teksAutoGrade ? '#22c55e' : '#cbd5e1',
                                  transition: 'background 0.2s',
                                }}>
                                  <span style={{
                                    position: 'absolute', top: 2,
                                    left: teksAutoGrade ? 14 : 2,
                                    width: 10, height: 10, borderRadius: '50%',
                                    background: '#fff', transition: 'left 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                  }} />
                                </span>
                                {teksAutoGrade ? 'Auto-graded' : 'Manual'}
                              </button>
                            )}
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>
                              {(isAlreadyAssigned ? assignedA.autoGrade !== false : teksAutoGrade)
                                ? 'Scores recorded from game play'
                                : 'Teacher enters scores'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Current Assignments summary */}
            {classAssignments.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                padding: '20px 24px',
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#0f172a' }}>
                  Assigned Games ({classAssignments.length})
                </h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {classAssignments.map((a) => (
                    <div key={a.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: '#f0fdf4', borderRadius: 8,
                      border: '1px solid #bbf7d0',
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#065f46' }}>\u2705 {a.name}</div>
                        {a.focusTeks && (
                          <span style={{
                            fontSize: 11, color: '#1a5cba', background: '#e8f0fe',
                            padding: '1px 6px', borderRadius: 3, fontWeight: 600,
                          }}>{a.focusTeks}</span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {a.autoGrade !== false ? 'Auto-graded' : 'Manual'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* â”€â”€ Sections â”€â”€ */}
      {tab === 'sections' && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '20px 24px',
        }}>
          <SectionManager classId={classId} students={students} />
        </div>
      )}

      {/* â”€â”€ Attendance â”€â”€ */}
      {tab === 'attendance' && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '20px 24px',
        }}>
          <AttendanceManager classId={classId} students={students} />
        </div>
      )}

      {/* â”€â”€ Mastery Paths â”€â”€ */}
      {tab === 'mastery-paths' && (
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '20px 24px',
        }}>
          <MasteryPathBuilder classId={classId} isTeacher={true} />
        </div>
      )}

      {/* â”€â”€ Admin Tools â”€â”€ */}
      {tab === 'admin' && (
        <div style={{ display: 'grid', gap: 24 }}>
          <AgenticWorkflow
            cls={cls}
            classId={classId}
            students={students}
            onRefresh={() => setAssignments(getAssignments())}
          />
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: 0 }} />
          <TeacherAdmin
            cls={cls}
            classId={classId}
            students={students}
            onRefresh={() => setAssignments(getAssignments())}
          />
        </div>
      )}
        </div>
      </div>
    </TeacherLayout>
  );
};

const thStyle = { padding: '10px 12px', textAlign: 'left', fontSize: 13, fontWeight: 700, borderBottom: '2px solid #e2e8f0' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 14 };

function AssessmentsPanel({ classId }) {
  const [mode, setMode] = useState('list');
  const [editId, setEditId] = useState(null);
  const [gradeId, setGradeId] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const assessments = useMemo(() => getAssessmentList().filter((a) => a.classId === classId), [classId, refreshKey]);
  const refresh = () => setRefreshKey((k) => k + 1);

  if (mode === 'create' || mode === 'edit') {
    return (
      <AssessmentBuilder
        classId={classId}
        assessmentId={editId}
        onSave={() => { setMode('list'); setEditId(null); refresh(); }}
        onCancel={() => { setMode('list'); setEditId(null); }}
      />
    );
  }

  if (mode === 'grade') {
    return (
      <AssessmentGrader
        assessmentId={gradeId}
        onBack={() => { setMode('list'); setGradeId(null); refresh(); }}
      />
    );
  }

  if (mode === 'analysis') {
    const a = assessments.find((x) => x.id === analysisId);
    return (
      <ItemAnalysis
        assessmentId={analysisId}
        assessmentName={a?.title}
        onBack={() => { setMode('list'); setAnalysisId(null); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Assessments</h3>
        <button type="button" onClick={() => setMode('create')}
          style={{ padding: '8px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          + New Assessment
        </button>
      </div>

      {assessments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{'\uD83D\uDCDD'}</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No assessments yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Create your first assessment with 14+ question types, proctoring, and auto-grading.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {assessments.map((a) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {a.questions?.length || 0} questions &middot; {a.totalPoints || 0} points
                  &middot; {a.settings?.timeLimit ? `${a.settings.timeLimit} min` : 'Untimed'}
                  &middot; <span style={{ fontWeight: 700, color: a.status === 'published' ? '#059669' : '#f59e0b' }}>{a.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {a.status === 'draft' && (
                  <button type="button" onClick={() => { publishAssessment(a.id); refresh(); }}
                    style={{ padding: '6px 12px', borderRadius: 6, background: '#059669', color: '#fff', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Publish
                  </button>
                )}
                {a.status === 'published' && (
                  <button type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/assessment/${a.id}`); }}
                    style={{ padding: '6px 12px', borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                    Copy Link
                  </button>
                )}
                <button type="button" onClick={() => { setGradeId(a.id); setMode('grade'); }}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                  Grade
                </button>
                <button type="button" onClick={() => { setAnalysisId(a.id); setMode('analysis'); }}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', fontWeight: 700, fontSize: 11, cursor: 'pointer', color: '#15803d' }}>
                  Item Analysis
                </button>
                <button type="button" onClick={() => { setEditId(a.id); setMode('edit'); }}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                  Edit
                </button>
                <button type="button" onClick={() => { if (confirm('Delete this assessment?')) { removeAssessment(a.id); refresh(); } }}
                  style={{ padding: '6px 12px', borderRadius: 6, background: '#fee2e2', border: 'none', color: '#dc2626', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TASection({ cls, classId, onRefresh }) {
  const [taUsername, setTaUsername] = React.useState('');
  const tas = cls?.tas || [];

  const handleAddTA = (e) => {
    e.preventDefault();
    if (!taUsername.trim()) return;
    if (tas.includes(taUsername.trim())) { setTaUsername(''); return; }
    const classes = getClasses();
    const idx = classes.findIndex((c) => c.id === classId);
    if (idx === -1) return;
    classes[idx].tas = [...tas, taUsername.trim()];
    saveClasses(classes);
    setTaUsername('');
    onRefresh();
  };

  const handleRemoveTA = (username) => {
    const classes = getClasses();
    const idx = classes.findIndex((c) => c.id === classId);
    if (idx === -1) return;
    classes[idx].tas = (classes[idx].tas || []).filter((u) => u !== username);
    saveClasses(classes);
    onRefresh();
  };

  return (
    <section style={{ marginBottom: 40 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#64748b' }}>Teaching Assistants</h3>
      {tas.length === 0 && (
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>No TAs assigned yet.</p>
      )}
      {tas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 12 }}>
          {tas.map((ta, i) => (
            <div key={ta} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: i < tas.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: 14,
            }}>
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{ta}</span>
              <button type="button" onClick={() => handleRemoveTA(ta)} style={{
                padding: '3px 10px', borderRadius: 6, border: '1px solid #fca5a5',
                background: '#fff', color: '#dc2626', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleAddTA} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          id="classview-ta-username"
          aria-label="TA username"
          placeholder="TA username..."
          value={taUsername}
          onChange={(e) => setTaUsername(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px', fontSize: 14, borderRadius: 8,
            border: '1px solid #e2e8f0', outline: 'none', background: '#fff',
          }}
        />
        <button type="submit" style={{
          padding: '10px 18px', background: '#7c3aed', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
        }}>Add TA</button>
      </form>
    </section>
  );
}

function StudentActivitySection({ classId }) {
  const [activityData, setActivityData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const token = localStorage.getItem('quantegy-auth-token');

  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/activity/class/${classId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (data?.students) setActivityData(data.students); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classId, token]);

  const formatTime = (ms) => {
    if (!ms) return '0m';
    const mins = Math.round(ms / 60000);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Student Activity</h3>
      {loading && (
        <div style={{ padding: 12 }}>
          <SkeletonLoader variant="table-row" />
          <SkeletonLoader variant="table-row" />
          <SkeletonLoader variant="table-row" />
        </div>
      )}
      {!loading && !activityData && (
        <div style={{ fontSize: 13, color: '#94a3b8' }}>No activity data available yet.</div>
      )}
      {!loading && activityData && activityData.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={thStyle}>Student</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Page Views</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Time Spent</th>
              </tr>
            </thead>
            <tbody>
              {activityData.map((s) => (
                <tr key={s.studentId || s.name}>
                  <td style={tdStyle}>{s.name}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{s.pageViews ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600 }}>{formatTime(s.totalTimeMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClassView;
