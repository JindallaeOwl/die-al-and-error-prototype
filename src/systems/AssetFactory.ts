import Phaser from 'phaser';
import { itemIconKey, TextureKeys } from '../config/assets';
import { PASSIVE_ITEMS } from '../data/items';

export function createPlaceholderTextures(scene: Phaser.Scene): void {
  createPlayerTexture(scene, TextureKeys.player, 0x6ff5ff, 0x12343d);
  createPlayerTexture(scene, TextureKeys.playerHit, 0xffffff, 0xff6b6b);
  createCircleTexture(scene, TextureKeys.playerBullet, 6, 0xc7fff4, 0x1e7e73);
  createCircleTexture(scene, TextureKeys.enemyBullet, 7, 0xffb347, 0x7a3322);
  createCircleTexture(scene, TextureKeys.enemyChaser, 17, 0xff5d7d, 0x551827);
  createDiamondTexture(scene, TextureKeys.enemyShooter, 36, 0xffcf5a, 0x553b13);
  createTriangleTexture(scene, TextureKeys.enemyDasher, 38, 0xb58cff, 0x352363);
  createBossTexture(scene);
  createDoorTexture(scene, TextureKeys.doorHorizontal, 86, 24);
  createDoorTexture(scene, TextureKeys.doorVertical, 24, 86);
  createPassiveItemIcons(scene);
  createKeyTexture(scene);
  createBombTexture(scene);
  createCoinTexture(scene);
  createChestTexture(scene);
  createFloorTile(scene);
  createWallTexture(scene);
  createObstacleTexture(scene);
}

function createPlayerTexture(scene: Phaser.Scene, key: string, fill: number, stroke: number): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(fill, 1);
  graphics.fillCircle(18, 18, 16);
  graphics.fillStyle(stroke, 1);
  graphics.fillCircle(24, 14, 4);
  graphics.lineStyle(3, 0xffffff, 0.6);
  graphics.strokeCircle(18, 18, 16);
  graphics.generateTexture(key, 36, 36);
  graphics.destroy();
}

function createCircleTexture(
  scene: Phaser.Scene,
  key: string,
  radius: number,
  fill: number,
  stroke: number,
): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(fill, 1);
  graphics.fillCircle(radius, radius, radius - 1);
  graphics.lineStyle(2, stroke, 1);
  graphics.strokeCircle(radius, radius, radius - 2);
  graphics.generateTexture(key, radius * 2, radius * 2);
  graphics.destroy();
}

function createDiamondTexture(
  scene: Phaser.Scene,
  key: string,
  size: number,
  fill: number,
  stroke: number,
): void {
  const half = size / 2;
  const graphics = scene.add.graphics();
  graphics.fillStyle(fill, 1);
  graphics.lineStyle(3, stroke, 1);
  graphics.beginPath();
  graphics.moveTo(half, 2);
  graphics.lineTo(size - 2, half);
  graphics.lineTo(half, size - 2);
  graphics.lineTo(2, half);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

function createTriangleTexture(
  scene: Phaser.Scene,
  key: string,
  size: number,
  fill: number,
  stroke: number,
): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(fill, 1);
  graphics.lineStyle(3, stroke, 1);
  graphics.beginPath();
  graphics.moveTo(size / 2, 3);
  graphics.lineTo(size - 4, size - 4);
  graphics.lineTo(4, size - 4);
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  graphics.generateTexture(key, size, size);
  graphics.destroy();
}

function createBossTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x4f6d7a, 1);
  graphics.lineStyle(5, 0xffd166, 1);
  graphics.fillRoundedRect(4, 4, 68, 68, 10);
  graphics.strokeRoundedRect(4, 4, 68, 68, 10);
  graphics.fillStyle(0x10151c, 1);
  graphics.fillRect(20, 26, 10, 12);
  graphics.fillRect(46, 26, 10, 12);
  graphics.lineStyle(4, 0xff7a90, 1);
  graphics.lineBetween(20, 52, 56, 52);
  graphics.generateTexture(TextureKeys.enemyBoss, 76, 76);
  graphics.destroy();
}

function createDoorTexture(scene: Phaser.Scene, key: string, width: number, height: number): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x2b3038, 1);
  graphics.fillRoundedRect(0, 0, width, height, 5);
  graphics.lineStyle(3, 0xf4d47c, 1);
  graphics.strokeRoundedRect(2, 2, width - 4, height - 4, 5);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

// Placeholder icons: a tinted badge circle plus a shape hinting at the
// item's effect, so pickups read as distinct even before real pixel art
// replaces them (only tint currently distinguishes them, which is hard to
// tell apart at a glance).
function createPassiveItemIcons(scene: Phaser.Scene): void {
  for (const item of PASSIVE_ITEMS) {
    createItemIcon(scene, item.id, item.tint);
  }
}

function createItemIcon(scene: Phaser.Scene, id: string, tint: number): void {
  const symbolColor = 0x10151c;
  const graphics = scene.add.graphics();

  graphics.fillStyle(tint, 1);
  graphics.fillCircle(16, 16, 14);
  graphics.lineStyle(2, symbolColor, 0.5);
  graphics.strokeCircle(16, 16, 14);

  drawItemSymbol(graphics, id, symbolColor, tint);

  graphics.generateTexture(itemIconKey(id), 32, 32);
  graphics.destroy();
}

function drawItemSymbol(
  graphics: Phaser.GameObjects.Graphics,
  id: string,
  color: number,
  tint: number,
): void {
  switch (id) {
    case 'pulse-relay': {
      // fire rate: two small ">" chevrons, rapid-fire cue
      graphics.fillStyle(color, 1);
      graphics.fillTriangle(9, 9, 9, 23, 15, 16);
      graphics.fillTriangle(17, 9, 17, 23, 23, 16);
      break;
    }
    case 'glass-fern': {
      // damage: a single sharp upward shard
      graphics.fillStyle(color, 1);
      graphics.fillTriangle(16, 7, 24, 24, 8, 24);
      break;
    }
    case 'feather-coil': {
      // move speed: one bold forward "play" arrow
      graphics.fillStyle(color, 1);
      graphics.fillTriangle(10, 8, 10, 24, 23, 16);
      break;
    }
    case 'hot-pebble': {
      // range + projectile speed + damage: a small flame
      graphics.fillStyle(color, 1);
      graphics.fillTriangle(16, 8, 22, 22, 10, 22);
      graphics.fillCircle(16, 23, 4);
      break;
    }
    case 'pocket-battery': {
      // health: a medical cross
      graphics.fillStyle(color, 1);
      graphics.fillRect(13, 8, 6, 16);
      graphics.fillRect(8, 13, 16, 6);
      break;
    }
    case 'steady-pin': {
      // fire rate + projectile speed: a steady crosshair
      graphics.lineStyle(2, color, 1);
      graphics.strokeCircle(16, 16, 7);
      graphics.lineBetween(16, 5, 16, 27);
      graphics.lineBetween(5, 16, 27, 16);
      break;
    }
    case 'moon-dial': {
      // luck: a crescent moon (dark circle bitten by a badge-colored one)
      graphics.fillStyle(color, 1);
      graphics.fillCircle(15, 16, 8);
      graphics.fillStyle(tint, 1);
      graphics.fillCircle(19, 13, 8);
      break;
    }
    case 'long-echo': {
      // range: concentric ripples
      graphics.lineStyle(2, color, 1);
      graphics.strokeCircle(16, 16, 4);
      graphics.strokeCircle(16, 16, 8);
      graphics.strokeCircle(16, 16, 12);
      break;
    }
    case 'prism-lance': {
      // charge beam ability: a prism with a beam line through it
      graphics.fillStyle(color, 1);
      graphics.beginPath();
      graphics.moveTo(16, 6);
      graphics.lineTo(25, 16);
      graphics.lineTo(16, 26);
      graphics.lineTo(7, 16);
      graphics.closePath();
      graphics.fillPath();
      graphics.lineStyle(2, tint, 1);
      graphics.lineBetween(9, 16, 23, 16);
      break;
    }
    default: {
      graphics.fillStyle(color, 1);
      graphics.fillCircle(16, 16, 6);
    }
  }
}

function createKeyTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.lineStyle(5, 0x8bd3ff, 1);
  graphics.strokeCircle(12, 16, 7);
  graphics.lineBetween(19, 16, 31, 16);
  graphics.lineBetween(26, 16, 26, 23);
  graphics.lineBetween(31, 16, 31, 21);
  graphics.generateTexture(TextureKeys.keyPickup, 36, 32);
  graphics.destroy();
}

function createBombTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x323946, 1);
  graphics.fillCircle(17, 19, 12);
  graphics.lineStyle(3, 0xff8f70, 1);
  graphics.strokeCircle(17, 19, 11);
  graphics.lineStyle(3, 0xf7f3e8, 1);
  graphics.lineBetween(22, 10, 28, 4);
  graphics.generateTexture(TextureKeys.bombPickup, 36, 36);
  graphics.destroy();
}

function createCoinTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0xffd166, 1);
  graphics.fillCircle(16, 16, 12);
  graphics.lineStyle(3, 0x7d5f1a, 1);
  graphics.strokeCircle(16, 16, 10);
  graphics.lineStyle(2, 0xffffff, 0.65);
  graphics.lineBetween(16, 8, 16, 24);
  graphics.generateTexture(TextureKeys.coinPickup, 32, 32);
  graphics.destroy();
}

function createChestTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x8b5a2b, 1);
  graphics.fillRoundedRect(3, 9, 34, 24, 4);
  graphics.fillStyle(0xd6a15f, 1);
  graphics.fillRect(3, 17, 34, 5);
  graphics.lineStyle(3, 0x2b1b10, 1);
  graphics.strokeRoundedRect(3, 9, 34, 24, 4);
  graphics.fillStyle(0xf7f3e8, 1);
  graphics.fillRect(18, 18, 5, 7);
  graphics.generateTexture(TextureKeys.chestPickup, 40, 40);
  graphics.destroy();
}

function createFloorTile(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x151a22, 1);
  graphics.fillRect(0, 0, 48, 48);
  graphics.lineStyle(1, 0x27313c, 0.55);
  graphics.strokeRect(0, 0, 48, 48);
  graphics.generateTexture(TextureKeys.floorTile, 48, 48);
  graphics.destroy();
}

function createWallTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x303843, 1);
  graphics.fillRect(0, 0, 48, 48);
  graphics.lineStyle(2, 0x1b2027, 1);
  graphics.strokeRect(0, 0, 48, 48);
  graphics.generateTexture(TextureKeys.wall, 48, 48);
  graphics.destroy();
}

function createObstacleTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  graphics.fillStyle(0x6b4a2f, 1);
  graphics.fillRoundedRect(2, 2, 36, 36, 4);
  graphics.lineStyle(3, 0x2b1b10, 1);
  graphics.strokeRoundedRect(2, 2, 36, 36, 4);
  graphics.lineStyle(2, 0x8a6640, 0.8);
  graphics.lineBetween(2, 20, 38, 20);
  graphics.lineBetween(20, 2, 20, 38);
  graphics.generateTexture(TextureKeys.obstacleCrate, 40, 40);
  graphics.destroy();
}
