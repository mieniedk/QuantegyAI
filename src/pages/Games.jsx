import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TEKS_GRADES, TEKS_STANDARDS } from '../data/teks';
import { GAMES_CATALOG } from '../data/games';
import { SUBJECTS, getGradesBySubject } from '../data/subjects';

const Games = () => {
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [expandedGame, setExpandedGame] = useState(null);
  const [pickerGrade, setPickerGrade] = useState('all');
  const [pickerStandard, setPickerStandard] = useState('');
  const navigate = useNavigate();

  const gradesForSubject = getGradesBySubject(subjectFilter, TEKS_GRADES);
  const filtered = GAMES_CATALOG.filter((game) => {
    const matchSubject = subjectFilter === 'all' || (game.subject || 'math') === subjectFilter;
    const matchGrade = gradeFilter === 'all' || game.grades.includes(gradeFilter);
    return matchSubject && matchGrade;
  });

  const launchFocused = (gamePath, teksId, teksDesc, grade) => {
    const params = new URLSearchParams();
    params.set('teks', teksId);
    params.set('label', teksId + ': ' + (teksDesc || '').slice(0, 60));
    params.set('desc', teksDesc || '');
    if (grade && grade !== 'all') params.set('grade', grade);
    navigate(gamePath + '?' + params.toString());
  };

  const playAllUrl = (gamePath) => {
    if (gradeFilter !== 'all') return gamePath + '?grade=' + encodeURIComponent(gradeFilter);
    return gamePath;
  };

  const getStandardsForGameGrade = (game, gid) => {
    const teksIds = game.teksByGrade?.[gid] || [];
    const pool = TEKS_STANDARDS[gid] || [];
    return pool.filter((s) => teksIds.includes(s.id));
  };

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <p><Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>← Home</Link></p>
      <h1 style={{ marginBottom: 4 }}>Games Library</h1>
      <p style={{ color: '#64748b', marginBottom: 20, fontSize: 15 }}>
        TEKS-aligned math games. Filter by grade, then pick a game. Use &quot;Pick a standard&quot; to practice a specific TEKS.
      </p>
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: 6, fontWeight: 600, color: '#475569' }}>Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              setGradeFilter('all');
              setExpandedGame(null);
            }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ marginRight: 6, fontWeight: 600, color: '#475569' }}>Grade</label>
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setExpandedGame(null);
            }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
          >
            <option value="all">All grades</option>
            {gradesForSubject.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>
      {subjectFilter === 'science' && (
        <p style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, color: '#0369a1', marginBottom: 20 }}>
          🔬 Science games coming soon! Filter by Mathematics to see available math games.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((game) => {
          const isExpanded = expandedGame === game.id;
          const effectiveGrade = gradeFilter !== 'all' ? gradeFilter : (isExpanded ? pickerGrade : 'all');
          const gradesForPicker = gradeFilter !== 'all' ? [gradeFilter] : game.grades.filter((g) => (game.teksByGrade?.[g] || []).length > 0);
          const standardsForPicker = effectiveGrade !== 'all' ? getStandardsForGameGrade(game, effectiveGrade) : [];

          return (
            <div key={game.id} style={{
              borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{game.name}</p>
                    <p style={{ margin: '6px 0 8px', color: '#475569', fontSize: 14, lineHeight: 1.4 }}>{game.description}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                      {game.grades.map((id) => TEKS_GRADES.find((g) => g.id === id)?.label).filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedGame(isExpanded ? null : game.id);
                        if (!isExpanded) {
                          setPickerGrade(gradeFilter !== 'all' ? gradeFilter : (gradesForPicker[0] || 'all'));
                          setPickerStandard('');
                        }
                      }}
                      style={{
                        padding: '8px 14px', background: '#fef3c7', color: '#92400e',
                        border: '1px solid #fcd34d', borderRadius: 8, cursor: 'pointer',
                        fontSize: 13, fontWeight: 600,
                      }}
                    >
                      🎯 {isExpanded ? 'Hide' : 'Pick a standard'}
                    </button>
                    <Link to={playAllUrl(game.path)} style={{
                      display: 'inline-block', padding: '8px 18px',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: 'white', borderRadius: 8, textDecoration: 'none',
                      fontWeight: 700, fontSize: 14,
                    }}>
                      ▶ Play all
                    </Link>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    {gradeFilter === 'all' && gradesForPicker.length > 0 && (
                      <>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Grade</label>
                        <select
                          value={pickerGrade}
                          onChange={(e) => {
                            setPickerGrade(e.target.value);
                            setPickerStandard('');
                          }}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, minWidth: 140 }}
                        >
                          <option value="all">Select grade</option>
                          {gradesForPicker.map((gid) => (
                            <option key={gid} value={gid}>{TEKS_GRADES.find((g) => g.id === gid)?.label || gid}</option>
                          ))}
                        </select>
                      </>
                    )}
                    {effectiveGrade !== 'all' && standardsForPicker.length > 0 && (
                      <>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Standard</label>
                        <select
                          value={pickerStandard}
                          onChange={(e) => setPickerStandard(e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, minWidth: 120, maxWidth: 280 }}
                        >
                          <option value="">Select standard</option>
                          {standardsForPicker.map((s) => (
                            <option key={s.id} value={s.id} title={s.description}>{s.id}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!pickerStandard}
                          onClick={() => {
                            const std = standardsForPicker.find((s) => s.id === pickerStandard);
                            if (std) launchFocused(game.path, std.id, std.description, effectiveGrade);
                          }}
                          style={{
                            padding: '8px 16px', background: pickerStandard ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : '#e2e8f0',
                            color: pickerStandard ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8, cursor: pickerStandard ? 'pointer' : 'default',
                            fontWeight: 700, fontSize: 13,
                          }}
                        >
                          Practice
                        </button>
                      </>
                    )}
                    {effectiveGrade !== 'all' && standardsForPicker.length === 0 && (
                      <span style={{ fontSize: 13, color: '#64748b' }}>No standards for this grade.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Games;
