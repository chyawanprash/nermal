import type { VaultSummary } from '$lib/types/vault';

const RECENT_VAULTS_STORAGE_KEY = 'nermal:recent-vaults';
const MAX_ENTRIES = 8;

export interface RecentVaultEntry extends VaultSummary {
  /** ISO 8601 timestamp of the most recent open/create/unlock. */
  lastOpenedAt: string;
}

/**
 * Most-recently-used vault paths, so the welcome screen can offer one-click
 * reopen instead of browsing for the file every time. Only paths/names are
 * stored — never a password or anything from inside the vault — so
 * localStorage is fine, same as the theme preference.
 */
class RecentVaultsState {
  entries = $state<RecentVaultEntry[]>(readStored());

  /** Adds/moves a vault to the front of the list and refreshes its timestamp. */
  touch(vault: VaultSummary) {
    const rest = this.entries.filter((e) => e.path !== vault.path);
    this.entries = [{ ...vault, lastOpenedAt: new Date().toISOString() }, ...rest].slice(0, MAX_ENTRIES);
    persist(this.entries);
  }

  /** Drops an entry, e.g. when its file no longer exists on disk. */
  remove(path: string) {
    this.entries = this.entries.filter((e) => e.path !== path);
    persist(this.entries);
  }
}

function readStored(): RecentVaultEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_VAULTS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries: RecentVaultEntry[]) {
  localStorage.setItem(RECENT_VAULTS_STORAGE_KEY, JSON.stringify(entries));
}

export const recentVaultsState = new RecentVaultsState();
