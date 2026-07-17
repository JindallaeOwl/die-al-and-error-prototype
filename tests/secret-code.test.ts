import { describe, expect, it } from 'vitest';
import { KONAMI_CODE, SecretCodeTracker } from '../src/systems/SecretCodeSystem';

describe('SecretCodeTracker', () => {
  it('matches the complete Konami code in order', () => {
    const tracker = new SecretCodeTracker(KONAMI_CODE);
    const results = KONAMI_CODE.map((keyCode) => tracker.push(keyCode));

    expect(results.slice(0, -1).every((matched) => !matched)).toBe(true);
    expect(results.at(-1)).toBe(true);
  });

  it('resets after a wrong key and can match a later attempt', () => {
    const tracker = new SecretCodeTracker(KONAMI_CODE);

    tracker.push('ArrowUp');
    tracker.push('KeyX');

    expect(KONAMI_CODE.map((keyCode) => tracker.push(keyCode)).at(-1)).toBe(true);
  });
});
