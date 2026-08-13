<script lang="ts">
  import { notesState } from '$lib/stores/notes.svelte';
  import { groupByDate } from '$lib/utils/dates';
  import NoteListItem from './NoteListItem.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import { Button } from 'flowbite-svelte';
  import { actions } from '$lib/actions';

  let groups = $derived(groupByDate(notesState.sortedByRecency, (n) => n.updatedAt));
</script>

{#if notesState.notes.length === 0}
  <EmptyState title="No notes yet." description="Create your first note.">
    {#snippet action()}
      <Button size="sm" onclick={() => actions.createNote()}>New Note</Button>
    {/snippet}
  </EmptyState>
{:else}
  <div class="flex h-full flex-col gap-4 overflow-y-auto px-2 py-2">
    {#each groups as [label, items] (label)}
      <div>
        <p
          class="px-2.5 pb-1 text-[11px] font-medium tracking-wide uppercase"
          style="color: var(--text-tertiary)"
        >
          {label}
        </p>
        <div class="flex flex-col gap-0.5">
          {#each items as note (note.id)}
            <NoteListItem {note} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
{/if}
