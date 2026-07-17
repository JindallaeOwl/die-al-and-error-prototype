import { describe, expect, it } from 'vitest';
import { RewardSystem } from '../src/systems/RewardSystem';
import { createInitialRunState } from '../src/systems/RunState';

describe('RewardSystem', () => {
  it('produces a reproducible room-clear reward with an injected RNG', () => {
    const system = new RewardSystem(() => 0);
    const reward = system.rollRoomClearReward(createInitialRunState().stats);

    expect(reward).toMatchObject({ kind: 'coins', amount: 2 });
  });

  it('can deterministically choose a chest heal', () => {
    const system = new RewardSystem(() => 0);

    expect(system.rollChestResult(createInitialRunState().stats)).toEqual({
      type: 'heal',
      amount: 1,
    });
  });

  it('usually drops one coin when a destroyed crate passes its drop roll', () => {
    const rolls = [0.1, 0.9];
    const system = new RewardSystem(() => rolls.shift() ?? 0);

    expect(system.rollDestroyedCrateCoinDrop()).toEqual({
      kind: 'coins',
      amount: 1,
      labelKey: 'resources.coins',
      tint: 0xffffff,
      appearance: undefined,
    });
  });

  it('can drop the rare black five-coin pickup from a destroyed crate', () => {
    const rolls = [0.1, 0.1];
    const system = new RewardSystem(() => rolls.shift() ?? 0);

    expect(system.rollDestroyedCrateCoinDrop()).toEqual({
      kind: 'coins',
      amount: 5,
      labelKey: 'resources.coins',
      tint: 0xffffff,
      appearance: 'five-coin',
    });
  });

  it('can produce no coin when a destroyed crate misses its drop roll', () => {
    const system = new RewardSystem(() => 0.9);

    expect(system.rollDestroyedCrateCoinDrop()).toBeNull();
  });

  it('adds a consumable pickup to the run inventory', () => {
    const state = createInitialRunState();
    const system = new RewardSystem(() => 0);

    expect(
      system.applyPickup(state, {
        kind: 'coins',
        amount: 4,
        labelKey: 'resources.coins',
        tint: 0,
      }),
    ).toEqual({
      collected: true,
      type: 'consumable',
      amount: 4,
      labelKey: 'resources.coins',
    });
    expect(state.inventory.coins).toBe(4);
  });

  it('leaves a full consumable pickup on the floor', () => {
    const state = createInitialRunState();
    state.inventory.bombs = 99;
    const system = new RewardSystem(() => 0);

    expect(
      system.applyPickup(state, {
        kind: 'bombs',
        amount: 1,
        labelKey: 'resources.bombs',
        tint: 0,
      }),
    ).toEqual({
      collected: false,
      type: 'resource-full',
      labelKey: 'resources.bombs',
    });
    expect(state.inventory.bombs).toBe(99);
  });

  it('applies a chest heal directly to the run state', () => {
    const state = createInitialRunState();
    state.stats.health = 2;
    const system = new RewardSystem(() => 0);

    expect(
      system.applyPickup(state, {
        kind: 'chest',
        amount: 1,
        labelKey: 'resources.chest',
        tint: 0,
      }),
    ).toEqual({
      collected: true,
      type: 'chest',
      chestResult: { type: 'heal', amount: 1 },
    });
    expect(state.stats.health).toBe(3);
  });
});
