import { describe, expect, it, vi } from 'vitest';
import { stopScenesSafely } from '../src/utils/sceneLifecycle';

describe('stopScenesSafely', () => {
  it('continues stopping later scenes when one shutdown throws', () => {
    const stop = vi.fn((sceneKey: string) => {
      if (sceneKey === 'PauseScene') {
        throw new Error('broken shutdown');
      }
    });
    const reportError = vi.fn();

    stopScenesSafely({ stop }, ['PauseScene', 'GameScene'], reportError);

    expect(stop.mock.calls).toEqual([['PauseScene'], ['GameScene']]);
    expect(reportError).toHaveBeenCalledOnce();
    expect(reportError).toHaveBeenCalledWith('PauseScene', expect.any(Error));
  });
});
