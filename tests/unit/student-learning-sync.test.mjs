import { describe, it, expect } from 'vitest';
import {
  mergeMasteryBlobs,
  mergeLoopReviewBlobs,
  mergeLearningExperienceBlobs,
} from '../../src/utils/studentLearningSync.js';

describe('studentLearningSync merges', () => {
  it('mergeMasteryBlobs prefers newer lastSeen', () => {
    const local = {
      math712: {
        'comp001::c001': { score: 50, lastSeen: '2025-01-01T00:00:00.000Z' },
      },
    };
    const remote = {
      math712: {
        'comp001::c001': { score: 40, lastSeen: '2026-01-02T00:00:00.000Z' },
      },
    };
    const out = mergeMasteryBlobs(local, remote);
    expect(out.math712['comp001::c001'].score).toBe(40);
    expect(out.math712['comp001::c001'].lastSeen).toBe('2026-01-02T00:00:00.000Z');
  });

  it('mergeMasteryBlobs tie-break uses higher score', () => {
    const t = '2026-01-01T00:00:00.000Z';
    const local = { math712: { k: { score: 60, lastSeen: t } } };
    const remote = { math712: { k: { score: 80, lastSeen: t } } };
    const out = mergeMasteryBlobs(local, remote);
    expect(out.math712.k.score).toBe(80);
  });

  it('mergeLoopReviewBlobs unions weak timestamps and flagged', () => {
    const local = { 'math712|comp001|c001': { weak: { q1: 100 }, flagged: ['q2'] } };
    const remote = { 'math712|comp001|c001': { weak: { q1: 200 }, flagged: ['q3'] } };
    const out = mergeLoopReviewBlobs(local, remote);
    expect(out['math712|comp001|c001'].weak.q1).toBe(200);
    expect(out['math712|comp001|c001'].flagged.sort()).toEqual(['q2', 'q3']);
  });

  it('mergeLearningExperienceBlobs unions milestones', () => {
    const local = { milestones: { 'a|b|c': { firstMedHard: true } } };
    const remote = { milestones: { 'a|b|c': { other: true } } };
    const out = mergeLearningExperienceBlobs(local, remote);
    expect(out.milestones['a|b|c'].firstMedHard).toBe(true);
    expect(out.milestones['a|b|c'].other).toBe(true);
  });
});
