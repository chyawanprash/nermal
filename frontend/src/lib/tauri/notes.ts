/**
 * Typed wrappers around the note Tauri commands.
 *
 * Command contract expected of `src-tauri/src/commands/notes.rs`, which is
 * currently an empty stub — see the note in `tauri/vault.ts`. All note
 * content lives in Rust/SQLite; nothing here caches decrypted content
 * outside of the notes store while the vault is unlocked.
 */
import { invoke } from '@tauri-apps/api/core';
import type { CreateNoteInput, Note, UpdateNoteInput } from '$lib/types/note';
import { toAppError } from './errors';

export const notes = {
  /** `list_notes() -> Note[]` */
  async list(): Promise<Note[]> {
    try {
      return await invoke<Note[]>('list_notes');
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `get_note(id: string) -> Note` */
  async get(id: string): Promise<Note> {
    try {
      return await invoke<Note>('get_note', { id });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `create_note(title?: string, content?: string) -> Note` */
  async create(input: CreateNoteInput = {}): Promise<Note> {
    try {
      return await invoke<Note>('create_note', {
        title: input.title ?? '',
        content: input.content ?? '',
      });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `update_note(id: string, title: string, content: string) -> Note` */
  async update(input: UpdateNoteInput): Promise<Note> {
    try {
      return await invoke<Note>('update_note', {
        id: input.id,
        title: input.title,
        content: input.content,
      });
    } catch (err) {
      throw toAppError(err);
    }
  },

  /** `delete_note(id: string) -> void` */
  async delete(id: string): Promise<void> {
    try {
      await invoke('delete_note', { id });
    } catch (err) {
      throw toAppError(err);
    }
  },
};
