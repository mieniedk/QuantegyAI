// API integration tests for grades and sync endpoints
import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

const unique = () => `grade_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res.json();
}

describe('Grades API', () => {
  let token;
  let testUser;
  const classId = 'c-grades-test';

  it('creates teacher', async () => {
    testUser = unique();
    const signup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: testUser, password: 'Test1234!' }),
    });
    expect(signup.success).toBe(true);
    token = signup.token;
  });

  it('POST /api/auth/grades — accepts grade sync', async () => {
    const grades = [{
      studentId: 's-test-1',
      assignmentId: 'a-test-1',
      score: 85,
      source: 'manual',
      syncedAt: new Date().toISOString(),
    }];
    const res = await api('/api/auth/grades', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ grades }),
    });
    expect(res.success).toBe(true);
  });

  it('POST /api/auth/sync-all — accepts full sync', async () => {
    const payload = {
      classes: [{ id: classId, name: 'Test Class', teacher: testUser, students: [], gradeId: 'grade3' }],
      assignments: [],
      grades: [],
      gameResults: [],
      modules: [],
      announcements: [],
      discussions: [],
      chatMessages: [],
    };
    const res = await api('/api/auth/sync-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    expect(res.success).toBe(true);
  });

  it('POST /api/auth/grades — rejects without auth', async () => {
    const res = await fetch(`${BASE}/api/auth/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grades: [] }),
    });
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});
