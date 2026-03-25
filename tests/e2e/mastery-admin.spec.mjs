import { test, expect } from '@playwright/test';

test('admin mastery panel supports standards, mappings, dashboard, and CSV export', async ({ page }) => {
  const owner = 'teacher_mastery';
  let standards = [];
  let mappings = [];

  await page.addInitScript(({ ownerValue }) => {
    const classes = [
      {
        id: 'cls-e2e-1',
        name: 'Algebra I - Period 1',
        teacher: ownerValue,
        districtId: 'd-allen',
        districtName: 'Allen ISD',
        schoolId: 's-allen-hs',
        schoolName: 'Allen High School',
        students: [{ id: 'stu-1', name: 'Alex' }],
      },
    ];
    const assignments = [
      {
        id: 'asg-e2e-1',
        classId: 'cls-e2e-1',
        title: 'Unit 1 Quiz',
        questions: [{ id: 'q1', prompt: 'Solve for x' }],
      },
    ];
    localStorage.setItem('allen-ace-classes', JSON.stringify(classes));
    localStorage.setItem('allen-ace-assignments', JSON.stringify(assignments));
    localStorage.setItem('quantegy-teacher-user', ownerValue);
    localStorage.setItem('quantegy-auth-token', 'mock-admin-token');
  }, { ownerValue: owner });

  await page.route('**/api/admin/standards/**', async (route, request) => {
    const method = request.method();
    if (method === 'GET') {
      return route.fulfill({ json: { success: true, owner, standards, count: standards.length } });
    }
    if (method === 'PUT') {
      const body = request.postDataJSON() || {};
      standards = Array.isArray(body.standards) ? body.standards : [];
      return route.fulfill({ json: { success: true, owner, standards, count: standards.length } });
    }
    return route.fallback();
  });

  await page.route('**/api/admin/standards-mappings/**', async (route, request) => {
    const method = request.method();
    if (method === 'GET') {
      return route.fulfill({ json: { success: true, owner, mappings, count: mappings.length } });
    }
    if (method === 'PUT') {
      const body = request.postDataJSON() || {};
      mappings = Array.isArray(body.mappings) ? body.mappings : [];
      return route.fulfill({ json: { success: true, owner, mappings, count: mappings.length } });
    }
    return route.fallback();
  });

  await page.route('**/api/admin/mastery-dashboard/**', async (route, request) => {
    const url = new URL(request.url());
    const format = url.searchParams.get('format') || 'json';
    const rows = [
      {
        districtId: 'd-allen',
        districtName: 'Allen ISD',
        schoolId: 's-allen-hs',
        schoolName: 'Allen High School',
        classId: 'cls-e2e-1',
        className: 'Algebra I - Period 1',
        standardCode: 'TEKS.A.5A',
        mastery: 78,
        mappedItems: Math.max(1, mappings.length),
        studentsAssessed: 1,
        studentsEnrolled: 1,
      },
    ];
    if (format === 'csv') {
      return route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/csv; charset=utf-8' },
        body: 'standardCode,mastery\nTEKS.A.5A,78\n',
      });
    }
    return route.fulfill({
      json: {
        success: true,
        owner,
        level: 'district',
        rows,
        summary: { averageMastery: 78, standards: 1, records: rows.length },
      },
    });
  });

  await page.goto('/admin');
  await page.getByRole('tab', { name: 'Mastery Dashboard' }).click();

  await page.getByPlaceholder('Teacher owner username').fill(owner);
  await page.getByRole('button', { name: /load owner data/i }).click();

  await page.getByPlaceholder('Code (TEKS.3.4C)').fill('TEKS.A.5A');
  await page.getByPlaceholder('Label').fill('Linear functions');
  await page.getByPlaceholder('Framework').fill('TEKS');
  await page.getByPlaceholder('Subject').fill('Math');
  await page.getByPlaceholder('Grade Band').fill('Algebra I');
  await page.getByRole('button', { name: /^add$/i }).click();
  await expect(page.getByText('TEKS.A.5A')).toBeVisible();

  await page.getByLabel('Mapping class').selectOption('cls-e2e-1');
  await page.getByLabel('Mapping assignment').selectOption('asg-e2e-1');
  await page.getByLabel('Mapping question').selectOption('q1');
  await page.getByLabel('Mapping standard code').fill('TEKS.A.5A');
  await page.getByRole('button', { name: /^map$/i }).click();
  await expect(page.getByText('class cls-e2e-1 | weight 1')).toBeVisible();

  await page.getByRole('button', { name: /run dashboard/i }).click();
  await expect(page.getByText(/Average:\s*78%/)).toBeVisible();
  await expect(page.getByRole('cell', { name: 'TEKS.A.5A' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export csv/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('mastery-');
});
