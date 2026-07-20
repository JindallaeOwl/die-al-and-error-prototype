import { describe, expect, it } from 'vitest';
import { MUSIC_ASSETS, MusicKeys } from '../src/config/assets';

describe('music asset registry', () => {
  it('preloads a file for every music key', () => {
    expect(MUSIC_ASSETS.map((asset) => asset.key)).toEqual(Object.values(MusicKeys));
    expect(MUSIC_ASSETS.every((asset) => asset.path.endsWith('.ogg'))).toBe(true);
  });
});
