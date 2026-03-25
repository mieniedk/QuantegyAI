import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Canvas-style Help button: ? icon in header that opens a dropdown with
 * Platform status, Keyboard shortcuts, Privacy, Terms, and optionally API docs (teacher).
 */
export default function HelpMenu({ showApiDocs = false }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const openCommandBar = () => {
    setOpen(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true }));
  };

  const items = [
    { to: '/status', label: 'Platform status', icon: '●' },
    { onClick: openCommandBar, label: 'Keyboard shortcuts', icon: '⌘', sub: 'Ctrl+K' },
    { to: '/privacy', label: 'Privacy policy', icon: '🔒' },
    { to: '/terms', label: 'Terms of service', icon: '📄' },
  ];
  if (showApiDocs) items.push({ to: '/api-docs', label: 'API & developers', icon: '⚙️' });

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Help"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          background: open ? 'var(--color-accent-muted)' : 'var(--color-bg)',
          color: open ? 'var(--color-accent)' : 'var(--color-text-muted)',
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
        }}
        title="Help"
      >
        ?
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            minWidth: 200,
            padding: 6,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            zIndex: 10001,
          }}
        >
          <div style={{ padding: '8px 12px 6px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Help
          </div>
          {items.map((item) => {
            if (item.to) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontSize: 14,
                    color: 'var(--color-text)',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    {item.label}
                  </span>
                  {item.sub && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.sub}</span>}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={item.onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'none',
                  fontSize: 14,
                  color: 'var(--color-text)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-card-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </span>
                {item.sub != null && <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{item.sub}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
