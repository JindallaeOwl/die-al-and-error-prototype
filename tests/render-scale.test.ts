import { describe, expect, it, vi } from 'vitest';
import type Phaser from 'phaser';
import { applyRenderScaleToGame } from '../src/utils/render';

function createCamera() {
  return {
    setViewport: vi.fn(),
    setZoom: vi.fn(),
    setRoundPixels: vi.fn(),
    centerOn: vi.fn(),
  };
}

function createManagedScene(active: boolean, paused: boolean) {
  const camera = createCamera();
  const scene = {
    sys: {
      isActive: () => active,
      isPaused: () => paused,
    },
    cameras: { cameras: [camera] },
    children: { list: [] },
  };

  return { scene, camera };
}

describe('live render scale application', () => {
  it('resizes active and paused scenes while leaving dormant scenes alone', () => {
    const active = createManagedScene(true, false);
    const paused = createManagedScene(false, true);
    const dormant = createManagedScene(false, false);
    const resize = vi.fn();
    const sourceScene = {
      scale: { resize },
      game: {
        scene: {
          getScenes: () => [active.scene, paused.scene, dormant.scene],
        },
      },
    } as unknown as Phaser.Scene;

    applyRenderScaleToGame(sourceScene, 2);

    expect(resize).toHaveBeenCalledWith(960, 544);
    for (const camera of [active.camera, paused.camera]) {
      expect(camera.setViewport).toHaveBeenCalledWith(0, 0, 960, 544);
      expect(camera.setZoom).toHaveBeenCalledWith(2);
      expect(camera.setRoundPixels).toHaveBeenCalledWith(true);
      expect(camera.centerOn).toHaveBeenCalledWith(240, 136);
    }
    expect(dormant.camera.setViewport).not.toHaveBeenCalled();
  });
});
