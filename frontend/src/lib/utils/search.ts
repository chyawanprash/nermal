import type { Note } from '$lib/types/note';
import { stripHtml } from '$lib/utils/html';

export interface SearchResult {
  note: Note;
  titleMatch: boolean;
  snippet: string;
}

/**
 * Local, in-memory search over already-decrypted notes. Never leaves the
 * process — there is no remote search service.
 */
export function searchNotes(notes: Note[], query: string): SearchResult[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const results: SearchResult[] = [];
  for (const note of notes) {
    const title = note.title.toLowerCase();
    const plainContent = stripHtml(note.content);
    const content = plainContent.toLowerCase();
    const titleMatch = title.includes(term);
    const contentIndex = content.indexOf(term);

    if (!titleMatch && contentIndex === -1) continue;

    results.push({
      note,
      titleMatch,
      snippet: contentIndex === -1 ? plainContent.slice(0, 120) : snippetAround(plainContent, contentIndex, term.length),
    });
  }

  results.sort((a, b) => Number(b.titleMatch) - Number(a.titleMatch));
  return results;
}

function snippetAround(content: string, index: number, matchLength: number): string {
  const radius = 60;
  const start = Math.max(0, index - radius);
  const end = Math.min(content.length, index + matchLength + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < content.length ? '…' : '';
  return prefix + content.slice(start, end).trim() + suffix;
}

/** Split text around a case-insensitive match so callers can bold it. */
export function highlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  const term = query.trim();
  if (!term) return [{ text, match: false }];

  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  const segments: { text: string; match: boolean }[] = [];

  let cursor = 0;
  let index = lowerText.indexOf(lowerTerm, cursor);
  while (index !== -1) {
    if (index > cursor) segments.push({ text: text.slice(cursor, index), match: false });
    segments.push({ text: text.slice(index, index + term.length), match: true });
    cursor = index + term.length;
    index = lowerText.indexOf(lowerTerm, cursor);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });

  return segments;
}
