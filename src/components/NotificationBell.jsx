import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { apiRequest } from '../utils/apiClient';

const POLL_INTERVAL = 30000;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const { on, off, connected } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiRequest('/api/notifications?limit=30');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnread(data.unread || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!connected) return;
    const handler = (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 30));
      setUnread(prev => prev + 1);
    };
    on('notification', handler);
    return () => off('notification', handler);
  }, [connected, on, off]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const markRead = async (id) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnread(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  const typeIcon = (type) => {
    const icons = { assignment_new: '📚', grade_posted: '📊', announcement: '📢', due_reminder: '⏰', chat: '💬' };
    return icons[type] || '🔔';
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        style={{
          position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 20, padding: '6px 8px', borderRadius: 8,
          color: open ? '#2563eb' : '#64748b', transition: 'color 0.2s',
        }}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2, background: '#dc2626', color: '#fff',
            fontSize: 10, fontWeight: 900, borderRadius: 99, minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
            lineHeight: 1,
          }}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, width: 360, maxHeight: 480,
          background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid #e2e8f0', zIndex: 9999, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderBottom: '1px solid #f1f5f9',
          }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: '#2563eb', fontWeight: 600,
              }}>Mark all read</button>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: 380 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                  style={{
                    display: 'flex', gap: 10, padding: '10px 16px', cursor: 'pointer',
                    background: n.read ? '#fff' : '#f0f7ff', borderBottom: '1px solid #f8fafc',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = n.read ? '#f8fafc' : '#e0edff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = n.read ? '#fff' : '#f0f7ff'; }}
                >
                  <div style={{ fontSize: 20, flexShrink: 0, paddingTop: 2 }}>{typeIcon(n.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  {!n.read && (
                    <div style={{ width: 8, height: 8, borderRadius: 99, background: '#2563eb', flexShrink: 0, marginTop: 6 }} />
                  )}
                </div>
              ))
            )}
          </div>
          <Link to="/inbox" onClick={() => setOpen(false)} style={{
            display: 'block', textAlign: 'center', padding: '12px 16px',
            borderTop: '1px solid #f1f5f9', fontSize: 13, fontWeight: 700,
            color: '#2563eb', textDecoration: 'none', background: '#fff',
            borderRadius: '0 0 14px 14px',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            View All
          </Link>
        </div>
      )}
    </div>
  );
}
