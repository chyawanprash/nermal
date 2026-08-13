<script lang="ts">
  import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { notesState } from '$lib/stores/notes.svelte';
  import { actions } from '$lib/actions';

  let count = $derived(notesState.selectedIds.size);
</script>

{#if count > 0}
  <ConfirmDialog
    bind:open={() => uiState.activeDialog === 'delete-notes-bulk', (v) => !v && uiState.closeDialog()}
    title={`Delete ${count} ${count === 1 ? 'note' : 'notes'}?`}
    body={`This action cannot be undone.`}
    confirmLabel="Delete"
    danger
    onconfirm={() => actions.deleteNotes([...notesState.selectedIds])}
  />
{/if}
