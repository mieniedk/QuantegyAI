import fs from 'fs';
import path from 'path';

const root = process.cwd();
const inputPath = process.argv[2];

if (!inputPath) {
  console.error('Usage: node scripts/restore-data.mjs <backup-folder>');
  process.exit(1);
}

const backupRoot = path.isAbsolute(inputPath) ? inputPath : path.join(root, inputPath);
if (!fs.existsSync(backupRoot)) {
  console.error(`Backup folder not found: ${backupRoot}`);
  process.exit(1);
}

function copyIfExists(src, dst) {
  if (!fs.existsSync(src)) return false;
  fs.cpSync(src, dst, { recursive: true, force: true });
  return true;
}

const restored = [];
if (copyIfExists(path.join(backupRoot, 'server-data'), path.join(root, 'server', 'data'))) {
  restored.push('server/data');
}
if (copyIfExists(path.join(backupRoot, 'uploads'), path.join(root, 'uploads'))) {
  restored.push('uploads');
}
if (copyIfExists(path.join(backupRoot, '.env.backup'), path.join(root, '.env'))) {
  restored.push('.env');
}

console.log(`Restore complete from: ${backupRoot}`);
console.log(`Restored: ${restored.join(', ') || 'nothing'}`);
console.log('Restart the server after restore.');

