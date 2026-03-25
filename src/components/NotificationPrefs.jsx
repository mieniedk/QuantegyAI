import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiClient';
import { getUserFriendlyError } from '../utils/errorMessages';
import SkeletonLoader from './SkeletonLoader';

const PREF_OPTIONS = [
  { key: 'inapp_assignments', label: 'New assignments', category: 'In-App' },
  { key: 'inapp_grades', label: 'Grades posted', category: 'In-App' },
  { key: 'inapp_announcements', label: 'Announcements', category: 'In-App' },
  { key: 'inapp_chat', label: 'Chat messages', category: 'In-App' },
  { key: 'email_assignments', label: 'New assignments', category: 'Email' },
  { key: 'email_grades', label: 'Grades posted', category: 'Email' },
  { key: 'email_announcements', label: 'Announcements', category: 'Email' },
  { key: 'email_chat', label: 'Chat messages', category: 'Email' },
];

export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    apiRequest('/api/notifications/prefs')
      .then(r => r.json())
      .then(d => { if (d.success) setPrefs(d.prefs); })
      .catch((err) => { console.warn('Failed to load notification preferences:', err); });
  }, []);

  const toggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
    setSaveError('');
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiRequest('/api/notifications/prefs', { method: 'PUT', body: JSON.stringify(prefs) });
      setSaved(true);
    } catch (err) {
      console.warn('Failed to save notification preferences:', err);
      setSaveError(getUserFriendlyError(err, 'save preferences'));
    }
    setSaving(false);
  };

  if (!prefs) return (
    <div style={{ padding: 24 }}>
      <SkeletonLoader variant="card" />
      <div style={{ marginTop: 16 }}>
        <SkeletonLoader variant="text" count={5} />
      </div>
    </div>
  );

  const categories = ['In-App', 'Email'];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Notification Preferences</h2>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Choose which notifications you'd like to receive.</p>

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {cat === 'Email' ? '✉️' : '🔔'} {cat} Notifications
          </h3>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {PREF_OPTIONS.filter(o => o.category === cat).map((opt, i, arr) => (
              <div
                key={opt.key}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <span style={{ fontSize: 14, color: '#334155' }}>{opt.label}</span>
                <button
                  type="button"
                  onClick={() => toggle(opt.key)}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: prefs[opt.key] ? '#2563eb' : '#cbd5e1',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 2, left: prefs[opt.key] ? 22 : 2,
                    width: 20, height: 20, borderRadius: 10, background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {saveError && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{saveError}</div>}
      <button type="button" onClick={save} disabled={saving} style={{
        padding: '10px 28px', borderRadius: 8, border: 'none', cursor: 'pointer',
        background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 14,
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Preferences'}
      </button>
    </div>
  );
}
