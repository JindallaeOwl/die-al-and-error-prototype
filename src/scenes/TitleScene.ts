import Phaser from 'phaser';
import { TextureKeys } from '../config/assets';
import { DEPTH, GAME_HEIGHT, GAME_WIDTH, RENDER_SCALE } from '../config/gameConfig';
import { getLocale, koreanFontStack, t, toggleLocale } from '../i18n';
import { AudioSystem } from '../systems/AudioSystem';
import {
  getGameSettings,
  nextEffectsVolume,
  nextRenderQuality,
  nextScreenShake,
  updateGameSettings,
} from '../systems/GameSettings';
import { applyRenderScale } from '../utils/render';

type MenuMode = 'main' | 'settings';
type MenuAction =
  | 'start'
  | 'settings'
  | 'quit'
  | 'language'
  | 'sound'
  | 'volume'
  | 'shake'
  | 'quality'
  | 'fullscreen'
  | 'back';

interface MenuItem {
  label: string;
  action: MenuAction;
}

export class TitleScene extends Phaser.Scene {
  private mode: MenuMode = 'main';
  private selectedIndex = 0;
  private soundEnabled = true;
  private menuItems: MenuItem[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private titleText?: Phaser.GameObjects.Text;
  private subtitleText?: Phaser.GameObjects.Text;
  private hintText?: Phaser.GameObjects.Text;
  private menuContainer?: Phaser.GameObjects.Container;
  private audio?: AudioSystem;

  private upKeys: Phaser.Input.Keyboard.Key[] = [];
  private downKeys: Phaser.Input.Keyboard.Key[] = [];
  private confirmKeys: Phaser.Input.Keyboard.Key[] = [];

  constructor() {
    super('TitleScene');
  }

  create(): void {
    applyRenderScale(this);
    this.audio = new AudioSystem();
    this.soundEnabled = getGameSettings().soundEnabled;
    this.input.once('pointerdown', () => this.audio?.unlock());
    this.input.keyboard?.once('keydown', () => this.audio?.unlock());

    this.add.tileSprite(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      TextureKeys.floorTile,
    );
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 80, GAME_HEIGHT - 64, 0x060a10, 0.28)
      .setStrokeStyle(3, 0x33434f, 0.75)
      .setDepth(DEPTH.floor + 1);
    this.createOrbitDecoration();
    this.createTitle();
    this.createControls();
    this.renderMenu('main');
  }

  update(): void {
    if (this.upKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.moveSelection(-1);
    }

    if (this.downKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.moveSelection(1);
    }

    if (this.confirmKeys.some((key) => Phaser.Input.Keyboard.JustDown(key))) {
      this.activateSelection();
    }
  }

  private createOrbitDecoration(): void {
    const orbit = this.add.container(GAME_WIDTH / 2, 300);
    orbit.setDepth(DEPTH.actor);

    for (let i = 0; i < 11; i += 1) {
      const angle = (Math.PI * 2 * i) / 11;
      const mote = this.add.image(
        Math.cos(angle) * 165,
        Math.sin(angle) * 66,
        i % 2 === 0 ? TextureKeys.enemyBullet : TextureKeys.playerBullet,
      );
      mote.setAlpha(0.36);
      orbit.add(mote);
    }

    this.tweens.add({
      targets: orbit,
      angle: 360,
      duration: 11000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private createTitle(): void {
    this.titleText = this.add
      .text(GAME_WIDTH / 2, 132, t('title.name'), {
        fontFamily: koreanFontStack(),
        fontSize: '60px',
        fontStyle: 'bold',
        color: '#f7f3e8',
        stroke: '#0d1117',
        strokeThickness: 12,
        shadow: {
          offsetX: 4,
          offsetY: 5,
          color: '#42202e',
          blur: 0,
          fill: true,
        },
        resolution: RENDER_SCALE,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.ui);

    this.subtitleText = this.add
      .text(GAME_WIDTH / 2, 188, '404% roguelike action', {
        fontFamily: koreanFontStack(),
        fontSize: '15px',
        color: '#ffcf75',
        stroke: '#0d1117',
        strokeThickness: 5,
        resolution: RENDER_SCALE,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.ui);

    this.hintText = this.add
      .text(GAME_WIDTH / 2, 566, '', {
        fontFamily: koreanFontStack(),
        fontSize: '15px',
        color: '#ffe39b',
        stroke: '#0d1117',
        strokeThickness: 5,
        resolution: RENDER_SCALE,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.ui);
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
  }

  private renderMenu(mode: MenuMode): void {
    this.mode = mode;
    this.selectedIndex = 0;
    this.menuContainer?.destroy(true);
    this.menuContainer = this.add.container(GAME_WIDTH / 2, mode === 'main' ? 350 : 270);
    this.menuContainer.setDepth(DEPTH.ui);
    this.menuTexts = [];
    this.menuItems = this.buildMenuItems(mode);
    this.titleText?.setText(t('title.name'));
    this.subtitleText?.setText(mode === 'settings' ? t('settings.title') : '404% roguelike action');
    this.hintText?.setText('');

    this.menuItems.forEach((item, index) => {
      const text = this.add
        .text(0, index * (mode === 'main' ? 54 : 42), item.label, {
          fontFamily: koreanFontStack(),
          fontSize: mode === 'main' ? '30px' : '20px',
          fontStyle: 'bold',
          color: '#f7f3e8',
          stroke: '#0d1117',
          strokeThickness: 7,
          resolution: RENDER_SCALE,
        })
        .setOrigin(0.5)
        .setPadding(24, 9, 24, 9)
        .setInteractive({ useHandCursor: true });

      text.on('pointerover', () => this.selectIndex(index));
      text.on('pointerdown', () => this.activateSelection());
      this.menuContainer?.add(text);
      this.menuTexts.push(text);
    });

    this.refreshMenuText();
  }

  private buildMenuItems(mode: MenuMode): MenuItem[] {
    if (mode === 'main') {
      return [
        { label: t('menu.start'), action: 'start' },
        { label: t('menu.settings'), action: 'settings' },
        { label: t('menu.quit'), action: 'quit' },
      ];
    }

    const settings = getGameSettings();
    return [
      {
        label: `${t('settings.language')}: ${getLocale() === 'ko' ? t('messages.localeKo') : t('messages.localeEn')}`,
        action: 'language',
      },
      {
        label: `${t('settings.sound')}: ${settings.soundEnabled ? t('settings.soundOn') : t('settings.soundOff')}`,
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
      { label: t('settings.fullscreen'), action: 'fullscreen' },
      { label: t('menu.back'), action: 'back' },
    ];
  }

  private moveSelection(direction: number): void {
    this.selectIndex(Phaser.Math.Wrap(this.selectedIndex + direction, 0, this.menuItems.length));
    this.playCue('pickup');
  }

  private selectIndex(index: number): void {
    if (index === this.selectedIndex) {
      return;
    }

    this.selectedIndex = index;
    this.refreshMenuText();
  }

  private activateSelection(): void {
    const selected = this.menuItems[this.selectedIndex];

    if (!selected) {
      return;
    }

    this.playCue('shoot');

    if (selected.action === 'start') {
      this.scene.start('GameScene');
      return;
    }

    if (selected.action === 'settings') {
      this.renderMenu('settings');
      return;
    }

    if (selected.action === 'quit') {
      this.hintText?.setText(t('messages.quitHint'));
      return;
    }

    if (selected.action === 'language') {
      toggleLocale();
      this.renderMenu('settings');
      return;
    }

    if (selected.action === 'sound') {
      this.soundEnabled = !getGameSettings().soundEnabled;
      updateGameSettings({ soundEnabled: this.soundEnabled });
      this.renderMenu('settings');
      return;
    }

    if (selected.action === 'volume') {
      updateGameSettings({ effectsVolume: nextEffectsVolume(getGameSettings().effectsVolume) });
      this.renderMenu('settings');
      return;
    }

    if (selected.action === 'shake') {
      updateGameSettings({ screenShake: nextScreenShake(getGameSettings().screenShake) });
      this.renderMenu('settings');
      return;
    }

    if (selected.action === 'quality') {
      updateGameSettings({
        renderQuality: nextRenderQuality(getGameSettings().renderQuality),
      });
      this.renderMenu('settings');
      this.hintText?.setText(t('settings.nextLaunch'));
      return;
    }

    if (selected.action === 'fullscreen') {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        void this.scale.startFullscreen();
      }
      return;
    }

    if (selected.action === 'back') {
      this.renderMenu('main');
    }
  }

  private refreshMenuText(): void {
    this.menuItems = this.buildMenuItems(this.mode);

    this.menuTexts.forEach((text, index) => {
      const selected = index === this.selectedIndex;
      text.setText(
        `${selected ? '> ' : '  '}${this.menuItems[index].label}${selected ? ' <' : '  '}`,
      );
      text.setColor(selected ? '#ffe39b' : '#f7f3e8');
      text.setBackgroundColor(selected ? '#17313b' : '#00000000');
      text.setScale(selected ? 1.08 : 1);
      text.setAlpha(selected ? 1 : 0.72);
    });
  }

  private playCue(cue: 'pickup' | 'shoot'): void {
    if (this.soundEnabled) {
      this.audio?.play(cue);
    }
  }
}
