<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { notesState } from '$lib/stores/notes.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { actions } from '$lib/actions';
  import EditorHeader from './EditorHeader.svelte';
  import EmptyState from '$lib/components/common/EmptyState.svelte';
  import DeleteNoteDialog from '$lib/components/notes/DeleteNoteDialog.svelte';

  const DEBOUNCE_MS = 700;

  let title = $state('');
  let content = $state('');
  let currentId = $state<string | null>(null);
  let debounceHandle: ReturnType<typeof setTimeout> | undefined;

  async function flush() {
    if (debounceHandle) clearTimeout(debounceHandle);
    debounceHandle = undefined;
    if (currentId && notesState.dirty) {
      await actions.saveNote(currentId, title, content);
    }
  }

  actions.registerFlush(flush);

  function scheduleSave() {
    notesState.markDirty();
    if (debounceHandle) clearTimeout(debounceHandle);
    debounceHandle = setTimeout(flush, DEBOUNCE_MS);
  }

  $effect(() => {
    const note = notesState.activeNote;
    if (note && note.id !== currentId) {
      flush(); // flush the previously open note before switching away from it
      currentId = note.id;
      title = note.title;
      content = note.content;
    } else if (!note && currentId !== null) {
      currentId = null;
      title = '';
      content = '';
    }
  });
</script>

{#if notesState.activeNote}
  <div class="flex h-full flex-col">
    <EditorHeader bind:title updatedAt={notesState.activeNote.updatedAt} oninput={scheduleSave} />
    <textarea
      class="min-h-0 flex-1 resize-none bg-transparent px-8 pb-8 outline-none"
      style="
        color: var(--text-primary);
        font-family: var(--font-serif);
        font-size: {uiState.editorPreferences.fontSize}px;
        line-height: {uiState.editorPreferences.lineHeight};
        white-space: {uiState.editorPreferences.wordWrap ? 'pre-wrap' : 'pre'};
        overflow-x: {uiState.editorPreferences.wordWrap ? 'hidden' : 'auto'};
      "
      placeholder="Start writing…"
      bind:value={content}
      oninput={scheduleSave}
    ></textarea>
  </div>
  <DeleteNoteDialog />
{:else}
  <EmptyState title="No note selected." description="Select a note from the sidebar, or create a new one.">
    {#snippet action()}
      <Button size="sm" onclick={() => actions.createNote()}>New Note</Button>
    {/snippet}
  </EmptyState>
{/if}
