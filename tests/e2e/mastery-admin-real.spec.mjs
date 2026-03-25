import { test, expect } from '@playwright/test';
import path from 'path';
import Database from 'better-sqlite3';

function unique(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

test('admin mastery panel works against real backend APIs', async ({ page, request }) => {
  const username = unique('mastery_admin');
  const password = 'Teacher123!';
  const classId = `cls-real-${Date.now()}`;
  const assignmentId = `asg-real-${Date.now()}`;
  const standardCode = 'TEKS.A.5A';

  // 1) Sign up as teacher and seed real persisted class/assignment/grade data.
  const signupRes = await request.post('http://localhost:3001/api/auth/signup', {
    data: { username, password },
  });
  const signup = await signupRes.json();
  expect(signup.success).toBeTruthy();
  expect(signup.token).toBeTruthy();

  const teacherAuth = { Authorization: `Bearer ${signup.token}` };
  const classesPayload = [
    {
      id: classId,
      name: 'Real Algebra Class',
      teacher: username,
      districtId: 'd-allen',
      districtName: 'Allen ISD',
      schoolId: 's-allen-hs',
      schoolName: 'Allen High School',
      students: [{ id: 'stu-real-1', name: 'Alex Student' }],
    },
  ];
  const assignmentsPayload = [
    {
      id: assignmentId,
      classId,
      title: 'Linear Functions Quiz',
      questions: [{ id: 'q1', prompt: 'Solve for x' }],
    },
  ];
  const gradesPayload = [
    { studentId: 'stu-real-1', assignmentId, score: 84 },
  ];

  const saveClassesRes = await request.post('http://localhost:3001/api/auth/classes', {
    headers: teacherAuth,
    data: { classes: classesPayload },
  });
  expect((await saveClassesRes.json()).success).toBeTruthy();

  const saveAssignmentsRes = await request.post('http://localhost:3001/api/auth/assignments', {
    headers: teacherAuth,
    data: { assignments: assignmentsPayload },
  });
  expect((await saveAssignmentsRes.json()).success).toBeTruthy();

  const saveGradesRes = await request.post('http://localhost:3001/api/auth/grades', {
    headers: teacherAuth,
    data: { grades: gradesPayload },
  });
  expect((await saveGradesRes.json()).success).toBeTruthy();

  // 2) Promote this user to admin in local sqlite for real admin-only API coverage.
  const dbPath = path.join(process.cwd(), 'server', 'data', 'quantegy.db');
  const db = new Database(dbPath);
  db.prepare('UPDATE teachers SET role = ? WHERE username = ?').run('admin', username);
  db.close();

  const loginRes = await request.post('http://localhost:3001/api/auth/login', {
    data: { username, password },
  });
  const login = await loginRes.json();
  expect(login.success).toBeTruthy();
  expect(login.role).toBe('admin');
  expect(login.token).toBeTruthy();

  // 3) Open UI and use real APIs (no mocks/routes).
  await page.goto('/admin');
  await page.evaluate(({ token, teacher, classes, assignments }) => {
    localStorage.setItem('quantegy-auth-token', token);
    localStorage.setItem('quantegy-teacher-user', teacher);
    localStorage.setItem('allen-ace-classes', JSON.stringify(classes));
    localStorage.setItem('allen-ace-assignments', JSON.stringify(assignments));
  }, {
    token: login.token,
    teacher: username,
    classes: classesPayload,
    assignments: assignmentsPayload,
  });
  await page.goto('/admin');

  await page.getByRole('tab', { name: 'Mastery Dashboard' }).click();
  await page.getByLabel('Mastery owner username').fill(username);
  await page.getByRole('button', { name: /load owner data/i }).click();

  await page.getByLabel('Standard code', { exact: true }).fill(standardCode);
  await page.getByLabel('Standard label', { exact: true }).fill('Linear functions');
  await page.getByLabel('Standard framework', { exact: true }).fill('TEKS');
  await page.getByLabel('Standard subject', { exact: true }).fill('Math');
  await page.getByLabel('Standard grade band', { exact: true }).fill('Algebra I');
  await page.getByRole('button', { name: /^add$/i }).click();
  await expect(page.getByText(standardCode)).toBeVisible();

  await page.getByLabel('Mapping class').selectOption(classId);
  await page.getByLabel('Mapping assignment').selectOption(assignmentId);
  // Keep whole-assignment mapping so seeded gradebook scores drive mastery.
  await page.getByLabel('Mapping standard code').fill(standardCode);
  await page.getByRole('button', { name: /^map$/i }).click();

  await page.getByLabel('Dashboard level').selectOption('district');
  await page.getByRole('button', { name: /run dashboard/i }).click();
  await expect(page.getByRole('cell', { name: standardCode })).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/Average:\s*84%/)).toBeVisible({ timeout: 10000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export csv/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('mastery-');
});
