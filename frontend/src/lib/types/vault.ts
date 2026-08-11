/** A vault the user can open — known from the filesystem, not yet unlocked. */
export interface VaultSummary {
  /** Stable identifier for this vault (derived from its file path). */
  id: string;
  /** Display name, e.g. "Personal". */
  name: string;
  /** Absolute path to the `.vault` file on disk. */
  path: string;
}

/** Metadata about the currently unlocked vault. Never contains note content. */
export interface VaultInfo extends VaultSummary {
  noteCount: number;
  /** ISO 8601 timestamp. */
  lastModifiedAt: string;
}

export interface CreateVaultInput {
  /** Directory the vault file should be created in. */
  directory: string;
  name: string;
  password: string;
}

export interface UnlockVaultInput {
  path: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
