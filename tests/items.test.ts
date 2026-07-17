import { describe, expect, it } from 'vitest';
import { PASSIVE_ITEMS } from '../src/data/items';
import { ItemSystem } from '../src/systems/ItemSystem';
import { createInitialRunState } from '../src/systems/RunState';

describe('ItemSystem', () => {
  it('applies stat and attack-profile modifiers without mutating the originals', () => {
    const state = createInitialRunState();
    const item = PASSIVE_ITEMS.find((candidate) => candidate.id === 'quad-shot');
    const system = new ItemSystem(() => 0);

    expect(item).toBeDefined();
    const stats = system.applyItem(state.stats, item!);
    const profile = system.applyAttackProfile(state.attackProfile, item!);

    expect(profile.seedCount).toBe(4);
    expect(profile.extraForeheadEyeCount).toBe(2);
    expect(stats.fireRateMultiplier).toBeCloseTo(0.42);
    expect(state.attackProfile.seedCount).toBe(1);
    expect(state.stats.fireRateMultiplier).toBe(1);
  });

  it('selects an unseen item from the regular reward pool', () => {
    const system = new ItemSystem(() => 0);

    expect(system.pickRewardItem(['quad-shot']).id).toBe('mega-seed');
  });
});
