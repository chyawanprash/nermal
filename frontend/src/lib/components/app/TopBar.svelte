<script lang="ts">
  import { Dropdown, DropdownItem, DropdownDivider } from 'flowbite-svelte';
  import {
    DotsHorizontalOutline,
    LockSolid,
    SearchOutline,
    CogOutline,
  } from 'flowbite-svelte-icons';
  import { vaultState } from '$lib/stores/vault.svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { actions } from '$lib/actions';

  let menuOpen = $state(false);

  function openDialogFromMenu(name: 'settings' | 'change-password') {
    menuOpen = false;
    uiState.openDialog(name);
  }

  function closeVaultFromMenu() {
    menuOpen = false;
    actions.closeVault();
  }
</script>

<header
  class="flex h-11 shrink-0 items-center justify-between border-b px-3"
  style="border-color: var(--border-subtle)"
>
  <span class="truncate text-sm font-medium" style="color: var(--text-primary)">
    {vaultState.current?.name}
  </span>

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
      aria-label="More options"
      onclick={() => (menuOpen = true)}
    >
      <DotsHorizontalOutline class="h-4 w-4" />
    </button>
    <Dropdown bind:isOpen={menuOpen} simple class="w-44">
      <DropdownItem onclick={() => openDialogFromMenu('settings')}>
        <CogOutline class="mr-2 inline h-3.5 w-3.5" />Settings
      </DropdownItem>
      <DropdownItem onclick={() => openDialogFromMenu('change-password')}>
        Change password
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onclick={closeVaultFromMenu}>Close vault</DropdownItem>
    </Dropdown>

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
