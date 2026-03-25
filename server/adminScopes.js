import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const SCOPES_FILE = path.join(DATA_DIR, 'admin-scopes.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readScopes() {
  try {
    return JSON.parse(fs.readFileSync(SCOPES_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeScopes(data) {
  ensureDataDir();
  fs.writeFileSync(SCOPES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function normalizeScope(input = {}) {
  const arr = (v) => Array.from(new Set((Array.isArray(v) ? v : []).map(String).map((s) => s.trim()).filter(Boolean)));
  return {
    districtIds: arr(input.districtIds),
    subAccountIds: arr(input.subAccountIds),
    schoolIds: arr(input.schoolIds),
    canProvision: input.canProvision !== false,
    canSyncRoster: input.canSyncRoster !== false,
    canManageUsers: input.canManageUsers !== false,
    superAdmin: input.superAdmin === true,
  };
}

export function getAdminScope(username) {
  const all = readScopes();
  return normalizeScope(all[username] || {});
}

export function setAdminScope(username, scope) {
  const all = readScopes();
  all[username] = normalizeScope(scope);
  writeScopes(all);
  return all[username];
}

export function hasScopeForClass(scope, classMeta = {}) {
  const normalized = normalizeScope(scope);
  if (normalized.superAdmin) return true;

  const hasDistrict = normalized.districtIds.length > 0;
  const hasSub = normalized.subAccountIds.length > 0;
  const hasSchool = normalized.schoolIds.length > 0;
  if (!hasDistrict && !hasSub && !hasSchool) return true; // back-compat: unscoped admin behaves as super admin

  if (classMeta.districtId && normalized.districtIds.includes(String(classMeta.districtId))) return true;
  if (classMeta.subAccountId && normalized.subAccountIds.includes(String(classMeta.subAccountId))) return true;
  if (classMeta.schoolId && normalized.schoolIds.includes(String(classMeta.schoolId))) return true;
  return false;
}

