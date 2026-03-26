// Unit tests for src/utils/practiceLoopScope.js
import { describe, it, expect } from 'vitest';
import { practiceLoopInstanceKey } from '../../src/utils/practiceLoopScope.js';

function params(entries) {
  return new URLSearchParams(entries);
}

describe('practiceLoopInstanceKey', () => {
  it('differs when comp or standard changes (Math 7–12 loop navigation)', () => {
    const a = practiceLoopInstanceKey(
      params({ examId: 'math712', grade: 'grade7-12', comp: 'comp002', currentStd: 'c004' }),
    );
    const b = practiceLoopInstanceKey(
      params({ examId: 'math712', grade: 'grade7-12', comp: 'comp002', currentStd: 'c005' }),
    );
    const c = practiceLoopInstanceKey(
      params({ examId: 'math712', grade: 'grade7-12', comp: 'comp003', currentStd: 'c010' }),
    );
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
    expect(b).not.toBe(c);
  });

  it('treats std alias same as currentStd for the same id', () => {
    const withCurrent = practiceLoopInstanceKey(params({ comp: 'comp002', currentStd: 'c008' }));
    const withStd = practiceLoopInstanceKey(params({ comp: 'comp002', std: 'c008' }));
    expect(withCurrent).toBe(withStd);
  });

  it('differs for TEKS-only flows when teks changes', () => {
    const a = practiceLoopInstanceKey(params({ grade: 'grade4-8', teks: '4.2A' }));
    const b = practiceLoopInstanceKey(params({ grade: 'grade4-8', teks: '4.2B' }));
    expect(a).not.toBe(b);
  });

  it('differs when concept id changes (student learn path)', () => {
    const a = practiceLoopInstanceKey(
      params({ teks: 'A.1', concept: 'concept-a', grade: 'grade7-12' }),
    );
    const b = practiceLoopInstanceKey(
      params({ teks: 'A.1', concept: 'concept-b', grade: 'grade7-12' }),
    );
    expect(a).not.toBe(b);
  });

  it('ignores label, phase, sid — cosmetic / session params do not remount', () => {
    const base = practiceLoopInstanceKey(
      params({ comp: 'comp001', currentStd: 'c001', examId: 'math712' }),
    );
    const withExtra = practiceLoopInstanceKey(
      params({
        comp: 'comp001',
        currentStd: 'c001',
        examId: 'math712',
        label: 'Different label',
        phase: 'mastery-check',
        sid: 'student-1',
        cid: 'class-2',
      }),
    );
    expect(base).toBe(withExtra);
  });
});
