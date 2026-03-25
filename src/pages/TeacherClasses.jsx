import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClassesByTeacher, getAssignments, getGrades } from '../utils/storage';
import TeacherLayout from '../components/TeacherLayout';

/**
 * My Classes page — shows all classes for the logged-in teacher.
 */
const TeacherClasses = () => {
  const navigate = useNavigate();
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

  return (
    <TeacherLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 28, color: '#0f172a' }}>My Classes</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
            {classes.length} class{classes.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Link to="/teacher-class-new" style={{
          padding: '10px 20px', background: '#2563eb', color: '#fff', borderRadius: 10,
          textDecoration: 'none', fontSize: 14, fontWeight: 700,
          boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
        }}>
          + Create New Class
        </Link>
      </div>

      {classes.length === 0 ? (
        <div style={{
          padding: '60px 24px', background: '#fff', borderRadius: 14,
          border: '2px dashed #e2e8f0', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F4DA}'}</div>
          <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No classes yet</h3>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
            Create your first class to start assigning games and tracking progress.
          </p>
          <Link to="/teacher-class-new" style={{
            display: 'inline-block', padding: '12px 28px', background: '#2563eb',
            color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700,
          }}>
            Create Your First Class
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {classes.map((cls) => {
            const stats = getClassStats(cls.id);
            return (
              <Link
                key={cls.id}
                to={`/teacher-class/${cls.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '22px 26px', background: '#fff', borderRadius: 14,
                  border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit',
                  transition: 'box-shadow 0.15s', gap: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#0f172a' }}>{cls.name}</h3>
                  {cls.description && (
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: '#64748b' }}>{cls.description}</p>
                  )}
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
                    <span>{cls.gradeLevel}</span>
                    <span>{cls.students?.length || 0} students</span>
                    <span>{stats.assignmentCount} assignments</span>
                    {cls.teksStandards?.length > 0 && (
                      <span>{cls.teksStandards.length} TEKS standards</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  {stats.avgScore !== null && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: 24, fontWeight: 800,
                        color: stats.avgScore >= 80 ? '#22c55e' : stats.avgScore >= 60 ? '#eab308' : '#ef4444',
                      }}>
                        {stats.avgScore}%
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Avg Score</div>
                    </div>
                  )}
                  <span style={{ color: '#94a3b8', fontSize: 22 }}>{'\u203A'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </TeacherLayout>
  );
};

export default TeacherClasses;
