export interface CircleBodyOffset {
  x: number;
  y: number;
}

export function getCenteredCircleBodyOffset(
  sourceWidth: number,
  sourceHeight: number,
  radius: number,
): CircleBodyOffset {
  return {
    x: (sourceWidth - radius * 2) / 2,
    y: (sourceHeight - radius * 2) / 2,
  };
}
