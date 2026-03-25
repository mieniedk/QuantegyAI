// RBAC and tenant boundary tests
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return { status: res.status, data: await res.json() };
}

const unique = () => `rbac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

describe('RBAC & Tenant Boundaries', () => {
  let teacherA, tokenA;
  let teacherB, tokenB;
  let studentUser, studentToken;

  beforeAll(async () => {
    teacherA = unique();
    const resA = await api('/api/auth/signup', {
      method: 'POST', body: JSON.stringify({ username: teacherA, password: 'Pass1234!' }),
    });
    tokenA = resA.data.token;

    teacherB = unique();
    const resB = await api('/api/auth/signup', {
      method: 'POST', body: JSON.stringify({ username: teacherB, password: 'Pass1234!' }),
    });
    tokenB = resB.data.token;

    studentUser = unique();
    const resS = await api('/api/auth/student/signup', {
      method: 'POST', body: JSON.stringify({ username: studentUser, password: 'pass1234', displayName: 'RBAC Student' }),
    });
    studentToken = resS.data.token;
  });

  it('Teacher A cannot access Teacher B profile', async () => {
    const res = await api(`/api/auth/profile/${teacherB}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(res.data.success).toBe(false);
    expect(res.status).toBe(403);
  });

  it('Teacher A can access own profile', async () => {
    const res = await api(`/api/auth/profile/${teacherA}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    expect(res.data.success).toBe(true);
  });

  it('Student cannot access teacher endpoints', async () => {
    const res = await api('/api/auth/classes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: JSON.stringify({ classes: [] }),
    });
    expect(res.data.success).toBe(false);
  });

  it('Unauthenticated user cannot save classes', async () => {
    const res = await api('/api/auth/classes', {
      method: 'POST',
      body: JSON.stringify({ classes: [] }),
    });
    expect(res.data.success).toBe(false);
  });

  it('Teacher B cannot access Teacher A subscription', async () => {
    const res = await api(`/api/auth/subscription/${teacherA}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    expect(res.data.success).toBe(false);
    expect(res.status).toBe(403);
  });

  it('Admin audit logs require auth', async () => {
    const res = await fetch(`${BASE}/api/admin/audit-logs`);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('Rate limit headers are present', async () => {
    const res = await fetch(`${BASE}/api/health`);
    expect(res.headers.get('x-ratelimit-limit')).toBeTruthy();
  });

  it('Security headers are present', async () => {
    const res = await fetch(`${BASE}/api/health`);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('referrer-policy')).toBeTruthy();
    expect(res.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });
});
