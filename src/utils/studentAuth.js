const TOKEN_KEY = 'quantegy-student-token';
const STUDENT_API_BASE_KEY = 'quantegy-student-api-base';
const DEFAULT_PROD_API_BASE = 'https://quantegyai-api.onrender.com';
const LOCAL_DEV_API_BASE = 'http://127.0.0.1:3001';
const envApiBase = (import.meta.env.VITE_API_URL || '').trim();
const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = envApiBase || (isLocalHost ? '' : DEFAULT_PROD_API_BASE);
let ACTIVE_API_BASE = API_BASE;
const REQUEST_TIMEOUT_MS = 20000;
/** Per-request timeout for signup/login after the API is awake (hosted APIs can be slow right after wake). */
const SIGNUP_TIMEOUT_MS = 90000;
/** Cold start (e.g. Render free tier): wake the host before signup/login. */
const WAKE_REMOTE_API_MS = 90000;

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
  try { localStorage.setItem(STUDENT_API_BASE_KEY, ACTIVE_API_BASE); } catch {}
}

function getApiBaseCandidates(preferredBase) {
  const candidates = [preferredBase];
  if (isLocalHost) candidates.push('', LOCAL_DEV_API_BASE);
  else candidates.push(DEFAULT_PROD_API_BASE);
  if (envApiBase) candidates.push(envApiBase);
  return [...new Set(candidates.filter((v) => typeof v === 'string'))];
}

/** GET /api/health on a remote base so serverless hosts can spin up before auth. */
async function wakeRemoteApiBase(base, timeoutMs = WAKE_REMOTE_API_MS) {
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

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export async function studentSignup({ email, password, displayName, timeoutMs = SIGNUP_TIMEOUT_MS }) {
  const payload = { username: email, password, displayName: displayName || email.split('@')[0] };
  const baseCandidates = getApiBaseCandidates(ACTIVE_API_BASE);
  const remotes = remoteBasesFromCandidates(baseCandidates);
  if (remotes.length > 0) {
    await wakeRemoteApiBase(remotes[0], WAKE_REMOTE_API_MS);
  }

  let lastResult = { success: false, error: 'Signup failed.' };
  for (const base of baseCandidates) {
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
      return data;
    }

    // On timeout only, try a health-check warm-up and retry once.
    if (!data?.success && /timed out/i.test(String(data?.error || ''))) {
      await wakeRemoteApiBase(base, 45000);
      data = await fetchJsonWithTimeout(
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
        return data;
      }
    }

    if (data && !data.success) lastResult = data;
  }

  return lastResult;
}

export async function studentLogin({ email, password }) {
  const payload = { username: email, password };
  const baseCandidates = getApiBaseCandidates(ACTIVE_API_BASE);
  const remotes = remoteBasesFromCandidates(baseCandidates);
  if (remotes.length > 0) {
    await wakeRemoteApiBase(remotes[0], WAKE_REMOTE_API_MS);
  }
  let lastResult = { success: false, error: 'Login failed.' };
  for (const base of baseCandidates) {
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
      return data;
    }

    if (!data?.success && /timed out/i.test(String(data?.error || ''))) {
      await wakeRemoteApiBase(base, 45000);
      data = await fetchJsonWithTimeout(
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
        return data;
      }
    }

    if (data && !data.success) lastResult = data;
  }

  return lastResult;
}

export function studentLogout() {
  localStorage.removeItem(TOKEN_KEY);
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

export async function getStudentSubscription() {
  if (!isStudentLoggedIn()) return null;
  const data = await fetchJsonWithTimeout(`${ACTIVE_API_BASE}/api/billing/student/subscription/me`, { headers: authHeaders() });
  return data.success ? data : null;
}

export async function hasExamAccess(examId) {
  const sub = await getStudentSubscription();
  if (!sub?.entitlements?.active) return false;
  const ent = sub.entitlements;
  if (ent.features?.includes('exam-access-all')) return true;
  if (ent.features?.includes('exam-access') && ent.examIds?.includes(examId)) return true;
  return false;
}

export async function createStudentCheckout(examId, planType = 'student_exam_onetime') {
  const origin = window.location.origin;
  const data = await fetchJsonWithTimeout(
    `${ACTIVE_API_BASE}/api/billing/student/create-checkout-session`,
    {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ planId: planType, examId, origin }),
    },
    20000,
  );
  if (data.success && data.url) {
    window.location.href = data.url;
  }
  return data;
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
