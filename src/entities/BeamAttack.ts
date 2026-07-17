import Phaser from 'phaser';
import { BEAM_TUNING, DEPTH } from '../config/gameConfig';
import { distanceToSegmentSquared, type AttackDirection } from '../utils/attackDirections';

export class BeamAttack extends Phaser.GameObjects.Rectangle {
  readonly damage: number;

  private readonly bornAt: number;
  private readonly startPoint: AttackDirection;
  private readonly endPoint: AttackDirection;
  private readonly damagedAt = new WeakMap<object, number>();
  private core?: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    direction: AttackDirection,
    range: number,
    damage: number,
  ) {
    const magnitude = Math.hypot(direction.x, direction.y) || 1;
    const unitDirection = {
      x: direction.x / magnitude,
      y: direction.y / magnitude,
    };
    const startPoint = {
      x: x + unitDirection.x * 12,
      y: y + unitDirection.y * 12,
    };
    const endPoint = {
      x: startPoint.x + unitDirection.x * range,
      y: startPoint.y + unitDirection.y * range,
    };
    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerY = (startPoint.y + endPoint.y) / 2;
    const angle = Math.atan2(unitDirection.y, unitDirection.x);

    super(scene, centerX, centerY, range, BEAM_TUNING.width, 0xff7af2, 0.42);
    this.damage = damage;
    this.bornAt = scene.time.now;
    this.startPoint = startPoint;
    this.endPoint = endPoint;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(DEPTH.effect).setRotation(angle);
    this.setStrokeStyle(2, 0xf7f3e8, 0.72);

    this.core = scene.add
      .rectangle(centerX, centerY, range, 4, 0xfff4ff, 0.68)
      .setRotation(angle)
      .setDepth(DEPTH.effect + 1);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  update(time: number): void {
    if (time - this.bornAt > BEAM_TUNING.durationMs) {
      this.destroy();
    }
  }

  canDamage(target: object, time: number): boolean {
    const lastHitAt = this.damagedAt.get(target) ?? -Infinity;

    if (time - lastHitAt < BEAM_TUNING.tickMs) {
      return false;
    }

    this.damagedAt.set(target, time);
    return true;
  }

  intersectsCircle(x: number, y: number, radius: number): boolean {
    const hitRadius = BEAM_TUNING.width / 2 + Math.max(0, radius);

    return (
      distanceToSegmentSquared({ x, y }, this.startPoint, this.endPoint) <= hitRadius * hitRadius
    );
  }

  override destroy(fromScene?: boolean): void {
    this.core?.destroy(fromScene);
    this.core = undefined;
    super.destroy(fromScene);
  }
}
