import { test, expect } from '@playwright/test';
import { getDomainsForExam } from '../../src/data/texes-questions.js';

const competencySeeds = (() => {
  const domains = getDomainsForExam('math712') || [];
  return domains
    .map((domain) => {
      const firstStandard = (domain.standards || [])[0];
      if (!firstStandard) return null;
      return {
        compId: domain.id,
        stdId: firstStandard.id,
        label: firstStandard.name || firstStandard.id,
      };
    })
    .filter(Boolean);
})();

test('Math 7-12: all competencies advance tile 1 -> tile 2', async ({ page }) => {
  test.setTimeout(4 * 60 * 1000);

  for (const entry of competencySeeds) {
    const url = `/practice-loop?examId=math712&grade=grade7-12&comp=${entry.compId}&currentStd=${entry.stdId}&teks=${entry.stdId}&label=${encodeURIComponent(entry.label)}&phase=diagnostic`;
    await page.goto(url);

    await expect(page.getByRole('button', { name: /^Submit$/i })).toBeVisible({ timeout: 15000 });
    const questions = page.locator('.quiz-question');
    const count = await questions.count();
    for (let i = 0; i < count; i++) {
      await questions.nth(i).locator('.quiz-option').first().click();
    }

    await page.getByRole('button', { name: /^Submit$/i }).click();
    await page.getByRole('button', { name: /^Continue$/i }).click();

    await expect(page).toHaveURL(/phase=video/i, { timeout: 15000 });
  }
});
