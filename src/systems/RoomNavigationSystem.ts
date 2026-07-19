import { INVENTORY_TUNING } from '../config/gameConfig';
import type { Direction } from '../utils/directions';
import type { DungeonManager, RoomNode } from './DungeonManager';
import { spendConsumable } from './InventorySystem';
import type { RunState } from './RunState';

export type KeyLockedRoomType = Extract<RoomNode['type'], 'shop' | 'treasure'>;

export type RoomNavigationResult =
  | { status: 'no-target' }
  | { status: 'key-needed'; roomType: KeyLockedRoomType }
  | { status: 'moved'; room: RoomNode; unlockedRoomType: KeyLockedRoomType | null };

export class RoomNavigationSystem {
  constructor(private readonly dungeon: DungeonManager) {}

  tryMove(runState: RunState, direction: Direction): RoomNavigationResult {
    const targetRoom = this.dungeon.peek(direction);

    if (!targetRoom) {
      return { status: 'no-target' };
    }

    let unlockedRoomType: KeyLockedRoomType | null = null;

    if (isKeyLockedRoom(targetRoom) && !targetRoom.specialRoomUnlocked) {
      const updatedInventory = spendConsumable(
        runState.inventory,
        'keys',
        INVENTORY_TUNING.specialRoomKeyCost,
      );

      if (!updatedInventory) {
        return { status: 'key-needed', roomType: targetRoom.type };
      }

      runState.inventory = updatedInventory;
      this.dungeon.unlockRoom(targetRoom.id);
      unlockedRoomType = targetRoom.type;
    }

    const room = this.dungeon.move(direction);

    if (!room) {
      return { status: 'no-target' };
    }

    return { status: 'moved', room, unlockedRoomType };
  }
}

function isKeyLockedRoom(room: RoomNode): room is RoomNode & { type: KeyLockedRoomType } {
  return room.type === 'shop' || room.type === 'treasure';
}
