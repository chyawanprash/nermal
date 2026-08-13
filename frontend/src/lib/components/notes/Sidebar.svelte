<script lang="ts">
  import { SearchOutline, PlusOutline, CogOutline, CheckOutline, CloseOutline, TrashBinOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { notesState } from '$lib/stores/notes.svelte';
  import { actions } from '$lib/actions';
  import NoteList from './NoteList.svelte';

  function toggleSelectAll() {
    if (notesState.allSelected) {
      notesState.clearSelected();
    } else {
      notesState.selectAll();
    }
  }
</script>

<aside
  class="flex h-full w-64 min-w-0 shrink-0 flex-col border-r"
  style="background: var(--surface-sunken); border-color: var(--border-subtle)"
>
  {#if notesState.selectionMode}
    <div
      class="flex flex-wrap items-center justify-between gap-2 border-b p-2.5"
      style="border-color: var(--border-subtle)"
    >
      <div class="flex min-w-0 items-center gap-1.5">
        <button
          type="button"
          class="flex shrink-0 items-center justify-center rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)]"
          style="color: var(--text-secondary)"
          title="Cancel selection"
          onclick={() => notesState.exitSelectionMode()}
        >
          <CloseOutline class="h-3.5 w-3.5" />
        </button>
        <span class="truncate text-sm font-medium" style="color: var(--text-secondary)">
          {notesState.selectedIds.size} selected
        </span>
      </div>
      <div class="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          class="rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:bg-[var(--surface-hover)]"
          style="color: var(--text-secondary)"
          onclick={toggleSelectAll}
        >
          {notesState.allSelected ? 'Deselect all' : 'Select all'}
        </button>
        <button
          type="button"
          class="flex shrink-0 items-center justify-center rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-40 disabled:hover:bg-transparent"
          style="color: var(--color-danger-500)"
          title="Delete selected"
          disabled={notesState.selectedIds.size === 0}
          onclick={() => uiState.openDialog('delete-notes-bulk')}
        >
          <TrashBinOutline class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  {:else}
    <div class="flex flex-col gap-2 p-2.5">
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
          style="border-color: var(--border-subtle); color: var(--text-tertiary); background: var(--surface-panel)"
          onclick={() => (uiState.searchOpen = true)}
        >
          <SearchOutline class="h-3.5 w-3.5 shrink-0" />
          <span class="truncate">Search notes…</span>
        </button>
        {#if notesState.notes.length > 0}
          <button
            type="button"
            class="flex shrink-0 items-center justify-center rounded-md border p-1.5 transition-colors hover:bg-[var(--surface-hover)]"
            style="border-color: var(--border-subtle); color: var(--text-tertiary); background: var(--surface-panel)"
            title="Select notes"
            onclick={() => notesState.enterSelectionMode()}
          >
            <CheckOutline class="h-3.5 w-3.5" />
          </button>
        {/if}
      </div>

      <button
        type="button"
        class="flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80"
        style="background: var(--color-accent-500); color: var(--text-on-accent)"
        onclick={() => actions.createNote()}
      >
        <PlusOutline class="h-3.5 w-3.5" />
        New Note
      </button>
    </div>
  {/if}

  <div class="min-h-0 flex-1">
    <NoteList />
  </div>

  <div class="border-t p-2.5" style="border-color: var(--border-subtle)">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
      style="color: var(--text-secondary)"
      onclick={() => uiState.openDialog('settings')}
    >
      <CogOutline class="h-3.5 w-3.5" />
      Settings
    </button>
  </div>
</aside>
