import fs from 'fs';
import path from 'path';

const root = process.cwd();
const now = new Date();
const stamp = now.toISOString().replace(/[:.]/g, '-');
const backupRoot = path.join(root, 'backups', stamp);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(src, dst) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dst));
  fs.cpSync(src, dst, { recursive: true });
  return true;
}

ensureDir(backupRoot);

const copied = [];
const targets = [
  { src: path.join(root, 'server', 'data'), dst: path.join(backupRoot, 'server-data') },
  { src: path.join(root, 'uploads'), dst: path.join(backupRoot, 'uploads') },
  { src: path.join(root, '.env'), dst: path.join(backupRoot, '.env.backup') },
];

for (const t of targets) {
  if (copyIfExists(t.src, t.dst)) copied.push(t.src);
}

const manifest = {
  createdAt: now.toISOString(),
  sourceRoot: root,
  copied,
};
fs.writeFileSync(path.join(backupRoot, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Backup complete: ${backupRoot}`);
console.log(`Copied ${copied.length} target(s).`);

