import { test, expect } from '@playwright/test';

test('TExES 7-12 loop smoke: loads, navigates, resumes', async ({ page }) => {
  const base = '/practice-loop?examId=math712&grade=grade7-12&comp=comp002&currentStd=c009&teks=c009&label=Trigonometry';
  await page.goto(base);

  await expect(page.getByText(/Tile Progress/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: /Submit/i })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.quiz-option').first()).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: /Skip/i }).click();
  await expect(page).toHaveURL(/phase=video/i, { timeout: 15000 });

  // Resume check: opening base URL should restore latest phase.
  await page.goto(base);
  await expect(page).toHaveURL(/phase=video/i, { timeout: 15000 });
});
