const GAME_OVER_RESTART_CODES = new Set(['Enter', 'NumpadEnter', 'Space']);

export function isGameOverRestartCode(code: string): boolean {
  return GAME_OVER_RESTART_CODES.has(code);
}
