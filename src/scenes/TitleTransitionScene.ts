import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, TITLE_TRANSITION_MS } from '../config/gameConfig';
import { applyRenderScale } from '../utils/render';
import { createSafeTransitionStep, type SafeTransitionStep } from '../utils/safeTransitionStep';
import { stopScenesSafely } from '../utils/sceneLifecycle';

export const TITLE_TRANSITION_SCENE_KEY = 'TitleTransitionScene';

export class TitleTransitionScene extends Phaser.Scene {
  private cover?: Phaser.GameObjects.Rectangle;
  private titleOpeningStarted = false;
  private transitionCompleted = false;
  private coverFadeStep?: SafeTransitionStep;
  private titleStartTimer?: number;
  private titleFadeStep?: SafeTransitionStep;

  constructor() {
    super(TITLE_TRANSITION_SCENE_KEY);
  }

  create(): void {
    this.titleOpeningStarted = false;
    this.transitionCompleted = false;
    this.coverFadeStep = undefined;
    this.titleStartTimer = undefined;
    this.titleFadeStep = undefined;
    applyRenderScale(this);
    this.input.enabled = false;
    this.input.keyboard?.resetKeys();

    this.cover = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05090e, 1)
      .setAlpha(0)
      .setInteractive();

    this.coverFadeStep = createSafeTransitionStep(
      () => this.openTitleScene(),
      TITLE_TRANSITION_MS + 120,
    );

    try {
      this.tweens.add({
        targets: this.cover,
        alpha: 1,
        duration: TITLE_TRANSITION_MS,
        ease: 'Sine.easeIn',
        onComplete: () => this.coverFadeStep?.complete(),
      });
    } catch (error) {
      console.error('Title fade-out failed.', error);
      this.coverFadeStep.complete();
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.coverFadeStep?.cancel();
      this.coverFadeStep = undefined;

      if (this.titleStartTimer !== undefined) {
        window.clearTimeout(this.titleStartTimer);
        this.titleStartTimer = undefined;
      }

      this.titleFadeStep?.cancel();
      this.titleFadeStep = undefined;
    });
  }

  private openTitleScene(): void {
    if (this.titleOpeningStarted || this.transitionCompleted) {
      return;
    }

    this.titleOpeningStarted = true;
    this.coverFadeStep?.cancel();
    this.coverFadeStep = undefined;

    this.hideGameOverOverlay();
    const sceneManager = this.scene.manager;
    if (!sceneManager.isActive('TitleScene')) {
      this.scene.launch('TitleScene', { inputLocked: true });
    }

    sceneManager.bringToTop(TITLE_TRANSITION_SCENE_KEY);
    this.titleStartTimer = window.setTimeout(() => {
      this.titleStartTimer = undefined;
      this.finishTransition();
    }, 80);
  }

  private finishTransition(): void {
    if (this.transitionCompleted || !this.scene.isActive()) {
      return;
    }

    const sceneManager = this.scene.manager;
    const titleScene = sceneManager.getScene('TitleScene');

    sceneManager.bringToTop('TitleScene');
    sceneManager.bringToTop(TITLE_TRANSITION_SCENE_KEY);
    titleScene.input.enabled = false;
    if (titleScene.input.keyboard) {
      titleScene.input.keyboard.enabled = false;
    }

    // Register both the tween and its browser-timer fallback before running
    // old Scene shutdown handlers. A faulty handler must never be able to
    // strand the player behind an opaque transition cover.
    this.fadeIntoTitle(titleScene);
    stopScenesSafely(sceneManager, ['PauseScene', 'GameScene']);
  }

  private fadeIntoTitle(titleScene: Phaser.Scene): void {
    this.transitionCompleted = true;
    this.titleFadeStep = createSafeTransitionStep(
      () => this.completeTitleTransition(titleScene),
      TITLE_TRANSITION_MS + 120,
    );

    try {
      this.tweens.add({
        targets: this.cover,
        alpha: 0,
        duration: TITLE_TRANSITION_MS,
        ease: 'Sine.easeOut',
        onComplete: () => this.titleFadeStep?.complete(),
      });
    } catch (error) {
      console.error('Title fade-in failed.', error);
      this.titleFadeStep.complete();
    }
  }

  private completeTitleTransition(titleScene: Phaser.Scene): void {
    if (!this.scene.isActive()) {
      return;
    }

    this.titleFadeStep?.cancel();
    this.titleFadeStep = undefined;

    this.cover?.destroy();
    this.cover = undefined;

    const sceneManager = this.scene.manager;
    sceneManager.bringToTop('TitleScene');
    titleScene.input.enabled = true;

    if (titleScene.input.keyboard) {
      titleScene.input.keyboard.enabled = true;
      titleScene.input.keyboard.resetKeys();
    }

    sceneManager.stop(TITLE_TRANSITION_SCENE_KEY);
  }

  private hideGameOverOverlay(): void {
    const overlay = document.querySelector<HTMLElement>('#game-over-overlay');
    const restartButton = document.querySelector<HTMLButtonElement>('#game-over-restart');

    if (overlay) {
      overlay.hidden = true;
      overlay.classList.remove('is-leaving');
    }

    if (restartButton) {
      restartButton.disabled = false;
    }
  }
}
