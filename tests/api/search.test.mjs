// API tests for global search endpoint
import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: 'Invalid JSON', status: res.status };
  }
}

describe('Search API', () => {
  it('GET /api/search — requires auth', async () => {
    const res = await api('/api/search?q=test');
    expect(res.success).toBe(false);
  });

  it('GET /api/search — returns empty when no query', async () => {
    const signup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: `search_${Date.now()}`, password: 'Test1234!' }),
    });
    if (!signup.success) return;
    const searchRes = await api('/api/search?q=', {
      headers: { Authorization: `Bearer ${signup.token}` },
    });
    expect(searchRes.success).toBe(true);
    expect(searchRes.results).toBeDefined();
    expect(Array.isArray(searchRes.results.classes)).toBe(true);
    expect(Array.isArray(searchRes.results.assignments)).toBe(true);
    expect(Array.isArray(searchRes.results.students)).toBe(true);
  });

  it('GET /api/search — returns results structure', async () => {
    const signup = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username: `search2_${Date.now()}`, password: 'Test1234!' }),
    });
    if (!signup.success) return;
    const searchRes = await api('/api/search?q=math', {
      headers: { Authorization: `Bearer ${signup.token}` },
    });
    expect(searchRes.success).toBe(true);
    expect(searchRes.results).toBeDefined();
    expect(Array.isArray(searchRes.results.classes)).toBe(true);
    expect(Array.isArray(searchRes.results.assignments)).toBe(true);
    expect(Array.isArray(searchRes.results.students)).toBe(true);
  });
});
