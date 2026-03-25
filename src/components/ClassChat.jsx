import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getClassChat, getDMChat, sendChatMessage, deleteChatMessage } from '../utils/storage';
import { uploadFile } from '../utils/fileUpload';
import { useChatSocket } from '../contexts/SocketContext';

const AVATAR_COLORS = [
  'linear-gradient(135deg,#2563eb,#7c3aed)', 'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#d97706,#f59e0b)', 'linear-gradient(135deg,#dc2626,#f43f5e)',
  'linear-gradient(135deg,#7c3aed,#a855f7)', 'linear-gradient(135deg,#0891b2,#06b6d4)',
];
function avatarColor(id) {
  let h = 0;
  for (let i = 0; i < (id || '').length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function timeStr(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function youtubeEmbed(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([^&?#]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default function ClassChat({ classId, isTeacher, userId, userName, students }) {
  const safeStudents = Array.isArray(students) ? students : [];
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMedia, setShowMedia] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [chatMode, setChatMode] = useState('class');
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { connected: wsConnected, sendMessage: wsSend, sendTyping, onMessage, deleteMessage: wsDelete, typingUsers, onlineUsers } = useChatSocket(classId);

  const studentList = safeStudents.filter(s => {
    const sid = typeof s === 'string' ? s : s.id;
    return sid && sid !== 'teacher';
  });

  const loadMessages = useCallback(() => {
    try {
      if (!classId) { setMessages([]); return; }
      if (chatMode === 'class') setMessages(getClassChat(classId));
      else setMessages(getDMChat(classId, userId, chatMode));
    } catch (err) {
      console.error('Chat load error:', err);
      setMessages([]);
    }
  }, [classId, chatMode, userId]);

  useEffect(() => {
    if (isTeacher && chatMode !== 'class' && !studentList.some(s => (typeof s === 'string' ? s : s.id) === chatMode)) {
      setChatMode('class');
    }
  }, [chatMode, isTeacher, studentList]);

  // WebSocket: listen for real-time messages
  useEffect(() => {
    if (!wsConnected) return;
    return onMessage((msg) => {
      if (msg.classId !== classId) return;
      // Also save to localStorage for offline access
      sendChatMessage({
        ...msg,
        body: msg.text,
        _fromServer: true,
      });
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, body: msg.text }];
      });
    });
  }, [wsConnected, classId, onMessage]);

  // Load initial messages + polling fallback when WebSocket is down
  useEffect(() => {
    loadMessages();
    if (!wsConnected) {
      pollRef.current = setInterval(loadMessages, 2000);
    }
    return () => clearInterval(pollRef.current);
  }, [loadMessages, wsConnected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMsg = (body, media) => {
    if (wsConnected) {
      wsSend(body || '', media, chatMode === 'class' ? null : chatMode);
    } else {
      sendChatMessage({
        classId,
        authorId: userId,
        authorName: userName,
        isTeacher,
        body: body || '',
        media,
        recipientId: chatMode === 'class' ? undefined : chatMode,
      });
      loadMessages();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    const media = mediaUrl.trim();
    if (!trimmed && !media) return;
    sendMsg(trimmed, media ? { type: mediaType, url: media } : undefined);
    setText('');
    setMediaUrl('');
    setShowMedia(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const result = await uploadFile(file, 'chat');
    if (result.success && result.file) {
      sendMsg('', { type: result.file.type, url: result.file.url, name: result.file.originalName });
    } else {
      // Fallback to base64 if server upload fails (offline mode)
      const reader = new FileReader();
      reader.onload = () => {
        const isImg = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        const isVideo = file.type.startsWith('video/');
        sendMsg('', { type: isImg ? 'image' : isAudio ? 'audio' : isVideo ? 'video' : 'file', url: reader.result, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = (msgId) => {
    deleteChatMessage(msgId);
    loadMessages();
  };

  let lastDate = '';

  const getChatLabel = () => {
    if (chatMode === 'class') return '💬 Class Chat';
    if (isTeacher) {
      const s = studentList.find(x => (typeof x === 'string' ? x : x.id) === chatMode);
      return s ? `✉️ DM: ${typeof s === 'string' ? s : s.name}` : '✉️ Direct Message';
    }
    return '✉️ Message Teacher';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 520, maxHeight: '70vh', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{getChatLabel()}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>{messages.length} messages</div>
        </div>
        {((isTeacher && studentList.length > 0) || !isTeacher) && (
          <select
            value={chatMode}
            onChange={(e) => setChatMode(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="class">📢 Class (everyone)</option>
            {isTeacher ? (
              studentList.map(s => {
                const sid = typeof s === 'string' ? s : s.id;
                const sname = typeof s === 'string' ? s : s.name;
                return <option key={sid} value={sid}>✉️ {sname}</option>;
              })
            ) : (
              <option value="teacher">✉️ Teacher</option>
            )}
          </select>
        )}
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} title="Live" />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: '#f8fafc' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>No messages yet</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Start the conversation!</div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isOwn = msg.authorId === userId;
          const msgDate = new Date(msg.createdAt).toDateString();
          let showDateSep = false;
          if (msgDate !== lastDate) { showDateSep = true; lastDate = msgDate; }
          const prevMsg = messages[i - 1];
          const sameAuthorAsPrev = prevMsg && prevMsg.authorId === msg.authorId && (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) < 120000;

          return (
            <React.Fragment key={msg.id}>
              {showDateSep && (
                <div style={{ textAlign: 'center', margin: '16px 0 10px', fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 14px', borderRadius: 10 }}>
                    {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div style={{
                display: 'flex', gap: 8, marginBottom: sameAuthorAsPrev ? 2 : 10,
                flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end',
              }}>
                {/* Avatar */}
                {!sameAuthorAsPrev ? (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: msg.isTeacher ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : avatarColor(msg.authorId),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 12,
                  }}>{msg.authorName?.[0]?.toUpperCase() || '?'}</div>
                ) : <div style={{ width: 32, flexShrink: 0 }} />}

                {/* Bubble */}
                <div style={{ maxWidth: '70%', minWidth: 60 }}>
                  {!sameAuthorAsPrev && (
                    <div style={{
                      fontSize: 11, fontWeight: 700, marginBottom: 3, color: '#64748b',
                      textAlign: isOwn ? 'right' : 'left',
                      display: 'flex', alignItems: 'center', gap: 6,
                      flexDirection: isOwn ? 'row-reverse' : 'row',
                    }}>
                      <span>{msg.authorName}</span>
                      {msg.isTeacher && <span style={{ padding: '1px 6px', background: '#2563eb', borderRadius: 4, fontSize: 9, fontWeight: 800, color: '#fff' }}>TEACHER</span>}
                    </div>
                  )}
                  <div style={{
                    position: 'relative',
                    padding: msg.body ? '10px 14px' : '6px',
                    background: isOwn ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : '#fff',
                    color: isOwn ? '#fff' : '#0f172a',
                    borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    border: isOwn ? 'none' : '1px solid #e2e8f0',
                    fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    {msg.body && <div>{msg.body}</div>}
                    {msg.media && (
                      <div style={{ marginTop: msg.body ? 8 : 0 }}>
                        {msg.media.type === 'image' && (
                          <img src={msg.media.url} alt="" role="presentation" style={{ maxWidth: '100%', maxHeight: 240, borderRadius: 8, display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                        )}
                        {msg.media.type === 'video' && youtubeEmbed(msg.media.url) && (
                          <iframe src={youtubeEmbed(msg.media.url)} style={{ width: '100%', height: 180, border: 'none', borderRadius: 8 }} allowFullScreen />
                        )}
                        {msg.media.type === 'video' && !youtubeEmbed(msg.media.url) && (
                          <video src={msg.media.url} controls style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
                        )}
                        {msg.media.type === 'audio' && (
                          <audio src={msg.media.url} controls style={{ width: '100%' }} />
                        )}
                        {msg.media.type === 'file' && (
                          <a href={msg.media.url} download={msg.media.name} style={{ color: isOwn ? '#dbeafe' : '#2563eb', fontSize: 13, fontWeight: 600 }}>📎 {msg.media.name || 'Download file'}</a>
                        )}
                        {msg.media.type === 'link' && (
                          <a href={msg.media.url} target="_blank" rel="noopener noreferrer" style={{ color: isOwn ? '#dbeafe' : '#2563eb', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            🔗 {msg.media.url.substring(0, 50)}{msg.media.url.length > 50 ? '...' : ''} ↗
                          </a>
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: 'right' }}>{timeStr(msg.createdAt)}</div>

                    {(isTeacher || isOwn) && (
                      <button type="button" onClick={() => handleDelete(msg.id)} title="Delete" style={{
                        position: 'absolute', top: -8, right: isOwn ? 'auto' : -8, left: isOwn ? -8 : 'auto',
                        width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 900,
                        display: 'none', alignItems: 'center', justifyContent: 'center',
                      }} className="chat-delete-btn">✕</button>
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Media preview */}
      {showMedia && (
        <div style={{ padding: '10px 16px', background: '#f0f7ff', borderTop: '1px solid #bfdbfe', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'image', icon: '🖼️', label: 'Image' },
              { id: 'video', icon: '📹', label: 'Video' },
              { id: 'link', icon: '🔗', label: 'Link' },
            ].map(t => (
              <button key={t.id} type="button" onClick={() => setMediaType(t.id)} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: mediaType === t.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: mediaType === t.id ? '#2563eb' : '#fff', color: mediaType === t.id ? '#fff' : '#334155',
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
          <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="Paste URL..."
            onKeyDown={handleKeyDown}
            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, minWidth: 120 }} autoFocus />
          <button type="button" onClick={() => { setShowMedia(false); setMediaUrl(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#94a3b8' }}>✕</button>
        </div>
      )}

      {/* Typing indicator & connection status */}
      {(() => {
        const typers = Object.values(typingUsers).filter(n => n !== userName);
        return (typers.length > 0 || !wsConnected) ? (
          <div style={{ padding: '2px 14px', fontSize: 11, color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
            <span>{typers.length > 0 ? `${typers.join(', ')} ${typers.length === 1 ? 'is' : 'are'} typing...` : ''}</span>
            {!wsConnected && <span style={{ color: '#f59e0b' }}>offline mode</span>}
          </div>
        ) : null;
      })()}

      {/* Input bar */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        <input ref={fileRef} type="file" accept="image/*,audio/*,video/*,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileUpload} />

        <button type="button" onClick={() => fileRef.current?.click()} title="Upload file" style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc',
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>📎</button>

        <button type="button" onClick={() => setShowMedia(!showMedia)} title="Add media URL" style={{
          width: 36, height: 36, borderRadius: 10, border: showMedia ? '2px solid #2563eb' : '1px solid #e2e8f0',
          background: showMedia ? '#eff6ff' : '#f8fafc',
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>🔗</button>

        <textarea ref={inputRef} value={text} onChange={e => {
            setText(e.target.value);
            if (wsConnected) {
              sendTyping(true);
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14,
            fontFamily: 'inherit', resize: 'none', minHeight: 40, maxHeight: 100, boxSizing: 'border-box',
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = '#2563eb'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; if (wsConnected) sendTyping(false); }}
        />

        <button type="button" onClick={handleSend} disabled={!text.trim() && !mediaUrl.trim()} style={{
          width: 40, height: 40, borderRadius: 12, border: 'none', cursor: (text.trim() || mediaUrl.trim()) ? 'pointer' : 'default',
          background: (text.trim() || mediaUrl.trim()) ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : '#e2e8f0',
          color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: (text.trim() || mediaUrl.trim()) ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
          transition: 'all 0.2s',
        }}>➤</button>
      </div>

      <style>{`
        .chat-delete-btn { display: none !important; }
        div:hover > .chat-delete-btn { display: flex !important; }
      `}</style>
    </div>
  );
}
