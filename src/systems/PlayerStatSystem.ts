import { BEAM_TUNING, PLAYER_BASE_STATS, type PlayerStats } from '../config/gameConfig';
import { clamp } from '../utils/math';

export function getEffectiveDamage(stats: PlayerStats): number {
  return clamp(stats.damage * stats.damageMultiplier, 0.1, 999);
}

export function getEffectiveFireRate(stats: PlayerStats): number {
  return clamp(stats.fireRate * stats.fireRateMultiplier, 0.35, 15);
}

export function getEffectiveProjectileSpeed(stats: PlayerStats): number {
  return clamp(stats.projectileSpeed * stats.projectileSpeedMultiplier, 120, 1200);
}

export function getEffectiveBeamChargeMs(stats: PlayerStats): number {
  return clamp(
    BEAM_TUNING.chargeMs * (PLAYER_BASE_STATS.fireRate / getEffectiveFireRate(stats)),
    250,
    5000,
  );
}
