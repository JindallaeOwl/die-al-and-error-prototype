import Phaser from 'phaser';
import { GAME_WIDTH, RENDER_SCALE } from '../config/gameConfig';
import type { BaseEnemy } from '../entities/enemies/BaseEnemy';
import { koreanFontStack } from '../i18n';

const BAR_WIDTH = 316;

export class BossHud {
  private readonly enemies: Phaser.Physics.Arcade.Group;
  private readonly healthBack: Phaser.GameObjects.Rectangle;
  private readonly healthFill: Phaser.GameObjects.Rectangle;
  private readonly healthText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, enemies: Phaser.Physics.Arcade.Group) {
    this.enemies = enemies;
    this.healthBack = scene.add
      .rectangle(GAME_WIDTH / 2, 28, 320, 12, 0x10151c, 0.86)
      .setOrigin(0.5)
      .setDepth(101)
      .setVisible(false);
    this.healthFill = scene.add
      .rectangle(GAME_WIDTH / 2 - BAR_WIDTH / 2, 28, BAR_WIDTH, 8, 0xd84f66, 1)
      .setOrigin(0, 0.5)
      .setDepth(102)
      .setVisible(false);
    this.healthText = scene.add
      .text(GAME_WIDTH / 2, 48, '', {
        fontFamily: koreanFontStack(),
        fontSize: '13px',
        color: '#ffe39b',
        stroke: '#090b10',
        strokeThickness: 4,
        resolution: RENDER_SCALE,
      })
      .setOrigin(0.5)
      .setDepth(103)
      .setVisible(false);
  }

  update(): void {
    const boss = (this.enemies.getChildren() as BaseEnemy[]).find(
      (enemy) => enemy.active && enemy.isBoss,
    );

    this.setVisible(Boolean(boss));

    if (!boss) {
      return;
    }

    const phaseAwareBoss = boss as BaseEnemy & { isInPhaseTwo?: () => boolean };
    const isPhaseTwo = phaseAwareBoss.isInPhaseTwo?.() ?? false;

    this.healthFill.displayWidth = BAR_WIDTH * boss.getHealthRatio();
    this.healthFill.setFillStyle(boss.getBossBarColor(isPhaseTwo), 1);
    this.healthText.setText(boss.getDisplayName());
    this.healthText.setColor(isPhaseTwo ? '#ffb3c1' : '#ffe39b');
  }

  private setVisible(visible: boolean): void {
    this.healthBack.setVisible(visible);
    this.healthFill.setVisible(visible);
    this.healthText.setVisible(visible);
  }
}
