import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'https://quantegy-ai.vercel.app';
const SAMPLE_STANDARDS = Array.from({ length: 22 }, (_, i) => `c${String(i + 1).padStart(3, '0')}`);

function compFromStd(std) {
  const n = Number(std.slice(1));
  if (n >= 1 && n <= 3) return 'comp001';
  if (n >= 4 && n <= 10) return 'comp002';
  if (n >= 11 && n <= 14) return 'comp003';
  if (n >= 15 && n <= 17) return 'comp004';
  if (n >= 18 && n <= 19 || n === 22) return 'comp005'; // c018–c019, c022 (Standard VI)
  return 'comp006'; // c020–c021
}

function queryFor(std, { embed = true } = {}) {
  const p = new URLSearchParams({
    examId: 'math712',
    grade: 'grade7-12',
    comp: compFromStd(std),
    currentStd: std,
    from: 'loop',
    mode: 'adaptive',
    label: std.toUpperCase(),
  });
  if (embed) p.set('embed', '1');
  return p.toString();
}

async function checkQBlocks(page, std) {
  await page.goto(`${BASE_URL}/games/q-blocks.html?${queryFor(std, { embed: true })}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#ansA', { timeout: 10000 });
  await page.locator('#ansA').click({ force: true, timeout: 4000 });
  await page.waitForTimeout(300);
  await page.locator('#stopBtn').click({ force: true, timeout: 4000 });
  const reviewBtn = page.locator('#reviewBtn');
  if (await reviewBtn.count()) {
    const visible = await reviewBtn.isVisible().catch(() => false);
    if (visible) await reviewBtn.click({ force: true, timeout: 4000 });
  }
  await page.waitForTimeout(700);
  const txt = await page.locator('body').innerText();
  if (!txt.includes('Full Review') && !txt.includes('Back to Results')) {
    throw new Error('qblocks-review-screen-not-visible');
  }
}

async function checkMathJeopardy(page, std) {
  await page.goto(`${BASE_URL}/games/math-jeopardy?${queryFor(std, { embed: true })}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=MATH JEOPARDY', { timeout: 12000 });
  if ((await page.locator('text=No competency-aligned Jeopardy categories are available for this loop step yet.').count()) > 0) {
    return 'WARN:scoped-content-unavailable';
  }
  await page.locator('button').filter({ hasText: /^\$100$/ }).first().click({ timeout: 6000 });

  const dd = page.locator('button', { hasText: 'Lock It In!' }).first();
  if (await dd.count()) await dd.click({ timeout: 4000 });

  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const btns = [...document.querySelectorAll('button')].filter((b) => {
      const t = (b.textContent || '').trim();
      if (!t) return false;
      if (/Continue|End Game Early|Lock It In|Review Solutions|Play Again|Back|Games/i.test(t)) return false;
      if (/^\$\d+$/.test(t)) return false;
      const r = b.getBoundingClientRect();
      const centered = r.x > w * 0.25 && r.x + r.width < w * 0.75 && r.y > h * 0.15 && r.y + r.height < h * 0.85;
      return r.width > 40 && r.height > 30 && centered;
    });
    if (btns.length > 0) btns[0].click();
  });

  let cont = page.locator('button', { hasText: 'Continue' }).first();
  if (!(await cont.count())) {
    await page.evaluate(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const btn = [...document.querySelectorAll('button')].find((b) => {
        const t = (b.textContent || '').trim();
        if (!t || /^\$\d+$/.test(t)) return false;
        if (/Continue|End Game Early|Lock It In|Review Solutions|Play Again|Back|Games/i.test(t)) return false;
        const r = b.getBoundingClientRect();
        return r.width > 40 && r.height > 30 && r.x > w * 0.25 && r.x + r.width < w * 0.75 && r.y > h * 0.15 && r.y + r.height < h * 0.85;
      });
      if (btn) btn.click();
    });
    await page.waitForTimeout(300);
    cont = page.locator('button', { hasText: 'Continue' }).first();
  }
  if (await cont.count()) await cont.click({ timeout: 5000 });
  const end = page.locator('button', { hasText: 'End Game Early' }).first();
  if (await end.count()) await end.click({ timeout: 5000 });
  const reviewBtn = page.locator('button', { hasText: 'Review Solutions' }).first();
  if (await reviewBtn.count()) await reviewBtn.click({ timeout: 5000 });
  await page.waitForSelector('text=Attempted', { timeout: 12000 });
}

async function checkMathBingo(page, std) {
  await page.goto(`${BASE_URL}/games/math-bingo?${queryFor(std, { embed: true })}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=MATH BINGO', { timeout: 12000 });
  if ((await page.locator('text=No competency-aligned Bingo deck is available for this loop step yet.').count()) > 0) {
    return 'WARN:scoped-content-unavailable';
  }

  await page.evaluate(() => {
    const cell = [...document.querySelectorAll('button')].find((b) => /^\d+$/.test((b.innerText || '').trim()));
    if (cell) cell.click();
  });

  // Wait for caller controls to become active.
  for (let i = 0; i < 20; i += 1) {
    if ((await page.locator('button', { hasText: 'Show Answer' }).count()) > 0) break;
    await page.waitForTimeout(150);
  }

  for (let i = 0; i < 50; i += 1) {
    if ((await page.locator('text=Attempted').count()) > 0) return;

    await page.evaluate(() => {
      const cell = [...document.querySelectorAll('button')].find((b) => /^\d+$/.test((b.innerText || '').trim()));
      if (cell) cell.click();
    });

    const showAnswer = page.locator('button', { hasText: 'Show Answer' }).first();
    if (await showAnswer.count()) {
      await showAnswer.click({ timeout: 4000 });
      await page.waitForTimeout(120);
    }

    const next = page.locator('button', { hasText: /Next/ }).first();
    if (await next.count()) {
      await next.click({ timeout: 4000 });
      await page.waitForTimeout(120);
    }

    const review = page.locator('button', { hasText: 'Review Solutions' }).first();
    if (await review.count()) {
      await review.click({ timeout: 4000 });
      await page.waitForTimeout(200);
    }
  }

  await page.waitForSelector('text=Attempted', { timeout: 12000 });
}

async function checkMathMatch(page, std) {
  await page.goto(`${BASE_URL}/games/math-match?${queryFor(std, { embed: false })}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Math Match', { timeout: 12000 });

  const scopeUnavailable = await page.locator('text=No competency-aligned Math Match set is available for this exact loop scope yet.').count();
  if (scopeUnavailable > 0) return 'WARN:scoped-content-unavailable';

  const pairs4 = page.locator('button', { hasText: '4 pairs' }).first();
  if (await pairs4.count()) await pairs4.click({ timeout: 4000 });
  const start = page.locator('button', { hasText: 'Start Game' }).first();
  if (await start.count()) await start.click({ timeout: 5000 });

  // Brute-force solve by watching hidden-card count reduction.
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const isCard = (b) => {
      const t = (b.innerText || '').trim();
      return /^\?$/.test(t) || /^\?\n[QA]$/.test(t) || /\nQ$|\nA$|Question|Answer/.test(t);
    };
    const hiddenCards = () => [...document.querySelectorAll('button')].filter((b) => isCard(b) && (b.innerText || '').trim().startsWith('?'));

    let guard = 0;
    while (hiddenCards().length > 0 && guard < 80) {
      guard += 1;
      let cards = hiddenCards();
      if (cards.length < 2) break;
      const before = cards.length;
      let found = false;

      for (let i = 1; i < cards.length; i += 1) {
        cards = hiddenCards();
        if (cards.length < 2) break;
        const a = cards[0];
        const b = cards[i] || cards[cards.length - 1];
        if (!a || !b || a === b) continue;
        a.click();
        await sleep(260);
        b.click();
        await sleep(980);
        const after = hiddenCards().length;
        if (after === before - 2) {
          found = true;
          break;
        }
      }
      if (!found) await sleep(180);
    }
  });
  const reviewBtn = page.locator('button', { hasText: 'Review Solutions' }).first();
  if (await reviewBtn.count()) await reviewBtn.click({ timeout: 4000 });
  await page.waitForSelector('text=Attempted', { timeout: 15000 });
  return 'PASS';
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const checks = [
    { game: 'q-blocks', fn: checkQBlocks },
    { game: 'math-match', fn: checkMathMatch },
    { game: 'math-bingo', fn: checkMathBingo },
    { game: 'math-jeopardy', fn: checkMathJeopardy },
  ];

  const rows = [];
  for (const std of SAMPLE_STANDARDS) {
    for (const c of checks) {
      try {
        const ret = await c.fn(page, std);
        if (typeof ret === 'string' && ret.startsWith('WARN')) {
          rows.push({ standard: std, game: c.game, status: 'WARN', notes: ret });
        } else {
          rows.push({ standard: std, game: c.game, status: 'PASS', notes: 'review-visible-after-end-state' });
        }
      } catch (e) {
        rows.push({ standard: std, game: c.game, status: 'FAIL', notes: String(e).slice(0, 220).replace(/\n/g, ' ') });
      }
    }
  }

  await browser.close();

  const pass = rows.filter((r) => r.status === 'PASS').length;
  const warn = rows.filter((r) => r.status === 'WARN').length;
  const fail = rows.filter((r) => r.status === 'FAIL').length;

  const out = [];
  out.push('# Manual Browser-Verified Game Review Verification');
  out.push('');
  out.push(`Base URL: \`${BASE_URL}\``);
  out.push(`Standards tested: ${SAMPLE_STANDARDS.length} (${SAMPLE_STANDARDS[0]}..${SAMPLE_STANDARDS[SAMPLE_STANDARDS.length - 1]})`);
  out.push(`Checks: ${rows.length} (${SAMPLE_STANDARDS.length} standards x 4 games)`);
  out.push(`Result: ${pass} pass, ${warn} warn, ${fail} fail`);
  out.push('');
  out.push('## Results');
  out.push('');
  out.push('| Standard | Game | Status | Notes |');
  out.push('|---|---|---|---|');
  for (const r of rows) out.push(`| ${r.standard} | ${r.game} | ${r.status} | ${r.notes.replace(/\|/g, '\\|')} |`);
  out.push('');
  out.push('## Scope');
  out.push('');
  out.push('- High-confidence manual-browser style automation across all Math 7-12 standards.');
  out.push('- Focus: verify review UI appears after game end-state interaction paths.');

  const outPath = path.resolve('docs', 'manual-browser-verified-game-review-full.md');
  await fs.writeFile(outPath, `${out.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

