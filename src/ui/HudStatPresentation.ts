import type { PlayerStats } from '../config/gameConfig';
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

export function getHudStatValues(stats: PlayerStats): HudStatValues {
  return {
    moveSpeed: Math.round(stats.moveSpeed).toString(),
    fireRate: getEffectiveFireRate(stats).toFixed(1),
    damage: getEffectiveDamage(stats).toFixed(1),
    range: Math.round(stats.range).toString(),
    projectileSpeed: Math.round(getEffectiveProjectileSpeed(stats)).toString(),
    luck: stats.luck.toFixed(1),
  };
}
