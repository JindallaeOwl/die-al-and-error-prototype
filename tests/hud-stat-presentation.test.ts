import { describe, expect, it } from 'vitest';
import { PLAYER_BASE_STATS } from '../src/config/gameConfig';
import { getHudStatValues } from '../src/ui/HudStatPresentation';

describe('HUD stat presentation', () => {
  it('shows all six combat and movement values in HUD-friendly formats', () => {
    expect(getHudStatValues(PLAYER_BASE_STATS)).toEqual({
      moveSpeed: '130',
      fireRate: '2.8',
      damage: '1.0',
      range: '220',
      projectileSpeed: '260',
      luck: '0.0',
    });
  });

  it('uses effective multiplied values for damage, fire rate, and projectile speed', () => {
    expect(
      getHudStatValues({
        ...PLAYER_BASE_STATS,
        damage: 2,
        damageMultiplier: 1.5,
        fireRate: 4,
        fireRateMultiplier: 0.5,
        projectileSpeed: 300,
        projectileSpeedMultiplier: 1.2,
      }),
    ).toMatchObject({ damage: '3.0', fireRate: '2.0', projectileSpeed: '360' });
  });
});
