export type PlayerFacing = 'down' | 'up' | 'side';

export interface PlayerFacingVisual {
  facing: PlayerFacing;
  flipX: boolean;
}

export function resolvePlayerFacing(inputX: number, inputY: number): PlayerFacingVisual {
  if (inputX < 0) {
    return { facing: 'side', flipX: true };
  }

  if (inputX > 0) {
    return { facing: 'side', flipX: false };
  }

  if (inputY < 0) {
    return { facing: 'up', flipX: false };
  }

  if (inputY > 0) {
    return { facing: 'down', flipX: false };
  }

  return { facing: 'down', flipX: false };
}
