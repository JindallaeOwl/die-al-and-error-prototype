import { describe, expect, it } from 'vitest';
import { getPauseEscapeAction, getPauseMainActions, isPauseCode } from '../src/ui/PauseMenuRules';

describe('pause menu rules', () => {
  it('shows only continue, settings, and exit on the main pause menu', () => {
    expect(getPauseMainActions()).toEqual(['continue', 'settings', 'exit']);
  });

  it('uses Escape to resume from the main menu and go back from settings', () => {
    expect(isPauseCode('Escape')).toBe(true);
    expect(isPauseCode('Enter')).toBe(false);
    expect(getPauseEscapeAction('main')).toBe('resume');
    expect(getPauseEscapeAction('settings')).toBe('back');
  });
});
