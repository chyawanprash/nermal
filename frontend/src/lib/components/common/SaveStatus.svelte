<script lang="ts">
  import { notesState } from '$lib/stores/notes.svelte';
  import { relativeTime } from '$lib/utils/dates';

  let label = $derived.by(() => {
    switch (notesState.saveStatus) {
      case 'saving':
        return 'Saving…';
      case 'error':
        return 'Unable to save changes.';
      case 'saved':
        return notesState.lastSavedAt ? `Saved ${relativeTime(notesState.lastSavedAt)}` : 'Saved';
      default:
        return '';
    }
  });
</script>

{#if label}
  <span
    class="text-xs"
    style="color: {notesState.saveStatus === 'error' ? 'var(--color-danger-500)' : 'var(--text-tertiary)'}"
    role="status"
  >
    {label}
    {#if notesState.saveStatus === 'error'}
      <button
        class="ml-1 underline underline-offset-2"
        onclick={() => notesState.markDirty()}
      >
        Retry
      </button>
    {/if}
  </span>
{/if}
