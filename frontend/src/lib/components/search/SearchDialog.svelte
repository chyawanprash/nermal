<script lang="ts">
  import { Modal } from 'flowbite-svelte';
  import { SearchOutline, CloseOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { notesState } from '$lib/stores/notes.svelte';
  import { searchNotes, highlightSegments } from '$lib/utils/search';
  import { relativeTime } from '$lib/utils/dates';

  let query = $state('');
  let results = $derived(searchNotes(notesState.notes, query));

  function select(id: string) {
    notesState.select(id);
    close();
  }

  function close() {
    uiState.searchOpen = false;
    query = '';
  }
</script>

<Modal
  bind:open={() => uiState.searchOpen, (v) => (v ? (uiState.searchOpen = true) : close())}
  size="md"
  class="p-0"
  classes={{ close: 'hidden' }}
  dismissable
  outsideclose
>
  <div class="flex items-center gap-2.5 border-b px-4 py-4" style="border-color: var(--border-subtle)">
    <SearchOutline class="h-4 w-4 shrink-0" style="color: var(--text-tertiary)" />
    <!-- svelte-ignore a11y_autofocus -->
    <input
      class="w-full bg-transparent text-base outline-none"
      style="color: var(--text-primary); outline: none"
      placeholder="Search notes…"
      bind:value={query}
      autofocus
    />
    <button
      type="button"
      class="shrink-0 rounded-md p-1 transition-colors hover:bg-[var(--surface-hover)]"
      style="color: var(--text-tertiary)"
      aria-label="Close search"
      onclick={close}
    >
      <CloseOutline class="h-4 w-4" />
    </button>
  </div>

  <div class="max-h-80 overflow-y-auto p-2">
    {#if query.trim().length === 0}
      <p class="px-2 py-6 text-center text-sm" style="color: var(--text-tertiary)">
        Search titles and note content.
      </p>
    {:else if results.length === 0}
      <p class="px-2 py-6 text-center text-sm" style="color: var(--text-tertiary)">
        No notes found.<br />Try a different search.
      </p>
    {:else}
      {#each results as result (result.note.id)}
        <button
          type="button"
          class="w-full rounded-md px-3 py-2 text-left"
          onclick={() => select(result.note.id)}
          onmouseenter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-hover)')}
          onmouseleave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <p class="truncate text-sm font-medium" style="color: var(--text-primary)">
            {#each highlightSegments(result.note.title.trim() || 'Untitled', query) as seg}
              {#if seg.match}<mark class="rounded-sm bg-transparent font-semibold" style="color: var(--color-accent-500)">{seg.text}</mark>{:else}{seg.text}{/if}
            {/each}
          </p>
          <p class="truncate text-xs" style="color: var(--text-tertiary)">
            {#each highlightSegments(result.snippet, query) as seg}
              {#if seg.match}<mark class="rounded-sm bg-transparent font-semibold" style="color: var(--color-accent-500)">{seg.text}</mark>{:else}{seg.text}{/if}
            {/each}
          </p>
          <p class="mt-0.5 text-[11px]" style="color: var(--text-tertiary)">
            {relativeTime(result.note.updatedAt)}
          </p>
        </button>
      {/each}
    {/if}
  </div>
</Modal>
