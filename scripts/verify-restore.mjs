import fs from 'fs';
import path from 'path';

const root = process.cwd();
const checks = [];

function checkFile(filePath, label, required = true) {
  const ok = fs.existsSync(filePath);
  checks.push({ label, ok, detail: filePath, required });
}

function checkDirHasEntries(dirPath, label, required = true) {
  const ok = fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0;
  checks.push({ label, ok, detail: dirPath, required });
}

async function checkHttp(url, label, required = true) {
  try {
    const res = await fetch(url);
    checks.push({ label, ok: res.ok, detail: `${url} -> ${res.status}`, required });
  } catch (err) {
    checks.push({ label, ok: false, detail: `${url} -> ${err.message}`, required });
  }
}

async function run() {
  checkFile(path.join(root, 'server', 'data', 'quantegy.db'), 'Database file exists', true);
  checkFile(path.join(root, 'server', 'data', 'audit.log.jsonl'), 'Audit log exists', false);
  checkFile(path.join(root, 'server', 'data', 'sre-metrics.jsonl'), 'SRE snapshots exist', false);
  checkDirHasEntries(path.join(root, 'uploads'), 'Uploads directory has data', false);
  checkFile(path.join(root, '.env'), 'Environment file exists', true);

  const runServerChecks = (process.env.RESTORE_VERIFY_ONLINE || '1') === '1';
  if (runServerChecks) {
    const base = process.env.RESTORE_VERIFY_BASE_URL || 'http://localhost:3001';
    await checkHttp(`${base}/api/health`, 'Health endpoint reachable', true);
    await checkHttp(`${base}/api/status`, 'Status endpoint reachable', true);
    await checkHttp(`${base}/api/sre/metrics?windowHours=1`, 'SRE endpoint reachable', false);
  }

  const passed = checks.filter((c) => c.ok).length;
  const failedRequired = checks.filter((c) => !c.ok && c.required).length;
  const failedOptional = checks.filter((c) => !c.ok && !c.required).length;

  console.log('Restore Verification Report');
  console.log('===========================');
  for (const c of checks) {
    const tag = c.ok ? 'PASS' : (c.required ? 'FAIL' : 'WARN');
    console.log(`${tag} - ${c.label} (${c.detail})`);
  }
  console.log('---------------------------');
  console.log(`Passed: ${passed}`);
  console.log(`Required failures: ${failedRequired}`);
  console.log(`Optional warnings: ${failedOptional}`);

  if (failedRequired > 0) process.exit(2);
}

run();

