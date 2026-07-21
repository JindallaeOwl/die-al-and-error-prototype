import { GAME_CENTER_X } from '../config/gameConfig';

export interface AnnouncementMotion {
  start: { x: number; y: number };
  rest: { x: number; y: number };
  exit: { x: number; y: number };
}

const REST_Y = 72;
const HORIZONTAL_TRAVEL = 270;

export function getAnnouncementMotion(): AnnouncementMotion {
  const rest = { x: GAME_CENTER_X, y: REST_Y };

  return {
    start: { x: rest.x + HORIZONTAL_TRAVEL, y: rest.y },
    rest,
    exit: { x: rest.x - HORIZONTAL_TRAVEL, y: rest.y },
  };
}
