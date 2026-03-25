import React, { useState, useEffect, useCallback } from 'react';
import {
  getMasteryPaths, saveMasteryPaths, addMasteryPath, evaluateMasteryPath,
  getAssignments, getClassModules, getGrades,
} from '../utils/storage';
import { getAssessments } from '../utils/assessmentEngine';
import { GAMES_CATALOG } from '../data/games';

const RULE_PRESETS = [
  { label: 'Advanced', minScore: 90, maxScore: 100, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '🌟' },
  { label: 'Proficient', minScore: 70, maxScore: 89, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '✓' },
  { label: 'Remediation', minScore: 0, maxScore: 69, color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '🔄' },
];

const CONTENT_TYPES = [
  { value: 'assessment', label: 'Assessment' },
  { value: 'module', label: 'Module' },
  { value: 'game', label: 'Game' },
];

const uid = () => `r-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const MasteryPathBuilder = ({ classId, isTeacher = true, studentId = null }) => {
  const [paths, setPaths] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [triggerId, setTriggerId] = useState('');
  const [rules, setRules] = useState(RULE_PRESETS.map((p) => ({
    id: uid(), label: p.label, minScore: p.minScore, maxScore: p.maxScore,
    assignedContentId: '', assignedContentType: 'assessment',
  })));

  const classAssessments = getAssessments().filter((a) => a.classId === classId);
  const classAssignments = getAssignments().filter((a) => a.classId === classId);
  const classModules = getClassModules(classId);
  const allTriggers = [
    ...classAssessments.map((a) => ({ id: a.id, name: a.title || a.name || 'Untitled Assessment', type: 'assessment' })),
    ...classAssignments.map((a) => ({ id: a.id, name: a.name || 'Untitled Assignment', type: 'assignment' })),
  ];

  const contentOptions = (type) => {
    if (type === 'assessment') return classAssessments.map((a) => ({ id: a.id, name: a.title || a.name }));
    if (type === 'module') return classModules.map((m) => ({ id: m.id, name: m.title || m.name }));
    if (type === 'game') return GAMES_CATALOG.map((g) => ({ id: g.id, name: g.name }));
    return [];
  };

  const reload = useCallback(() => {
    setPaths(getMasteryPaths(classId));
  }, [classId]);

  useEffect(() => { reload(); }, [reload]);

  const resetForm = () => {
    setName('');
    setTriggerId('');
    setRules(RULE_PRESETS.map((p) => ({
      id: uid(), label: p.label, minScore: p.minScore, maxScore: p.maxScore,
      assignedContentId: '', assignedContentType: 'assessment',
    })));
    setCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim() || !triggerId) return;
    const validRules = rules.filter((r) => r.assignedContentId);
    if (validRules.length === 0) return;

    if (editingId) {
      const updated = paths.map((p) =>
        p.id === editingId
          ? { ...p, name: name.trim(), triggerAssessmentId: triggerId, rules: validRules }
          : p
      );
      saveMasteryPaths(classId, updated);
    } else {
      addMasteryPath(classId, {
        classId,
        name: name.trim(),
        triggerAssessmentId: triggerId,
        rules: validRules,
      });
    }
    resetForm();
    reload();
  };

  const handleEdit = (path) => {
    setEditingId(path.id);
    setName(path.name);
    setTriggerId(path.triggerAssessmentId);
    setRules(path.rules.length > 0
      ? path.rules.map((r) => ({ ...r, id: r.id || uid() }))
      : RULE_PRESETS.map((p) => ({
          id: uid(), label: p.label, minScore: p.minScore, maxScore: p.maxScore,
          assignedContentId: '', assignedContentType: 'assessment',
        }))
    );
    setCreating(true);
  };

  const handleDelete = (pathId) => {
    const updated = paths.filter((p) => p.id !== pathId);
    saveMasteryPaths(classId, updated);
    reload();
  };

  const updateRule = (idx, field, value) => {
    setRules((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const addRule = () => {
    setRules((prev) => [...prev, {
      id: uid(), label: '', minScore: 0, maxScore: 100,
      assignedContentId: '', assignedContentType: 'assessment',
    }]);
  };

  const removeRule = (idx) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const getRuleColor = (rule) => {
    const preset = RULE_PRESETS.find((p) => p.label === rule.label);
    if (preset) return preset;
    if (rule.minScore >= 90) return RULE_PRESETS[0];
    if (rule.minScore >= 60) return RULE_PRESETS[1];
    return RULE_PRESETS[2];
  };

  const getContentName = (contentId, contentType) => {
    const opts = contentOptions(contentType);
    const found = opts.find((o) => o.id === contentId);
    return found?.name || contentId || 'Not set';
  };

  const getTriggerName = (tId) => {
    const t = allTriggers.find((a) => a.id === tId);
    return t?.name || tId || 'Unknown';
  };

  // ── Student view ──
  if (!isTeacher && studentId) {
    return <StudentMasteryView classId={classId} studentId={studentId} paths={paths} getTriggerName={getTriggerName} getContentName={getContentName} getRuleColor={getRuleColor} />;
  }

  // ── Teacher view ──
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Mastery Paths</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Automatically assign content based on assessment scores
          </p>
        </div>
        {!creating && (
          <button type="button" onClick={() => setCreating(true)} style={btnPrimary}>
            + New Mastery Path
          </button>
        )}
      </div>

      {/* ── Create / Edit Form ── */}
      {creating && (
        <div style={{
          background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: 24, marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>
            {editingId ? 'Edit Mastery Path' : 'New Mastery Path'}
          </h4>

          {/* Name + Trigger */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Path Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fractions Mastery Path"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Trigger Assessment</label>
              <select value={triggerId} onChange={(e) => setTriggerId(e.target.value)} style={inputStyle}>
                <option value="">Select assessment...</option>
                {allTriggers.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rules */}
          <label style={{ ...labelStyle, marginBottom: 8, display: 'block' }}>Branching Rules</label>
          <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
            {rules.map((rule, idx) => {
              const rc = getRuleColor(rule);
              return (
                <div key={rule.id} style={{
                  display: 'grid', gridTemplateColumns: '140px 80px 80px 150px 1fr 36px',
                  gap: 10, alignItems: 'center', padding: '12px 14px',
                  borderRadius: 10, border: `1.5px solid ${rc.border}`, background: rc.bg,
                }}>
                  <input
                    type="text"
                    value={rule.label}
                    onChange={(e) => updateRule(idx, 'label', e.target.value)}
                    placeholder="Label"
                    style={{ ...inputStyle, fontWeight: 700, color: rc.color, background: '#fff' }}
                  />
                  <input
                    type="number"
                    value={rule.minScore}
                    onChange={(e) => updateRule(idx, 'minScore', Number(e.target.value))}
                    placeholder="Min"
                    style={{ ...inputStyle, textAlign: 'center', background: '#fff' }}
                    min={0} max={100}
                  />
                  <input
                    type="number"
                    value={rule.maxScore}
                    onChange={(e) => updateRule(idx, 'maxScore', Number(e.target.value))}
                    placeholder="Max"
                    style={{ ...inputStyle, textAlign: 'center', background: '#fff' }}
                    min={0} max={100}
                  />
                  <select
                    value={rule.assignedContentType}
                    onChange={(e) => {
                      updateRule(idx, 'assignedContentType', e.target.value);
                      updateRule(idx, 'assignedContentId', '');
                    }}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>{ct.label}</option>
                    ))}
                  </select>
                  <select
                    value={rule.assignedContentId}
                    onChange={(e) => updateRule(idx, 'assignedContentId', e.target.value)}
                    style={{ ...inputStyle, background: '#fff' }}
                  >
                    <option value="">Select content...</option>
                    {contentOptions(rule.assignedContentType).map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeRule(idx)} style={{
                    width: 32, height: 32, borderRadius: 8, border: 'none',
                    background: '#fee2e2', color: '#dc2626', cursor: 'pointer',
                    fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} title="Remove rule">&times;</button>
                </div>
              );
            })}
          </div>

          <button type="button" onClick={addRule} style={{
            padding: '6px 14px', borderRadius: 8, border: '1.5px dashed #cbd5e1',
            background: 'transparent', color: '#64748b', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, marginBottom: 18,
          }}>+ Add Rule</button>

          {/* Flowchart Preview */}
          {triggerId && rules.some((r) => r.assignedContentId) && (
            <FlowchartPreview
              triggerName={getTriggerName(triggerId)}
              rules={rules.filter((r) => r.assignedContentId)}
              getContentName={getContentName}
              getRuleColor={getRuleColor}
            />
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button type="button" onClick={handleSave} style={btnPrimary} disabled={!name.trim() || !triggerId || rules.every((r) => !r.assignedContentId)}>
              {editingId ? 'Update Path' : 'Save Path'}
            </button>
            <button type="button" onClick={resetForm} style={btnSecondary}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Existing Paths ── */}
      {paths.length === 0 && !creating ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔀</div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>No mastery paths yet</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Create branching paths that auto-assign content based on student scores.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {paths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              getTriggerName={getTriggerName}
              getContentName={getContentName}
              getRuleColor={getRuleColor}
              onEdit={() => handleEdit(path)}
              onDelete={() => handleDelete(path.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Saved path card ──
function PathCard({ path, getTriggerName, getContentName, getRuleColor, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
        cursor: 'pointer',
      }} onClick={() => setExpanded((v) => !v)}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#fff', flexShrink: 0,
        }}>🔀</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{path.name}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Trigger: {getTriggerName(path.triggerAssessmentId)} &middot; {path.rules?.length || 0} branches
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button type="button" onClick={(e) => { e.stopPropagation(); onEdit(); }} style={btnSmall}>Edit</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this mastery path?')) onDelete(); }}
            style={{ ...btnSmall, background: '#fee2e2', color: '#dc2626' }}>Delete</button>
        </div>
        <span style={{ fontSize: 14, color: '#94a3b8', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
          ▼
        </span>
      </div>

      {/* Expanded flowchart */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', padding: 20 }}>
          <FlowchartPreview
            triggerName={getTriggerName(path.triggerAssessmentId)}
            rules={path.rules || []}
            getContentName={getContentName}
            getRuleColor={getRuleColor}
          />
        </div>
      )}
    </div>
  );
}

// ── Visual flowchart ──
function FlowchartPreview({ triggerName, rules, getContentName, getRuleColor }) {
  return (
    <div style={{ padding: '16px 0' }}>
      {/* Trigger node */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{
          padding: '12px 24px', borderRadius: 12,
          background: 'linear-gradient(135deg, #1e293b, #334155)',
          color: '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxWidth: 320,
        }}>
          📝 {triggerName}
          <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.8, marginTop: 4 }}>
            Trigger Assessment
          </div>
        </div>
      </div>

      {/* Connector line down */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 2, height: 24, background: '#cbd5e1' }} />
      </div>

      {/* Score evaluation node */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 0 }}>
        <div style={{
          padding: '8px 20px', borderRadius: 20,
          background: '#f8fafc', border: '1.5px solid #e2e8f0',
          color: '#475569', fontWeight: 600, fontSize: 13, textAlign: 'center',
        }}>
          Score Evaluation
        </div>
      </div>

      {/* Branching lines */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 2, height: 16, background: '#cbd5e1' }} />
      </div>

      {/* Horizontal connector bar */}
      {rules.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, left: `${50 - (rules.length - 1) * 16}%`,
            right: `${50 - (rules.length - 1) * 16}%`,
            height: 2, background: '#cbd5e1',
          }} />
        </div>
      )}

      {/* Branch cards */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 16,
        flexWrap: 'wrap', marginTop: rules.length > 1 ? 2 : 0,
      }}>
        {rules.map((rule) => {
          const rc = getRuleColor(rule);
          return (
            <div key={rule.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 180, maxWidth: 220 }}>
              {/* Vertical line from horizontal bar */}
              <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />

              {/* Score range badge */}
              <div style={{
                padding: '4px 14px', borderRadius: 12,
                background: rc.color, color: '#fff',
                fontSize: 12, fontWeight: 700, marginBottom: 6,
                boxShadow: `0 2px 6px ${rc.color}33`,
              }}>
                {rule.minScore}–{rule.maxScore}%
              </div>

              {/* Branch card */}
              <div style={{
                width: '100%', padding: '14px 16px', borderRadius: 12,
                border: `2px solid ${rc.border}`, background: rc.bg,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{rc.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: rc.color, marginBottom: 4 }}>
                  {rule.label}
                </div>
                <div style={{
                  fontSize: 12, color: '#475569', padding: '4px 8px',
                  background: '#fff', borderRadius: 6, display: 'inline-block',
                }}>
                  {getContentName(rule.assignedContentId, rule.assignedContentType)}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {rule.assignedContentType}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Student mastery view ──
function StudentMasteryView({ classId, studentId, paths, getTriggerName, getContentName, getRuleColor }) {
  const grades = getGrades();

  if (paths.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🔀</div>
        <p style={{ fontSize: 14, fontWeight: 600 }}>No mastery paths available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Your Mastery Paths</h3>
      <div style={{ display: 'grid', gap: 16 }}>
        {paths.map((path) => {
          const matchedRule = evaluateMasteryPath(classId, studentId, path.triggerAssessmentId);
          const studentGrade = grades.find((g) => g.studentId === studentId && g.assignmentId === path.triggerAssessmentId);

          return (
            <div key={path.id} style={{
              background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
              overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  {path.name}
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                  Trigger: {getTriggerName(path.triggerAssessmentId)}
                  {studentGrade && <span> &middot; Your score: <strong>{studentGrade.score}%</strong></span>}
                </div>

                {!studentGrade ? (
                  <div style={{
                    padding: '14px 18px', borderRadius: 10, background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1', textAlign: 'center', color: '#64748b', fontSize: 13,
                  }}>
                    Complete the trigger assessment to see your assigned path
                  </div>
                ) : matchedRule ? (
                  <StudentPathResult rule={matchedRule} getRuleColor={getRuleColor} getContentName={getContentName} />
                ) : (
                  <div style={{
                    padding: '14px 18px', borderRadius: 10, background: '#fefce8',
                    border: '1.5px solid #fde68a', textAlign: 'center', color: '#854d0e', fontSize: 13,
                  }}>
                    No matching path rule for your score. Contact your teacher.
                  </div>
                )}

                {/* Show all branches faded for context */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    All Branches
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {(path.rules || []).map((rule) => {
                      const rc = getRuleColor(rule);
                      const isActive = matchedRule?.id === rule.id;
                      return (
                        <div key={rule.id} style={{
                          padding: '8px 14px', borderRadius: 10,
                          border: `2px solid ${isActive ? rc.color : rc.border}`,
                          background: isActive ? rc.bg : '#fafafa',
                          opacity: isActive ? 1 : 0.5,
                          flex: '1 1 140px', minWidth: 140, textAlign: 'center',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: rc.color }}>{rule.label}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{rule.minScore}–{rule.maxScore}%</div>
                          {isActive && (
                            <div style={{
                              fontSize: 10, fontWeight: 700, color: '#fff', background: rc.color,
                              padding: '2px 8px', borderRadius: 6, marginTop: 4, display: 'inline-block',
                            }}>YOU ARE HERE</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentPathResult({ rule, getRuleColor, getContentName }) {
  const rc = getRuleColor(rule);
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 12,
      border: `2px solid ${rc.color}`,
      background: `linear-gradient(135deg, ${rc.bg}, #fff)`,
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: rc.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, flexShrink: 0, boxShadow: `0 4px 12px ${rc.color}33`,
      }}>
        {rc.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: rc.color }}>{rule.label}</div>
        <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
          Score range: {rule.minScore}–{rule.maxScore}%
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 6 }}>
          Assigned: {getContentName(rule.assignedContentId, rule.assignedContentType)}
          <span style={{
            fontSize: 10, marginLeft: 8, padding: '2px 8px', borderRadius: 4,
            background: '#f1f5f9', color: '#64748b', textTransform: 'uppercase',
          }}>{rule.assignedContentType}</span>
        </div>
      </div>
      <div style={{
        padding: '8px 14px', borderRadius: 8,
        background: rc.color, color: '#fff', fontWeight: 700,
        fontSize: 13, cursor: 'pointer', flexShrink: 0,
        boxShadow: `0 2px 8px ${rc.color}33`,
      }}>
        Go to Content →
      </div>
    </div>
  );
}

// ── Shared styles ──
const btnPrimary = {
  padding: '8px 18px', borderRadius: 8, background: '#2563eb', color: '#fff',
  border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13,
  transition: 'background 0.15s',
};
const btnSecondary = {
  padding: '8px 18px', borderRadius: 8, background: '#f1f5f9',
  border: '1px solid #e2e8f0', color: '#475569',
  fontWeight: 600, cursor: 'pointer', fontSize: 13,
};
const btnSmall = {
  padding: '6px 12px', borderRadius: 6, background: '#f1f5f9',
  border: '1px solid #e2e8f0', fontWeight: 700, fontSize: 11, cursor: 'pointer',
};
const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#374151',
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3,
};
const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1.5px solid #e2e8f0', fontSize: 14,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none', boxSizing: 'border-box',
};

export default MasteryPathBuilder;
