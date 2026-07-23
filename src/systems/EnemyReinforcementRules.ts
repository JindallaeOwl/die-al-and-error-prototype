import { ENEMY_DEFINITIONS, type EnemyId } from '../data/enemies';
import type { RoomType } from '../data/rooms';
import type { RandomSource } from '../utils/random';

const BASE_REINFORCEMENT_POOL: readonly EnemyId[] = ['chaser', 'shooter', 'dasher'];
const MAX_REINFORCEMENTS = 4;

/**
 * Number of extra enemies added to a combat room on top of its template spawn
 * set. Reinforcements begin on floor 2. Note that `(floor - 1) * 0.8` floors to
 * 0 on floor 2, so without the `Math.max(1, ...)` guard the first reinforcement
 * (and therefore the splitter) would not appear until floor 3.
 */
export function getReinforcementCount(floor: number, roomType: RoomType): number {
  if (roomType !== 'combat' || floor < 2) {
    return 0;
  }

  return Math.max(1, Math.min(MAX_REINFORCEMENTS, Math.floor((floor - 1) * 0.8)));
}

/** Enemy types eligible as reinforcements. The splitter joins from floor 2. */
export function getReinforcementPool(floor: number): EnemyId[] {
  return floor >= 2 ? [...BASE_REINFORCEMENT_POOL, 'splitter'] : [...BASE_REINFORCEMENT_POOL];
}

export interface SplitBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface SplitChildSpawn {
  enemyId: EnemyId;
  x: number;
  y: number;
}

/**
 * Positions for the children a defeated enemy splits into. Returns an empty list
 * for enemies that do not split (e.g. the splitterling), which prevents an
 * endless split chain. Children are spread around the parent and clamped inside
 * the room bounds.
 */
export function getSplitChildSpawns(
  parentId: EnemyId,
  parentX: number,
  parentY: number,
  bounds: SplitBounds,
  random: RandomSource,
): SplitChildSpawn[] {
  const definition = ENEMY_DEFINITIONS[parentId];
  const childId = definition.splitChildId;

  if (!childId) {
    return [];
  }

  const childCount = definition.splitChildCount ?? 2;
  const childRadius = ENEMY_DEFINITIONS[childId].bodyRadius;
  const spread = definition.bodyRadius + childRadius;
  const spawns: SplitChildSpawn[] = [];

  for (let i = 0; i < childCount; i += 1) {
    const angle = (Math.PI * 2 * i) / childCount + random() * Math.PI * 0.5;
    const x = clamp(
      parentX + Math.cos(angle) * spread,
      bounds.left + childRadius + 2,
      bounds.right - childRadius - 2,
    );
    const y = clamp(
      parentY + Math.sin(angle) * spread,
      bounds.top + childRadius + 2,
      bounds.bottom - childRadius - 2,
    );
    spawns.push({ enemyId: childId, x, y });
  }

  return spawns;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
