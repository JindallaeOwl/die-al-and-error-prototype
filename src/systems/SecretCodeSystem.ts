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
