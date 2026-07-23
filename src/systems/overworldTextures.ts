import Phaser from 'phaser';
import { PixelSprite } from './enemyPixelSprites';
import { TILE_SIZE } from '../data/overworld';

// 오버월드 전용 픽셀아트 텍스처. 16px 타일 7종을 하나의 타일셋 띠로 만들고,
// 나무·바위 등 오브젝트는 32px급 픽셀 스프라이트로 생성한다. 모든 그림은
// 픽셀 격자에 맞춰 그려 나중에 손으로 찍은 도트 PNG로 교체하기 쉽게 한다.

export const OverworldTextures = {
  tileset: 'overworld-tileset',
  oak: 'overworld-oak',
  bush: 'overworld-bush',
  rock: 'overworld-rock',
  flower: 'overworld-flower',
  tuft: 'overworld-tuft',
  cave: 'overworld-cave',
  sign: 'overworld-sign',
  flag: 'overworld-flag',
} as const;

export function createOverworldTextures(scene: Phaser.Scene): void {
  createTileset(scene);
  createOak(scene);
  createBush(scene);
  createRock(scene);
  createFlower(scene);
  createTuft(scene);
  createCave(scene);
  createSign(scene);
  createFlag(scene);
}

type Dot = readonly [number, number];

function drawTile(
  graphics: Phaser.GameObjects.Graphics,
  index: number,
  base: number,
  layers: readonly { color: number; dots: readonly Dot[]; width?: number; height?: number }[],
): void {
  const offsetX = index * TILE_SIZE;
  graphics.fillStyle(base, 1);
  graphics.fillRect(offsetX, 0, TILE_SIZE, TILE_SIZE);

  for (const layer of layers) {
    graphics.fillStyle(layer.color, 1);

    for (const [x, y] of layer.dots) {
      graphics.fillRect(offsetX + x, y, layer.width ?? 1, layer.height ?? 1);
    }
  }
}

function createTileset(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.tileset)) {
    return;
  }

  const graphics = scene.add.graphics();

  // 0-2: 풀밭 변형 3종 — 어두운 점과 밝은 풀잎으로 미묘하게 다르게
  drawTile(graphics, 0, 0x4c8a4f, [
    {
      color: 0x417a45,
      dots: [
        [2, 3],
        [9, 7],
        [13, 2],
        [5, 12],
        [11, 13],
      ],
    },
    {
      color: 0x5c9c5e,
      dots: [
        [4, 4],
        [12, 9],
        [7, 11],
      ],
      height: 2,
    },
  ]);
  drawTile(graphics, 1, 0x4c8a4f, [
    {
      color: 0x417a45,
      dots: [
        [3, 9],
        [8, 2],
        [14, 11],
        [6, 6],
      ],
    },
    { color: 0x417a45, dots: [[7, 14]], width: 2 },
    {
      color: 0x5c9c5e,
      dots: [
        [10, 4],
        [2, 13],
        [13, 6],
      ],
      height: 2,
    },
  ]);
  drawTile(graphics, 2, 0x488249, [
    {
      color: 0x3d7341,
      dots: [
        [4, 5],
        [11, 3],
        [8, 10],
        [14, 14],
        [2, 8],
      ],
    },
    {
      color: 0x589858,
      dots: [
        [6, 2],
        [12, 12],
      ],
      height: 2,
    },
  ]);

  // 3: 흙길
  drawTile(graphics, 3, 0x8a6a44, [
    {
      color: 0x76573a,
      dots: [
        [2, 2],
        [10, 5],
        [5, 11],
        [12, 12],
      ],
      width: 2,
      height: 2,
    },
    {
      color: 0x9e7f55,
      dots: [
        [7, 3],
        [3, 8],
        [13, 9],
        [9, 14],
      ],
    },
    { color: 0x5d4530, dots: [[8, 8]] },
  ]);

  // 4: 모래사장
  drawTile(graphics, 4, 0xd8c489, [
    {
      color: 0xc4ae74,
      dots: [
        [3, 4],
        [9, 2],
        [13, 8],
        [5, 10],
        [11, 13],
      ],
    },
    {
      color: 0xe8d9a4,
      dots: [
        [7, 6],
        [2, 12],
        [14, 3],
      ],
    },
  ]);

  // 5: 물 — 어두운 결과 밝은 물결
  drawTile(graphics, 5, 0x2b6b9c, [
    {
      color: 0x235a85,
      dots: [
        [2, 10],
        [10, 4],
      ],
      width: 5,
    },
    {
      color: 0x5fa3cf,
      dots: [
        [4, 3],
        [11, 9],
        [1, 14],
      ],
      width: 4,
    },
    {
      color: 0x8fc4e4,
      dots: [
        [5, 3],
        [12, 9],
      ],
    },
  ]);

  // 6: 다리 판자
  drawTile(graphics, 6, 0x9a7848, [
    {
      color: 0x7c5c36,
      dots: [
        [0, 0],
        [0, 15],
      ],
      width: 16,
    },
    {
      color: 0x744f2c,
      dots: [
        [5, 0],
        [11, 0],
      ],
      height: 16,
    },
    {
      color: 0x87683c,
      dots: [
        [2, 4],
        [8, 9],
        [13, 3],
        [3, 12],
        [9, 13],
      ],
    },
  ]);

  graphics.generateTexture(OverworldTextures.tileset, TILE_SIZE * 7, TILE_SIZE);
  graphics.destroy();
}

function createOak(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.oak)) {
    return;
  }

  const sprite = new PixelSprite(40);
  sprite.disc(19.5, 14, 12, { shade: 0x2c5d33, base: 0x3f7d46, light: 0x5c9e5d });
  sprite.disc(11, 18, 7, { shade: 0x2c5d33, base: 0x3a7642, light: 0x549655 });

  for (let y = 25; y <= 36; y += 1) {
    for (let x = 17; x <= 19; x += 1) {
      sprite.set(x, y, x === 17 ? 0x4a3019 : 0x5f4126);
    }
  }

  sprite.set(16, 36, 0x4a3019);
  sprite.outline(0x1b3a22);
  sprite.set(14, 8, 0x74b573);
  sprite.set(15, 8, 0x74b573);
  sprite.set(13, 12, 0x74b573);
  sprite.set(17, 10, 0x74b573);
  sprite.mirror();
  sprite.generateTexture(scene, OverworldTextures.oak, 1);
}

function createBush(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.bush)) {
    return;
  }

  const sprite = new PixelSprite(32);
  sprite.disc(15.5, 13, 9.5, { shade: 0x275a44, base: 0x367a55, light: 0x51a06f });
  sprite.disc(15.5, 19, 7, { shade: 0x255440, base: 0x336f4e, light: 0x4b9364 });

  for (let y = 25; y <= 29; y += 1) {
    for (let x = 14; x <= 15; x += 1) {
      sprite.set(x, y, x === 14 ? 0x4a3019 : 0x5f4126);
    }
  }

  sprite.outline(0x17372a);
  sprite.set(11, 9, 0x6fbc8a);
  sprite.set(12, 9, 0x6fbc8a);
  sprite.set(10, 14, 0xd8b74a);
  sprite.set(13, 18, 0xd8b74a);
  sprite.mirror();
  sprite.generateTexture(scene, OverworldTextures.bush, 1);
}

function createRock(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.rock)) {
    return;
  }

  const sprite = new PixelSprite(16);
  sprite.disc(7.5, 9, 5.5, { shade: 0x50505a, base: 0x6a6a74, light: 0x82828c });
  sprite.outline(0x2c2c34);
  sprite.set(6, 8, 0x44444e);
  sprite.set(6, 9, 0x44444e);
  sprite.set(5, 6, 0x94949e);
  sprite.mirror();
  sprite.generateTexture(scene, OverworldTextures.rock, 1);
}

function createFlower(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.flower)) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(0x3f7d46, 1);
  graphics.fillRect(3, 4, 1, 3);
  graphics.fillStyle(0xf0ead8, 1);
  graphics.fillRect(2, 1, 1, 1);
  graphics.fillRect(4, 1, 1, 1);
  graphics.fillRect(2, 3, 1, 1);
  graphics.fillRect(4, 3, 1, 1);
  graphics.fillStyle(0xd8b74a, 1);
  graphics.fillRect(3, 2, 1, 1);
  graphics.generateTexture(OverworldTextures.flower, 8, 8);
  graphics.destroy();
}

function createTuft(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.tuft)) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(0x5c9c5e, 1);
  graphics.fillRect(1, 3, 1, 4);
  graphics.fillRect(4, 1, 1, 6);
  graphics.fillRect(7, 3, 1, 4);
  graphics.fillStyle(0x4c8a4f, 1);
  graphics.fillRect(2, 4, 1, 3);
  graphics.fillRect(6, 4, 1, 3);
  graphics.generateTexture(OverworldTextures.tuft, 10, 8);
  graphics.destroy();
}

function createCave(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.cave)) {
    return;
  }

  const graphics = scene.add.graphics();

  // 계단식 바위 언덕 (외곽선 → 본체 → 명암 순서로 겹쳐 그린다)
  const steps: readonly [number, number][] = [
    [6, 10],
    [8, 14],
    [10, 17],
    [12, 19],
    [14, 20],
    [16, 21],
    [20, 22],
    [26, 23],
    [32, 24],
  ];

  graphics.fillStyle(0x23232c, 1);
  for (const [y, half] of steps) {
    graphics.fillRect(24 - half - 1, y - 1, half * 2 + 2, 48 - y + 1);
  }

  graphics.fillStyle(0x565662, 1);
  for (const [y, half] of steps) {
    graphics.fillRect(24 - half, y, half * 2, 47 - y);
  }

  graphics.fillStyle(0x6a6a76, 1);
  graphics.fillRect(14, 8, 14, 4);
  graphics.fillRect(10, 12, 10, 3);
  graphics.fillStyle(0x474751, 1);
  graphics.fillRect(2, 34, 44, 12);
  graphics.fillRect(4, 28, 8, 6);
  graphics.fillRect(36, 26, 9, 8);

  // 입구 (검은 아치)
  graphics.fillStyle(0x0a0a10, 1);
  graphics.fillRect(15, 26, 18, 21);
  graphics.fillRect(17, 22, 14, 4);
  graphics.fillRect(19, 20, 10, 2);
  graphics.fillStyle(0x05050a, 1);
  graphics.fillRect(18, 28, 12, 19);
  graphics.fillStyle(0x7c7c88, 1);
  graphics.fillRect(17, 19, 4, 1);
  graphics.fillRect(27, 19, 4, 1);

  // 밑동의 작은 돌들
  graphics.fillStyle(0x44444e, 1);
  graphics.fillRect(6, 44, 5, 3);
  graphics.fillRect(38, 43, 6, 4);
  graphics.fillStyle(0x6a6a76, 1);
  graphics.fillRect(7, 44, 2, 1);
  graphics.fillRect(39, 43, 2, 1);

  graphics.generateTexture(OverworldTextures.cave, 48, 48);
  graphics.destroy();
}

function createSign(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.sign)) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(0x3a2716, 1);
  graphics.fillRect(7, 9, 5, 16);
  graphics.fillStyle(0x6f4f2e, 1);
  graphics.fillRect(8, 10, 3, 14);
  graphics.fillStyle(0x3a2716, 1);
  graphics.fillRect(1, 3, 17, 9);
  graphics.fillStyle(0x9a7848, 1);
  graphics.fillRect(2, 4, 15, 7);
  graphics.fillStyle(0x7c5c36, 1);
  graphics.fillRect(4, 6, 11, 1);
  graphics.fillRect(4, 8, 8, 1);
  graphics.fillStyle(0x3a2716, 1);
  graphics.fillRect(3, 5, 1, 1);
  graphics.fillRect(15, 5, 1, 1);
  graphics.generateTexture(OverworldTextures.sign, 20, 26);
  graphics.destroy();
}

function createFlag(scene: Phaser.Scene): void {
  if (scene.textures.exists(OverworldTextures.flag)) {
    return;
  }

  const graphics = scene.add.graphics();
  graphics.fillStyle(0x3a2716, 1);
  graphics.fillRect(2, 1, 4, 28);
  graphics.fillStyle(0x8a6d3b, 1);
  graphics.fillRect(3, 2, 2, 26);
  graphics.fillStyle(0xb08b32, 1);
  graphics.fillRect(6, 3, 13, 4);
  graphics.fillRect(6, 7, 10, 3);
  graphics.fillRect(6, 10, 6, 2);
  graphics.fillStyle(0xd8b74a, 1);
  graphics.fillRect(6, 4, 12, 3);
  graphics.fillRect(6, 7, 8, 2);
  graphics.generateTexture(OverworldTextures.flag, 22, 30);
  graphics.destroy();
}
