import React, { useState, useMemo, useCallback } from 'react';
import {
  QUESTION_TYPES, BLOOM_LEVELS, getQuestionTemplate,
  createAssessment, updateAssessment, getAssessment,
  PROCTORING_LEVELS,
} from '../utils/assessmentEngine';
import { loadBank, queryBank, getBankedTeks } from '../data/testBank';
import RichTextEditor, { RichTextViewer } from './RichTextEditor';

const TABS = ['questions', 'settings', 'preview'];

export default function AssessmentBuilder({ classId, assessmentId, onSave, onCancel }) {
  const existing = assessmentId ? getAssessment(assessmentId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [questions, setQuestions] = useState(existing?.questions || []);
  const [settings, setSettings] = useState(existing?.settings || {
    timeLimit: 0, maxAttempts: 1, shuffleQuestions: false, shuffleOptions: false,
    showFeedback: 'after-submit', showScore: true, allowBacktrack: true,
    requireLockdown: false, proctoringLevel: 'none', passingScore: 60,
    partialCredit: true,
  });
  const [tab, setTab] = useState('questions');
  const [addingType, setAddingType] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankFilter, setBankFilter] = useState({ teks: '', format: '', difficulty: '' });

  const totalPoints = useMemo(() => questions.reduce((s, q) => s + (q.points || 1), 0), [questions]);

  const handleAddQuestion = (type) => {
    const template = getQuestionTemplate(type);
    setQuestions((prev) => [...prev, template]);
    setEditingIdx(questions.length);
    setAddingType(null);
  };

  const handleUpdateQuestion = (idx, updates) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const handleMoveQuestion = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    setQuestions((prev) => {
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
    setEditingIdx(newIdx);
  };

  const handleDuplicate = (idx) => {
    const copy = { ...questions[idx], id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
    setQuestions((prev) => [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
  };

  const handleImportFromBank = useCallback((bankQ) => {
    const mapped = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: bankQ.format === 'multiple-choice' ? 'multiple-choice' : bankQ.format === 'true-false' ? 'true-false' : 'short-answer',
      question: bankQ.question || bankQ.statement || '',
      statement: bankQ.statement || '',
      options: bankQ.options || {},
      correct: bankQ.correct,
      explanation: bankQ.explanation || '',
      points: bankQ.difficulty === 'hard' ? 3 : bankQ.difficulty === 'medium' ? 2 : 1,
      teks: bankQ.teks || '',
      tags: [bankQ.teks, bankQ.difficulty, bankQ.representation].filter(Boolean),
      bloomLevel: bankQ.difficulty === 'hard' ? 'analyze' : bankQ.difficulty === 'medium' ? 'apply' : 'remember',
      source: 'bank',
      bankId: bankQ.id,
    };
    setQuestions((prev) => [...prev, mapped]);
    setBankOpen(false);
  }, []);

  const handleSave = () => {
    const data = { title, description, classId, questions, settings, totalPoints };
    let saved;
    if (assessmentId) {
      saved = updateAssessment(assessmentId, data);
    } else {
      saved = createAssessment(data);
    }
    if (onSave) onSave(saved);
  };

  const bankQuestions = useMemo(() => {
    loadBank();
    return queryBank({
      teks: bankFilter.teks || undefined,
      format: bankFilter.format || undefined,
      difficulty: bankFilter.difficulty || undefined,
    }).slice(0, 50);
  }, [bankFilter]);

  const bankedTeks = useMemo(() => getBankedTeks(), []);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
            {assessmentId ? 'Edit Assessment' : 'New Assessment'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {questions.length} questions &middot; {totalPoints} points
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onCancel && (
            <button type="button" onClick={onCancel} style={btnSecondary}>Cancel</button>
          )}
          <button type="button" onClick={handleSave} disabled={!title.trim() || questions.length === 0}
            style={{ ...btnPrimary, opacity: (!title.trim() || questions.length === 0) ? 0.5 : 1 }}>
            {assessmentId ? 'Update' : 'Create'} Assessment
          </button>
        </div>
      </div>

      {/* Title + Description */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assessment title..."
          aria-label="Assessment title" aria-required="true"
          style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 16, fontWeight: 700 }} />
        <RichTextEditor value={description} onChange={setDescription} placeholder="Instructions for students (optional)... click ∑ for math" compact minHeight={60} />
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 2, borderBottom: '2px solid #e2e8f0', marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            style={{
              padding: '10px 20px', border: 'none', background: tab === t ? '#fff' : 'transparent',
              borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
              color: tab === t ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', marginBottom: -2, textTransform: 'capitalize',
            }}>
            {t} {t === 'questions' && `(${questions.length})`}
          </button>
        ))}
      </div>

      {/* ═══ QUESTIONS TAB ═══ */}
      {tab === 'questions' && (
        <div>
          {/* Question List */}
          {questions.map((q, idx) => (
            <div key={q.id} style={{
              padding: 16, borderRadius: 10, border: editingIdx === idx ? '2px solid #2563eb' : '1px solid #e2e8f0',
              marginBottom: 10, background: '#fff', transition: 'border-color 0.15s',
            }}>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingIdx === idx ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}
                  onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#64748b', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>
                    {QUESTION_TYPES.find((t) => t.id === q.type)?.icon} {QUESTION_TYPES.find((t) => t.id === q.type)?.label}
                  </span>
                  <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.question || q.statement || '(empty)'}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{q.points || 1} pt{(q.points || 1) !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => handleMoveQuestion(idx, -1)} disabled={idx === 0} aria-label="Move up" style={iconBtn}>{'\u2191'}</button>
                  <button type="button" onClick={() => handleMoveQuestion(idx, 1)} disabled={idx === questions.length - 1} aria-label="Move down" style={iconBtn}>{'\u2193'}</button>
                  <button type="button" onClick={() => handleDuplicate(idx)} aria-label="Duplicate" style={iconBtn}>{'\uD83D\uDCCB'}</button>
                  <button type="button" onClick={() => handleRemoveQuestion(idx)} aria-label="Delete" style={{ ...iconBtn, color: '#dc2626' }}>{'\u2715'}</button>
                </div>
              </div>

              {/* Question Editor (expanded) */}
              {editingIdx === idx && (
                <QuestionEditor question={q} onChange={(u) => handleUpdateQuestion(idx, u)} />
              )}
            </div>
          ))}

          {/* Add Question */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            <button type="button" onClick={() => setAddingType(addingType ? null : 'show')}
              style={{ ...btnPrimary, fontSize: 13 }}>
              + Add Question
            </button>
            <button type="button" onClick={() => setBankOpen(!bankOpen)}
              style={{ ...btnSecondary, fontSize: 13 }}>
              Import from Question Bank
            </button>
          </div>

          {/* Type Picker */}
          {addingType && (
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {QUESTION_TYPES.map((t) => (
                <button key={t.id} type="button" onClick={() => handleAddQuestion(t.id)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}>
                  <div style={{ fontSize: 16 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: t.autoGrade ? '#059669' : '#f59e0b' }}>
                    {t.autoGrade ? 'Auto-graded' : 'Manual grading'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Bank Import Panel */}
          {bankOpen && (
            <div style={{ marginTop: 12, padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 800 }}>Question Bank</h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <select value={bankFilter.teks} onChange={(e) => setBankFilter((p) => ({ ...p, teks: e.target.value }))}
                  aria-label="Filter by TEKS" style={selectStyle}>
                  <option value="">All TEKS</option>
                  {bankedTeks.map((t) => <option key={t.teks} value={t.teks}>{t.teks} ({t.count})</option>)}
                </select>
                <select value={bankFilter.format} onChange={(e) => setBankFilter((p) => ({ ...p, format: e.target.value }))}
                  aria-label="Filter by type" style={selectStyle}>
                  <option value="">All Types</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="open-ended">Open Ended</option>
                </select>
                <select value={bankFilter.difficulty} onChange={(e) => setBankFilter((p) => ({ ...p, difficulty: e.target.value }))}
                  aria-label="Filter by difficulty" style={selectStyle}>
                  <option value="">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {bankQuestions.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>No matching questions</p>
                ) : bankQuestions.map((bq) => (
                  <div key={bq.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bq.question || bq.statement}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{bq.teks} &middot; {bq.format} &middot; {bq.difficulty}</div>
                    </div>
                    <button type="button" onClick={() => handleImportFromBank(bq)} style={{ ...btnPrimary, fontSize: 11, padding: '4px 10px' }}>
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ SETTINGS TAB ═══ */}
      {tab === 'settings' && (
        <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
          <SettingsGroup label="Time & Attempts">
            <SettingRow label="Time Limit (minutes)" sub="0 = no limit">
              <input type="number" min={0} value={settings.timeLimit} onChange={(e) => setSettings((p) => ({ ...p, timeLimit: parseInt(e.target.value) || 0 }))}
                style={inputStyle} aria-label="Time limit in minutes" />
            </SettingRow>
            <SettingRow label="Max Attempts" sub="0 = unlimited">
              <input type="number" min={0} value={settings.maxAttempts} onChange={(e) => setSettings((p) => ({ ...p, maxAttempts: parseInt(e.target.value) || 0 }))}
                style={inputStyle} aria-label="Maximum attempts" />
            </SettingRow>
            <SettingRow label="Passing Score (%)">
              <input type="number" min={0} max={100} value={settings.passingScore} onChange={(e) => setSettings((p) => ({ ...p, passingScore: parseInt(e.target.value) || 60 }))}
                style={inputStyle} aria-label="Passing score percentage" />
            </SettingRow>
          </SettingsGroup>

          <SettingsGroup label="Question Display">
            <SettingToggle label="Shuffle question order" checked={settings.shuffleQuestions}
              onChange={(v) => setSettings((p) => ({ ...p, shuffleQuestions: v }))} />
            <SettingToggle label="Shuffle answer options" checked={settings.shuffleOptions}
              onChange={(v) => setSettings((p) => ({ ...p, shuffleOptions: v }))} />
            <SettingToggle label="Allow backtracking" checked={settings.allowBacktrack}
              onChange={(v) => setSettings((p) => ({ ...p, allowBacktrack: v }))} />
            <SettingToggle label="Partial credit for multi-part" checked={settings.partialCredit}
              onChange={(v) => setSettings((p) => ({ ...p, partialCredit: v }))} />
          </SettingsGroup>

          <SettingsGroup label="Feedback">
            <SettingRow label="Show feedback">
              <select value={settings.showFeedback} onChange={(e) => setSettings((p) => ({ ...p, showFeedback: e.target.value }))}
                aria-label="Feedback timing" style={selectStyle}>
                <option value="after-submit">After submission</option>
                <option value="after-each">After each question</option>
                <option value="after-due">After due date</option>
                <option value="never">Never</option>
              </select>
            </SettingRow>
            <SettingToggle label="Show score immediately" checked={settings.showScore}
              onChange={(v) => setSettings((p) => ({ ...p, showScore: v }))} />
          </SettingsGroup>

          <SettingsGroup label="Proctoring">
            <SettingRow label="Proctoring Level">
              <select value={settings.proctoringLevel} onChange={(e) => setSettings((p) => ({ ...p, proctoringLevel: e.target.value }))}
                aria-label="Proctoring level" style={selectStyle}>
                {Object.entries(PROCTORING_LEVELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </SettingRow>
            {settings.proctoringLevel !== 'none' && (
              <div style={{ fontSize: 12, color: '#64748b', padding: '8px 12px', background: '#f1f5f9', borderRadius: 8, marginTop: 4 }}>
                Active features: {PROCTORING_LEVELS[settings.proctoringLevel]?.features.join(', ')}
              </div>
            )}
            <SettingToggle label="Require fullscreen (lockdown)" checked={settings.requireLockdown}
              onChange={(v) => setSettings((p) => ({ ...p, requireLockdown: v }))} />
          </SettingsGroup>
        </div>
      )}

      {/* ═══ PREVIEW TAB ═══ */}
      {tab === 'preview' && (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 24 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>{title || 'Untitled Assessment'}</h3>
          {description && <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b' }}>{description}</p>}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {settings.timeLimit > 0 && <Tag>{'\u23F1\uFE0F'} {settings.timeLimit} min</Tag>}
            <Tag>{'\uD83D\uDCDD'} {questions.length} questions</Tag>
            <Tag>{'\u2B50'} {totalPoints} points</Tag>
            <Tag>Attempts: {settings.maxAttempts || '\u221E'}</Tag>
            {settings.proctoringLevel !== 'none' && <Tag>{'\uD83D\uDD12'} {PROCTORING_LEVELS[settings.proctoringLevel]?.label}</Tag>}
          </div>
          {questions.map((q, idx) => (
            <div key={q.id} style={{ padding: '12px 0', borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Q{idx + 1}. {q.question || q.statement || '(empty)'}
                <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginLeft: 8 }}>({q.points || 1} pt)</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                Type: {QUESTION_TYPES.find((t) => t.id === q.type)?.label}
                {q.teks && <> &middot; TEKS: {q.teks}</>}
                {q.bloomLevel && <> &middot; Bloom: {q.bloomLevel}</>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function QuestionEditor({ question, onChange }) {
  const q = question;
  const type = q.type;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {type !== 'true-false' && (
        <RichTextEditor value={q.question || ''} onChange={(val) => onChange({ question: val })}
          placeholder="Question text... click ∑ for math equations" compact minHeight={60} />
      )}
      {type === 'true-false' && (
        <RichTextEditor value={q.statement || ''} onChange={(val) => onChange({ statement: val })}
          placeholder="Statement (true or false)... click ∑ for math" compact minHeight={60} />
      )}

      {/* Type-specific editors */}
      {type === 'multiple-choice' && <MCEditor q={q} onChange={onChange} />}
      {type === 'select-all' && <SelectAllEditor q={q} onChange={onChange} />}
      {type === 'true-false' && <TFEditor q={q} onChange={onChange} />}
      {type === 'short-answer' && <ShortAnswerEditor q={q} onChange={onChange} />}
      {type === 'fill-blank' && <FillBlankEditor q={q} onChange={onChange} />}
      {type === 'matching' && <MatchingEditor q={q} onChange={onChange} />}
      {type === 'ordering' && <OrderingEditor q={q} onChange={onChange} />}
      {type === 'numeric' && <NumericEditor q={q} onChange={onChange} />}
      {type === 'categorization' && <CategorizationEditor q={q} onChange={onChange} />}
      {type === 'formula' && <FormulaEditor q={q} onChange={onChange} />}
      {type === 'essay' && <EssayEditor q={q} onChange={onChange} />}
      {type === 'file-upload' && <FileUploadEditor q={q} onChange={onChange} />}
      {type === 'url' && <UrlEditor q={q} onChange={onChange} />}
      {type === 'hot-spot' && <HotSpotEditor q={q} onChange={onChange} />}
      {type === 'likert' && <LikertEditor q={q} onChange={onChange} />}

      {/* Common: metadata row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={metaLabel}>Points:
          <input type="number" min={0} value={q.points || 1} onChange={(e) => onChange({ points: parseInt(e.target.value) || 1 })}
            style={{ ...inputStyle, width: 60 }} />
        </label>
        <label style={metaLabel}>TEKS:
          <input value={q.teks || ''} onChange={(e) => onChange({ teks: e.target.value })}
            placeholder="e.g. 3.4A" style={{ ...inputStyle, width: 80 }} />
        </label>
        <label style={metaLabel}>Bloom:
          <select value={q.bloomLevel || 'remember'} onChange={(e) => onChange({ bloomLevel: e.target.value })} style={selectStyle}>
            {BLOOM_LEVELS.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </label>
        {q.type !== 'essay' && q.type !== 'file-upload' && q.type !== 'url' && (
          <label style={metaLabel}>Explanation:
            <input value={q.explanation || ''} onChange={(e) => onChange({ explanation: e.target.value })}
              placeholder="Why is this correct?" style={{ ...inputStyle, width: 200 }} />
          </label>
        )}
      </div>
    </div>
  );
}

function MCEditor({ q, onChange }) {
  const opts = q.options || {};
  const keys = typeof opts === 'object' && !Array.isArray(opts) ? Object.keys(opts) : ['A', 'B', 'C', 'D'];
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {keys.map((k) => (
        <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="radio" name={`mc-${q.id}`} checked={q.correct === k} onChange={() => onChange({ correct: k })}
            aria-label={`Mark ${k} as correct`} />
          <span style={{ fontWeight: 700, fontSize: 13, width: 20 }}>{k}.</span>
          <input value={opts[k] || ''} onChange={(e) => onChange({ options: { ...opts, [k]: e.target.value } })}
            placeholder={`Option ${k}`} style={{ ...inputStyle, flex: 1 }} />
        </div>
      ))}
      <button type="button" onClick={() => {
        const next = String.fromCharCode(65 + keys.length);
        onChange({ options: { ...opts, [next]: '' } });
      }} style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px', width: 'fit-content' }}>+ Add Option</button>
    </div>
  );
}

function SelectAllEditor({ q, onChange }) {
  const opts = q.options || ['', '', '', ''];
  const correct = q.correct || [];
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {opts.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={correct.includes(i)} onChange={() => {
            const newC = correct.includes(i) ? correct.filter((c) => c !== i) : [...correct, i];
            onChange({ correct: newC });
          }} aria-label={`Mark option ${i + 1} as correct`} />
          <input value={opt} onChange={(e) => {
            const newOpts = [...opts]; newOpts[i] = e.target.value; onChange({ options: newOpts });
          }} placeholder={`Option ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
        </div>
      ))}
      <button type="button" onClick={() => onChange({ options: [...opts, ''] })}
        style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px', width: 'fit-content' }}>+ Add Option</button>
    </div>
  );
}

function TFEditor({ q, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
        <input type="radio" checked={q.correct === true} onChange={() => onChange({ correct: true })} /> True
      </label>
      <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 600 }}>
        <input type="radio" checked={q.correct === false} onChange={() => onChange({ correct: false })} /> False
      </label>
    </div>
  );
}

function ShortAnswerEditor({ q, onChange }) {
  const accepted = q.acceptedAnswers || [];
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Correct answer:
        <input value={q.correct || ''} onChange={(e) => onChange({ correct: e.target.value })}
          style={{ ...inputStyle, display: 'block', marginTop: 4, width: '100%' }} />
      </label>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
        Also accepted (comma-separated):
        <input value={accepted.join(', ')} onChange={(e) => onChange({ acceptedAnswers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="alternate answer 1, alternate answer 2" style={{ ...inputStyle, display: 'block', marginTop: 4, width: '100%' }} />
      </label>
    </div>
  );
}

function FillBlankEditor({ q, onChange }) {
  const blanks = q.blanks || [{ correct: '' }];
  return (
    <div>
      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>Use ___ in question text for each blank</p>
      {blanks.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Blank {i + 1}:</span>
          <input value={b.correct} onChange={(e) => {
            const nb = [...blanks]; nb[i] = { ...nb[i], correct: e.target.value }; onChange({ blanks: nb });
          }} placeholder="Correct answer" style={{ ...inputStyle, flex: 1 }} />
        </div>
      ))}
      <button type="button" onClick={() => onChange({ blanks: [...blanks, { correct: '' }] })}
        style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px' }}>+ Add Blank</button>
    </div>
  );
}

function MatchingEditor({ q, onChange }) {
  const pairs = q.pairs || [{ left: '', right: '' }];
  return (
    <div>
      {pairs.map((p, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
          <input value={p.left} onChange={(e) => {
            const np = [...pairs]; np[i] = { ...np[i], left: e.target.value }; onChange({ pairs: np });
          }} placeholder="Left item" style={{ ...inputStyle, flex: 1 }} />
          <span style={{ color: '#94a3b8' }}>{'\u2194'}</span>
          <input value={p.right} onChange={(e) => {
            const np = [...pairs]; np[i] = { ...np[i], right: e.target.value }; onChange({ pairs: np });
          }} placeholder="Right match" style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => onChange({ pairs: pairs.filter((_, j) => j !== i) })} style={iconBtn}>{'\u2715'}</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ pairs: [...pairs, { left: '', right: '' }] })}
        style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px' }}>+ Add Pair</button>
    </div>
  );
}

function OrderingEditor({ q, onChange }) {
  const items = q.correctOrder || [''];
  return (
    <div>
      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>Enter items in the correct order (students see them shuffled)</p>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#94a3b8', width: 20 }}>{i + 1}.</span>
          <input value={item} onChange={(e) => {
            const ni = [...items]; ni[i] = e.target.value; onChange({ correctOrder: ni, items: ni });
          }} placeholder={`Item ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => onChange({ correctOrder: items.filter((_, j) => j !== i), items: items.filter((_, j) => j !== i) })} style={iconBtn}>{'\u2715'}</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange({ correctOrder: [...items, ''], items: [...items, ''] })}
        style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px' }}>+ Add Item</button>
    </div>
  );
}

function NumericEditor({ q, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Correct answer:
        <input type="number" step="any" value={q.correct || 0} onChange={(e) => onChange({ correct: parseFloat(e.target.value) || 0 })}
          style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Tolerance (±):
        <input type="number" step="any" min={0} value={q.tolerance || 0} onChange={(e) => onChange({ tolerance: parseFloat(e.target.value) || 0 })}
          style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Unit:
        <input value={q.unit || ''} onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="e.g. cm, kg" style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
      </label>
    </div>
  );
}

function CategorizationEditor({ q, onChange }) {
  const cats = q.categories || {};
  const catNames = Object.keys(cats);
  return (
    <div>
      {catNames.map((name) => (
        <div key={name} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#2563eb' }}>{name}</span>
            <button type="button" onClick={() => {
              const newCats = { ...cats }; delete newCats[name]; onChange({ categories: newCats });
            }} style={iconBtn}>{'\u2715'}</button>
          </div>
          <input value={cats[name].join(', ')} onChange={(e) => {
            onChange({ categories: { ...cats, [name]: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } });
          }} placeholder="Items (comma-separated)" style={{ ...inputStyle, width: '100%' }} />
        </div>
      ))}
      <button type="button" onClick={() => {
        const name = `Category ${catNames.length + 1}`;
        onChange({ categories: { ...cats, [name]: [] } });
      }} style={{ ...btnSecondary, fontSize: 11, padding: '4px 10px' }}>+ Add Category</button>
    </div>
  );
}

function FormulaEditor({ q, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Correct answer:
        <input type="number" step="any" value={q.correct || 0} onChange={(e) => onChange({ correct: parseFloat(e.target.value) || 0 })}
          style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
      </label>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Tolerance (±):
        <input type="number" step="any" min={0} value={q.tolerance || 0.01} onChange={(e) => onChange({ tolerance: parseFloat(e.target.value) || 0.01 })}
          style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
      </label>
    </div>
  );
}

function EssayEditor({ q, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Rubric / Grading criteria:</div>
      <RichTextEditor value={q.rubric || ''} onChange={(val) => onChange({ rubric: val })}
        placeholder="Describe what a good answer looks like..." compact minHeight={60} />
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600 }}>Min words:
          <input type="number" min={0} value={q.minWords || 50} onChange={(e) => onChange({ minWords: parseInt(e.target.value) || 0 })}
            style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 12, fontWeight: 600 }}>Max words:
          <input type="number" min={0} value={q.maxWords || 500} onChange={(e) => onChange({ maxWords: parseInt(e.target.value) || 500 })}
            style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
        </label>
      </div>
    </div>
  );
}

function UrlEditor({ q, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Instructions:
        <input value={q.question || ''} onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Submit a link to your work" style={{ ...inputStyle, display: 'block', marginTop: 4, width: '100%' }} />
      </label>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Rubric:</div>
      <RichTextEditor value={q.rubric || ''} onChange={(val) => onChange({ rubric: val })}
        placeholder="Grading criteria for URL submissions..." compact minHeight={60} />
    </div>
  );
}

function FileUploadEditor({ q, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Allowed file types (comma-separated):
        <input value={(q.allowedTypes || []).join(', ')} onChange={(e) => onChange({ allowedTypes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder=".pdf, .docx, .jpg, .png" style={{ ...inputStyle, display: 'block', marginTop: 4, width: '100%' }} />
      </label>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Max file size (MB):
        <input type="number" min={1} value={q.maxSizeMB || 10} onChange={(e) => onChange({ maxSizeMB: parseInt(e.target.value) || 10 })}
          style={{ ...inputStyle, display: 'block', marginTop: 4 }} />
      </label>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Rubric:</div>
      <RichTextEditor value={q.rubric || ''} onChange={(val) => onChange({ rubric: val })}
        placeholder="Grading criteria..." compact minHeight={60} />
    </div>
  );
}

function HotSpotEditor({ q, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Image URL:
        <input value={q.imageUrl || ''} onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://..." style={{ ...inputStyle, display: 'block', marginTop: 4, width: '100%' }} />
      </label>
      <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>
        Correct region (x, y, width, height in pixels):
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {['x', 'y', 'width', 'height'].map((k) => (
          <label key={k} style={{ fontSize: 11, fontWeight: 600 }}>{k}:
            <input type="number" value={q.correctRegion?.[k] || 0}
              onChange={(e) => onChange({ correctRegion: { ...q.correctRegion, [k]: parseInt(e.target.value) || 0 } })}
              style={{ ...inputStyle, display: 'block', marginTop: 2, width: 70 }} />
          </label>
        ))}
      </div>
    </div>
  );
}

function LikertEditor({ q, onChange }) {
  const scale = q.scale || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
  return (
    <div>
      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>Scale labels (survey question, no correct answer):</p>
      {scale.map((s, i) => (
        <input key={i} value={s} onChange={(e) => {
          const ns = [...scale]; ns[i] = e.target.value; onChange({ scale: ns });
        }} placeholder={`Label ${i + 1}`} style={{ ...inputStyle, marginBottom: 4, display: 'block', width: '100%' }} />
      ))}
    </div>
  );
}

function SettingsGroup({ label, children }) {
  return (
    <fieldset style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', margin: 0 }}>
      <legend style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', padding: '0 6px' }}>{label}</legend>
      <div style={{ display: 'grid', gap: 10 }}>{children}</div>
    </fieldset>
  );
}

function SettingRow({ label, sub, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#94a3b8' }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function SettingToggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)} role="switch" aria-checked={checked} tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
        style={{
          width: 40, height: 22, borderRadius: 11, background: checked ? '#2563eb' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}>
        <div style={{
          position: 'absolute', top: 2, left: checked ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{label}</span>
    </label>
  );
}

function Tag({ children }) {
  return (
    <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', fontSize: 12, fontWeight: 600, color: '#475569' }}>
      {children}
    </span>
  );
}

// ─── Shared Styles ─────────────────────────────────────────────
const inputStyle = { padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 };
const selectStyle = { padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13 };
const btnPrimary = { padding: '8px 18px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' };
const btnSecondary = { padding: '8px 18px', borderRadius: 8, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer' };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#94a3b8', padding: '4px 6px' };
const metaLabel = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#64748b' };
