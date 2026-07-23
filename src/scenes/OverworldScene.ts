import Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../config/assets';
import {
  createDecorPlacements,
  createGroundGrid,
  createTreePlacements,
  createWaterColliderRects,
  DUNGEON_ENTRANCES,
  LAND_BOUNDS,
  OVERWORLD_SIZE,
  PLAYER_START,
  ROCK_POSITIONS,
  TILE_SIZE,
  VILLAGE_SITE,
} from '../data/overworld';
import { createOverworldTextures, OverworldTextures } from '../systems/overworldTextures';
import { applyRenderScale } from '../utils/render';
import { resolvePlayerFacing, type PlayerFacing } from '../utils/playerFacing';
import { stopScenesSafely } from '../utils/sceneLifecycle';

const MOVE_SPEED = 130;
const FADE_MS = 220;

const IDLE_ANIMATIONS: Record<PlayerFacing, string> = {
  down: AnimationKeys.playerIdleDown,
  up: AnimationKeys.playerIdleUp,
  side: AnimationKeys.playerIdleSide,
};

const WALK_ANIMATIONS: Record<PlayerFacing, string> = {
  down: AnimationKeys.playerWalkDown,
  up: AnimationKeys.playerWalkUp,
  side: AnimationKeys.playerWalkSide,
};

type MovementKeys = Record<
  'W' | 'A' | 'S' | 'D' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
  Phaser.Input.Keyboard.Key
>;

// 던전 밖 대륙(존)을 걸어다니는 씬. 타일 지도 위에 숲·강·마을 터·던전 입구를
// 배치하고, 던전 입구에 들어서면 기존 로그라이크(GameScene)로 진입한다.
export class OverworldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private keys!: MovementKeys;
  private transitioning = false;

  constructor() {
    super('OverworldScene');
  }

  create(): void {
    this.transitioning = false;

    applyRenderScale(this);
    this.cameras.main.setBackgroundColor('#1c3f5e');
    this.physics.world.setBounds(
      LAND_BOUNDS.x,
      LAND_BOUNDS.y,
      LAND_BOUNDS.width,
      LAND_BOUNDS.height,
    );

    createOverworldTextures(this);

    const grid = createGroundGrid();
    this.createGroundLayer(grid);

    const obstacles = this.physics.add.staticGroup();
    this.createWaterColliders(grid, obstacles);
    this.createDecor(grid);
    this.createTrees(grid, obstacles);
    this.createRocks(obstacles);
    this.createVillageMarkers();

    this.player = this.physics.add.sprite(
      PLAYER_START.x,
      PLAYER_START.y,
      TextureKeys.playerYellowIdle,
    );
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 10);
    body.setOffset((this.player.width - 14) / 2, this.player.height - 12);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, obstacles);

    this.createDungeonEntrances();

    this.cameras.main.setBounds(0, 0, OVERWORLD_SIZE.width, OVERWORLD_SIZE.height);
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.fadeIn(FADE_MS, 5, 9, 14);

    this.keys = this.input.keyboard!.addKeys(
      'W,A,S,D,UP,DOWN,LEFT,RIGHT',
      true,
      true,
    ) as MovementKeys;

    this.input.keyboard!.on('keydown-ESC', this.returnToTitle, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-ESC', this.returnToTitle, this);
    });
  }

  update(): void {
    if (this.transitioning) {
      return;
    }

    const left = this.keys.A.isDown || this.keys.LEFT.isDown;
    const right = this.keys.D.isDown || this.keys.RIGHT.isDown;
    const up = this.keys.W.isDown || this.keys.UP.isDown;
    const down = this.keys.S.isDown || this.keys.DOWN.isDown;

    const inputX = (right ? 1 : 0) - (left ? 1 : 0);
    const inputY = (down ? 1 : 0) - (up ? 1 : 0);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const velocity = new Phaser.Math.Vector2(inputX, inputY).normalize().scale(MOVE_SPEED);
    body.setVelocity(velocity.x, velocity.y);

    const moving = inputX !== 0 || inputY !== 0;
    const visual = resolvePlayerFacing(inputX, inputY);
    this.player.setFlipX(visual.flipX);
    this.player.anims.play(
      moving ? WALK_ANIMATIONS[visual.facing] : IDLE_ANIMATIONS[visual.facing],
      true,
    );

    // 간단한 깊이 정렬: 아래쪽에 있을수록 앞에 그려져 나무 뒤로 걸어 들어갈 수 있다.
    this.player.setDepth(this.player.y);
  }

  private createGroundLayer(grid: number[][]): void {
    const map = this.make.tilemap({
      data: grid,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage(
      OverworldTextures.tileset,
      OverworldTextures.tileset,
      TILE_SIZE,
      TILE_SIZE,
      0,
      0,
    );

    if (tileset) {
      map.createLayer(0, tileset, 0, 0)?.setDepth(0);
    }
  }

  private createWaterColliders(
    grid: number[][],
    obstacles: Phaser.Physics.Arcade.StaticGroup,
  ): void {
    for (const rect of createWaterColliderRects(grid)) {
      const blocker = this.add.rectangle(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
        rect.width,
        rect.height,
      );
      blocker.setVisible(false);
      this.physics.add.existing(blocker, true);
      obstacles.add(blocker);
    }
  }

  private createDecor(grid: number[][]): void {
    for (const decor of createDecorPlacements(grid)) {
      const texture = decor.kind === 'flower' ? OverworldTextures.flower : OverworldTextures.tuft;
      this.add.image(decor.x, decor.y, texture).setDepth(1);
    }
  }

  private createTrees(grid: number[][], obstacles: Phaser.Physics.Arcade.StaticGroup): void {
    for (const placement of createTreePlacements(grid)) {
      const texture = placement.kind === 'oak' ? OverworldTextures.oak : OverworldTextures.bush;
      this.add
        .ellipse(placement.x, placement.y + 2, 24, 8, 0x0a1a0e, 0.22)
        .setDepth(placement.y - 1);
      const tree = obstacles.create(placement.x, placement.y - 14, texture);
      tree.setDepth(placement.y);
      const body = tree.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(12, 8);
      body.setOffset((tree.width - 12) / 2, tree.height - 10);
      body.updateFromGameObject();
    }
  }

  private createRocks(obstacles: Phaser.Physics.Arcade.StaticGroup): void {
    for (const position of ROCK_POSITIONS) {
      const rock = obstacles.create(position.x, position.y, OverworldTextures.rock);
      rock.setDepth(position.y);
      const body = rock.body as Phaser.Physics.Arcade.StaticBody;
      body.setSize(12, 7);
      body.setOffset((rock.width - 12) / 2, rock.height - 8);
      body.updateFromGameObject();
    }
  }

  private createVillageMarkers(): void {
    const flagX = VILLAGE_SITE.x + 36;
    const flagY = VILLAGE_SITE.y + 28;
    this.add.image(flagX, flagY, OverworldTextures.flag).setDepth(flagY + 12);

    const signX = PLAYER_START.x + 26;
    const signY = PLAYER_START.y - 16;
    this.add.image(signX, signY, OverworldTextures.sign).setDepth(signY + 10);
  }

  private createDungeonEntrances(): void {
    for (const entrance of DUNGEON_ENTRANCES) {
      this.add.image(entrance.x, entrance.y, OverworldTextures.cave).setDepth(entrance.y);

      const zone = this.add.zone(entrance.x, entrance.y + 20, 26, 14);
      this.physics.add.existing(zone, true);
      this.physics.add.overlap(this.player, zone, () => this.enterDungeon());
    }
  }

  private enterDungeon(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    (this.player.body as Phaser.Physics.Arcade.Body).stop();
    this.cameras.main.fadeOut(FADE_MS, 5, 9, 14);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      stopScenesSafely(this.scene.manager, ['PauseScene', 'GameScene']);
      this.scene.start('GameScene');
    });
  }

  private returnToTitle = (): void => {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    (this.player.body as Phaser.Physics.Arcade.Body).stop();
    this.cameras.main.fadeOut(FADE_MS, 5, 9, 14);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('TitleScene');
    });
  };
}
