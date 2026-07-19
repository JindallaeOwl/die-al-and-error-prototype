import Phaser from 'phaser';
import { DEPTH } from '../config/gameConfig';
import { getRenderScale } from '../systems/GameSettings';
import { gameFontStack } from '../i18n';

const BUBBLE_WIDTH = 112;
const BUBBLE_HEIGHT = 22;
const BUBBLE_VISIBLE_MS = 2100;

export function createShopNpcSpeechBubble(
  scene: Phaser.Scene,
  x: number,
  y: number,
  message: string,
): Phaser.GameObjects.Container {
  const bubble = scene.add
    .container(x, y + 2)
    .setDepth(DEPTH.actor + 2)
    .setAlpha(0)
    .setScale(0.92);
  const background = scene.add.graphics();
  background.fillStyle(0xf7f0d8, 0.96);
  background.lineStyle(1, 0x3a2a20, 1);
  background.fillRoundedRect(-BUBBLE_WIDTH / 2, -BUBBLE_HEIGHT / 2, BUBBLE_WIDTH, BUBBLE_HEIGHT, 4);
  background.strokeRoundedRect(
    -BUBBLE_WIDTH / 2,
    -BUBBLE_HEIGHT / 2,
    BUBBLE_WIDTH,
    BUBBLE_HEIGHT,
    4,
  );
  background.fillStyle(0xf7f0d8, 0.96);
  background.fillTriangle(-4, BUBBLE_HEIGHT / 2, 4, BUBBLE_HEIGHT / 2, 0, BUBBLE_HEIGHT / 2 + 6);
  background.lineStyle(1, 0x3a2a20, 1);
  background.lineBetween(-4, BUBBLE_HEIGHT / 2, 0, BUBBLE_HEIGHT / 2 + 6);
  background.lineBetween(0, BUBBLE_HEIGHT / 2 + 6, 4, BUBBLE_HEIGHT / 2);

  const label = scene.add
    .text(0, -1, message, {
      fontFamily: gameFontStack(),
      fontSize: '7px',
      color: '#2b211b',
      resolution: getRenderScale(),
    })
    .setOrigin(0.5);

  bubble.add([background, label]);
  scene.tweens.add({
    targets: bubble,
    y,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    duration: 170,
    ease: 'Back.easeOut',
    onComplete: () => {
      scene.time.delayedCall(BUBBLE_VISIBLE_MS, () => {
        if (!bubble.active) {
          return;
        }

        scene.tweens.add({
          targets: bubble,
          y: y - 3,
          alpha: 0,
          duration: 220,
          ease: 'Sine.easeIn',
          onComplete: () => bubble.destroy(true),
        });
      });
    },
  });

  return bubble;
}
