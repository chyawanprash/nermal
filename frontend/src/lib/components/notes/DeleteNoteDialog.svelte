<script lang="ts">
  import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { notesState } from '$lib/stores/notes.svelte';
  import { actions } from '$lib/actions';

  let note = $derived(notesState.activeNote);
</script>

{#if note}
  <ConfirmDialog
    bind:open={() => uiState.activeDialog === 'delete-note', (v) => !v && uiState.closeDialog()}
    title="Delete note?"
    body={`"${note.title.trim() || 'Untitled'}"\n\nThis action cannot be undone.`}
    confirmLabel="Delete"
    danger
    onconfirm={() => actions.deleteNote(note!.id)}
  />
{/if}
