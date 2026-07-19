import { describe, expect, it } from 'vitest';
import { DungeonManager } from '../src/systems/DungeonManager';
import { RoomNavigationSystem } from '../src/systems/RoomNavigationSystem';
import { createInitialRunState } from '../src/systems/RunState';
import { OPPOSITE_DIRECTION, type Direction } from '../src/utils/directions';
import type { RoomType } from '../src/data/rooms';

type SpecialRoomType = Extract<RoomType, 'shop' | 'treasure'>;

describe('RoomNavigationSystem', () => {
  it.each(['shop', 'treasure'] as const)(
    'allows entering the first-floor %s room without spending a key',
    (roomType) => {
      const dungeon = new DungeonManager(() => 0);
      dungeon.generateFloor(1);
      const direction = moveNextToRoomType(dungeon, roomType);
      const state = createInitialRunState();
      const navigation = new RoomNavigationSystem(dungeon);

      const result = navigation.tryMove(state, direction);

      expect(result.status).toBe('moved');
      expect(result.status === 'moved' && result.unlockedRoomType).toBeNull();
      expect(dungeon.getCurrentRoom().type).toBe(roomType);
      expect(state.inventory.keys).toBe(1);
    },
  );

  it.each(['shop', 'treasure'] as const)(
    'spends one key the first time a second-floor %s room is opened',
    (roomType) => {
      const dungeon = new DungeonManager(() => 0);
      dungeon.generateFloor(2);
      const direction = moveNextToRoomType(dungeon, roomType);
      const state = createInitialRunState();
      const navigation = new RoomNavigationSystem(dungeon);

      const firstEntry = navigation.tryMove(state, direction);

      expect(firstEntry.status).toBe('moved');
      expect(firstEntry.status === 'moved' && firstEntry.unlockedRoomType).toBe(roomType);
      expect(dungeon.getCurrentRoom().specialRoomUnlocked).toBe(true);
      expect(state.inventory.keys).toBe(0);

      navigation.tryMove(state, OPPOSITE_DIRECTION[direction]);
      const secondEntry = navigation.tryMove(state, direction);

      expect(secondEntry.status).toBe('moved');
      expect(secondEntry.status === 'moved' && secondEntry.unlockedRoomType).toBeNull();
      expect(state.inventory.keys).toBe(0);
    },
  );

  it.each(['shop', 'treasure'] as const)(
    'does not move into a locked second-floor %s room without a key',
    (roomType) => {
      const dungeon = new DungeonManager(() => 0);
      dungeon.generateFloor(2);
      const direction = moveNextToRoomType(dungeon, roomType);
      const roomBefore = dungeon.getCurrentRoom();
      const state = createInitialRunState();
      state.inventory.keys = 0;
      const navigation = new RoomNavigationSystem(dungeon);

      expect(navigation.tryMove(state, direction)).toEqual({
        status: 'key-needed',
        roomType,
      });
      expect(dungeon.getCurrentRoom().id).toBe(roomBefore.id);
    },
  );
});

function moveNextToRoomType(dungeon: DungeonManager, targetType: SpecialRoomType): Direction {
  const path = findPathToRoomType(dungeon, targetType);

  for (const direction of path.slice(0, -1)) {
    dungeon.move(direction);
  }

  return path.at(-1)!;
}

function findPathToRoomType(dungeon: DungeonManager, targetType: SpecialRoomType): Direction[] {
  const start = dungeon.getCurrentRoom();
  const visited = new Set([start.id]);
  const pending: Array<{ roomId: string; path: Direction[] }> = [{ roomId: start.id, path: [] }];
  const rooms = new Map(dungeon.getRooms().map((room) => [room.id, room]));

  while (pending.length > 0) {
    const current = pending.shift()!;
    const room = rooms.get(current.roomId)!;

    if (room.type === targetType) {
      return current.path;
    }

    for (const direction of room.exits) {
      const neighbor = dungeon.getNeighbor(room, direction);

      if (!neighbor || visited.has(neighbor.id)) {
        continue;
      }

      visited.add(neighbor.id);
      pending.push({ roomId: neighbor.id, path: [...current.path, direction] });
    }
  }

  throw new Error(`No ${targetType} room found.`);
}
