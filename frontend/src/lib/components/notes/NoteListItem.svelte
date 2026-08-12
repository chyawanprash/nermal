<script lang="ts">
  import type { Note } from '$lib/types/note';
  import { relativeTime } from '$lib/utils/dates';
  import { notesState } from '$lib/stores/notes.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { scramble } from '$lib/utils/streamer';
  import { stripHtml } from '$lib/utils/html';

  let { note }: { note: Note } = $props();

  let realTitle = $derived(note.title.trim() || 'Untitled');
  let realPreview = $derived(
    stripHtml(note.content)
      .split('\n')
      .find((l) => l.trim().length > 0) ?? '',
  );
  let title = $derived(uiState.streamerMode ? scramble(realTitle) : realTitle);
  let preview = $derived(uiState.streamerMode ? scramble(realPreview) : realPreview);
  let active = $derived(notesState.activeNoteId === note.id);
</script>

<button
  type="button"
  class="w-full rounded-md px-2.5 py-2 text-left transition-colors"
  style="background: {active ? 'var(--surface-selected)' : 'transparent'}"
  onmouseenter={(e) => {
    if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
  }}
  onmouseleave={(e) => {
    if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
  }}
  onclick={() => notesState.select(note.id)}
  oncontextmenu={(e) => {
    e.preventDefault();
    e.stopPropagation();
    uiState.openNoteContextMenu(note.id, e.clientX, e.clientY);
  }}
>
  <p class="truncate text-sm font-medium" style="color: var(--text-primary)">{title}</p>
  {#if preview}
    <p class="truncate text-xs" style="color: var(--text-tertiary)">{preview}</p>
  {/if}
  <p class="mt-0.5 text-[11px]" style="color: var(--text-tertiary)">
    {relativeTime(note.updatedAt)}
  </p>
</button>
