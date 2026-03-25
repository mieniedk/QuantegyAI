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

describe('Onboarding APIs', () => {
  let adminSuperToken;
  let adminScopedToken;
  const districtAllowed = 'd-onboard-allowed';
  const districtOther = 'd-onboard-other';

  beforeAll(async () => {
    const superAdmin = unique('admin_super_onboard');
    await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: superAdmin, password: 'Pass1234!' }),
    });
    promoteToAdmin(superAdmin);
    setAdminScope(superAdmin, { superAdmin: true });
    const superLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: superAdmin, password: 'Pass1234!' }),
    });
    adminSuperToken = superLogin.data.token;

    const scopedAdmin = unique('admin_scoped_onboard');
    await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: scopedAdmin, password: 'Pass1234!' }),
    });
    promoteToAdmin(scopedAdmin);
    setAdminScope(scopedAdmin, { districtIds: [districtAllowed] });
    const scopedLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: scopedAdmin, password: 'Pass1234!' }),
    });
    adminScopedToken = scopedLogin.data.token;

    await api('/api/admin/district-hierarchy', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminSuperToken}` },
      body: JSON.stringify({
        hierarchy: {
          districts: [
            { id: districtAllowed, name: 'Allowed District', subAccounts: [] },
            { id: districtOther, name: 'Other District', subAccounts: [] },
          ],
        },
      }),
    });
  });

  it('blocks mark-ready when required checks fail', async () => {
    const res = await api(`/api/admin/onboarding/ready/${districtAllowed}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminSuperToken}` },
      body: JSON.stringify({ owner: 'teacher_missing', classId: 'class_missing' }),
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
    expect(String(res.data.error || '').toLowerCase()).toContain('blocking checks');
    expect(res.data.report).toBeTruthy();
  });

  it('enforces district scope on report endpoint', async () => {
    const res = await api(`/api/admin/onboarding/report?districtId=${encodeURIComponent(districtOther)}&owner=x&classId=y`, {
      headers: { Authorization: `Bearer ${adminScopedToken}` },
    });
    expect(res.status).toBe(403);
    expect(res.data.success).toBe(false);
  });

  it('enforces district scope on history endpoint', async () => {
    const res = await api(`/api/admin/onboarding/history/${districtOther}`, {
      headers: { Authorization: `Bearer ${adminScopedToken}` },
    });
    expect(res.status).toBe(403);
    expect(res.data.success).toBe(false);
  });

  it('returns only in-scope districts for scoped admin hierarchy read', async () => {
    const res = await api('/api/admin/district-hierarchy', {
      headers: { Authorization: `Bearer ${adminScopedToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    const ids = (res.data.hierarchy?.districts || []).map((d) => d.id);
    expect(ids).toContain(districtAllowed);
    expect(ids).not.toContain(districtOther);
  });

  it('rejects out-of-scope district hierarchy updates for scoped admin', async () => {
    const res = await api('/api/admin/district-hierarchy', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminScopedToken}` },
      body: JSON.stringify({
        hierarchy: {
          districts: [
            { id: districtOther, name: 'Illegal Update District', subAccounts: [] },
          ],
        },
      }),
    });
    expect(res.status).toBe(403);
    expect(res.data.success).toBe(false);
  });

  it('allows rollback and records onboarding history entry', async () => {
    const rollback = await api(`/api/admin/onboarding/not-ready/${districtAllowed}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminSuperToken}` },
      body: JSON.stringify({ owner: 'teacher_a', classId: 'class_a', notes: 'test rollback' }),
    });
    expect(rollback.status).toBe(200);
    expect(rollback.data.success).toBe(true);
    expect(rollback.data.onboarding?.ready).toBe(false);

    const history = await api(`/api/admin/onboarding/history/${districtAllowed}`, {
      headers: { Authorization: `Bearer ${adminSuperToken}` },
    });
    expect(history.status).toBe(200);
    expect(history.data.success).toBe(true);
    expect(Array.isArray(history.data.history)).toBe(true);
    expect(history.data.history.some((h) => h.action === 'mark-not-ready')).toBe(true);
  });
});
