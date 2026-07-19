import { describe, expect, it } from 'vitest';
import { getRoomTransitionPresentation } from '../src/systems/RoomTransitionRules';

describe('RoomTransition presentation rules', () => {
  it('uses a longer fade and boss message for boss rooms', () => {
    expect(getRoomTransitionPresentation('boss')).toEqual({
      fadeInMs: 320,
      messageKey: 'messages.bossRoom',
    });
  });

  it('returns the matching message for shop and treasure rooms', () => {
    expect(getRoomTransitionPresentation('shop').messageKey).toBe('messages.shopRoom');
    expect(getRoomTransitionPresentation('treasure').messageKey).toBe('messages.treasureRoom');
  });

  it('does not show a special message for combat rooms', () => {
    expect(getRoomTransitionPresentation('combat')).toEqual({ fadeInMs: 150 });
  });
});
