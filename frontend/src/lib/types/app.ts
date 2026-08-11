/** Top-level screens the app shell switches between. See AppShell.svelte. */
export type AppScreen = 'no-vault' | 'vault-locked' | 'vault-unlocked';

export type AppErrorCode =
  | 'INVALID_PASSWORD'
  | 'VAULT_CORRUPTED'
  | 'VAULT_NOT_FOUND'
  | 'SAVE_FAILED'
  | 'UNKNOWN_ERROR';

/** A backend error, normalized into something safe to show a user. */
export interface AppError {
  code: AppErrorCode;
  /** User-facing text. Never a raw Rust message or stack trace. */
  message: string;
  /** Raw backend error, kept only for console logging — never rendered. */
  cause?: unknown;
}

export type Theme = 'system' | 'light' | 'dark';

export interface EditorPreferences {
  fontSize: number;
  lineHeight: number;
  wordWrap: boolean;
}
