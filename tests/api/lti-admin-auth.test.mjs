import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import Database from 'better-sqlite3';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function api(pathname, options = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  return { status: res.status, data };
}

function unique(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function promoteToAdmin(username) {
  const dbPath = path.join(process.cwd(), 'server', 'data', 'quantegy.db');
  const db = new Database(dbPath);
  db.prepare('UPDATE teachers SET role = ? WHERE username = ?').run('admin', username);
  db.close();
}

describe('LTI platform write auth', () => {
  let teacherToken;
  let adminToken;

  beforeAll(async () => {
    const teacher = unique('teacher_lti');
    const teacherSignup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: teacher, password: 'Pass1234!' }),
    });
    teacherToken = teacherSignup.data.token;

    const admin = unique('admin_lti');
    await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: admin, password: 'Pass1234!' }),
    });
    promoteToAdmin(admin);
    const adminLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: admin, password: 'Pass1234!' }),
    });
    adminToken = adminLogin.data.token;
  });

  const payload = {
    name: 'Auth Test LMS',
    issuer: `https://lti-auth-${Date.now()}.example.com`,
    clientId: `cid-${Date.now()}`,
    deploymentId: '1',
  };

  it('rejects unauthenticated platform create', async () => {
    const res = await api('/api/lti/platforms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    expect([401, 403]).toContain(res.status);
  });

  it('rejects non-admin platform create', async () => {
    const res = await api('/api/lti/platforms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${teacherToken}` },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(403);
  });

  it('allows admin platform create', async () => {
    const res = await api('/api/lti/platforms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.platform?.id).toBeTruthy();
  });
});
