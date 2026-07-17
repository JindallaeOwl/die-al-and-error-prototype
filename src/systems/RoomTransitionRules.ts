import type { RoomType } from '../data/rooms';

export interface RoomTransitionPresentation {
  fadeInMs: number;
  messageKey?: 'messages.cacheFound' | 'messages.treasureRoom' | 'messages.bossRoom';
}

export function getRoomTransitionPresentation(roomType: RoomType): RoomTransitionPresentation {
  if (roomType === 'reward') {
    return { fadeInMs: 150, messageKey: 'messages.cacheFound' };
  }

  if (roomType === 'treasure') {
    return { fadeInMs: 150, messageKey: 'messages.treasureRoom' };
  }

  if (roomType === 'boss') {
    return { fadeInMs: 320, messageKey: 'messages.bossRoom' };
  }

  return { fadeInMs: 150 };
}
