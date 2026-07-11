import type Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, RENDER_SCALE } from '../config/gameConfig';

// Phaser's camera zoom keeps the viewport pixel size as its centering basis
// rather than the zoomed world size, so a plain setZoom() leaves the camera
// looking at the bottom-right quadrant of the 960x640 world. Re-centering
// after zooming keeps the full GAME_WIDTH/HEIGHT world in view.
export function applyRenderScale(scene: Phaser.Scene): void {
  scene.cameras.main.setZoom(RENDER_SCALE);
  scene.cameras.main.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);
}
