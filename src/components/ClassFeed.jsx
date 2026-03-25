import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import RichTextEditor, { RichTextViewer } from './RichTextEditor';
import {
  getClassAnnouncements, addAnnouncement, deleteAnnouncement,
  getClassDiscussions, addDiscussion, addReply, deleteDiscussion, deleteReply,
  toggleReplyLike, gradeDiscussion,
  getClassMuddiestActivities, addMuddiestActivity, deleteMuddiestActivity,
  getResponsesForActivity, addMuddiestResponse, hasStudentResponded,
  getClassMinutePaperActivities, addMinutePaperActivity, deleteMinutePaperActivity,
  getResponsesForMinutePaper, addMinutePaperResponse, hasStudentRespondedToMinutePaper,
  getClass321Activities, add321Activity, delete321Activity,
  getResponsesFor321, add321Response, hasStudentResponded321,
  getClassTPSActivities, addTPSActivity, deleteTPSActivity,
  getThinkResponsesForTPS, addTPSThinkResponse, hasStudentThinkTPS,
  getPairResponsesForTPS, addTPSPairResponse, getPairForStudent,
  getClassExitTicketActivities, addExitTicketActivity, deleteExitTicketActivity,
  getResponsesForExitTicket, addExitTicketResponse, hasStudentRespondedExitTicket,
  getPeerReviewsForReply, addPeerReview, hasStudentReviewedReply,
} from '../utils/storage';
import { getStudioVideosList } from '../utils/videoStudio';
import StudioVideoPlayer from './StudioVideoPlayer';
import { uploadFile } from '../utils/fileUpload';

/* ── Rich content has text and/or images (drawings). Don't require plain text only. ── */
function hasSubstance(html) {
  if (!(html || '').trim()) return false;
  const stripped = (html || '').replace(/<[^>]*>/g, '').trim();
  if (stripped) return true;
  return /<img\s/i.test(html || '');
}

/* ═══════════════════════════════════════════════════════════════
   CLASS FEED — Announcements + Threaded Discussions + Grading
   Interactive, animated, gradable communication hub
   ═══════════════════════════════════════════════════════════════ */

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const EMOJI_REACTIONS = ['👍', '❤️', '🎉', '💡', '🤔', '👏'];

const RUBRIC = [
  { score: 5, label: 'Exceptional', color: '#059669', desc: 'Thorough, insightful, advances the conversation', emoji: '🌟' },
  { score: 4, label: 'Proficient', color: '#2563eb', desc: 'Clear and on-topic, shows understanding', emoji: '✅' },
  { score: 3, label: 'Developing', color: '#d97706', desc: 'Relevant but lacking depth or detail', emoji: '📝' },
  { score: 2, label: 'Emerging', color: '#ea580c', desc: 'Minimal effort, off-topic, or vague', emoji: '⚠️' },
  { score: 1, label: 'Incomplete', color: '#dc2626', desc: 'Did not meaningfully participate', emoji: '❌' },
];

const AVATAR_COLORS = [
  'linear-gradient(135deg,#2563eb,#7c3aed)', 'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#d97706,#f59e0b)', 'linear-gradient(135deg,#dc2626,#f43f5e)',
  'linear-gradient(135deg,#7c3aed,#a855f7)', 'linear-gradient(135deg,#0891b2,#06b6d4)',
];
function avatarColor(id) { let h = 0; for (let i = 0; i < (id || '').length; i++) h = id.charCodeAt(i) + ((h << 5) - h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]; }

function FadeIn({ children, delay = 0 }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);
  return <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)', transition: 'all 0.3s ease' }}>{children}</div>;
}

function formatBody(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const parts = [];
    const re = /(\*\*(.+?)\*\*)|(`(.+?)`)/g;
    let last = 0, m;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index} style={{ color: '#0f172a' }}>{m[2]}</strong>);
      if (m[4]) parts.push(<code key={m.index} style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4, fontSize: 13, color: '#7c3aed' }}>{m[4]}</code>);
      last = re.lastIndex;
    }
    if (last < line.length) parts.push(line.slice(last));
    return <span key={i}>{parts.length ? parts : line}{i < text.split('\n').length - 1 && <br/>}</span>;
  });
}

export default function ClassFeed({ classId, cls, isTeacher = true, studentId = null, studentName = null }) {
  const { t: tr } = useLanguage();
  const [subTab, setSubTab] = useState(isTeacher ? 'announcements' : 'discussions');
  const [refresh, setRefresh] = useState(0);
  const bump = () => setRefresh(r => r + 1);

  const announcements = useMemo(() => getClassAnnouncements(classId) || [], [classId, refresh]);
  const discussions = useMemo(() => (getClassDiscussions(classId) || []), [classId, refresh]);
  const muddiestActivities = useMemo(() => getClassMuddiestActivities(classId) || [], [classId, refresh]);
  const minutePaperActivities = useMemo(() => getClassMinutePaperActivities(classId) || [], [classId, refresh]);
  const activity321 = useMemo(() => getClass321Activities(classId) || [], [classId, refresh]);
  const tpsActivities = useMemo(() => getClassTPSActivities(classId) || [], [classId, refresh]);
  const exitTicketActivities = useMemo(() => getClassExitTicketActivities(classId) || [], [classId, refresh]);

  const students = cls?.students || [];
  const userId = isTeacher ? 'teacher' : studentId;
  const userName = isTeacher ? 'Teacher' : (studentName || 'Student');

  const totalUngraded = discussions.reduce((c, d) => {
    const studentReplies = (d.replies || []).filter(r => r.authorId !== 'teacher');
    const ungraded = [...new Set(studentReplies.map(r => r.authorId))].filter(sid => !d.grades?.[sid]);
    return c + ungraded.length;
  }, 0);

  return (
    <div>
      <style>{`
        @keyframes feedSlideIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes feedPulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.15) } }
        @keyframes feedShake { 0%,100% { transform:rotate(0) } 25% { transform:rotate(-5deg) } 75% { transform:rotate(5deg) } }
        .feed-card { animation: feedSlideIn 0.3s ease; }
        .feed-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; }
        .emoji-btn { transition: transform 0.15s; }
        .emoji-btn:hover { transform: scale(1.3); }
        .emoji-btn:active { animation: feedPulse 0.3s; }
        .feed-tab-btn { position: relative; transition: all 0.2s; }
        .feed-tab-btn:hover { transform: translateY(-1px); }
        @media (prefers-reduced-motion: reduce) { .feed-card, .emoji-btn, .feed-tab-btn { animation: none !important; transition: none !important; } }
      `}</style>

      {/* Sub-tabs: horizontal scroll so Announcements is always visible */}
      <nav role="tablist" aria-label="Class feed sections" style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', flexWrap: 'nowrap', paddingBottom: 4, minHeight: 44 }}>
        {[
          { id: 'announcements', emoji: '📢', labelKey: 'announcements', count: announcements.length, color: '#2563eb' },
          { id: 'discussions', emoji: '💬', labelKey: 'discussions', count: discussions.length, color: '#7c3aed' },
          { id: 'muddiest', emoji: '❓', labelKey: 'muddiestPoint', count: muddiestActivities.length, color: '#ea580c' },
          { id: 'minutepaper', emoji: '📋', labelKey: 'minutePaper', count: minutePaperActivities.length, color: '#0891b2' },
          { id: '321', emoji: '', labelKey: 'activity321', count: activity321.length, color: '#16a34a' },
          { id: 'tps', emoji: '🤝', labelKey: 'thinkPairShare', count: tpsActivities.length, color: '#a855f7' },
          { id: 'exitticket', emoji: '🎫', labelKey: 'exitTicket', count: exitTicketActivities.length, color: '#f59e0b' },
          ...(isTeacher ? [{ id: 'grading', emoji: '📝', labelKey: 'grade', count: totalUngraded || null, color: '#059669' }] : []),
        ].map(tab => (
          <button key={tab.id} type="button" role="tab" aria-selected={subTab === tab.id} aria-controls={`panel-${tab.id}`} id={`tab-${tab.id}`} className="feed-tab-btn" onClick={() => setSubTab(tab.id)} style={{
            flexShrink: 0, padding: '10px 18px', borderRadius: 12, border: subTab === tab.id ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
            background: subTab === tab.id ? `${tab.color}08` : '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: subTab === tab.id ? 700 : 500, color: subTab === tab.id ? tab.color : '#334155',
            boxShadow: subTab === tab.id ? `0 2px 8px ${tab.color}20` : 'none',
          }}>
            {tab.emoji}{tab.emoji ? ' ' : ''}{tr(tab.labelKey)}
            {tab.count != null && tab.count > 0 && (
              <span style={{
                marginLeft: 6, padding: '2px 7px', borderRadius: 10, fontSize: 10, fontWeight: 800,
                background: subTab === tab.id ? tab.color : '#e2e8f0', color: subTab === tab.id ? '#fff' : '#64748b',
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div role="tabpanel" id="panel-announcements" aria-labelledby="tab-announcements" hidden={subTab !== 'announcements'} style={{ display: subTab !== 'announcements' ? 'none' : undefined }}>
      {subTab === 'announcements' && <AnnouncementsTab classId={classId} announcements={announcements} isTeacher={isTeacher} bump={bump} userName={userName} userId={userId} />}
      </div>
      <div role="tabpanel" id="panel-discussions" aria-labelledby="tab-discussions" hidden={subTab !== 'discussions'} style={{ display: subTab !== 'discussions' ? 'none' : undefined }}>
      {subTab === 'discussions' && <>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', marginBottom: 14, fontSize: 12, color: '#2563eb', fontWeight: 600 }}>Click the <strong>💬 View & Reply</strong> button or the title/icon to expand. Use the reply bar below or <strong>Reply (text or media)</strong> for full form. Add <strong>📹 videos</strong> via URL, upload, or <strong>🎬 From Studio</strong> (record in Video Studio first).</div>
        <DiscussionsTab classId={classId} cls={cls} discussions={discussions} isTeacher={isTeacher} bump={bump} userId={userId} userName={userName} students={students} />
      </>}
      </div>
      <div role="tabpanel" id="panel-muddiest" aria-labelledby="tab-muddiest" hidden={subTab !== 'muddiest'} style={{ display: subTab !== 'muddiest' ? 'none' : undefined }}>
      {subTab === 'muddiest' && <MuddiestPointTab classId={classId} activities={muddiestActivities} isTeacher={isTeacher} bump={bump} studentId={studentId} studentName={userName} students={students} />}
      </div>
      <div role="tabpanel" id="panel-minutepaper" aria-labelledby="tab-minutepaper" hidden={subTab !== 'minutepaper'} style={{ display: subTab !== 'minutepaper' ? 'none' : undefined }}>
      {subTab === 'minutepaper' && <MinutePaperTab classId={classId} activities={minutePaperActivities} isTeacher={isTeacher} bump={bump} studentId={studentId} studentName={userName} students={students} />}
      </div>
      <div role="tabpanel" id="panel-321" aria-labelledby="tab-321" hidden={subTab !== '321'} style={{ display: subTab !== '321' ? 'none' : undefined }}>
      {subTab === '321' && <Activity321Tab classId={classId} activities={activity321} isTeacher={isTeacher} bump={bump} studentId={studentId} studentName={userName} students={students} />}
      </div>
      <div role="tabpanel" id="panel-tps" aria-labelledby="tab-tps" hidden={subTab !== 'tps'} style={{ display: subTab !== 'tps' ? 'none' : undefined }}>
      {subTab === 'tps' && <TPSTab classId={classId} activities={tpsActivities} isTeacher={isTeacher} bump={bump} studentId={studentId} studentName={userName} students={students} />}
      </div>
      <div role="tabpanel" id="panel-exitticket" aria-labelledby="tab-exitticket" hidden={subTab !== 'exitticket'} style={{ display: subTab !== 'exitticket' ? 'none' : undefined }}>
      {subTab === 'exitticket' && <ExitTicketTab classId={classId} activities={exitTicketActivities} isTeacher={isTeacher} bump={bump} studentId={studentId} studentName={userName} students={students} />}
      </div>
      <div role="tabpanel" id="panel-grading" aria-labelledby="tab-grading" hidden={subTab !== 'grading'} style={{ display: subTab !== 'grading' ? 'none' : undefined }}>
      {subTab === 'grading' && isTeacher && <GradingTab classId={classId} cls={cls} discussions={discussions} students={students} bump={bump} />}
      </div>
    </div>
  );
}

/* ── Announcements Tab ── */
function AnnouncementsTab({ classId, announcements, isTeacher, bump, userName, userId }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [pinned, setPinned] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [readCounts, setReadCounts] = useState({});

  const TOKEN_KEY = 'quantegy-auth-token';
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  // Teacher: fetch read counts for each announcement
  useEffect(() => {
    if (!isTeacher) return;
    const token = getToken();
    if (!token) return;
    announcements.forEach((ann) => {
      fetch(`/api/announcements/${ann.id}/reads`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.count !== undefined) setReadCounts((prev) => ({ ...prev, [ann.id]: data.count }));
        })
        .catch(() => {});
    });
  }, [isTeacher, announcements]);

  // Student: mark announcements as read when they enter the viewport
  const observerRef = useRef(null);
  const markedRef = useRef(new Set());

  useEffect(() => {
    if (isTeacher) return;
    const token = getToken();
    if (!token) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const annId = entry.target.dataset.annId;
            if (annId && !markedRef.current.has(annId)) {
              markedRef.current.add(annId);
              fetch(`/api/announcements/${annId}/mark-read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => {});
            }
          }
        });
      },
      { threshold: 0.5 },
    );
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [isTeacher]);

  const handlePost = () => {
    if (!title.trim()) return;
    addAnnouncement({ classId, title: title.trim(), body: body.trim(), author: userName, priority, pinned });
    setTitle(''); setBody(''); setShowForm(false); setPinned(false); setPriority('normal');
    bump();
  };

  const priorityConfig = {
    urgent: { color: '#ef4444', icon: '🚨', bg: '#fef2f2' },
    important: { color: '#d97706', icon: '⚡', bg: '#fffbeb' },
    normal: { color: '#2563eb', icon: '📢', bg: '#eff6ff' },
  };

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div>
      {isTeacher && !showForm && (
        <button type="button" onClick={() => setShowForm(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New Announcement
        </button>
      )}

      {showForm && (
        <FadeIn>
          <div style={{ ...cardStyle, border: '2px solid #2563eb', background: '#fafbff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>📢</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>New Announcement</span>
            </div>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..."
              style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }} autoFocus maxLength={120} />
            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>{title.length}/120</div>
            <div style={{ marginTop: 4 }}>
              <RichTextEditor value={body} onChange={setBody} placeholder="Type here. To add a drawing: use your pen in this box (opens drawing panel) or click ✏️ Draw above — then click “Insert as image” to embed the figure (not convert to text)." compact minHeight={100} prominentDrawButton />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['normal', 'important', 'urgent'].map(p => (
                  <button key={p} type="button" onClick={() => setPriority(p)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: priority === p ? `2px solid ${priorityConfig[p].color}` : '1px solid #e2e8f0',
                    background: priority === p ? priorityConfig[p].bg : '#fff',
                    color: priority === p ? priorityConfig[p].color : '#64748b',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>{priorityConfig[p].icon} {p.charAt(0).toUpperCase() + p.slice(1)}</button>
                ))}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: pinned ? '#d97706' : '#94a3b8' }}>
                <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} />
                📌 Pin to top
              </label>
              <div style={{ flex: 1 }} />
              <button type="button" onClick={() => { setShowForm(false); setTitle(''); setBody(''); }} style={cancelBtnStyle}>Cancel</button>
              <button type="button" onClick={handlePost} disabled={!title.trim()} style={{
                ...postBtnStyle, opacity: title.trim() ? 1 : 0.4,
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}>
                📢 Post Announcement
              </button>
            </div>
          </div>
        </FadeIn>
      )}

      {sorted.length === 0 && (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No announcements yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Post an announcement to keep your class informed.' : 'Your teacher hasn\'t posted any announcements yet.'}
          </div>
        </div>
      )}

      {sorted.map((ann, idx) => {
        const cfg = priorityConfig[ann.priority] || priorityConfig.normal;
        return (
          <FadeIn key={ann.id} delay={idx * 60}>
            <div className="feed-card" data-ann-id={ann.id} ref={(el) => {
              if (el && observerRef.current && !isTeacher) observerRef.current.observe(el);
            }} style={{
              ...cardStyle, borderLeft: `4px solid ${cfg.color}`,
              background: ann.pinned ? '#fffbeb' : '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: avatarColor(ann.author),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0,
                }}>{ann.author?.[0]?.toUpperCase() || 'T'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {ann.pinned && <span title="Pinned" style={{ fontSize: 14, animation: 'feedShake 0.5s' }}>📌</span>}
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{ann.title}</span>
                    {ann.priority !== 'normal' && (
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                        background: cfg.bg, color: cfg.color, textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{cfg.icon} {ann.priority}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                    <strong style={{ color: '#64748b' }}>{ann.author}</strong> · {timeAgo(ann.createdAt)}
                  </div>
                  {ann.body && (
                    <div style={{ fontSize: 14, color: '#334155', marginTop: 10, lineHeight: 1.7 }}>
                      {(ann.body.startsWith('<') || ann.body.includes('<img')) ? <RichTextViewer html={ann.body} /> : formatBody(ann.body)}
                    </div>
                  )}

                  {/* Emoji reactions row */}
                  <EmojiReactions itemId={ann.id} userId={userId} storageKey={`ann-reactions-${ann.id}`} />
                </div>
                {isTeacher && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {readCounts[ann.id] !== undefined && (
                      <span title="Students who read this" style={{
                        padding: '3px 9px', borderRadius: 10, background: '#eff6ff',
                        color: '#2563eb', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                      }}>👁 {readCounts[ann.id]} read</span>
                    )}
                    <div style={{ position: 'relative' }}>
                      {confirmDelete === ann.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button type="button" onClick={() => { deleteAnnouncement(ann.id); bump(); setConfirmDelete(null); }}
                            style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                          <button type="button" onClick={() => setConfirmDelete(null)}
                            style={{ padding: '4px 10px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>No</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmDelete(ann.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 18, padding: 4 }} title="Delete">⋮</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}

/* ── Emoji Reactions (shared component) ── */
function EmojiReactions({ itemId, userId, storageKey }) {
  const [reactions, setReactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });
  const [showPicker, setShowPicker] = useState(false);

  const toggle = (emoji) => {
    setReactions(prev => {
      const updated = { ...prev };
      if (!updated[emoji]) updated[emoji] = [];
      const idx = updated[emoji].indexOf(userId);
      if (idx >= 0) updated[emoji].splice(idx, 1);
      else updated[emoji].push(userId);
      if (updated[emoji].length === 0) delete updated[emoji];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setShowPicker(false);
  };

  const activeReactions = Object.entries(reactions).filter(([, users]) => users.length > 0);

  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      {activeReactions.map(([emoji, users]) => {
        const hasReacted = users.includes(userId);
        return (
          <button key={emoji} type="button" className="emoji-btn" onClick={() => toggle(emoji)} style={{
            padding: '3px 10px', borderRadius: 20, border: hasReacted ? '2px solid #2563eb' : '1px solid #e2e8f0',
            background: hasReacted ? '#eff6ff' : '#f8fafc', cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {emoji} <span style={{ fontSize: 11, fontWeight: 700, color: hasReacted ? '#2563eb' : '#64748b' }}>{users.length}</span>
          </button>
        );
      })}
      <div style={{ position: 'relative' }}>
        <button type="button" onClick={() => setShowPicker(!showPicker)} style={{
          width: 28, height: 28, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#f8fafc',
          cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', transition: 'all 0.15s',
        }} title="Add reaction">+</button>
        {showPicker && (
          <div style={{
            position: 'absolute', bottom: 32, left: 0, background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: 8, display: 'flex', gap: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10,
          }}>
            {EMOJI_REACTIONS.map(e => (
              <button key={e} type="button" className="emoji-btn" onClick={() => toggle(e)}
                style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Muddiest Point Tab ── */
const muddiestTimeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

function MuddiestPointTab({ classId, activities, isTeacher, bump, studentId, studentName, students }) {
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleCreate = () => {
    if (!prompt.trim()) return;
    addMuddiestActivity({ classId, prompt: prompt.trim(), topic: topic.trim() || null, anonymous });
    setPrompt(''); setTopic(''); setShowCreate(false);
    bump();
  };

  return (
    <div>
      <section aria-labelledby="muddiest-heading">
      <p id="muddiest-heading" style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#9a3412', fontWeight: 600 }}>
        <strong>Muddiest Point</strong> — A quick check: students identify what they found most confusing. Use after a lesson to surface misconceptions.
      </p>

      {isTeacher && !showCreate && (
        <button type="button" aria-label="Create new muddiest point activity" onClick={() => setShowCreate(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#ea580c,#c2410c)', boxShadow: '0 4px 14px rgba(234,88,12,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New Muddiest Point
        </button>
      )}

      {showCreate && isTeacher && (
        <div style={{ ...cardStyle, border: '2px solid #ea580c', background: '#fff7ed', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>❓</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Muddiest Point</span>
          </div>
          <label htmlFor="muddiest-topic" className="sr-only">Topic</label>
          <input id="muddiest-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g. Equivalent Fractions)" aria-label="Topic for muddiest point activity"
            style={{ ...inputStyle, fontSize: 14, marginBottom: 8 }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', marginBottom: 4 }}>Prompt</div>
          <RichTextEditor value={prompt} onChange={setPrompt}
            placeholder="What was the muddiest point in today's lesson? Click ∑ for math" compact minHeight={60} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 13, fontWeight: 600, color: '#9a3412', cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
            Allow anonymous responses
          </label>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button type="button" onClick={() => { setShowCreate(false); setPrompt(''); setTopic(''); }} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleCreate} disabled={!prompt.trim()} style={{
              ...postBtnStyle, background: prompt.trim() ? 'linear-gradient(135deg,#ea580c,#c2410c)' : '#e2e8f0',
              color: prompt.trim() ? '#fff' : '#94a3b8',
            }}>Create</button>
          </div>
        </div>
      )}

      {activities.length === 0 && !showCreate ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>❓</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No muddiest point activities yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Create one to quickly check what students found confusing.' : 'Your teacher hasn\'t created any yet.'}
          </div>
        </div>
      ) : (
        activities.map((act) => (
          <MuddiestPointCard
            key={act.id}
            activity={act}
            isTeacher={isTeacher}
            studentId={studentId}
            studentName={studentName}
            students={students}
            isOpen={openId === act.id}
            onToggle={() => setOpenId(openId === act.id ? null : act.id)}
            bump={bump}
          />
        ))
      )}
      </section>
    </div>
  );
}

function MuddiestPointCard({ activity, isTeacher, studentId, studentName, students, isOpen, onToggle, bump }) {
  const [response, setResponse] = useState('');
  const responses = getResponsesForActivity(activity.id);
  const hasSubmitted = studentId ? hasStudentResponded(activity.id, studentId) : false;

  const handleSubmit = () => {
    if (!studentId || !hasSubstance(response)) return;
    addMuddiestResponse(activity.id, {
      studentId,
      studentName: activity.anonymous ? 'Anonymous' : studentName,
      response,
      anonymous: activity.anonymous,
    });
    setResponse('');
    bump();
  };

  const responseCount = responses.length;
  const totalStudents = students?.length || 0;
  const muddiestHasContent = hasSubstance(response);

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: isOpen ? '2px solid #ea580c' : '1px solid #e2e8f0',
      overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <button type="button" style={{ width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={onToggle} aria-expanded={isOpen} aria-controls={`muddiest-content-${activity.id}`} aria-label={`${activity.topic || 'Muddiest Point'}, ${responseCount} responses. ${isOpen ? 'Collapse' : 'Expand'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#ea580c,#c2410c)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }} aria-hidden="true">❓</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{activity.topic || 'Muddiest Point'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{activity.prompt}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              {muddiestTimeAgo(activity.createdAt)} · {responseCount} response{responseCount !== 1 ? 's' : ''}
              {totalStudents > 0 && ` · ${responseCount}/${totalStudents} submitted`}
              {!isTeacher && hasSubmitted && ' · ✓ You responded'}
            </div>
          </div>
          <span style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: isOpen ? '#fff7ed' : '#ea580c', color: isOpen ? '#ea580c' : '#fff',
          }}>{isOpen ? '▲' : '▶'} {isOpen ? 'Close' : 'Open'}</span>
        </div>
      </button>

      {isOpen && (
        <div id={`muddiest-content-${activity.id}`} role="region" aria-label="Activity content" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#fafaf9' }}>
          {!isTeacher && !hasSubmitted && (
            <div style={{ marginBottom: 16 }}>
              <RichTextEditor value={response} onChange={setResponse}
                placeholder="Type text and/or use ✏️ Draw above to add a drawing (insert as image)." compact minHeight={60} prominentDrawButton />
              <button type="button" onClick={handleSubmit} disabled={!muddiestHasContent}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: muddiestHasContent ? 'linear-gradient(135deg,#ea580c,#c2410c)' : '#e2e8f0',
                  color: muddiestHasContent ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: muddiestHasContent ? 'pointer' : 'default',
                }}>
                Submit
              </button>
            </div>
          )}

          {responses.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
              No responses yet.
            </div>
          ) : (
            <div aria-live="polite" aria-label="Muddiest point responses" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Responses</div>
              {responses.map((r) => (
                <article key={r.id} style={{
                  padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #ea580c',
                }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                    {r.anonymous ? 'Anonymous' : r.studentName} · {muddiestTimeAgo(r.createdAt)}
                  </div>
                  <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.response}</div>
                </article>
              ))}
            </div>
          )}

          {isTeacher && (
            <button type="button" aria-label="Delete muddiest point activity" onClick={() => { if (confirm('Delete this muddiest point activity?')) { deleteMuddiestActivity(activity.id); bump(); } }}
              style={{ marginTop: 14, fontSize: 12, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Minute Paper Tab ── */
const minutePaperTimeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

const DEFAULT_TAKEAWAY = 'What was the most important thing you learned?';
const DEFAULT_QUESTION = 'What question remains in your mind?';

function MinutePaperTab({ classId, activities, isTeacher, bump, studentId, studentName, students }) {
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [topic, setTopic] = useState('');
  const [twoPart, setTwoPart] = useState(true);
  const [prompt1, setPrompt1] = useState(DEFAULT_TAKEAWAY);
  const [prompt2, setPrompt2] = useState(DEFAULT_QUESTION);
  const [customPrompt, setCustomPrompt] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleCreate = () => {
    const useTwoPart = twoPart && (prompt1.trim() || prompt2.trim());
    if (!useTwoPart && !customPrompt.trim()) return;
    addMinutePaperActivity({
      classId,
      topic: topic.trim() || null,
      twoPart: useTwoPart,
      prompt1: useTwoPart ? (prompt1.trim() || DEFAULT_TAKEAWAY) : null,
      prompt2: useTwoPart ? (prompt2.trim() || DEFAULT_QUESTION) : null,
      customPrompt: !useTwoPart ? customPrompt.trim() : null,
      anonymous,
    });
    setTopic(''); setPrompt1(DEFAULT_TAKEAWAY); setPrompt2(DEFAULT_QUESTION); setCustomPrompt(''); setShowCreate(false);
    bump();
  };

  return (
    <div>
      <section aria-labelledby="minutepaper-heading">
      <p id="minutepaper-heading" style={{ background: '#ecfeff', border: '1px solid #99f6e4', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#0e7490', fontWeight: 600 }}>
        <strong>Minute Paper</strong> — A 1–2 minute reflective write: students identify the key takeaway and a lingering question. Use at the end of a lesson for active learning.
      </p>

      {isTeacher && !showCreate && (
        <button type="button" aria-label="Create new minute paper activity" onClick={() => setShowCreate(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#0891b2,#0e7490)', boxShadow: '0 4px 14px rgba(8,145,178,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New Minute Paper
        </button>
      )}

      {showCreate && isTeacher && (
        <div style={{ ...cardStyle, border: '2px solid #0891b2', background: '#ecfeff', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>📋</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Minute Paper</span>
          </div>
          <label htmlFor="minutepaper-topic" className="sr-only">Topic</label>
          <input id="minutepaper-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g. Adding Fractions)" aria-label="Topic for minute paper"
            style={{ ...inputStyle, fontSize: 14, marginBottom: 8 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 13, fontWeight: 600, color: '#0e7490', cursor: 'pointer' }}>
            <input type="checkbox" checked={twoPart} onChange={e => setTwoPart(e.target.checked)} />
            Two-part (key takeaway + lingering question)
          </label>
          {twoPart ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 4 }}>Prompt 1: Key takeaway</div>
              <RichTextEditor value={prompt1} onChange={setPrompt1} placeholder="Key takeaway prompt... click ∑ for math" compact minHeight={50} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 4, marginTop: 8 }}>Prompt 2: Lingering question</div>
              <RichTextEditor value={prompt2} onChange={setPrompt2} placeholder="Lingering question prompt... click ∑ for math" compact minHeight={50} />
            </>
          ) : (
            <RichTextEditor value={customPrompt} onChange={setCustomPrompt}
              placeholder="Custom prompt (e.g. Summarize today's lesson in one sentence)" compact minHeight={60} />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#0e7490', cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
            Allow anonymous responses
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => { setShowCreate(false); setTopic(''); setCustomPrompt(''); }} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleCreate}
              disabled={twoPart ? !(prompt1.trim() || prompt2.trim()) : !customPrompt.trim()}
              style={{
                ...postBtnStyle, background: (twoPart ? (prompt1.trim() || prompt2.trim()) : customPrompt.trim()) ? 'linear-gradient(135deg,#0891b2,#0e7490)' : '#e2e8f0',
                color: (twoPart ? (prompt1.trim() || prompt2.trim()) : customPrompt.trim()) ? '#fff' : '#94a3b8',
              }}>Create</button>
          </div>
        </div>
      )}

      {activities.length === 0 && !showCreate ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No minute paper activities yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Create one for quick end-of-lesson reflection.' : 'Your teacher hasn\'t created any yet.'}
          </div>
        </div>
      ) : (
        activities.map((act) => (
          <MinutePaperCard
            key={act.id}
            activity={act}
            isTeacher={isTeacher}
            studentId={studentId}
            studentName={studentName}
            students={students}
            isOpen={openId === act.id}
            onToggle={() => setOpenId(openId === act.id ? null : act.id)}
            bump={bump}
          />
        ))
      )}
      </section>
    </div>
  );
}

function MinutePaperCard({ activity, isTeacher, studentId, studentName, students, isOpen, onToggle, bump }) {
  const [takeaway, setTakeaway] = useState('');
  const [question, setQuestion] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const responses = getResponsesForMinutePaper(activity.id);
  const hasSubmitted = studentId ? hasStudentRespondedToMinutePaper(activity.id, studentId) : false;
  const twoPart = activity.twoPart !== false;

  const handleSubmit = () => {
    if (!studentId) return;
    const hasContent = twoPart ? (hasSubstance(takeaway) || hasSubstance(question)) : hasSubstance(customResponse);
    if (!hasContent) return;
    addMinutePaperResponse(activity.id, {
      studentId,
      studentName: activity.anonymous ? 'Anonymous' : studentName,
      ...(twoPart ? { takeaway, question } : { response: customResponse }),
      anonymous: activity.anonymous,
    });
    setTakeaway(''); setQuestion(''); setCustomResponse('');
    bump();
  };

  const responseCount = responses.length;
  const totalStudents = students?.length || 0;
  const canSubmit = twoPart ? (hasSubstance(takeaway) || hasSubstance(question)) : hasSubstance(customResponse);

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: isOpen ? '2px solid #0891b2' : '1px solid #e2e8f0',
      overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      <button type="button" style={{ width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={onToggle} aria-expanded={isOpen} aria-controls={`mnp-content-${activity.id}`} aria-label={`${activity.topic || 'Minute Paper'}, ${responseCount} responses. ${isOpen ? 'Collapse' : 'Expand'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#0891b2,#0e7490)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
          }} aria-hidden="true">📋</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{activity.topic || 'Minute Paper'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {twoPart ? `${activity.prompt1 || DEFAULT_TAKEAWAY} • ${activity.prompt2 || DEFAULT_QUESTION}` : activity.customPrompt}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              {minutePaperTimeAgo(activity.createdAt)} · {responseCount} response{responseCount !== 1 ? 's' : ''}
              {totalStudents > 0 && ` · ${responseCount}/${totalStudents} submitted`}
              {!isTeacher && hasSubmitted && ' · ✓ You responded'}
            </div>
          </div>
          <span style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: isOpen ? '#ecfeff' : '#0891b2', color: isOpen ? '#0891b2' : '#fff',
          }}>{isOpen ? '▲' : '▶'} {isOpen ? 'Close' : 'Open'}</span>
        </div>
      </button>

      {isOpen && (
        <div id={`mnp-content-${activity.id}`} role="region" aria-label="Minute paper content" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#f0fdfa' }}>
          {!isTeacher && !hasSubmitted && (
            <div style={{ marginBottom: 16 }}>
              {twoPart ? (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 4 }}>{activity.prompt1 || DEFAULT_TAKEAWAY}</div>
                  <RichTextEditor value={takeaway} onChange={setTakeaway} placeholder="Your key takeaway… Or ✏️ Draw." compact minHeight={50} prominentDrawButton />
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 4, marginTop: 10 }}>{activity.prompt2 || DEFAULT_QUESTION}</div>
                  <RichTextEditor value={question} onChange={setQuestion} placeholder="Your lingering question… Or ✏️ Draw." compact minHeight={50} prominentDrawButton />
                </>
              ) : (
                <RichTextEditor value={customResponse} onChange={setCustomResponse}
                  placeholder="Your response… Or ✏️ Draw." compact minHeight={60} prominentDrawButton />
              )}
              <button type="button" onClick={handleSubmit} disabled={!canSubmit}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none',
                  background: canSubmit ? 'linear-gradient(135deg,#0891b2,#0e7490)' : '#e2e8f0',
                  color: canSubmit ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: canSubmit ? 'pointer' : 'default',
                }}>
                Submit
              </button>
            </div>
          )}

          {responses.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
              No responses yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Responses</div>
              {responses.map((r) => (
                <div key={r.id} style={{
                  padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
                  borderLeft: '4px solid #0891b2',
                }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                    {r.anonymous ? 'Anonymous' : r.studentName} · {minutePaperTimeAgo(r.createdAt)}
                  </div>
                  {r.takeaway != null || r.question != null ? (
                    <div>
                      {r.takeaway && <div style={{ marginBottom: 6 }}><strong style={{ fontSize: 11, color: '#0891b2' }}>Key takeaway:</strong><div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{r.takeaway}</div></div>}
                      {r.question && <div><strong style={{ fontSize: 11, color: '#0891b2' }}>Lingering question:</strong><div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{r.question}</div></div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.response}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isTeacher && (
            <button type="button" aria-label="Delete minute paper activity" onClick={() => { if (confirm('Delete this minute paper activity?')) { deleteMinutePaperActivity(activity.id); bump(); } }}
              style={{ marginTop: 14, fontSize: 12, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── 3-2-1 Activity Tab ── */
const timeAgo321 = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

function Activity321Tab({ classId, activities, isTeacher, bump, studentId, studentName, students }) {
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [topic, setTopic] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleCreate = () => {
    add321Activity({ classId, topic: topic.trim() || null, anonymous });
    setTopic('');
    setShowCreate(false);
    bump();
  };

  return (
    <section aria-labelledby="321-heading">
      <p id="321-heading" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#166534', fontWeight: 600 }}>
        <strong>3-2-1</strong> — Students list 3 things they learned, 2 questions they have, and 1 connection to prior knowledge. Great for synthesis and metacognition.
      </p>

      {isTeacher && !showCreate && (
        <button type="button" aria-label="Create new 3-2-1 activity" onClick={() => setShowCreate(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New 3-2-1
        </button>
      )}

      {showCreate && isTeacher && (
        <div style={{ ...cardStyle, border: '2px solid #16a34a', background: '#f0fdf4', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>3-2-1</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create 3-2-1 Activity</span>
          </div>
          <label htmlFor="321-topic" className="sr-only">Topic</label>
          <input id="321-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g. Equivalent Fractions)" aria-label="Topic"
            style={{ ...inputStyle, fontSize: 14, marginBottom: 8 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#166534', cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
            Allow anonymous responses
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => { setShowCreate(false); setTopic(''); }} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleCreate} style={{ ...postBtnStyle, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff' }}>Create</button>
          </div>
        </div>
      )}

      {activities.length === 0 && !showCreate ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">3-2-1</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No 3-2-1 activities yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Create one for quick synthesis and reflection.' : 'Your teacher hasn\'t created any yet.'}
          </div>
        </div>
      ) : (
        activities.map((act) => (
          <Activity321Card key={act.id} activity={act} isTeacher={isTeacher} studentId={studentId} studentName={studentName} students={students} isOpen={openId === act.id} onToggle={() => setOpenId(openId === act.id ? null : act.id)} bump={bump} />
        ))
      )}
    </section>
  );
}

function Activity321Card({ activity, isTeacher, studentId, studentName, students, isOpen, onToggle, bump }) {
  const [thing1, setThing1] = useState('');
  const [thing2, setThing2] = useState('');
  const [thing3, setThing3] = useState('');
  const [question1, setQuestion1] = useState('');
  const [question2, setQuestion2] = useState('');
  const [connection, setConnection] = useState('');
  const responses = getResponsesFor321(activity.id);
  const hasSubmitted = studentId ? hasStudentResponded321(activity.id, studentId) : false;
  const responseCount = responses.length;
  const totalStudents = students?.length || 0;

  const handleSubmit = () => {
    if (!studentId) return;
    const hasContent = thing1.trim() || thing2.trim() || thing3.trim() || question1.trim() || question2.trim() || connection.trim();
    if (!hasContent) return;
    add321Response(activity.id, {
      studentId,
      studentName: activity.anonymous ? 'Anonymous' : studentName,
      thing1: thing1.trim(),
      thing2: thing2.trim(),
      thing3: thing3.trim(),
      question1: question1.trim(),
      question2: question2.trim(),
      connection: connection.trim(),
      anonymous: activity.anonymous,
    });
    setThing1(''); setThing2(''); setThing3(''); setQuestion1(''); setQuestion2(''); setConnection('');
    bump();
  };

  const canSubmit = thing1.trim() || thing2.trim() || thing3.trim() || question1.trim() || question2.trim() || connection.trim();

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: isOpen ? '2px solid #16a34a' : '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <button type="button" style={{ width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={onToggle} aria-expanded={isOpen} aria-controls={`321-content-${activity.id}`} aria-label={`${activity.topic || '3-2-1'}, ${responseCount} responses. ${isOpen ? 'Collapse' : 'Expand'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }} aria-hidden="true">3-2-1</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{activity.topic || '3-2-1'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>3 things learned · 2 questions · 1 connection</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              {timeAgo321(activity.createdAt)} · {responseCount} response{responseCount !== 1 ? 's' : ''}
              {totalStudents > 0 && ` · ${responseCount}/${totalStudents} submitted`}
              {!isTeacher && hasSubmitted && ' · ✓ You responded'}
            </div>
          </div>
          <span style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: isOpen ? '#f0fdf4' : '#16a34a', color: isOpen ? '#16a34a' : '#fff' }}>{isOpen ? '▲' : '▶'} {isOpen ? 'Close' : 'Open'}</span>
        </div>
      </button>

      {isOpen && (
        <div id={`321-content-${activity.id}`} role="region" aria-label="3-2-1 content" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#fafaf9' }}>
          {!isTeacher && !hasSubmitted && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>3 things you learned</div>
              <RichTextEditor value={thing1} onChange={setThing1} placeholder="Thing 1 — click ∑ for math" compact minHeight={40} />
              <div style={{ height: 6 }} />
              <RichTextEditor value={thing2} onChange={setThing2} placeholder="Thing 2" compact minHeight={40} />
              <div style={{ height: 6 }} />
              <RichTextEditor value={thing3} onChange={setThing3} placeholder="Thing 3" compact minHeight={40} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4, marginTop: 10 }}>2 questions you have</div>
              <RichTextEditor value={question1} onChange={setQuestion1} placeholder="Question 1" compact minHeight={40} />
              <div style={{ height: 6 }} />
              <RichTextEditor value={question2} onChange={setQuestion2} placeholder="Question 2" compact minHeight={40} />
              <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4, marginTop: 10 }}>1 connection to something you knew before</div>
              <RichTextEditor value={connection} onChange={setConnection} placeholder="Connection" compact minHeight={40} />
              <button type="button" onClick={handleSubmit} disabled={!canSubmit} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: canSubmit ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#e2e8f0',
                color: canSubmit ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: canSubmit ? 'pointer' : 'default',
              }}>Submit</button>
            </div>
          )}

          {responses.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>No responses yet.</div>
          ) : (
            <div aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Responses</div>
              {responses.map((r) => (
                <article key={r.id} style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{r.anonymous ? 'Anonymous' : r.studentName} · {timeAgo321(r.createdAt)}</div>
                  <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                    {(r.thing1 || r.thing2 || r.thing3) && <div style={{ marginBottom: 6 }}><strong style={{ fontSize: 11, color: '#16a34a' }}>3 things:</strong> {[r.thing1, r.thing2, r.thing3].filter(Boolean).join('; ')}</div>}
                    {(r.question1 || r.question2) && <div style={{ marginBottom: 6 }}><strong style={{ fontSize: 11, color: '#16a34a' }}>2 questions:</strong> {[r.question1, r.question2].filter(Boolean).join('; ')}</div>}
                    {r.connection && <div><strong style={{ fontSize: 11, color: '#16a34a' }}>1 connection:</strong> {r.connection}</div>}
                  </div>
                </article>
              ))}
            </div>
          )}

          {isTeacher && (
            <button type="button" aria-label="Delete 3-2-1 activity" onClick={() => { if (confirm('Delete this 3-2-1 activity?')) { delete321Activity(activity.id); bump(); } }}
              style={{ marginTop: 14, fontSize: 12, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>🗑 Delete</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Think-Pair-Share Tab ── */
const timeAgoTPS = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

function TPSTab({ classId, activities, isTeacher, bump, studentId, studentName, students }) {
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleCreate = () => {
    addTPSActivity({ classId, topic: topic.trim() || null, prompt: prompt.trim() || null });
    setTopic('');
    setPrompt('');
    setShowCreate(false);
    bump();
  };

  return (
    <section aria-labelledby="tps-heading">
      <p id="tps-heading" style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#6b21a8', fontWeight: 600 }}>
        <strong>Think-Pair-Share</strong> — Students think individually, get paired with a classmate to discuss, then share with the class. Great for collaborative sense-making.
      </p>

      {isTeacher && !showCreate && (
        <button type="button" aria-label="Create Think-Pair-Share activity" onClick={() => setShowCreate(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#a855f7,#9333ea)', boxShadow: '0 4px 14px rgba(168,85,247,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New Think-Pair-Share
        </button>
      )}

      {showCreate && isTeacher && (
        <div style={{ ...cardStyle, border: '2px solid #a855f7', background: '#faf5ff', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🤝</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Think-Pair-Share</span>
          </div>
          <label htmlFor="tps-topic" className="sr-only">Topic</label>
          <input id="tps-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g. Solving Quadratics)" aria-label="Topic"
            style={{ ...inputStyle, fontSize: 14, marginBottom: 8 }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b21a8', marginBottom: 4 }}>Think Prompt</div>
          <RichTextEditor value={prompt} onChange={setPrompt} placeholder="Think prompt (e.g. What strategy would you use to solve x² + 5x + 6 = 0?)" compact minHeight={60} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => { setShowCreate(false); setTopic(''); setPrompt(''); }} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleCreate} style={{ ...postBtnStyle, background: 'linear-gradient(135deg,#a855f7,#9333ea)', color: '#fff' }}>Create</button>
          </div>
        </div>
      )}

      {activities.length === 0 && !showCreate ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🤝</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No Think-Pair-Share activities yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Create one for collaborative discussion.' : 'Your teacher hasn\'t created any yet.'}
          </div>
        </div>
      ) : (
        activities.map((act) => (
          <TPSCard key={act.id} activity={act} isTeacher={isTeacher} studentId={studentId} studentName={studentName} students={students} isOpen={openId === act.id} onToggle={() => setOpenId(openId === act.id ? null : act.id)} bump={bump} />
        ))
      )}
    </section>
  );
}

function TPSCard({ activity, isTeacher, studentId, studentName, students, isOpen, onToggle, bump }) {
  const [think, setThink] = useState('');
  const [pairResponse, setPairResponse] = useState('');
  const thinkResponses = getThinkResponsesForTPS(activity.id);
  const pairResponses = getPairResponsesForTPS(activity.id);
  const hasThink = studentId ? hasStudentThinkTPS(activity.id, studentId) : false;
  const pairInfo = studentId ? getPairForStudent(activity.id, studentId, thinkResponses) : null;
  const myPairResp = pairInfo ? pairResponses.find(r => r.pairId === pairInfo.pairId) : null;

  const handleThinkSubmit = () => {
    if (!studentId || !hasSubstance(think)) return;
    addTPSThinkResponse(activity.id, { studentId, studentName, think });
    setThink('');
    bump();
  };

  const handlePairSubmit = () => {
    if (!studentId || !hasSubstance(pairResponse) || !pairInfo) return;
    addTPSPairResponse(activity.id, pairInfo.pairId, { pairResponse, submittedBy: studentId });
    setPairResponse('');
    bump();
  };

  const thinkCount = thinkResponses.length;
  const pairCount = pairResponses.length;
  const totalStudents = students?.length || 0;

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: isOpen ? '2px solid #a855f7' : '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <button type="button" style={{ width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={onToggle} aria-expanded={isOpen} aria-controls={`tps-content-${activity.id}`} aria-label={`${activity.topic || 'Think-Pair-Share'}, ${thinkCount} think responses. ${isOpen ? 'Collapse' : 'Expand'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#a855f7,#9333ea)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }} aria-hidden="true">🤝</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{activity.topic || 'Think-Pair-Share'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{activity.prompt || 'Think individually, then pair and share.'}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              {timeAgoTPS(activity.createdAt)} · {thinkCount} think · {pairCount} pair{pairCount !== 1 ? 's' : ''}
              {totalStudents > 0 && ` · ${thinkCount}/${totalStudents} submitted`}
              {!isTeacher && hasThink && ' · ✓ You thought'}
            </div>
          </div>
          <span style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: isOpen ? '#faf5ff' : '#a855f7', color: isOpen ? '#a855f7' : '#fff' }}>{isOpen ? '▲' : '▶'} {isOpen ? 'Close' : 'Open'}</span>
        </div>
      </button>

      {isOpen && (
        <div id={`tps-content-${activity.id}`} role="region" aria-label="Think-Pair-Share content" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#faf5ff' }}>
          {!isTeacher && !hasThink && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>1. Think</h4>
              <RichTextEditor value={think} onChange={setThink} placeholder={activity.prompt || 'Share your initial thought… Or ✏️ Draw to add a drawing.'} compact minHeight={60} prominentDrawButton />
              <button type="button" onClick={handleThinkSubmit} disabled={!hasSubstance(think)}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: hasSubstance(think) ? 'linear-gradient(135deg,#a855f7,#9333ea)' : '#e2e8f0', color: hasSubstance(think) ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: hasSubstance(think) ? 'pointer' : 'default' }}>Submit Think</button>
            </div>
          )}

          {!isTeacher && hasThink && pairInfo && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>2. Pair</h4>
              <div style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e9d5ff', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginBottom: 6 }}>Your partner&apos;s thought:</div>
                <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{pairInfo.partner.think}</div>
              </div>
              {!myPairResp ? (
                <>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', marginBottom: 4 }}>Add your pair summary (what you agreed on or discussed):</div>
                  <RichTextEditor value={pairResponse} onChange={setPairResponse} placeholder="Our pair decided… Or ✏️ Draw to add a drawing." compact minHeight={50} prominentDrawButton />
                  <button type="button" onClick={handlePairSubmit} disabled={!hasSubstance(pairResponse)}
                    style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: hasSubstance(pairResponse) ? 'linear-gradient(135deg,#a855f7,#9333ea)' : '#e2e8f0', color: hasSubstance(pairResponse) ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: hasSubstance(pairResponse) ? 'pointer' : 'default' }}>Submit Pair</button>
                </>
              ) : (
                <div style={{ padding: 10, background: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#166534', fontWeight: 600 }}>✓ Pair response submitted</div>
              )}
            </div>
          )}

          {!isTeacher && hasThink && !pairInfo && thinkResponses.length > 1 && (
            <div style={{ padding: 12, background: '#fef3c7', borderRadius: 10, fontSize: 13, color: '#92400e' }}>Waiting for another student to submit so you can be paired. Check back soon!</div>
          )}

          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#64748b', marginTop: 16, marginBottom: 8 }}>3. Share</h4>
          {thinkResponses.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>No think responses yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pairResponses.length === 0 ? (
                thinkResponses.map((r) => (
                  <article key={r.id} style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{r.studentName} · {timeAgoTPS(r.createdAt)}</div>
                    <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{r.think}</div>
                  </article>
                ))
              ) : (
                pairResponses.map((pr) => {
                  const [sidA, sidB] = pr.pairId.split('-');
                  const rA = thinkResponses.find(r => r.studentId === sidA);
                  const rB = thinkResponses.find(r => r.studentId === sidB);
                  const names = [rA?.studentName, rB?.studentName].filter(Boolean).join(' & ');
                  return (
                    <article key={pr.id} style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', borderLeft: '4px solid #a855f7' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{names} · {timeAgoTPS(pr.updatedAt || pr.createdAt)}</div>
                      <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>{pr.pairResponse}</div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {isTeacher && (
            <button type="button" aria-label="Delete Think-Pair-Share activity" onClick={() => { if (confirm('Delete this Think-Pair-Share activity?')) { deleteTPSActivity(activity.id); bump(); } }}
              style={{ marginTop: 14, fontSize: 12, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>🗑 Delete</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Exit Ticket Tab ── */
const timeAgoET = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

function ExitTicketTab({ classId, activities, isTeacher, bump, studentId, studentName, students }) {
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleCreate = () => {
    addExitTicketActivity({ classId, topic: topic.trim() || null, prompt: prompt.trim() || null, anonymous });
    setTopic('');
    setPrompt('');
    setShowCreate(false);
    bump();
  };

  return (
    <section aria-labelledby="exitticket-heading">
      <p id="exitticket-heading" style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: '#b45309', fontWeight: 600 }}>
        <strong>Exit Ticket</strong> — A quick one-prompt check at the end of class. E.g. &quot;Summarize today&apos;s lesson in one sentence&quot; or &quot;What will you practice tonight?&quot;
      </p>

      {isTeacher && !showCreate && (
        <button type="button" aria-label="Create Exit Ticket" onClick={() => setShowCreate(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 14px rgba(245,158,11,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New Exit Ticket
        </button>
      )}

      {showCreate && isTeacher && (
        <div style={{ ...cardStyle, border: '2px solid #f59e0b', background: '#fffbeb', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>🎫</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Exit Ticket</span>
          </div>
          <label htmlFor="et-topic" className="sr-only">Topic</label>
          <input id="et-topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Topic (e.g. Today's Lesson)" aria-label="Topic"
            style={{ ...inputStyle, fontSize: 14, marginBottom: 8 }} />
          <label style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: 4, display: 'block' }}>Prompt</label>
          <RichTextEditor value={prompt} onChange={setPrompt} placeholder="Prompt (e.g. Solve for x... click ∑ for math)" compact minHeight={60} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#b45309', cursor: 'pointer' }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} />
            Allow anonymous responses
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => { setShowCreate(false); setTopic(''); setPrompt(''); }} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleCreate} disabled={!prompt.trim()} style={{ ...postBtnStyle, background: prompt.trim() ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#e2e8f0', color: prompt.trim() ? '#fff' : '#94a3b8' }}>Create</button>
          </div>
        </div>
      )}

      {activities.length === 0 && !showCreate ? (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🎫</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No exit tickets yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Create one for a quick end-of-class check.' : 'Your teacher hasn\'t created any yet.'}
          </div>
        </div>
      ) : (
        activities.map((act) => (
          <ExitTicketCard key={act.id} activity={act} isTeacher={isTeacher} studentId={studentId} studentName={studentName} students={students} isOpen={openId === act.id} onToggle={() => setOpenId(openId === act.id ? null : act.id)} bump={bump} />
        ))
      )}
    </section>
  );
}

function ExitTicketCard({ activity, isTeacher, studentId, studentName, students, isOpen, onToggle, bump }) {
  const [response, setResponse] = useState('');
  const responses = getResponsesForExitTicket(activity.id);
  const hasSubmitted = studentId ? hasStudentRespondedExitTicket(activity.id, studentId) : false;
  const responseCount = responses.length;
  const totalStudents = students?.length || 0;

  const handleSubmit = () => {
    if (!studentId || !hasSubstance(response)) return;
    addExitTicketResponse(activity.id, {
      studentId,
      studentName: activity.anonymous ? 'Anonymous' : studentName,
      response,
      anonymous: activity.anonymous,
    });
    setResponse('');
    bump();
  };

  const exitTicketHasContent = hasSubstance(response);

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: isOpen ? '2px solid #f59e0b' : '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <button type="button" style={{ width: '100%', padding: '16px 20px', cursor: 'pointer', background: 'none', border: 'none', textAlign: 'left' }} onClick={onToggle} aria-expanded={isOpen} aria-controls={`et-content-${activity.id}`} aria-label={`${activity.topic || 'Exit Ticket'}, ${responseCount} responses. ${isOpen ? 'Collapse' : 'Expand'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }} aria-hidden="true">🎫</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{activity.topic || 'Exit Ticket'}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {activity.prompt?.startsWith('<') ? <RichTextViewer html={activity.prompt} /> : (activity.prompt || 'Quick reflection')}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              {timeAgoET(activity.createdAt)} · {responseCount} response{responseCount !== 1 ? 's' : ''}
              {totalStudents > 0 && ` · ${responseCount}/${totalStudents} submitted`}
              {!isTeacher && hasSubmitted && ' · ✓ You responded'}
            </div>
          </div>
          <span style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: isOpen ? '#fffbeb' : '#f59e0b', color: isOpen ? '#f59e0b' : '#fff' }}>{isOpen ? '▲' : '▶'} {isOpen ? 'Close' : 'Open'}</span>
        </div>
      </button>

      {isOpen && (
        <div id={`et-content-${activity.id}`} role="region" aria-label="Exit ticket content" style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px', background: '#fffbeb' }}>
          {!isTeacher && !hasSubmitted && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#b45309', marginBottom: 4 }}>
                {activity.prompt?.startsWith('<') ? <RichTextViewer html={activity.prompt} /> : (activity.prompt || 'Your response')}
              </div>
              <RichTextEditor value={response} onChange={setResponse} placeholder="Type text and/or use ✏️ Draw above to add a drawing." compact minHeight={60} prominentDrawButton />
              <button type="button" onClick={handleSubmit} disabled={!exitTicketHasContent}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', marginTop: 8, background: exitTicketHasContent ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#e2e8f0', color: exitTicketHasContent ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 14, cursor: exitTicketHasContent ? 'pointer' : 'default' }}>Submit</button>
            </div>
          )}

          {responses.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>No responses yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Responses</div>
              {responses.map((r) => (
                <article key={r.id} style={{ padding: 12, background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{r.anonymous ? 'Anonymous' : r.studentName} · {timeAgoET(r.createdAt)}</div>
                  <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                    {r.response?.startsWith('<') ? <RichTextViewer html={r.response} /> : r.response}
                  </div>
                </article>
              ))}
            </div>
          )}

          {isTeacher && (
            <button type="button" aria-label="Delete exit ticket" onClick={() => { if (confirm('Delete this exit ticket?')) { deleteExitTicketActivity(activity.id); bump(); } }}
              style={{ marginTop: 14, fontSize: 12, color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>🗑 Delete</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Discussions Tab ── */
function DiscussionsTab({ classId, cls, discussions, isTeacher, bump, userId, userName, students }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [points, setPoints] = useState(10);
  const [dueDate, setDueDate] = useState('');
  const [openId, setOpenId] = useState(null);
  const [requireReply, setRequireReply] = useState(true);
  const [inlineReplyId, setInlineReplyId] = useState(null); // disc id when showing inline reply on collapsed card
  const [rubricResult, setRubricResult] = useState(null);
  const [rubricLoading, setRubricLoading] = useState(false);
  const openCardRef = useRef(null);
  const gradeLevel = cls?.gradeId || 'grade3';

  useEffect(() => {
    if (openId && openCardRef.current) {
      openCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [openId]);

  const handleCreate = () => {
    if (!title.trim()) return;
    const newDisc = addDiscussion({ classId, title: title.trim(), prompt: prompt.trim(), author: userName, authorId: userId, points, dueDate: dueDate || null, requireReply });
    setTitle(''); setPrompt(''); setShowForm(false); setDueDate('');
    bump();
  };

  const handleToggle = useCallback((id) => {
    setOpenId(prev => prev === id ? null : id);
  }, []);

  return (
    <div>
      {isTeacher && !showForm && (
        <button type="button" onClick={() => setShowForm(true)} style={{
          ...addBtnStyle, display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)',
        }}>
          <span style={{ fontSize: 18 }}>+</span> New Discussion
        </button>
      )}

      {showForm && (
        <div style={{ ...cardStyle, border: '2px solid #7c3aed', background: '#faf5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create Discussion</span>
          </div>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Discussion topic..."
            style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }} autoFocus maxLength={150} />
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>{title.length}/150</div>
          <div style={{ marginTop: 4 }}>
            <RichTextEditor value={prompt} onChange={setPrompt} placeholder="Write a prompt or question for students to discuss… Or click ✏️ Draw to add a drawing." compact minHeight={100} prominentDrawButton />
          </div>
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={async () => {
                if (!prompt.trim()) return;
                setRubricLoading(true);
                setRubricResult(null);
                try {
                  const res = await fetch('/api/generate-rubric', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      assignmentPrompt: `${title || 'Discussion'}: ${prompt}`,
                      gradeLevel,
                    }),
                  });
                  const data = await res.json();
                  setRubricResult(data.success ? data.content : (data.error || 'Error'));
                } catch (e) {
                  setRubricResult('Error: ' + e.message);
                } finally {
                  setRubricLoading(false);
                }
              }}
              disabled={rubricLoading || !prompt.trim()}
              style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid #7c3aed',
                background: rubricLoading ? '#f1f5f9' : '#faf5ff', color: '#7c3aed',
                fontWeight: 700, fontSize: 12, cursor: rubricLoading ? 'default' : 'pointer',
              }}
            >
              {rubricLoading ? '⏳ Generating...' : '🤖 Generate Rubric from Prompt'}
            </button>
            {rubricResult && (
              <div style={{
                marginTop: 10, padding: 12, background: '#fff', border: '1px solid #e9d5ff',
                borderRadius: 8, fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap',
                maxHeight: 160, overflowY: 'auto',
              }}>
                {rubricResult}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={labelStyle}>Points</label>
              <select value={points} onChange={e => setPoints(Number(e.target.value))} style={{ ...selectStyle, minWidth: 90 }}>
                {[5, 10, 15, 20, 25, 50, 100].map(p => <option key={p} value={p}>{p} pts</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={selectStyle} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: requireReply ? '#7c3aed' : '#94a3b8' }}>
              <input type="checkbox" checked={requireReply} onChange={e => setRequireReply(e.target.checked)} />
              Require student reply
            </label>
            <div style={{ flex: 1 }} />
            <button type="button" onClick={() => { setShowForm(false); setTitle(''); setPrompt(''); }} style={cancelBtnStyle}>Cancel</button>
            <button type="button" onClick={handleCreate} disabled={!title.trim()} style={{
              ...postBtnStyle, opacity: title.trim() ? 1 : 0.4,
              background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
            }}>
              💬 Create Discussion
            </button>
          </div>
        </div>
      )}

      {discussions.length === 0 && !showForm && (
        <div style={emptyStyle}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No discussions yet</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {isTeacher ? 'Create a discussion to spark conversation and grade participation.' : 'No discussions have been created yet.'}
          </div>
        </div>
      )}

      {discussions.map((disc) => {
        const isOpen = openId === disc.id;
        const replyCount = disc.replies?.length || 0;
        const studentReplies = (disc.replies || []).filter(r => r.authorId !== 'teacher');
        const uniqueStudents = [...new Set(studentReplies.map(r => r.authorId))];
        const isOverdue = disc.dueDate && new Date(disc.dueDate) < new Date();
        const hasUserReplied = studentReplies.some(r => r.authorId === userId);
        const totalStudents = (students || []).length;

        return (
          <div
            key={disc.id}
            ref={isOpen ? openCardRef : undefined}
            style={{
              background: '#fff', borderRadius: 14, padding: 0, border: isOpen ? '2px solid #7c3aed' : '1px solid #e2e8f0',
              marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden',
              position: 'relative', zIndex: 1,
            }}
          >
            <button
              type="button"
              onClick={() => handleToggle(disc.id)}
              aria-expanded={isOpen}
              aria-controls={`disc-thread-${disc.id}`}
              style={{
                width: '100%', padding: '16px 20px', cursor: 'pointer',
                background: 'none', border: 'none', textAlign: 'left', font: 'inherit',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: isOpen ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  color: isOpen ? '#fff' : '#334155',
                }}>💬</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>{disc.title}</span>
                    <span style={{ padding: '4px 12px', background: '#7c3aed', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      {isOpen ? '▲ Close' : '▶ Expand'}
                    </span>
                    <span style={{ padding: '3px 10px', background: '#f0e7ff', borderRadius: 6, fontSize: 10, fontWeight: 800, color: '#7c3aed' }}>
                      {disc.points} pts
                    </span>
                    {disc.dueDate && (
                      <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: isOverdue ? '#fef2f2' : '#f0fdf4', color: isOverdue ? '#dc2626' : '#059669' }}>
                        {isOverdue ? '⏰ Past due' : `📅 Due ${new Date(disc.dueDate).toLocaleDateString()}`}
                      </span>
                    )}
                    {!isTeacher && hasUserReplied && (
                      <span style={{ padding: '3px 10px', background: '#ecfdf5', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#059669' }}>✅ Replied</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    <strong style={{ color: '#64748b' }}>{disc.author}</strong> · {timeAgo(disc.createdAt)} · 💬 {replyCount} · 👥 {uniqueStudents.length}{totalStudents > 0 ? `/${totalStudents}` : ''}
                  </div>
                </div>
              </div>
            </button>

            <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px 72px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => handleToggle(disc.id)} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isOpen ? '#f1f5f9' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                color: isOpen ? '#64748b' : '#fff', fontWeight: 700, fontSize: 14,
                boxShadow: isOpen ? 'none' : '0 2px 8px rgba(124,58,237,0.3)',
              }}>
                {isOpen ? '▲ Close' : '💬 View & Reply'}
              </button>
              <button type="button" onClick={() => setInlineReplyId(prev => prev === disc.id ? null : disc.id)} style={{
                padding: '8px 18px', borderRadius: 8, border: '2px solid #7c3aed',
                background: inlineReplyId === disc.id ? '#f0e7ff' : '#fff', cursor: 'pointer',
                color: '#7c3aed', fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                ✍️ Reply (text or media)
              </button>
              {isTeacher && !isOpen && (
                <button type="button" onClick={() => { if (confirm('Delete this discussion?')) { deleteDiscussion(disc.id); bump(); } }} style={{
                  padding: '8px 14px', borderRadius: 8, border: '1px solid #fecaca',
                  background: '#fff', cursor: 'pointer', color: '#dc2626', fontWeight: 600, fontSize: 12,
                }}>🗑</button>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 20px', background: '#f8fafc' }}>
              <QuickReplyBar disc={disc} userId={userId} userName={userName} isTeacher={isTeacher} bump={bump} />
            </div>

            {!isOpen && inlineReplyId === disc.id && (
              <InlineReplyForm
                disc={disc}
                userId={userId}
                userName={userName}
                isTeacher={isTeacher}
                bump={bump}
                onClose={() => setInlineReplyId(null)}
              />
            )}

            {isOpen && (
              <div id={`disc-thread-${disc.id}`} style={{ borderTop: '1px solid #e2e8f0' }}>
                <DiscussionThread disc={disc} isTeacher={isTeacher} userId={userId} userName={userName} students={students} bump={bump} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Media attachment helpers ── */
const MEDIA_TYPES = [
  { id: 'image', icon: '🖼️', label: 'Image', placeholder: 'Paste image URL (png, jpg, gif, webp)...' },
  { id: 'video', icon: '📹', label: 'Video', placeholder: 'Paste YouTube or video URL...' },
  { id: 'link', icon: '🔗', label: 'Link', placeholder: 'Paste any URL...' },
  { id: 'audio', icon: '🎵', label: 'Audio', placeholder: 'Paste audio file URL (mp3, wav)...' },
];

function youtubeEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?#]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function MediaPreview({ media, onRemove }) {
  if (!media || media.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {media.map((m, i) => (
        <div key={i} style={{ position: 'relative', background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: 8, maxWidth: 220 }}>
          {m.type === 'image' && <img src={m.url} alt={m.title || 'image'} style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6, display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />}
          {m.type === 'video' && m.url?.startsWith('studio:') && (
            <StudioVideoPlayer url={m.url} style={{ maxWidth: 200, maxHeight: 140 }} />
          )}
          {m.type === 'video' && youtubeEmbed(m.url) && (
            <iframe src={youtubeEmbed(m.url)} style={{ width: 200, height: 113, border: 'none', borderRadius: 6 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          )}
          {m.type === 'video' && !youtubeEmbed(m.url) && !m.url?.startsWith('studio:') && (
            <video src={m.url} controls style={{ maxWidth: '100%', maxHeight: 140, borderRadius: 6 }} />
          )}
          {m.type === 'audio' && (
            <audio src={m.url} controls style={{ width: 200 }} />
          )}
          {m.type === 'link' && (
            <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'none', padding: '4px 0' }}>
              🔗 {m.title || m.url?.substring(0, 40)}...
            </a>
          )}
          {m.title && m.type !== 'link' && <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>}
          {onRemove && (
            <button type="button" onClick={() => onRemove(i)} style={{
              position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
              background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Studio video picker (for video discussions) ── */
function StudioVideoPicker({ onSelect, disabled }) {
  const [show, setShow] = useState(false);
  const pickerRef = useRef(null);
  useEffect(() => {
    if (!show) return;
    const close = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [show]);
  const studioVideos = getStudioVideosList();
  if (studioVideos.length === 0) {
    return (
      <Link to="/video-studio" style={{
        padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
        fontSize: 12, fontWeight: 700, color: '#7c3aed', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        🎬 Record video first
      </Link>
    );
  }
  return (
    <div ref={pickerRef} style={{ position: 'relative' }}>
      <button type="button" onClick={() => !disabled && setShow(s => !s)} disabled={disabled}
        style={{
          padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: disabled ? '#f8fafc' : '#fff',
          cursor: disabled ? 'default' : 'pointer', fontSize: 12, fontWeight: 700,
          color: disabled ? '#cbd5e1' : '#7c3aed', display: 'flex', alignItems: 'center', gap: 4,
        }}>
        🎬 From Studio
      </button>
      {show && (
        <div style={{
          position: 'absolute', bottom: 36, left: 0, background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 10, padding: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, minWidth: 200, maxHeight: 220, overflowY: 'auto',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' }}>Video Studio</div>
          {studioVideos.slice(0, 10).map((v) => (
            <button key={v.id} type="button" onClick={() => { onSelect(v); setShow(false); }}
              style={{
                display: 'block', width: '100%', padding: '8px 12px', borderRadius: 6, border: 'none', background: '#f8fafc',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left', marginBottom: 4,
              }}>
              🎬 {v.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaDisplay({ media }) {
  if (!media || media.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {media.map((m, i) => (
        <div key={i} style={{ maxWidth: 320 }}>
          {m.type === 'image' && (
            <a href={m.url} target="_blank" rel="noopener noreferrer">
              <img src={m.url} alt={m.title || 'image'} style={{
                maxWidth: '100%', maxHeight: 240, borderRadius: 10, display: 'block',
                border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.2s',
              }} onError={e => { e.target.style.display = 'none'; }} />
            </a>
          )}
          {m.type === 'video' && m.url?.startsWith('studio:') && (
            <StudioVideoPlayer url={m.url} style={{ maxWidth: 320, maxHeight: 240 }} />
          )}
          {m.type === 'video' && youtubeEmbed(m.url) && (
            <div style={{ borderRadius: 10, overflow: 'hidden', background: '#000' }}>
              <iframe src={youtubeEmbed(m.url)} style={{ width: 320, height: 180, border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          )}
          {m.type === 'video' && !youtubeEmbed(m.url) && !m.url?.startsWith('studio:') && (
            <video src={m.url} controls style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 10 }} />
          )}
          {m.type === 'audio' && (
            <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              {m.title && <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>🎵 {m.title}</div>}
              <audio src={m.url} controls style={{ width: '100%' }} />
            </div>
          )}
          {m.type === 'link' && (
            <a href={m.url} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: '#f0f7ff', borderRadius: 10, border: '1px solid #bfdbfe',
              textDecoration: 'none', transition: 'background 0.15s',
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔗</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title || 'Open Link'}</div>
                <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.url}</div>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>↗</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Quick Reply Bar (always on collapsed card) ── */
function QuickReplyBar({ disc, userId, userName, isTeacher, bump }) {
  const [text, setText] = useState('');
  const handleSend = () => {
    if (!text.trim()) return;
    addReply(disc.id, { body: text.trim(), author: userName, authorId: userId, isTeacher, replyTo: null });
    setText('');
    bump();
  };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>✍️ Reply:</span>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
        placeholder="Write a quick reply... (Enter to send)"
        style={{
          flex: 1, minWidth: 0, padding: '8px 14px', borderRadius: 10, border: '1px solid #e2e8f0',
          fontSize: 14, outline: 'none', color: '#0f172a', background: '#fff',
        }}
      />
      <button type="button" onClick={handleSend} disabled={!text.trim()} style={{
        padding: '8px 18px', borderRadius: 10, border: 'none', cursor: text.trim() ? 'pointer' : 'default',
        background: text.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
        color: text.trim() ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 13,
        boxShadow: text.trim() ? '0 2px 6px rgba(124,58,237,0.3)' : 'none',
      }}>
        Reply
      </button>
    </div>
  );
}

/* ── Inline Reply Form (on collapsed card) ── */
function InlineReplyForm({ disc, userId, userName, isTeacher, bump, onClose }) {
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const fileInputRef = useRef(null);
  const MAX_CHARS = 1500;
  const MAX_ATTACHMENTS = 5;

  const handleReply = () => {
    if (!hasSubstance(replyText) && attachments.length === 0) return;
    addReply(disc.id, {
      body: replyText,
      author: userName,
      authorId: userId,
      isTeacher,
      replyTo: null,
      media: attachments.length > 0 ? attachments : undefined,
    });
    setReplyText('');
    setAttachments([]);
    setShowMediaPicker(false);
    bump();
    onClose();
  };

  const handleAddMedia = () => {
    if (!mediaUrl.trim() || attachments.length >= MAX_ATTACHMENTS) return;
    setAttachments(prev => [...prev, { type: mediaType, url: mediaUrl.trim(), title: mediaTitle.trim() || null }]);
    setMediaUrl('');
    setMediaTitle('');
    setShowMediaPicker(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || attachments.length >= MAX_ATTACHMENTS) return;
    e.target.value = '';
    const result = await uploadFile(file, 'feed');
    if (result.success && result.file) {
      setAttachments(prev => [...prev, { type: result.file.type, url: result.file.url, title: result.file.originalName }]);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const isImg = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        const isVideo = file.type.startsWith('video/');
        const type = isImg ? 'image' : isAudio ? 'audio' : isVideo ? 'video' : 'link';
        setAttachments(prev => [...prev, { type, url: reader.result, title: file.name }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ borderTop: '1px solid #e2e8f0', padding: '14px 20px', background: '#faf5ff' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>✍️ Reply with text or media</span>
        <button type="button" onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#94a3b8', padding: '0 4px' }}>×</button>
      </div>
      <RichTextEditor value={replyText} onChange={setReplyText}
        placeholder="Write your response... click ∑ for math or ✏️ Draw to add a drawing." compact minHeight={50} prominentDrawButton />
      {showMediaPicker && (
        <div style={{ marginTop: 8, padding: 10, background: '#f0f7ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            {MEDIA_TYPES.map(t => (
              <button key={t.id} type="button" onClick={() => setMediaType(t.id)} style={{
                padding: '4px 10px', borderRadius: 6, border: mediaType === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: mediaType === t.id ? '#2563eb' : '#fff', color: mediaType === t.id ? '#fff' : '#334155',
                fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
          <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder={MEDIA_TYPES.find(t => t.id === mediaType)?.placeholder}
            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }} />
          <input value={mediaTitle} onChange={e => setMediaTitle(e.target.value)} placeholder="Title (optional)"
            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12, marginBottom: 6, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={handleAddMedia} disabled={!mediaUrl.trim()} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11,
              background: mediaUrl.trim() ? '#2563eb' : '#e2e8f0', color: mediaUrl.trim() ? '#fff' : '#94a3b8',
            }}>Attach</button>
            <button type="button" onClick={() => setShowMediaPicker(false)} style={{
              padding: '6px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#64748b',
            }}>Cancel</button>
          </div>
        </div>
      )}
      <MediaPreview media={attachments} onRemove={idx => setAttachments(prev => prev.filter((_, i) => i !== idx))} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileSelect} />
        <button type="button" onClick={() => setShowMediaPicker(!showMediaPicker)} style={{
          padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4,
        }}>🔗 Add URL</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={attachments.length >= MAX_ATTACHMENTS} style={{
          padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: attachments.length < MAX_ATTACHMENTS ? 'pointer' : 'default',
          fontSize: 12, fontWeight: 700, color: attachments.length < MAX_ATTACHMENTS ? '#64748b' : '#cbd5e1',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>📎 Upload file</button>
        <StudioVideoPicker
          onSelect={(v) => attachments.length < MAX_ATTACHMENTS && setAttachments(prev => [...prev, { type: 'video', url: `studio:${v.id}`, title: v.title }])}
          disabled={attachments.length >= MAX_ATTACHMENTS}
        />
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{replyText.length}/{MAX_CHARS}</span>
        <div style={{ flex: 1 }} />
        <button type="button" onClick={handleReply} disabled={!hasSubstance(replyText) && attachments.length === 0} style={{
          padding: '8px 20px', background: (hasSubstance(replyText) || attachments.length > 0) ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
          color: (hasSubstance(replyText) || attachments.length > 0) ? '#fff' : '#94a3b8', border: 'none', borderRadius: 8,
          fontWeight: 700, fontSize: 13, cursor: (hasSubstance(replyText) || attachments.length > 0) ? 'pointer' : 'default',
        }}>
          Send
        </button>
      </div>
    </div>
  );
}

/* ── Discussion Thread (expanded) ── */
function DiscussionThread({ disc, isTeacher, userId, userName, students, bump }) {
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaTitle, setMediaTitle] = useState('');
  const fileInputRef = useRef(null);
  const replyRef = useRef(null);
  const MAX_CHARS = 1500;
  const MAX_ATTACHMENTS = 5;

  const handleReply = () => {
    if (!hasSubstance(replyText) && attachments.length === 0) return;
    addReply(disc.id, {
      body: replyText,
      author: userName,
      authorId: userId,
      isTeacher,
      replyTo: replyingTo?.id || null,
      media: attachments.length > 0 ? attachments : undefined,
    });
    setReplyText(''); setReplyingTo(null); setAttachments([]);
    bump();
  };

  const threadReplyHasContent = hasSubstance(replyText) || attachments.length > 0;

  const handleReplyTo = (reply) => {
    setReplyingTo(reply);
    replyRef.current?.focus();
  };

  const handleDeleteDisc = () => {
    if (confirm('Delete this entire discussion and all replies?')) {
      deleteDiscussion(disc.id);
      bump();
    }
  };

  const handleAddMedia = () => {
    if (!mediaUrl.trim() || attachments.length >= MAX_ATTACHMENTS) return;
    setAttachments(prev => [...prev, { type: mediaType, url: mediaUrl.trim(), title: mediaTitle.trim() || null }]);
    setMediaUrl(''); setMediaTitle(''); setShowMediaPicker(false);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || attachments.length >= MAX_ATTACHMENTS) return;
    e.target.value = '';
    const result = await uploadFile(file, 'feed');
    if (result.success && result.file) {
      setAttachments(prev => [...prev, { type: result.file.type, url: result.file.url, title: result.file.originalName }]);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const isImg = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        const isVideo = file.type.startsWith('video/');
        const type = isImg ? 'image' : isAudio ? 'audio' : isVideo ? 'video' : 'link';
        setAttachments(prev => [...prev, { type, url: reader.result, title: file.name }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
      {disc.prompt && (
        <div style={{
          padding: '14px 18px', background: 'linear-gradient(135deg,#f8fafc,#f0e7ff)', borderRadius: 12,
          marginBottom: 16, fontSize: 14, color: '#334155', lineHeight: 1.7, borderLeft: '4px solid #7c3aed',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Discussion Prompt</div>
          {disc.prompt?.startsWith('<') ? <RichTextViewer html={disc.prompt} /> : formatBody(disc.prompt)}
        </div>
      )}

      {(disc.replies || []).length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 14, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' }}>
          <span style={{ fontSize: 24, display: 'block', marginBottom: 4 }}>✍️</span>
          No responses yet — be the first to share your thoughts!
        </div>
      )}

      {(disc.replies || []).map((reply, idx) => {
        const isOwn = reply.authorId === userId;
        const likeCount = reply.likes?.length || 0;
        const hasLiked = (reply.likes || []).includes(userId);
        const grade = disc.grades?.[reply.authorId];
        const rubricItem = grade != null ? RUBRIC.find(r => r.score === grade) : null;

        return (
          <FadeIn key={reply.id} delay={idx * 40}>
            <div style={{
              display: 'flex', gap: 10, padding: '14px 0', borderBottom: '1px solid #f1f5f9',
              background: isOwn ? 'rgba(37,99,235,0.02)' : 'transparent', borderRadius: isOwn ? 8 : 0, marginLeft: isOwn ? -4 : 0, paddingLeft: isOwn ? 4 : 0,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: reply.isTeacher ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : avatarColor(reply.authorId),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13,
              }}>{reply.author?.[0]?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{reply.author}</span>
                  {reply.isTeacher && <span style={{ padding: '2px 8px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderRadius: 4, fontSize: 9, fontWeight: 800, color: '#fff' }}>TEACHER</span>}
                  {isOwn && !reply.isTeacher && <span style={{ padding: '2px 6px', background: '#e8f0fe', borderRadius: 4, fontSize: 9, fontWeight: 700, color: '#2563eb' }}>YOU</span>}
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(reply.createdAt)}</span>
                  {reply.media?.length > 0 && <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>📎 {reply.media.length}</span>}
                  {rubricItem && (
                    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${rubricItem.color}15`, color: rubricItem.color }}>
                      {rubricItem.emoji} {rubricItem.label}
                    </span>
                  )}
                </div>
                {reply.body && <div style={{ fontSize: 14, color: '#334155', marginTop: 5, lineHeight: 1.7 }}>
                  {reply.body.startsWith('<') ? <RichTextViewer html={reply.body} /> : formatBody(reply.body)}
                </div>}

                <MediaDisplay media={reply.media} />

                {/* Action bar */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                  <button type="button" className="emoji-btn" onClick={() => toggleReplyLike(disc.id, reply.id, userId) || bump()} style={{
                    background: hasLiked ? '#eff6ff' : 'none', border: hasLiked ? '1px solid #bfdbfe' : 'none',
                    borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
                    color: hasLiked ? '#2563eb' : '#94a3b8', fontWeight: hasLiked ? 700 : 500,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {hasLiked ? '❤️' : '🤍'} {likeCount > 0 && likeCount}
                  </button>
                  <button type="button" onClick={() => handleReplyTo(reply)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#64748b', fontWeight: 600,
                  }}>↩️ Reply</button>
                  {(isTeacher || isOwn) && (
                    <button type="button" onClick={() => { deleteReply(disc.id, reply.id); bump(); }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#cbd5e1',
                    }}>Delete</button>
                  )}
                  {isTeacher && !reply.isTeacher && (
                    <InlineGrader discId={disc.id} studentId={reply.authorId} currentGrade={disc.grades?.[reply.authorId]} bump={bump} />
                  )}
                </div>

                {/* Peer review */}
                {!reply.isTeacher && (
                  <PeerReviewBlock discId={disc.id} reply={reply} userId={userId} userName={userName} isTeacher={isTeacher} bump={bump} />
                )}
              </div>
            </div>
          </FadeIn>
        );
      })}

      {/* Reply composer */}
      <div style={{ marginTop: 14, background: '#fafbfd', borderRadius: 14, padding: 14, border: '1px solid #e2e8f0' }}>
        {replyingTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '6px 10px', background: '#f0e7ff', borderRadius: 8, fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
            ↩️ Replying to <strong>{replyingTo.author}</strong>
            <button type="button" onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 14, marginLeft: 'auto' }}>✕</button>
          </div>
        )}

        <RichTextEditor
          value={replyText}
          onChange={setReplyText}
          placeholder="Write your response... click ∑ for math or ✏️ Draw to add a drawing."
          compact
          minHeight={60}
          prominentDrawButton
        />
        {attachments.length > 0 && (
          <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginTop: 4 }}>📎 {attachments.length}/{MAX_ATTACHMENTS} attached</div>
        )}

        <MediaPreview media={attachments} onRemove={handleRemoveAttachment} />

        {/* Media picker */}
        {showMediaPicker && (
          <div style={{ marginTop: 10, padding: 14, background: '#f0f7ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
              {MEDIA_TYPES.map(t => (
                <button key={t.id} type="button" onClick={() => setMediaType(t.id)} style={{
                  padding: '5px 12px', borderRadius: 8, border: mediaType === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  background: mediaType === t.id ? '#2563eb' : '#fff', color: mediaType === t.id ? '#fff' : '#334155',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                }}>{t.icon} {t.label}</button>
              ))}
            </div>
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder={MEDIA_TYPES.find(t => t.id === mediaType)?.placeholder}
              onKeyDown={e => e.key === 'Enter' && handleAddMedia()}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginBottom: 6, boxSizing: 'border-box' }} autoFocus />
            <input value={mediaTitle} onChange={e => setMediaTitle(e.target.value)} placeholder="Title (optional)"
              onKeyDown={e => e.key === 'Enter' && handleAddMedia()}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={handleAddMedia} disabled={!mediaUrl.trim()} style={{
                padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                background: mediaUrl.trim() ? '#2563eb' : '#e2e8f0', color: mediaUrl.trim() ? '#fff' : '#94a3b8',
              }}>Attach</button>
              <button type="button" onClick={() => { setShowMediaPicker(false); setMediaUrl(''); setMediaTitle(''); }}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#64748b' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Action toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <input ref={fileInputRef} type="file" accept="image/*,audio/*,video/*,.pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={handleFileSelect} />
          <button type="button" onClick={() => setShowMediaPicker(!showMediaPicker)} title="Add media by URL"
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: showMediaPicker ? '#eff6ff' : '#fff', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, color: showMediaPicker ? '#2563eb' : '#64748b',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>🔗 URL</button>
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Upload file from device"
            disabled={attachments.length >= MAX_ATTACHMENTS}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#fff', cursor: attachments.length < MAX_ATTACHMENTS ? 'pointer' : 'default',
              fontSize: 12, fontWeight: 700, color: attachments.length < MAX_ATTACHMENTS ? '#64748b' : '#cbd5e1',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>📎 Upload</button>
          <StudioVideoPicker
            onSelect={(v) => attachments.length < MAX_ATTACHMENTS && setAttachments(prev => [...prev, { type: 'video', url: `studio:${v.id}`, title: v.title }])}
            disabled={attachments.length >= MAX_ATTACHMENTS}
          />
          {MEDIA_TYPES.slice(0, 3).map(t => (
            <button key={t.id} type="button" onClick={() => { setMediaType(t.id); setShowMediaPicker(true); }}
              title={`Add ${t.label.toLowerCase()}`}
              disabled={attachments.length >= MAX_ATTACHMENTS}
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#fff', cursor: attachments.length < MAX_ATTACHMENTS ? 'pointer' : 'default',
                fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: attachments.length >= MAX_ATTACHMENTS ? 0.4 : 1,
              }}>{t.icon}</button>
          ))}

          <div style={{ flex: 1 }} />

          <button type="button" onClick={handleReply} disabled={!threadReplyHasContent} style={{
            padding: '10px 24px', background: threadReplyHasContent ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
            color: threadReplyHasContent ? '#fff' : '#94a3b8', border: 'none', borderRadius: 10,
            fontWeight: 700, fontSize: 13, cursor: threadReplyHasContent ? 'pointer' : 'default', flexShrink: 0,
            boxShadow: (replyText.trim() || attachments.length > 0) ? '0 2px 8px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {attachments.length > 0 && <span>📎</span>}
            Send
          </button>
        </div>
      </div>

      {isTeacher && (
        <div style={{ marginTop: 14, textAlign: 'right' }}>
          <button type="button" onClick={handleDeleteDisc} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
            🗑️ Delete Discussion
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Peer review block (for discussion replies) ── */
function PeerReviewBlock({ discId, reply, userId, userName, isTeacher, bump }) {
  const [feedback, setFeedback] = useState('');
  const [showForm, setShowForm] = useState(false);
  const reviews = getPeerReviewsForReply(discId, reply.id);
  const isOwn = reply.authorId === userId;
  const canReview = !isTeacher && !isOwn && userId;
  const hasReviewed = canReview ? hasStudentReviewedReply(discId, reply.id, userId) : false;

  const handleSubmit = () => {
    if (!feedback.replace(/<[^>]*>/g, '').trim() || !userId) return;
    addPeerReview({ discussionId: discId, replyId: reply.id, reviewerId: userId, reviewerName: userName, feedback });
    setFeedback('');
    setShowForm(false);
    bump();
  };

  if (!canReview && reviews.length === 0) return null;

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Peer feedback</div>
      {reviews.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: canReview && !hasReviewed ? 10 : 0 }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ padding: 10, background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #7c3aed', fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
              <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginBottom: 4 }}>{r.reviewerName}</div>
              <div>{r.feedback}</div>
            </div>
          ))}
        </div>
      )}
      {canReview && !hasReviewed && (
        <>
          {!showForm ? (
            <button type="button" onClick={() => setShowForm(true)} style={{
              padding: '6px 12px', borderRadius: 8, border: '1px dashed #c4b5fd', background: '#faf5ff',
              fontSize: 12, fontWeight: 600, color: '#7c3aed', cursor: 'pointer',
            }}>✍️ Add peer feedback</button>
          ) : (
            <div>
              <RichTextEditor value={feedback} onChange={setFeedback}
                placeholder="Share constructive feedback... click ∑ for math" compact minHeight={50} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={handleSubmit} disabled={!feedback.trim()} style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', background: feedback.trim() ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#e2e8f0',
                  color: feedback.trim() ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 12, cursor: feedback.trim() ? 'pointer' : 'default',
                }}>Submit</button>
                <button type="button" onClick={() => { setShowForm(false); setFeedback(''); }} style={{ padding: '6px 14px', background: 'none', border: 'none', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Inline grader ── */
function InlineGrader({ discId, studentId, currentGrade, bump }) {
  const [show, setShow] = useState(false);
  const rubricItem = currentGrade != null ? RUBRIC.find(r => r.score === currentGrade) : null;

  if (!show) {
    return (
      <button type="button" onClick={() => setShow(true)} style={{
        background: rubricItem ? `${rubricItem.color}10` : 'none', border: rubricItem ? `1px solid ${rubricItem.color}40` : 'none',
        borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontSize: 12,
        color: rubricItem ? rubricItem.color : '#7c3aed', fontWeight: 700,
      }}>
        {rubricItem ? `${rubricItem.emoji} ${rubricItem.score}/5` : '📝 Grade'}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', background: '#f8fafc', padding: '4px 6px', borderRadius: 8, flexWrap: 'wrap' }}>
      {RUBRIC.map(r => (
        <button key={r.score} type="button" onClick={() => { gradeDiscussion(discId, studentId, r.score); setShow(false); bump(); }}
          title={`${r.label}: ${r.desc}`}
          style={{
            width: 28, height: 28, borderRadius: 6, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: currentGrade === r.score ? `2px solid ${r.color}` : '1px solid #e2e8f0',
            background: currentGrade === r.score ? `${r.color}15` : '#fff',
          }}>
          {r.emoji}
        </button>
      ))}
      <button type="button" onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', padding: 2 }}>✕</button>
    </div>
  );
}

/* ── Grading Tab ── */
function GradingTab({ classId, cls, discussions, students, bump }) {
  const [aiAssist, setAiAssist] = useState(null); // { discId, studentId, loading, result }
  const gradeLevel = cls?.gradeId || 'grade3';

  if (discussions.length === 0) {
    return (
      <div style={emptyStyle}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
        <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>No discussions to grade</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Create a discussion first, then grade student participation here.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20, padding: '16px 20px', background: 'linear-gradient(135deg,#f8fafc,#f0e7ff)', borderRadius: 14, border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Participation Rubric</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {RUBRIC.map(r => (
            <div key={r.score} style={{
              padding: '8px 14px', background: '#fff', borderRadius: 10, border: `1px solid ${r.color}30`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>{r.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, color: r.color, fontSize: 13 }}>{r.score} — {r.label}</div>
                {r.desc && <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.desc}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {discussions.map(disc => {
        const studentReplies = (disc.replies || []).filter(r => r.authorId !== 'teacher');
        const gradedCount = Object.keys(disc.grades || {}).filter(k => disc.grades[k] > 0).length;
        const totalStudents = students.length;

        return (
          <FadeIn key={disc.id}>
            <div style={{ ...cardStyle, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>💬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{disc.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {disc.points} pts · {timeAgo(disc.createdAt)} · {gradedCount}/{totalStudents} graded
                  </div>
                </div>
                {gradedCount === totalStudents && totalStudents > 0 && (
                  <span style={{ padding: '4px 12px', background: '#ecfdf5', borderRadius: 8, fontSize: 11, fontWeight: 800, color: '#059669' }}>✅ All Graded</span>
                )}
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={thStyle}>Student</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Replies</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Score</th>
                      <th style={thStyle}>Grade</th>
                      <th style={{ ...thStyle, width: 80 }}>AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const sid = typeof student === 'string' ? student : student.id;
                      const sname = typeof student === 'string' ? student : student.name;
                      const replies = studentReplies.filter(r => r.authorId === sid);
                      const currentGrade = disc.grades?.[sid];
                      const rubricItem = currentGrade != null ? RUBRIC.find(r => r.score === currentGrade) : null;
                      const participated = replies.length > 0;

                      return (
                        <tr key={sid} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 26, height: 26, borderRadius: '50%', background: avatarColor(sid), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>
                                {sname?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{sname}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                              background: participated ? '#ecfdf5' : '#fef2f2', color: participated ? '#059669' : '#dc2626',
                            }}>{replies.length}</span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            {rubricItem && rubricItem.score > 0 ? (
                              <span style={{ fontWeight: 900, color: rubricItem.color, fontSize: 15 }}>{rubricItem.emoji} {currentGrade}/5</span>
                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              {RUBRIC.map(r => (
                                <button key={r.score} type="button"
                                  onClick={() => { gradeDiscussion(disc.id, sid, r.score); bump(); }}
                                  title={`${r.label}: ${r.desc}`}
                                  style={{
                                    width: 32, height: 32, borderRadius: 8, fontSize: 14, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: currentGrade === r.score ? `2px solid ${r.color}` : '1px solid #e2e8f0',
                                    background: currentGrade === r.score ? `${r.color}12` : '#fff',
                                    transition: 'all 0.15s',
                                  }}>
                                  {r.emoji}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {participated && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const replyText = replies.map(r => r.body).join('\n\n');
                                  if (!replyText.trim()) return;
                                  setAiAssist({ discId: disc.id, studentId: sid, loading: true, result: null });
                                  try {
                                    const res = await fetch('/api/evaluate-with-bias', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        gradeLevel,
                                        studentResponse: replyText,
                                        studentName: sname,
                                      }),
                                    });
                                    const data = await res.json();
                                    setAiAssist(prev => ({ ...prev, loading: false, result: data.success ? data.content : (data.error || 'Error') }));
                                  } catch (e) {
                                    setAiAssist(prev => ({ ...prev, loading: false, result: 'Error: ' + e.message }));
                                  }
                                }}
                                disabled={aiAssist?.loading && aiAssist?.discId === disc.id && aiAssist?.studentId === sid}
                                title="AI grading suggestion with bias check"
                                style={{
                                  padding: '4px 10px', borderRadius: 6, border: '1px solid #7c3aed',
                                  background: (aiAssist?.discId === disc.id && aiAssist?.studentId === sid && aiAssist?.result) ? '#faf5ff' : '#fff',
                                  color: '#7c3aed', fontWeight: 600, fontSize: 11, cursor: 'pointer',
                                }}
                              >
                                {aiAssist?.discId === disc.id && aiAssist?.studentId === sid && aiAssist?.loading ? '…' : '🤖'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {aiAssist?.discId === disc.id && aiAssist?.result && (
                <div style={{
                  marginTop: 12, padding: 14, background: '#faf5ff', border: '1px solid #e9d5ff',
                  borderRadius: 10, fontSize: 12, color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.5,
                }}>
                  <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 6 }}>🤖 AI Suggestion (with bias check)</div>
                  {aiAssist.result}
                </div>
              )}
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}

/* ── Shared Styles ── */
const cardStyle = { background: '#fff', borderRadius: 14, padding: '18px 22px', border: '1px solid #e2e8f0', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 10, border: '2px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s', color: '#0f172a', background: '#fff' };
const labelStyle = { fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 };
const selectStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, background: '#fff' };
const addBtnStyle = { padding: '12px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 800, fontSize: 14, marginBottom: 16, transition: 'all 0.2s' };
const postBtnStyle = { padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' };
const cancelBtnStyle = { padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13 };
const emptyStyle = { padding: '48px 24px', textAlign: 'center', background: 'linear-gradient(135deg,#f8fafc,#f0f0ff)', borderRadius: 16, border: '2px dashed #e2e8f0' };
const thStyle = { textAlign: 'left', padding: '8px 12px', color: '#64748b', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };
