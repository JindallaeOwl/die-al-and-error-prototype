import { describe, expect, it } from 'vitest';
import { getAnnouncementMotion } from '../src/ui/ItemPickupAnnouncementRules';

describe('item pickup announcement motion', () => {
  it('always enters from the right and exits to the left', () => {
    const motion = getAnnouncementMotion();

    expect(motion.start).toEqual({ x: 510, y: 72 });
    expect(motion.rest).toEqual({ x: 240, y: 72 });
    expect(motion.exit).toEqual({ x: -30, y: 72 });
  });
});
