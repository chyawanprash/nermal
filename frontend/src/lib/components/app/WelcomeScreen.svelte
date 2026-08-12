<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { CloseOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { recentVaultsState } from '$lib/stores/recentVaults.svelte';
  import { actions } from '$lib/actions';
  import { relativeTime } from '$lib/utils/dates';
</script>

<div class="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
  <div class="space-y-1.5">
    <h1 class="text-xl font-semibold" style="color: var(--text-primary)">Welcome</h1>
    <p class="text-sm" style="color: var(--text-secondary)">Your notes belong to you.</p>
  </div>

  <p class="max-w-xs text-sm" style="color: var(--text-tertiary)">
    Create a vault or open an existing vault.
  </p>

  <div class="flex flex-col gap-2 w-full max-w-[220px]">
    <Button disabled={appState.isLoading} onclick={() => uiState.openDialog('create-vault')}>
      Create Vault
    </Button>
    <Button color="alternative" disabled={appState.isLoading} onclick={() => actions.openVaultFlow()}>
      {appState.isLoading ? (appState.loadingLabel ?? 'Working…') : 'Open Vault'}
    </Button>
  </div>

  {#if recentVaultsState.entries.length > 0}
    <div class="w-full max-w-[280px] space-y-1.5 text-left">
      <p class="px-1 text-[11px] font-medium tracking-wide uppercase" style="color: var(--text-tertiary)">
        Recent
      </p>
      <div class="flex flex-col gap-0.5">
        {#each recentVaultsState.entries as entry (entry.path)}
          <div
            class="group flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-colors hover:bg-[var(--surface-hover)]"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left disabled:opacity-50"
              disabled={appState.isLoading}
              onclick={() => actions.openVaultByPath(entry.path)}
            >
              <p class="truncate text-sm font-medium" style="color: var(--text-primary)">{entry.name}</p>
              <p class="truncate text-xs" style="color: var(--text-tertiary)">
                {entry.path} · {relativeTime(entry.lastOpenedAt)}
              </p>
            </button>
            <button
              type="button"
              class="shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
              style="color: var(--text-tertiary)"
              aria-label="Remove from recent vaults"
              onclick={() => recentVaultsState.remove(entry.path)}
            >
              <CloseOutline class="h-3.5 w-3.5" />
            </button>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
