import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS, type EnemyId } from '../src/data/enemies';
import {
  BOSS_ROOM_TEMPLATES,
  COMBAT_ROOM_TEMPLATES,
  SHOP_ROOM_TEMPLATE,
  START_ROOM_TEMPLATE,
  TREASURE_ROOM_TEMPLATE,
} from '../src/data/rooms';

describe('splitter enemy data', () => {
  it('points at a child enemy that actually exists', () => {
    const splitter = ENEMY_DEFINITIONS.splitter;

    expect(splitter.splitChildId).toBe('splitterling');
    expect(splitter.splitChildCount ?? 0).toBeGreaterThan(0);
    expect(ENEMY_DEFINITIONS[splitter.splitChildId as EnemyId]).toBeDefined();
  });

  it('never lets the child split again, preventing an endless chain', () => {
    expect(ENEMY_DEFINITIONS.splitterling.splitChildId).toBeUndefined();
  });

  it('keeps both splitter forms as normal (non-boss) enemies', () => {
    expect(ENEMY_DEFINITIONS.splitter.kind).toBe('normal');
    expect(ENEMY_DEFINITIONS.splitterling.kind).toBe('normal');
  });

  it('makes the child smaller and faster than its parent', () => {
    expect(ENEMY_DEFINITIONS.splitterling.bodyRadius).toBeLessThan(
      ENEMY_DEFINITIONS.splitter.bodyRadius,
    );
    expect(ENEMY_DEFINITIONS.splitterling.speed).toBeGreaterThan(ENEMY_DEFINITIONS.splitter.speed);
  });
});

describe('room template enemy pools', () => {
  it('keeps the splitter family out of the fixed spawn sets so it only appears as a floor 2+ reinforcement', () => {
    const templates = [
      START_ROOM_TEMPLATE,
      SHOP_ROOM_TEMPLATE,
      TREASURE_ROOM_TEMPLATE,
      ...BOSS_ROOM_TEMPLATES,
      ...COMBAT_ROOM_TEMPLATES,
    ];
    const spawnedIds = templates.flatMap((template) =>
      template.spawnSets.flat().map((spawn) => spawn.enemyId),
    );

    expect(spawnedIds).not.toContain('splitter');
    expect(spawnedIds).not.toContain('splitterling');
  });
});
