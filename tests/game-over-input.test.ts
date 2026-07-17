import { describe, expect, it } from 'vitest';
import { isGameOverRestartCode } from '../src/utils/gameOverInput';

describe('game-over restart input', () => {
  it.each(['Enter', 'NumpadEnter', 'Space'])('accepts %s', (code) => {
    expect(isGameOverRestartCode(code)).toBe(true);
  });

  it.each(['Escape', 'KeyW', 'ArrowUp'])('ignores %s', (code) => {
    expect(isGameOverRestartCode(code)).toBe(false);
  });
});
