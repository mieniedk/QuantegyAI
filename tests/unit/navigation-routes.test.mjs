import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const SRC_ROOT = path.resolve(process.cwd(), 'src');
const ENTRY_FILE = path.resolve(SRC_ROOT, 'main.jsx');

function listSourceFiles(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(fullPath));
      continue;
    }
    if (/\.(jsx|tsx|js|ts)$/.test(entry.name)) out.push(fullPath);
  }
  return out;
}

function normalizePath(target) {
  if (!target) return target;
  let normalized = target.split('?')[0].split('#')[0];
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/, '');
  return normalized || '/';
}

function routePatternToRegex(routePath) {
  const escaped = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/:[^/]+/g, '[^/]+')}$`);
}

function extractRoutes() {
  const content = fs.readFileSync(ENTRY_FILE, 'utf8');
  const routeRegex = /<Route\s+path=(["'])(.*?)\1/g;
  const routes = [];
  for (const match of content.matchAll(routeRegex)) {
    const routePath = normalizePath(match[2]);
    if (routePath) routes.push(routePath);
  }
  return routes;
}

function extractNavigationTargets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  const regexes = [
    /\bto=(["'])(.*?)\1/g,
    /\bhref=(["'])(.*?)\1/g,
    /\bnavigate\((["'])(.*?)\1/g,
  ];

  for (const regex of regexes) {
    for (const match of content.matchAll(regex)) {
      matches.push(match[2]);
    }
  }
  return matches;
}

const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');

function isInternalAppPath(target) {
  if (!target) return false;
  if (!target.startsWith('/')) return false;
  if (target.startsWith('//')) return false;
  if (target.startsWith('/api/')) return false;
  return true;
}

function isStaticPublicFile(target) {
  const cleaned = target.split('?')[0].split('#')[0];
  const filePath = path.join(PUBLIC_ROOT, cleaned);
  try { return fs.statSync(filePath).isFile(); } catch { return false; }
}

describe('Navigation paths', () => {
  it('all internal link targets resolve to app routes', () => {
    const routes = extractRoutes();
    const dynamicRouteRegexes = routes
      .filter((routePath) => routePath.includes(':'))
      .map(routePatternToRegex);

    const routeSet = new Set(routes);
    const files = listSourceFiles(SRC_ROOT);
    const invalidTargets = [];

    for (const filePath of files) {
      const relPath = path.relative(process.cwd(), filePath);
      const targets = extractNavigationTargets(filePath);
      for (const rawTarget of targets) {
        if (!isInternalAppPath(rawTarget)) continue;
        const target = normalizePath(rawTarget);
        if (routeSet.has(target)) continue;
        if (dynamicRouteRegexes.some((regex) => regex.test(target))) continue;
        if (isStaticPublicFile(rawTarget)) continue;
        invalidTargets.push({ file: relPath, target: rawTarget });
      }
    }

    expect(
      invalidTargets,
      invalidTargets
        .map(({ file, target }) => `Unmatched navigation target "${target}" in ${file}`)
        .join('\n'),
    ).toEqual([]);
  });
});
