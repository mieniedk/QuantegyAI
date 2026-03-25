import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEKS_GRADES, TEKS_STANDARDS } from '../data/teks.js';
import {
  getClasses, saveClasses, getAssignments, saveAssignments,
  addModule, addModuleItem, generateClassCode,
} from '../utils/storage.js';
import RichTextEditor from './RichTextEditor';

const STEPS = [
  { id: 'input', label: 'Course Details', icon: '1' },
  { id: 'generating', label: 'AI Generating', icon: '2' },
  { id: 'preview', label: 'Preview & Edit', icon: '3' },
  { id: 'deploy', label: 'Create Class', icon: '4' },
];

const PIPELINE_STAGES = [
  { key: 'outline', label: 'Building course outline & unit structure', icon: '\uD83D\uDCCB' },
  { key: 'lessons', label: 'Writing detailed lesson plans', icon: '\uD83D\uDCD6' },
  { key: 'quizzes', label: 'Generating unit assessments', icon: '\u2753' },
  { key: 'assignments', label: 'Matching game-based assignments', icon: '\uD83C\uDFAE' },
  { key: 'assembly', label: 'Assembling complete course', icon: '\uD83D\uDCE6' },
];

export default function CourseGenerator({ teacher }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('input');

  // Input state
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [gradeId, setGradeId] = useState('grade3');
  const [classType, setClassType] = useState('staar');
  const [numWeeks, setNumWeeks] = useState(4);
  const [outcomes, setOutcomes] = useState(['']);
  const [selectedTeks, setSelectedTeks] = useState([]);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeAssignments, setIncludeAssignments] = useState(true);

  // Generation state
  const [pipelineStage, setPipelineStage] = useState(0);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Deploy state
  const [deploying, setDeploying] = useState(false);
  const [deployedClass, setDeployedClass] = useState(null);

  const availableStandards = useMemo(() => TEKS_STANDARDS[gradeId] || [], [gradeId]);

  const addOutcome = () => setOutcomes([...outcomes, '']);
  const removeOutcome = (i) => setOutcomes(outcomes.filter((_, idx) => idx !== i));
  const updateOutcome = (i, val) => {
    const copy = [...outcomes];
    copy[i] = val;
    setOutcomes(copy);
  };

  const toggleTeks = (id) => {
    setSelectedTeks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // ── GENERATE COURSE ──
  const handleGenerate = async () => {
    if (!courseName.trim()) return;
    setStep('generating');
    setGenerating(true);
    setError(null);
    setPipelineStage(0);

    const progressInterval = setInterval(() => {
      setPipelineStage((prev) => Math.min(prev + 1, PIPELINE_STAGES.length - 1));
    }, 8000);

    try {
      const res = await fetch('/api/generate-full-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseName: courseName.trim(),
          description: description,
          gradeLevel: TEKS_GRADES.find((g) => g.id === gradeId)?.label || 'Grade 3',
          gradeId,
          teksStandards: selectedTeks,
          learningOutcomes: outcomes.filter((o) => o.trim()),
          numWeeks,
          classType,
          includeQuizzes,
          includeAssignments,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server returned ${res.status}. Check that the backend is running.`);
      }

      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.warn('Course generator parse failed:', err);
        throw new Error('Server returned an invalid response (not JSON). The AI generation may have timed out.');
      }
      clearInterval(progressInterval);

      if (!data.success) {
        setError(data.error || 'Course generation failed. Try again or reduce the number of weeks.');
        setStep('input');
      } else {
        setPipelineStage(PIPELINE_STAGES.length - 1);
        setCourse(data.course);
        setTimeout(() => setStep('preview'), 800);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || 'Network error — is the backend server running on port 3001?');
      setStep('input');
    } finally {
      setGenerating(false);
    }
  };

  // ── DEPLOY AS CLASS ──
  const handleDeploy = () => {
    if (!course || deploying) return;
    setDeploying(true);

    const classes = getClasses();
    const newClass = {
      id: `class-${Date.now()}`,
      name: course.title || courseName,
      description: course.overview || description,
      classType: course.classType || 'staar',
      gradeLevel: course.gradeLevel,
      gradeId: course.gradeId || gradeId,
      teksStandards: course.teksStandards || selectedTeks,
      texesDomains: [],
      games: [],
      joinCode: `MATH-${generateClassCode()}`,
      students: [],
      teacher: teacher || 'teacher',
      createdAt: new Date().toISOString(),
      aiGenerated: true,
    };

    classes.push(newClass);
    saveClasses(classes);

    // Create modules with lesson content
    const createdModules = [];
    for (const mod of (course.modules || [])) {
      const savedMod = addModule({
        classId: newClass.id,
        name: `Unit ${mod.unitNumber}: ${mod.title}`,
        description: mod.focus || '',
      });
      createdModules.push(savedMod);

      for (const lesson of (mod.lessons || [])) {
        addModuleItem(savedMod.id, {
          type: 'lesson-plan',
          title: lesson.title || `Lesson`,
          content: lesson,
          teksStandard: lesson.teksStandard || '',
          duration: lesson.duration || '45 min',
        });
      }

      if (mod.quiz && (mod.quiz.questions || []).length > 0) {
        addModuleItem(savedMod.id, {
          type: 'quiz',
          title: mod.quiz.quizTitle || `Unit ${mod.unitNumber} Quiz`,
          content: mod.quiz,
          totalPoints: mod.quiz.totalPoints || 0,
        });
      }
    }

    // Create game assignments
    const existingAssignments = getAssignments();
    const newAssignments = (course.modules || [])
      .flatMap((mod) => mod.assignments || [])
      .map((a, i) => ({
        id: `a-${Date.now()}-${i}`,
        name: a.gameName || 'Game Assignment',
        classId: newClass.id,
        gameId: a.gameId || 'math-sprint',
        gamePath: a.gamePath || '/games/math-sprint',
        teks: a.teks || [],
        focusTeks: null,
        autoGrade: true,
        aiGenerated: true,
      }));

    if (newAssignments.length > 0) {
      saveAssignments([...existingAssignments, ...newAssignments]);
      newClass.games = newAssignments.map((a) => a.gameId);
      saveClasses(classes);
    }

    setDeployedClass(newClass);
    setStep('deploy');
    setDeploying(false);
  };

  const gradeLabel = TEKS_GRADES.find((g) => g.id === gradeId)?.label || 'Grade 3';

  // ═══════════════════════ RENDER ═══════════════════════

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {STEPS.map((s, i) => {
          const current = STEPS.findIndex((st) => st.id === step);
          const done = i < current;
          const active = s.id === step;
          return (
            <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', margin: '0 auto 6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: done ? '#10b981' : active ? '#2563eb' : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                transition: 'all 0.3s',
              }}>
                {done ? '\u2713' : s.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#0f172a' : '#94a3b8' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {error && (
        <div role="alert" style={{ padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 16 }}>
          {error}
          <button type="button" onClick={() => setError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#991b1b' }}>&times;</button>
        </div>
      )}

      {/* ══════ STEP 1: INPUT ══════ */}
      {step === 'input' && (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ padding: 20, background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 14, color: '#fff' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 800 }}>AI Course Generator</h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
              Describe your learning outcomes and we'll build a complete course — units, lesson plans, quizzes, and game assignments — in under a minute.
            </p>
          </div>

          {/* Course Name */}
          <div>
            <label htmlFor="cg-name" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Course Name *</label>
            <input id="cg-name" value={courseName} onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Grade 3 Fractions Mastery" aria-required="true"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="cg-desc" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>Course Description (optional)</label>
            <RichTextEditor value={description} onChange={setDescription}
              placeholder="Brief overview of what this course covers..."
              compact minHeight={60} />
          </div>

          {/* Row: Grade + Type + Weeks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label htmlFor="cg-grade" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Grade Level</label>
              <select id="cg-grade" value={gradeId} onChange={(e) => { setGradeId(e.target.value); setSelectedTeks([]); }}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                {TEKS_GRADES.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cg-type" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Class Type</label>
              <select id="cg-type" value={classType} onChange={(e) => setClassType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <option value="staar">STAAR Prep</option>
                <option value="texes">TExES Prep</option>
              </select>
            </div>
            <div>
              <label htmlFor="cg-weeks" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Duration (weeks)</label>
              <select id="cg-weeks" value={numWeeks} onChange={(e) => setNumWeeks(Number(e.target.value))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                {[1, 2, 3, 4, 6, 8, 9, 12].map((w) => <option key={w} value={w}>{w} week{w > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Learning Outcomes *
            </label>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>What should students know or be able to do by the end?</p>
            {outcomes.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={o} onChange={(e) => updateOutcome(i, e.target.value)}
                  placeholder={`e.g. ${['Understand fraction equivalence', 'Add and subtract fractions with like denominators', 'Compare fractions using visual models', 'Solve word problems involving fractions'][i] || 'Enter a learning outcome...'}`}
                  aria-label={`Learning outcome ${i + 1}`}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
                {outcomes.length > 1 && (
                  <button type="button" onClick={() => removeOutcome(i)} aria-label={`Remove outcome ${i + 1}`}
                    style={{ padding: '0 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOutcome}
              style={{ padding: '8px 14px', borderRadius: 8, border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              + Add Outcome
            </button>
          </div>

          {/* TEKS Standards */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
              TEKS Standards (optional — AI will align automatically)
            </label>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8 }}>
              {availableStandards.length === 0 ? (
                <div style={{ padding: 12, color: '#94a3b8', fontSize: 12 }}>Select a grade level above</div>
              ) : (
                availableStandards.map((std) => (
                  <label key={std.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 12, lineHeight: 1.4, background: selectedTeks.includes(std.id) ? '#eff6ff' : 'transparent' }}>
                    <input type="checkbox" checked={selectedTeks.includes(std.id)} onChange={() => toggleTeks(std.id)}
                      style={{ marginTop: 2, accentColor: '#2563eb' }} />
                    <span><strong>{std.id}</strong> — {std.description.slice(0, 100)}{std.description.length > 100 ? '...' : ''}</span>
                  </label>
                ))
              )}
            </div>
            {selectedTeks.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#2563eb', fontWeight: 600 }}>{selectedTeks.length} standard{selectedTeks.length > 1 ? 's' : ''} selected</div>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeQuizzes} onChange={(e) => setIncludeQuizzes(e.target.checked)} style={{ accentColor: '#2563eb' }} />
              Include unit quizzes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeAssignments} onChange={(e) => setIncludeAssignments(e.target.checked)} style={{ accentColor: '#2563eb' }} />
              Include game assignments
            </label>
          </div>

          {/* Generate Button */}
          <button type="button" onClick={handleGenerate}
            disabled={!courseName.trim() || outcomes.every((o) => !o.trim())}
            style={{
              width: '100%', padding: '16px 24px', borderRadius: 12, border: 'none',
              background: (!courseName.trim() || outcomes.every((o) => !o.trim())) ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: '#fff', fontSize: 16, fontWeight: 800, cursor: (!courseName.trim() || outcomes.every((o) => !o.trim())) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
              transition: 'all 0.2s',
            }}>
            Generate Complete Course with AI
          </button>
        </div>
      )}

      {/* ══════ STEP 2: GENERATING ══════ */}
      {step === 'generating' && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">{PIPELINE_STAGES[pipelineStage]?.icon || '\uD83D\uDCCB'}</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Building Your Course...</h2>
          <p style={{ margin: '0 0 32px', fontSize: 14, color: '#64748b' }}>{PIPELINE_STAGES[pipelineStage]?.label || 'Processing...'}</p>

          <div aria-live="polite" role="status" style={{ maxWidth: 400, margin: '0 auto' }}>
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.key} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8,
                marginBottom: 4, transition: 'all 0.3s',
                background: i === pipelineStage ? '#eff6ff' : i < pipelineStage ? '#f0fdf4' : '#f8fafc',
                border: i === pipelineStage ? '1px solid #bfdbfe' : '1px solid transparent',
              }}>
                <span style={{ fontSize: 18 }} aria-hidden="true">
                  {i < pipelineStage ? '\u2705' : i === pipelineStage ? '\u23F3' : '\u2B55'}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: i === pipelineStage ? 700 : 500,
                  color: i <= pipelineStage ? '#0f172a' : '#94a3b8',
                }}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
            This typically takes 30-60 seconds depending on course size
          </p>
        </div>
      )}

      {/* ══════ STEP 3: PREVIEW ══════ */}
      {step === 'preview' && course && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Course Summary */}
          <div style={{
            padding: 20, background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', borderRadius: 14, color: '#fff',
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800 }}>{course.title}</h2>
            <p style={{ margin: '0 0 12px', fontSize: 13, opacity: 0.8 }}>{course.overview}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Weeks', value: course.totalWeeks },
                { label: 'Units', value: (course.modules || []).length },
                { label: 'Lessons', value: course.totalLessons },
                { label: 'Quiz Qs', value: course.totalQuizQuestions },
                { label: 'Games', value: course.totalAssignments },
              ].map((s) => (
                <div key={s.label} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Modules */}
          {(course.modules || []).map((mod) => (
            <div key={mod.unitNumber} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              {/* Module Header */}
              <div style={{
                padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Unit {mod.unitNumber}: {mod.title}
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    Week {mod.weekStart}{mod.weekEnd !== mod.weekStart ? `–${mod.weekEnd}` : ''} &middot; {mod.focus}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(mod.teksAligned || []).map((t) => (
                    <span key={t} style={{ padding: '2px 8px', borderRadius: 4, background: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 700 }}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Lessons */}
              <div style={{ padding: '10px 18px' }}>
                {(mod.lessons || []).map((lesson, i) => (
                  <div key={i} style={{
                    padding: '12px 0', borderBottom: i < (mod.lessons || []).length - 1 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {lesson.title}
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{lesson.duration}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>{lesson.objective}</div>

                    {/* Lesson Plan Details (collapsible-style) */}
                    {lesson.warmUp && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 6, marginTop: 6 }}>
                        {[
                          { label: 'Warm-up', val: lesson.warmUp?.activity || lesson.warmUp?.description },
                          { label: 'Direct Instruction', val: lesson.directInstruction?.steps?.[0] },
                          { label: 'Guided Practice', val: lesson.guidedPractice?.activity },
                          { label: 'Independent Practice', val: lesson.independentPractice?.activity },
                          { label: 'Closure', val: lesson.closure?.exitTicket },
                        ].filter((x) => x.val).map((x) => (
                          <div key={x.label} style={{ padding: '6px 8px', borderRadius: 6, background: '#f8fafc', fontSize: 11 }}>
                            <div style={{ fontWeight: 700, color: '#64748b', fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{x.label}</div>
                            <div style={{ color: '#0f172a' }}>{typeof x.val === 'string' ? x.val.slice(0, 80) : ''}{typeof x.val === 'string' && x.val.length > 80 ? '...' : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Differentiation */}
                    {lesson.differentiation && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        {Object.entries(lesson.differentiation).map(([level, desc]) => (
                          <span key={level} style={{
                            padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                            background: level === 'advanced' ? '#faf5ff' : level === 'approaching' ? '#fff7ed' : '#f0fdf4',
                            color: level === 'advanced' ? '#7c3aed' : level === 'approaching' ? '#c2410c' : '#15803d',
                          }}>
                            {level}: {typeof desc === 'string' ? desc.slice(0, 40) : ''}...
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Quiz Preview */}
                {mod.quiz && (mod.quiz.questions || []).length > 0 && (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>
                      {mod.quiz.quizTitle} ({mod.quiz.totalPoints || (mod.quiz.questions || []).length} pts)
                    </div>
                    <div style={{ fontSize: 12, color: '#78350f' }}>
                      {(mod.quiz.questions || []).length} questions
                      ({(mod.quiz.questions || []).filter((q) => q.type === 'multiple-choice').length} MC,
                      {' '}{(mod.quiz.questions || []).filter((q) => q.type === 'true-false').length} T/F,
                      {' '}{(mod.quiz.questions || []).filter((q) => q.type === 'open-ended').length} OE)
                    </div>
                  </div>
                )}

                {/* Game Assignments */}
                {(mod.assignments || []).length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {mod.assignments.map((a, i) => (
                      <div key={i} style={{
                        padding: '6px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0',
                        fontSize: 12, fontWeight: 600, color: '#15803d', display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <span aria-hidden="true">{'\uD83C\uDFAE'}</span> {a.gameName} — {a.purpose?.slice(0, 40)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pacing & Differentiation */}
          {(course.pacing || course.differentiationStrategy) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {course.pacing && (
                <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Pacing Guide</div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{course.pacing}</div>
                </div>
              )}
              {course.differentiationStrategy && (
                <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Differentiation Strategy</div>
                  <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{course.differentiationStrategy}</div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => setStep('input')}
              style={{ flex: 1, padding: '14px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Start Over
            </button>
            <button type="button" onClick={handleDeploy} disabled={deploying}
              style={{
                flex: 2, padding: '14px 20px', borderRadius: 10, border: 'none',
                background: deploying ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontSize: 15, fontWeight: 800, cursor: deploying ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
              }}>
              {deploying ? 'Creating...' : 'Create Class & Populate Everything'}
            </button>
          </div>
        </div>
      )}

      {/* ══════ STEP 4: DEPLOYED ══════ */}
      {step === 'deploy' && deployedClass && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }} aria-hidden="true">{'\uD83C\uDF89'}</div>
          <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>Course Created!</h2>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b' }}>
            Your complete course has been deployed as a class with all modules, lessons, quizzes, and game assignments.
          </p>

          <div style={{
            display: 'inline-block', padding: '16px 32px', borderRadius: 12,
            background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 24,
          }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Join Code</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', letterSpacing: 2 }}>{deployedClass.joinCode}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 300, margin: '0 auto 24px' }}>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#eff6ff' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{course?.totalLessons || 0}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Lessons</div>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#f0fdf4' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>{course?.totalQuizQuestions || 0}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>Quiz Questions</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button type="button" onClick={() => navigate(`/teacher-class/${deployedClass.id}`)}
              style={{
                padding: '14px 28px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>
              Go to Class
            </button>
            <button type="button" onClick={() => { setCourse(null); setDeployedClass(null); setStep('input'); setCourseName(''); setDescription(''); setOutcomes(['']); }}
              style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
