import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, RENDER_SCALE } from '../config/gameConfig';
import { excludeCamera, includeCamera } from '../utils/cameraFilter';

export type UiObjectRegistrar = <T extends Phaser.GameObjects.GameObject>(gameObject: T) => T;

/**
 * Renders registered HUD objects with a camera that never receives gameplay shake.
 * New game objects are hidden from this camera by default, so bullets and effects
 * created later cannot accidentally be rendered a second time over the HUD.
 */
export class UiCameraSystem {
  private readonly scene: Phaser.Scene;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;

  readonly register: UiObjectRegistrar = <T extends Phaser.GameObjects.GameObject>(
    gameObject: T,
  ): T => {
    gameObject.cameraFilter = excludeCamera(gameObject.cameraFilter, this.scene.cameras.main.id);
    gameObject.cameraFilter = includeCamera(gameObject.cameraFilter, this.camera.id);
    return gameObject;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.add(
      0,
      0,
      scene.cameras.main.width,
      scene.cameras.main.height,
      false,
      'UiCamera',
    );
    this.camera.setZoom(RENDER_SCALE);
    this.camera.setRoundPixels(true);
    this.camera.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    scene.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, this.hideNewObjectFromUi, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private readonly hideNewObjectFromUi = (gameObject: Phaser.GameObjects.GameObject): void => {
    gameObject.cameraFilter = excludeCamera(gameObject.cameraFilter, this.camera.id);
  };

  private shutdown(): void {
    this.scene.events.off(Phaser.Scenes.Events.ADDED_TO_SCENE, this.hideNewObjectFromUi, this);
  }
}
