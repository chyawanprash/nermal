import { stripHtml } from '$lib/utils/html';

export interface Note {
  id: string;
  title: string;
  /** HTML from the rich-text editor (may include bold-weight spans). */
  content: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
}

/** Lightweight projection used for the sidebar list and search results. */
export interface NoteSummary {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
}

export interface UpdateNoteInput {
  id: string;
  title: string;
  content: string;
}

export function toNoteSummary(note: Note): NoteSummary {
  return {
    id: note.id,
    title: note.title.trim() || 'Untitled',
    preview: stripHtml(note.content).slice(0, 140),
    updatedAt: note.updatedAt,
  };
}
