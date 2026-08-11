<script lang="ts">
  import type { Note } from '$lib/types/note';
  import { relativeTime } from '$lib/utils/dates';
  import { notesState } from '$lib/stores/notes.svelte';

  let { note }: { note: Note } = $props();

  let title = $derived(note.title.trim() || 'Untitled');
  let preview = $derived(note.content.trim().split('\n').find((l) => l.trim().length > 0) ?? '');
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
>
  <p class="truncate text-sm font-medium" style="color: var(--text-primary)">{title}</p>
  {#if preview}
    <p class="truncate text-xs" style="color: var(--text-tertiary)">{preview}</p>
  {/if}
  <p class="mt-0.5 text-[11px]" style="color: var(--text-tertiary)">
    {relativeTime(note.updatedAt)}
  </p>
</button>
