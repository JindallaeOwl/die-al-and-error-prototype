import { describe, expect, it } from 'vitest';
import {
  getSecretSynergySpawnPositions,
  KONAMI_CODE,
  SecretCodeTracker,
} from '../src/systems/SecretCodeSystem';

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

  it('places the two synergy items side by side without touching the player', () => {
    expect(getSecretSynergySpawnPositions(240, 136)).toEqual({
      prismLance: { x: 272, y: 136 },
      quadShot: { x: 304, y: 136 },
    });
  });

  it('moves the secret items to the opposite side near the right wall', () => {
    expect(getSecretSynergySpawnPositions(430, 136)).toEqual({
      prismLance: { x: 366, y: 136 },
      quadShot: { x: 398, y: 136 },
    });
  });

  it('keeps both secret items inside the room bounds', () => {
    expect(getSecretSynergySpawnPositions(32, 32)).toEqual({
      prismLance: { x: 64, y: 56 },
      quadShot: { x: 96, y: 56 },
    });
  });
});
