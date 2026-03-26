import { test, expect } from '@playwright/test';
import { getDomainsForExam } from '../../src/data/texes-questions.js';

const math712Standards = (() => {
  const domains = getDomainsForExam('math712') || [];
  const out = [];
  domains.forEach((domain) => {
    (domain.standards || []).forEach((std) => {
      out.push({
        compId: domain.id,
        stdId: std.id,
        label: std.name || std.id,
      });
    });
  });
  return out;
})();

test('Math 7-12: every standard advances from tile 1 to tile 2', async ({ page }) => {
  test.setTimeout(10 * 60 * 1000);

  for (const entry of math712Standards) {
    const url = `/practice-loop?examId=math712&grade=grade7-12&comp=${entry.compId}&currentStd=${entry.stdId}&teks=${entry.stdId}&label=${encodeURIComponent(entry.label)}&phase=diagnostic`;
    await page.goto(url);

    await expect(page.getByRole('button', { name: /^Submit$/i })).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.quiz-question').first()).toBeVisible({ timeout: 20000 });

    const questions = page.locator('.quiz-question');
    const count = await questions.count();
    for (let i = 0; i < count; i++) {
      await questions.nth(i).locator('.quiz-option').first().click();
    }

    await page.getByRole('button', { name: /^Submit$/i }).click();
    await expect(page.getByRole('button', { name: /^Continue$/i })).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/phase=video/i, { timeout: 20000 });
    await expect(page).not.toHaveURL(/phase=readiness-quiz|phase=mastery-check/i, { timeout: 20000 });
  }
});
