import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'https://quantegy-ai.vercel.app';
const standards = Array.from({ length: 22 }, (_, i) => `c${String(i + 1).padStart(3, '0')}`);

function compFromStd(std) {
  const n = Number(std.slice(1));
  if (n >= 1 && n <= 3) return 'comp001';
  if (n >= 4 && n <= 10) return 'comp002';
  if (n >= 11 && n <= 14) return 'comp003';
  if (n >= 15 && n <= 17) return 'comp004';
  if (n >= 18 && n <= 19 || n === 22) return 'comp005'; // c018–c019, c022 (Standard VI)
  return 'comp006'; // c020–c021
}

function paramsFor(std) {
  const p = new URLSearchParams({
    examId: 'math712',
    grade: 'grade7-12',
    comp: compFromStd(std),
    currentStd: std,
    from: 'loop',
    embed: '1',
    mode: 'adaptive',
    label: std.toUpperCase(),
  });
  return p.toString();
}

async function gotoGame(page, route, std) {
  const url = `${BASE_URL}${route}?${paramsFor(std)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  return url;
}

async function verifyQBlocksReview(page) {
  // Q-Blocks is a raw HTML game; force a valid end-state to verify auto-review rendering.
  await page.evaluate(() => {
    const safe = (v, d) => (v == null ? d : v);
    stats = {
      mathPts: safe(stats?.mathPts, 20),
      rowPts: safe(stats?.rowPts, 10),
      dropPts: safe(stats?.dropPts, 2),
      mathCorrect: 1,
      mathWrong: 1,
      maxCombo: safe(stats?.maxCombo, 1),
      rowsCleared: safe(stats?.rowsCleared, 0),
      blocksPlaced: safe(stats?.blocksPlaced, 2),
      byDifficulty: {
        easy: { correct: 1, wrong: 1 },
        medium: { correct: 0, wrong: 0 },
        hard: { correct: 0, wrong: 0 },
      },
      singleClears: 0,
      doubleClears: 0,
      tripleClears: 0,
      quadClears: 0,
    };
    score = 32;
    level = 1;
    over = true;
    allAnswers = [
      { q: '12 + 7', correct: 19, given: 17, wasCorrect: false, diff: 'easy', op: '+' },
      { q: '9 × 3', correct: 27, given: 27, wasCorrect: true, diff: 'easy', op: '×' },
    ];
    if (typeof showGameOver === 'function') showGameOver();
  });
  await page.waitForTimeout(400);
  await page.waitForSelector('#reviewScreen', { state: 'visible', timeout: 7000 });
  const hasReview = await page.locator('#reviewScreen #reviewCards .rv-card').count();
  if (hasReview < 1) throw new Error('qblocks-review-cards-missing');
}

async function verifyMathJeopardyReview(page) {
  await page.waitForSelector('text=MATH JEOPARDY', { timeout: 10000 });
  await page.locator('button', { hasText: '$100' }).first().click({ timeout: 6000 });
  const lockBtn = page.locator('button', { hasText: 'Lock It In!' }).first();
  if (await lockBtn.count()) {
    await lockBtn.click({ timeout: 5000 });
  }
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter((b) => {
      const txt = (b.textContent || '').trim();
      if (!txt) return false;
      if (/Continue|Lock It In|End Game Early|Games|Play Again|Review Solutions/i.test(txt)) return false;
      const r = b.getBoundingClientRect();
      return r.width > 40 && r.height > 30;
    });
    if (btns.length > 0) btns[0].click();
  });
  await page.waitForTimeout(500);
  const continueBtn = page.locator('button', { hasText: 'Continue' }).first();
  if (await continueBtn.count()) await continueBtn.click({ timeout: 5000 });
  await page.waitForTimeout(400);
  const endBtn = page.locator('button', { hasText: 'End Game Early' }).first();
  if (await endBtn.count()) await endBtn.click({ timeout: 5000 });
  await page.waitForSelector('text=Attempted', { timeout: 10000 });
}

async function verifyMathBingoReview(page) {
  await page.waitForSelector('text=MATH BINGO', { timeout: 10000 });
  // Fast path: reveal answer, advance call, repeat until game-over review appears.
  for (let i = 0; i < 45; i += 1) {
    const reviewVisible = await page.locator('text=Attempted').count();
    if (reviewVisible > 0) return;

    const showBtn = page.locator('button', { hasText: 'Show Answer' }).first();
    if (await showBtn.count()) {
      await showBtn.click({ timeout: 4000 });
      await page.waitForTimeout(120);
    }

    const nextBtn = page.locator('button', { hasText: /Next/ }).first();
    if (await nextBtn.count()) {
      await nextBtn.click({ timeout: 4000 });
      await page.waitForTimeout(120);
    }

    // If game-over modal appears, auto-review should follow.
    const reviewBtn = page.locator('button', { hasText: 'Review Solutions' }).first();
    if (await reviewBtn.count()) {
      await reviewBtn.click({ timeout: 4000 });
      await page.waitForTimeout(150);
    }
  }
  await page.waitForSelector('text=Attempted', { timeout: 12000 });
}

async function verifyMathMatchReview(page) {
  await page.waitForSelector('text=Math Match', { timeout: 10000 });
  // Trigger post-game review in runtime by dispatching component states on MathMatch fiber.
  const ok = await page.evaluate(() => {
    function getRootFiber(node) {
      const containerKey = Object.keys(node).find((k) => k.startsWith('__reactContainer$'));
      if (containerKey && node[containerKey]?.stateNode?.current) return node[containerKey].stateNode.current;
      const fiberKey = Object.keys(node).find((k) => k.startsWith('__reactFiber$'));
      return fiberKey ? node[fiberKey] : null;
    }
    function findFiberByName(rootFiber, name) {
      const stack = [rootFiber];
      while (stack.length) {
        const f = stack.pop();
        if (!f) continue;
        if (f.type && typeof f.type === 'function' && f.type.name === name) return f;
        if (f.child) stack.push(f.child);
        if (f.sibling) stack.push(f.sibling);
      }
      return null;
    }
    const rootNode = document.getElementById('root');
    if (!rootNode) return false;
    const rootFiber = getRootFiber(rootNode);
    if (!rootFiber) return false;
    const matchFiber = findFiberByName(rootFiber, 'MathMatch');
    if (!matchFiber || !matchFiber.memoizedState) return false;

    const hooks = [];
    let h = matchFiber.memoizedState;
    while (h) {
      hooks.push(h);
      h = h.next;
    }
    // hook 10 => gameComplete, hook 12 => showReview
    const gameCompleteHook = hooks[10];
    const showReviewHook = hooks[12];
    if (!gameCompleteHook?.queue?.dispatch || !showReviewHook?.queue?.dispatch) return false;
    gameCompleteHook.queue.dispatch(true);
    showReviewHook.queue.dispatch(true);
    return true;
  });

  if (!ok) throw new Error('mathmatch-react-dispatch-failed');
  await page.waitForTimeout(500);
  await page.waitForSelector('text=Attempted', { timeout: 10000 });
}

async function runForStandard(page, std) {
  const checks = [
    { key: 'q-blocks', route: '/games/q-blocks.html', run: verifyQBlocksReview },
    { key: 'math-match', route: '/games/math-match', run: verifyMathMatchReview },
    { key: 'math-bingo', route: '/games/math-bingo', run: verifyMathBingoReview },
    { key: 'math-jeopardy', route: '/games/math-jeopardy', run: verifyMathJeopardyReview },
  ];
  const results = [];
  for (const c of checks) {
    const start = Date.now();
    try {
      const url = await gotoGame(page, c.route, std);
      await c.run(page);
      results.push({
        standard: std,
        game: c.key,
        status: 'PASS',
        notes: `review-verified (${Date.now() - start}ms)`,
        url,
      });
    } catch (e) {
      results.push({
        standard: std,
        game: c.key,
        status: 'FAIL',
        notes: String(e).slice(0, 220),
        url: `${BASE_URL}${c.route}?${paramsFor(std)}`,
      });
    }
  }
  return results;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  const all = [];
  for (const std of standards) {
    const rows = await runForStandard(page, std);
    all.push(...rows);
  }

  await browser.close();

  const pass = all.filter((r) => r.status === 'PASS').length;
  const fail = all.length - pass;
  const byStd = new Map();
  for (const std of standards) byStd.set(std, { pass: 0, fail: 0 });
  for (const r of all) {
    const b = byStd.get(r.standard);
    if (r.status === 'PASS') b.pass += 1;
    else b.fail += 1;
  }

  const out = [];
  out.push('# Math 7-12 Game Review Runtime Verification');
  out.push('');
  out.push(`Base URL: \`${BASE_URL}\``);
  out.push(`Standards tested: ${standards.length} (${standards[0]}..${standards[standards.length - 1]})`);
  out.push(`Game review checks: ${all.length} (${standards.length} standards x 4 games)`);
  out.push(`Result: ${pass} pass, ${fail} fail`);
  out.push('');
  out.push('## Per-Standard Totals');
  out.push('');
  out.push('| Standard | Pass | Fail |');
  out.push('|---|---:|---:|');
  for (const std of standards) {
    const b = byStd.get(std);
    out.push(`| ${std} | ${b.pass} | ${b.fail} |`);
  }
  out.push('');
  out.push('## Detailed Results');
  out.push('');
  out.push('| Standard | Game | Status | Notes |');
  out.push('|---|---|---|---|');
  for (const r of all) {
    out.push(`| ${r.standard} | ${r.game} | ${r.status} | ${r.notes.replace(/\|/g, '\\|')} |`);
  }
  out.push('');
  out.push('## Verification Method');
  out.push('');
  out.push('- `q-blocks`: forced valid end-state then confirmed full review cards render.');
  out.push('- `math-bingo`: automated call progression to game-over, then confirmed review screen.');
  out.push('- `math-jeopardy`: played clue, ended game, confirmed review screen.');
  out.push('- `math-match`: runtime state dispatch to end-state, confirmed `GameReview` UI render.');

  const reportPath = path.resolve('docs', 'math712-game-review-runtime-verification.md');
  await fs.writeFile(reportPath, `${out.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

