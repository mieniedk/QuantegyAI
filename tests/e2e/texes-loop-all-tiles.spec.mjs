import { test, expect } from '@playwright/test';
import { getDomainsForExam } from '../../src/data/texes-questions.js';

const QUIZ_PHASES = new Set([
  'diagnostic',
  'check-quiz',
  'check-quiz-2',
  'check-quiz-3',
  'check-quiz-4',
  'check-quiz-5',
  'check-quiz-6',
  'check-quiz-7',
  'check-quiz-8',
  'readiness-quiz',
  'mastery-check',
]);

const EXPECTED_PHASE_ORDER = [
  'diagnostic',
  'video',
  'check-quiz',
  'game',
  'check-quiz-2',
  'activity-1',
  'check-quiz-3',
  'concept-refresh',
  'check-quiz-4',
  'game2',
  'check-quiz-5',
  'activity-2',
  'check-quiz-6',
  'video-2',
  'check-quiz-7',
  'game3',
  'check-quiz-8',
  'activity-3',
  'game4',
  'readiness-quiz',
  'mastery-check',
];

const MATH712_LOOPS = (getDomainsForExam('math712') || [])
  .flatMap((domain) => (domain.standards || []).map((std) => ({
    comp: domain.id,
    stdId: std.id,
    stdName: std.name || std.id,
  })));

function getPhaseFromUrl(urlString) {
  const url = new URL(urlString);
  return url.searchParams.get('phase');
}

async function clickPrimaryAdvance(page) {
  const continueBtn = page.getByRole('button', { name: /^continue$/i }).first();
  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.scrollIntoViewIfNeeded();
    await continueBtn.click();
    return;
  }
  const skipBtn = page.getByRole('button', { name: /^skip$/i }).first();
  if (await skipBtn.isVisible().catch(() => false)) {
    await skipBtn.scrollIntoViewIfNeeded();
    await skipBtn.click();
    return;
  }
  throw new Error('No Continue/Skip button found for non-quiz phase.');
}

async function completeQuizAndAdvance(page, phase) {
  const submitBtn = page.getByRole('button', { name: /^submit$/i }).first();
  if (await submitBtn.isVisible().catch(() => false)) {
    const questions = page.locator('.quiz-question');
    const qCount = await questions.count();
    for (let i = 0; i < qCount; i += 1) {
      const opts = questions.nth(i).locator('.quiz-option');
      const optCount = await opts.count();
      if (optCount > 0) {
        await opts.nth(optCount - 1).click();
      }
    }
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
  }

  if (phase === 'mastery-check') return;

  const continueBtn = page.getByRole('button', { name: /^continue$/i }).first();
  await expect(continueBtn).toBeVisible({ timeout: 10000 });
  await continueBtn.scrollIntoViewIfNeeded();
  await continueBtn.click();
}

async function advancePhase(page) {
  const phase = getPhaseFromUrl(page.url());
  if (!phase) throw new Error(`No phase in URL: ${page.url()}`);
  if (phase === 'paywall') throw new Error('Loop hit paywall during paid-access test flow.');

  if (QUIZ_PHASES.has(phase)) {
    await completeQuizAndAdvance(page, phase);
  } else {
    await clickPrimaryAdvance(page);
  }
}

test.describe('TExES 7-12 loops cover all tiles', () => {
  test.setTimeout(25 * 60 * 1000);

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/billing/student/subscription/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          entitlements: {
            active: true,
            features: ['exam-access-all'],
            examIds: ['math712'],
          },
        }),
      });
    });

    await page.addInitScript(() => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const payloadObj = { exp, studentId: 'e2e-student', username: 'e2e-student' };
      const payload = btoa(JSON.stringify(payloadObj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
      localStorage.setItem('quantegy-student-token', `e2e.${payload}.sig`);
    });
  });

  test('every math712 standard loop reaches and advances through all phases', async ({ page }) => {
    for (const loop of MATH712_LOOPS) {
      await test.step(`${loop.comp} / ${loop.stdId}`, async () => {
        const base = `/practice-loop?examId=math712&grade=grade7-12&comp=${encodeURIComponent(loop.comp)}&currentStd=${encodeURIComponent(loop.stdId)}&teks=${encodeURIComponent(loop.stdId)}&label=${encodeURIComponent(loop.stdName)}`;

        await page.goto(base);
        await expect(page.getByText(/Tile Progress/i)).toBeVisible({ timeout: 15000 });

        const visited = new Set();
        let steps = 0;
        while (steps < 45) {
          const before = getPhaseFromUrl(page.url());
          if (!before) throw new Error(`Missing phase while traversing ${loop.comp}/${loop.stdId}`);
          if (before === 'paywall') throw new Error(`Unexpected paywall in ${loop.comp}/${loop.stdId}`);
          visited.add(before);
          if (before === 'mastery-check') {
            await completeQuizAndAdvance(page, before);
            break;
          }
          await advancePhase(page);
          await expect.poll(() => getPhaseFromUrl(page.url()), {
            message: `Phase should advance for ${loop.comp}/${loop.stdId} from ${before}`,
            timeout: 15000,
          }).not.toBe(before);
          steps += 1;
        }

        if (!visited.has('mastery-check')) {
          throw new Error(`Did not reach mastery-check for ${loop.comp}/${loop.stdId}`);
        }

        // If adaptive skips a tile, deep-link to any missing phase and ensure it can still advance.
        for (const phase of EXPECTED_PHASE_ORDER) {
          if (visited.has(phase)) continue;
          await page.goto(`${base}&phase=${encodeURIComponent(phase)}`);
          await expect.poll(() => getPhaseFromUrl(page.url()), { timeout: 15000 }).toBe(phase);
          visited.add(phase);

          if (phase !== 'mastery-check') {
            await advancePhase(page);
            await expect.poll(() => getPhaseFromUrl(page.url()), { timeout: 15000 }).not.toBe(phase);
          } else {
            await completeQuizAndAdvance(page, phase);
          }
        }

        const missing = EXPECTED_PHASE_ORDER.filter((p) => !visited.has(p));
        expect(
          missing,
          `Missing phases for ${loop.comp}/${loop.stdId}: ${missing.join(', ')}`,
        ).toEqual([]);
      });
    }
  });
});

