<script lang="ts">
  import { LockSolid, SearchOutline, EyeSlashOutline, EyeOutline, HomeOutline } from 'flowbite-svelte-icons';
  import { vaultState } from '$lib/stores/vault.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { actions } from '$lib/actions';
  import { scramble } from '$lib/utils/streamer';

  let vaultName = $derived(
    uiState.streamerMode ? scramble(vaultState.current?.name ?? '') : (vaultState.current?.name ?? ''),
  );
</script>

<header
  class="flex h-11 shrink-0 items-center justify-between border-b px-3"
  style="border-color: var(--border-subtle)"
>
  <div class="flex min-w-0 items-center gap-1">
    <button
      type="button"
      class="shrink-0 rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)] active:opacity-70"
      style="color: var(--text-tertiary)"
      aria-label="Switch vault"
      onclick={() => actions.closeVault()}
    >
      <HomeOutline class="h-4 w-4" />
    </button>
    <span class="truncate text-sm font-medium" style="color: var(--text-primary)">
      {vaultName}
    </span>
  </div>

  <div class="flex items-center gap-1">
    <button
      type="button"
      class="rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)] active:opacity-70"
      style="color: var(--text-tertiary)"
      aria-label="Search"
      onclick={() => (uiState.searchOpen = true)}
    >
      <SearchOutline class="h-4 w-4" />
    </button>

    <button
      type="button"
      class="rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)] active:opacity-70"
      style="color: var(--text-tertiary)"
      aria-label="Streamer mode"
      aria-pressed={uiState.streamerMode}
      style:color={uiState.streamerMode ? 'var(--color-accent-500)' : 'var(--text-tertiary)'}
      onclick={() => uiState.toggleStreamerMode()}
    >
      {#if uiState.streamerMode}
        <EyeOutline class="h-4 w-4" />
      {:else}
        <EyeSlashOutline class="h-4 w-4" />
      {/if}
    </button>

    <button
      type="button"
      class="rounded-md p-1.5 transition-colors hover:bg-[var(--surface-hover)] active:opacity-70"
      style="color: var(--text-tertiary)"
      aria-label="Lock vault"
      onclick={() => actions.lockVault()}
    >
      <LockSolid class="h-4 w-4" />
    </button>
  </div>
</header>
