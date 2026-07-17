import { describe, expect, it } from 'vitest';
import { createSpreadDirections, distanceToSegmentSquared } from '../src/utils/attackDirections';

describe('attack directions', () => {
  it('keeps a single attack pointed in the original direction', () => {
    expect(createSpreadDirections({ x: 1, y: 0 }, 1, 12)[0]).toMatchObject({ x: 1, y: 0 });
  });

  it('creates four directions symmetrically around the aim direction', () => {
    const directions = createSpreadDirections({ x: 1, y: 0 }, 4, 12);
    const angles = directions.map((direction) =>
      Math.round((Math.atan2(direction.y, direction.x) * 180) / Math.PI),
    );

    expect(angles).toEqual([-18, -6, 6, 18]);
  });

  it('rotates the same fan around vertical aim directions', () => {
    const directions = createSpreadDirections({ x: 0, y: -1 }, 4, 12);
    const angles = directions.map((direction) =>
      Math.round((Math.atan2(direction.y, direction.x) * 180) / Math.PI),
    );

    expect(angles).toEqual([-108, -96, -84, -72]);
  });

  it('measures distance from a target to a beam segment', () => {
    const start = { x: 10, y: 10 };
    const end = { x: 110, y: 10 };

    expect(distanceToSegmentSquared({ x: 60, y: 15 }, start, end)).toBe(25);
    expect(distanceToSegmentSquared({ x: 0, y: 10 }, start, end)).toBe(100);
  });
});
