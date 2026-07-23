import { describe, expect, it } from 'vitest';
import {
  BRIDGE_ZONE,
  createGroundGrid,
  createTreePlacements,
  DUNGEON_ENTRANCES,
  GRID_HEIGHT,
  GRID_WIDTH,
  isInsideRect,
  isWalkableTile,
  PLAYER_START,
  ROCK_POSITIONS,
  TILE_SIZE,
  TileId,
  VILLAGE_SITE,
} from '../src/data/overworld';

function cellOf(x: number, y: number): { cx: number; cy: number } {
  return { cx: Math.floor(x / TILE_SIZE), cy: Math.floor(y / TILE_SIZE) };
}

/** 걷기 가능 타일만 밟아 시작점에서 목표점까지 갈 수 있는지 너비 우선 탐색으로 확인. */
function canWalkBetween(
  grid: number[][],
  from: { x: number; y: number },
  to: { x: number; y: number },
): boolean {
  const start = cellOf(from.x, from.y);
  const goal = cellOf(to.x, to.y);
  const visited = new Set<string>([`${start.cx},${start.cy}`]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.cx === goal.cx && current.cy === goal.cy) {
      return true;
    }

    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const next = { cx: current.cx + dx, cy: current.cy + dy };
      const key = `${next.cx},${next.cy}`;

      if (
        next.cx < 0 ||
        next.cy < 0 ||
        next.cx >= GRID_WIDTH ||
        next.cy >= GRID_HEIGHT ||
        visited.has(key) ||
        !isWalkableTile(grid[next.cy][next.cx])
      ) {
        continue;
      }

      visited.add(key);
      queue.push(next);
    }
  }

  return false;
}

describe('overworld terrain', () => {
  const grid = createGroundGrid();

  it('generates the expected grid size, deterministically', () => {
    expect(grid).toHaveLength(GRID_HEIGHT);
    expect(grid[0]).toHaveLength(GRID_WIDTH);
    expect(createGroundGrid()).toEqual(grid);
  });

  it('surrounds the continent with ocean', () => {
    expect(grid[0][0]).toBe(TileId.water);
    expect(grid[0][GRID_WIDTH - 1]).toBe(TileId.water);
    expect(grid[GRID_HEIGHT - 1][0]).toBe(TileId.water);
    expect(grid[GRID_HEIGHT - 1][GRID_WIDTH - 1]).toBe(TileId.water);
  });

  it('clears dirt ground for the village site', () => {
    const center = cellOf(
      VILLAGE_SITE.x + VILLAGE_SITE.width / 2,
      VILLAGE_SITE.y + VILLAGE_SITE.height / 2,
    );

    expect(grid[center.cy][center.cx]).toBe(TileId.dirt);
  });

  it('builds a plank bridge across the river', () => {
    let planks = 0;

    for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
      for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
        if (grid[cy][cx] !== TileId.plank) {
          continue;
        }

        planks += 1;
        expect(isInsideRect({ x: cx * TILE_SIZE + 8, y: cy * TILE_SIZE + 8 }, BRIDGE_ZONE)).toBe(
          true,
        );
      }
    }

    expect(planks).toBeGreaterThanOrEqual(4);
  });

  it('lets the player walk from the start to every dungeon entrance', () => {
    for (const entrance of DUNGEON_ENTRANCES) {
      const mouth = { x: entrance.x, y: entrance.y + 20 };
      expect(canWalkBetween(grid, PLAYER_START, mouth)).toBe(true);
    }
  });

  it('separates the south cave from the village by the river (bridge is required)', () => {
    const bridgeless = createGroundGrid();

    for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
      for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
        if (bridgeless[cy][cx] === TileId.plank) {
          bridgeless[cy][cx] = TileId.water;
        }
      }
    }

    const south = DUNGEON_ENTRANCES.find((entrance) => entrance.id === 'south-cave')!;
    expect(canWalkBetween(bridgeless, PLAYER_START, { x: south.x, y: south.y + 20 })).toBe(false);
  });

  it('plants trees only on grass and keeps landmarks clear', () => {
    const trees = createTreePlacements(grid);

    expect(trees.length).toBeGreaterThan(40);

    for (const tree of trees) {
      const cell = cellOf(tree.x, tree.y);
      const tile = grid[cell.cy][cell.cx];

      expect([TileId.grassA, TileId.grassB, TileId.grassC]).toContain(tile);

      for (const entrance of DUNGEON_ENTRANCES) {
        expect(Math.hypot(tree.x - entrance.x, tree.y - entrance.y)).toBeGreaterThanOrEqual(72);
      }
    }
  });

  it('keeps rocks on walkable land', () => {
    for (const rock of ROCK_POSITIONS) {
      const cell = cellOf(rock.x, rock.y);
      expect(isWalkableTile(grid[cell.cy][cell.cx])).toBe(true);
    }
  });
});
