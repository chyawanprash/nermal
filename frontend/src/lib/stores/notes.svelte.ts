import type { Note } from '$lib/types/note';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * All decrypted notes for the currently unlocked vault, held only in
 * memory. `clear()` must be called on lock/close so content never
 * outlives the security boundary (see vault.svelte.ts relock/reset).
 */
class NotesState {
  notes = $state<Note[]>([]);
  activeNoteId = $state<string | null>(null);
  saveStatus = $state<SaveStatus>('idle');
  lastSavedAt = $state<string | null>(null);
  dirty = $state(false);

  activeNote = $derived(this.notes.find((n) => n.id === this.activeNoteId) ?? null);

  sortedByRecency = $derived(
    [...this.notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    ),
  );

  setAll(notes: Note[]) {
    this.notes = notes;
  }

  upsert(note: Note) {
    const index = this.notes.findIndex((n) => n.id === note.id);
    if (index === -1) {
      this.notes = [note, ...this.notes];
    } else {
      this.notes = this.notes.map((n) => (n.id === note.id ? note : n));
    }
  }

  remove(id: string) {
    this.notes = this.notes.filter((n) => n.id !== id);
    if (this.activeNoteId === id) {
      this.activeNoteId = null;
    }
  }

  select(id: string | null) {
    this.activeNoteId = id;
  }

  markDirty() {
    this.dirty = true;
  }

  markSaving() {
    this.saveStatus = 'saving';
  }

  markSaved() {
    this.saveStatus = 'saved';
    this.dirty = false;
    this.lastSavedAt = new Date().toISOString();
  }

  markSaveError() {
    this.saveStatus = 'error';
  }

  /** Wipe decrypted content from memory — call this on lock/close. */
  clear() {
    this.notes = [];
    this.activeNoteId = null;
    this.saveStatus = 'idle';
    this.lastSavedAt = null;
    this.dirty = false;
  }
}

export const notesState = new NotesState();
