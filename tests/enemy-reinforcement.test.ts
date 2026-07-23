import { describe, expect, it } from 'vitest';
import {
  getReinforcementCount,
  getReinforcementPool,
  getSplitChildSpawns,
  type SplitBounds,
} from '../src/systems/EnemyReinforcementRules';

const ROOM: SplitBounds = { left: 32, right: 448, top: 32, bottom: 240 };

describe('reinforcement count', () => {
  it('adds no reinforcements on floor 1', () => {
    expect(getReinforcementCount(1, 'combat')).toBe(0);
  });

  it('adds at least one reinforcement from floor 2, despite the fractional rounding', () => {
    // (2 - 1) * 0.8 = 0.8 -> floor 0; the guard keeps the splitter reachable.
    expect(getReinforcementCount(2, 'combat')).toBe(1);
  });

  it('keeps the original scaling on later floors and caps at four', () => {
    expect(getReinforcementCount(3, 'combat')).toBe(1);
    expect(getReinforcementCount(4, 'combat')).toBe(2);
    expect(getReinforcementCount(6, 'combat')).toBe(4);
    expect(getReinforcementCount(20, 'combat')).toBe(4);
  });

  it('never reinforces non-combat rooms', () => {
    expect(getReinforcementCount(5, 'boss')).toBe(0);
    expect(getReinforcementCount(5, 'shop')).toBe(0);
  });
});

describe('reinforcement pool', () => {
  it('excludes the splitter on floor 1', () => {
    expect(getReinforcementPool(1)).not.toContain('splitter');
  });

  it('includes the splitter from floor 2', () => {
    expect(getReinforcementPool(2)).toContain('splitter');
  });
});

describe('split child spawns', () => {
  it('produces two splitterlings when a splitter dies', () => {
    const spawns = getSplitChildSpawns('splitter', 240, 136, ROOM, () => 0);

    expect(spawns).toHaveLength(2);
    expect(spawns.every((spawn) => spawn.enemyId === 'splitterling')).toBe(true);
  });

  it('keeps every child inside the room bounds even near a wall', () => {
    const spawns = getSplitChildSpawns('splitter', ROOM.right, ROOM.top, ROOM, () => 0.99);

    for (const spawn of spawns) {
      expect(spawn.x).toBeGreaterThanOrEqual(ROOM.left);
      expect(spawn.x).toBeLessThanOrEqual(ROOM.right);
      expect(spawn.y).toBeGreaterThanOrEqual(ROOM.top);
      expect(spawn.y).toBeLessThanOrEqual(ROOM.bottom);
    }
  });

  it('does not split a splitterling, preventing an endless chain', () => {
    expect(getSplitChildSpawns('splitterling', 240, 136, ROOM, () => 0)).toHaveLength(0);
  });
});
