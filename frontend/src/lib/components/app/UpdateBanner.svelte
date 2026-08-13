<script lang="ts">
  import { CloseOutline, ArrowUpOutline } from 'flowbite-svelte-icons';
  import { openUrl } from '@tauri-apps/plugin-opener';
  import { updateState } from '$lib/stores/update.svelte';

  let visible = $derived(updateState.status === 'available' && !updateState.dismissed);
</script>

{#if visible}
  <div
    class="flex items-center justify-between gap-3 border-b px-4 py-2 text-sm"
    style="background: var(--color-accent-500); color: var(--text-on-accent); border-color: var(--border-subtle)"
  >
    <div class="flex items-center gap-2">
      <ArrowUpOutline class="h-3.5 w-3.5 shrink-0" />
      <span>nermal {updateState.latestVersion} is available (you have {updateState.currentVersion}).</span>
    </div>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded-md px-2.5 py-1 text-xs font-medium underline-offset-2 hover:underline"
        onclick={() => updateState.releaseUrl && openUrl(updateState.releaseUrl)}
      >
        View release
      </button>
      <button
        type="button"
        class="rounded-md p-1 opacity-80 hover:opacity-100"
        aria-label="Dismiss"
        onclick={() => updateState.dismiss()}
      >
        <CloseOutline class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
{/if}
