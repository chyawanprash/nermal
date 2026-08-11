<script lang="ts">
  import { Button, Input } from 'flowbite-svelte';
  import { EyeOutline, EyeSlashOutline, LockSolid } from 'flowbite-svelte-icons';
  import { vaultState } from '$lib/stores/vault.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { actions } from '$lib/actions';

  let password = $state('');
  let showPassword = $state(false);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);

  async function submit() {
    if (!vaultState.locked || password.length === 0) return;
    const ok = await actions.unlockVault({ path: vaultState.locked.path, password });
    if (!ok) {
      password = '';
      inputEl?.focus();
    }
  }

  function openAnother() {
    vaultState.reset();
    appState.goTo('no-vault');
  }
</script>

<div class="flex h-full flex-col items-center justify-center gap-6 px-6">
  <div class="flex flex-col items-center gap-3 text-center">
    <div
      class="flex h-11 w-11 items-center justify-center rounded-full"
      style="background: var(--surface-sunken)"
    >
      <LockSolid class="h-5 w-5" style="color: var(--text-secondary)" />
    </div>
    <div>
      <h1 class="text-lg font-semibold" style="color: var(--text-primary)">
        {vaultState.locked?.name ?? 'Vault'}
      </h1>
      <p class="text-sm" style="color: var(--text-tertiary)">Encrypted vault</p>
    </div>
  </div>

  <form
    class="flex w-full max-w-xs flex-col gap-3"
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
  >
    <div class="relative">
      <!-- svelte-ignore a11y_autofocus -->
      <Input
        bind:elementRef={inputEl}
        type={showPassword ? 'text' : 'password'}
        bind:value={password}
        placeholder="Password"
        autofocus
      />
      <button
        type="button"
        class="absolute inset-y-0 right-2 flex items-center"
        style="color: var(--text-tertiary)"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        onclick={() => (showPassword = !showPassword)}
      >
        {#if showPassword}<EyeSlashOutline class="h-4 w-4" />{:else}<EyeOutline class="h-4 w-4" />{/if}
      </button>
    </div>

    {#if appState.error?.code === 'INVALID_PASSWORD'}
      <p class="text-xs" style="color: var(--color-danger-500)">{appState.error.message}</p>
    {/if}

    <Button type="submit" disabled={vaultState.isUnlocking || password.length === 0}>
      {vaultState.isUnlocking ? 'Unlocking…' : 'Unlock'}
    </Button>

    <button
      type="button"
      class="text-xs underline underline-offset-2"
      style="color: var(--text-tertiary)"
      onclick={openAnother}
    >
      Open another vault
    </button>
  </form>
</div>
