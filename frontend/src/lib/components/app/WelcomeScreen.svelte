<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { actions } from '$lib/actions';
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
</div>
