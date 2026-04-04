import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'https://quantegy-ai.vercel.app';

const phases = [
  'diagnostic', 'video', 'check-quiz', 'game', 'check-quiz-2', 'activity-1', 'check-quiz-3',
  'concept-refresh', 'check-quiz-4', 'game2', 'check-quiz-5', 'activity-2', 'check-quiz-6',
  'video-2', 'check-quiz-7', 'game3', 'check-quiz-8', 'activity-3', 'game4', 'readiness-quiz', 'mastery-check',
];

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

function loopUrl(std, phase) {
  const comp = compFromStd(std);
  const params = new URLSearchParams({
    examId: 'math712',
    grade: 'grade7-12',
    comp,
    currentStd: std,
    phase,
    from: 'loop',
    mode: 'adaptive',
    label: std.toUpperCase(),
  });
  return `${BASE_URL}/practice-loop?${params.toString()}`;
}

function gameUrl(gamePath, std) {
  const comp = compFromStd(std);
  const params = new URLSearchParams({
    examId: 'math712',
    grade: 'grade7-12',
    comp,
    currentStd: std,
    from: 'loop',
    embed: '1',
    mode: 'adaptive',
    label: std.toUpperCase(),
  });
  return `${BASE_URL}${gamePath}?${params.toString()}`;
}

const scopeWarningTexts = [
  'No questions are available for this competency yet.',
  'No interactive content available for this competency yet.',
  'No competency-aligned Math Match set is available for this exact loop scope yet.',
  'No competency-aligned Bingo deck is available for this loop step yet.',
  'No competency-aligned Jeopardy categories are available for this loop step yet.',
];

const gameUnavailableTexts = [
  'No competency-aligned Math Match set is available for this exact loop scope yet.',
  'No competency-aligned Bingo deck is available for this loop step yet.',
  'No competency-aligned Jeopardy categories are available for this loop step yet.',
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  const loopResults = [];

  for (const std of standards) {
    for (const phase of phases) {
      const errors = [];
      const onPageError = (e) => errors.push(String(e));
      page.on('pageerror', onPageError);
      const url = loopUrl(std, phase);

      let status = 'PASS';
      let notes = [];
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        const bodyText = await page.locator('body').innerText();
        const hasScopeWarning = scopeWarningTexts.some((txt) => bodyText.includes(txt));
        if (hasScopeWarning) {
          status = 'WARN';
          notes.push('scope-warning-text');
        }
      } catch (e) {
        status = 'FAIL';
        notes.push(`nav-error:${String(e).slice(0, 180)}`);
      } finally {
        page.off('pageerror', onPageError);
      }

      if (errors.length > 0) {
        if (status === 'PASS') status = 'WARN';
        notes.push(`pageerror:${errors.length}`);
      }

      loopResults.push({ std, phase, status, notes: notes.join(', ') });
    }
  }

  const gamePaths = ['/games/q-blocks', '/games/math-match', '/games/math-bingo', '/games/math-jeopardy'];
  const gameResults = [];
  for (const std of standards) {
    for (const gp of gamePaths) {
      const url = gameUrl(gp, std);
      let status = 'PASS';
      let notes = [];
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        const bodyText = await page.locator('body').innerText();
        if (gameUnavailableTexts.some((txt) => bodyText.includes(txt))) {
          status = 'WARN';
          notes.push('scoped-game-content-unavailable');
        }
        if (gp.includes('jeopardy') && !bodyText.includes('MATH JEOPARDY')) {
          status = status === 'PASS' ? 'WARN' : status;
          notes.push('header-not-detected');
        }
      } catch (e) {
        status = 'FAIL';
        notes.push(`nav-error:${String(e).slice(0, 180)}`);
      }
      gameResults.push({ std, game: gp, status, notes: notes.join(', ') });
    }
  }

  await browser.close();

  const byStd = new Map();
  for (const std of standards) {
    byStd.set(std, { pass: 0, warn: 0, fail: 0 });
  }
  for (const r of loopResults) {
    const bucket = byStd.get(r.std);
    if (r.status === 'PASS') bucket.pass += 1;
    if (r.status === 'WARN') bucket.warn += 1;
    if (r.status === 'FAIL') bucket.fail += 1;
  }

  const loopWarnOrFail = loopResults.filter((r) => r.status !== 'PASS');
  const gameWarnOrFail = gameResults.filter((r) => r.status !== 'PASS');

  const lines = [];
  lines.push('# Math 7-12 Runtime Browser Sweep');
  lines.push('');
  lines.push(`Base URL: \`${BASE_URL}\``);
  lines.push(`Standards tested: ${standards.length} (${standards[0]}..${standards[standards.length - 1]})`);
  lines.push(`Loop checks run: ${loopResults.length} (${standards.length} standards x ${phases.length} phases)`);
  lines.push(`Direct game checks run: ${gameResults.length} (${standards.length} standards x 4 loop games)`);
  lines.push('');
  lines.push('## Per-Competency Summary');
  lines.push('');
  lines.push('| Standard | Pass | Warn | Fail |');
  lines.push('|---|---:|---:|---:|');
  for (const std of standards) {
    const row = byStd.get(std);
    lines.push(`| ${std} | ${row.pass} | ${row.warn} | ${row.fail} |`);
  }
  lines.push('');
  lines.push('## Loop Tile Issues (Warn/Fail)');
  lines.push('');
  if (loopWarnOrFail.length === 0) {
    lines.push('No warn/fail loop tile results.');
  } else {
    lines.push('| Standard | Phase | Status | Notes |');
    lines.push('|---|---|---|---|');
    for (const r of loopWarnOrFail) {
      lines.push(`| ${r.std} | ${r.phase} | ${r.status} | ${r.notes || '-'} |`);
    }
  }
  lines.push('');
  lines.push('## Direct Game URL Issues (Warn/Fail)');
  lines.push('');
  if (gameWarnOrFail.length === 0) {
    lines.push('No warn/fail game URL results.');
  } else {
    lines.push('| Standard | Game | Status | Notes |');
    lines.push('|---|---|---|---|');
    for (const r of gameWarnOrFail) {
      lines.push(`| ${r.std} | ${r.game} | ${r.status} | ${r.notes || '-'} |`);
    }
  }
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- This sweep validates runtime loading and scope-warning surfaces per tile URL.');
  lines.push('- Game feedback depth (full post-game review after completion) still requires full in-game playthrough interaction; this run verifies pages load and scoped-game availability messages.');

  const outputPath = path.resolve('docs', 'math712-runtime-browser-sweep.md');
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

