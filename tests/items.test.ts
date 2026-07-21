import { describe, expect, it } from 'vitest';
import { findItemByReference, formatItemNumber, PASSIVE_ITEMS } from '../src/data/items';
import { ItemSystem } from '../src/systems/ItemSystem';
import { createInitialRunState } from '../src/systems/RunState';

describe('ItemSystem', () => {
  it('assigns unique shared catalog numbers with three-digit display labels', () => {
    const itemNumbers = PASSIVE_ITEMS.map((item) => item.itemNumber);

    expect(new Set(itemNumbers).size).toBe(PASSIVE_ITEMS.length);
    expect(itemNumbers.every((itemNumber) => Number.isInteger(itemNumber) && itemNumber > 0)).toBe(
      true,
    );
    expect(formatItemNumber(1)).toBe('ID: 001');
    expect(formatItemNumber(25)).toBe('ID: 025');
    expect(findItemByReference('001')?.id).toBe('red-mushroom');
    expect(findItemByReference('13')?.id).toBe('prism-lance');
    expect(findItemByReference('quad-shot')?.itemNumber).toBe(2);
  });

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

    expect(system.pickRewardItem(['quad-shot'])?.id).toBe('pulse-relay');
  });

  it('can select the Prism Lance only from the treasure pool', () => {
    const pickLast = () => 0.999999;
    const system = new ItemSystem(pickLast);

    expect(system.pickRewardItem([])?.id).not.toBe('prism-lance');
    expect(system.pickTreasureItem([])?.id).toBe('prism-lance');
  });

  it('updates the run state when an item is acquired', () => {
    const state = createInitialRunState();
    const item = PASSIVE_ITEMS.find((candidate) => candidate.id === 'quad-shot');
    const system = new ItemSystem(() => 0);

    expect(item).toBeDefined();
    expect(system.acquireItem(state, item!)).toEqual({
      acquired: true,
      stackCount: 1,
      newlyActivatedSynergyIds: [],
    });
    expect(state.collectedItemIds).toEqual(['quad-shot']);
    expect(state.attackProfile.seedCount).toBe(4);
    expect(state.stats.fireRateMultiplier).toBeCloseTo(0.42);
  });

  it('unlocks an item ability only once', () => {
    const state = createInitialRunState();
    const prismLance = PASSIVE_ITEMS.find((candidate) => candidate.id === 'prism-lance');
    const system = new ItemSystem(() => 0);

    expect(prismLance).toBeDefined();
    expect(system.acquireItem(state, prismLance!)).toEqual({
      acquired: true,
      stackCount: 1,
      newlyUnlockedAbilityId: 'charge-beam',
      newlyActivatedSynergyIds: [],
    });
    expect(system.acquireItem(state, prismLance!)).toEqual({
      acquired: false,
      stackCount: 1,
      newlyActivatedSynergyIds: [],
    });
    expect(state.unlockedAbilityIds).toEqual(['charge-beam']);
    expect(state.collectedItemIds).toEqual(['prism-lance']);
  });

  it.each([
    ['quad-shot', 'prism-lance'],
    ['prism-lance', 'quad-shot'],
  ])('keeps the four-way beam synergy when acquired as %s then %s', (firstId, secondId) => {
    const state = createInitialRunState();
    const system = new ItemSystem(() => 0);
    const first = PASSIVE_ITEMS.find((item) => item.id === firstId);
    const second = PASSIVE_ITEMS.find((item) => item.id === secondId);

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    system.acquireItem(state, first!);
    system.acquireItem(state, second!);

    expect(state.attackProfile.seedCount).toBe(4);
    expect(state.attackProfile.spreadStepDegrees).toBe(12);
    expect(state.unlockedAbilityIds).toContain('charge-beam');
  });

  it('defines rarity, category, source pools, and stack limits for all 25 passives', () => {
    expect(PASSIVE_ITEMS).toHaveLength(25);
    expect(
      PASSIVE_ITEMS.every(
        (item) =>
          item.dropSources.length > 0 &&
          item.maxStacks >= 1 &&
          ['common', 'uncommon', 'rare', 'legendary'].includes(item.rarity) &&
          ['offense', 'defense', 'utility', 'resource'].includes(item.category),
      ),
    ).toBe(true);
  });

  it('allows stackable items up to their cap and rejects another copy', () => {
    const state = createInitialRunState();
    const item = PASSIVE_ITEMS.find((candidate) => candidate.id === 'pulse-relay')!;
    const system = new ItemSystem(() => 0);

    for (let stack = 1; stack <= item.maxStacks; stack += 1) {
      expect(system.acquireItem(state, item)).toMatchObject({ acquired: true, stackCount: stack });
    }

    expect(system.acquireItem(state, item)).toMatchObject({
      acquired: false,
      stackCount: item.maxStacks,
    });
    expect(state.stats.fireRate).toBeCloseTo(2.8 + 0.55 * item.maxStacks);
  });

  it('activates a two-item synergy exactly once', () => {
    const state = createInitialRunState();
    const system = new ItemSystem(() => 0);
    const glassFern = PASSIVE_ITEMS.find((item) => item.id === 'glass-fern')!;
    const longEcho = PASSIVE_ITEMS.find((item) => item.id === 'long-echo')!;

    system.acquireItem(state, glassFern);
    const activation = system.acquireItem(state, longEcho);

    expect(activation.newlyActivatedSynergyIds).toEqual(['glass-horizon']);
    expect(state.activatedSynergyIds).toEqual(['glass-horizon']);
    expect(state.stats.damage).toBeCloseTo(2);
    expect(state.stats.range).toBe(380);

    const nextStack = system.acquireItem(state, glassFern);
    expect(nextStack.newlyActivatedSynergyIds).toEqual([]);
    expect(state.activatedSynergyIds).toEqual(['glass-horizon']);
  });

  it('uses separate room pools and luck-sensitive combat drop chances', () => {
    const alwaysLow = new ItemSystem(() => 0);
    const alwaysHigh = new ItemSystem(() => 0.999999);

    expect(alwaysLow.pickItemForSource('shop', [])?.dropSources).toContain('shop');
    expect(alwaysHigh.pickItemForSource('treasure', [])?.rarity).toBe('legendary');
    expect(alwaysLow.rollCombatRewardItem([], 0)).not.toBeNull();
    expect(alwaysHigh.rollCombatRewardItem([], 10)).toBeNull();
  });
});
