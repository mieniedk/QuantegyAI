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
const SIGNUP_TIMEOUT_MS = 35000;

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

export default function SaveProgressModal({ onClose, onSignedUp, onSavedLocally }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localOnlySaved, setLocalOnlySaved] = useState(false);
  const modalRef = useRef(null);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false;

  useEffect(() => {
    modalRef.current?.focus();
  }, []);

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
      if (localOnlySaved) onSavedLocally?.();
      else onSignedUp?.();
    }, 2000);
    return () => clearTimeout(t);
  }, [success, localOnlySaved, onSignedUp, onSavedLocally]);

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
        timeoutMs: SIGNUP_TIMEOUT_MS,
      });
      if (!result.success && isAccountExistsError(result.error)) {
        // If account already exists, log in and sync instead of failing save flow.
        result = await studentLogin({ email: trimmedEmail, password });
      }
      if (!result.success) {
        if (/timed out/i.test(String(result.error || ''))) {
          // Local storage is always written during play; on timeout we still
          // confirm device-local save so students do not lose current work.
          setLocalOnlySaved(true);
          setSuccess(true);
          return;
        }
        setError(result.error || 'Something went wrong. Please try again.');
        return;
      }
      syncProgressToServer();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setBusy(false);
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
              {localOnlySaved ? 'Progress saved on this device!' : 'Progress saved!'}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: COLOR.textSecondary, lineHeight: 1.5 }}>
              {localOnlySaved
                ? 'Server sync is still waking up. Your current progress is safe locally; retry Save Progress later to sync across devices.'
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
                <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: COLOR.redBg, fontSize: 13, color: COLOR.red, lineHeight: 1.4 }}>
                  {error}
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
                {busy ? 'Saving progress… this can take up to a minute' : 'Save my progress'}
              </button>
              {busy && (
                <div style={{ marginTop: 8, fontSize: 12, color: COLOR.textMuted, lineHeight: 1.4 }}>
                  Creating your account and syncing progress. Please keep this window open.
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
          </>
        )}
      </div>
    </div>
  );
}
