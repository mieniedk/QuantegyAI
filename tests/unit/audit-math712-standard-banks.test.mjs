import { describe, it, expect } from 'vitest';
import {
  auditMath712StandardBanks,
  MATH712_MIN_MC_PER_STANDARD,
} from '../../src/utils/auditMath712StandardBanks.js';

describe('auditMath712StandardBanks', () => {
  it(`meets ≥${MATH712_MIN_MC_PER_STANDARD} MC per standard with easy/medium/hard coverage`, () => {
    const r = auditMath712StandardBanks();
    if (!r.ok) {
      // eslint-disable-next-line no-console -- test diagnostics
      console.error(r.failures.join('\n'));
    }
    expect(r.ok).toBe(true);
  });
});
