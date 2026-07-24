import { describe, expect, it } from 'vitest';
import {
  createInitialRunState,
  isRunEligibleForRanking,
  isRunEnded,
} from '../src/systems/RunState';

describe('run outcome', () => {
  it('starts a new run in the playing state', () => {
    expect(createInitialRunState().outcome).toBe('playing');
  });

  it('treats both defeat and escape as an ended run', () => {
    const state = createInitialRunState();
    expect(isRunEnded(state)).toBe(false);

    state.outcome = 'defeated';
    expect(isRunEnded(state)).toBe(true);

    state.outcome = 'escaped';
    expect(isRunEnded(state)).toBe(true);
  });

  it('keeps ranking eligibility independent from the outcome', () => {
    const state = createInitialRunState();
    state.outcome = 'escaped';

    expect(isRunEligibleForRanking(state)).toBe(true);

    state.adminUsed = true;
    expect(isRunEligibleForRanking(state)).toBe(false);
  });
});
