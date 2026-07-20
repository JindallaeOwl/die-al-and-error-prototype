import { describe, expect, it, vi } from 'vitest';
import {
  createSafeTransitionStep,
  type TransitionTimerController,
} from '../src/utils/safeTransitionStep';

function createFakeTimers() {
  let fallback: (() => void) | undefined;
  const timers: TransitionTimerController = {
    schedule: vi.fn((callback: () => void) => {
      fallback = callback;
      return 17;
    }),
    cancel: vi.fn(),
  };

  return { timers, runFallback: () => fallback?.() };
}

describe('createSafeTransitionStep', () => {
  it('uses the browser-timer fallback when the tween never completes', () => {
    const action = vi.fn();
    const { timers, runFallback } = createFakeTimers();

    createSafeTransitionStep(action, 500, timers);
    runFallback();

    expect(action).toHaveBeenCalledOnce();
  });

  it('runs only once when both the tween and fallback complete', () => {
    const action = vi.fn();
    const { timers, runFallback } = createFakeTimers();
    const step = createSafeTransitionStep(action, 500, timers);

    expect(step.complete()).toBe(true);
    runFallback();
    expect(step.complete()).toBe(false);

    expect(action).toHaveBeenCalledOnce();
    expect(timers.cancel).toHaveBeenCalledWith(17);
  });

  it('does not complete after Scene shutdown cancels it', () => {
    const action = vi.fn();
    const { timers, runFallback } = createFakeTimers();
    const step = createSafeTransitionStep(action, 500, timers);

    step.cancel();
    runFallback();

    expect(action).not.toHaveBeenCalled();
  });
});
