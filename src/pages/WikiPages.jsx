import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RichTextEditor from '../components/RichTextEditor.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { getUserFriendlyError } from '../utils/errorMessages';
import { sanitizeHtml } from '../utils/sanitize';

const API = '';
function authHeaders() {
  const token = localStorage.getItem('quantegy-auth-token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function WikiPages() {
  const { classId } = useParams();
  const [pages, setPages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [revisions, setRevisions] = useState([]);
  const [showRevisions, setShowRevisions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPages = async () => {
    try {
      const res = await fetch(`${API}/api/wiki/${classId}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) { setPages(data.pages || []); setError(''); }
    } catch (err) {
      console.warn('Failed to fetch wiki pages:', err);
      setError(getUserFriendlyError(err, 'load wiki pages'));
    }
    setLoading(false);
  };

  useEffect(() => { if (classId) fetchPages(); }, [classId]);

  const selectPage = async (page) => {
    setSelected(page);
    setTitle(page.title);
    setBody(page.body);
    setEditing(false);
    setShowRevisions(false);
    try {
      const res = await fetch(`${API}/api/wiki/${classId}/${page.id}/revisions`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setRevisions(data.revisions || []);
    } catch (err) {
      console.warn('Failed to fetch wiki revisions:', err);
    }
  };

  const savePage = async () => {
    const url = selected
      ? `${API}/api/wiki/${classId}/${selected.id}`
      : `${API}/api/wiki/${classId}`;
    const method = selected ? 'PUT' : 'POST';
    setError('');
    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchPages();
        if (data.page) { setSelected(data.page); setTitle(data.page.title); setBody(data.page.body); }
        setEditing(false);
      }
    } catch (err) {
      console.warn('Failed to save wiki page:', err);
      setError(getUserFriendlyError(err, 'save page'));
    }
  };

  const deletePage = async (id) => {
    if (!confirm('Delete this page?')) return;
    setError('');
    try {
      await fetch(`${API}/api/wiki/${classId}/${id}`, { method: 'DELETE', headers: authHeaders() });
      setSelected(null);
      fetchPages();
    } catch (err) {
      console.warn('Failed to delete wiki page:', err);
      setError(getUserFriendlyError(err, 'delete page'));
    }
  };

  const newPage = () => {
    setSelected(null);
    setTitle('');
    setBody('');
    setEditing(true);
    setShowRevisions(false);
  };

  if (!classId) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Select a class to view wiki pages.</div>;

  const breadcrumbItems = [
    { label: 'Dashboard', to: '/teacher-dashboard' },
    { label: 'Class', to: `/teacher-class/${classId}` },
    { label: 'Wiki', to: `/wiki/${classId}` },
    ...(selected ? [{ label: selected.title || 'Untitled' }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid #e2e8f0', padding: 16, background: '#fff' }}>
        {error && <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0f172a' }}>Pages</h2>
          <button onClick={newPage} style={{ border: 0, background: '#2563eb', color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ New</button>
        </div>
        {loading ? (
          <div style={{ padding: '12px 0' }}>
            <SkeletonLoader variant="text" count={5} />
          </div>
        ) : pages.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No pages yet. Create the first one.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pages.map(p => (
              <li key={p.id} onClick={() => selectPage(p)} style={{
                padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: selected?.id === p.id ? '#eff6ff' : 'transparent',
                color: selected?.id === p.id ? '#2563eb' : '#334155',
                marginBottom: 2,
              }}>
                {p.title || 'Untitled'}
                {p.locked ? ' 🔒' : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, maxWidth: 900 }}>
        <Breadcrumb items={breadcrumbItems} />
        {editing ? (
          <>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Page title" style={{ width: '100%', fontSize: 20, fontWeight: 800, border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }} />
            <RichTextEditor value={body} onChange={setBody} placeholder="Write your page content… Or click ✏️ Draw to add a drawing." compact minHeight={300} prominentDrawButton />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={savePage} style={{ border: 0, background: '#2563eb', color: '#fff', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>{selected ? 'Save Changes' : 'Create Page'}</button>
              <button onClick={() => { setEditing(false); if (selected) { setTitle(selected.title); setBody(selected.body); } }} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
            </div>
          </>
        ) : selected ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: '#0f172a' }}>{selected.title}</h1>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setEditing(true)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => setShowRevisions(!showRevisions)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{showRevisions ? 'Hide History' : 'History'}</button>
                <button onClick={() => deletePage(selected.id)} style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>
              Last edited {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : '—'} by {selected.updatedBy || selected.createdBy}
            </p>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(selected.body || '') }} />
            {showRevisions && (
              <div style={{ marginTop: 16, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Revision History ({revisions.length})</h3>
                {revisions.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>No revisions yet.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {revisions.map((r, i) => (
                      <li key={r.id || i} style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                        <strong>{r.editedBy}</strong> — {new Date(r.createdAt).toLocaleString()}
                        <button onClick={() => { setBody(r.body); setTitle(selected.title); setEditing(true); }} style={{ marginLeft: 10, fontSize: 11, color: '#2563eb', border: 0, background: 'none', cursor: 'pointer', fontWeight: 700 }}>Restore</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>Select a page or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
