export type PauseMode = 'main' | 'settings';
export type PauseMainAction = 'continue' | 'settings' | 'exit';

const PAUSE_MAIN_ACTIONS: readonly PauseMainAction[] = ['continue', 'settings', 'exit'];

export function getPauseMainActions(): PauseMainAction[] {
  return [...PAUSE_MAIN_ACTIONS];
}

export function getPauseEscapeAction(mode: PauseMode): 'resume' | 'back' {
  return mode === 'settings' ? 'back' : 'resume';
}

export function isPauseCode(code: string): boolean {
  return code === 'Escape';
}
