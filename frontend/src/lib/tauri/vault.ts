/**
 * Typed wrappers around the vault Tauri commands.
 *
 * Command contract expected of `src-tauri/src/commands/vault.rs`. None of
 * these are implemented on the Rust side yet (see the stub there) — this
 * file is the frontend's half of that contract so the UI can be built
 * against it now and wired up as each command lands.
 *
 * Never returns key material — Rust must not serialize a key/derived
 * secret into any of these response shapes.
 */
import { invoke } from '@tauri-apps/api/core';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import type {
  ChangePasswordInput,
  CreateVaultInput,
  UnlockVaultInput,
  VaultInfo,
  VaultSummary,
} from '$lib/types/vault';
import { toAppError } from './errors';

export const vault = {
  /** `create_vault(directory: string, name: string, password: string) -> VaultInfo` */
  async create(input: CreateVaultInput): Promise<VaultInfo> {
    try {
      return await invoke<VaultInfo>('create_vault', {
        directory: input.directory,
        name: input.name,
        password: input.password,
      });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `open_vault(path: string) -> VaultSummary` — reads header only, does not unlock. */
  async open(path: string): Promise<VaultSummary> {
    try {
      return await invoke<VaultSummary>('open_vault', { path });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `unlock_vault(path: string, password: string) -> VaultInfo` */
  async unlock(input: UnlockVaultInput): Promise<VaultInfo> {
    try {
      return await invoke<VaultInfo>('unlock_vault', {
        path: input.path,
        password: input.password,
      });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `lock_vault() -> void` — keeps the vault file reference, clears the derived key. */
  async lock(): Promise<void> {
    try {
      await invoke('lock_vault');
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `close_vault() -> void` — flushes pending saves and forgets the vault entirely. */
  async close(): Promise<void> {
    try {
      await invoke('close_vault');
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `change_vault_password(current_password: string, new_password: string) -> void` */
  async changePassword(input: ChangePasswordInput): Promise<void> {
    try {
      await invoke('change_vault_password', {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /**
   * Native "choose a folder to create the vault in" dialog. This is the one
   * piece of filesystem interaction the frontend does directly — it only
   * ever returns a path string, never file contents.
   */
  async pickCreateDirectory(): Promise<string | null> {
    const result = await openDialog({ directory: true, multiple: false });
    return typeof result === 'string' ? result : null;
  },

  /** Native "choose a .vault file to open" dialog. */
  async pickVaultFile(): Promise<string | null> {
    const result = await openDialog({
      directory: false,
      multiple: false,
      filters: [{ name: 'Vault', extensions: ['vault'] }],
    });
    return typeof result === 'string' ? result : null;
  },
};
