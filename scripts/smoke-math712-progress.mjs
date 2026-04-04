import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const SCOPES = [
  {
    key: 'comp001/c001',
    url: `${BASE}/practice-loop?comp=comp001&currentStd=c001&examId=math712&grade=grade7-12&label=Number%20Concepts`,
  },
  {
    key: 'comp004/c015',
    url: `${BASE}/practice-loop?comp=comp004&currentStd=c015&examId=math712&grade=grade7-12&label=Probability%20and%20Statistics`,
  },
  {
    key: 'comp005/c022',
    url: `${BASE}/practice-loop?comp=comp005&currentStd=c022&examId=math712&grade=grade7-12&label=Mathematical%20Perspectives`,
  },
  {
    key: 'comp006/c021',
    url: `${BASE}/practice-loop?comp=comp006&currentStd=c021&examId=math712&grade=grade7-12&label=Mathematical%20Assessment`,
  },
  {
    key: 'comp006/c020',
    url: `${BASE}/practice-loop?comp=comp006&currentStd=c020&examId=math712&grade=grade7-12&label=Mathematical%20Learning`,
  },
];

/** Parses loop tile label; total is 21 phases from `learning-loop-config.json` (not the 22 competency scopes). */
function extractStepInfo(text) {
  const stepSlashMatch = text.match(/Step\s+(\d+)\s*\/\s*21/i);
  const stepOfMatch = text.match(/Step\s+(\d+)\s+of\s+21/i);
  const percentNearStepOf = text.match(/Step\s+\d+\s+of\s+21[\s\S]{0,30}?(\d{1,3})%/i);
  const percentNearSlash = text.match(/Step\s+\d+\s*\/\s*21[\s\S]{0,20}?(\d{1,3})%/i);
  const stepSlash = stepSlashMatch ? Number(stepSlashMatch[1]) : null;
  const stepOf = stepOfMatch ? Number(stepOfMatch[1]) : null;
  const percent = percentNearStepOf ? Number(percentNearStepOf[1]) : (percentNearSlash ? Number(percentNearSlash[1]) : null);
  return { stepSlash, stepOf, percent };
}

async function getBlueNowIndex(page) {
  return page.evaluate(() => {
    const nowNodes = [...document.querySelectorAll('div[title*="— now"]')];
    const visible = nowNodes.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (!visible || !visible.parentElement) return null;
    const siblings = [...visible.parentElement.children];
    const idx = siblings.indexOf(visible);
    return idx >= 0 ? idx + 1 : null;
  });
}

async function clickContinue(page) {
  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')].filter((btn) => {
      if (btn.disabled) return false;
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const pickRegex = (regex) =>
      buttons
        .filter((btn) => regex.test((btn.textContent || '').trim()))
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    const pickExact = (...labels) => {
      const wanted = new Set(labels.map((s) => s.toLowerCase()));
      return buttons
        .filter((btn) => wanted.has((btn.textContent || '').trim().toLowerCase()))
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    };

    const preferred =
      pickExact('Continue') ||
      pickExact('Skip') ||
      pickExact('Start Game', 'Start') ||
      pickExact('Submit') ||
      pickRegex(/^Next\b/i);
    if (!preferred) return false;
    preferred.click();
    return (preferred.textContent || '').trim();
  });
  return clicked;
}

async function waitForStepAdvance(page, prevStep, timeoutMs = 9000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const text = await page.locator('body').innerText();
    const { stepSlash, stepOf, percent } = extractStepInfo(text);
    const step = stepSlash || stepOf || null;
    if (step != null && prevStep != null && step !== prevStep) {
      return { stepSlash, stepOf, percent };
    }
    await page.waitForTimeout(250);
  }
  const text = await page.locator('body').innerText();
  return extractStepInfo(text);
}

function rowVerdict(row) {
  if (row.stepLabel == null || row.blueIndex == null) return 'N';
  return row.blueIndex === row.stepLabel ? 'Y' : 'N';
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 920 } });

const report = [];
for (const scope of SCOPES) {
  await page.goto(scope.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1200);

  const rows = [];
  let bodyText = await page.locator('body').innerText();
  let info = extractStepInfo(bodyText);

  for (let i = 0; i < 5; i++) {
    const stepLabel = info.stepSlash || info.stepOf || null;
    const blueIndex = await getBlueNowIndex(page);
    const percent = info.percent;
    rows.push({
      stepLabel,
      percent,
      blueIndex,
      match: rowVerdict({ stepLabel, blueIndex }),
      note: i === 0 ? 'Initial load' : 'After Continue',
    });

    const clicked = await clickContinue(page);
    if (!clicked) break;
    info = await waitForStepAdvance(page, stepLabel);
    await page.waitForTimeout(500);
  }

  const hasFail = rows.some((r) => r.match !== 'Y');
  report.push({
    scope: scope.key,
    rows,
    verdict: hasFail ? 'FAIL' : 'PASS',
  });
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
