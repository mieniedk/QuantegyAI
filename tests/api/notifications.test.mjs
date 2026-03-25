// API integration tests for notifications endpoints
import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

const unique = () => `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res.json();
}

describe('Notifications API', () => {
  let token;
  let testUser;

  it('creates teacher and gets token', async () => {
    testUser = unique();
    const signup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: testUser, password: 'Test1234!' }),
    });
    expect(signup.success).toBe(true);
    token = signup.token;
  });

  it('GET /api/notifications/prefs — returns prefs with auth', async () => {
    const res = await api('/api/notifications/prefs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.success).toBe(true);
    expect(res.prefs).toBeDefined();
    expect(typeof res.prefs).toBe('object');
  });

  it('PUT /api/notifications/prefs — saves prefs', async () => {
    const prefs = { inapp_assignments: true, email_grades: false };
    const res = await api('/api/notifications/prefs', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(prefs),
    });
    expect(res.success).toBe(true);
  });

  it('GET /api/notifications — returns list with auth', async () => {
    const res = await api('/api/notifications?limit=10', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.success).toBe(true);
    expect(Array.isArray(res.notifications)).toBe(true);
    expect(typeof res.unread).toBe('number');
  });

  it('GET /api/notifications — rejects without auth', async () => {
    const res = await fetch(`${BASE}/api/notifications?limit=10`);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
