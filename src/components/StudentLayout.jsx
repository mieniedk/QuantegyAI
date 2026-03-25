import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import NotificationBell from './NotificationBell';
import HelpMenu from './HelpMenu';
import { getAuthToken } from '../utils/storage';

const NAV_ITEMS = [
  { to: '/student', label: 'Dashboard', icon: '🏠' },
  { to: '/student-grades', label: 'Grades', icon: '📊' },
  { to: '/portfolio', label: 'Portfolio', icon: '📁' },
  { to: '/games', label: 'Games', icon: '🎮' },
  { to: '/texes-prep', label: 'Test Prep', icon: '📝' },
  { to: '/student?tab=ai-tutor', label: 'AI Tutor', icon: '🤖' },
];

/**
 * Shared layout for student-facing pages.
 * Canvas/Blackboard-inspired: consistent header + nav across Dashboard, Grades, Portfolio.
 */
export default function StudentLayout({ children }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (item) => {
    if (item.to.startsWith('/student?')) {
      const [, query] = item.to.split('?');
      const tab = query?.replace('tab=', '');
      return location.pathname === '/student' && new URLSearchParams(location.search).get('tab') === tab;
    }
    return location.pathname === item.to || (item.to !== '/student' && location.pathname.startsWith(item.to));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <div
          role="presentation"
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          }}
          aria-hidden="true"
        />
      )}
      {/* Mobile nav drawer */}
      <nav
        className="student-mobile-nav-drawer"
        aria-label="Mobile navigation"
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 9999,
          width: 280, maxWidth: '85vw',
          background: 'var(--color-bg-elevated)',
          borderRight: '1px solid var(--color-border)',
          boxShadow: mobileNavOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
          transform: mobileNavOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease-out',
          padding: '60px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 10,
                textDecoration: 'none', fontSize: 16, fontWeight: active ? 700 : 600,
                background: active ? 'var(--color-accent-muted)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text)',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      {/* Top bar */}
      <header role="banner" aria-label="Student header" style={{
        background: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 16px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="student-mobile-menu-btn"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
            style={{
              display: 'none',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, borderRadius: 8, color: 'var(--color-text)',
            }}
          >
            <span style={{ fontSize: 22 }}>☰</span>
          </button>
          <Link to="/" style={{
            color: 'var(--color-accent)',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span style={{ fontSize: 16 }}>←</span> {t('home')}
          </Link>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>
            Quantegy <span style={{ color: 'var(--color-accent)' }}>Student</span>
          </span>
          <nav className="student-layout-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }} aria-label="Student navigation">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: active ? 700 : 600,
                    background: active ? 'var(--color-accent-muted)' : 'transparent',
                    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--color-card-hover)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                    }
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <HelpMenu />
          {getAuthToken() && <NotificationBell />}
          <LanguageSelector compact />
        </div>
      </header>

      <main className="student-main-content" style={{ flex: 1, minHeight: 'calc(100vh - 52px)' }}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="student-bottom-nav"
        aria-label="Quick navigation"
        style={{
          display: 'none',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border)',
          padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
          flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '6px 12px', borderRadius: 10,
                textDecoration: 'none', fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                minWidth: 56,
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
