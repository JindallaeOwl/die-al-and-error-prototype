export interface SceneStopController {
  stop(sceneKey: string): unknown;
}

export type SceneStopErrorReporter = (sceneKey: string, error: unknown) => void;

const reportSceneStopError: SceneStopErrorReporter = (sceneKey, error) => {
  console.error(`Failed to stop ${sceneKey}.`, error);
};

/**
 * Stops every requested Scene independently.
 *
 * Phaser runs Scene shutdown listeners synchronously. If one listener throws,
 * an unguarded cleanup chain stops immediately and can leave a transition
 * cover on screen forever. Keeping every stop isolated lets the transition
 * finish even when one old Scene has faulty cleanup code.
 */
export function stopScenesSafely(
  controller: SceneStopController,
  sceneKeys: readonly string[],
  reportError: SceneStopErrorReporter = reportSceneStopError,
): void {
  for (const sceneKey of sceneKeys) {
    try {
      controller.stop(sceneKey);
    } catch (error) {
      reportError(sceneKey, error);
    }
  }
}
