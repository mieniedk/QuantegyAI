import React, { useState, useCallback, useRef, useEffect } from 'react';
import { studentSignup, studentLogin, pushProgress } from '../utils/studentAuth';
import { COLOR, BTN_PRIMARY, MOBILE_BP } from '../utils/loopStyles';

const MASTERY_KEY = 'quantegyai-mastery';
const EXPERIENCE_KEY = 'quantegyai-learning-experience';
const REVIEW_KEY = 'quantegyai-loop-review';

const LEGACY_TO_NEW = {
  'allen-ace-mastery': MASTERY_KEY,
  'allen-ace-learning-experience': EXPERIENCE_KEY,
  'allen-ace-loop-review': REVIEW_KEY,
};
const PENDING_SIGNUP_KEY = 'quantegy-pending-signup';
/** After cold-start wake, signup can still take a while — don’t alarm before this (ms). */
const BUSY_LONG_HINT_MS = 52000;

function isAccountExistsError(message) {
  const text = String(message || '').toLowerCase();
  return text.includes('already exists')
    || text.includes('already registered')
    || text.includes('already in use')
    || text.includes('account exists')
    || text.includes('username exists')
    || text.includes('email exists')
    || text.includes('duplicate');
}

function syncProgressToServer() {
  const keys = [MASTERY_KEY, EXPERIENCE_KEY, REVIEW_KEY];
  keys.forEach((k) => {
    try {
      let raw = localStorage.getItem(k);
      if (raw == null) {
        const legacyKey = Object.keys(LEGACY_TO_NEW).find((oldKey) => LEGACY_TO_NEW[oldKey] === k);
        if (legacyKey) raw = localStorage.getItem(legacyKey);
      }
      if (raw) pushProgress(k, JSON.parse(raw));
    } catch { /* best-effort */ }
  });
}

function warmUpApi() {
  try {
    const base = (import.meta.env.VITE_API_URL || '').trim() || 'https://quantegyai-api.onrender.com';
    fetch(`${base}/api/health`, { method: 'GET' }).catch(() => {});
  } catch { /* best effort */ }
}

export default function SaveProgressModal({ onClose, onSignedUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyLong, setBusyLong] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const busyTimerRef = useRef(null);
  const modalRef = useRef(null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false;

  useEffect(() => {
    modalRef.current?.focus();
    warmUpApi();
  }, []);

  useEffect(() => {
    if (busy) {
      busyTimerRef.current = setTimeout(() => setBusyLong(true), BUSY_LONG_HINT_MS);
    } else {
      clearTimeout(busyTimerRef.current);
      setBusyLong(false);
    }
    return () => clearTimeout(busyTimerRef.current);
  }, [busy]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => {
      onSignedUp?.();
    }, 2000);
    return () => clearTimeout(t);
  }, [success, onSignedUp]);

  const cancelledRef = useRef(false);
  const saveLocally = useCallback(() => {
    cancelledRef.current = true;
    try {
      localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
        email: email.trim(),
        displayName: displayName.trim() || email.trim().split('@')[0],
        ts: Date.now(),
      }));
    } catch { /* best effort */ }
    setBusy(false);
    setSavedLocally(true);
    setSuccess(true);
  }, [email, displayName]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setBusy(true);
    try {
      let result = await studentSignup({
        email: trimmedEmail,
        password,
        displayName: displayName.trim() || trimmedEmail.split('@')[0],
      });
      if (cancelledRef.current) return;
      if (!result.success && isAccountExistsError(result.error)) {
        result = await studentLogin({ email: trimmedEmail, password });
      }
      if (cancelledRef.current) return;
      if (!result.success) {
        setError(
          (result.error || 'Something went wrong.') +
          ' Your progress is safe on this device. You can try creating an account later.'
        );
        return;
      }
      syncProgressToServer();
      setSuccess(true);
    } catch (err) {
      if (cancelledRef.current) return;
      setError((err.message || 'Network error.') + ' Your progress is safe on this device.');
    } finally {
      if (!cancelledRef.current) setBusy(false);
    }
  }, [email, password, displayName]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-progress-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'center',
        padding: isMobile ? '12px 10px' : 16,
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={{
          maxWidth: 420, width: '100%', borderRadius: 16,
          maxHeight: 'calc(100dvh - 24px)',
          overflowY: 'auto',
          marginTop: isMobile ? 10 : 0,
          padding: isMobile ? '18px 14px' : '28px 24px', background: '#fff', outline: 'none',
          boxShadow: '0 25px 50px rgba(0,0,0,0.18)',
          border: `1px solid ${COLOR.border}`,
        }}
      >
        {success ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: COLOR.green }}>
              {savedLocally ? 'Progress saved on this device!' : 'Progress saved!'}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.5 }}>
              {savedLocally
                ? 'Your progress is saved locally. You can create an account later to sync across devices.'
                : 'Your account is set up. You can log in from any device to continue where you left off.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Don't lose your work
            </div>
            <h3 id="save-progress-title" style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: COLOR.text, lineHeight: 1.3 }}>
              Save your progress
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.55 }}>
              Create a free account so you can pick up where you left off — on any device, any time.
            </p>
            <div style={{ margin: '0 0 16px', padding: '10px 12px', borderRadius: 10, background: '#eef6ff', border: `1px solid ${COLOR.blue}40` }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLOR.blue, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Optional upgrade
              </div>
              <div style={{ fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.45, marginBottom: 8 }}>
                Unlock premium prep now: <strong style={{ color: COLOR.text }}>$9.99/month</strong> (all exams) or <strong style={{ color: COLOR.text }}>$29 one-time</strong> (single exam).
              </div>
              <a
                href="/pricing"
                style={{
                  display: 'inline-block',
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLOR.blue,
                  textDecoration: 'none',
                }}
              >
                View upgrade options →
              </a>
            </div>

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLOR.text, marginBottom: 4 }}>
                Display name <span style={{ color: COLOR.textMuted, fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                autoComplete="name"
                style={{
                  width: '100%', padding: '12px 12px', minHeight: 42, borderRadius: 8,
                  border: `1px solid ${COLOR.border}`, fontSize: 14,
                  marginBottom: 12, boxSizing: 'border-box',
                }}
              />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLOR.text, marginBottom: 4 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                style={{
                  width: '100%', padding: '12px 12px', minHeight: 42, borderRadius: 8,
                  border: `1px solid ${COLOR.border}`, fontSize: 14,
                  marginBottom: 12, boxSizing: 'border-box',
                }}
              />

              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: COLOR.text, marginBottom: 4 }}>
                Password <span style={{ color: COLOR.textMuted, fontWeight: 400 }}>(min 4 characters)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                autoComplete="new-password"
                required
                minLength={4}
                style={{
                  width: '100%', padding: '12px 12px', minHeight: 42, borderRadius: 8,
                  border: `1px solid ${COLOR.border}`, fontSize: 14,
                  marginBottom: 16, boxSizing: 'border-box',
                }}
              />

              {error && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ padding: '10px 12px', borderRadius: 8, background: COLOR.redBg, fontSize: 13, color: COLOR.red, lineHeight: 1.4, marginBottom: 8 }}>
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={saveLocally}
                    style={{
                      width: '100%', padding: '10px 16px', minHeight: 40,
                      fontSize: 13, fontWeight: 700, borderRadius: 8,
                      background: COLOR.greenBg || '#e6f9ed', color: COLOR.green || '#16a34a',
                      border: `1px solid ${COLOR.green || '#16a34a'}`,
                      cursor: 'pointer',
                    }}
                  >
                    Save progress on this device for now
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{
                  ...BTN_PRIMARY,
                  fontSize: 15,
                  minHeight: 44,
                  padding: '12px 24px',
                  opacity: busy ? 0.7 : 1,
                  cursor: busy ? 'wait' : 'pointer',
                }}
              >
                {busy ? 'Creating account…' : 'Save my progress'}
              </button>
              {busy && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLOR.textMuted, lineHeight: 1.45 }}>
                  Connecting to our servers. If nobody has used the app for a while, the first sign-up can take up to about a minute while the service starts — please keep this tab open.
                </div>
              )}
              {busyLong && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 12, color: COLOR.textMuted, marginBottom: 6 }}>
                    Still working — you can wait a bit longer, or save on this device below if you prefer not to wait.
                  </div>
                  <button
                    type="button"
                    onClick={saveLocally}
                    style={{
                      width: '100%', padding: '10px 16px', minHeight: 40,
                      fontSize: 13, fontWeight: 700, borderRadius: 8,
                      background: COLOR.greenBg || '#e6f9ed', color: COLOR.green || '#16a34a',
                      border: `1px solid ${COLOR.green || '#16a34a'}`,
                      cursor: 'pointer',
                    }}
                  >
                    Save on this device for now
                  </button>
                </div>
              )}
            </form>

            <button
              type="button"
              onClick={onClose}
              style={{
                marginTop: 12, width: '100%', padding: '10px', minHeight: 40,
                fontSize: 13, fontWeight: 600, color: COLOR.textMuted,
                background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Maybe later
            </button>
            <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11, color: COLOR.textMuted, lineHeight: 1.4 }}>
              If you choose “save on this device for now,” progress is stored locally on this device only until you sign in.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
