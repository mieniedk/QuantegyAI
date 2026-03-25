import React, { useState, useEffect, useCallback } from 'react';
import SkeletonLoader from './SkeletonLoader';
import {
  getSections, saveSections, addSection,
  assignStudentToSection, removeStudentFromSection,
} from '../utils/storage';

const SECTION_COLORS = [
  { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', badge: '#2563eb' },
  { bg: '#faf5ff', border: '#e9d5ff', text: '#7c3aed', badge: '#7c3aed' },
  { bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', badge: '#059669' },
  { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', badge: '#ea580c' },
  { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#dc2626' },
  { bg: '#f0f9ff', border: '#bae6fd', text: '#075985', badge: '#0284c7' },
  { bg: '#fefce8', border: '#fde68a', text: '#854d0e', badge: '#ca8a04' },
  { bg: '#fdf2f8', border: '#fbcfe8', text: '#9d174d', badge: '#db2777' },
];

function getAuthHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const SectionManager = ({ classId, students }) => {
  const [activeTab, setActiveTab] = useState('sections');
  const [sections, setSections] = useState([]);
  const [newName, setNewName] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [dragStudentId, setDragStudentId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // Groups state
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupMembers, setEditingGroupMembers] = useState([]);

  const reload = useCallback(() => {
    setSections(getSections(classId));
  }, [classId]);

  useEffect(() => { reload(); }, [reload]);

  const loadGroups = useCallback(() => {
    if (!classId) return;
    setGroupsLoading(true);
    fetch(`/api/classes/${classId}/groups`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setGroups(Array.isArray(data) ? data : data.groups || []))
      .catch(() => {})
      .finally(() => setGroupsLoading(false));
  }, [classId]);

  useEffect(() => { if (activeTab === 'groups') loadGroups(); }, [activeTab, loadGroups]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch(`/api/classes/${classId}/groups`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      if (res.ok) { setNewGroupName(''); loadGroups(); }
    } catch (_) {}
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await fetch(`/api/groups/${groupId}`, { method: 'DELETE', headers: getAuthHeaders() });
      loadGroups();
    } catch (_) {}
  };

  const handleSaveGroupMembers = async (groupId) => {
    try {
      await fetch(`/api/groups/${groupId}/members`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ studentIds: editingGroupMembers }),
      });
      setEditingGroupId(null);
      setEditingGroupMembers([]);
      loadGroups();
    } catch (_) {}
  };

  const startEditMembers = (group) => {
    setEditingGroupId(group.id);
    setEditingGroupMembers(group.memberIds || group.studentIds || group.members?.map(m => m.id || m) || []);
  };

  const toggleGroupMember = (studentId) => {
    setEditingGroupMembers(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addSection(classId, newName.trim());
    setNewName('');
    reload();
  };

  const handleDelete = (sectionId) => {
    const updated = sections.filter((s) => s.id !== sectionId);
    saveSections(classId, updated);
    if (expandedId === sectionId) setExpandedId(null);
    reload();
  };

  const handleRename = (sectionId) => {
    if (!editName.trim()) return;
    const updated = sections.map((s) =>
      s.id === sectionId ? { ...s, name: editName.trim() } : s
    );
    saveSections(classId, updated);
    setEditingId(null);
    setEditName('');
    reload();
  };

  const handleToggleStudent = (sectionId, studentId, isAssigned) => {
    if (isAssigned) {
      removeStudentFromSection(classId, sectionId, studentId);
    } else {
      assignStudentToSection(classId, sectionId, studentId);
    }
    reload();
  };

  const handleDrop = (sectionId) => {
    if (!dragStudentId) return;
    assignStudentToSection(classId, sectionId, dragStudentId);
    setDragStudentId(null);
    reload();
  };

  const getColor = (idx) => SECTION_COLORS[idx % SECTION_COLORS.length];

  const assignedStudentIds = new Set(sections.flatMap((s) => s.studentIds || []));
  const unassignedStudents = (students || []).filter((s) => !assignedStudentIds.has(s.id));

  const getStudentName = (id) => {
    const s = (students || []).find((st) => st.id === id);
    return s ? s.name : id;
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {[{ id: 'sections', label: 'Sections' }, { id: 'groups', label: 'Groups' }].map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`,
              color: activeTab === tab.id ? '#2563eb' : '#64748b', marginBottom: -2,
              transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sections' && <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            Sections
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
            Organize students into groups for differentiated assignments
          </p>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569',
        }}>
          {sections.length} section{sections.length !== 1 ? 's' : ''} · {(students || []).length} students
        </div>
      </div>

      {/* Create Section */}
      <form onSubmit={handleCreate} style={{
        display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="New section name (e.g. Group A, Advanced, Tier 2)..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10,
            border: '1px solid #e2e8f0', fontSize: 14,
            outline: 'none', transition: 'border 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
          onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
        />
        <button type="submit" disabled={!newName.trim()} style={{
          padding: '10px 20px', borderRadius: 10, border: 'none',
          background: newName.trim() ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#e2e8f0',
          color: newName.trim() ? '#fff' : '#94a3b8',
          fontWeight: 700, fontSize: 14, cursor: newName.trim() ? 'pointer' : 'default',
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}>
          + Create Section
        </button>
      </form>

      {/* Section Cards */}
      {sections.length === 0 ? (
        <div style={{
          padding: '40px 24px', textAlign: 'center', borderRadius: 12,
          background: '#f8fafc', border: '2px dashed #e2e8f0',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>
            No sections yet
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Create sections to group students and assign differentiated work
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sections.map((sec, idx) => {
            const color = getColor(idx);
            const isExpanded = expandedId === sec.id;
            const sectionStudents = (sec.studentIds || []).map((id) => ({
              id,
              name: getStudentName(id),
            }));

            return (
              <div
                key={sec.id}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.boxShadow = `0 0 0 2px ${color.badge}`; }}
                onDragLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.style.boxShadow = 'none'; handleDrop(sec.id); }}
                style={{
                  background: '#fff', borderRadius: 12, border: `1px solid ${color.border}`,
                  overflow: 'hidden', transition: 'box-shadow 0.2s',
                }}
              >
                {/* Section Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : sec.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px', cursor: 'pointer',
                    background: isExpanded ? color.bg : '#fff',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: color.badge, flexShrink: 0,
                  }} />

                  {editingId === sec.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleRename(sec.id); }} onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 6, flex: 1 }}>
                      <input
                        type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700, flex: 1 }}
                      />
                      <button type="submit" style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: color.badge, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Save</button>
                      <button type="button" onClick={() => setEditingId(null)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </form>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: 15, color: color.text, flex: 1 }}>
                      {sec.name}
                    </span>
                  )}

                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    background: color.bg, color: color.badge, border: `1px solid ${color.border}`,
                  }}>
                    {sectionStudents.length} student{sectionStudents.length !== 1 ? 's' : ''}
                  </span>

                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => { setEditingId(sec.id); setEditName(sec.name); }}
                      title="Rename"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, color: '#94a3b8', padding: '2px 6px', borderRadius: 4,
                      }}
                    >✏️</button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete section "${sec.name}"? Students won't be deleted.`)) handleDelete(sec.id);
                      }}
                      title="Delete section"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, color: '#94a3b8', padding: '2px 6px', borderRadius: 4,
                      }}
                    >🗑️</button>
                  </div>

                  <span style={{
                    fontSize: 14, color: '#94a3b8',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}>▼</span>
                </div>

                {/* Expanded student list */}
                {isExpanded && (
                  <div style={{ padding: '0 18px 18px', background: color.bg }}>
                    {/* Current students in section */}
                    {sectionStudents.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, paddingTop: 4 }}>
                        {sectionStudents.map((st) => (
                          <span key={st.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 10px', borderRadius: 8,
                            background: '#fff', border: `1px solid ${color.border}`,
                            fontSize: 13, fontWeight: 600, color: color.text,
                          }}>
                            {st.name}
                            <button
                              type="button"
                              onClick={() => handleToggleStudent(sec.id, st.id, true)}
                              title="Remove from section"
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 12, color: '#dc2626', padding: 0, lineHeight: 1,
                              }}
                            >×</button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: '8px 0 14px', fontStyle: 'italic' }}>
                        No students assigned yet. Check students below or drag them here.
                      </p>
                    )}

                    {/* Add students via checkboxes */}
                    <div style={{
                      background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                      padding: '12px 14px',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                        Add / Remove Students
                      </div>
                      {(students || []).length === 0 ? (
                        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No students in class.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4 }}>
                          {(students || []).map((st) => {
                            const isIn = (sec.studentIds || []).includes(st.id);
                            return (
                              <label key={st.id} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                                background: isIn ? color.bg : 'transparent',
                                transition: 'background 0.15s',
                                fontSize: 13, fontWeight: isIn ? 600 : 400,
                                color: isIn ? color.text : '#475569',
                              }}>
                                <input
                                  type="checkbox"
                                  checked={isIn}
                                  onChange={() => handleToggleStudent(sec.id, st.id, isIn)}
                                  style={{ accentColor: color.badge }}
                                />
                                {st.name}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned Students Pool */}
      {(students || []).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#64748b' }}>
            Unassigned Students ({unassignedStudents.length})
          </h4>
          {unassignedStudents.length === 0 ? (
            <div style={{
              padding: '14px 18px', borderRadius: 10, background: '#ecfdf5',
              border: '1px solid #a7f3d0', fontSize: 13, color: '#065f46', fontWeight: 600,
            }}>
              All students are assigned to at least one section
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {unassignedStudents.map((st) => (
                <span
                  key={st.id}
                  draggable
                  onDragStart={() => setDragStudentId(st.id)}
                  onDragEnd={() => setDragStudentId(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    fontSize: 13, fontWeight: 600, color: '#475569',
                    cursor: 'grab', userSelect: 'none',
                    transition: 'all 0.15s',
                  }}
                  title="Drag to a section"
                >
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>⠿</span>
                  {st.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      </>}

      {activeTab === 'groups' && (
        <>
          {/* Groups Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Groups</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Create collaborative groups and assign members</p>
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
              {groups.length} group{groups.length !== 1 ? 's' : ''} · {(students || []).length} students
            </div>
          </div>

          {/* Create Group */}
          <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center' }}>
            <input type="text" placeholder="New group name..." value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', transition: 'border 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
            />
            <button type="submit" disabled={!newGroupName.trim()} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: newGroupName.trim() ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#e2e8f0',
              color: newGroupName.trim() ? '#fff' : '#94a3b8',
              fontWeight: 700, fontSize: 14, cursor: newGroupName.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>
              + Add Group
            </button>
          </form>

          {groupsLoading ? (
            <div style={{ padding: 40 }}>
              <SkeletonLoader variant="table-row" />
              <SkeletonLoader variant="table-row" />
              <SkeletonLoader variant="table-row" />
            </div>
          ) : groups.length === 0 ? (
            <div style={{
              padding: '40px 24px', textAlign: 'center', borderRadius: 12,
              background: '#f8fafc', border: '2px dashed #e2e8f0',
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>No groups yet</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Create groups to organize collaborative work</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groups.map((group, idx) => {
                const color = getColor(idx);
                const memberIds = group.memberIds || group.studentIds || group.members?.map(m => m.id || m) || [];
                const memberNames = memberIds.map(id => getStudentName(id));
                const isEditing = editingGroupId === group.id;

                return (
                  <div key={group.id} style={{
                    background: '#fff', borderRadius: 12, border: `1px solid ${color.border}`,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 18px', background: isEditing ? color.bg : '#fff',
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color.badge, flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, fontSize: 15, color: color.text, flex: 1 }}>{group.name}</span>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: color.bg, color: color.badge, border: `1px solid ${color.border}`,
                      }}>
                        {memberIds.length} member{memberIds.length !== 1 ? 's' : ''}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button type="button" onClick={() => isEditing ? setEditingGroupId(null) : startEditMembers(group)}
                          title="Edit Members"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>
                          {isEditing ? '✕' : '✏️'}
                        </button>
                        <button type="button" onClick={() => handleDeleteGroup(group.id)}
                          title="Delete group"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Member chips */}
                    {!isEditing && memberIds.length > 0 && (
                      <div style={{ padding: '0 18px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {memberNames.map((name, i) => (
                          <span key={memberIds[i]} style={{
                            padding: '5px 10px', borderRadius: 8, background: color.bg,
                            border: `1px solid ${color.border}`, fontSize: 13, fontWeight: 600, color: color.text,
                          }}>
                            {name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Edit members panel */}
                    {isEditing && (
                      <div style={{ padding: '0 18px 18px', background: color.bg }}>
                        <div style={{
                          background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 14px',
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                            Select Members
                          </div>
                          {(students || []).length === 0 ? (
                            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No students in class.</p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 4 }}>
                              {(students || []).map((st) => {
                                const isIn = editingGroupMembers.includes(st.id);
                                return (
                                  <label key={st.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                                    background: isIn ? color.bg : 'transparent',
                                    transition: 'background 0.15s',
                                    fontSize: 13, fontWeight: isIn ? 600 : 400,
                                    color: isIn ? color.text : '#475569',
                                  }}>
                                    <input type="checkbox" checked={isIn}
                                      onChange={() => toggleGroupMember(st.id)}
                                      style={{ accentColor: color.badge }} />
                                    {st.name}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => handleSaveGroupMembers(group.id)}
                              style={{
                                padding: '8px 18px', borderRadius: 8, border: 'none',
                                background: color.badge, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                              }}>
                              Save Members
                            </button>
                            <button type="button" onClick={() => setEditingGroupId(null)}
                              style={{
                                padding: '8px 18px', borderRadius: 8, border: '1px solid #e2e8f0',
                                background: '#fff', color: '#475569', fontSize: 13, cursor: 'pointer',
                              }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SectionManager;
