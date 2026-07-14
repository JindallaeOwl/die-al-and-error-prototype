import Phaser from 'phaser';
import { createPlaceholderAnimations, createPlaceholderTextures } from '../systems/AssetFactory';
import { applyRenderScale } from '../utils/render';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    applyRenderScale(this);
    createPlaceholderTextures(this);
    createPlaceholderAnimations(this);
    this.scene.start('TitleScene');
  }
}
