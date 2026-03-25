import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/storage';

const QUICK_ACTIONS = [
  { id: 'course-gen', label: 'Generate a full course with AI', icon: '\u2728', path: '/teacher-copilot?tab=course-gen', keywords: 'generate course full complete build curriculum outcomes' },
  { id: 'new-class', label: 'Create a new class', icon: '\u2795', path: '/teacher-class-new', keywords: 'create new class add' },
  { id: 'ai-copilot', label: 'Open AI Copilot', icon: '\uD83E\uDD16', path: '/teacher-copilot', keywords: 'ai copilot assistant lesson plan generate' },
  { id: 'analytics', label: 'View analytics', icon: '\uD83D\uDCCA', path: '/teacher-analytics', keywords: 'analytics dashboard data performance' },
  { id: 'games', label: 'Browse games library', icon: '\uD83C\uDFAE', path: '/games', keywords: 'games library math play' },
  { id: 'staar', label: 'STAAR Prep', icon: '\uD83D\uDCCB', path: '/staar-prep', keywords: 'staar prep test texas' },
  { id: 'texes', label: 'TExES Prep', icon: '\uD83C\uDF93', path: '/texes-prep', keywords: 'texes prep certification teacher' },
  { id: 'praxis', label: 'Praxis Prep', icon: '\uD83D\uDCCB', path: '/praxis-prep', keywords: 'praxis prep multi-state certification' },
  { id: 'ftce', label: 'FTCE Prep', icon: '\uD83C\uDF34', path: '/ftce-prep', keywords: 'ftce florida certification' },
  { id: 'gre', label: 'GRE Prep', icon: '\uD83D\uDCDD', path: '/gre-prep', keywords: 'gre prep graduate exam' },
  { id: 'sat', label: 'SAT Prep', icon: '\uD83D\uDCD6', path: '/sat-prep', keywords: 'sat prep college exam' },
  { id: 'actuary', label: 'Actuary Prep', icon: '\uD83D\uDCCA', path: '/actuary-prep', keywords: 'actuary soa cas exam p fm' },
  { id: 'canada', label: 'Canada Teacher Prep', icon: '\uD83C\uDF41', path: '/canada-prep', keywords: 'canada ontario bc alberta quebec teacher certification' },
  { id: 'accounting', label: 'Accounting Exam Prep', icon: '\uD83D\uDCD2', path: '/accounting-prep', keywords: 'accounting cpa cma cia audit far reg bec' },
  { id: 'england', label: 'England Teacher Prep', icon: '\uD83C\uDFEC', path: '/england-prep', keywords: 'england uk qts teacher certification numeracy literacy' },
  { id: 'australia', label: 'Australia Teacher Prep', icon: '\uD83C\uDDE6\uD83C\uDDFA', path: '/australia-prep', keywords: 'australia lantite teacher certification numeracy literacy' },
  { id: 'newzealand', label: 'New Zealand Teacher Prep', icon: '\uD83C\uDDF3\uD83C\uDDFF', path: '/newzealand-prep', keywords: 'new zealand nz teacher certification teaching council' },
  { id: 'southafrica', label: 'South Africa Teacher Prep', icon: '\uD83C\uDDFF\uD83C\uDDE6', path: '/southafrica-prep', keywords: 'south africa sa teacher certification caps sace' },
  { id: 'india', label: 'India Teacher Prep', icon: '\uD83C\uDDEE\uD83C\uDDF3', path: '/india-prep', keywords: 'india ctet teacher certification tet nep rte' },
  { id: 'china', label: 'China Teacher Prep', icon: '\uD83C\uDDE8\uD83C\uDDF3', path: '/china-prep', keywords: 'china teacher certification 教师资格 exam english chinese' },
  { id: 'scotland', label: 'Scotland Teacher Prep', icon: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F', path: '/scotland-prep', keywords: 'scotland uk teacher certification gtcs cfe' },
  { id: 'wales', label: 'Wales Teacher Prep', icon: '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F', path: '/wales-prep', keywords: 'wales uk teacher certification ewc curriculum' },
  { id: 'northernireland', label: 'Northern Ireland Teacher Prep', icon: '\uD83C\uDDEC\uD83C\uDDE7', path: '/northernireland-prep', keywords: 'northern ireland uk teacher certification gtcni' },
  { id: 'ireland', label: 'Ireland Teacher Prep', icon: '\uD83C\uDDEE\uD83C\uDDEA', path: '/ireland-prep', keywords: 'ireland teacher certification teaching council droichead' },
  { id: 'nigeria', label: 'Nigeria Teacher Prep', icon: '\uD83C\uDDF3\uD83C\uDDEC', path: '/nigeria-prep', keywords: 'nigeria teacher certification trcn ube' },
  { id: 'kenya', label: 'Kenya Teacher Prep', icon: '\uD83C\uDDF0\uD83C\uDDF2', path: '/kenya-prep', keywords: 'kenya teacher certification tsc cbc' },
  { id: 'ghana', label: 'Ghana Teacher Prep', icon: '\uD83C\uDDEC\uD83C\uDDED', path: '/ghana-prep', keywords: 'ghana teacher certification ntc' },
  { id: 'calendar', label: 'Open calendar', icon: '\uD83D\uDCC5', path: '/calendar', keywords: 'calendar schedule pacing' },
  { id: 'marketplace', label: 'Course marketplace', icon: '\uD83D\uDED2', path: '/marketplace', keywords: 'marketplace courses buy sell' },
  { id: 'creator', label: 'Creator dashboard', icon: '\uD83D\uDCB0', path: '/creator-dashboard', keywords: 'creator revenue money courses' },
  { id: 'live-game', label: 'Start a live game', icon: '\uD83D\uDD34', path: '/live-game', keywords: 'live game multiplayer real-time' },
  { id: 'video', label: 'Video studio', icon: '\uD83C\uDFAC', path: '/video-studio', keywords: 'video studio record' },
  { id: 'tools', label: 'Classroom tools', icon: '\uD83D\uDEE0\uFE0F', path: '/classroom-tools', keywords: 'tools timer dice random' },
  { id: 'printables', label: 'Printables', icon: '\uD83D\uDDA8\uFE0F', path: '/printables', keywords: 'printables worksheets pdf' },
  { id: 'pacing', label: 'Pacing guide', icon: '\uD83D\uDCC6', path: '/pacing-guide', keywords: 'pacing guide curriculum scope' },
  { id: 'admin', label: 'Admin dashboard', icon: '\u2699\uFE0F', path: '/admin', keywords: 'admin roi platform' },
];

const AI_PREFIXES = ['create', 'generate', 'make', 'build', 'write', 'plan', 'design'];

const SEARCH_ICONS = { classes: '\uD83D\uDCDA', assignments: '\u270F\uFE0F', students: '\uD83E\uDDD1\u200D\uD83C\uDFEB', wiki: '\uD83D\uDCDD' };

export default function CommandBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setAiResult(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setAiResult(null);
      setSearchResults(null);
      setSelectedIdx(0);
    }
  }, [open]);

  const fetchSearch = useCallback(async (q) => {
    const token = getAuthToken();
    if (!token || !q.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSearchResults(data.results);
      else setSearchResults(null);
    } catch (err) {
      console.warn('Search failed:', err);
      setSearchResults(null);
    }
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(() => fetchSearch(query), 200);
    return () => clearTimeout(t);
  }, [query, fetchSearch]);

  const isAiQuery = query.trim().length > 3 && AI_PREFIXES.some((p) => query.trim().toLowerCase().startsWith(p));

  const searchItems = useMemo(() => {
    if (!searchResults || !query.trim()) return [];
    const items = [];
    (searchResults.classes || []).forEach((c) => {
      items.push({ type: 'class', id: c.id, label: c.name, sub: 'Class', path: `/teacher-class/${c.id}` });
    });
    (searchResults.assignments || []).forEach((a) => {
      items.push({ type: 'assignment', id: a.id, label: a.name || a.title, sub: 'Assignment', path: `/teacher-class/${a.classId}`, classId: a.classId });
    });
    (searchResults.students || []).forEach((s) => {
      items.push({ type: 'student', id: s.id, label: s.displayName || s.username, sub: 'Student', path: `/teacher-dashboard` });
    });
    (searchResults.wiki || []).forEach((w) => {
      items.push({ type: 'wiki', id: w.id, label: w.title, sub: 'Wiki', path: `/wiki/${w.classId}/${w.id}` });
    });
    return items.slice(0, 20);
  }, [searchResults, query]);

  const filtered = query.trim()
    ? QUICK_ACTIONS.filter((a) => {
        const q = query.toLowerCase();
        return a.label.toLowerCase().includes(q) || a.keywords.includes(q);
      })
    : QUICK_ACTIONS.slice(0, 8);

  const handleSelect = (action) => {
    setOpen(false);
    setQuery('');
    if (action.path) navigate(action.path);
  };

  const handleAiAction = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const resp = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, gradeLevel: 'Grade 3', teksStandard: '' }),
      });
      const data = await resp.json();
      setAiResult(data.plan || data.result || data.text || 'Done! Check your AI Copilot for full results.');
    } catch (err) {
      console.warn('AI lesson plan failed:', err);
      setAiResult('Could not reach AI. Try again or use the AI Copilot page.');
    }
    setAiLoading(false);
  };

  const displayItems = searchItems.length > 0 ? searchItems : filtered;
  const isSearchMode = searchItems.length > 0;

  const handleKeyDown = (e) => {
    const items = isAiQuery ? [] : displayItems;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, Math.max(0, items.length - 1))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (isAiQuery) handleAiAction();
      else if (items[selectedIdx]) {
        const item = items[selectedIdx];
        handleSelect(isSearchMode ? { path: item.path } : item);
      }
    }
  };

  useEffect(() => { setSelectedIdx(0); }, [query, searchItems]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} style={{
        position: 'fixed', bottom: 88, right: 20, zIndex: 9998,
        padding: '10px 16px', borderRadius: 12,
        background: '#0f172a', color: '#fff', border: 'none',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', gap: 8,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
      >
        <span style={{ fontSize: 15 }}>{'\u2318'}</span> Command
        <kbd style={{
          padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.15)',
          fontSize: 10, fontWeight: 700, fontFamily: 'system-ui',
        }}>Ctrl+K</kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => { setOpen(false); setAiResult(null); }} aria-hidden="true" style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)', zIndex: 99999,
      }} />

      {/* Modal */}
      <div role="dialog" aria-modal="true" aria-label="Command palette" style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: 560, zIndex: 100000,
        background: '#fff', borderRadius: 16, boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        overflow: 'hidden', animation: 'cmdbar-in 0.15s ease-out',
      }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: 18, color: '#94a3b8' }} aria-hidden="true">{'\uD83D\uDD0D'}</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type a command or "Create a lesson on fractions"...'
            aria-label="Search commands or ask AI"
            role="combobox"
            aria-expanded={filtered.length > 0}
            aria-autocomplete="list"
            aria-controls="command-results"
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 16, fontWeight: 500,
              color: '#0f172a', background: 'transparent',
            }}
          />
          <kbd style={{
            padding: '4px 8px', borderRadius: 4, background: '#f1f5f9',
            fontSize: 11, fontWeight: 600, color: '#94a3b8', border: '1px solid #e2e8f0',
          }}>ESC</kbd>
        </div>

        {/* AI query detected */}
        {isAiQuery && !aiResult && (
          <div style={{ padding: '16px 20px' }}>
            <button type="button" onClick={handleAiAction} disabled={aiLoading} style={{
              width: '100%', padding: '14px 20px', borderRadius: 10, border: 'none',
              background: aiLoading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #2563eb)',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: aiLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>{'\u2728'}</span>
              {aiLoading ? 'AI is working...' : `AI: "${query}"`}
            </button>
            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 8 }}>
              Press Enter to send to AI Copilot
            </div>
          </div>
        )}

        {/* AI result */}
        {aiResult && (
          <div style={{ padding: '16px 20px', maxHeight: 300, overflowY: 'auto' }}>
            <div style={{
              padding: 16, borderRadius: 10, background: '#f5f3ff', border: '1px solid #e9d5ff',
              fontSize: 13, color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {aiResult}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" onClick={() => { setOpen(false); setAiResult(null); navigate('/teacher-copilot'); }} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', background: '#7c3aed',
                color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}>Open in Copilot</button>
              <button type="button" onClick={() => setAiResult(null)} style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>New Query</button>
            </div>
          </div>
        )}

        {/* Search results or Quick actions */}
        {!isAiQuery && !aiResult && (
          <div id="command-results" role="listbox" aria-label="Command results" style={{ padding: '8px 0', maxHeight: 320, overflowY: 'auto' }}>
            {searchLoading && (
              <div style={{ padding: '16px 20px', color: '#94a3b8', fontSize: 13 }}>Searching...</div>
            )}
            {!searchLoading && displayItems.length === 0 && (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                {query.trim().length >= 2 ? 'No content found. Try a different search.' : 'No matching actions. Try typing "create..." to use AI.'}
              </div>
            )}
            {!searchLoading && displayItems.length > 0 && (
              <>
                {isSearchMode && (
                  <div style={{ padding: '6px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Search results
                  </div>
                )}
                {displayItems.map((item, i) => {
                  const icon = isSearchMode ? (SEARCH_ICONS[item.type] || '\uD83D\uDD0D') : item.icon;
                  const label = isSearchMode ? item.label : item.label;
                  const sub = isSearchMode ? item.sub : null;
                  const path = isSearchMode ? item.path : item.path;
                  return (
                    <button
                      key={isSearchMode ? `${item.type}-${item.id}` : item.id}
                      type="button"
                      role="option"
                      aria-selected={i === selectedIdx}
                      onClick={() => handleSelect(isSearchMode ? { path } : item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        padding: '10px 20px', border: 'none', cursor: 'pointer',
                        background: i === selectedIdx ? '#f1f5f9' : 'transparent',
                        color: '#0f172a', fontSize: 14, fontWeight: 500, textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={() => setSelectedIdx(i)}
                    >
                      <span style={{
                        width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: i === selectedIdx ? '#eff6ff' : '#f8fafc', fontSize: 16,
                      }}>{icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500 }}>{label}</div>
                        {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
                      </div>
                      {i === selectedIdx && (
                        <kbd style={{
                          padding: '2px 6px', borderRadius: 3, background: '#e2e8f0',
                          fontSize: 10, fontWeight: 600, color: '#94a3b8',
                        }}>{'\u21B5'}</kbd>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Footer hint */}
        <div style={{
          padding: '10px 20px', borderTop: '1px solid #f1f5f9', display: 'flex',
          alignItems: 'center', gap: 16, fontSize: 11, color: '#94a3b8',
        }}>
          <span>{'\u2191\u2193'} Navigate</span>
          <span>{'\u21B5'} Select</span>
          <span>Type "create..." for AI</span>
        </div>
      </div>

      <style>{`
        @keyframes cmdbar-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
