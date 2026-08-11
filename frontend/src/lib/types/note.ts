export interface Note {
  id: string;
  title: string;
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
    preview: note.content.trim().slice(0, 140),
    updatedAt: note.updatedAt,
  };
}
