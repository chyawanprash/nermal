<script lang="ts">
  import { TrashBinOutline } from 'flowbite-svelte-icons';
  import { relativeTime } from '$lib/utils/dates';
  import { uiState } from '$lib/stores/ui.svelte';
  import SaveStatus from '$lib/components/common/SaveStatus.svelte';

  let {
    title = $bindable(),
    updatedAt,
    oninput,
  }: {
    title: string;
    updatedAt: string;
    oninput: () => void;
  } = $props();
</script>

<div class="flex flex-col gap-1 px-8 pt-8 pb-3">
  <div class="flex items-start justify-between gap-3">
    <input
      class="w-full bg-transparent text-2xl font-semibold outline-none"
      style="color: var(--text-primary)"
      style:caret-color="var(--color-accent-500)"
      placeholder="Untitled"
      bind:value={title}
      oninput={oninput}
    />
    <button
      type="button"
      class="mt-1 shrink-0 rounded-md p-1.5"
      style="color: var(--text-tertiary)"
      aria-label="Delete note"
      onclick={() => uiState.openDialog('delete-note')}
    >
      <TrashBinOutline class="h-4 w-4" />
    </button>
  </div>
  <div class="flex items-center gap-2 text-xs" style="color: var(--text-tertiary)">
    <span>Last edited {relativeTime(updatedAt)}</span>
    <SaveStatus />
  </div>
</div>
<div class="border-t" style="border-color: var(--border-subtle)"></div>
