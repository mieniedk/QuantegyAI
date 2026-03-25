import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getClassModules, addModule, deleteModule, addModuleItem, deleteModuleItem, updateModule, populateCourseContent, getClasses, isModuleUnlocked, isModuleComplete, markModuleItemComplete, getModuleProgress } from '../utils/storage';
import { getStudioVideosList } from '../utils/videoStudio';
import StudioVideoPlayer from './StudioVideoPlayer';
import RichTextEditor, { RichTextViewer } from './RichTextEditor';

/* ═══════════════════════════════════════════════════════════════
   CONTENT MODULES — organize & share links, videos, PDFs per class
   Teachers create modules (folders) and add items to them.
   Students browse & open the content in a clean read-only view.
   ═══════════════════════════════════════════════════════════════ */

const ITEM_TYPES = [
  { id: 'link', icon: '🔗', label: 'Link' },
  { id: 'video', icon: '📹', label: 'Video' },
  { id: 'file', icon: '📄', label: 'File / PDF' },
  { id: 'image', icon: '🖼️', label: 'Image' },
  { id: 'note', icon: '📝', label: 'Text Note' },
  { id: 'lesson', icon: '📖', label: 'Lesson' },
];

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#ea580c', '#dc2626', '#0891b2', '#4f46e5', '#ca8a04'];

function youtubeEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?#]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function ContentModules({ classId, isTeacher, studentId }) {
  const [modules, setModules] = useState(() => getClassModules(classId));
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [newCompletionReq, setNewCompletionReq] = useState('all');
  const [expandedMod, setExpandedMod] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [newItem, setNewItem] = useState({ type: 'link', title: '', url: '', body: '' });
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingSettings, setEditingSettings] = useState(null);
  const [progressVersion, setProgressVersion] = useState(0);

  const reload = useCallback(() => setModules(getClassModules(classId)), [classId]);

  const handleAddModule = () => {
    if (!newTitle.trim()) return;
    const mod = addModule({ classId, title: newTitle.trim(), description: newDesc, color: COLORS[modules.length % COLORS.length], prerequisiteModuleId: newPrerequisite || null, completionRequirement: newCompletionReq });
    setNewTitle(''); setNewDesc(''); setShowNew(false); setNewPrerequisite(''); setNewCompletionReq('all');
    reload();
    setExpandedMod(mod.id);
  };

  const handleDeleteModule = (id) => {
    if (!confirm('Delete this module and all its items?')) return;
    deleteModule(id); reload();
  };

  const handleAddItem = (moduleId) => {
    if (!newItem.title.trim()) return;
    addModuleItem(moduleId, { type: newItem.type, title: newItem.title.trim(), url: newItem.url.trim(), body: newItem.body });
    setNewItem({ type: 'link', title: '', url: '', body: '' }); setAddingTo(null); reload();
  };

  const handleDeleteItem = (moduleId, itemId) => { deleteModuleItem(moduleId, itemId); reload(); };

  const togglePublish = (mod) => { updateModule(mod.id, { published: !mod.published }); reload(); };

  const [populating, setPopulating] = useState(false);
  const [populateResult, setPopulateResult] = useState(null);

  const handlePopulateContent = async () => {
    const cls = getClasses().find(c => c.id === classId);
    if (!cls) return;
    const gradeId = cls.gradeId || 'grade3';
    const contentGrade = gradeId === 'texes' ? 'grade7-12' : gradeId;
    setPopulating(true);
    setPopulateResult(null);
    try {
      const result = await populateCourseContent(classId, contentGrade);
      setPopulateResult(result);
      reload();
    } catch (e) {
      console.error('Populate error:', e);
      setPopulateResult({ error: e.message });
    } finally {
      setPopulating(false);
    }
  };

  const filteredModules = isTeacher ? modules : modules.filter(m => m.published !== false);
  const hasPrebuiltContent = modules.some(m => m.type === 'prebuilt');

  return (
    <div style={{ maxWidth: 800 }}>
      <style>{`
        .mod-card { transition: all 0.2s; }
        .mod-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06) !important; }
        .mod-item { transition: all 0.15s; }
        .mod-item:hover { background: #f0f7ff !important; transform: translateX(4px); }
        .mod-locked { opacity: 0.65; }
        .mod-locked:hover { box-shadow: none !important; }
        .mod-complete { border-color: #22c55e !important; }
        .mod-progress-bar { height: 6px; border-radius: 3px; background: #e2e8f0; overflow: hidden; margin: 8px 18px 0; }
        .mod-progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #2563eb, #7c3aed); transition: width 0.3s; }
        .item-check { cursor: pointer; width: 22px; height: 22px; border-radius: 6px; border: 2px solid #cbd5e1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.15s; font-size: 13px; font-weight: 700; margin-top: 1px; }
        .item-check:hover { border-color: #2563eb; background: #eff6ff; }
        .item-check.done { background: #22c55e; border-color: #22c55e; color: #fff; cursor: default; }
      `}</style>

      {isTeacher && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setShowNew(!showNew)} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: showNew ? '#f1f5f9' : 'linear-gradient(135deg,#2563eb,#7c3aed)', color: showNew ? '#64748b' : '#fff',
          }}>
            {showNew ? '✕ Cancel' : '+ New Module'}
          </button>
          {!hasPrebuiltContent && (
            <button type="button" onClick={handlePopulateContent} disabled={populating} style={{
              padding: '10px 20px', borderRadius: 10, border: 'none', cursor: populating ? 'wait' : 'pointer',
              fontWeight: 700, fontSize: 13, background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff',
              opacity: populating ? 0.7 : 1,
            }}>
              {populating ? 'Loading Lessons...' : '📚 Add Pre-built Lessons'}
            </button>
          )}
          {populateResult && !populateResult.error && (
            <span style={{ fontSize: 13, color: '#059669', fontWeight: 600 }}>
              Added {populateResult.modules} modules with {populateResult.items} lessons
            </span>
          )}
          {populateResult?.error && (
            <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>Error: {populateResult.error}</span>
          )}
        </div>
      )}

      {showNew && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, marginBottom: 16 }}>
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Module title (e.g. 'Week 3: Fractions')"
            onKeyDown={e => e.key === 'Enter' && handleAddModule()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 8, boxSizing: 'border-box' }} />
          <RichTextEditor value={newDesc} onChange={setNewDesc} placeholder="Optional description… Or ✏️ Draw to add a drawing." compact minHeight={60} prominentDrawButton />
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
              Prerequisite:
              <select value={newPrerequisite} onChange={e => setNewPrerequisite(e.target.value)}
                style={{ marginLeft: 6, padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                <option value="">None</option>
                {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
              Completion:
              <button type="button" onClick={() => setNewCompletionReq(newCompletionReq === 'all' ? 'any' : 'all')}
                style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: newCompletionReq === 'all' ? '#2563eb' : '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                {newCompletionReq === 'all' ? 'All items' : 'Any 1 item'}
              </button>
            </label>
          </div>
          <button type="button" onClick={handleAddModule} disabled={!newTitle.trim()} style={{
            marginTop: 8, padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, background: newTitle.trim() ? '#2563eb' : '#e2e8f0', color: newTitle.trim() ? '#fff' : '#94a3b8',
          }}>Create Module</button>
        </div>
      )}

      {filteredModules.length === 0 && !showNew && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📚</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{isTeacher ? 'No modules yet' : 'No materials shared yet'}</div>
          <div style={{ fontSize: 13 }}>{isTeacher ? 'Create your first module to organize class content.' : 'Check back later for shared materials from your teacher.'}</div>
        </div>
      )}

      {filteredModules.map((mod, mi) => {
        const isOpen = expandedMod === mod.id;
        const color = mod.color || COLORS[mi % COLORS.length];
        const _unlocked = isTeacher || !studentId || isModuleUnlocked(classId, studentId, mod.id);
        const _complete = !isTeacher && studentId ? isModuleComplete(classId, studentId, mod.id) : false;
        const _progress = !isTeacher && studentId ? (getModuleProgress(classId, studentId)[mod.id] || []) : [];
        const _totalItems = mod.items?.length || 0;
        const _prereqMod = mod.prerequisiteModuleId ? modules.find(m => m.id === mod.prerequisiteModuleId) : null;
        void progressVersion;

        return (
          <div key={mod.id} className={`mod-card${!_unlocked ? ' mod-locked' : ''}${_complete ? ' mod-complete' : ''}`} style={{ background: !_unlocked ? '#f8fafc' : '#fff', borderRadius: 14, border: `1px solid ${_complete ? '#22c55e' : '#e2e8f0'}`, marginBottom: 12, overflow: 'hidden' }}>
            <div onClick={() => { if (_unlocked) setExpandedMod(isOpen ? null : mod.id); }} style={{
              padding: '14px 18px', cursor: _unlocked ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 12,
              borderLeft: `5px solid ${!_unlocked ? '#94a3b8' : color}`, background: isOpen ? '#fafbfd' : _complete ? '#f0fdf4' : '#fff',
            }}>
              <span style={{ fontSize: 22, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>{!_unlocked ? '🔒' : _complete ? '✅' : '▶'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: !_unlocked ? '#94a3b8' : '#0f172a' }}>
                  {_unlocked ? '📁 ' : ''}{mod.title}
                  {mod.published === false && <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginLeft: 8, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6 }}>Draft</span>}
                  {_complete && <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700, marginLeft: 8, background: '#dcfce7', padding: '2px 8px', borderRadius: 6 }}>Complete</span>}
                </div>
                {mod.description && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{mod.description}</div>}
                {!_unlocked && _prereqMod && <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, marginTop: 4 }}>Complete &ldquo;{_prereqMod.title}&rdquo; first</div>}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>
                {!isTeacher && studentId && _unlocked && _totalItems > 0 ? `${_progress.length}/${_totalItems}` : `${_totalItems} items`}
              </span>
            </div>
            {!isTeacher && studentId && _unlocked && _totalItems > 0 && !_complete && (
              <div className="mod-progress-bar"><div className="mod-progress-fill" style={{ width: `${(_progress.length / _totalItems) * 100}%` }} /></div>
            )}

            {isOpen && (
              <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f1f5f9' }}>
                {/* Module items */}
                {(mod.items || []).map((item, ii) => {
                  const typeInfo = ITEM_TYPES.find(t => t.id === item.type) || ITEM_TYPES[0];
                  const ytEmbed = item.type === 'video' ? youtubeEmbed(item.url) : null;

                  return (
                    <div key={item.id} className="mod-item" style={{ padding: '10px 12px', borderRadius: 10, marginTop: 8, background: _progress.includes(item.id) ? '#f0fdf4' : '#f8fafc', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {!isTeacher && studentId && (
                        <div className={`item-check${_progress.includes(item.id) ? ' done' : ''}`}
                          onClick={() => { if (!_progress.includes(item.id)) { markModuleItemComplete(classId, studentId, mod.id, item.id); setProgressVersion(v => v + 1); reload(); } }}
                          title={_progress.includes(item.id) ? 'Completed' : 'Mark complete'}>
                          {_progress.includes(item.id) ? '✓' : ''}
                        </div>
                      )}
                      <span style={{ fontSize: 18, marginTop: 2 }}>{typeInfo.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{item.title}</div>
                        {(item.type === 'lesson' && item.content) ? (
                          <div style={{ fontSize: 13, color: '#334155', marginTop: 8, lineHeight: 1.6 }}>
                            <RichTextViewer html={item.content} />
                          </div>
                        ) : item.body ? (
                          <div style={{ fontSize: 12, color: '#475569', marginTop: 4, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{item.body}</div>
                        ) : null}
                        {item.url && item.type !== 'video' && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            Open {typeInfo.label} ↗
                          </a>
                        )}
                        {ytEmbed && (
                          <div style={{ marginTop: 8, borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                            <iframe src={ytEmbed} style={{ width: '100%', height: 240, border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                          </div>
                        )}
                        {item.url && item.type === 'video' && !ytEmbed && item.url.startsWith('studio:') && (
                          <StudioVideoPlayer url={item.url} />
                        )}
                        {item.url && item.type === 'video' && !ytEmbed && !item.url.startsWith('studio:') && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                            Watch Video ↗
                          </a>
                        )}
                      </div>
                      {isTeacher && (
                        <button type="button" onClick={() => handleDeleteItem(mod.id, item.id)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 14, padding: 4, opacity: 0.5 }}>🗑</button>
                      )}
                    </div>
                  );
                })}

                {/* Add item form */}
                {isTeacher && addingTo === mod.id && (
                  <div style={{ marginTop: 12, background: '#eff6ff', borderRadius: 10, padding: 14, border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                      {ITEM_TYPES.map(t => (
                        <button key={t.id} type="button" onClick={() => setNewItem(prev => ({ ...prev, type: t.id }))}
                          style={{
                            padding: '5px 12px', borderRadius: 8, border: `2px solid ${newItem.type === t.id ? '#2563eb' : '#e2e8f0'}`,
                            background: newItem.type === t.id ? '#2563eb' : '#fff', color: newItem.type === t.id ? '#fff' : '#334155',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                          }}>{t.icon} {t.label}</button>
                      ))}
                    </div>
                    <input value={newItem.title} onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))} placeholder="Title"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }} />
                    {newItem.type !== 'note' && (
                      <>
                        <input value={newItem.url} onChange={e => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                          placeholder={newItem.type === 'video' ? 'YouTube URL or pick from Studio below' : newItem.type === 'image' ? 'Image URL' : 'URL (https://...)'}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }} />
                        {newItem.type === 'video' && (() => {
                          const studioVideos = getStudioVideosList();
                          return (
                            <div style={{ marginBottom: 6 }}>
                              {studioVideos.length > 0 ? (
                                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>From Video Studio:</div>
                              ) : null}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {studioVideos.slice(0, 8).map((v) => (
                                  <button key={v.id} type="button"
                                    onClick={() => setNewItem(prev => ({ ...prev, url: `studio:${v.id}`, title: prev.title || v.title }))}
                                    style={{
                                      padding: '6px 12px', borderRadius: 8, border: `1px solid ${newItem.url === `studio:${v.id}` ? '#2563eb' : '#e2e8f0'}`,
                                      background: newItem.url === `studio:${v.id}` ? '#eff6ff' : '#fff', color: newItem.url === `studio:${v.id}` ? '#2563eb' : '#334155',
                                      fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180,
                                    }}>
                                    🎬 {v.title}
                                  </button>
                                ))}
                              </div>
                              {studioVideos.length === 0 && (
                                <div style={{ fontSize: 11, color: '#64748b' }}>
                                  <Link to="/video-studio" style={{ color: '#2563eb', fontWeight: 600 }}>🎬 Video Studio</Link> — record or upload videos first
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </>
                    )}
                    {(newItem.type === 'note' || newItem.type === 'file') && (
                      <RichTextEditor value={newItem.body} onChange={(val) => setNewItem(prev => ({ ...prev, body: val }))}
                        placeholder={newItem.type === 'note' ? 'Write your note… Or ✏️ Draw to add a drawing.' : 'Optional description… Or ✏️ Draw.'} compact minHeight={60} prominentDrawButton />
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button type="button" onClick={() => handleAddItem(mod.id)} disabled={!newItem.title.trim()}
                        style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: newItem.title.trim() ? '#2563eb' : '#e2e8f0', color: newItem.title.trim() ? '#fff' : '#94a3b8' }}>
                        Add Item
                      </button>
                      <button type="button" onClick={() => { setAddingTo(null); setNewItem({ type: 'link', title: '', url: '', body: '' }); }}
                        style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Module actions */}
                {isTeacher && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => { setAddingTo(mod.id); setNewItem({ type: 'link', title: '', url: '', body: '' }); }}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px dashed #cbd5e1', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#2563eb' }}>
                      + Add Content
                    </button>
                    <button type="button" onClick={() => togglePublish(mod)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: mod.published === false ? '#059669' : '#ca8a04' }}>
                      {mod.published === false ? '✅ Publish' : '🔒 Unpublish'}
                    </button>
                    <button type="button" onClick={() => setEditingSettings(editingSettings === mod.id ? null : mod.id)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: editingSettings === mod.id ? '#eff6ff' : '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#4f46e5' }}>
                      ⚙ Settings
                    </button>
                    <button type="button" onClick={() => handleDeleteModule(mod.id)}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 12, color: '#dc2626' }}>
                      🗑 Delete
                    </button>
                  </div>
                )}
                {isTeacher && editingSettings === mod.id && (
                  <div style={{ marginTop: 8, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                      Prerequisite:
                      <select value={mod.prerequisiteModuleId || ''} onChange={e => { updateModule(mod.id, { prerequisiteModuleId: e.target.value || null }); reload(); }}
                        style={{ marginLeft: 6, padding: '5px 8px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                        <option value="">None</option>
                        {modules.filter(m => m.id !== mod.id).map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                      </select>
                    </label>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                      Completion:
                      <button type="button" onClick={() => { updateModule(mod.id, { completionRequirement: (mod.completionRequirement || 'all') === 'all' ? 'any' : 'all' }); reload(); }}
                        style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: (mod.completionRequirement || 'all') === 'all' ? '#2563eb' : '#f59e0b', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        {(mod.completionRequirement || 'all') === 'all' ? 'All items' : 'Any 1 item'}
                      </button>
                    </label>
                    {mod.prerequisiteModuleId && (
                      <span style={{ fontSize: 11, color: '#64748b' }}>Requires: {modules.find(m => m.id === mod.prerequisiteModuleId)?.title || 'Unknown'}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
