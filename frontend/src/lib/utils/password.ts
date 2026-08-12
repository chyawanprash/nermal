// Keep in sync with src-tauri/src/commands/mod.rs (MIN_PASSWORD_LENGTH / MAX_PASSWORD_LENGTH).
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export type PasswordCheck =
  | { status: 'empty' }
  | { status: 'too-short'; message: string }
  | { status: 'too-long'; message: string }
  | { status: 'ok'; message: string };

export function checkPassword(password: string): PasswordCheck {
  if (password.length === 0) return { status: 'empty' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      status: 'too-short',
      message: `Too short — use at least ${MIN_PASSWORD_LENGTH} characters (${password.length}/${MIN_PASSWORD_LENGTH}).`,
    };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      status: 'too-long',
      message: `Too long — use at most ${MAX_PASSWORD_LENGTH} characters (${password.length}/${MAX_PASSWORD_LENGTH}).`,
    };
  }
  return { status: 'ok', message: 'Password length looks good.' };
}

export function isPasswordValid(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}
