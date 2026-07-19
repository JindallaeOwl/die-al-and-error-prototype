export const MINIMAP_HOLD_THRESHOLD_MS = 220;

export class MinimapExpansionController {
  private pinned = false;
  private pressedAt: number | null = null;

  get expanded(): boolean {
    return this.pinned || this.pressedAt !== null;
  }

  get pinnedExpanded(): boolean {
    return this.pinned;
  }

  press(time: number): void {
    if (this.pressedAt === null) {
      this.pressedAt = time;
    }
  }

  release(time: number): void {
    if (this.pressedAt === null) {
      return;
    }

    const heldFor = Math.max(0, time - this.pressedAt);
    this.pressedAt = null;

    if (heldFor < MINIMAP_HOLD_THRESHOLD_MS) {
      this.pinned = !this.pinned;
    }
  }

  cancelHold(): void {
    this.pressedAt = null;
  }
}

export function formatRunElapsedTime(elapsedMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0')).join(':');
}
