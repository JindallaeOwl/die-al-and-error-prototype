export interface TransitionTimerController {
  schedule(callback: () => void, delayMs: number): number;
  cancel(timerId: number): void;
}

export interface SafeTransitionStep {
  complete(): boolean;
  cancel(): void;
}

const browserTimers: TransitionTimerController = {
  schedule: (callback, delayMs) => window.setTimeout(callback, delayMs),
  cancel: (timerId) => window.clearTimeout(timerId),
};

/**
 * Runs a transition completion exactly once.
 *
 * Phaser's tween callback is the normal path. The independent browser timer
 * is the fallback path when a Scene is paused or a tween callback is lost.
 */
export function createSafeTransitionStep(
  action: () => void,
  fallbackDelayMs: number,
  timers: TransitionTimerController = browserTimers,
): SafeTransitionStep {
  let completed = false;
  let timerId: number | undefined;

  const complete = (): boolean => {
    if (completed) {
      return false;
    }

    completed = true;
    if (timerId !== undefined) {
      timers.cancel(timerId);
      timerId = undefined;
    }

    action();
    return true;
  };

  timerId = timers.schedule(complete, fallbackDelayMs);

  return {
    complete,
    cancel: () => {
      completed = true;
      if (timerId !== undefined) {
        timers.cancel(timerId);
        timerId = undefined;
      }
    },
  };
}
