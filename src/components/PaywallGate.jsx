import { useState, useCallback } from 'react';
import {
  COLOR, CARD, BTN_PRIMARY, BTN_PRIMARY_DISABLED, BADGE, HEADING, BODY,
  PAGE_WRAP,
} from '../utils/loopStyles';
import {
  studentSignup, studentLogin, isStudentLoggedIn, getStudentInfo,
  hasExamAccess, createStudentCheckout,
} from '../utils/studentAuth';

const EXAM_LABELS = {
  math712: 'TExES Math 7-12',
  math48: 'TExES Math 4-8',
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

const INPUT_STYLE = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 15,
  borderRadius: 10,
  border: `1.5px solid ${COLOR.border}`,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

export default function PaywallGate({ examId, diagnosticScore, onUnlocked }) {
  const [mode, setMode] = useState(isStudentLoggedIn() ? 'pricing' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const examLabel = EXAM_LABELS[examId] || examId;

  const handleAuth = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    setBusy(true);
    try {
      const fn = mode === 'signup' ? studentSignup : studentLogin;
      const args = mode === 'signup'
        ? { email: email.trim(), password, displayName: displayName.trim() || email.split('@')[0] }
        : { email: email.trim(), password };
      const result = await fn(args);
      if (!result.success) { setError(result.error || 'Something went wrong.'); setBusy(false); return; }

      const access = await hasExamAccess(examId);
      if (access) {
        onUnlocked?.();
      } else {
        setMode('pricing');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    }
    setBusy(false);
  }, [mode, email, password, displayName, examId, onUnlocked]);

  const handleCheckout = useCallback(async (planId) => {
    setBusy(true);
    setError('');
    try {
      const result = await createStudentCheckout(examId, planId);
      if (result?.demo) {
        onUnlocked?.();
      } else if (!result?.success) {
        setError(result?.error || 'Could not start checkout.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    }
    setBusy(false);
  }, [examId, onUnlocked]);

  const studentInfo = getStudentInfo();

  return (
    <div style={{ ...PAGE_WRAP, display: 'flex', justifyContent: 'center', padding: '40px 16px' }}>
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

            <form onSubmit={handleAuth}>
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

              <button
                type="submit"
                disabled={busy}
                style={busy ? BTN_PRIMARY_DISABLED : BTN_PRIMARY}
              >
                {busy ? 'Please wait...' : mode === 'signup' ? 'Create Account & Continue' : 'Log In & Continue'}
              </button>
            </form>

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    ...CARD,
                    padding: 20,
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
                      fontSize: 14,
                    }}
                  >
                    {busy ? '...' : 'Start Now'}
                  </button>
                </div>
              ))}
            </div>

            {error && (
              <p style={{ color: COLOR.red, fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{error}</p>
            )}

            <p style={{ textAlign: 'center', fontSize: 12, color: COLOR.textMuted }}>
              Secure payment via Stripe. Cancel anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
