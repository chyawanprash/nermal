<script lang="ts">
  import { Modal, Button, Label, Input, Helper } from 'flowbite-svelte';
  import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
  import { uiState } from '$lib/stores/ui.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { actions } from '$lib/actions';
  import { vault } from '$lib/tauri/vault';

  let directory = $state<string | null>(null);
  let name = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let showPassword = $state(false);

  let mismatch = $derived(confirmPassword.length > 0 && password !== confirmPassword);
  let canSubmit = $derived(
    Boolean(directory) && name.trim().length > 0 && password.length >= 8 && !mismatch,
  );

  async function pickDirectory() {
    directory = await vault.pickCreateDirectory();
  }

  function reset() {
    directory = null;
    name = '';
    password = '';
    confirmPassword = '';
    showPassword = false;
  }

  async function submit() {
    if (!canSubmit || !directory) return;
    const ok = await actions.createVault({ directory, name: name.trim(), password });
    if (ok) {
      reset();
      uiState.closeDialog();
    }
  }

  function close() {
    reset();
    uiState.closeDialog();
  }
</script>

<Modal
  bind:open={() => uiState.activeDialog === 'create-vault', (v) => !v && close()}
  size="sm"
  title="Create Vault"
>
  <form
    class="space-y-4"
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
  >
    <p class="text-sm" style="color: var(--text-secondary)">
      Your vault is encrypted with your password. The application cannot recover a forgotten
      password.
    </p>

    <div class="space-y-1.5">
      <Label for="vault-location">Location</Label>
      <div class="flex gap-2">
        <Input
          id="vault-location"
          readonly
          value={directory ?? ''}
          placeholder="Choose a folder…"
          class="flex-1"
        />
        <Button color="alternative" size="sm" type="button" onclick={pickDirectory}>
          Browse
        </Button>
      </div>
    </div>

    <div class="space-y-1.5">
      <Label for="vault-name">Vault name</Label>
      <!-- svelte-ignore a11y_autofocus -->
      <Input id="vault-name" bind:value={name} placeholder="Personal" autofocus />
    </div>

    <div class="space-y-1.5">
      <Label for="vault-password">Password</Label>
      <div class="relative">
        <Input
          id="vault-password"
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          placeholder="At least 8 characters"
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
    </div>

    <div class="space-y-1.5">
      <Label for="vault-password-confirm">Confirm password</Label>
      <Input
        id="vault-password-confirm"
        type={showPassword ? 'text' : 'password'}
        bind:value={confirmPassword}
        placeholder="Re-enter password"
      />
      {#if mismatch}
        <Helper class="text-xs" color="red">Passwords don't match.</Helper>
      {/if}
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <Button color="alternative" size="sm" type="button" onclick={close}>Cancel</Button>
      <Button size="sm" type="submit" disabled={!canSubmit || appState.isLoading}>
        {appState.isLoading ? 'Creating…' : 'Create'}
      </Button>
    </div>
  </form>
</Modal>
