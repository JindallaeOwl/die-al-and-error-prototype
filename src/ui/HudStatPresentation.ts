import { PLAYER_BASE_STATS, type PlayerStats } from '../config/gameConfig';
import {
  getEffectiveDamage,
  getEffectiveFireRate,
  getEffectiveProjectileSpeed,
} from '../systems/PlayerStatSystem';

export interface HudStatValues {
  moveSpeed: string;
  fireRate: string;
  damage: string;
  range: string;
  projectileSpeed: string;
  luck: string;
}

const BASE_DISPLAY_RANGE = 6.5;

export function getHudStatValues(stats: PlayerStats): HudStatValues {
  return {
    moveSpeed: (stats.moveSpeed / PLAYER_BASE_STATS.moveSpeed).toFixed(2),
    fireRate: getEffectiveFireRate(stats).toFixed(2),
    damage: getEffectiveDamage(stats).toFixed(2),
    range: ((stats.range / PLAYER_BASE_STATS.range) * BASE_DISPLAY_RANGE).toFixed(2),
    projectileSpeed: (
      getEffectiveProjectileSpeed(stats) / PLAYER_BASE_STATS.projectileSpeed
    ).toFixed(2),
    luck: stats.luck.toFixed(2),
  };
}
