import { describe, expect, it } from 'vitest';
import { addConsumable, spendConsumable } from '../src/systems/InventorySystem';
import { createInitialRunState } from '../src/systems/RunState';

describe('InventorySystem', () => {
  it('caps consumables at the inventory maximum', () => {
    const inventory = createInitialRunState().inventory;

    expect(addConsumable(inventory, 'coins', 150).coins).toBe(99);
  });

  it('does not spend a consumable when the balance is insufficient', () => {
    const inventory = createInitialRunState().inventory;

    expect(spendConsumable(inventory, 'bombs', 1)).toBeNull();
    expect(inventory.bombs).toBe(0);
  });

  it('returns a new inventory when spending succeeds', () => {
    const inventory = createInitialRunState().inventory;
    const updated = spendConsumable(inventory, 'keys', 1);

    expect(updated?.keys).toBe(0);
    expect(inventory.keys).toBe(1);
  });
});
