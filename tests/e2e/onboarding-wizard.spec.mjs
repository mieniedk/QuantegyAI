import { test, expect } from '@playwright/test';

test('onboarding wizard supports ready and rollback timeline flow', async ({ page }) => {
  const districtId = 'd-e2e-onboard';
  const classId = 'cls-e2e-onboard';
  const owner = 'teacher_onboard';
  const history = [];

  await page.addInitScript(({ token }) => {
    localStorage.setItem('quantegy-auth-token', token);
  }, { token: 'mock-admin-token' });

  await page.route('**/api/admin/district-hierarchy', async (route, request) => {
    if (request.method() === 'GET') {
      return route.fulfill({
        json: {
          success: true,
          hierarchy: {
            districts: [
              { id: districtId, name: 'E2E District', subAccounts: [], schools: [] },
            ],
          },
        },
      });
    }
    return route.fulfill({ json: { success: true, hierarchy: { districts: [{ id: districtId, name: 'E2E District', subAccounts: [], schools: [] }] } } });
  });

  await page.route('**/api/admin/classes', async (route) => route.fulfill({
    json: {
      success: true,
      classes: [
        {
          id: classId,
          name: 'E2E Algebra Class',
          teacher: owner,
          districtId,
          schoolId: 's-e2e',
        },
      ],
    },
  }));

  await page.route('**/api/sso/providers', async (route) => route.fulfill({
    json: { providers: [{ id: 'google', name: 'Google', configured: true }] },
  }));
  await page.route('**/api/lti/platforms', async (route) => route.fulfill({
    json: { success: true, platforms: [{ id: 'p1', name: 'Canvas', active: true }] },
  }));
  await page.route('**/api/lti/config', async (route) => route.fulfill({
    json: { success: true, config: { oidcInitiationUrl: 'https://example.com/oidc' } },
  }));
  await page.route('**/api/auth/assignments/**', async (route) => route.fulfill({
    json: { success: true, assignments: [{ id: 'asg-1', classId, owner }] },
  }));
  await page.route('**/api/admin/standards/**', async (route) => route.fulfill({
    json: { success: true, standards: [{ code: 'TEKS.A.5A' }] },
  }));
  await page.route('**/api/admin/standards-mappings/**', async (route) => route.fulfill({
    json: { success: true, mappings: [{ classId, assignmentId: 'asg-1', standardCode: 'TEKS.A.5A' }] },
  }));
  await page.route('**/api/admin/mastery-dashboard/**', async (route) => route.fulfill({
    json: { success: true, rows: [{ classId, standardCode: 'TEKS.A.5A', mastery: 88 }] },
  }));

  await page.route('**/api/admin/onboarding/report**', async (route, request) => {
    const url = new URL(request.url());
    if (url.searchParams.get('format') === 'csv') {
      return route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/csv; charset=utf-8' },
        body: 'check,status\nrosterHasStudents,pass\n',
      });
    }
    return route.fulfill({
      json: {
        success: true,
        report: {
          districtId,
          owner,
          classId,
          scorePct: 100,
          readyToMark: true,
          checks: {
            districtSelected: true,
            classSelectedAndScoped: true,
            rosterHasStudents: true,
            standardsLoaded: true,
            mappingsLoaded: true,
            masteryRowsPresent: true,
            ssoConfigured: true,
            ltiConfigured: true,
          },
          failedChecks: [],
        },
      },
    });
  });

  await page.route('**/api/admin/onboarding/ready/**', async (route) => {
    history.unshift({
      id: `h-${Date.now()}`,
      at: new Date().toISOString(),
      actor: 'admin_e2e',
      action: 'mark-ready',
      owner,
      classId,
      scorePct: 100,
      notes: 'Marked from district onboarding wizard',
    });
    return route.fulfill({
      json: { success: true, report: { scorePct: 100, readyToMark: true, checks: {}, failedChecks: [] } },
    });
  });

  await page.route('**/api/admin/onboarding/not-ready/**', async (route) => {
    history.unshift({
      id: `h-${Date.now()}`,
      at: new Date().toISOString(),
      actor: 'admin_e2e',
      action: 'mark-not-ready',
      owner,
      classId,
      notes: 'Rollback from district onboarding wizard',
    });
    return route.fulfill({ json: { success: true } });
  });

  await page.route('**/api/admin/onboarding/history/**', async (route) => route.fulfill({
    json: { success: true, history, count: history.length },
  }));

  await page.goto('/admin');
  await page.getByRole('tab', { name: 'Onboarding Wizard' }).click();

  await page.getByRole('button', { name: /Generate Server Report/i }).click();
  await expect(page.getByText('Server score: 100%')).toBeVisible();

  await page.getByRole('button', { name: /Mark District Ready/i }).click();
  await expect(page.getByText('District marked onboarding-ready.')).toBeVisible();

  await page.getByRole('button', { name: /Refresh Timeline/i }).click();
  await expect(page.getByText('mark-ready')).toBeVisible();

  await page.getByRole('button', { name: /Mark Not Ready/i }).click();
  await expect(page.getByText('District marked not-ready.')).toBeVisible();

  await page.getByRole('button', { name: /Refresh Timeline/i }).click();
  await expect(page.getByText('mark-not-ready')).toBeVisible();
});
