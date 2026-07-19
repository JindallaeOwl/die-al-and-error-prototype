import { describe, expect, it } from 'vitest';
import { calculateExpandedMinimapCellLayout } from '../src/ui/MinimapLayout';

describe('expanded minimap layout', () => {
  it('enlarges a compact room layout to fill the expanded panel', () => {
    const layout = calculateExpandedMinimapCellLayout(3, 3, 118, 82);

    expect(layout.size).toBe(18);
    expect(layout.gap).toBe(4.5);
  });

  it('shrinks larger floor layouts enough to stay inside the panel', () => {
    const layout = calculateExpandedMinimapCellLayout(5, 4, 118, 82);
    const renderedWidth = 5 * layout.size + 4 * layout.gap;
    const renderedHeight = 4 * layout.size + 3 * layout.gap;

    expect(renderedWidth).toBeLessThanOrEqual(102);
    expect(renderedHeight).toBeLessThanOrEqual(66);
    expect(layout.size).toBeGreaterThan(10);
  });
});
