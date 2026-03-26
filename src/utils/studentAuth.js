const TOKEN_KEY = 'quantegy-student-token';
const DEFAULT_PROD_API_BASE = 'https://quantegyai-api.onrender.com';
const LOCAL_DEV_API_BASE = 'http://127.0.0.1:3001';
const envApiBase = (import.meta.env.VITE_API_URL || '').trim();
const isLocalHost = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE = envApiBase || (isLocalHost ? '' : DEFAULT_PROD_API_BASE);
const REQUEST_TIMEOUT_MS = 20000;
const SIGNUP_TIMEOUT_MS = 35000;

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
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
  const baseCandidates = [...new Set([
    API_BASE,
    DEFAULT_PROD_API_BASE,
    LOCAL_DEV_API_BASE,
  ].filter((v) => typeof v === 'string'))];

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

    // Render-hosted APIs can cold-start slowly. On timeout, warm and retry once.
    if (!data?.success && /timed out/i.test(String(data?.error || ''))) {
      await fetchJsonWithTimeout(`${base}/api/health`, {}, 20000);
      data = await fetchJsonWithTimeout(
        `${base}/api/auth/student/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        Math.max(timeoutMs, 120000),
      );
    }

    if (data?.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    }
    lastResult = data || lastResult;
  }

  if (!lastResult?.success && /timed out/i.test(String(lastResult?.error || ''))) {
    return {
      success: false,
      error: 'Signup server is taking longer than expected. Please wait 30-60 seconds and try again.',
    };
  }
  return lastResult;
}

export async function studentLogin({ email, password }) {
  const payload = { username: email, password };
  const baseCandidates = [...new Set([
    API_BASE,
    DEFAULT_PROD_API_BASE,
    LOCAL_DEV_API_BASE,
  ].filter((v) => typeof v === 'string'))];
  let lastResult = { success: false, error: 'Login failed.' };
  for (const base of baseCandidates) {
    let data = await fetchJsonWithTimeout(
      `${base}/api/auth/student/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      REQUEST_TIMEOUT_MS,
    );

    if (!data?.success && /timed out/i.test(String(data?.error || ''))) {
      await fetchJsonWithTimeout(`${base}/api/health`, {}, 20000);
      data = await fetchJsonWithTimeout(
        `${base}/api/auth/student/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        Math.max(REQUEST_TIMEOUT_MS, 60000),
      );
    }

    if (data.success && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      return data;
    }
    lastResult = data || lastResult;
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
  const data = await fetchJsonWithTimeout(`${API_BASE}/api/billing/student/subscription/me`, { headers: authHeaders() });
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
    `${API_BASE}/api/billing/student/create-checkout-session`,
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
    await fetchJsonWithTimeout(`${API_BASE}/api/auth/student/progress`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ key, data: payload }),
    }, 8000);
  } catch { /* swallow – localStorage is primary */ }
}

export async function pullProgress() {
  if (!isStudentLoggedIn()) return null;
  const data = await fetchJsonWithTimeout(`${API_BASE}/api/auth/student/progress`, { headers: authHeaders() });
  return data.success ? data.progress : null;
}
