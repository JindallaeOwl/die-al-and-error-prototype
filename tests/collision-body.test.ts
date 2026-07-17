import { describe, expect, it } from 'vitest';
import { getCenteredCircleBodyOffset } from '../src/utils/collisionBody';

describe('circle collision body alignment', () => {
  it('centers the red chaser collision circle in its 40-pixel texture', () => {
    expect(getCenteredCircleBodyOffset(40, 40, 11)).toEqual({ x: 9, y: 9 });
  });

  it('centers differently sized enemy collision circles', () => {
    expect(getCenteredCircleBodyOffset(42, 42, 12)).toEqual({ x: 9, y: 9 });
    expect(getCenteredCircleBodyOffset(76, 76, 28)).toEqual({ x: 10, y: 10 });
  });
});
