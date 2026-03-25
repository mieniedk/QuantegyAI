const TOKEN_KEY = 'quantegy-student-token';
const API_BASE = import.meta.env.VITE_API_URL || '';

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

export async function studentSignup({ email, password, displayName }) {
  const res = await fetch(`${API_BASE}/api/auth/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password, displayName: displayName || email.split('@')[0] }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
}

export async function studentLogin({ email, password }) {
  const res = await fetch(`${API_BASE}/api/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  return data;
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
  try {
    const res = await fetch(`${API_BASE}/api/billing/student/subscription/me`, { headers: authHeaders() });
    const data = await res.json();
    return data.success ? data : null;
  } catch { return null; }
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
  const res = await fetch(`${API_BASE}/api/billing/student/create-checkout-session`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ planId: planType, examId, origin }),
  });
  const data = await res.json();
  if (data.success && data.url) {
    window.location.href = data.url;
  }
  return data;
}

export async function pushProgress(key, payload) {
  if (!isStudentLoggedIn()) return;
  try {
    await fetch(`${API_BASE}/api/auth/student/progress`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ key, data: payload }),
    });
  } catch { /* swallow – localStorage is primary */ }
}

export async function pullProgress() {
  if (!isStudentLoggedIn()) return null;
  try {
    const res = await fetch(`${API_BASE}/api/auth/student/progress`, { headers: authHeaders() });
    const data = await res.json();
    return data.success ? data.progress : null;
  } catch { return null; }
}
