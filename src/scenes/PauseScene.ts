import Phaser from 'phaser';
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, RENDER_SCALE } from '../config/gameConfig';
import { getLocale, koreanFontStack, t, toggleLocale } from '../i18n';
import {
  getGameSettings,
  nextEffectsVolume,
  nextRenderQuality,
  nextScreenShake,
  updateGameSettings,
} from '../systems/GameSettings';
import { applyRenderScale } from '../utils/render';

type PauseMode = 'main' | 'settings';
type PauseAction =
  | 'continue'
  | 'settings'
  | 'fullscreen'
  | 'title'
  | 'language'
  | 'sound'
  | 'volume'
  | 'shake'
  | 'quality'
  | 'back';

interface PauseItem {
  label: string;
  action: PauseAction;
}

export class PauseScene extends Phaser.Scene {
  private mode: PauseMode = 'main';
  private selectedIndex = 0;
  private items: PauseItem[] = [];
  private itemTexts: Phaser.GameObjects.Text[] = [];
  private menuContainer?: Phaser.GameObjects.Container;
  private hintText?: Phaser.GameObjects.Text;
  private upKeys: Phaser.Input.Keyboard.Key[] = [];
  private downKeys: Phaser.Input.Keyboard.Key[] = [];
  private confirmKeys: Phaser.Input.Keyboard.Key[] = [];
  private escapeKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super('PauseScene');
  }

  create(): void {
    applyRenderScale(this);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x04070b, 0.82)
      .setDepth(DEPTH.ui + 20);
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 570, 470, 0x0a1119, 0.96)
      .setStrokeStyle(3, 0x56dce5, 0.75)
      .setDepth(DEPTH.ui + 21);
    this.add
      .text(GAME_WIDTH / 2, 126, t('pause.title'), {
        fontFamily: koreanFontStack(),
        fontSize: '46px',
        fontStyle: 'bold',
        color: '#dfffff',
        stroke: '#071116',
        strokeThickness: 8,
        resolution: RENDER_SCALE,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.ui + 22);

    this.hintText = this.add
      .text(GAME_WIDTH / 2, 530, '', {
        fontFamily: koreanFontStack(),
        fontSize: '14px',
        color: '#ffd783',
        stroke: '#071116',
        strokeThickness: 4,
        resolution: RENDER_SCALE,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.ui + 22);

    this.createControls();
    this.renderMenu('main');
  }

  update(): void {
    if (this.escapeKey && Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      if (this.mode === 'settings') {
        this.renderMenu('main');
      } else {
        this.resumeGame();
      }
      return;
    }

    if (this.upKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex - 1, 0, this.items.length);
      this.refreshSelection();
    }

    if (this.downKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + 1, 0, this.items.length);
      this.refreshSelection();
    }

    if (this.confirmKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.activateSelection();
    }
  }

  private createControls(): void {
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      return;
    }

    this.upKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    ];
    this.downKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    ];
    this.confirmKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    ];
    this.escapeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private renderMenu(mode: PauseMode): void {
    this.mode = mode;
    this.selectedIndex = 0;
    this.menuContainer?.destroy(true);
    this.menuContainer = this.add.container(GAME_WIDTH / 2, mode === 'main' ? 238 : 194);
    this.menuContainer.setDepth(DEPTH.ui + 22);
    this.items = this.buildItems(mode);
    this.itemTexts = [];
    this.hintText?.setText('');

    this.items.forEach((item, index) => {
      const text = this.add
        .text(0, index * 48, item.label, {
          fontFamily: koreanFontStack(),
          fontSize: mode === 'main' ? '25px' : '20px',
          fontStyle: 'bold',
          color: '#f5fbff',
          stroke: '#071116',
          strokeThickness: 6,
          resolution: RENDER_SCALE,
        })
        .setOrigin(0.5)
        .setPadding(22, 7, 22, 7)
        .setInteractive({ useHandCursor: true });

      text.on('pointerover', () => {
        this.selectedIndex = index;
        this.refreshSelection();
      });
      text.on('pointerdown', () => this.activateSelection());
      this.menuContainer?.add(text);
      this.itemTexts.push(text);
    });

    this.refreshSelection();
  }

  private buildItems(mode: PauseMode): PauseItem[] {
    if (mode === 'main') {
      return [
        { label: t('pause.continue'), action: 'continue' },
        { label: t('pause.settings'), action: 'settings' },
        { label: t('pause.fullscreen'), action: 'fullscreen' },
        { label: t('pause.titleScreen'), action: 'title' },
      ];
    }

    const settings = getGameSettings();
    return [
      {
        label: `${t('settings.language')}: ${getLocale() === 'ko' ? t('messages.localeKo') : t('messages.localeEn')}`,
        action: 'language',
      },
      {
        label: `${t('settings.sound')}: ${t(settings.soundEnabled ? 'settings.soundOn' : 'settings.soundOff')}`,
        action: 'sound',
      },
      {
        label: `${t('settings.volume')}: ${Math.round(settings.effectsVolume * 100)}%`,
        action: 'volume',
      },
      {
        label: `${t('settings.screenShake')}: ${Math.round(settings.screenShake * 100)}%`,
        action: 'shake',
      },
      {
        label: `${t('settings.renderQuality')}: ${t(`settings.${settings.renderQuality}`)}`,
        action: 'quality',
      },
      { label: t('menu.back'), action: 'back' },
    ];
  }

  private activateSelection(): void {
    const action = this.items[this.selectedIndex]?.action;
    const showRestartHint = action === 'quality';

    if (action === 'continue') {
      this.resumeGame();
      return;
    }

    if (action === 'settings') {
      this.renderMenu('settings');
      return;
    }

    if (action === 'fullscreen') {
      this.toggleFullscreen();
      return;
    }

    if (action === 'title') {
      this.scene.stop('GameScene');
      this.scene.start('TitleScene');
      return;
    }

    if (action === 'language') {
      toggleLocale();
    } else if (action === 'sound') {
      updateGameSettings({ soundEnabled: !getGameSettings().soundEnabled });
    } else if (action === 'volume') {
      updateGameSettings({ effectsVolume: nextEffectsVolume(getGameSettings().effectsVolume) });
    } else if (action === 'shake') {
      updateGameSettings({ screenShake: nextScreenShake(getGameSettings().screenShake) });
    } else if (action === 'quality') {
      updateGameSettings({
        renderQuality: nextRenderQuality(getGameSettings().renderQuality),
      });
    } else if (action === 'back') {
      this.renderMenu('main');
      return;
    }

    this.renderMenu('settings');

    if (showRestartHint) {
      this.hintText?.setText(t('settings.nextLaunch'));
    }
  }

  private refreshSelection(): void {
    this.items = this.buildItems(this.mode);
    this.itemTexts.forEach((text, index) => {
      const selected = index === this.selectedIndex;
      text.setText(this.items[index]?.label ?? '');
      text.setColor(selected ? '#ffe099' : '#f5fbff');
      text.setBackgroundColor(selected ? '#173743' : '#00000000');
      text.setScale(selected ? 1.05 : 1);
      text.setAlpha(selected ? 1 : 0.72);
    });
  }

  private toggleFullscreen(): void {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      void this.scale.startFullscreen();
    }
  }

  private resumeGame(): void {
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}
