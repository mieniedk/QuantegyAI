import React, { useState } from 'react';

/**
 * Quick video conferencing using Jitsi Meet (free, no signup).
 * Opens in new tab (Jitsi blocks iframe embedding). Teacher and students join the same room.
 */
function getRoomName(id) {
  if (!id || typeof id !== 'string') return 'QuantegyClass';
  const clean = id.replace(/[^a-zA-Z0-9]/g, '');
  const hash = Math.abs(id.split('').reduce((h, c) => (h << 5) - h + c.charCodeAt(0), 0)).toString(36).slice(0, 8);
  return clean ? `Q${hash}` : `Quantegy${hash}`;
}

export default function VideoMeet({ classId, userName, isTeacher, className }) {
  const [copied, setCopied] = useState(false);
  const [popupBlockedMessage, setPopupBlockedMessage] = useState('');
  const roomName = getRoomName(classId);
  const displayName = userName || (isTeacher ? 'Teacher' : 'Student');
  const baseUrl = 'https://meet.jit.si';
  const meetUrl = `${baseUrl}/${roomName}#config.prejoinPageEnabled=true&userInfo.displayName=${encodeURIComponent(displayName)}`;

  const handleCopyLink = () => {
    const simpleUrl = `${baseUrl}/${roomName}`;
    navigator.clipboard?.writeText(simpleUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleJoin = () => {
    setPopupBlockedMessage('');
    const w = window.open(meetUrl, 'jitsi-meet', 'noopener,noreferrer,width=1280,height=720');
    if (!w) {
      try {
        navigator.clipboard?.writeText(meetUrl).then(() => {
          setPopupBlockedMessage('Link copied. Paste it in your browser, or allow popups and try again.');
        }).catch(() => {
          setPopupBlockedMessage('Allow popups for this site, or copy the room link above and open it in a new tab.');
        });
      } catch {
        setPopupBlockedMessage('Allow popups for this site, or copy the room link above and open it in a new tab.');
      }
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      ...(className ? {} : { minHeight: 400, display: 'flex', flexDirection: 'column' }),
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
        color: '#fff',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>📹</span>
        <div style={{ fontWeight: 800, fontSize: 20 }}>Video Meet</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Video call with your class — sign in with Google, GitHub, or Facebook when prompted</div>
      </div>

      {/* Join area */}
      <div style={{ padding: 32, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <p style={{ fontSize: 15, color: '#64748b', margin: 0, textAlign: 'center' }}>
          Click below to open the video call in a new window. You&apos;ll join as <strong>{displayName}</strong>. Share the link with students so they can join the same room.
        </p>
        <div style={{
          padding: '12px 16px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a',
          fontSize: 13, color: '#92400e', marginBottom: 8, textAlign: 'center',
        }}>
          <strong>Sign-in required:</strong> When the call opens, sign in with <strong>Google</strong>, <strong>GitHub</strong>, or <strong>Facebook</strong> (one-time). Then you can create or join the room.
        </div>
        <button
          type="button"
          onClick={handleJoin}
          style={{
            padding: '18px 36px',
            borderRadius: 14,
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 24 }}>▶</span>
          Join Video Call
        </button>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: '2px solid #e2e8f0',
              background: copied ? '#ecfdf5' : '#fff',
              color: copied ? '#059669' : '#475569',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy link'}
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
          Room: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4 }}>{roomName}</code>
        </div>
        {popupBlockedMessage && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca',
            fontSize: 13, color: '#b91c1c', textAlign: 'center', maxWidth: 360,
          }}>
            {popupBlockedMessage}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        fontSize: 12,
        color: '#64748b',
      }}>
        <strong>Tip:</strong> Sign in with Google/GitHub/Facebook when prompted, then allow camera and microphone. Share the room link so everyone joins the same call.
      </div>
    </div>
  );
}
