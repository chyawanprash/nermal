<script lang="ts">
  import { CheckCircleSolid } from 'flowbite-svelte-icons';
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
  let selected = $derived(notesState.selectedIds.has(note.id));

  function onclick() {
    if (notesState.selectionMode) {
      notesState.toggleSelected(note.id);
    } else {
      notesState.select(note.id);
    }
  }

  function oncontextmenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (notesState.selectionMode) return;
    uiState.openNoteContextMenu(note.id, e.clientX, e.clientY);
  }
</script>

<button
  type="button"
  class="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors"
  style="background: {active && !notesState.selectionMode
    ? 'var(--surface-selected)'
    : 'transparent'}"
  onmouseenter={(e) => {
    if (!active || notesState.selectionMode)
      (e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)';
  }}
  onmouseleave={(e) => {
    if (!active || notesState.selectionMode)
      (e.currentTarget as HTMLElement).style.background = 'transparent';
  }}
  {onclick}
  {oncontextmenu}
>
  {#if notesState.selectionMode}
    <span class="flex h-4 w-4 shrink-0 items-center justify-center">
      {#if selected}
        <CheckCircleSolid class="h-4 w-4" style="color: var(--color-accent-500)" />
      {:else}
        <span class="h-3.5 w-3.5 rounded-full border-2" style="border-color: var(--border-subtle)"
        ></span>
      {/if}
    </span>
  {/if}
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-medium" style="color: var(--text-primary)">{title}</p>
    {#if preview}
      <p class="truncate text-xs" style="color: var(--text-tertiary)">{preview}</p>
    {/if}
    <p class="mt-0.5 text-[11px]" style="color: var(--text-tertiary)">
      {relativeTime(note.updatedAt)}
    </p>
  </div>
</button>
