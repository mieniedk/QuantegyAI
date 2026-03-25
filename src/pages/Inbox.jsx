import React, { useState, useEffect, useRef } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import {
  getConversations, sendInboxMessage, markMessageRead,
  getUnreadCount, getClasses, getInboxMessages,
} from '../utils/storage';
import { sanitizeHtml } from '../utils/sanitize';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Inbox() {
  const username = localStorage.getItem('quantegy-teacher-user') || 'teacher';
  const [conversations, setConversations] = useState([]);
  const [selectedConvoId, setSelectedConvoId] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const threadEndRef = useRef(null);

  const classes = getClasses();
  const allPeople = [];
  const seen = new Set();
  classes.forEach(cls => {
    (cls.students || []).forEach(s => {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        allPeople.push({ id: s.id, name: s.name, type: 'Student', className: cls.name });
      }
    });
    if (cls.teacher && !seen.has(cls.teacher)) {
      seen.add(cls.teacher);
      allPeople.push({ id: cls.teacher, name: cls.teacher, type: 'Teacher', className: cls.name });
    }
  });

  const refresh = () => {
    setConversations(getConversations(username));
  };

  useEffect(() => { refresh(); }, []);

  const selectedConvo = conversations.find(c => c.id === selectedConvoId);

  useEffect(() => {
    if (selectedConvo) {
      selectedConvo.messages.forEach(m => {
        if (m.recipientId === username && !m.read) markMessageRead(m.id);
      });
      refresh();
    }
  }, [selectedConvoId]);

  useEffect(() => {
    if (threadEndRef.current) threadEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvo?.messages?.length]);

  const handleSendReply = () => {
    const text = (replyBody || '').trim();
    if (!text || !selectedConvo) return;
    const otherParticipant = selectedConvo.participants.find(p => p !== username) || '';
    const recipientPerson = allPeople.find(p => p.id === otherParticipant);
    const bodyHtml = text.replace(/\n/g, '<br>');
    sendInboxMessage({
      senderId: username,
      senderName: username,
      recipientId: otherParticipant,
      recipientName: recipientPerson?.name || otherParticipant,
      subject: selectedConvo.subject,
      body: bodyHtml,
      conversationId: selectedConvo.id,
    });
    setReplyBody('');
    refresh();
  };

  const handleCompose = () => {
    if (!composeRecipient || !composeBody.trim()) return;
    const recipientPerson = allPeople.find(p => p.id === composeRecipient);
    const bodyHtml = composeBody.trim().replace(/\n/g, '<br>');
    sendInboxMessage({
      senderId: username,
      senderName: username,
      recipientId: composeRecipient,
      recipientName: recipientPerson?.name || composeRecipient,
      subject: composeSubject || '(no subject)',
      body: bodyHtml,
    });
    setComposeRecipient('');
    setComposeSubject('');
    setComposeBody('');
    setShowCompose(false);
    refresh();
  };

  const unreadTotal = getUnreadCount(username);

  return (
    <TeacherLayout>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            Inbox
            {unreadTotal > 0 && (
              <span style={{ marginLeft: 10, padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: '#dc2626', color: '#fff' }}>
                {unreadTotal}
              </span>
            )}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Messages with students and teachers</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCompose(true)}
          style={{
            padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14,
          }}
        >
          + New Message
        </button>
      </div>

      <div style={{
        display: 'flex', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden',
        background: '#fff', minHeight: 520,
      }}>
        {/* Left: conversation list */}
        <div style={{ width: 320, minWidth: 280, borderRight: '1px solid #e2e8f0', overflowY: 'auto', flexShrink: 0 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              No messages yet
            </div>
          ) : (
            conversations.map(convo => {
              const unreadInConvo = convo.messages.filter(m => m.recipientId === username && !m.read).length;
              const lastMsg = convo.messages[convo.messages.length - 1];
              const otherName = convo.participants.filter(p => p !== username).map(p => {
                const person = allPeople.find(pp => pp.id === p);
                return person?.name || p;
              }).join(', ') || 'Unknown';
              const active = selectedConvoId === convo.id;

              return (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                    background: active ? '#eff6ff' : unreadInConvo > 0 ? '#fefce8' : '#fff',
                    borderLeft: active ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: unreadInConvo > 0 ? 700 : 500, fontSize: 14, color: '#0f172a' }}>
                      {otherName}
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>
                      {timeAgo(convo.updatedAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: unreadInConvo > 0 ? 600 : 400, color: '#475569', marginBottom: 2 }}>
                    {convo.subject}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {stripHtml(lastMsg?.body || '').slice(0, 80)}
                  </div>
                  {unreadInConvo > 0 && (
                    <span style={{
                      display: 'inline-block', marginTop: 4, padding: '1px 8px', borderRadius: 10,
                      fontSize: 10, fontWeight: 700, background: '#2563eb', color: '#fff',
                    }}>
                      {unreadInConvo} new
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: conversation thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selectedConvo ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>💬</div>
                Select a conversation to view
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>{selectedConvo.subject}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {selectedConvo.participants.filter(p => p !== username).map(p => {
                    const person = allPeople.find(pp => pp.id === p);
                    return person?.name || p;
                  }).join(', ')}
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {selectedConvo.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map(msg => {
                    const isMe = msg.senderId === username;
                    return (
                      <div key={msg.id} style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, color: isMe ? '#2563eb' : '#475569' }}>{msg.senderName || msg.senderId}</span>
                          {' · '}
                          {timeAgo(msg.createdAt)}
                        </div>
                        <div style={{
                          maxWidth: '75%', padding: '10px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.6,
                          background: isMe ? '#2563eb' : '#f1f5f9',
                          color: isMe ? '#fff' : '#0f172a',
                          borderTopRightRadius: isMe ? 2 : 12,
                          borderTopLeftRadius: isMe ? 12 : 2,
                        }}
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.body || '') }}
                        />
                      </div>
                    );
                  })
                }
                <div ref={threadEndRef} />
              </div>

              {/* Reply box */}
              <div style={{ borderTop: '1px solid #e2e8f0', padding: 16, background: '#fafbfc' }}>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  style={{
                    width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14,
                    fontFamily: 'inherit', resize: 'vertical', minHeight: 50, boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyBody.trim()}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: 'none', cursor: replyBody.trim() ? 'pointer' : 'default',
                      background: replyBody.trim() ? '#2563eb' : '#94a3b8', color: '#fff', fontWeight: 700, fontSize: 13,
                    }}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCompose(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-title"
            style={{
              background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span id="compose-title" style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>New Message</span>
              <button type="button" onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94a3b8' }}>&times;</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>To</label>
                <select
                  value={composeRecipient}
                  onChange={e => setComposeRecipient(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}
                >
                  <option value="">Select recipient...</option>
                  {allPeople.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type} — {p.className})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  placeholder="Message subject..."
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Message</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={5}
                  style={{
                    width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14,
                    fontFamily: 'inherit', resize: 'vertical', minHeight: 100, boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#64748b' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompose}
                disabled={!composeRecipient || !composeBody.trim()}
                style={{
                  padding: '10px 24px', borderRadius: 8, border: 'none', cursor: (composeRecipient && composeBody.trim()) ? 'pointer' : 'default',
                  background: (composeRecipient && composeBody.trim()) ? '#2563eb' : '#94a3b8',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
