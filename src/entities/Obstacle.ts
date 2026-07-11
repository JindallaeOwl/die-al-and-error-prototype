import Phaser from 'phaser';
import { TextureKeys } from '../config/assets';
import { DEPTH, OBSTACLE_TUNING } from '../config/gameConfig';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private hp = OBSTACLE_TUNING.maxHealth;
  private destroyQueued = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, TextureKeys.obstacleCrate);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(DEPTH.item);
  }

  takeDamage(amount: number): boolean {
    if (!this.active || this.destroyQueued) {
      return false;
    }

    this.hp -= amount;

    if (this.hp <= 0) {
      return this.destroyObstacle();
    }

    this.setTint(OBSTACLE_TUNING.hitTint);
    this.scene.time.delayedCall(OBSTACLE_TUNING.hitFlashMs, () => {
      if (this.active) {
        this.clearTint();
      }
    });

    return false;
  }

  destroyByBomb(): boolean {
    return this.destroyObstacle();
  }

  private destroyObstacle(): boolean {
    if (!this.active || this.destroyQueued) {
      return false;
    }

    this.destroyQueued = true;
    this.setActive(false);
    this.setVisible(false);

    const body = this.body as Phaser.Physics.Arcade.StaticBody | undefined;

    if (body) {
      body.enable = false;
    }

    this.scene.time.delayedCall(0, () => {
      if (this.scene) {
        this.destroy();
      }
    });

    return true;
  }
}
