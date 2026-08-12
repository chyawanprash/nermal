<script lang="ts">
  import { SearchOutline, PlusOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { actions } from '$lib/actions';
  import NoteList from './NoteList.svelte';
</script>

<aside
  class="flex h-full w-64 shrink-0 flex-col border-r"
  style="background: var(--surface-sunken); border-color: var(--border-subtle)"
>
  <div class="flex flex-col gap-2 p-2.5">
    <button
      type="button"
      class="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
      style="border-color: var(--border-subtle); color: var(--text-tertiary); background: var(--surface-panel)"
      onclick={() => (uiState.searchOpen = true)}
    >
      <SearchOutline class="h-3.5 w-3.5" />
      Search notes…
    </button>

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

  <div class="min-h-0 flex-1">
    <NoteList />
  </div>
</aside>
