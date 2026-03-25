import React, { useState, useMemo } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import {
  getCommons,
  addToCommons,
  importFromCommons,
  getClasses,
} from '../utils/storage';
import { TEKS_GRADES } from '../data/teks';

const SLATE_50 = '#f8fafc';
const SLATE_200 = '#e2e8f0';
const SLATE_500 = '#64748b';
const SLATE_700 = '#334155';
const SLATE_900 = '#0f172a';
const BLUE = '#2563eb';
const BLUE_LIGHT = '#eff6ff';
const GREEN = '#16a34a';
const GREEN_LIGHT = '#dcfce7';

export default function Commons() {
  const username = localStorage.getItem('quantegy-teacher-user') || '';
  const [commons, setCommons] = useState(() => getCommons());
  const [gradeFilter, setGradeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [importingId, setImportingId] = useState(null);
  const [importClassId, setImportClassId] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [lastImportedId, setLastImportedId] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [shareSourceClassId, setShareSourceClassId] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [shareDescription, setShareDescription] = useState('');
  const [shareGradeId, setShareGradeId] = useState('grade4');
  const [shareIncludeModules, setShareIncludeModules] = useState(true);
  const [shareIncludeAssignments, setShareIncludeAssignments] = useState(true);
  const [shareIncludeAnnouncements, setShareIncludeAnnouncements] = useState(true);
  const [sharing, setSharing] = useState(false);

  const classes = useMemo(() => getClasses().filter((c) => c.teacher === username), [username]);
  const myClasses = getClasses();

  const filtered = useMemo(() => {
    let list = [...commons];
    if (gradeFilter !== 'all') list = list.filter((c) => c.gradeId === gradeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.author || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [commons, gradeFilter, search]);

  const refresh = () => setCommons(getCommons());

  const handleImport = () => {
    if (!importingId || !importClassId) return;
    const result = importFromCommons(importingId, importClassId);
    setImportResult(result);
    setLastImportedId(importingId);
    setImportingId(null);
    setImportClassId('');
  };

  const handleShare = () => {
    if (!shareSourceClassId) return;
    setSharing(true);
    const entry = addToCommons({
      title: shareTitle.trim() || undefined,
      description: shareDescription.trim() || undefined,
      author: username,
      gradeId: shareGradeId || undefined,
      subject: 'math',
      includeModules: shareIncludeModules,
      includeAssignments: shareIncludeAssignments,
      includeAnnouncements: shareIncludeAnnouncements,
      sourceClassId: shareSourceClassId,
    });
    if (entry) {
      refresh();
      setShowShare(false);
      setShareSourceClassId('');
      setShareTitle('');
      setShareDescription('');
    }
    setSharing(false);
  };

  const getGradeLabel = (gradeId) => TEKS_GRADES.find((g) => g.id === gradeId)?.label || gradeId || '—';

  return (
    <TeacherLayout>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: SLATE_900, margin: '0 0 6px' }}>
            📚 Commons
          </h1>
          <p style={{ color: SLATE_500, fontSize: 15, margin: 0 }}>
            Find and import shared content from other teachers, or share your class content to the library.
          </p>
        </div>

        {/* Filters + Share */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: SLATE_700 }}>Grade</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${SLATE_200}`, fontSize: 14 }}
            >
              <option value="all">All grades</option>
              {TEKS_GRADES.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by title, description, or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 220px',
              minWidth: 200,
              padding: '8px 12px',
              borderRadius: 8,
              border: `1px solid ${SLATE_200}`,
              fontSize: 14,
            }}
          />
          <button
            type="button"
            onClick={() => setShowShare(true)}
            style={{
              padding: '10px 18px',
              background: BLUE,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            + Share to Commons
          </button>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', background: SLATE_50, borderRadius: 12, border: `1px solid ${SLATE_200}` }}>
            <p style={{ color: SLATE_500, fontSize: 15, margin: 0 }}>
              {commons.length === 0
                ? 'No shared content yet. Share your first resource using "Share to Commons" above.'
                : 'No results match your filters. Try a different grade or search.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((item) => {
              const modCount = item.content?.modules?.length ?? 0;
              const assignCount = item.content?.assignments?.length ?? 0;
              const annCount = item.content?.announcements?.length ?? 0;
              const isImporting = importingId === item.id;
              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    border: `1px solid ${SLATE_200}`,
                    padding: 18,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: SLATE_900 }}>{item.title}</h3>
                      {item.description && (
                        <p style={{ margin: '6px 0 0', fontSize: 14, color: SLATE_500, lineHeight: 1.4 }}>
                          {item.description.slice(0, 160)}{item.description.length > 160 ? '…' : ''}
                        </p>
                      )}
                      <p style={{ margin: '8px 0 0', fontSize: 12, color: SLATE_500 }}>
                        by {item.author} · {getGradeLabel(item.gradeId)}
                        {' · '}
                        {modCount > 0 && `${modCount} module${modCount !== 1 ? 's' : ''}`}
                        {modCount > 0 && (assignCount > 0 || annCount > 0) && ', '}
                        {assignCount > 0 && `${assignCount} assignment${assignCount !== 1 ? 's' : ''}`}
                        {assignCount > 0 && annCount > 0 && ', '}
                        {annCount > 0 && `${annCount} announcement${annCount !== 1 ? 's' : ''}`}
                        {(modCount + assignCount + annCount) === 0 && 'Empty pack'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!isImporting ? (
                        <button
                          type="button"
                          onClick={() => { setImportingId(item.id); setImportClassId(''); setImportResult(null); }}
                          style={{
                            padding: '8px 16px',
                            background: BLUE_LIGHT,
                            color: BLUE,
                            border: `1px solid ${BLUE}`,
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          Import into class
                        </button>
                      ) : (
                        <>
                          <select
                            value={importClassId}
                            onChange={(e) => setImportClassId(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${SLATE_200}`, fontSize: 14, minWidth: 180 }}
                          >
                            <option value="">Select class...</option>
                            {myClasses.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <button type="button" onClick={handleImport} disabled={!importClassId}
                            style={{ padding: '8px 14px', background: GREEN, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: importClassId ? 'pointer' : 'default', opacity: importClassId ? 1 : 0.6 }}>
                            Import
                          </button>
                          <button type="button" onClick={() => { setImportingId(null); setImportClassId(''); setImportResult(null); setLastImportedId(null); }}
                            style={{ padding: '8px 12px', background: SLATE_50, color: SLATE_700, border: `1px solid ${SLATE_200}`, borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {importResult && lastImportedId === item.id && (
                    <p style={{ margin: '10px 0 0', fontSize: 13, color: GREEN, background: GREEN_LIGHT, padding: '8px 12px', borderRadius: 8 }}>
                      Imported: {importResult.modules} module(s), {importResult.assignments} assignment(s), {importResult.announcements} announcement(s).
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Share modal */}
        {showShare && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => !sharing && setShowShare(false)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                maxWidth: 480,
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                padding: 24,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 800, color: SLATE_900 }}>Share to Commons</h2>
              <p style={{ fontSize: 13, color: SLATE_500, margin: '0 0 16px' }}>
                Publish content from one of your classes so other teachers can import it.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SLATE_700, marginBottom: 4 }}>Source class</label>
                  <select
                    value={shareSourceClassId}
                    onChange={(e) => setShareSourceClassId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${SLATE_200}`, fontSize: 14 }}
                  >
                    <option value="">Select a class...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SLATE_700, marginBottom: 4 }}>Title</label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder="e.g. Grade 4 Fractions Unit"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${SLATE_200}`, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SLATE_700, marginBottom: 4 }}>Description (optional)</label>
                  <textarea
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder="Brief description for other teachers..."
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${SLATE_200}`, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: SLATE_700, marginBottom: 4 }}>Grade level</label>
                  <select
                    value={shareGradeId}
                    onChange={(e) => setShareGradeId(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${SLATE_200}`, fontSize: 14 }}
                  >
                    {TEKS_GRADES.map((g) => (
                      <option key={g.id} value={g.id}>{g.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: SLATE_700 }}>Include</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={shareIncludeModules} onChange={(e) => setShareIncludeModules(e.target.checked)} />
                    <span>Content modules</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={shareIncludeAssignments} onChange={(e) => setShareIncludeAssignments(e.target.checked)} />
                    <span>Assignments</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={shareIncludeAnnouncements} onChange={(e) => setShareIncludeAnnouncements(e.target.checked)} />
                    <span>Announcements</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button type="button" onClick={() => setShowShare(false)} disabled={sharing}
                  style={{ padding: '10px 18px', background: SLATE_50, color: SLATE_700, border: `1px solid ${SLATE_200}`, borderRadius: 8, fontWeight: 600, cursor: sharing ? 'default' : 'pointer' }}>
                  Cancel
                </button>
                <button type="button" onClick={handleShare} disabled={!shareSourceClassId || sharing}
                  style={{ padding: '10px 20px', background: shareSourceClassId && !sharing ? BLUE : SLATE_200, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: shareSourceClassId && !sharing ? 'pointer' : 'default' }}>
                  {sharing ? 'Publishing…' : 'Publish to Commons'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
