#!/usr/bin/env node
/**
 * CLI: verify Math 7–12 MC bank coverage per TExES standard (practice loop).
 * Usage: node scripts/audit-math712-standard-banks.mjs [--json]
 */

import { auditMath712StandardBanks } from '../src/utils/auditMath712StandardBanks.js';

const json = process.argv.includes('--json');
const result = auditMath712StandardBanks();

if (json) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

for (const w of result.warnings) {
  console.warn(`Warning: ${w}`);
}

if (result.rows.length) {
  console.log(`Math 7–12 (${result.examId}): ${result.rows.length} standards · min MC = ${result.minMc} · min per tier = ${result.minEachTier}\n`);
  console.log('| Standard | Domain  | MC | easy | med | hard |');
  console.log('| -------- | ------- | --: | --: | --: | --: |');
  for (const r of result.rows) {
    console.log(`| ${r.std} | ${r.comp} | ${r.mc} | ${r.easy} | ${r.medium} | ${r.hard} |`);
  }
}

if (!result.ok) {
  console.error('\nAudit failed:');
  for (const f of result.failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\nAll standards meet MC count and difficulty-tier floors.');
process.exit(0);
