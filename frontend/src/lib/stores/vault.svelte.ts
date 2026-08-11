import type { VaultInfo, VaultSummary } from '$lib/types/vault';

/**
 * The vault lifecycle: nothing selected -> selected-but-locked -> unlocked.
 * `current` holding a value is the frontend's notion of "unlocked" — it is
 * metadata only (name/path/counts), never key material or note content.
 */
class VaultState {
  current = $state<VaultInfo | null>(null);
  locked = $state<VaultSummary | null>(null);
  isUnlocking = $state(false);

  isUnlocked = $derived(this.current !== null);

  selectLocked(summary: VaultSummary) {
    this.locked = summary;
    this.current = null;
  }

  setUnlocked(info: VaultInfo) {
    this.current = info;
    this.locked = null;
  }

  /** Vault re-locked: forget everything except which file it was. */
  relock() {
    if (this.current) {
      this.locked = { id: this.current.id, name: this.current.name, path: this.current.path };
    }
    this.current = null;
  }

  /** Vault closed entirely: back to vault selection. */
  reset() {
    this.current = null;
    this.locked = null;
    this.isUnlocking = false;
  }
}

export const vaultState = new VaultState();
