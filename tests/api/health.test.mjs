// API integration tests for health, status, and SRE endpoints
import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return res.json();
}

describe('Health & Status API', () => {
  it('GET /api/health — returns ok', async () => {
    const data = await get('/api/health');
    expect(data.ok).toBe(true);
    expect(typeof data.uptimeSeconds).toBe('number');
  });

  it('GET /api/v1/health — returns versioned health', async () => {
    const data = await get('/api/v1/health');
    expect(data.success).toBe(true);
    expect(data.version).toBe('v1');
  });

  it('GET /api/status — returns platform status', async () => {
    const data = await get('/api/status');
    expect(data.success).toBe(true);
    expect(data.status).toBeDefined();
    expect(data.components).toBeDefined();
  });

  it('GET /api/v1/status — returns versioned status', async () => {
    const data = await get('/api/v1/status');
    expect(data.success).toBe(true);
    expect(data.status).toBeDefined();
  });

  it('GET /api/v1/openapi.json — returns OpenAPI spec', async () => {
    const data = await get('/api/v1/openapi.json');
    expect(data.openapi).toBe('3.0.3');
    expect(data.info.title).toContain('Allen Ace');
    expect(data.paths).toBeDefined();
  });
});

describe('SRE Endpoints', () => {
  it('GET /api/sre/slos — returns SLO targets', async () => {
    const data = await get('/api/sre/slos');
    expect(data.success).toBe(true);
    expect(data.targets).toBeDefined();
  });

  it('GET /api/sre/metrics — returns telemetry', async () => {
    const data = await get('/api/sre/metrics?windowHours=1');
    expect(data.success).toBe(true);
  });

  it('GET /api/sre/burn-rate — returns burn rate', async () => {
    const data = await get('/api/sre/burn-rate');
    expect(data.success).toBe(true);
  });

  it('GET /api/v1/sre/metrics — returns versioned metrics', async () => {
    const data = await get('/api/v1/sre/metrics?windowHours=1');
    expect(data.success).toBe(true);
    expect(data.version).toBe('v1');
  });
});
