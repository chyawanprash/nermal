<script lang="ts">
  import { Modal, Button, Label, Input, Helper } from 'flowbite-svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { actions } from '$lib/actions';
  import { checkPassword, isPasswordValid } from '$lib/utils/password';

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');

  let passwordCheck = $derived(checkPassword(newPassword));
  let mismatch = $derived(confirmPassword.length > 0 && newPassword !== confirmPassword);
  let canSubmit = $derived(
    currentPassword.length > 0 && isPasswordValid(newPassword) && !mismatch,
  );

  function reset() {
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
  }

  function close() {
    reset();
    uiState.closeDialog();
  }

  async function submit() {
    if (!canSubmit) return;
    const ok = await actions.changePassword({ currentPassword, newPassword });
    if (ok) close();
  }
</script>

<Modal
  bind:open={() => uiState.activeDialog === 'change-password', (v) => !v && close()}
  size="sm"
  title="Change Password"
>
  <form
    class="space-y-4"
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
  >
    <p class="text-sm" style="color: var(--text-secondary)">
      Changing your password re-encrypts the vault with the new password.
    </p>

    <div class="space-y-1.5">
      <Label for="current-password">Current password</Label>
      <!-- svelte-ignore a11y_autofocus -->
      <Input id="current-password" type="password" bind:value={currentPassword} autofocus />
    </div>

    <div class="space-y-1.5">
      <Label for="new-password">New password</Label>
      <Input id="new-password" type="password" bind:value={newPassword} placeholder="At least 8 characters" />
      {#if passwordCheck.status === 'too-short' || passwordCheck.status === 'too-long'}
        <Helper class="text-xs" color="red">{passwordCheck.message}</Helper>
      {:else if passwordCheck.status === 'ok'}
        <Helper class="text-xs" color="green">{passwordCheck.message}</Helper>
      {/if}
    </div>

    <div class="space-y-1.5">
      <Label for="confirm-new-password">Confirm new password</Label>
      <Input id="confirm-new-password" type="password" bind:value={confirmPassword} />
      {#if mismatch}
        <Helper class="text-xs" color="red">Passwords don't match.</Helper>
      {/if}
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <Button color="alternative" size="sm" type="button" onclick={close}>Cancel</Button>
      <Button size="sm" type="submit" disabled={!canSubmit || appState.isLoading}>
        {appState.isLoading ? 'Changing…' : 'Change Password'}
      </Button>
    </div>
  </form>
</Modal>
