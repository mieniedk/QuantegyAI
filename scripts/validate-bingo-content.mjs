import fs from 'node:fs';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'src', 'pages', 'MathBingo.jsx');
const src = fs.readFileSync(filePath, 'utf8');

const start = src.indexOf('const Q_POOLS = {');
if (start < 0) {
  console.error('Q_POOLS not found in MathBingo.jsx');
  process.exit(1);
}

let i = src.indexOf('{', start);
let depth = 0;
let end = -1;
for (; i < src.length; i++) {
  const ch = src[i];
  if (ch === '{') depth += 1;
  if (ch === '}') depth -= 1;
  if (depth === 0) { end = i; break; }
}
if (end < 0) {
  console.error('Could not parse Q_POOLS object bounds.');
  process.exit(1);
}

const objectLiteral = src.slice(src.indexOf('{', start), end + 1);
const qPools = Function(`"use strict"; return (${objectLiteral});`)();

let errors = 0;
for (const [poolName, items] of Object.entries(qPools)) {
  const exprSeen = new Set();
  for (const item of items) {
    if (typeof item.expr !== 'string' || item.expr.trim() === '') {
      console.error(`[${poolName}] invalid expr`, item);
      errors += 1;
      continue;
    }
    if (exprSeen.has(item.expr)) {
      console.error(`[${poolName}] duplicate expr: ${item.expr}`);
      errors += 1;
    }
    exprSeen.add(item.expr);
    if (!Number.isFinite(item.ans)) {
      console.error(`[${poolName}] non-numeric ans for expr "${item.expr}"`);
      errors += 1;
    }
  }
}

if (errors > 0) {
  console.error(`Bingo content validation failed with ${errors} issue(s).`);
  process.exit(1);
}

console.log(`Bingo content validation passed (${Object.keys(qPools).length} pools checked).`);
