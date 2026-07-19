const DEVELOPER_CONSOLE_PASSWORD_HASH =
  '2e0efd6644a6326d74517f6fafbf4a05934c1c6f6adade26e318cb7edaace784';

export async function verifyDeveloperConsolePassword(password: string): Promise<boolean> {
  const encoded = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return hash === DEVELOPER_CONSOLE_PASSWORD_HASH;
}
