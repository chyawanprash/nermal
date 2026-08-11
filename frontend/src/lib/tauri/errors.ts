import type { AppError, AppErrorCode } from '$lib/types/app';

const FRIENDLY_MESSAGE: Record<AppErrorCode, string> = {
  INVALID_PASSWORD: 'Incorrect password.',
  VAULT_CORRUPTED: 'This vault appears to be corrupted.',
  VAULT_NOT_FOUND: 'The vault could not be found.',
  SAVE_FAILED: 'Unable to save your changes.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Turn whatever `invoke()` rejects with into a typed, user-safe AppError.
 *
 * Rust doesn't yet return structured errors (see src-tauri/src/commands) —
 * once it does (e.g. `{ code, message }`), replace the substring matching
 * below with a direct code lookup. Until then we match on the known
 * `Display` strings from `vault::crypto::CryptoError` / `vault::format::FormatError`.
 *
 * Note: the backend deliberately raises the *same* message for a wrong
 * password and a corrupted vault (see crypto.rs) so an attacker can't use
 * error responses to tell the two apart. The frontend preserves that: both
 * map to INVALID_PASSWORD with a combined message rather than guessing.
 */
export function toAppError(raw: unknown): AppError {
  const text = extractMessage(raw);
  const lower = text.toLowerCase();

  if (lower.includes('corrupted or password is incorrect')) {
    return {
      code: 'INVALID_PASSWORD',
      message: 'Incorrect password, or this vault is corrupted.',
      cause: raw,
    };
  }
  if (lower.includes('incorrect password') || lower.includes('invalid password')) {
    return { code: 'INVALID_PASSWORD', message: FRIENDLY_MESSAGE.INVALID_PASSWORD, cause: raw };
  }
  if (lower.includes('corrupted') || lower.includes('bad magic') || lower.includes('unsupported')) {
    return { code: 'VAULT_CORRUPTED', message: FRIENDLY_MESSAGE.VAULT_CORRUPTED, cause: raw };
  }
  if (lower.includes('not found') || lower.includes('no such file')) {
    return { code: 'VAULT_NOT_FOUND', message: FRIENDLY_MESSAGE.VAULT_NOT_FOUND, cause: raw };
  }
  if (lower.includes('save') || lower.includes('write')) {
    return { code: 'SAVE_FAILED', message: FRIENDLY_MESSAGE.SAVE_FAILED, cause: raw };
  }

  return { code: 'UNKNOWN_ERROR', message: FRIENDLY_MESSAGE.UNKNOWN_ERROR, cause: raw };
}

function extractMessage(raw: unknown): string {
  if (typeof raw === 'string') return raw;
  if (raw instanceof Error) return raw.message;
  if (raw && typeof raw === 'object' && 'message' in raw) {
    const message = (raw as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return '';
}

/** Log an error for debugging without ever leaking secrets to the console. */
export function logAppError(context: string, error: AppError): void {
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, error.code, error.cause ?? error.message);
}
