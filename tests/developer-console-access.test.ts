import { describe, expect, it } from 'vitest';
import { verifyDeveloperConsolePassword } from '../src/systems/DeveloperConsoleAccess';

describe('developer console access', () => {
  it('rejects passwords that do not match the configured hash', async () => {
    await expect(verifyDeveloperConsolePassword('')).resolves.toBe(false);
    await expect(verifyDeveloperConsolePassword('wrong-password')).resolves.toBe(false);
  });
});
