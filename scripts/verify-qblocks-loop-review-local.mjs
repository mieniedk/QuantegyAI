/**
 * Local smoke: same interaction path as manual-browser-verified-game-review (Q-Blocks + loop params).
 * Usage: BASE_URL=http://localhost:5173 STD=c001 node scripts/verify-qblocks-loop-review-local.mjs
 */
import { chromium } from 'playwright';

const BASE_URL = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const STD = process.env.STD || 'c001';

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
  await page.goto(`${BASE_URL}/games/q-blocks.html?${queryFor(std, { embed: true })}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('#ansA', { timeout: 15000 });
  await page.locator('#ansA').click({ force: true, timeout: 4000 });
  await page.waitForTimeout(400);
  await page.locator('#stopBtn').click({ force: true, timeout: 4000 });
  const reviewBtn = page.locator('#reviewBtn');
  if (await reviewBtn.count()) {
    const visible = await reviewBtn.isVisible().catch(() => false);
    if (visible) await reviewBtn.click({ force: true, timeout: 4000 });
  }
  await page.waitForTimeout(900);
  const txt = await page.locator('body').innerText();
  if (!txt.includes('Full Review') && !txt.includes('Back to Results')) {
    throw new Error('qblocks-review-screen-not-visible');
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(30000);
try {
  await checkQBlocks(page, STD);
  console.log(`PASS: Q-Blocks loop review visible for ${STD} at ${BASE_URL}`);
} finally {
  await browser.close();
}
