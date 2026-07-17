import { PLAYER_HEALTH_UNITS_PER_HEART } from '../config/gameConfig';

export type HeartFillUnits = 0 | 1 | 2;

export function getHeartFillUnits(health: number, maxHealth: number): HeartFillUnits[] {
  const heartCount = Math.ceil(Math.max(0, maxHealth) / PLAYER_HEALTH_UNITS_PER_HEART);
  const currentHealth = Math.max(0, Math.min(health, maxHealth));

  return Array.from({ length: heartCount }, (_, index) => {
    const remaining = currentHealth - index * PLAYER_HEALTH_UNITS_PER_HEART;

    if (remaining >= PLAYER_HEALTH_UNITS_PER_HEART) {
      return 2;
    }

    return remaining >= 1 ? 1 : 0;
  });
}
