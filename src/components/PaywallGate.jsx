import { useState, useCallback, useEffect } from 'react';
import {
  COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE, HEADING, BODY,
  PAGE_WRAP, MOBILE_BP,
} from '../utils/loopStyles';
import {
  studentSignup, studentLogin, isStudentLoggedIn, getStudentInfo,
  hasExamAccess, createStudentCheckout,
  reAuthenticateWithServer,
} from '../utils/studentAuth';

const EXAM_LABELS = {
  math712: 'TExES Math 7-12',
  math48: 'TExES Math 4-8',
  linearAlgebra: 'Linear Algebra',
};

const PLANS = [
  {
    id: 'student_exam_onetime',
    title: 'This Exam Only',
    price: '$29',
    interval: 'one-time',
    desc: 'Lifetime access to every competency loop for this exam.',
    highlight: true,
  },
  {
    id: 'student_monthly',
    title: 'All Exams',
    price: '$9.99',
    interval: '/month',
    desc: 'Unlimited access to every certification exam on the platform.',
    highlight: false,
  },
];
/** Billing/subscription check after login — allow for API cold start. */
const ACCESS_TIMEOUT_MS = 35000;

const INPUT_STYLE = {
  width: '100%',
  padding: '12px 14px',
  minHeight: 42,
  fontSize: 15,
  borderRadius: 10,
  border: `1.5px solid ${COLOR.border}`,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

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

const VALID_COUPONS = new Set(['ALLEN100', 'FREEACCESS', 'TEXES2025', 'MATHPREP', 'PIONEER']);

export default function PaywallGate({ examId, diagnosticScore, onUnlocked }) {
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [mode, setMode] = useState(isStudentLoggedIn() ? 'pricing' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyLong, setBusyLong] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const examLabel = EXAM_LABELS[examId] || examId;
  const isMobile = viewportWidth < MOBILE_BP;
  const withTimeout = useCallback((promise, timeoutMs, timeoutError) => {
    let timerId;
    const timeoutPromise = new Promise((resolve) => {
      timerId = setTimeout(() => resolve({ success: false, error: timeoutError }), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      if (timerId) clearTimeout(timerId);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let raf = null;
    const onResize = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        setViewportWidth(window.innerWidth);
      });
    };
    window.addEventListener('resize', onResize);
    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);
  useEffect(() => {
    if (!busy) { setBusyLong(false); return undefined; }
    const timer = setTimeout(() => setBusyLong(true), 6000);
    return () => clearTimeout(timer);
  }, [busy]);

  const runAuthFlow = useCallback(async ({ autoCheckoutPlanId = '' } = {}) => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    setBusy(true);
    try {
      const args = mode === 'signup'
        ? { email: email.trim(), password, displayName: displayName.trim() || email.split('@')[0] }
        : { email: email.trim(), password };
      let result = mode === 'signup'
        ? await studentSignup(args)
        : await studentLogin(args);
      if (!result?.success && mode === 'signup' && isAccountExistsError(result?.error)) {
        result = await studentLogin({ email: email.trim(), password });
      }
      if (!result.success) { setError(result.error || 'Something went wrong.'); return; }

      setAuthEmail(email.trim());
      setAuthPassword(password);

      if (result.local) {
        setIsOffline(true);
        setMode('pricing');
        return;
      }

      if (autoCheckoutPlanId) {
        const checkoutResult = await createStudentCheckout(examId, autoCheckoutPlanId);
        if (checkoutResult?.offline) {
          setIsOffline(true);
          setMode('pricing');
          setError(checkoutResult.error || 'Payment server is starting up. Please retry in a moment.');
          return;
        }
        if (!checkoutResult?.success) {
          setMode('pricing');
          setError(checkoutResult?.error || 'Could not start checkout. You can pick a plan below.');
        }
        return;
      }

      const accessResult = await withTimeout(
        hasExamAccess(examId).then((ok) => ({ success: true, ok })),
        ACCESS_TIMEOUT_MS,
        'We created your account, but access check timed out. Please continue to pricing.',
      );
      if (!accessResult.success) {
        setMode('pricing');
        setError(accessResult.error || 'Access check timed out. Please continue to pricing.');
        return;
      }
      const access = !!accessResult.ok;
      if (access) {
        onUnlocked?.();
      } else {
        setMode('pricing');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setBusy(false);
    }
  }, [mode, email, password, displayName, examId, onUnlocked, withTimeout]);

  const handleCheckout = useCallback(async (planId) => {
    setBusy(true);
    setError('');
    try {
      if (isOffline && authEmail && authPassword) {
        setRetrying(true);
        const reAuth = await reAuthenticateWithServer(authEmail, authPassword);
        setRetrying(false);
        if (reAuth?.success) {
          setIsOffline(false);
          const checkoutResult = await createStudentCheckout(examId, planId);
          if (!checkoutResult?.success) {
            setError(checkoutResult?.error || 'Could not start checkout.');
          }
          setBusy(false);
          return;
        }
        setError('Payment server is still waking up. Render free-tier servers can take up to 60 seconds on the first visit — please wait a moment and tap "Retry" again.');
        setBusy(false);
        return;
      }
      const result = await createStudentCheckout(examId, planId);
      if (result?.offline) {
        setIsOffline(true);
        setError(result.error || 'Payment server is starting up. Please retry in a moment.');
      } else if (!result?.success) {
        setError(result?.error || 'Could not start checkout.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    }
    setBusy(false);
  }, [examId, isOffline, authEmail, authPassword]);

  const handleCoupon = useCallback(() => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
    if (VALID_COUPONS.has(code)) {
      try { localStorage.setItem(`coupon-redeemed:${examId}`, code); } catch {}
      onUnlocked?.();
    } else {
      setCouponError('Invalid coupon code. Please check and try again.');
    }
  }, [couponCode, examId, onUnlocked]);

  const studentInfo = getStudentInfo();

  return (
    <div style={{ ...PAGE_WRAP, display: 'flex', justifyContent: 'center', padding: isMobile ? '16px 10px 24px' : '40px 16px' }}>
      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Locked badge */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ ...BADGE, background: COLOR.amberBg, color: COLOR.amber, border: `1px solid ${COLOR.amberBorder}`, fontSize: 13, padding: '6px 16px' }}>
            Free Preview Complete
          </span>
        </div>

        {/* Hero message */}
        <div style={{ ...CARD, textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ ...HEADING, fontSize: 22, marginBottom: 10 }}>
            You&rsquo;re making progress!
          </h2>
          {typeof diagnosticScore === 'number' && (
            <p style={{ ...BODY, marginBottom: 8 }}>
              You scored <strong style={{ color: COLOR.green }}>{diagnosticScore}%</strong> on the diagnostic quiz.
            </p>
          )}
          <p style={{ ...BODY, marginBottom: 0 }}>
            Unlock the full <strong>{examLabel}</strong> prep loop to keep building toward certification.
          </p>
        </div>

        {/* Auth form (signup/login) */}
        {mode !== 'pricing' && (
          <div style={{ ...CARD, marginBottom: 24 }}>
            <h3 style={{ ...HEADING, fontSize: 17, marginBottom: 16 }}>
              {mode === 'signup' ? 'Create Your Free Account' : 'Log In'}
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); runAuthFlow(); }}>
              {mode === 'signup' && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLOR.textSecondary, display: 'block', marginBottom: 4 }}>Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={INPUT_STYLE}
                    placeholder="How should we call you?"
                    autoComplete="name"
                  />
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLOR.textSecondary, display: 'block', marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={INPUT_STYLE}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLOR.textSecondary, display: 'block', marginBottom: 4 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={INPUT_STYLE}
                  placeholder={mode === 'signup' ? 'At least 4 characters' : 'Your password'}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>

              {error && (
                <p style={{ color: COLOR.red, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{error}</p>
              )}
              {busy && mode === 'signup' && (
                <p style={{ color: COLOR.textSecondary, fontSize: 12, lineHeight: 1.45, marginBottom: 12 }}>
                  Connecting to our servers. If you haven&rsquo;t signed in for a while, this can take up to a minute the first time.
                </p>
              )}
              {busy && busyLong && (
                <p style={{ color: COLOR.textSecondary, fontSize: 12, lineHeight: 1.45, marginBottom: 12 }}>
                  Still working… if this keeps happening, retry once and check that the backend is running (`npm run start`).
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{ ...(busy ? BTN_PRIMARY_DISABLED : BTN_PRIMARY), minHeight: 44 }}
              >
                {busy ? 'Please wait...' : mode === 'signup' ? 'Create Account & Continue' : 'Log In & Continue'}
              </button>
            </form>
            <div style={{ marginTop: 10, borderTop: `1px solid ${COLOR.border}`, paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, marginBottom: 8 }}>
                Fast unlock option
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAuthFlow({ autoCheckoutPlanId: 'student_exam_onetime' })}
                  style={{
                    ...(busy ? BTN_PRIMARY_DISABLED : BTN_PRIMARY),
                    minHeight: 40,
                    fontSize: 13,
                    padding: '8px 12px',
                  }}
                >
                  {busy ? 'Please wait...' : 'Sign up + Pay ($29)'}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAuthFlow({ autoCheckoutPlanId: 'student_monthly' })}
                  style={{
                    minHeight: 40,
                    borderRadius: 10,
                    border: `1px solid ${COLOR.border}`,
                    background: '#fff',
                    color: COLOR.text,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.65 : 1,
                  }}
                >
                  {busy ? 'Please wait...' : 'Sign up + Pay ($9.99/mo)'}
                </button>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: COLOR.textSecondary }}>
              {mode === 'signup' ? (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: COLOR.blue, fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>Log in</button>
                </>
              ) : (
                <>Need an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: COLOR.blue, fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>Sign up</button>
                </>
              )}
            </p>

            <div style={{ marginTop: 10, borderTop: `1px solid ${COLOR.border}`, paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLOR.textSecondary, marginBottom: 6 }}>Have a coupon code?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                  placeholder="Enter code"
                  style={{ ...INPUT_STYLE, flex: 1, padding: '8px 12px', fontSize: 13 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCoupon(); }}
                />
                <button
                  type="button"
                  onClick={handleCoupon}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: `1.5px solid #7c3aed`,
                    background: 'rgba(124, 58, 237, 0.06)',
                    color: '#7c3aed',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p style={{ color: COLOR.red, fontSize: 12, fontWeight: 600, marginTop: 4, marginBottom: 0 }}>{couponError}</p>
              )}
            </div>
          </div>
        )}

        {/* Pricing cards */}
        {mode === 'pricing' && (
          <>
            {studentInfo && (
              <p style={{ textAlign: 'center', fontSize: 14, color: COLOR.textSecondary, marginBottom: 16 }}>
                Signed in as <strong>{studentInfo.displayName || studentInfo.username}</strong>
              </p>
            )}

            {isOffline && (
              <div style={{
                ...CARD,
                marginBottom: 20,
                background: '#fffbeb',
                border: `1.5px solid ${COLOR.amberBorder}`,
                textAlign: 'center',
              }}>
                <p style={{ ...BODY, fontWeight: 700, color: COLOR.amber, marginBottom: 6 }}>
                  Payment server is starting up
                </p>
                <p style={{ fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.5, marginBottom: 0 }}>
                  Our server sleeps when inactive and can take up to 60 seconds to wake up.
                  Tap a plan below to retry the connection, or use a coupon code.
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    ...CARD,
                    padding: isMobile ? 16 : 20,
                    textAlign: 'center',
                    border: plan.highlight ? `2px solid ${COLOR.green}` : `1px solid ${COLOR.border}`,
                    position: 'relative',
                  }}
                >
                  {plan.highlight && (
                    <span style={{
                      position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                      background: COLOR.green, color: '#fff', fontSize: 10, fontWeight: 700,
                      padding: '2px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      Best Value
                    </span>
                  )}
                  <h4 style={{ ...HEADING, fontSize: 16, marginBottom: 6 }}>{plan.title}</h4>
                  <div style={{ fontSize: 28, fontWeight: 800, color: COLOR.text, marginBottom: 2 }}>
                    {plan.price}
                    <span style={{ fontSize: 14, fontWeight: 500, color: COLOR.textSecondary }}>{plan.interval === 'one-time' ? '' : plan.interval}</span>
                  </div>
                  <p style={{ fontSize: 13, color: COLOR.textSecondary, lineHeight: 1.4, marginBottom: 16 }}>{plan.desc}</p>
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={busy}
                    style={{
                      ...(busy ? BTN_PRIMARY_DISABLED : BTN_PRIMARY),
                      padding: '10px 16px',
                      minHeight: 42,
                      fontSize: 14,
                    }}
                  >
                    {busy && retrying ? 'Connecting...' : busy ? '...' : isOffline ? 'Retry & Pay' : 'Start Now'}
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <p style={{ color: COLOR.red, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{error}</p>
            )}

            <div style={{ ...CARD, marginBottom: 16, padding: isMobile ? 14 : 18 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLOR.text, marginBottom: 8 }}>Have a coupon code?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                  placeholder="Enter code"
                  style={{ ...INPUT_STYLE, flex: 1, padding: '10px 12px', fontSize: 14 }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCoupon(); }}
                />
                <button
                  type="button"
                  onClick={handleCoupon}
                  style={{
                    ...BTN_PRIMARY,
                    minHeight: 42,
                    padding: '10px 18px',
                    fontSize: 13,
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  }}
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <p style={{ color: COLOR.red, fontSize: 12, fontWeight: 600, marginTop: 6, marginBottom: 0 }}>{couponError}</p>
              )}
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: COLOR.textMuted }}>
              Secure payment via Stripe. Cancel anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
