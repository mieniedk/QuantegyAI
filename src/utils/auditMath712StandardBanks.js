/**
 * Audit Math 7–12 (TExES 235) MC banks per TExES standard for the practice loop.
 * Targets align with docs/math712-loop-standard-question-banks.md.
 */

import {
  getQuestionsForExam,
  getStandardForQuestion,
  getDomainsForExam,
} from '../data/texes-questions.js';

export const MATH712_MIN_MC_PER_STANDARD = 12;
export const MATH712_MIN_EACH_DIFFICULTY_TIER = 1;

function normalizeDifficultyTier(value) {
  if (value === 1 || value === '1' || value === 'easy') return 'easy';
  if (value === 3 || value === '3' || value === 'hard') return 'hard';
  return 'medium';
}

/**
 * @param {object} [options]
 * @param {string} [options.examId='math712']
 * @param {number} [options.minMc=12]
 * @param {number} [options.minEachTier=1] — min count per easy/medium/hard (0 to disable)
 */
export function auditMath712StandardBanks(options = {}) {
  const examId = options.examId || 'math712';
  const minMc = Number(options.minMc) > 0 ? Number(options.minMc) : MATH712_MIN_MC_PER_STANDARD;
  const minEachTier = options.minEachTier !== undefined && options.minEachTier !== null
    ? Math.max(0, Number(options.minEachTier))
    : MATH712_MIN_EACH_DIFFICULTY_TIER;

  const domains = getDomainsForExam(examId) || [];
  const mcList = (getQuestionsForExam(examId) || []).filter((q) => q.type === 'mc');

  const domainCompIds = new Set(domains.map((d) => d.id));

  /** @type {Record<string, { comp: string, std: string, stdName: string, mc: number, easy: number, medium: number, hard: number, orphan?: boolean }>} */
  const byKey = {};
  for (const d of domains) {
    for (const s of d.standards || []) {
      const key = `${d.id}|${s.id}`;
      byKey[key] = {
        comp: d.id,
        std: s.id,
        stdName: s.name || '',
        mc: 0,
        easy: 0,
        medium: 0,
        hard: 0,
      };
    }
  }

  const unmappedMc = [];

  for (const q of mcList) {
    if (!domainCompIds.has(q.comp)) continue;
    const std = getStandardForQuestion(q.id);
    if (!std) {
      unmappedMc.push(q.id);
      continue;
    }
    const key = `${q.comp}|${std}`;
    let row = byKey[key];
    if (!row) {
      row = {
        comp: q.comp,
        std,
        stdName: '',
        mc: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        orphan: true,
      };
      byKey[key] = row;
    }
    row.mc += 1;
    const t = normalizeDifficultyTier(q.difficulty);
    row[t] += 1;
  }

  const failures = [];
  const warnings = [];

  if (unmappedMc.length) {
    const sample = unmappedMc.slice(0, 16).join(', ');
    warnings.push(
      `${unmappedMc.length} MC item(s) in loop comps missing STANDARD_MAP (showing up to 16): ${sample}${unmappedMc.length > 16 ? '…' : ''}`,
    );
  }

  const rows = Object.values(byKey)
    .filter((r) => !r.orphan)
    .sort((a, b) => a.std.localeCompare(b.std));

  for (const r of rows) {
    if (r.mc < minMc) {
      failures.push(`${r.comp}|${r.std}: ${r.mc} MC (minimum ${minMc})`);
    }
    if (
      minEachTier > 0
      && (r.easy < minEachTier || r.medium < minEachTier || r.hard < minEachTier)
    ) {
      failures.push(
        `${r.comp}|${r.std}: difficulty tiers easy/medium/hard = ${r.easy}/${r.medium}/${r.hard} (need ≥${minEachTier} each)`,
      );
    }
  }

  for (const r of Object.values(byKey)) {
    if (r.orphan && r.mc > 0) {
      warnings.push(
        `MC maps to ${r.comp}|${r.std} (${r.mc} items) but that pair is not listed under ${examId} domain standards — check comp vs STANDARD_MAP`,
      );
    }
  }

  return {
    ok: failures.length === 0,
    examId,
    failures,
    warnings,
    rows,
    unmappedMc,
    minMc,
    minEachTier,
  };
}
