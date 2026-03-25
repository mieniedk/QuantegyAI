import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { hasProAccess, getStatusLabel } from '../utils/subscription';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import LanguageSelector from './LanguageSelector';
import { autoDropoutScan, clearAuth, getUnreadCount } from '../utils/storage';
import NotificationBell from './NotificationBell';
import HelpMenu from './HelpMenu';

/**
 * Shared layout wrapper for all teacher pages.
 * Canvas/Blackboard-inspired: grouped sidebar + clean main content.
 */
const TeacherLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const username = localStorage.getItem('quantegy-teacher-user');
  const userRole = localStorage.getItem('quantegy-teacher-role');

  const [inboxUnread, setInboxUnread] = useState(0);

  useEffect(() => {
    autoDropoutScan();
    if (!username) return undefined;
    const id = window.setTimeout(() => {
      setInboxUnread(getUnreadCount(username));
    }, 0);
    return () => window.clearTimeout(id);
  }, [location.pathname, username]);

  useEffect(() => {
    const interval = setInterval(() => {
      autoDropoutScan();
      if (username) setInboxUnread(getUnreadCount(username));
    }, 300000);
    return () => clearInterval(interval);
  }, [username]);

  const statusLabel = username ? getStatusLabel(username) : '';
  const hasPro = username ? hasProAccess(username) : false;

  const handleLogout = () => {
    clearAuth();
    navigate('/teacher');
  };

  useEffect(() => {
    const onExpired = () => navigate('/teacher');
    window.addEventListener('auth-expired', onExpired);
    return () => window.removeEventListener('auth-expired', onExpired);
  }, [navigate]);

  const TA_HIDDEN_PATHS = ['/blueprints', '/marketplace', '/pricing', '/teacher-analytics'];

  const allNavGroups = [
    { label: null, items: [
      { to: '/teacher-dashboard', labelKey: 'dashboard', icon: '\uD83C\uDFE0' },
      { to: '/teacher-classes', labelKey: 'myClasses', icon: '\uD83D\uDCDA' },
      { to: '/inbox', labelKey: 'inbox', icon: '\u2709\uFE0F', badge: inboxUnread },
      { to: '/files', labelKey: 'files', icon: '\uD83D\uDCC1' },
      { to: '/teacher-copilot', labelKey: 'aiCopilot', icon: '\uD83E\uDD16', pro: true },
    ]},
    { label: 'teaching', items: [
      { to: '/blueprints', labelKey: 'blueprints', icon: '\uD83D\uDCD8' },
      { to: '/commons', labelKey: 'commons', icon: '\uD83D\uDCDA' },
      { to: '/games', labelKey: 'gamesLibrary', icon: '\uD83C\uDFAF' },
      { to: '/live-game', labelKey: 'liveGame', icon: '\uD83C\uDFAE' },
      { to: '/calendar', labelKey: 'calendar', icon: '\uD83D\uDCC5' },
      { to: '/classroom-tools', labelKey: 'tools', icon: '\uD83D\uDEE0\uFE0F' },
    ]},
    { label: 'more', items: [
      { to: '/teacher-analytics', labelKey: 'analytics', icon: '\uD83D\uDCCA', pro: true },
      { to: '/marketplace', labelKey: 'marketplace', icon: '\uD83D\uDED2' },
      { to: '/pricing', labelKey: 'pricing', icon: '\uD83D\uDCB3' },
    ]},
  ];

  const navGroups = userRole === 'ta'
    ? allNavGroups.map((g) => ({ ...g, items: g.items.filter((item) => !TA_HIDDEN_PATHS.includes(item.to)) })).filter((g) => g.items.length > 0)
    : allNavGroups;

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Responsive styles are in index.css */}

      {/* Top bar */}
      <header role="banner" aria-label="Platform header" style={{
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/teacher-dashboard" style={{
            fontWeight: 700,
            fontSize: 17,
            color: 'var(--color-text)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
          }}>
            QuantegyAI
          </Link>
          <button type="button" onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true });
            window.dispatchEvent(event);
          }} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
            borderRadius: 6, background: 'var(--color-bg)', border: '1px solid var(--color-border)',
            fontSize: 12, color: 'var(--color-text-muted)', cursor: 'pointer', fontWeight: 500,
          }}>
            {'\uD83D\uDD0D'} Search or command...
            <kbd style={{ padding: '1px 5px', borderRadius: 3, background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: 10, fontWeight: 600 }}>Ctrl+K</kbd>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 18, padding: '4px 8px', borderRadius: 6,
              color: 'var(--color-text-muted)',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <HelpMenu showApiDocs />
          <NotificationBell />
          <LanguageSelector compact />
          <span style={{
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            background: hasPro ? '#ecfdf5' : '#fef3c7',
            color: hasPro ? '#065f46' : '#92400e',
          }}>
            {statusLabel || t('free')}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>{username}</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
            }}
          >
            {t('logout')}
          </button>
        </div>
      </header>

      <div className="teacher-layout-flex" style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        {/* Sidebar */}
        <nav className="teacher-sidebar" aria-label="Main navigation" style={{
          width: 220,
          minWidth: 220,
          flexShrink: 0,
          background: 'var(--color-sidebar-bg)',
          borderRight: '1px solid var(--color-sidebar-border)',
          padding: '20px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          overflowY: 'auto',
        }}>
          {navGroups.map((group, gi) => (
            <div key={gi} className="nav-group" style={{ marginBottom: group.label ? 20 : 12 }}>
              {group.label && (
                <div className="nav-section-label" style={{
                  padding: '0 12px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {t(group.label)}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item.to);
                const locked = item.pro && !hasPro;
                const href = locked ? `/pricing?user=${username}` : item.to;
                return (
                  <Link
                    key={item.to}
                    to={href}
                    aria-current={active ? 'page' : undefined}
                    aria-label={locked ? `${t(item.labelKey)} (Pro feature)` : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      marginBottom: 2,
                      borderRadius: 8,
                      background: active ? 'var(--color-accent-muted)' : 'transparent',
                      color: active ? 'var(--color-accent)' : locked ? 'var(--color-text-muted)' : 'var(--color-text)',
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      textDecoration: 'none',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (!active && !locked) {
                        e.currentTarget.style.background = 'var(--color-card-hover)';
                        e.currentTarget.style.color = 'var(--color-text)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active && !locked) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text)';
                      }
                    }}
                  >
                    <span style={{ fontSize: 16, opacity: locked ? 0.6 : 1 }}>{item.icon}</span>
                    <span>{t(item.labelKey)}</span>
                    {item.badge > 0 && (
                      <span style={{
                        marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 10,
                        background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
                      }}>
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {locked && <span style={{ fontSize: 10, marginLeft: 'auto' }}>🔒</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Main content */}
        <main className="teacher-main" style={{
          flex: 1,
          overflow: 'auto',
          padding: 28,
          maxWidth: 1000,
          minWidth: 0,
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
