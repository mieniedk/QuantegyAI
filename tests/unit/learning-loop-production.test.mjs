import { describe, it, expect, beforeEach, vi } from 'vitest';
import { phaseNeedsUrlUpdate, withPhaseInSearch } from '../../src/utils/practiceLoopUrl.js';
import {
  maybeMigrateDomainToStandard,
  getMasteryStorageKey,
  retryMasteryPersist,
} from '../../src/utils/masteryEngine.js';
import {
  getSpacedReviewCandidates,
  persistLoopReviewSnapshot,
  buildLoopReviewKey,
  addWeakQuestionIds,
  loadLoopReview,
} from '../../src/utils/loopReviewStorage.js';
import {
  touchLoopSessionStart,
} from '../../src/utils/learningExperienceStorage.js';

function createLocalStorageMock() {
  let store = {};
  return {
    getItem: vi.fn((k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null)),
    setItem: vi.fn((k, v) => {
      store[k] = String(v);
    }),
    removeItem: vi.fn((k) => {
      delete store[k];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _dump: () => ({ ...store }),
  };
}

describe('practiceLoopUrl', () => {
  it('phaseNeedsUrlUpdate is false when phase matches', () => {
    expect(phaseNeedsUrlUpdate('?phase=game&foo=1', 'game')).toBe(false);
  });
  it('phaseNeedsUrlUpdate is true when phase differs', () => {
    expect(phaseNeedsUrlUpdate('?phase=diagnostic', 'game')).toBe(true);
  });
  it('withPhaseInSearch preserves other params', () => {
    const next = withPhaseInSearch('?teks=A&phase=diagnostic', 'check-quiz');
    expect(next.get('teks')).toBe('A');
    expect(next.get('phase')).toBe('check-quiz');
  });
});

describe('masteryEngine migration + retry', () => {
  let ls;
  beforeEach(() => {
    ls = createLocalStorageMock();
    globalThis.localStorage = ls;
  });

  it('maybeMigrateDomainToStandard copies domain row to per-standard key once', () => {
    const exam = 'math712';
    const raw = {
      [exam]: {
        comp001: { score: 40, gameHistory: [], lastSeen: null, mistakes: [], postQuizMediumCorrect: true },
      },
    };
    ls.setItem('allen-ace-mastery', JSON.stringify(raw));

    const { migrated, persist } = maybeMigrateDomainToStandard(exam, 'comp001', '', 'c006');
    expect(migrated).toBe(true);
    expect(persist.ok).toBe(true);

    const all = JSON.parse(ls.getItem('quantegyai-mastery') || ls.getItem('allen-ace-mastery'));
    expect(all[exam]['comp001::c006'].score).toBe(40);
    expect(all[exam]['__mig__comp001::c006']).toBe(true);
  });

  it('getMasteryStorageKey uses :: for comp + standard', () => {
    expect(getMasteryStorageKey('comp001', '', 'c006')).toBe('comp001::c006');
  });

  it('retryMasteryPersist writes entry after failure path', () => {
    const exam = 'math712';
    ls.setItem('allen-ace-mastery', JSON.stringify({ [exam]: {} }));
    const key = 'comp001::c006';
    const entry = { score: 55, gameHistory: [], lastSeen: 't', mistakes: [], postQuizMediumCorrect: false };
    const r = retryMasteryPersist(exam, key, entry);
    expect(r.ok).toBe(true);
    const all = JSON.parse(ls.getItem('quantegyai-mastery') || ls.getItem('allen-ace-mastery'));
    expect(all[exam][key].score).toBe(55);
  });
});

describe('loopReviewStorage spaced review + persist', () => {
  let ls;
  beforeEach(() => {
    ls = createLocalStorageMock();
    globalThis.localStorage = ls;
    globalThis.window = { localStorage: ls };
  });

  it('getSpacedReviewCandidates prefers oldest weak then flagged', () => {
    const key = buildLoopReviewKey('math712', 'comp001', 'c001');
    const allowed = new Set(['q1', 'q2', 'q3']);
    const snapshot = {
      weak: { q1: 100, q2: 200 },
      flagged: ['q3', 'q1'],
    };
    persistLoopReviewSnapshot(key, snapshot);
    const ids = getSpacedReviewCandidates(key, allowed, 5);
    expect(ids[0]).toBe('q1');
    expect(ids[1]).toBe('q2');
    expect(ids[2]).toBe('q3');
  });

  it('weak map is capped at 200 entries', () => {
    const key = buildLoopReviewKey('math712', 'comp002', 'c002');
    const ids = Array.from({ length: 250 }, (_, i) => `q${i}`);
    addWeakQuestionIds(key, ids);
    const data = loadLoopReview(key);
    expect(Object.keys(data.weak).length).toBeLessThanOrEqual(200);
  });

  it('persistLoopReviewSnapshot merges with existing state', () => {
    const key = buildLoopReviewKey('math712', 'comp003', 'c003');
    persistLoopReviewSnapshot(key, { weak: { q1: 100 }, flagged: ['qA'] });
    persistLoopReviewSnapshot(key, { weak: { q2: 200 }, flagged: ['qB'] });
    const data = loadLoopReview(key);
    expect(data.weak.q1).toBe(100);
    expect(data.weak.q2).toBe(200);
    expect(data.flagged).toContain('qA');
    expect(data.flagged).toContain('qB');
  });
});

describe('learningExperienceStorage session cap', () => {
  let ls;
  beforeEach(() => {
    ls = createLocalStorageMock();
    globalThis.localStorage = ls;
    globalThis.window = { localStorage: ls };
  });

  it('touchLoopSessionStart caps to 50 sessions', () => {
    for (let i = 0; i < 60; i++) {
      touchLoopSessionStart(`seed-${i}`);
    }
    const raw = JSON.parse(ls.getItem('quantegyai-learning-experience') || ls.getItem('allen-ace-learning-experience'));
    const count = Object.keys(raw.loopSessions || {}).length;
    expect(count).toBeLessThanOrEqual(50);
  });
});
