const TOKEN_KEY = 'quantegy-student-token';
const STUDENT_API_BASE_KEY = 'quantegy-student-api-base';
const DEFAULT_PROD_API_BASE = 'https://quantegyai-api.onrender.com';
const LOCAL_DEV_API_BASE = 'http://127.0.0.1:3001';
const envApiBase = (import.meta.env.VITE_API_URL || '').trim();
const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = envApiBase || (isLocalHost ? '' : DEFAULT_PROD_API_BASE);
let ACTIVE_API_BASE = API_BASE;
const REQUEST_TIMEOUT_MS = 30000;
const SIGNUP_TIMEOUT_MS = 45000;
const AUTH_FLOW_MAX_MS = 90000;
const WAKE_REMOTE_FIRE_AND_FORGET_MS = 30000;
const WAKE_RETRY_MS = 10000;

function createLocalDemoToken(email, displayName) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    studentId: `local_${Date.now()}`,
    username: email,
    displayName: displayName || email.split('@')[0],
    role: 'student',
    local: true,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  }));
  return `${header}.${payload}.local`;
}

try {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(STUDENT_API_BASE_KEY);
    if (raw !== null) {
      const cleaned = raw.trim();
      if (cleaned) {
        ACTIVE_API_BASE = cleaned;
      } else {
        localStorage.removeItem(STUDENT_API_BASE_KEY);
      }
    }
  }
} catch { /* ignore storage access issues */ }

function setActiveApiBase(base) {
  ACTIVE_API_BASE = typeof base === 'string' ? base : API_BASE;
  try { localStorage.setItem(STUDENT_API_BASE_KEY, ACTIVE_API_BASE); } catch { /* best-effort */ }
}

function getApiBaseCandidates(preferredBase) {
  const candidates = [preferredBase];
  if (isLocalHost) candidates.push('', LOCAL_DEV_API_BASE);
  else candidates.push(DEFAULT_PROD_API_BASE);
  if (envApiBase) candidates.push(envApiBase);
  return [...new Set(candidates.filter((v) => typeof v === 'string'))];
}

/** GET /api/health on a remote base so serverless hosts can spin up before auth. */
async function wakeRemoteApiBase(base, timeoutMs = WAKE_RETRY_MS) {
  if (!base || !/^https?:\/\//i.test(base)) return;
  const root = base.replace(/\/$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${root}/api/health`, { method: 'GET', signal: controller.signal });
    await res.text();
  } catch {
    /* still attempt signup — wake is best-effort */
  } finally {
    clearTimeout(timer);
  }
}

function remoteBasesFromCandidates(candidates) {
  return [...new Set(candidates.filter((b) => typeof b === 'string' && /^https?:\/\//i.test(b)))];
}

function isTimedOutError(message) {
  return /timed out/i.test(String(message || ''));
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { success: false, error: `Unexpected response (${res.status}). Server may be unavailable.` };
    }
    let data = null;
    try {
      data = await res.json();
    } catch {
      return { success: false, error: 'Invalid response from server.' };
    }
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Request failed (${res.status})`,
      };
    }
    if (data && typeof data === 'object') return data;
    return { success: true };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please try again.' };
    }
    return { success: false, error: err?.message || 'Network error. Please try again.' };
  } finally {
    clearTimeout(timer);
  }
}

function authHeaders() {
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

function storeCredentials(email, password) {
  try {
    localStorage.setItem('quantegyai-auth-email', email);
    localStorage.setItem('quantegyai-auth-password', password);
  } catch { /* best-effort */ }
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export async function studentSignup({
  email,
  password,
  displayName,
  timeoutMs = SIGNUP_TIMEOUT_MS,
  allowLocalFallback = true,
}) {
  const payload = { username: email, password, displayName: displayName || email.split('@')[0] };
  const baseCandidates = getApiBaseCandidates(ACTIVE_API_BASE);
  const remotes = remoteBasesFromCandidates(baseCandidates);

  // Block on the wake call so Render has time to cold-start before we attempt signup
  if (remotes.length > 0) {
    await wakeRemoteApiBase(remotes[0], WAKE_REMOTE_FIRE_AND_FORGET_MS);
  }

  let lastResult = { success: false, error: 'Signup failed.' };
  const startedAt = Date.now();
  const MAX_RETRIES = 3;

  for (const base of baseCandidates) {
    if (Date.now() - startedAt > AUTH_FLOW_MAX_MS) break;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (Date.now() - startedAt > AUTH_FLOW_MAX_MS) break;

      let data = await fetchJsonWithTimeout(
        `${base}/api/auth/student/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        timeoutMs,
      );

      if (data?.success && data.token) {
        setActiveApiBase(base);
        localStorage.setItem(TOKEN_KEY, data.token);
        storeCredentials(email, password);
        return data;
      }

      if (data && !data.success && !isTimedOutError(data?.error)) {
        lastResult = data;
        break;
      }

      // Timed out — wake the server and retry
      await wakeRemoteApiBase(base, WAKE_RETRY_MS);
    }
  }

  if (!allowLocalFallback) {
    return lastResult.offline ? lastResult : {
      success: false,
      offline: true,
      error: lastResult.error || 'Cannot reach the payment/auth server right now. Please wait a moment and retry.',
    };
  }
  const token = createLocalDemoToken(email, displayName || email.split('@')[0]);
  localStorage.setItem(TOKEN_KEY, token);
  return { success: true, token, local: true };
}

export async function studentLogin({ email, password, allowLocalFallback = true }) {
  const payload = { username: email, password };
  const baseCandidates = getApiBaseCandidates(ACTIVE_API_BASE);
  const remotes = remoteBasesFromCandidates(baseCandidates);

  if (remotes.length > 0) {
    await wakeRemoteApiBase(remotes[0], WAKE_REMOTE_FIRE_AND_FORGET_MS);
  }

  let lastResult = { success: false, error: 'Login failed.' };
  const startedAt = Date.now();
  const MAX_RETRIES = 3;

  for (const base of baseCandidates) {
    if (Date.now() - startedAt > AUTH_FLOW_MAX_MS) break;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (Date.now() - startedAt > AUTH_FLOW_MAX_MS) break;

      let data = await fetchJsonWithTimeout(
        `${base}/api/auth/student/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        SIGNUP_TIMEOUT_MS,
      );

      if (data?.success && data.token) {
        setActiveApiBase(base);
        localStorage.setItem(TOKEN_KEY, data.token);
        storeCredentials(email, password);
        return data;
      }

      if (data && !data.success && !isTimedOutError(data?.error)) {
        lastResult = data;
        break;
      }

      await wakeRemoteApiBase(base, WAKE_RETRY_MS);
    }
  }

  if (!allowLocalFallback) {
    return lastResult.offline ? lastResult : {
      success: false,
      offline: true,
      error: lastResult.error || 'Cannot reach the payment/auth server right now. Please wait a moment and retry.',
    };
  }
  const token = createLocalDemoToken(email, email.split('@')[0]);
  localStorage.setItem(TOKEN_KEY, token);
  return { success: true, token, local: true };
}

export function studentLogout() {
  localStorage.removeItem(TOKEN_KEY);
  try {
    localStorage.removeItem('quantegyai-auth-email');
    localStorage.removeItem('quantegyai-auth-password');
  } catch { /* best-effort */ }
}

export function isStudentLoggedIn() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  const decoded = decodeJwt(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
}

export function getStudentInfo() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const decoded = decodeJwt(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) return null;
  return { id: decoded.studentId, username: decoded.username, displayName: decoded.displayName, role: decoded.role };
}

export function isLocalToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  const decoded = decodeJwt(token);
  return !!decoded?.local;
}

export async function getStudentSubscription() {
  if (!isStudentLoggedIn()) return null;
  const data = await fetchJsonWithTimeout(`${ACTIVE_API_BASE}/api/billing/student/subscription/me`, { headers: authHeaders() });
  return data.success ? data : null;
}

export async function hasExamAccess(examId) {
  try {
    const examKey = String(examId || '').trim();
    const examCoupon = examKey ? localStorage.getItem(`coupon-redeemed:${examKey}`) : null;
    const globalMathCoupon = localStorage.getItem('coupon-redeemed:all-math');
    if (examCoupon || globalMathCoupon) return true;
  } catch { /* best-effort */ }

  const token = localStorage.getItem(TOKEN_KEY);
  const decoded = token ? decodeJwt(token) : null;
  if (decoded?.local) return false;
  const sub = await getStudentSubscription();
  if (!sub?.entitlements?.active) return false;
  const ent = sub.entitlements;
  if (ent.features?.includes('exam-access-all')) return true;
  if (ent.features?.includes('exam-access') && ent.examIds?.includes(examId)) return true;
  return false;
}

export async function createStudentCheckout(examId, planType = 'student_exam_onetime', options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const decoded = token ? decodeJwt(token) : null;
  if (decoded?.local) {
    return {
      success: false,
      offline: true,
      error: 'Signed in offline-only mode — payment needs a live connection. Use “Retry” on the pricing screen or wait and try Sign up + Pay again.',
    };
  }
  const resolvedExam = String(examId || '').trim() || 'math712';
  const origin = window.location.origin;
  const returnSearch = typeof options.returnSearch === 'string' ? options.returnSearch : '';

  function doCheckout() {
    return fetchJsonWithTimeout(
      `${ACTIVE_API_BASE}/api/billing/student/create-checkout-session`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ planId: planType, examId: resolvedExam, origin, returnSearch }),
      },
      30000,
    );
  }

  let data = await doCheckout();

  if (!data.success && isTokenError(data.error)) {
    const ok = await reAuthFromStored();
    if (ok) {
      data = await doCheckout();
    } else {
      return { success: false, error: 'Your session expired. Please sign up or log in again.', needsReAuth: true };
    }
  }

  if (data.success && data.url) {
    window.location.href = data.url;
    return data;
  }
  if (data.success && !data.url) {
    return { success: false, error: 'Checkout started but no redirect URL was returned. Please try again.' };
  }
  return data;
}

function isTokenError(errMsg) {
  if (!errMsg) return false;
  const lower = String(errMsg).toLowerCase();
  return lower.includes('invalid session') || lower.includes('invalid token')
    || lower.includes('invalid student session')
    || lower.includes('session expired') || lower.includes('authentication required');
}

async function reAuthFromStored() {
  try {
    const email = localStorage.getItem('quantegyai-auth-email');
    const pw = localStorage.getItem('quantegyai-auth-password');
    if (!email || !pw) return false;
    const res = await studentLogin({ email, password: pw, allowLocalFallback: false });
    return !!(res?.success && !res?.local);
  } catch { return false; }
}

/**
 * After Stripe redirects back with ?session_id=…, sync entitlements if the webhook was slow.
 */
export async function confirmStudentCheckoutSession(sessionId) {
  const token = localStorage.getItem(TOKEN_KEY);
  const decoded = token ? decodeJwt(token) : null;
  if (!token || decoded?.local) {
    return { success: false, error: 'Sign in with your student account to finish activating access.' };
  }
  const sid = String(sessionId || '').trim();
  if (!sid) return { success: false, error: 'Missing checkout session.' };
  return fetchJsonWithTimeout(
    `${ACTIVE_API_BASE}/api/billing/student/confirm-checkout`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ sessionId: sid }),
    },
    20000,
  );
}

/**
 * Re-attempt login against the real API server. If successful, replaces the
 * local demo token with a real one. Returns true if the reconnect succeeded.
 */
export async function retryServerConnection() {
  const token = localStorage.getItem(TOKEN_KEY);
  const decoded = token ? decodeJwt(token) : null;
  if (!decoded?.local) return true;

  const baseCandidates = getApiBaseCandidates(ACTIVE_API_BASE);
  const remotes = remoteBasesFromCandidates(baseCandidates);

  for (const base of remotes) {
    try {
      await wakeRemoteApiBase(base, 30000);
      const res = await fetchJsonWithTimeout(
        `${base}/api/health`,
        { method: 'GET' },
        30000,
      );
      if (res?.success || res?.status === 'ok' || res?.ok) {
        setActiveApiBase(base);
        return true;
      }
    } catch { /* try next */ }
  }
  return false;
}

/**
 * Re-login with stored credentials against the real server, replacing the
 * local token with a real one. Returns the login result or null on failure.
 */
export async function reAuthenticateWithServer(email, password) {
  const baseCandidates = getApiBaseCandidates(ACTIVE_API_BASE);
  for (const base of baseCandidates) {
    const data = await fetchJsonWithTimeout(
      `${base}/api/auth/student/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      },
      12000,
    );
    if (data?.success && data.token) {
      setActiveApiBase(base);
      localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    }
    if (!data?.success && isTimedOutError(data?.error)) {
      await wakeRemoteApiBase(base, WAKE_RETRY_MS);
      const retry = await fetchJsonWithTimeout(
        `${base}/api/auth/student/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        },
        12000,
      );
      if (retry?.success && retry.token) {
        setActiveApiBase(base);
        localStorage.setItem(TOKEN_KEY, retry.token);
        return retry;
      }
    }
  }
  return null;
}

export async function pushProgress(key, payload) {
  if (!isStudentLoggedIn()) return;
  try {
    await fetchJsonWithTimeout(`${ACTIVE_API_BASE}/api/auth/student/progress`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ key, data: payload }),
    }, 8000);
  } catch { /* swallow – localStorage is primary */ }
}

export async function pullProgress() {
  if (!isStudentLoggedIn()) return null;
  const data = await fetchJsonWithTimeout(`${ACTIVE_API_BASE}/api/auth/student/progress`, { headers: authHeaders() });
  return data.success ? data.progress : null;
}
