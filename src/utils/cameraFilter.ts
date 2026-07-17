export function excludeCamera(cameraFilter: number, cameraId: number): number {
  return cameraFilter | cameraId;
}

export function includeCamera(cameraFilter: number, cameraId: number): number {
  return cameraFilter & ~cameraId;
}
