import { test, expect } from '@playwright/test';
import path from 'path';
import Database from 'better-sqlite3';

function unique(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function clickWizardNext(page) {
  const nextButton = page.getByRole('button', { name: /^(next|continue)$/i });
  await nextButton.scrollIntoViewIfNeeded();
  await nextButton.evaluate((el) => el.click());
}

async function finishWizardAndCreateClass(page) {
  for (let i = 0; i < 8; i += 1) {
    const createButton = page.getByRole('button', { name: /create class/i });
    if (await createButton.isVisible().catch(() => false)) {
      await createButton.click();
      return;
    }
    await clickWizardNext(page);
    await page.waitForTimeout(120);
  }
  throw new Error('Did not reach Create Class step in wizard');
}

test('teacher signup flow reaches onboarding/dashboard', async ({ page }) => {
  const username = unique('teacher');
  const password = 'Teacher123!';

  await page.goto('/teacher');
  await page.getByRole('button', { name: /create account/i }).first().click();
  await page.getByPlaceholder('Choose a username').fill(username);
  await page.getByPlaceholder('Min 6 characters').first().fill(password);
  await page.getByPlaceholder('Re-enter your password').fill(password);
  await page.getByRole('button', { name: /^create account$/i }).click();
  await Promise.any([
    page.waitForURL(/teacher-onboarding|teacher-dashboard/i, { timeout: 15000 }),
    page.getByText(/let's set up your profile/i).waitFor({ state: 'visible', timeout: 15000 }),
  ]);
});

test('teacher can complete class wizard and create class', async ({ page, request }) => {
  const username = unique('wizard_teacher');
  const password = 'Teacher123!';

  // Use API for deterministic auth bootstrap.
  const signupRes = await request.post('http://localhost:3001/api/auth/signup', {
    data: { username, password },
  });
  const signup = await signupRes.json();
  expect(signup.success).toBeTruthy();
  expect(signup.token).toBeTruthy();

  await page.goto('/teacher-class-new');
  await page.evaluate(({ token, username }) => {
    localStorage.setItem('quantegy-auth-token', token);
    localStorage.setItem('quantegy-teacher-user', username);
  }, { token: signup.token, username });
  await page.goto('/teacher-class-new');

  await page.getByRole('button', { name: /staar/i }).click();
  await clickWizardNext(page);

  const className = `E2E Algebra ${Date.now()}`;
  await page.getByPlaceholder(/3rd Period Math|TExES Math 7-12 Prep/i).fill(className);
  await clickWizardNext(page);

  await finishWizardAndCreateClass(page);
  await expect(page).toHaveURL(/\/teacher-class\//i);
  await expect(page.locator('h1').first()).toContainText(className, { timeout: 15000 });
});

test('LTI admin can register a platform configuration', async ({ page }) => {
  const username = unique('lti_admin');
  const password = 'Teacher123!';
  const issuer = `https://canvas-${Date.now()}.example.edu`;
  const displayName = `E2E Canvas ${Date.now()}`;
  const clientId = `${Math.floor(Math.random() * 1e12)}`;

  const signupRes = await page.request.post('http://localhost:3001/api/auth/signup', {
    data: { username, password },
  });
  const signup = await signupRes.json();
  expect(signup.success).toBeTruthy();

  const dbPath = path.join(process.cwd(), 'server', 'data', 'quantegy.db');
  const db = new Database(dbPath);
  db.prepare('UPDATE teachers SET role = ? WHERE username = ?').run('admin', username);
  db.close();

  const loginRes = await page.request.post('http://localhost:3001/api/auth/login', {
    data: { username, password },
  });
  const login = await loginRes.json();
  expect(login.success).toBeTruthy();
  expect(login.role).toBe('admin');

  await page.goto('/lti-admin');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('quantegy-auth-token', token);
    localStorage.setItem('quantegy-teacher-user', user);
  }, { token: login.token, user: username });
  await page.goto('/lti-admin');
  await page.getByRole('button', { name: /\+ add platform/i }).click();
  await page.getByLabel('Display Name').fill(displayName);
  await page.getByLabel('Issuer URL (Platform Base URL)').fill(issuer);
  await page.getByLabel('Client ID (from LMS Developer Key)').fill(clientId);
  await page.getByRole('button', { name: /register platform/i }).click();

  await expect(page.getByText(displayName)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(`Client ID: ${clientId}`)).toBeVisible({ timeout: 10000 });
});

