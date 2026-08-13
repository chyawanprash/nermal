<script lang="ts">
  import { TrashBinOutline, CheckOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { notesState } from '$lib/stores/notes.svelte';

  let menu = $derived(uiState.noteContextMenu);

  function close() {
    uiState.closeNoteContextMenu();
  }

  function deleteNote() {
    if (!menu) return;
    notesState.select(menu.noteId);
    close();
    uiState.openDialog('delete-note');
  }

  function selectNote() {
    if (!menu) return;
    notesState.enterSelectionMode(menu.noteId);
    close();
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={onkeydown} />

{#if menu}
  <!-- Backdrop closes the menu on any outside click without intercepting the click itself. -->
  <div class="fixed inset-0 z-40" onclick={close} oncontextmenu={(e) => e.preventDefault()} role="presentation"></div>
  <div
    class="fixed z-50 min-w-36 rounded-md border p-1 shadow-lg"
    style="left: {menu.x}px; top: {menu.y}px; background: var(--surface-panel); border-color: var(--border-subtle); box-shadow: var(--shadow-overlay)"
  >
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
      style="color: var(--text-secondary)"
      onclick={selectNote}
    >
      <CheckOutline class="h-3.5 w-3.5" />
      Select
    </button>
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[var(--surface-hover)]"
      style="color: var(--color-danger-500)"
      onclick={deleteNote}
    >
      <TrashBinOutline class="h-3.5 w-3.5" />
      Delete
    </button>
  </div>
{/if}
