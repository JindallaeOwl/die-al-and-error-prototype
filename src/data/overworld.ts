// 오버월드(대륙 존) 지형 데이터. 16px 타일 격자 위에 바다로 둘러싸인 대륙을
// 생성한다. 모든 배치는 결정적(항상 같은 결과)이어서 테스트로 검증할 수 있다.
// 구성: 서쪽 숲, 중앙 마을 터(개간지), 북동·남동 던전 입구, 남동쪽 곡선 강과 다리,
// 마을에서 각 지점으로 이어지는 흙길.

export const TILE_SIZE = 16;
export const GRID_WIDTH = 90;
export const GRID_HEIGHT = 51;
export const OVERWORLD_SIZE = {
  width: GRID_WIDTH * TILE_SIZE,
  height: GRID_HEIGHT * TILE_SIZE,
} as const;

// 대륙 가장자리: 바다 3칸 + 모래사장 1칸. 플레이어는 모래사장까지 걸을 수 있다.
const OCEAN_CELLS = 3;
export const LAND_BOUNDS = {
  x: OCEAN_CELLS * TILE_SIZE,
  y: OCEAN_CELLS * TILE_SIZE,
  width: OVERWORLD_SIZE.width - OCEAN_CELLS * TILE_SIZE * 2,
  height: OVERWORLD_SIZE.height - OCEAN_CELLS * TILE_SIZE * 2,
} as const;

export const TileId = {
  grassA: 0,
  grassB: 1,
  grassC: 2,
  dirt: 3,
  sand: 4,
  water: 5,
  plank: 6,
} as const;

export type TileIdValue = (typeof TileId)[keyof typeof TileId];

export interface OverworldPoint {
  x: number;
  y: number;
}

export interface OverworldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const VILLAGE_SITE: OverworldRect = { x: 616, y: 336, width: 208, height: 144 };

export interface DungeonEntranceDefinition {
  id: string;
  x: number;
  y: number;
}

export const DUNGEON_ENTRANCES: readonly DungeonEntranceDefinition[] = [
  { id: 'north-cave', x: 1176, y: 184 },
  { id: 'south-cave', x: 1256, y: 656 },
];

export const PLAYER_START: OverworldPoint = { x: 720, y: 512 };

// 강을 건널 수 있는 다리 구역. 이 안의 물 타일은 나무판자로 바뀐다.
export const BRIDGE_ZONE: OverworldRect = { x: 1096, y: 484, width: 104, height: 80 };

// 강의 중심 곡선(2차 베지어). 남쪽 바다에서 시작해 동쪽 바다로 빠져나간다.
const RIVER_P0 = { x: 1004, y: 828 };
const RIVER_P1 = { x: 1052, y: 470 };
const RIVER_P2 = { x: 1452, y: 372 };

// 마을에서 뻗어나가는 흙길 (경유지 목록).
const PATHS: readonly (readonly OverworldPoint[])[] = [
  // 남쪽 길: 마을 → 다리 → 남동 동굴
  [
    { x: 720, y: 456 },
    { x: 720, y: 540 },
    { x: 920, y: 540 },
    { x: 1090, y: 524 },
    { x: 1160, y: 524 },
    { x: 1256, y: 600 },
    { x: 1256, y: 652 },
  ],
  // 북동 길: 마을 → 북동 동굴
  [
    { x: 760, y: 400 },
    { x: 1000, y: 280 },
    { x: 1176, y: 208 },
  ],
  // 서쪽 길: 마을 → 숲 초입
  [
    { x: 632, y: 420 },
    { x: 470, y: 430 },
  ],
];

function frac(value: number): number {
  return value - Math.floor(value);
}

function hash(cx: number, cy: number, salt: number): number {
  return frac(Math.sin(cx * 12.9898 + cy * 78.233 + salt * 37.719) * 43758.5453);
}

function riverPoint(t: number): OverworldPoint {
  const inv = 1 - t;
  return {
    x: inv * inv * RIVER_P0.x + 2 * t * inv * RIVER_P1.x + t * t * RIVER_P2.x,
    y: inv * inv * RIVER_P0.y + 2 * t * inv * RIVER_P1.y + t * t * RIVER_P2.y,
  };
}

function insideVillageClearing(x: number, y: number, inflate: number): boolean {
  const centerX = VILLAGE_SITE.x + VILLAGE_SITE.width / 2;
  const centerY = VILLAGE_SITE.y + VILLAGE_SITE.height / 2;
  const radiusX = VILLAGE_SITE.width / 2 + inflate;
  const radiusY = VILLAGE_SITE.height / 2 + inflate;
  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;
  return dx * dx + dy * dy <= 1;
}

function distanceToSegment(p: OverworldPoint, a: OverworldPoint, b: OverworldPoint): number {
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const lengthSq = abX * abX + abY * abY;
  const t =
    lengthSq === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * abX + (p.y - a.y) * abY) / lengthSq));
  const closestX = a.x + abX * t;
  const closestY = a.y + abY * t;
  return Math.hypot(p.x - closestX, p.y - closestY);
}

export function isInsideRect(point: OverworldPoint, rect: OverworldRect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function isWalkableTile(tile: number): boolean {
  return tile !== TileId.water;
}

export function createGroundGrid(): number[][] {
  const grid: number[][] = [];

  // 1) 풀밭 기본 채우기 (변형 3종을 노이즈로 섞는다)
  for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
    const row: number[] = [];

    for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
      const noise = hash(cx, cy, 1);
      row.push(noise < 0.6 ? TileId.grassA : noise < 0.85 ? TileId.grassB : TileId.grassC);
    }

    grid.push(row);
  }

  const centerOf = (cx: number, cy: number): OverworldPoint => ({
    x: cx * TILE_SIZE + TILE_SIZE / 2,
    y: cy * TILE_SIZE + TILE_SIZE / 2,
  });

  // 2) 마을 개간지 (타원형 흙바닥)
  for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
    for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
      const center = centerOf(cx, cy);

      if (insideVillageClearing(center.x, center.y, 14)) {
        grid[cy][cx] = TileId.dirt;
      }
    }
  }

  // 3) 흙길
  for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
    for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
      const center = centerOf(cx, cy);

      for (const path of PATHS) {
        for (let i = 0; i < path.length - 1; i += 1) {
          if (distanceToSegment(center, path[i], path[i + 1]) <= 11) {
            grid[cy][cx] = TileId.dirt;
          }
        }
      }
    }
  }

  // 4) 강 (곡선을 따라 폭이 살짝 변하는 물길)
  for (let step = 0; step <= 240; step += 1) {
    const t = step / 240;
    const point = riverPoint(t);
    const radius = 22 + Math.sin(t * 7.3) * 6;
    const minCx = Math.max(0, Math.floor((point.x - radius) / TILE_SIZE));
    const maxCx = Math.min(GRID_WIDTH - 1, Math.ceil((point.x + radius) / TILE_SIZE));
    const minCy = Math.max(0, Math.floor((point.y - radius) / TILE_SIZE));
    const maxCy = Math.min(GRID_HEIGHT - 1, Math.ceil((point.y + radius) / TILE_SIZE));

    for (let cy = minCy; cy <= maxCy; cy += 1) {
      for (let cx = minCx; cx <= maxCx; cx += 1) {
        const center = centerOf(cx, cy);

        if (Math.hypot(center.x - point.x, center.y - point.y) < radius) {
          grid[cy][cx] = TileId.water;
        }
      }
    }
  }

  // 5) 다리 (다리 구역 안의 물 타일을 판자로)
  for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
    for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
      if (grid[cy][cx] === TileId.water && isInsideRect(centerOf(cx, cy), BRIDGE_ZONE)) {
        grid[cy][cx] = TileId.plank;
      }
    }
  }

  // 6) 대륙 가장자리: 바다 3칸 + 모래사장 1칸 (강어귀는 모래 대신 물 유지)
  for (let cy = 0; cy < GRID_HEIGHT; cy += 1) {
    for (let cx = 0; cx < GRID_WIDTH; cx += 1) {
      const edge = Math.min(cx, cy, GRID_WIDTH - 1 - cx, GRID_HEIGHT - 1 - cy);

      if (edge < OCEAN_CELLS) {
        grid[cy][cx] = TileId.water;
      } else if (edge === OCEAN_CELLS && grid[cy][cx] !== TileId.water) {
        grid[cy][cx] = TileId.sand;
      }
    }
  }

  return grid;
}

export interface TreePlacement extends OverworldPoint {
  kind: 'oak' | 'bush';
}

export function createTreePlacements(grid: number[][]): TreePlacement[] {
  const trees: TreePlacement[] = [];

  const isGrassCell = (px: number, py: number): boolean => {
    const cx = Math.floor(px / TILE_SIZE);
    const cy = Math.floor(py / TILE_SIZE);
    const tile = grid[cy]?.[cx];
    return tile === TileId.grassA || tile === TileId.grassB || tile === TileId.grassC;
  };

  const tryAdd = (cx: number, cy: number, density: number, salt: number): void => {
    if (hash(cx, cy, salt) >= density) {
      return;
    }

    const x = Math.round(cx * TILE_SIZE + 8 + (hash(cx, cy, salt + 1) - 0.5) * 20);
    const y = Math.round(cy * TILE_SIZE + 8 + (hash(cx, cy, salt + 2) - 0.5) * 16);

    // 나무 밑동과 캐노피 자리가 모두 풀밭이어야 심는다.
    if (!isGrassCell(x, y) || !isGrassCell(x, y - TILE_SIZE)) {
      return;
    }

    if (insideVillageClearing(x, y, 44)) {
      return;
    }

    for (const entrance of DUNGEON_ENTRANCES) {
      if (Math.hypot(x - entrance.x, y - entrance.y) < 72) {
        return;
      }
    }

    if (Math.hypot(x - PLAYER_START.x, y - PLAYER_START.y) < 56) {
      return;
    }

    trees.push({ x, y, kind: hash(cx, cy, salt + 3) < 0.72 ? 'oak' : 'bush' });
  };

  // 서쪽 숲: 촘촘하게
  for (let cy = 6; cy <= 44; cy += 2) {
    for (let cx = 4; cx <= 26; cx += 2) {
      tryAdd(cx, cy, 0.58, 10);
    }
  }

  // 대륙 곳곳: 드문드문
  for (let cy = 5; cy <= 45; cy += 4) {
    for (let cx = 28; cx <= 85; cx += 4) {
      tryAdd(cx, cy, 0.16, 20);
    }
  }

  return trees;
}

export interface DecorPlacement extends OverworldPoint {
  kind: 'flower' | 'tuft';
}

export function createDecorPlacements(grid: number[][]): DecorPlacement[] {
  const decor: DecorPlacement[] = [];

  for (let cy = 4; cy <= 46; cy += 3) {
    for (let cx = 4; cx <= 85; cx += 3) {
      const noise = hash(cx, cy, 30);

      if (noise >= 0.34) {
        continue;
      }

      const tile = grid[cy][cx];

      if (tile !== TileId.grassA && tile !== TileId.grassB && tile !== TileId.grassC) {
        continue;
      }

      const x = Math.round(cx * TILE_SIZE + 8 + (hash(cx, cy, 31) - 0.5) * 14);
      const y = Math.round(cy * TILE_SIZE + 8 + (hash(cx, cy, 32) - 0.5) * 12);
      decor.push({ x, y, kind: noise < 0.1 ? 'flower' : 'tuft' });
    }
  }

  return decor;
}

export const ROCK_POSITIONS: readonly OverworldPoint[] = [
  { x: 1108, y: 236 },
  { x: 1246, y: 168 },
  { x: 1032, y: 452 },
  { x: 1310, y: 706 },
  { x: 498, y: 214 },
  { x: 560, y: 636 },
];

// 대륙 안쪽(바다 제외)의 물 타일을 가로 줄 단위로 합쳐 충돌 사각형을 만든다.
export function createWaterColliderRects(grid: number[][]): OverworldRect[] {
  const rects: OverworldRect[] = [];

  for (let cy = OCEAN_CELLS; cy < GRID_HEIGHT - OCEAN_CELLS; cy += 1) {
    let runStart = -1;

    for (let cx = OCEAN_CELLS; cx <= GRID_WIDTH - OCEAN_CELLS; cx += 1) {
      const isWater = cx < GRID_WIDTH - OCEAN_CELLS && grid[cy][cx] === TileId.water;

      if (isWater && runStart < 0) {
        runStart = cx;
      } else if (!isWater && runStart >= 0) {
        rects.push({
          x: runStart * TILE_SIZE,
          y: cy * TILE_SIZE,
          width: (cx - runStart) * TILE_SIZE,
          height: TILE_SIZE,
        });
        runStart = -1;
      }
    }
  }

  return rects;
}
