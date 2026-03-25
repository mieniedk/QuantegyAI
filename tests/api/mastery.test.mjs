import { describe, it, expect, beforeAll } from 'vitest';
import path from 'path';
import Database from 'better-sqlite3';
import { setAdminScope } from '../../server/adminScopes.js';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function api(pathname, options = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const isCsv = res.headers.get('content-type')?.includes('text/csv');
  const data = isCsv ? await res.text() : await res.json();
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

describe('Mastery APIs', () => {
  let owner;
  let ownerToken;
  let classId;
  let assignmentId;
  let adminSuper;
  let adminSuperToken;
  let adminScoped;
  let adminScopedToken;

  beforeAll(async () => {
    owner = unique('owner');
    const ownerSignup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: owner, password: 'Pass1234!' }),
    });
    ownerToken = ownerSignup.data.token;
    classId = `cls-${owner}`;
    assignmentId = `asg-${owner}`;

    await api('/api/auth/classes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({
        classes: [{
          id: classId,
          name: 'Mastery API Class',
          districtId: 'd-allowed',
          schoolId: 's-allowed',
          students: [{ id: `stu-${owner}`, name: 'Student' }],
        }],
      }),
    });
    await api('/api/auth/assignments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({
        assignments: [{
          id: assignmentId,
          classId,
          title: 'API Mastery Quiz',
          questions: [{ id: 'q1', prompt: 'Solve x' }],
        }],
      }),
    });
    await api('/api/auth/grades', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({
        grades: [{ studentId: `stu-${owner}`, assignmentId, score: 88 }],
      }),
    });

    adminSuper = unique('admin_super');
    await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: adminSuper, password: 'Pass1234!' }),
    });
    promoteToAdmin(adminSuper);
    setAdminScope(adminSuper, { superAdmin: true });
    const superLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: adminSuper, password: 'Pass1234!' }),
    });
    adminSuperToken = superLogin.data.token;

    adminScoped = unique('admin_scoped');
    await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: adminScoped, password: 'Pass1234!' }),
    });
    promoteToAdmin(adminScoped);
    setAdminScope(adminScoped, { schoolIds: ['s-other'] });
    const scopedLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: adminScoped, password: 'Pass1234!' }),
    });
    adminScopedToken = scopedLogin.data.token;
  });

  it('rejects invalid mapping payload (question does not exist)', async () => {
    const res = await api(`/api/admin/standards-mappings/${owner}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminSuperToken}` },
      body: JSON.stringify({
        mappings: [{
          classId,
          assignmentId,
          questionId: 'bad-question',
          standardCode: 'TEKS.A.5A',
        }],
      }),
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
    expect((res.data.errors || []).join(' ')).toContain('questionId');
  });

  it('rejects duplicate mapping records in one payload', async () => {
    const dup = {
      classId,
      assignmentId,
      questionId: 'q1',
      standardCode: 'TEKS.A.5A',
    };
    const res = await api(`/api/admin/standards-mappings/${owner}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminSuperToken}` },
      body: JSON.stringify({ mappings: [dup, dup] }),
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
    expect((res.data.errors || []).join(' ').toLowerCase()).toContain('duplicates');
  });

  it('enforces admin scope on mastery dashboard rows', async () => {
    await api(`/api/admin/standards-mappings/${owner}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminSuperToken}` },
      body: JSON.stringify({
        mappings: [{
          classId,
          assignmentId,
          questionId: 'q1',
          standardCode: 'TEKS.A.5A',
          standardLabel: 'Linear Functions',
        }],
      }),
    });

    const res = await api(`/api/admin/mastery-dashboard/${owner}?level=school`, {
      headers: { Authorization: `Bearer ${adminScopedToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.rows)).toBe(true);
    expect(res.data.rows.length).toBe(0);
  });

  it('returns csv export for authorized admin', async () => {
    const res = await api(`/api/admin/mastery-dashboard/${owner}?level=district&format=csv`, {
      headers: { Authorization: `Bearer ${adminSuperToken}` },
    });
    expect(res.status).toBe(200);
    expect(typeof res.data).toBe('string');
    expect(res.data).toContain('standardCode');
    expect(res.data).toContain('TEKS.A.5A');
  });

  it('uses question-level submission data when questionId mapping exists', async () => {
    await api('/api/auth/submission', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({
        submission: {
          id: `sub-${Date.now()}`,
          assessmentId: assignmentId,
          assignmentId,
          classId,
          studentId: `stu-${owner}`,
          submittedAt: new Date().toISOString(),
          questionScores: [{ questionId: 'q1', score: 1, maxPoints: 2, status: 'graded' }],
        },
      }),
    });

    const res = await api(`/api/admin/mastery-dashboard/${owner}?level=class&scopeValue=${encodeURIComponent(classId)}`, {
      headers: { Authorization: `Bearer ${adminSuperToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.rows)).toBe(true);
    expect(res.data.rows.length).toBeGreaterThan(0);
    expect(res.data.rows[0].mastery).toBe(50);
  });
});
