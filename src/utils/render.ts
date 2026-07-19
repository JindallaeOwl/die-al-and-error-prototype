import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../config/gameConfig';
import { getRenderScale } from '../systems/GameSettings';

// The camera zoom maps each 480x272 gameplay pixel to render-scale physical
// pixels. Re-centering keeps the logical pixel-art canvas aligned after zoom.
export function applyRenderScale(scene: Phaser.Scene): void {
  applyRenderScaleToScene(scene, getRenderScale());
}

export function applyCurrentRenderScaleToGame(scene: Phaser.Scene): void {
  applyRenderScaleToGame(scene, getRenderScale());
}

export function applyRenderScaleToGame(scene: Phaser.Scene, scale: number): void {
  const width = GAME_WIDTH * scale;
  const height = GAME_HEIGHT * scale;

  scene.scale.resize(width, height);

  for (const managedScene of scene.game.scene.getScenes(false)) {
    if (managedScene.sys.isActive() || managedScene.sys.isPaused()) {
      applyRenderScaleToScene(managedScene, scale);
    }
  }
}

function applyRenderScaleToScene(scene: Phaser.Scene, scale: number): void {
  const width = GAME_WIDTH * scale;
  const height = GAME_HEIGHT * scale;

  for (const camera of scene.cameras.cameras) {
    camera.setViewport(0, 0, width, height);
    camera.setZoom(scale);
    camera.setRoundPixels(true);
    camera.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  }

  for (const child of scene.children.list) {
    updateTextResolution(child, scale);
  }
}

function updateTextResolution(gameObject: Phaser.GameObjects.GameObject, scale: number): void {
  if (gameObject.type === 'Text') {
    (gameObject as Phaser.GameObjects.Text).setResolution(scale);
  }

  if (gameObject.type === 'Container') {
    for (const child of (gameObject as Phaser.GameObjects.Container).list) {
      updateTextResolution(child, scale);
    }
  }
}

export interface FitViewport {
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  letterboxX: number;
  letterboxY: number;
}

export function calculateFitViewport(displayWidth: number, displayHeight: number): FitViewport {
  const scale = Math.min(displayWidth / GAME_WIDTH, displayHeight / GAME_HEIGHT);
  const renderedWidth = GAME_WIDTH * scale;
  const renderedHeight = GAME_HEIGHT * scale;

  return {
    scale,
    renderedWidth,
    renderedHeight,
    letterboxX: Math.max(0, (displayWidth - renderedWidth) / 2),
    letterboxY: Math.max(0, (displayHeight - renderedHeight) / 2),
  };
}
