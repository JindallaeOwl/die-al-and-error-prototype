import { describe, expect, it } from 'vitest';
import { excludeCamera, includeCamera } from '../src/utils/cameraFilter';

describe('UI camera filters', () => {
  it('hides new world objects from the UI camera', () => {
    expect(excludeCamera(0, 2)).toBe(2);
    expect(excludeCamera(1, 2)).toBe(3);
  });

  it('renders registered HUD objects only through the stable UI camera', () => {
    const hiddenFromBothCameras = excludeCamera(excludeCamera(0, 1), 2);
    expect(includeCamera(hiddenFromBothCameras, 2)).toBe(1);
  });
});
