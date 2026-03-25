import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getClassesByTeacher, getAssignments, getGrades, getGameResults,
  getHoursSaved, duplicateClass, trackTimeSaved,
} from '../utils/storage';
import { hasProAccess, getTrialDaysLeft, isTrialExpired } from '../utils/subscription';
import TeacherLayout from '../components/TeacherLayout';
import { useLanguage } from '../contexts/LanguageContext';

const TeacherHome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const username = localStorage.getItem('quantegy-teacher-user');
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    if (!username) { navigate('/teacher'); return; }
    setClasses(getClassesByTeacher(username));
    setAssignments(getAssignments());
    setGrades(getGrades());
  }, [username, navigate]);

  const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  const totalAssignments = assignments.filter((a) => classes.some((c) => c.id === a.classId)).length;

  const handleDuplicate = (e, cls) => {
    e.preventDefault();
    e.stopPropagation();
    const newName = prompt('Name for the duplicate class:', `${cls.name} (Copy)`);
    if (!newName) return;
    const result = duplicateClass(cls.id, newName);
    if (result) {
      trackTimeSaved('duplications', 1);
      setClasses(getClassesByTeacher(username));
      setAssignments(getAssignments());
    }
  };

  const daysLeft = username ? getTrialDaysLeft(username) : 0;
  const hasPro = username ? hasProAccess(username) : false;
  const expired = username ? isTrialExpired(username) : false;

  const recentActivity = useMemo(() => {
    const results = getGameResults();
    const classIds = new Set(classes.map((c) => c.id));
    return results
      .filter((r) => classIds.has(r.classId))
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 5);
  }, [classes]);

  const hoursSaved = useMemo(() => getHoursSaved(), []);
  const totalMinutesSaved = (hoursSaved.autoGraded || 0) * 2 + (hoursSaved.aiGraded || 0) * 5 +
    (hoursSaved.feedbackDrafts || 0) * 8 + (hoursSaved.duplications || 0) * 30 +
    (hoursSaved.transformations || 0) * 20;

  const getClassStats = (classId) => {
    const classAssignments = assignments.filter((a) => a.classId === classId);
    const classGrades = grades.filter((g) =>
      classAssignments.some((a) => a.id === g.assignmentId)
    );
    const avgScore = classGrades.length > 0
      ? Math.round(classGrades.reduce((s, g) => s + g.score, 0) / classGrades.length)
      : null;
    return { assignmentCount: classAssignments.length, avgScore };
  };

  const quickActions = [
    { label: 'AI Course Builder', icon: '\u2728', path: '/teacher-copilot?tab=course-gen', color: '#7c3aed' },
    { label: 'New Class', icon: '\u2795', path: '/teacher-class-new', color: '#2563eb' },
    { label: 'AI Copilot', icon: '\uD83E\uDD16', path: '/teacher-copilot', color: '#6366f1' },
    { label: 'Live Game', icon: '\uD83C\uDFAE', path: '/live-game', color: '#059669' },
  ];

  return (
    <TeacherLayout>
      <style>{`
        @media (max-width: 640px) {
          .dash-hero-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-stats-row { flex-direction: column !important; }
          .dash-class-grid { grid-template-columns: 1fr !important; }
          .dash-quick-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* Trial banners — compact */}
      {expired && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: '#991b1b', fontSize: 13 }}>{t('trialEnded')}</span>
          <Link to={`/pricing?user=${username}`} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>{t('upgrade')}</Link>
        </div>
      )}
      {hasPro && daysLeft > 0 && daysLeft <= 5 && !expired && (
        <div style={{ padding: '10px 16px', borderRadius: 8, marginBottom: 16, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: '#92400e', fontSize: 13 }}>{t('trialEnding')} {daysLeft} {daysLeft !== 1 ? t('days') : t('day')}.</span>
          <Link to={`/pricing?user=${username}`} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>{t('viewPlans')}</Link>
        </div>
      )}

      {/* Welcome + hint */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {t('welcomeBack')}{username ? `, ${username}` : ''}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
          Press <kbd style={{ padding: '1px 5px', borderRadius: 3, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 600 }}>Ctrl+K</kbd> to do anything fast.
        </p>
      </div>

      {/* Quick actions row */}
      <div className="dash-quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {quickActions.map((qa) => (
          <Link key={qa.label} to={qa.path} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
            borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0',
            textDecoration: 'none', color: '#0f172a', transition: 'all 0.15s',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = qa.color; e.currentTarget.style.boxShadow = `0 2px 8px ${qa.color}20`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: qa.color + '12', fontSize: 18,
            }}>{qa.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{qa.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats row */}
      <div className="dash-stats-row" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: t('classes'), value: classes.length, color: '#2563eb' },
          { label: t('students'), value: totalStudents, color: '#7c3aed' },
          { label: t('assignments'), value: totalAssignments, color: '#059669' },
          { label: 'Time Saved', value: `${Math.round(totalMinutesSaved / 6) / 10}h`, color: '#22c55e' },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, minWidth: 100, padding: '14px 16px', background: '#fff', borderRadius: 10,
            border: '1px solid #e2e8f0',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Classes */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{t('yourClasses')}</h2>
          <Link to="/teacher-class-new" style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
          }}>+ {t('newClass')}</Link>
        </div>

        {classes.length === 0 ? (
          <div style={{
            padding: 48, background: '#fff', borderRadius: 12, border: '1px dashed #cbd5e1', textAlign: 'center',
          }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5 }}>{'\uD83D\uDCDA'}</div>
            <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#0f172a' }}>{t('noClassesYet')}</h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{t('createFirstClass')}</p>
            <Link to="/teacher-class-new" style={{
              display: 'inline-block', padding: '10px 22px', background: '#2563eb', color: '#fff',
              borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13,
            }}>{t('createClass')}</Link>
          </div>
        ) : (
          <div className="dash-class-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {classes.map((cls) => {
              const stats = getClassStats(cls.id);
              const accent = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'][classes.indexOf(cls) % 5];
              return (
                <Link key={cls.id} to={`/teacher-class/${cls.id}`} style={{
                  display: 'block', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
                  textDecoration: 'none', color: 'inherit', overflow: 'hidden',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ height: 5, background: accent }} />
                  <div style={{ padding: '16px 18px' }}>
                    <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{cls.name}</h3>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                      <span style={{ fontWeight: 600, color: cls.classType === 'texes' ? '#7c3aed' : '#2563eb' }}>
                        {cls.classType === 'texes' ? 'TExES' : 'STAAR'}
                      </span>
                      {' \u00B7 '}{cls.gradeLevel} {'\u00B7'} {cls.students?.length || 0} students
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {stats.avgScore !== null && (
                        <span style={{
                          padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                          background: stats.avgScore >= 80 ? '#dcfce7' : stats.avgScore >= 60 ? '#fef9c3' : '#fee2e2',
                          color: stats.avgScore >= 80 ? '#166534' : stats.avgScore >= 60 ? '#854d0e' : '#991b1b',
                        }}>{stats.avgScore}%</span>
                      )}
                      <button type="button" onClick={(e) => handleDuplicate(e, cls)} title="Duplicate" aria-label="Duplicate class" style={{
                        marginLeft: 'auto', padding: '3px 8px', borderRadius: 5, border: '1px solid #e2e8f0',
                        background: '#f8fafc', fontSize: 10, fontWeight: 600, color: '#94a3b8', cursor: 'pointer',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#2563eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                      >{'\uD83D\uDCCB'}</button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</h2>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {recentActivity.map((r, i) => {
              const cls = classes.find((c) => c.id === r.classId);
              const student = cls?.students?.find((s) => s.id === r.studentId);
              const displayName = student?.name || student?.nickname || 'Student';
              return (
                <div key={r.id || i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid #f1f5f9' : 'none',
                  fontSize: 13,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: (r.score || 0) >= 80 ? '#22c55e' : (r.score || 0) >= 60 ? '#eab308' : '#ef4444',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{displayName}</span>
                  <span style={{ color: '#64748b' }}>scored {r.score}%</span>
                  {cls && <span style={{ color: '#94a3b8', fontSize: 11 }}>in {cls.name}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#cbd5e1' }}>
                    {r.timestamp ? new Date(r.timestamp).toLocaleDateString() : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </TeacherLayout>
  );
};

export default TeacherHome;
