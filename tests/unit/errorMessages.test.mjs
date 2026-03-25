// Unit tests for src/utils/errorMessages.js
import { describe, it, expect } from 'vitest';
import { ERROR_MESSAGES, getUserFriendlyError } from '../../src/utils/errorMessages.js';

describe('errorMessages', () => {
  describe('ERROR_MESSAGES', () => {
    it('has expected keys', () => {
      expect(ERROR_MESSAGES).toHaveProperty('network');
      expect(ERROR_MESSAGES).toHaveProperty('server');
      expect(ERROR_MESSAGES).toHaveProperty('auth');
      expect(ERROR_MESSAGES).toHaveProperty('generic');
    });
  });

  describe('getUserFriendlyError', () => {
    it('returns network message for fetch errors', () => {
      expect(getUserFriendlyError(new Error('Failed to fetch'))).toBe(ERROR_MESSAGES.network);
    });

    it('returns auth message for 401', () => {
      expect(getUserFriendlyError(new Error('401 Unauthorized'))).toBe(ERROR_MESSAGES.auth);
    });

    it('returns context-based message when no message and context provided', () => {
      expect(getUserFriendlyError(new Error(''), 'save')).toBe('Failed to save. Please try again.');
    });

    it('accepts string input', () => {
      expect(getUserFriendlyError('Failed to fetch')).toBe(ERROR_MESSAGES.network);
    });
  });
});
