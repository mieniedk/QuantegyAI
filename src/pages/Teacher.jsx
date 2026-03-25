import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getTeachers, saveTeachers, getTeacherProfile, serverSignup, serverLogin, serverLoadAccounts, serverForgotLookup, serverResetPassword, getAuthToken, setAuthToken, verifySession } from '../utils/storage';
import { startTrial } from '../utils/subscription';
import { fetchWithRetry } from '../utils/api';

/**
 * Teacher login/signup page.
 * After login, redirects to onboarding (if first time) or dashboard.
 */
const Teacher = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // view: 'login' | 'signup' | 'forgot' | 'reset'
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetUser, setResetUser] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [ssoLoading, setSsoLoading] = useState('');
  const [apiReachable, setApiReachable] = useState(null); // null = unknown, true/false after check
  const [ssoProviders, setSsoProviders] = useState([]); // { id, name, configured, color }[] — only configured ones shown

  const clearFields = () => {
    setPassword('');
    setConfirmPassword('');
    setMessage({ text: '', type: '' });
  };

  // Check if backend API is reachable (for SSO and login). Callable so user can retry.
  const checkApiReachable = React.useCallback(() => {
    setApiReachable(null);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    fetch('/api/status', { method: 'GET', signal: ctrl.signal })
      .then((r) => r.ok)
      .then((ok) => setApiReachable(ok))
      .catch(() => setApiReachable(false))
      .finally(() => clearTimeout(t));
  }, []);

  useEffect(() => {
    checkApiReachable();
  }, [checkApiReachable]);

  // Load SSO providers (show all; unconfigured ones show a message on click instead of redirecting)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/sso/providers', { method: 'GET' })
      .then((r) => r.ok ? r.json() : { providers: [] })
      .then((data) => {
        if (!cancelled && data?.providers?.length) {
          setSsoProviders(data.providers);
        } else if (!cancelled) {
          // Fallback if API unavailable: show Google, Microsoft, Clever so the buttons appear
          setSsoProviders([
            { id: 'google', name: 'Google', configured: false, color: '#4285f4' },
            { id: 'microsoft', name: 'Microsoft', configured: false, color: '#00a4ef' },
            { id: 'clever', name: 'Clever', configured: false, color: '#4274f6' },
          ]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSsoProviders([
            { id: 'google', name: 'Google', configured: false, color: '#4285f4' },
            { id: 'microsoft', name: 'Microsoft', configured: false, color: '#00a4ef' },
            { id: 'clever', name: 'Clever', configured: false, color: '#4274f6' },
          ]);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Load saved accounts from server (with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const serverAccounts = await serverLoadAccounts();
      if (!cancelled && serverAccounts) {
        setSavedAccounts(serverAccounts);
        return;
      }
      if (!cancelled) {
        const teachers = getTeachers();
        setSavedAccounts(teachers.map((t) => ({
          username: t.username,
          profile: getTeacherProfile(t.username),
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [view]);

  // If already logged in, verify JWT and redirect to dashboard
  useEffect(() => {
    const sessionUser = localStorage.getItem('quantegy-teacher-user');
    const token = getAuthToken();
    if (!sessionUser && !token) return;
    if (!sessionUser) return;

    let profile = getTeacherProfile(sessionUser);
    if (profile?.onboarded) {
      navigate('/teacher-dashboard');
      return;
    }

    // Profile missing from localStorage — recover full teacher data from server
    (async () => {
      try {
        // Fetch profile
        const profRes = await fetch(`/api/auth/profile/${encodeURIComponent(sessionUser)}`);
        const profData = await profRes.json();
        if (profData.success && profData.profile) {
          const profiles = JSON.parse(localStorage.getItem('allen-ace-teacher-profiles') || '{}');
          profiles[sessionUser] = profData.profile;
          localStorage.setItem('allen-ace-teacher-profiles', JSON.stringify(profiles));
        }
        // Fetch classes
        const clsRes = await fetch(`/api/auth/classes/${encodeURIComponent(sessionUser)}`);
        const clsData = await clsRes.json();
        if (clsData.success && clsData.classes?.length > 0) {
          localStorage.setItem('allen-ace-classes', JSON.stringify(clsData.classes));
        }
        // Fetch assignments
        const asnRes = await fetch(`/api/auth/assignments/${encodeURIComponent(sessionUser)}`);
        const asnData = await asnRes.json();
        if (asnData.success && asnData.assignments?.length > 0) {
          localStorage.setItem('allen-ace-assignments', JSON.stringify(asnData.assignments));
        }
        // Fetch game results
        const grRes = await fetch(`/api/auth/game-results/${encodeURIComponent(sessionUser)}`);
        const grData = await grRes.json();
        if (grData.success && grData.gameResults?.length > 0) {
          localStorage.setItem('allen-ace-game-results', JSON.stringify(grData.gameResults));
        }

        if (profData.success && profData.profile?.onboarded) {
          navigate('/teacher-dashboard');
        } else {
          navigate('/teacher-onboarding');
        }
      } catch (err) {
        console.warn('Teacher init failed:', err);
        navigate('/teacher-onboarding');
      }
    })();
  }, [navigate]);

  // Handle SSO callback tokens from URL params (redirect from OAuth callback)
  useEffect(() => {
    const token = searchParams.get('sso_token');
    const provider = searchParams.get('sso_provider');
    const ssoUser = searchParams.get('sso_user');
    if (!token || !ssoUser) return;

    setAuthToken(token);
    localStorage.setItem('quantegy-teacher-user', ssoUser);
    startTrial(ssoUser);
    // Clean up URL params
    searchParams.delete('sso_token');
    searchParams.delete('sso_provider');
    searchParams.delete('sso_user');
    setSearchParams(searchParams, { replace: true });
    navigate('/teacher-onboarding');
  }, [searchParams, navigate, setSearchParams]);

  const handleSSOLogin = async (provider) => {
    setSsoLoading(provider);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetchWithRetry(`/api/sso/auth/${provider}`, { method: 'GET' }, { retries: 2 });
      if (!res.ok) {
        const body = await res.text();
        let detail = '';
        let hint = '';
        try {
          const j = JSON.parse(body);
          detail = j.error ? ` ${j.error}` : '';
          hint = j.hint ? ` ${j.hint}` : '';
        } catch {
          detail = body ? ` ${body.slice(0, 80)}` : '';
        }
        const base = res.status === 503 ? `Sign-in not configured.${detail}${hint}` : `SSO request failed (${res.status}).${detail} Run "npm run start" to start both frontend and API.`;
        setMessage({
          text: base,
          type: 'error',
        });
        setSsoLoading('');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        // Never redirect to Google with an invalid client ID (avoids "OAuth client was not found")
        if (provider === 'google' && data.url.includes('accounts.google.com')) {
          try {
            const u = new URL(data.url);
            const clientId = u.searchParams.get('client_id') || '';
            if (!clientId.endsWith('.apps.googleusercontent.com') || clientId.includes('demo')) {
              setMessage({
                text: 'Google sign-in is not configured. Add a valid GOOGLE_CLIENT_ID (from Google Cloud Console) to the server .env and restart the server.',
                type: 'error',
              });
              setSsoLoading('');
              return;
            }
          } catch {
            setMessage({ text: 'Invalid Google sign-in URL.', type: 'error' });
            setSsoLoading('');
            return;
          }
        }
        window.location.href = data.url;
      } else {
        setMessage({ text: `Could not start ${provider} login.`, type: 'error' });
        setSsoLoading('');
      }
    } catch (err) {
      console.warn('SSO request failed:', err);
      const isNetwork = err?.message?.includes('fetch') || err?.name === 'TypeError' || err?.code === 'ECONNREFUSED';
      setMessage({
        text: isNetwork
          ? 'Cannot reach the server. Run "npm run start" to start both the frontend and API (required for SSO). Or sign in with username and password below.'
          : 'SSO request failed. Please try again or sign in with username and password.',
        type: 'error',
      });
      setSsoLoading('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!username || !password) {
      setMessage({ text: 'Please enter both username and password.', type: 'error' });
      return;
    }

    const result = await serverLogin(username, password);
    if (result.success) {
      startTrial(username);
      localStorage.setItem('quantegy-teacher-user', username);
      const profile = result.profile || getTeacherProfile(username);
      if (profile?.onboarded) {
        navigate('/teacher-dashboard');
      } else {
        navigate('/teacher-onboarding');
      }
    } else {
      const err = result.error || '';
      const isConnectionError = /unable to connect|connection|network|fetch failed/i.test(err);
      const text = isConnectionError
        ? 'Cannot reach the server. Run "npm run start" in the project folder (not "npm run dev") to start the backend, then try again.'
        : (result.error || 'Username or password incorrect. Sign up if you don\'t have an account yet.');
      setMessage({ text, type: 'error' });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!username || !password || !confirmPassword) {
      setMessage({ text: 'Please fill in all fields.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    const result = await serverSignup(username, password);
    if (!result.success) {
      setMessage({ text: result.error || 'Could not create account.', type: 'error' });
      return;
    }
    startTrial(username);
    localStorage.setItem('quantegy-teacher-user', username);
    navigate('/teacher-onboarding');
  };

  const handleForgotLookup = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!username.trim()) {
      setMessage({ text: 'Please enter your username.', type: 'error' });
      return;
    }

    const result = await serverForgotLookup(username.trim());
    if (!result.success) {
      setMessage({ text: result.error || 'No account found with that username.', type: 'error' });
      return;
    }
    setResetUser(username.trim());
    setView('reset');
    setPassword('');
    setConfirmPassword('');
    setMessage({ text: '', type: '' });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    if (!password || !confirmPassword) {
      setMessage({ text: 'Please fill in both password fields.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    const result = await serverResetPassword(resetUser, password);
    if (!result.success) {
      setMessage({ text: result.error || 'Could not reset password.', type: 'error' });
      return;
    }
    // Also update localStorage
    const teachers = getTeachers();
    const updated = teachers.map((t) =>
      t.username === resetUser ? { ...t, password } : t
    );
    saveTeachers(updated);
    setMessage({ text: 'Password updated successfully! You can now sign in.', type: 'success' });
    setTimeout(() => {
      setView('login');
      setPassword('');
      setConfirmPassword('');
      setResetUser('');
      setMessage({ text: '', type: '' });
    }, 2000);
  };

  // ── Determine heading / subtitle based on view ──
  const headings = {
    login: { title: 'Teacher Portal', subtitle: 'Sign in to manage your classes and access your dashboard.' },
    signup: { title: 'Teacher Portal', subtitle: 'Create your account to get started with a free 7-day Pro trial.' },
    forgot: { title: 'Forgot Password', subtitle: 'Enter your username and we\'ll help you reset your password.' },
    reset: { title: 'Reset Password', subtitle: `Set a new password for "${resetUser}".` },
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', fontFamily: 'system-ui, sans-serif',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px', maxWidth: 420, width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
      }}>
        <Link to="/" style={{
          display: 'inline-block', marginBottom: 24, color: '#2563eb',
          textDecoration: 'none', fontSize: 14, fontWeight: 600,
        }}>
          &larr; Home
        </Link>

        <h1 style={{ margin: '0 0 4px', fontSize: 26, color: '#0f172a' }}>{headings[view].title}</h1>
        <p style={{ margin: '0 0 28px', color: '#64748b', fontSize: 14 }}>{headings[view].subtitle}</p>

        {/* ── Backend unreachable: show first so user sees it before trying to log in ── */}
        {view === 'login' && apiReachable === false && (
          <div style={{ marginBottom: 20, padding: 14, background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
            <strong>Cannot sign in: backend not reachable.</strong>
            <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>Teacher login requires the API. In the project folder run <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4 }}>npm run start</code> (not <code>npm run dev</code>). Then open the URL from the terminal (e.g. http://localhost:4173) and try again.</p>
            <button type="button" onClick={checkApiReachable} style={{ marginTop: 10, padding: '8px 14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Check again</button>
          </div>
        )}

        {/* ── Status message ── */}
        {message.text && (
          <div style={{
            padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500,
            background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: message.type === 'error' ? '#dc2626' : '#16a34a',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* ── Quick-login: saved accounts ── */}
        {view === 'login' && savedAccounts.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase',
              letterSpacing: 0.5, marginBottom: 8,
            }}>
              Your saved accounts
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {savedAccounts.map((acc) => (
                <button key={acc.username} type="button"
                  onClick={() => { setUsername(acc.username); setPassword(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '10px 14px', borderRadius: 10,
                    border: username === acc.username ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                    background: username === acc.username ? '#eff6ff' : '#fff',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: 15,
                  }}>
                    {acc.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      {acc.username}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {acc.profile?.schoolName || (acc.profile?.onboarded ? 'Account ready' : 'Setup not finished')}
                    </div>
                  </div>
                  <div style={{ fontSize: 18, color: '#94a3b8', flexShrink: 0 }}>
                    &rsaquo;
                  </div>
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: '#e2e8f0', margin: '16px 0 0' }} />
          </div>
        )}

        {/* ── LOGIN form ── */}
        {view === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Username</label>
              <input type="text" placeholder="Enter your username" value={username}
                onChange={(e) => setUsername(e.target.value)} style={inputStyle}
                autoFocus={savedAccounts.length === 0} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle}
                autoFocus={savedAccounts.length > 0 && !!username} />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 8 }}>
              <button type="button" onClick={() => { setView('forgot'); clearFields(); }}
                style={{
                  background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, padding: 0, textDecoration: 'underline',
                }}>
                Forgot password?
              </button>
            </div>
            <button type="submit" style={primaryBtnStyle}>Sign In</button>

            {/* SSO buttons (Google, Microsoft, Clever); unconfigured providers show message on click */}
            {ssoProviders.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>or sign in with</span>
                  <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ssoProviders.map((p) => (
                    <button key={p.id} type="button" onClick={() => handleSSOLogin(p.id)} disabled={!!ssoLoading || apiReachable === false}
                      style={{ ...ssoBtnBase, borderColor: p.color || '#64748b', color: p.color || '#64748b', opacity: ssoLoading && ssoLoading !== p.id ? 0.5 : 1 }}>
                      {p.id === 'google' && (
                        <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z"/>
                          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      )}
                      {p.id === 'microsoft' && (
                        <svg width="18" height="18" viewBox="0 0 21 21" style={{ flexShrink: 0 }}>
                          <rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                        </svg>
                      )}
                      {p.id === 'clever' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path fill="#4274f6" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
                        </svg>
                      )}
                      {ssoLoading === p.id ? 'Connecting...' : `Continue with ${p.name}`}
                    </button>
                  ))}
                </div>
              </>
            )}
          </form>
        )}

        {/* ── SIGNUP form ── */}
        {view === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Username</label>
              <input type="text" placeholder="Choose a username" value={username}
                onChange={(e) => setUsername(e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" placeholder="Min 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input type="password" placeholder="Re-enter your password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" style={primaryBtnStyle}>Create Account</button>
          </form>
        )}

        {/* ── FORGOT PASSWORD — username lookup ── */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotLookup}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Username</label>
              <input type="text" placeholder="Enter your username" value={username}
                onChange={(e) => setUsername(e.target.value)} style={inputStyle} autoFocus />
            </div>
            <button type="submit" style={primaryBtnStyle}>Find My Account</button>
          </form>
        )}

        {/* ── RESET PASSWORD — new password ── */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div style={{
              padding: '10px 14px', borderRadius: 8, marginBottom: 16,
              background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: 13, color: '#1e40af',
            }}>
              Account found: <strong>{resetUser}</strong>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={password}
                onChange={(e) => setPassword(e.target.value)} style={inputStyle} autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input type="password" placeholder="Re-enter your new password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
            </div>
            <button type="submit" style={primaryBtnStyle}>Reset Password</button>
          </form>
        )}

        {/* ── Toggle links ── */}
        {(view === 'login' || view === 'signup') && (
          <p style={{ marginTop: 20, fontSize: 14, textAlign: 'center', color: '#64748b' }}>
            {view === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button"
              onClick={() => { setView(view === 'signup' ? 'login' : 'signup'); clearFields(); }}
              style={linkBtnStyle}>
              {view === 'signup' ? 'Sign in' : 'Create account'}
            </button>
          </p>
        )}
        {(view === 'forgot' || view === 'reset') && (
          <p style={{ marginTop: 20, fontSize: 14, textAlign: 'center', color: '#64748b' }}>
            Remember your password?{' '}
            <button type="button"
              onClick={() => { setView('login'); clearFields(); setResetUser(''); }}
              style={linkBtnStyle}>
              Back to Sign in
            </button>
          </p>
        )}

        {view === 'login' && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
            New accounts get a free 7-day trial of all Pro features.
          </p>
        )}

        {/* ── Data persistence indicator ── */}
        <div style={{
          marginTop: 20, paddingTop: 12, borderTop: '1px solid #f1f5f9',
          textAlign: 'center', fontSize: 11, color: '#cbd5e1',
        }}>
          {savedAccounts.length > 0
            ? <span style={{ color: '#22c55e' }}>&#9679;</span>
            : <span style={{ color: '#f59e0b' }}>&#9679;</span>
          }
          {' '}{savedAccounts.length} account{savedAccounts.length !== 1 ? 's' : ''} saved on this device
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 5,
};

const inputStyle = {
  width: '100%', padding: '12px 14px', fontSize: 15, borderRadius: 8,
  border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box',
};

const primaryBtnStyle = {
  width: '100%', padding: '13px 0', background: '#2563eb', color: '#fff',
  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
  cursor: 'pointer', marginTop: 8,
};

const linkBtnStyle = {
  background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer',
  textDecoration: 'underline', padding: 0, fontWeight: 600, fontSize: 14,
};

const ssoBtnBase = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  width: '100%', padding: '11px 0', background: '#fff',
  border: '1.5px solid', borderRadius: 10, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', transition: 'background 0.15s, box-shadow 0.15s',
};

export default Teacher;
