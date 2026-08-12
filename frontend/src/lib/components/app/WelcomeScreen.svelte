<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { CloseOutline, LockOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { recentVaultsState } from '$lib/stores/recentVaults.svelte';
  import { actions } from '$lib/actions';
  import { relativeTime } from '$lib/utils/dates';

  let hasRecents = $derived(recentVaultsState.entries.length > 0);
</script>

{#if hasRecents}
  <div class="flex h-full flex-col overflow-y-auto px-8 py-6">
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold" style="color: var(--text-primary)">Welcome back</h1>
        <p class="text-sm" style="color: var(--text-secondary)">Your notes belong to you.</p>
      </div>
      <div class="flex shrink-0 gap-2">
        <Button color="alternative" size="sm" disabled={appState.isLoading} onclick={() => actions.openVaultFlow()}>
          {appState.isLoading ? (appState.loadingLabel ?? 'Working…') : 'Open Vault'}
        </Button>
        <Button size="sm" disabled={appState.isLoading} onclick={() => uiState.openDialog('create-vault')}>
          Create Vault
        </Button>
      </div>
    </div>

    <div class="mt-8">
      <p class="mb-3 text-[11px] font-medium tracking-wide uppercase" style="color: var(--text-tertiary)">
        Recent
      </p>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {#each recentVaultsState.entries as entry (entry.path)}
          <div class="group relative">
            <button
              type="button"
              class="flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
              style="background: var(--surface-panel); border-color: var(--border-subtle); box-shadow: var(--shadow-panel)"
              disabled={appState.isLoading}
              onclick={() => actions.openVaultByPath(entry.path)}
            >
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full"
                style="background: var(--surface-sunken)"
              >
                <LockOutline class="h-4 w-4" style="color: var(--text-secondary)" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium" style="color: var(--text-primary)">{entry.name}</p>
                <p class="truncate text-xs" style="color: var(--text-tertiary)" title={entry.path}>
                  {entry.path}
                </p>
                <p class="mt-1 text-[11px]" style="color: var(--text-tertiary)">
                  Opened {relativeTime(entry.lastOpenedAt)}
                </p>
              </div>
            </button>
            <button
              type="button"
              class="absolute top-2 right-2 shrink-0 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
              style="color: var(--text-tertiary); background: var(--surface-panel)"
              aria-label="Remove from recent vaults"
              onclick={() => recentVaultsState.remove(entry.path)}
            >
              <CloseOutline class="h-3.5 w-3.5" />
            </button>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else}
  <div class="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
    <div class="space-y-1.5">
      <h1 class="text-xl font-semibold" style="color: var(--text-primary)">Welcome</h1>
      <p class="text-sm" style="color: var(--text-secondary)">Your notes belong to you.</p>
    </div>

    <p class="max-w-xs text-sm" style="color: var(--text-tertiary)">
      Create a vault or open an existing vault.
    </p>

    <div class="flex w-full max-w-[220px] flex-col gap-2">
      <Button disabled={appState.isLoading} onclick={() => uiState.openDialog('create-vault')}>
        Create Vault
      </Button>
      <Button color="alternative" disabled={appState.isLoading} onclick={() => actions.openVaultFlow()}>
        {appState.isLoading ? (appState.loadingLabel ?? 'Working…') : 'Open Vault'}
      </Button>
    </div>
  </div>
{/if}
