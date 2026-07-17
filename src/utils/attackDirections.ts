export interface AttackDirection {
  x: number;
  y: number;
}

export function createSpreadDirections(
  centerDirection: AttackDirection,
  count: number,
  spreadStepDegrees: number,
): AttackDirection[] {
  const shotCount = Math.max(1, Math.floor(count));
  const centerIndex = (shotCount - 1) / 2;
  const centerAngle = Math.atan2(centerDirection.y, centerDirection.x);

  return Array.from({ length: shotCount }, (_, index) => {
    const angleOffset = degreesToRadians((index - centerIndex) * spreadStepDegrees);
    const angle = centerAngle + angleOffset;

    return { x: Math.cos(angle), y: Math.sin(angle) };
  });
}

export function distanceToSegmentSquared(
  point: AttackDirection,
  start: AttackDirection,
  end: AttackDirection,
): number {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared === 0) {
    return squaredDistance(point, start);
  }

  const projection =
    ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared;
  const clampedProjection = Math.max(0, Math.min(1, projection));
  const closest = {
    x: start.x + segmentX * clampedProjection,
    y: start.y + segmentY * clampedProjection,
  };

  return squaredDistance(point, closest);
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function squaredDistance(first: AttackDirection, second: AttackDirection): number {
  const dx = first.x - second.x;
  const dy = first.y - second.y;
  return dx * dx + dy * dy;
}
