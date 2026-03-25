import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RichTextEditor, { RichTextViewer } from '../components/RichTextEditor';
import Breadcrumb from '../components/Breadcrumb';
import { showAppToast } from '../utils/appToast';
import {
  getStudentPortfolio,
  createPortfolio,
  addPortfolioPage,
  updatePortfolioPage,
  deletePortfolioPage,
  getPortfolios,
  savePortfolios,
} from '../utils/storage';

const SESSION_KEY = 'quantegy-student-session';

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export default function Portfolio() {
  const { studentId: paramStudentId } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  const currentStudentId = session?.studentId || session?.id;
  const viewingId = paramStudentId || currentStudentId;
  const isOwner = !paramStudentId || paramStudentId === currentStudentId;

  const [portfolio, setPortfolio] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [newPageOpen, setNewPageOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  const reload = useCallback(() => {
    if (!viewingId) return;
    const p = getStudentPortfolio(viewingId);
    setPortfolio(p);
    if (p && p.pages.length && !activePage) {
      setActivePage(p.pages[0].id);
    }
    if (p && activePage && !p.pages.find(pg => pg.id === activePage)) {
      setActivePage(p.pages[0]?.id || null);
    }
  }, [viewingId, activePage]);

  useEffect(() => { reload(); }, [reload]);

  const handleCreate = () => {
    if (!currentStudentId) return;
    const name = session?.name || session?.displayName || 'Student';
    const p = createPortfolio(currentStudentId, name, `${name}'s Portfolio`);
    setPortfolio(p);
    setEditMode(true);
  };

  const handleAddPage = () => {
    if (!portfolio || !newPageTitle.trim()) return;
    const page = addPortfolioPage(portfolio.id, {
      title: newPageTitle.trim(),
      content: '',
      artifacts: [],
    });
    setNewPageTitle('');
    setNewPageOpen(false);
    reload();
    setActivePage(page.id);
  };

  const handleUpdatePage = (pageId, updates) => {
    updatePortfolioPage(portfolio.id, pageId, updates);
    reload();
  };

  const handleDeletePage = (pageId) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    deletePortfolioPage(portfolio.id, pageId);
    reload();
  };

  const handleReorder = (pageId, direction) => {
    const all = getPortfolios();
    const pIdx = all.findIndex(p => p.id === portfolio.id);
    if (pIdx < 0) return;
    const pages = [...all[pIdx].pages];
    const idx = pages.findIndex(pg => pg.id === pageId);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= pages.length) return;
    [pages[idx], pages[swapIdx]] = [pages[swapIdx], pages[idx]];
    all[pIdx].pages = pages;
    savePortfolios(all);
    reload();
  };

  const handleSaveTitle = () => {
    if (!titleDraft.trim()) return;
    const all = getPortfolios();
    const pIdx = all.findIndex(p => p.id === portfolio.id);
    if (pIdx < 0) return;
    all[pIdx].title = titleDraft.trim();
    savePortfolios(all);
    setEditingTitle(false);
    reload();
  };

  const handleAddArtifact = (pageId) => {
    const type = prompt('Artifact type: image, file, or link');
    if (!type || !['image', 'file', 'link'].includes(type.toLowerCase())) return;
    const url = prompt(`Enter ${type} URL:`);
    if (!url) return;
    const title = prompt('Label / title:') || url;
    const page = portfolio.pages.find(pg => pg.id === pageId);
    if (!page) return;
    const artifacts = [...(page.artifacts || []), { type: type.toLowerCase(), url, title }];
    handleUpdatePage(pageId, { artifacts });
  };

  const handleRemoveArtifact = (pageId, artifactIdx) => {
    const page = portfolio.pages.find(pg => pg.id === pageId);
    if (!page) return;
    const artifacts = (page.artifacts || []).filter((_, i) => i !== artifactIdx);
    handleUpdatePage(pageId, { artifacts });
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/portfolio/${viewingId}`;
    navigator.clipboard?.writeText(url);
    showAppToast('Portfolio link copied to clipboard!', { type: 'success' });
  };

  if (!viewingId && !currentStudentId) {
    return (
      <div style={S.container}>
        <div style={S.emptyCenter}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📁</div>
          <h2 style={S.emptyTitle}>ePortfolio</h2>
          <p style={S.emptyDesc}>
            Sign in as a student to create your portfolio, or visit a direct portfolio link.
          </p>
          <Link to="/student" style={S.primaryBtn}>Go to Student Portal</Link>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={S.container}>
        <div style={S.emptyCenter}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📂</div>
          <h2 style={S.emptyTitle}>No Portfolio Yet</h2>
          {isOwner ? (
            <>
              <p style={S.emptyDesc}>
                Showcase your best work, projects, and achievements in a beautiful portfolio.
              </p>
              <button onClick={handleCreate} style={S.primaryBtn}>Create My Portfolio</button>
            </>
          ) : (
            <p style={S.emptyDesc}>This student hasn't created a portfolio yet.</p>
          )}
          <Link to="/student" style={{ ...S.ghostBtn, marginTop: 8 }}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const currentPage = portfolio.pages.find(pg => pg.id === activePage) || null;

  return (
    <div style={S.container}>
      {/* Top bar */}
      <div style={S.topBar}>
        <div style={{ flex: 1 }} />
          {isOwner && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleShareLink} style={S.iconBtn} title="Copy share link">🔗 Share</button>
              <button onClick={() => window.print()} style={S.iconBtn} title="Print portfolio">🖨️ Print</button>
              <button
                onClick={() => setEditMode(!editMode)}
                style={{ ...S.iconBtn, background: editMode ? '#dbeafe' : undefined, color: editMode ? '#2563eb' : undefined }}
              >
                {editMode ? '✓ Done Editing' : '✏️ Edit'}
              </button>
            </div>
          )}
      </div>

      <Breadcrumb items={[
        { label: 'Dashboard', to: '/student' },
        { label: 'Portfolio', to: '/portfolio' },
        ...(activePage && portfolio ? [{ label: (portfolio.pages.find(p => p.id === activePage) || {}).title || 'Page' }] : []),
      ]} />
      {/* Header */}
      <div style={S.header}>
        <div style={S.avatar}>
          {(portfolio.studentName || 'S')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          {editMode && editingTitle ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                style={S.titleInput}
                autoFocus
              />
              <button onClick={handleSaveTitle} style={S.smallBtn}>Save</button>
              <button onClick={() => setEditingTitle(false)} style={S.smallBtnGhost}>Cancel</button>
            </div>
          ) : (
            <h1 style={S.portfolioTitle}>
              {portfolio.title}
              {editMode && (
                <button
                  onClick={() => { setTitleDraft(portfolio.title); setEditingTitle(true); }}
                  style={{ ...S.editPencil, marginLeft: 10 }}
                >✏️</button>
              )}
            </h1>
          )}
          <div style={S.subtitle}>
            {portfolio.studentName} &middot; Created {new Date(portfolio.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={S.layout}>
        {/* Sidebar */}
        <div style={S.sidebar} className="portfolio-sidebar">
          <div style={S.sidebarLabel}>Pages</div>
          {portfolio.pages.map((pg, idx) => (
            <div key={pg.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setActivePage(pg.id)}
                style={{
                  ...S.sidebarItem,
                  background: activePage === pg.id ? '#eff6ff' : 'transparent',
                  color: activePage === pg.id ? '#2563eb' : '#334155',
                  fontWeight: activePage === pg.id ? 700 : 500,
                  borderLeft: activePage === pg.id ? '3px solid #2563eb' : '3px solid transparent',
                }}
              >
                {pg.title || 'Untitled'}
              </button>
              {editMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                  <button
                    onClick={() => handleReorder(pg.id, -1)}
                    disabled={idx === 0}
                    style={{ ...S.tinyBtn, opacity: idx === 0 ? 0.3 : 1 }}
                    title="Move up"
                  >▲</button>
                  <button
                    onClick={() => handleReorder(pg.id, 1)}
                    disabled={idx === portfolio.pages.length - 1}
                    style={{ ...S.tinyBtn, opacity: idx === portfolio.pages.length - 1 ? 0.3 : 1 }}
                    title="Move down"
                  >▼</button>
                </div>
              )}
            </div>
          ))}
          {editMode && (
            <div style={{ marginTop: 12 }}>
              {newPageOpen ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <input
                    value={newPageTitle}
                    onChange={e => setNewPageTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddPage(); if (e.key === 'Escape') setNewPageOpen(false); }}
                    placeholder="Page title…"
                    style={S.sidebarInput}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={handleAddPage} style={S.smallBtn} disabled={!newPageTitle.trim()}>Add</button>
                    <button onClick={() => { setNewPageOpen(false); setNewPageTitle(''); }} style={S.smallBtnGhost}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setNewPageOpen(true)} style={S.addPageBtn}>+ Add Page</button>
              )}
            </div>
          )}
          {portfolio.pages.length === 0 && !editMode && (
            <div style={{ padding: '16px 12px', color: '#94a3b8', fontSize: 13 }}>No pages yet.</div>
          )}
        </div>

        {/* Content area */}
        <div style={S.content}>
          {currentPage ? (
            <PageView
              page={currentPage}
              editMode={editMode && isOwner}
              onUpdate={(updates) => handleUpdatePage(currentPage.id, updates)}
              onDelete={() => handleDeletePage(currentPage.id)}
              onAddArtifact={() => handleAddArtifact(currentPage.id)}
              onRemoveArtifact={(i) => handleRemoveArtifact(currentPage.id, i)}
              onOpenLightbox={setLightboxImg}
            />
          ) : (
            <div style={S.emptyPage}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
              <p style={{ color: '#94a3b8', fontSize: 15 }}>
                {editMode ? 'Add your first page to get started.' : 'Select a page from the sidebar.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div style={S.lightboxOverlay} onClick={() => setLightboxImg(null)}>
          <button onClick={() => setLightboxImg(null)} style={S.lightboxClose}>✕</button>
          <img src={lightboxImg} alt="Enlarged" style={S.lightboxImg} />
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          .portfolio-sidebar { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PageView — single portfolio page (view + edit)
   ═══════════════════════════════════════════════════ */
function PageView({ page, editMode, onUpdate, onDelete, onAddArtifact, onRemoveArtifact, onOpenLightbox }) {
  const [editingPageTitle, setEditingPageTitle] = useState(false);
  const [pageTitleDraft, setPageTitleDraft] = useState(page.title);

  useEffect(() => { setPageTitleDraft(page.title); setEditingPageTitle(false); }, [page.id, page.title]);

  const images = (page.artifacts || []).filter(a => a.type === 'image');
  const files = (page.artifacts || []).filter(a => a.type === 'file');
  const links = (page.artifacts || []).filter(a => a.type === 'link');

  return (
    <div style={S.pageCard}>
      {/* Page title */}
      <div style={S.pageHeader}>
        {editMode && editingPageTitle ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
            <input
              value={pageTitleDraft}
              onChange={e => setPageTitleDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onUpdate({ title: pageTitleDraft.trim() || page.title }); setEditingPageTitle(false); }
                if (e.key === 'Escape') setEditingPageTitle(false);
              }}
              style={S.pageTitleInput}
              autoFocus
            />
            <button onClick={() => { onUpdate({ title: pageTitleDraft.trim() || page.title }); setEditingPageTitle(false); }} style={S.smallBtn}>Save</button>
          </div>
        ) : (
          <h2 style={S.pageTitle}>
            {page.title}
            {editMode && (
              <button onClick={() => setEditingPageTitle(true)} style={S.editPencil}>✏️</button>
            )}
          </h2>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={S.dateBadge}>{new Date(page.createdAt).toLocaleDateString()}</span>
          {editMode && (
            <button onClick={onDelete} style={S.deleteBtn} title="Delete page">🗑️</button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={S.pageBody}>
        {editMode ? (
          <RichTextEditor
            value={page.content || ''}
            onChange={(val) => onUpdate({ content: val })}
            placeholder="Write your page content… Or click ✏️ Draw above to add a drawing, then Insert as image."
            compact
            minHeight={200}
            prominentDrawButton
          />
        ) : (
          page.content ? (
            <RichTextViewer html={page.content} />
          ) : (
            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No content yet.</p>
          )
        )}
      </div>

      {/* Artifacts */}
      {(images.length > 0 || files.length > 0 || links.length > 0 || editMode) && (
        <div style={S.artifactsSection}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={S.artifactsTitle}>Artifacts</h3>
            {editMode && (
              <button onClick={onAddArtifact} style={S.addArtifactBtn}>+ Add Artifact</button>
            )}
          </div>

          {/* Images gallery */}
          {images.length > 0 && (
            <div style={S.gallery}>
              {images.map((a, i) => {
                const globalIdx = (page.artifacts || []).indexOf(a);
                return (
                  <div key={i} style={S.galleryItem}>
                    <img
                      src={a.url}
                      alt={a.title}
                      style={S.galleryImg}
                      onClick={() => onOpenLightbox(a.url)}
                    />
                    <div style={S.galleryLabel}>{a.title}</div>
                    {editMode && (
                      <button onClick={() => onRemoveArtifact(globalIdx)} style={S.removeArtifact}>✕</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div style={{ marginTop: images.length > 0 ? 16 : 0 }}>
              {files.map((a, i) => {
                const globalIdx = (page.artifacts || []).indexOf(a);
                return (
                  <div key={i} style={S.fileRow}>
                    <span style={{ fontSize: 18 }}>📎</span>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={S.fileLink}>{a.title}</a>
                    {editMode && <button onClick={() => onRemoveArtifact(globalIdx)} style={S.removeArtifact}>✕</button>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div style={{ marginTop: (images.length > 0 || files.length > 0) ? 16 : 0 }}>
              {links.map((a, i) => {
                const globalIdx = (page.artifacts || []).indexOf(a);
                return (
                  <div key={i} style={S.fileRow}>
                    <span style={{ fontSize: 18 }}>🔗</span>
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={S.fileLink}>{a.title}</a>
                    {editMode && <button onClick={() => onRemoveArtifact(globalIdx)} style={S.removeArtifact}>✕</button>}
                  </div>
                );
              })}
            </div>
          )}

          {images.length === 0 && files.length === 0 && links.length === 0 && editMode && (
            <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No artifacts yet. Add images, files, or links to showcase your work.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════ */
const S = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f0fdf4 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
  },
  iconBtn: {
    padding: '7px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '32px 32px 24px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    fontWeight: 800,
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
  },
  portfolioTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    border: '2px solid #6366f1',
    borderRadius: 10,
    padding: '6px 14px',
    outline: 'none',
    flex: 1,
    fontFamily: 'inherit',
  },
  editPencil: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    padding: '2px 4px',
    opacity: 0.6,
  },
  layout: {
    display: 'flex',
    gap: 0,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px 48px',
    minHeight: 500,
    width: '100%',
    boxSizing: 'border-box',
  },
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: '#fff',
    borderRadius: '12px 0 0 12px',
    border: '1px solid #e2e8f0',
    borderRight: 'none',
    padding: '16px 0',
    alignSelf: 'flex-start',
    position: 'sticky',
    top: 68,
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    padding: '0 16px 10px',
  },
  sidebarItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 16px',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'all 0.15s',
    background: 'transparent',
    boxSizing: 'border-box',
  },
  sidebarInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #c7d2fe',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  },
  addPageBtn: {
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: '1px dashed #c7d2fe',
    borderRadius: 8,
    cursor: 'pointer',
    color: '#6366f1',
    fontWeight: 700,
    fontSize: 13,
    textAlign: 'center',
    margin: '0 8px',
    boxSizing: 'border-box',
    maxWidth: 'calc(100% - 16px)',
  },
  tinyBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 9,
    padding: '1px 3px',
    color: '#94a3b8',
    lineHeight: 1,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  pageCard: {
    background: '#fff',
    borderRadius: '0 12px 12px 0',
    border: '1px solid #e2e8f0',
    minHeight: 400,
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 28px',
    borderBottom: '1px solid #f1f5f9',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  pageTitleInput: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    border: '2px solid #6366f1',
    borderRadius: 8,
    padding: '4px 12px',
    outline: 'none',
    flex: 1,
    fontFamily: 'inherit',
  },
  dateBadge: {
    fontSize: 12,
    color: '#94a3b8',
    background: '#f1f5f9',
    padding: '4px 10px',
    borderRadius: 6,
    fontWeight: 600,
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid #fecaca',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    padding: '4px 8px',
    color: '#dc2626',
  },
  pageBody: {
    padding: '24px 28px',
    flex: 1,
  },
  artifactsSection: {
    padding: '20px 28px 28px',
    borderTop: '1px solid #f1f5f9',
    background: '#fafbfd',
    borderRadius: '0 0 12px 0',
  },
  artifactsTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: '#475569',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addArtifactBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px dashed #c7d2fe',
    background: '#eef2ff',
    cursor: 'pointer',
    color: '#6366f1',
    fontWeight: 700,
    fontSize: 12,
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 12,
  },
  galleryItem: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
    background: '#fff',
  },
  galleryImg: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
    display: 'block',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  galleryLabel: {
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  removeArtifact: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'rgba(239,68,68,0.9)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    background: '#fff',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    marginBottom: 6,
    position: 'relative',
  },
  fileLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  emptyCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    textAlign: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 8px',
  },
  emptyDesc: {
    color: '#64748b',
    fontSize: 15,
    maxWidth: 400,
    lineHeight: 1.6,
    margin: '0 0 20px',
  },
  emptyPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    background: '#fff',
    borderRadius: '0 12px 12px 0',
    border: '1px solid #e2e8f0',
  },
  primaryBtn: {
    padding: '12px 28px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
  },
  ghostBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  },
  smallBtn: {
    padding: '6px 14px',
    borderRadius: 8,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
  },
  smallBtnGhost: {
    padding: '6px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
  },
  lightboxOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  lightboxClose: {
    position: 'absolute',
    top: 20,
    right: 24,
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#fff',
    fontSize: 24,
    cursor: 'pointer',
    borderRadius: '50%',
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImg: {
    maxWidth: '90vw',
    maxHeight: '85vh',
    borderRadius: 12,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    objectFit: 'contain',
  },
};
