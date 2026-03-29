import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getClasses, saveClasses, getTeacherProfile, generateClassCode, getAssignments, saveAssignments, populateCourseContent } from '../utils/storage';
import { TEKS_GRADES, getStandardsByGrade } from '../data/teks';
import { getGamesByGrade, getGamesByTeks, GAMES_CATALOG } from '../data/games';
import { getDomainsForExam } from '../data/texes-questions';
import { TEXES_EXAM_OPTIONS, getContentGradeIdForExam, getGradeIdForExam, getExamLabel } from '../data/texesExams';
import TeacherLayout from '../components/TeacherLayout';
import RichTextEditor from '../components/RichTextEditor';
import { showAppToast } from '../utils/appToast';

const TOTAL_STEPS = 6;

const ClassWizard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('quantegy-teacher-user');
  const profile = username ? getTeacherProfile(username) : null;
  const [step, setStep] = useState(1);

  // Step 1: Class type (STAAR vs TEXES)
  const [classType, setClassType] = useState(null); // 'staar' | 'texes'
  // When TExES: which certification exam (id from TEXES_EXAM_OPTIONS)
  const [texesExamType, setTexesExamType] = useState('math712');

  // Step 2: Class info
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');

  // Step 2: Grade level
  const defaultGrade = profile?.grades?.[0] || 'grade3';
  const [gradeLevel, setGradeLevel] = useState(defaultGrade);

  // Step 3: Standards (TEKS for STAAR, domains for TEXES)
  const [selectedTeks, setSelectedTeks] = useState([]);
  const [selectedTeksDomains, setSelectedTeksDomains] = useState([]);

  // Step 4: Games
  const [selectedGames, setSelectedGames] = useState([]);
  const [wizardAutoGrade, setWizardAutoGrade] = useState({}); // { [gameId]: boolean }

  // AI Curriculum Builder (step 3)
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumResult, setCurriculumResult] = useState(null);

  // Step 5: Students
  const [studentNames, setStudentNames] = useState(['', '', '']);

  useEffect(() => {
    if (!username) navigate('/teacher');
  }, [username, navigate]);

  const standards = getStandardsByGrade(gradeLevel);
  const availableGames = getGamesByGrade(gradeLevel);
  // STAAR: games aligned to selected TEKS
  const staarAlignedGames = selectedTeks.length > 0
    ? availableGames.filter((g) => {
        const gameTeks = g.teksByGrade?.[gradeLevel] || [];
        return selectedTeks.some((t) => gameTeks.includes(t));
      })
    : availableGames;
  const texesDomainsList = getDomainsForExam(texesExamType);
  const texesGameGrade = getGradeIdForExam(texesExamType);
  // TEXES: games from selected domains (each domain has a games array)
  const texesAlignedGames = selectedTeksDomains.length > 0
    ? [...new Set(selectedTeksDomains.flatMap((d) => texesDomainsList.find((x) => x.id === d)?.games || []))]
        .map((gid) => GAMES_CATALOG.find((g) => g.id === gid))
        .filter(Boolean)
    : GAMES_CATALOG.filter((g) => g.grades?.includes(texesGameGrade));
  const alignedGames = classType === 'texes' ? texesAlignedGames : staarAlignedGames;

  const toggleTeks = (id) => {
    setSelectedTeks((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };
  const toggleTeksDomain = (id) => {
    setSelectedTeksDomains((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const toggleGame = (gameId) => {
    setSelectedGames((prev) => prev.includes(gameId) ? prev.filter((g) => g !== gameId) : [...prev, gameId]);
  };

  const addStudentRow = () => setStudentNames((prev) => [...prev, '']);
  const updateStudent = (idx, val) => {
    setStudentNames((prev) => prev.map((s, i) => i === idx ? val : s));
  };
  const removeStudent = (idx) => {
    setStudentNames((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = async () => {
    const classes = getClasses();
    const gradeLabelObj = classType === 'texes'
      ? { label: getExamLabel(texesExamType) }
      : TEKS_GRADES.find((g) => g.id === gradeLevel);
    const students = studentNames
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name, i) => ({ id: `s${i}-${Date.now()}`, name }));

    const existingClasses = classes;
    let joinCode;
    do {
      joinCode = generateClassCode();
    } while (existingClasses.some((c) => c.joinCode === joinCode));

    const classGradeId = classType === 'texes' ? getGradeIdForExam(texesExamType) : gradeLevel;
    const newClass = {
      id: `class-${Date.now()}`,
      name: className.trim(),
      description: classDescription,
      classType: classType || 'staar',
      gradeLevel: gradeLabelObj?.label || (classType === 'texes' ? getExamLabel(texesExamType) : gradeLevel),
      gradeId: classGradeId,
      teksStandards: classType === 'texes' ? [] : selectedTeks,
      texesDomains: classType === 'texes' ? selectedTeksDomains : [],
      games: selectedGames,
      joinCode,
      students: students.length > 0 ? students : [],
      teacher: username,
      createdAt: new Date().toISOString(),
    };

    saveClasses([...classes, newClass]);

    if (selectedGames.length > 0) {
      const existingAssignments = getAssignments();
      const assignGradeId = classType === 'texes'
        ? (isTexesEc6 ? 'grade-ec6' : isTexesMath48 ? 'grade4-8' : 'algebra')
        : (gradeLevel === 'discrete' ? 'algebra' : gradeLevel);
      const newAssignments = selectedGames.map((gameId, idx) => {
        const game = GAMES_CATALOG.find((g) => g.id === gameId);
        if (!game) return null;
        const gameTeks = classType === 'texes' ? (game.teksByGrade?.[assignGradeId] || game.teksByGrade?.algebra || []) : (game.teksByGrade?.[gradeLevel] || []);
        return {
          id: `a-${Date.now()}-${idx}`,
          name: game.name,
          classId: newClass.id,
          gameId: game.id,
          gamePath: game.path,
          teks: gameTeks,
          focusTeks: classType === 'texes' ? selectedTeksDomains.sort().join(',') : null,
          autoGrade: wizardAutoGrade[gameId] !== undefined ? wizardAutoGrade[gameId] : true,
        };
      }).filter(Boolean);
      saveAssignments([...existingAssignments, ...newAssignments]);
    }

    // Auto-populate pre-built lesson content
    const contentGradeId = classType === 'texes' ? getContentGradeIdForExam(texesExamType) : gradeLevel;
    try {
      await populateCourseContent(newClass.id, contentGradeId);
    } catch (e) {
      console.warn('Auto-populate content skipped:', e);
    }

    navigate(`/teacher-class/${newClass.id}`);
  };

  const canNext = () => {
    if (step === 1) return classType != null;
    if (step === 2) return className.trim().length > 0;
    if (step === 3) return true;
    if (step === 4) return true; // standards are optional
    if (step === 5) return true; // games are optional
    return true;
  };

  return (
    <TeacherLayout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Back link */}
        <Link to="/teacher-dashboard" style={{
          color: '#2563eb', textDecoration: 'none', fontSize: 14, fontWeight: 600,
          display: 'inline-block', marginBottom: 20,
        }}>
          &larr; Back to Dashboard
        </Link>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i + 1 <= step ? '#2563eb' : '#e2e8f0',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: '#64748b' }}>
          Step {step} of {TOTAL_STEPS}
        </p>

        <div style={{
          background: '#fff', borderRadius: 16, padding: '32px 28px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
        }}>

          {/* ── Step 1: What are you teaching? (STAAR vs TEXES) ── */}
          {step === 1 && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>What are you teaching?</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Teachers usually teach one or the other. Choose the type of class you&apos;re building.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => { setClassType('staar'); setSelectedTeks([]); setSelectedTeksDomains([]); setSelectedGames([]); }}
                  style={{
                    padding: '24px 20px', borderRadius: 14, cursor: 'pointer',
                    border: classType === 'staar' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: classType === 'staar' ? '#eff6ff' : '#fff',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📋</span>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>STAAR</span>
                  <span style={{ display: 'block', fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                    K–12 student math • TEKS standards • STAAR test prep
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setClassType('texes'); setSelectedTeks([]); setSelectedTeksDomains([]); setSelectedGames([]); setGradeLevel('algebra'); }}
                  style={{
                    padding: '24px 20px', borderRadius: 14, cursor: 'pointer',
                    border: classType === 'texes' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                    background: classType === 'texes' ? '#faf5ff' : '#fff',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🎓</span>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>TExES</span>
                  <span style={{ display: 'block', fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                    Teacher certification • Math 7–12 (235) • Exam prep
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Class Name & Description ── */}
          {step === 2 && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Name Your Class</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Give your class a name and optional description.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Class Name *</label>
                <input
                  type="text"
                  placeholder={classType === 'texes' ? 'e.g. TExES Math 7-12 Prep' : 'e.g. 3rd Period Math'}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <RichTextEditor
                  value={classDescription}
                  onChange={setClassDescription}
                  placeholder={classType === 'texes' ? 'e.g. Teacher certification prep cohort' : 'e.g. Grade 3 math class, focus on multiplication'}
                  compact minHeight={60}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Grade Level (STAAR) or TExES info ── */}
          {step === 3 && classType === 'staar' && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Select Grade Level</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                This determines which TEKS standards and games are available.
              </p>
              <div style={{ display: 'grid', gap: 10 }}>
                {TEKS_GRADES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => { setGradeLevel(g.id); setSelectedTeks([]); setSelectedGames([]); }}
                    style={{
                      padding: '18px 20px', borderRadius: 12, cursor: 'pointer',
                      border: gradeLevel === g.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: gradeLevel === g.id ? '#eff6ff' : '#fff',
                      textAlign: 'left', fontSize: 16, fontWeight: 600, color: '#0f172a',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ display: 'block' }}>{g.label}</span>
                    <span style={{ display: 'block', fontSize: 13, color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                      {g.subject} &bull; TEKS aligned
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && classType === 'texes' && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Choose TExES Certification Exam</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Select which certification exam your class will use. Next, you’ll pick competency domains to focus on. Each exam has a prep course and practice tests at TExES Prep.
              </p>
              <div style={{ maxHeight: 400, overflowY: 'auto', display: 'grid', gap: 8, paddingRight: 4 }}>
                {TEXES_EXAM_OPTIONS.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                      setTexesExamType(ex.id);
                      setSelectedTeksDomains([]);
                      setSelectedGames([]);
                    }}
                    style={{
                      padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                      border: texesExamType === ex.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: texesExamType === ex.id ? '#eff6ff' : '#fff',
                      textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#0f172a',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ display: 'block' }}>{ex.label}</span>
                    <span style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 400, marginTop: 2 }}>
                      {ex.examLabel} &bull; {ex.questions} questions &bull; {ex.domains} domains
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Select Standards (TEKS for STAAR, domains for TEXES) ── */}
          {step === 4 && classType === 'staar' && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Focus TEKS Standards</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
                Select the TEKS standards you want to focus on.
                Games and assessments will align to these. You can skip this for now.
              </p>
              {selectedTeks.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={async () => {
                      setCurriculumLoading(true);
                      setCurriculumResult(null);
                      try {
                        const res = await fetch('/api/generate-curriculum', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            gradeLevel,
                            teksStandards: selectedTeks,
                            learningOutcomes: standards.filter(s => selectedTeks.includes(s.id)).map(s => s.description),
                          }),
                        });
                        const data = await res.json();
                        if (data.success) setCurriculumResult(data.content);
                        else setCurriculumResult('Error: ' + (data.error || 'Unknown'));
                      } catch (e) {
                        setCurriculumResult('Error: ' + e.message);
                      } finally {
                        setCurriculumLoading(false);
                      }
                    }}
                    disabled={curriculumLoading}
                    style={{
                      padding: '10px 18px', borderRadius: 10, border: '1px solid #7c3aed',
                      background: curriculumLoading ? '#f1f5f9' : 'linear-gradient(135deg,#a855f7,#7c3aed)',
                      color: '#fff', fontWeight: 700, fontSize: 13, cursor: curriculumLoading ? 'default' : 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                    }}
                  >
                    {curriculumLoading ? '⏳ Generating...' : '🤖 AI Curriculum Builder'}
                  </button>
                  {curriculumResult && (
                    <div style={{
                      marginTop: 12, padding: 16, background: '#faf5ff', border: '1px solid #e9d5ff',
                      borderRadius: 10, maxHeight: 280, overflowY: 'auto', fontSize: 13, color: '#334155',
                      whiteSpace: 'pre-wrap', lineHeight: 1.6,
                    }}>
                      {curriculumResult}
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button type="button" onClick={() => setSelectedTeks(standards.map((s) => s.id))}
                  style={pillBtnStyle}>Select All</button>
                <button type="button" onClick={() => setSelectedTeks([])}
                  style={pillBtnStyle}>Clear</button>
                <span style={{ fontSize: 13, color: '#64748b', alignSelf: 'center', marginLeft: 4 }}>
                  {selectedTeks.length} of {standards.length} selected
                </span>
              </div>
              <div style={{
                maxHeight: 340, overflowY: 'auto', border: '1px solid #e2e8f0',
                borderRadius: 10, padding: 4,
              }}>
                {standards.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleTeks(s.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                      padding: '10px 12px', border: 'none', borderRadius: 8,
                      background: selectedTeks.includes(s.id) ? '#eff6ff' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#0f172a',
                      transition: 'background 0.1s',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: selectedTeks.includes(s.id) ? '2px solid #2563eb' : '2px solid #cbd5e1',
                      background: selectedTeks.includes(s.id) ? '#2563eb' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, fontWeight: 700,
                    }}>
                      {selectedTeks.includes(s.id) && '\u2713'}
                    </span>
                    <div>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>{s.id}</span>
                      <span style={{ marginLeft: 6, color: '#475569' }}>
                        {s.description.length > 90 ? s.description.slice(0, 90) + '...' : s.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && classType === 'texes' && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Focus Competency Domains</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                Select the TExES domains to focus on. Games and practice will align to these.
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button type="button" onClick={() => setSelectedTeksDomains(texesDomainsList.map((d) => d.id))}
                  style={pillBtnStyle}>Select All</button>
                <button type="button" onClick={() => setSelectedTeksDomains([])}
                  style={pillBtnStyle}>Clear</button>
                <span style={{ fontSize: 13, color: '#64748b', alignSelf: 'center', marginLeft: 4 }}>
                  {selectedTeksDomains.length} of {texesDomainsList.length} selected
                </span>
              </div>
              <div style={{
                maxHeight: 340, overflowY: 'auto', border: '1px solid #e2e8f0',
                borderRadius: 10, padding: 4,
              }}>
                {texesDomainsList.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleTeksDomain(d.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%',
                      padding: '10px 12px', border: 'none', borderRadius: 8,
                      background: selectedTeksDomains.includes(d.id) ? '#faf5ff' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', fontSize: 13, color: '#0f172a',
                      transition: 'background 0.1s',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                      border: selectedTeksDomains.includes(d.id) ? '2px solid #7c3aed' : '2px solid #cbd5e1',
                      background: selectedTeksDomains.includes(d.id) ? '#7c3aed' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12, fontWeight: 700,
                    }}>
                      {selectedTeksDomains.includes(d.id) && '\u2713'}
                    </span>
                    <div>
                      <span style={{ fontWeight: 700, color: '#7c3aed' }}>{d.name}</span>
                      <span style={{ marginLeft: 6, color: '#475569' }}>{d.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 5: Assign Games ── */}
          {step === 5 && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Assign Games</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
                {classType === 'texes'
                  ? (selectedTeksDomains.length > 0
                    ? `Showing games aligned to your ${selectedTeksDomains.length} selected domain${selectedTeksDomains.length !== 1 ? 's' : ''}.`
                    : 'All TExES-aligned games. Select domains in the previous step to filter.')
                  : (selectedTeks.length > 0
                    ? `Showing games aligned to your ${selectedTeks.length} selected standard${selectedTeks.length !== 1 ? 's' : ''}.`
                    : 'All games available for this grade level. Select standards in the previous step to filter.')}
              </p>
              {alignedGames.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', background: '#f8fafc', borderRadius: 10 }}>
                  <p style={{ color: '#94a3b8' }}>No games match the selected standards.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {alignedGames.map((game) => {
                    const isSelected = selectedGames.includes(game.id);
                    const gameTeks = classType === 'texes' ? [] : (game.teksByGrade?.[gradeLevel] || []);
                    const matchingTeks = classType === 'texes'
                      ? selectedTeksDomains.filter((d) => texesDomainsList.find((x) => x.id === d)?.games?.includes(game.id))
                      : (selectedTeks.length > 0 ? gameTeks.filter((t) => selectedTeks.includes(t)) : gameTeks);
                    const autoGradeOn = wizardAutoGrade[game.id] !== undefined ? wizardAutoGrade[game.id] : true;
                    return (
                      <div key={game.id} style={{
                        borderRadius: 12,
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#fff',
                        transition: 'all 0.15s',
                        overflow: 'hidden',
                      }}>
                        <button
                          type="button"
                          onClick={() => toggleGame(game.id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%',
                            padding: '16px 18px', paddingBottom: isSelected ? 8 : 16,
                            border: 'none', background: 'transparent',
                            cursor: 'pointer', textAlign: 'left',
                          }}
                        >
                          <span style={{
                            width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
                            border: isSelected ? '2px solid #2563eb' : '2px solid #cbd5e1',
                            background: isSelected ? '#2563eb' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: 13, fontWeight: 700,
                          }}>
                            {isSelected && '\u2713'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
                              {game.name}
                            </div>
                            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 6 }}>
                              {game.description}
                            </div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {matchingTeks.slice(0, 6).map((t) => (
                                <span key={t} style={{
                                  padding: '2px 8px', background: classType === 'texes' ? '#f3e8ff' : '#e8f0fe',
                                  color: classType === 'texes' ? '#7c3aed' : '#1a5cba',
                                  borderRadius: 4, fontSize: 11, fontWeight: 600,
                                }}>
                                  {classType === 'texes' ? texesDomainsList.find((d) => d.id === t)?.name || t : t}
                                </span>
                              ))}
                              {matchingTeks.length > 6 && (
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>+{matchingTeks.length - 6} more</span>
                              )}
                            </div>
                          </div>
                        </button>
                        {/* Auto-grade toggle — only shown when game is selected */}
                        {isSelected && (
                          <div style={{
                            padding: '6px 18px 14px 54px',
                            display: 'flex', alignItems: 'center', gap: 8,
                          }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setWizardAutoGrade((prev) => ({ ...prev, [game.id]: !autoGradeOn })); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '3px 10px', border: 'none', borderRadius: 8,
                                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                background: autoGradeOn ? '#ecfdf5' : '#f1f5f9',
                                color: autoGradeOn ? '#065f46' : '#64748b',
                                transition: 'all 0.15s',
                              }}
                              title={autoGradeOn
                                ? 'Scores will be recorded automatically when students play. Click to switch to manual grading.'
                                : 'You will enter scores manually. Click to enable auto-grading from game play.'}
                            >
                              <span style={{
                                position: 'relative', display: 'inline-block',
                                width: 28, height: 16, borderRadius: 8,
                                background: autoGradeOn ? '#22c55e' : '#cbd5e1',
                                transition: 'background 0.2s',
                              }}>
                                <span style={{
                                  position: 'absolute', top: 2,
                                  left: autoGradeOn ? 14 : 2,
                                  width: 12, height: 12, borderRadius: '50%',
                                  background: '#fff', transition: 'left 0.2s',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                }} />
                              </span>
                              {autoGradeOn ? 'Auto-graded' : 'Manual grading'}
                            </button>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              {autoGradeOn ? 'Scores recorded from game play' : 'Teacher enters scores manually'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Step 6: Review & Create ── */}
          {step === 6 && (
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22 }}>Review & Create</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
                Confirm your class details and add students.
              </p>

              {/* Summary */}
              <div style={{
                padding: '18px 20px', background: '#f8fafc', borderRadius: 10,
                border: '1px solid #e2e8f0', marginBottom: 24,
              }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Class Name</span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{className}</div>
                </div>
                {classDescription && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Description</span>
                    <div style={{ fontSize: 14, color: '#475569' }}>{classDescription}</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Type</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {classType === 'texes' ? getExamLabel(texesExamType) : 'STAAR'}
                    </div>
                  </div>
                  {classType === 'staar' && (
                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Grade Level</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {TEKS_GRADES.find((g) => g.id === gradeLevel)?.label}
                      </div>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{classType === 'texes' ? 'Domains' : 'Standards'}</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {classType === 'texes' ? (selectedTeksDomains.length || 'None selected') : (selectedTeks.length || 'None selected')}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Games</span>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {selectedGames.length || 'None assigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Students */}
              <label style={labelStyle}>Students</label>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12, marginTop: 0 }}>
                Add student names manually, or import a CSV / paste a list.
              </p>

              {/* CSV Import */}
              <div style={{
                padding: 16, background: '#f0f9ff', borderRadius: 10, border: '1px dashed #93c5fd',
                marginBottom: 16, textAlign: 'center',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>
                  📂 Import from CSV
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px' }}>
                  Upload a .csv or .txt file with one student name per line, or a column named "Name" / "Student".
                </p>
                <input type="file" accept=".csv,.txt,.xlsx" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const text = ev.target.result;
                    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                    if (lines.length === 0) return;
                    const header = lines[0].toLowerCase();
                    let names = [];
                    if (header.includes(',') && (header.includes('name') || header.includes('student'))) {
                      const cols = lines[0].split(',').map(c => c.trim().toLowerCase());
                      const nameIdx = cols.findIndex(c => c === 'name' || c === 'student' || c === 'student name' || c === 'first name');
                      const lastIdx = cols.findIndex(c => c === 'last name' || c === 'last');
                      if (nameIdx >= 0) {
                        for (let i = 1; i < lines.length; i++) {
                          const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
                          let n = parts[nameIdx] || '';
                          if (lastIdx >= 0 && parts[lastIdx]) n += ' ' + parts[lastIdx];
                          if (n.trim()) names.push(n.trim());
                        }
                      } else {
                        names = lines.slice(1).map(l => l.split(',')[0].trim().replace(/^["']|["']$/g, '')).filter(Boolean);
                      }
                    } else {
                      names = lines.filter(l => l.toLowerCase() !== 'name' && l.toLowerCase() !== 'student');
                    }
                    if (names.length > 0) {
                      setStudentNames(names);
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = '';
                }} style={{ fontSize: 12 }} />
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
                {studentNames.map((name, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', width: 24, textAlign: 'right', flexShrink: 0 }}>{i+1}.</span>
                    <input
                      type="text"
                      placeholder={`Student ${i + 1}`}
                      value={name}
                      onChange={(e) => updateStudent(i, e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {studentNames.length > 1 && (
                      <button type="button" onClick={() => removeStudent(i)} style={{
                        width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#fff', cursor: 'pointer', fontSize: 16, color: '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>&times;</button>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={addStudentRow} style={{
                  ...pillBtnStyle, fontSize: 13, marginBottom: 0,
                }}>+ Add Student</button>
                {studentNames.length > 0 && (
                  <span style={{ fontSize: 12, color: '#64748b', alignSelf: 'center' }}>
                    {studentNames.filter(n => n.trim()).length} student{studentNames.filter(n => n.trim()).length !== 1 ? 's' : ''} added
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} style={{
                padding: '12px 24px', background: '#f1f5f9', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}>
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => {
                  if (canNext()) setStep(step + 1);
                  else showAppToast('Please fill in the required fields', { type: 'warning' });
                }}
                style={{
                  flex: 1, padding: '12px 0', background: '#2563eb', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', opacity: canNext() ? 1 : 0.5,
                }}
              >
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleCreate} style={{
                flex: 1, padding: '12px 0', background: '#22c55e', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                cursor: 'pointer',
              }}>
                Create Class
              </button>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6,
};

const inputStyle = {
  width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 8,
  border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box',
};

const pillBtnStyle = {
  padding: '6px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0',
  borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569',
};

export default ClassWizard;
