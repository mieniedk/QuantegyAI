import React, { useState, useEffect, useCallback } from 'react';
import RubricBuilder from './RubricBuilder';
import RichTextEditor from './RichTextEditor';
import PlagiarismChecker from './PlagiarismChecker';

export default function SpeedGrader({ assignment, students, grades, onGrade, onClose }) {
  const safeStudents = Array.isArray(students) ? students : [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rubricScores, setRubricScores] = useState({});

  const student = safeStudents[currentIdx];
  const studentId = typeof student === 'string' ? student : student?.id || student?.name;
  const studentName = typeof student === 'string' ? student : student?.name || student?.displayName || student?.id;

  const existingGrade = grades?.find(g =>
    g.studentId === studentId && g.assignmentId === assignment?.id
  );

  useEffect(() => {
    if (existingGrade) {
      setScore(existingGrade.score?.toString() || '');
      setFeedback(existingGrade.feedback || '');
      setRubricScores(existingGrade.rubricScores || {});
    } else {
      setScore('');
      setFeedback('');
      setRubricScores({});
    }
  }, [currentIdx, existingGrade?.score]);

  const handleSave = () => {
    if (!student || !assignment) return;
    onGrade?.({
      studentId,
      assignmentId: assignment.id,
      assignmentName: assignment.name,
      score: parseFloat(score) || 0,
      feedback,
      rubricScores,
      gradedAt: new Date().toISOString(),
    });
  };

  const handleRubricScore = (criterionIdx, pts) => {
    setRubricScores(prev => {
      const next = { ...prev, [criterionIdx]: pts };
      const total = Object.values(next).reduce((s, v) => s + v, 0);
      setScore(total.toString());
      return next;
    });
  };

  const prev = () => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); };
  const next = () => { if (currentIdx < safeStudents.length - 1) setCurrentIdx(currentIdx + 1); };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }, [currentIdx]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!assignment || safeStudents.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📝</div>
        <p>No students or assignment selected.</p>
        {onClose && <button type="button" onClick={onClose} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Close</button>}
      </div>
    );
  }

  const gradedCount = grades?.filter(g => g.assignmentId === assignment.id).length || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>SpeedGrader</span>
          <span style={{ fontSize: 13, color: '#64748b' }}>{assignment.name}</span>
          <span style={{ fontSize: 11, background: '#e0edff', color: '#2563eb', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
            {gradedCount}/{safeStudents.length} graded
          </span>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8' }}>✕</button>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Student list sidebar */}
        <div style={{ width: 200, borderRight: '1px solid #e2e8f0', overflowY: 'auto', background: '#fafbfc', flexShrink: 0 }}>
          {safeStudents.map((s, i) => {
            const sid = typeof s === 'string' ? s : s?.id || s?.name;
            const sname = typeof s === 'string' ? s : s?.name || s?.displayName || s?.id;
            const graded = grades?.some(g => g.studentId === sid && g.assignmentId === assignment.id);
            return (
              <div key={sid}
                onClick={() => setCurrentIdx(i)}
                style={{
                  padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                  background: i === currentIdx ? '#e0edff' : 'transparent',
                  borderLeft: i === currentIdx ? '3px solid #2563eb' : '3px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontWeight: i === currentIdx ? 700 : 500, color: '#0f172a' }}>{sname}</span>
                {graded && <span style={{ fontSize: 10, color: '#059669' }}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* Main grading area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Student navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <button type="button" onClick={prev} disabled={currentIdx === 0}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: currentIdx > 0 ? 'pointer' : 'default', color: currentIdx > 0 ? '#0f172a' : '#cbd5e1', fontWeight: 600, fontSize: 13 }}>
              ← Previous
            </button>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
              {studentName}
              <span style={{ fontWeight: 400, fontSize: 13, color: '#64748b', marginLeft: 8 }}>
                ({currentIdx + 1} of {safeStudents.length})
              </span>
            </span>
            <button type="button" onClick={next} disabled={currentIdx >= safeStudents.length - 1}
              style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: currentIdx < safeStudents.length - 1 ? 'pointer' : 'default', color: currentIdx < safeStudents.length - 1 ? '#0f172a' : '#cbd5e1', fontWeight: 600, fontSize: 13 }}>
              Next →
            </button>
          </div>

          {/* Rubric grading */}
          {assignment.rubric && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Rubric</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 8 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0', fontWeight: 700 }}>Criteria</th>
                    {assignment.rubric.levels.map((l, i) => (
                      <th key={i} style={{ padding: '8px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontWeight: 600, fontSize: 11 }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignment.rubric.criteria.map((c, ci) => (
                    <tr key={ci}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        {c.name}
                        {c.description && <div style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>{c.description}</div>}
                      </td>
                      {c.scores.map((pts, si) => (
                        <td key={si} style={{ padding: '4px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                          <button type="button" onClick={() => handleRubricScore(ci, pts)}
                            style={{
                              width: 40, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
                              fontWeight: 800, fontSize: 14,
                              background: rubricScores[ci] === pts ? '#2563eb' : '#f1f5f9',
                              color: rubricScores[ci] === pts ? '#fff' : '#64748b',
                              transition: 'all 0.15s',
                            }}>
                            {pts}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* URL submission display */}
          {existingGrade?.submission && /^https?:\/\//.test(
            typeof existingGrade.submission === 'string' ? existingGrade.submission : existingGrade.submission.url || ''
          ) && (() => {
            const url = typeof existingGrade.submission === 'string' ? existingGrade.submission : existingGrade.submission.url;
            let domain = '';
            try { domain = new URL(url).hostname; } catch (_) {}
            return (
              <div style={{
                marginBottom: 16, padding: '12px 16px', borderRadius: 10,
                background: '#eff6ff', border: '1px solid #bfdbfe',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>🔗</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 2 }}>URL Submission</div>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, wordBreak: 'break-all' }}>
                    {domain ? `${domain} ↗` : url}
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Score & feedback */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Score</label>
              <input type="number" value={score} onChange={e => setScore(e.target.value)}
                min={0} step={0.5}
                style={{ width: 80, padding: '8px 12px', border: '2px solid #e2e8f0', borderRadius: 8, fontWeight: 800, fontSize: 18, textAlign: 'center', color: '#2563eb' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Feedback</label>
              <RichTextEditor value={feedback} onChange={setFeedback}
                placeholder="Provide feedback for this student... click ∑ for math" compact minHeight={60} />
            </div>
          </div>

          {/* Plagiarism / Originality Check */}
          <PlagiarismChecker
            content={existingGrade?.submission || feedback}
            submissionId={`${assignment.id}-${studentId}`}
            studentName={studentName}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={() => { handleSave(); next(); }}
              style={{ padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14 }}>
              Save & Next
            </button>
            <button type="button" onClick={handleSave}
              style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 14 }}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
