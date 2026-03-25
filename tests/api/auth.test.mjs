// API integration tests for auth endpoints
import { describe, it, expect, beforeAll } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res.json();
}

const unique = () => `testuser_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

describe('Auth API', () => {
  let testUser;
  let token;

  it('POST /api/auth/signup — creates a teacher account', async () => {
    testUser = unique();
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: testUser, password: 'Test1234!' }),
    });
    expect(res.success).toBe(true);
    expect(res.token).toBeTruthy();
    expect(res.role).toBe('teacher');
    token = res.token;
  });

  it('POST /api/auth/signup — rejects duplicate username', async () => {
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: testUser, password: 'Test1234!' }),
    });
    expect(res.success).toBe(false);
  });

  it('POST /api/auth/signup — rejects short password', async () => {
    const res = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: unique(), password: '12' }),
    });
    expect(res.success).toBe(false);
  });

  it('POST /api/auth/login — authenticates teacher', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: testUser, password: 'Test1234!' }),
    });
    expect(res.success).toBe(true);
    expect(res.token).toBeTruthy();
    expect(res.classes).toBeDefined();
    token = res.token;
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: testUser, password: 'wrongpass' }),
    });
    expect(res.success).toBe(false);
  });

  it('POST /api/auth/verify — validates JWT', async () => {
    const res = await api('/api/auth/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.success).toBe(true);
    expect(res.user.username).toBe(testUser);
    expect(res.user.role).toBe('teacher');
  });

  it('POST /api/auth/verify — rejects invalid token', async () => {
    const res = await api('/api/auth/verify', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    expect(res.success).toBe(false);
  });

  it('GET /api/auth/profile/:username — requires auth', async () => {
    const res = await fetch(`${BASE}/api/auth/profile/${testUser}`);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('GET /api/auth/profile/:username — returns profile with auth', async () => {
    const res = await api(`/api/auth/profile/${testUser}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.success).toBe(true);
  });

  it('POST /api/auth/student/signup — creates student', async () => {
    const res = await api('/api/auth/student/signup', {
      method: 'POST',
      body: JSON.stringify({ username: unique(), password: 'pass1234', displayName: 'Test Student' }),
    });
    expect(res.success).toBe(true);
    expect(res.role).toBe('student');
    expect(res.token).toBeTruthy();
  });

  it('POST /api/auth/student/signup — rejects short password', async () => {
    const res = await api('/api/auth/student/signup', {
      method: 'POST',
      body: JSON.stringify({ username: unique(), password: '12', displayName: 'X' }),
    });
    expect(res.success).toBe(false);
  });
});
