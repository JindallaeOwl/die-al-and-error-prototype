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
});
