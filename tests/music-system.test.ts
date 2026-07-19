import { describe, expect, it } from 'vitest';
import { MusicKeys } from '../src/config/assets';
import { getRoomMusicKey } from '../src/systems/MusicSystem';

describe('background music rules', () => {
  it('uses dedicated music for shop and boss rooms', () => {
    expect(getRoomMusicKey('shop')).toBe(MusicKeys.shop);
    expect(getRoomMusicKey('boss')).toBe(MusicKeys.boss);
  });

  it('uses journey music for regular, start, and treasure rooms', () => {
    expect(getRoomMusicKey('start')).toBe(MusicKeys.journey);
    expect(getRoomMusicKey('combat')).toBe(MusicKeys.journey);
    expect(getRoomMusicKey('treasure')).toBe(MusicKeys.journey);
  });
});
