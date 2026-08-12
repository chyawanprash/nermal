/**
 * Orchestration layer: calls the Tauri command wrappers, updates the
 * relevant stores, and normalizes failures into `appState.error`.
 * Components call these instead of touching `tauri/` or the stores
 * directly, so the "what happens on unlock" logic lives in one place.
 */
import { vault } from '$lib/tauri/vault';
import { notes } from '$lib/tauri/notes';
import { appState } from '$lib/stores/app.svelte';
import { vaultState } from '$lib/stores/vault.svelte';
import { notesState } from '$lib/stores/notes.svelte';
import { uiState } from '$lib/stores/ui.svelte';
import { recentVaultsState } from '$lib/stores/recentVaults.svelte';
import type { AppError } from '$lib/types/app';
import type { CreateVaultInput, UnlockVaultInput, ChangePasswordInput } from '$lib/types/vault';
import { logAppError } from '$lib/tauri/errors';

function handle(context: string, error: unknown): void {
  const appError = error as AppError;
  logAppError(context, appError);
  appState.setError(appError);
}

export const actions = {
  async createVault(input: CreateVaultInput): Promise<boolean> {
    appState.startLoading('Creating vault…');
    try {
      const info = await vault.create(input);
      vaultState.setUnlocked(info);
      recentVaultsState.touch(info);
      await this.loadNotes();
      appState.goTo('vault-unlocked');
      return true;
    } catch (err) {
      handle('createVault', err);
      return false;
    } finally {
      appState.stopLoading();
    }
  },

  async openVaultFlow(): Promise<void> {
    const path = await vault.pickVaultFile();
    if (!path) return;
    await this.openVaultByPath(path);
  },

  /** Reopens a vault whose path is already known, e.g. from the recent-vaults list. */
  async openVaultByPath(path: string): Promise<void> {
    appState.startLoading('Opening vault…');
    try {
      const summary = await vault.open(path);
      vaultState.selectLocked(summary);
      recentVaultsState.touch(summary);
      appState.goTo('vault-locked');
    } catch (err) {
      const appError = err as AppError;
      if (appError.code === 'VAULT_NOT_FOUND') recentVaultsState.remove(path);
      handle('openVault', err);
    } finally {
      appState.stopLoading();
    }
  },

  async unlockVault(input: UnlockVaultInput): Promise<boolean> {
    vaultState.isUnlocking = true;
    appState.clearError();
    try {
      const info = await vault.unlock(input);
      vaultState.setUnlocked(info);
      recentVaultsState.touch(info);
      await this.loadNotes();
      appState.goTo('vault-unlocked');
      return true;
    } catch (err) {
      handle('unlockVault', err);
      return false;
    } finally {
      vaultState.isUnlocking = false;
    }
  },

  async lockVault(): Promise<void> {
    await this.flushPendingSave();
    try {
      await vault.lock();
    } catch (err) {
      handle('lockVault', err);
    }
    notesState.clear();
    vaultState.relock();
    uiState.closeAllOverlays();
    appState.goTo('vault-locked');
  },

  async closeVault(): Promise<void> {
    await this.flushPendingSave();
    try {
      await vault.close();
    } catch (err) {
      handle('closeVault', err);
    }
    notesState.clear();
    vaultState.reset();
    uiState.closeAllOverlays();
    appState.goTo('no-vault');
  },

  /** Export the currently unlocked vault as a `.nermal` backup file. Returns false if cancelled or failed. */
  async exportVault(): Promise<boolean> {
    if (!vaultState.current) return false;
    const destination = await vault.pickExportDestination(vaultState.current.name);
    if (!destination) return false;

    appState.startLoading('Exporting vault…');
    try {
      await this.flushPendingSave();
      await vault.export(destination);
      return true;
    } catch (err) {
      handle('exportVault', err);
      return false;
    } finally {
      appState.stopLoading();
    }
  },

  async changePassword(input: ChangePasswordInput): Promise<boolean> {
    appState.startLoading('Changing password…');
    try {
      await vault.changePassword(input);
      return true;
    } catch (err) {
      handle('changePassword', err);
      return false;
    } finally {
      appState.stopLoading();
    }
  },

  async loadNotes(): Promise<void> {
    try {
      const list = await notes.list();
      notesState.setAll(list);
    } catch (err) {
      handle('loadNotes', err);
    }
  },

  async createNote(): Promise<void> {
    try {
      const note = await notes.create();
      notesState.upsert(note);
      notesState.select(note.id);
    } catch (err) {
      handle('createNote', err);
    }
  },

  async saveNote(id: string, title: string, content: string): Promise<void> {
    notesState.markSaving();
    try {
      const note = await notes.update({ id, title, content });
      notesState.upsert(note);
      notesState.markSaved();
    } catch (err) {
      notesState.markSaveError();
      handle('saveNote', err);
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      await notes.delete(id);
      notesState.remove(id);
    } catch (err) {
      handle('deleteNote', err);
    }
  },

  /** Placeholder the editor overrides via `registerFlush`; ensures Cmd+S / lock / close never drop input. */
  flushPendingSave: (() => Promise.resolve()) as () => Promise<void>,

  registerFlush(fn: () => Promise<void>) {
    this.flushPendingSave = fn;
  },
};
