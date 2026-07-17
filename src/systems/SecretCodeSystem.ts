import { GAME_CENTER_X, ROOM_RECT } from '../config/gameConfig';
import { clamp } from '../utils/math';

export const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const;

export interface SecretSynergySpawnPositions {
  prismLance: { x: number; y: number };
  quadShot: { x: number; y: number };
}

export function getSecretSynergySpawnPositions(
  playerX: number,
  playerY: number,
): SecretSynergySpawnPositions {
  const side = playerX > GAME_CENTER_X ? -1 : 1;
  const centerX = clamp(playerX + side * 48, ROOM_RECT.left + 40, ROOM_RECT.right - 40);
  const y = clamp(playerY, ROOM_RECT.top + 24, ROOM_RECT.bottom - 24);

  return {
    prismLance: { x: centerX - 16, y },
    quadShot: { x: centerX + 16, y },
  };
}

export class SecretCodeTracker {
  private progress = 0;

  constructor(private readonly sequence: readonly string[]) {
    if (sequence.length === 0) {
      throw new Error('A secret code sequence cannot be empty.');
    }
  }

  push(keyCode: string): boolean {
    if (keyCode === this.sequence[this.progress]) {
      this.progress += 1;
    } else {
      this.progress = keyCode === this.sequence[0] ? 1 : 0;
    }

    if (this.progress < this.sequence.length) {
      return false;
    }

    this.progress = 0;
    return true;
  }
}
