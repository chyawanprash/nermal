<script lang="ts">
  import { Modal } from 'flowbite-svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { notesState } from '$lib/stores/notes.svelte';
  import { actions } from '$lib/actions';
  import { formatShortcut } from '$lib/utils/keyboard';

  interface Command {
    id: string;
    label: string;
    shortcut?: string;
    run: () => void;
  }

  let query = $state('');
  let highlighted = $state(0);

  let commands = $derived.by((): Command[] => {
    const list: Command[] = [
      { id: 'new-note', label: 'New Note', shortcut: formatShortcut({ key: 'n' }), run: () => actions.createNote() },
      { id: 'search', label: 'Search Notes', shortcut: formatShortcut({ key: 'k' }), run: () => (uiState.searchOpen = true) },
      { id: 'lock', label: 'Lock Vault', shortcut: formatShortcut({ key: 'l', shift: true }), run: () => actions.lockVault() },
      { id: 'close', label: 'Close Vault', run: () => actions.closeVault() },
      { id: 'settings', label: 'Settings', shortcut: formatShortcut({ key: ',' }), run: () => uiState.openDialog('settings') },
      { id: 'change-password', label: 'Change Password', run: () => uiState.openDialog('change-password') },
      { id: 'toggle-sidebar', label: 'Toggle Sidebar', run: () => uiState.toggleSidebar() },
    ];
    if (notesState.activeNoteId) {
      list.push({ id: 'delete-note', label: 'Delete Note', run: () => uiState.openDialog('delete-note') });
    }
    return list;
  });

  let filtered = $derived(
    query.trim().length === 0
      ? commands
      : commands.filter((c) => c.label.toLowerCase().includes(query.trim().toLowerCase())),
  );

  function close() {
    uiState.commandPaletteOpen = false;
    query = '';
    highlighted = 0;
  }

  function run(command: Command) {
    close();
    // Let this dialog's exit transition finish before a command opens
    // another one — opening a new native <dialog> while this one is still
    // closing makes the new one immediately close too.
    setTimeout(() => command.run(), 120);
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlighted = Math.min(highlighted + 1, filtered.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filtered[highlighted];
      if (command) run(command);
    }
  }
</script>

<Modal
  bind:open={() => uiState.commandPaletteOpen, (v) => (v ? (uiState.commandPaletteOpen = true) : close())}
  size="md"
  class="p-0"
  classes={{ close: 'hidden' }}
  dismissable
  outsideclose
>
  <div class="border-b px-4 py-4" style="border-color: var(--border-subtle)">
    <!-- svelte-ignore a11y_autofocus -->
    <input
      class="w-full bg-transparent text-base outline-none"
      style="color: var(--text-primary); outline: none"
      placeholder="Search commands…"
      bind:value={query}
      onkeydown={onkeydown}
      autofocus
    />
  </div>

  <div class="max-h-72 overflow-y-auto p-2">
    {#each filtered as command, i (command.id)}
      <button
        type="button"
        class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm"
        style="background: {i === highlighted ? 'var(--surface-hover)' : 'transparent'}; color: var(--text-primary)"
        onmouseenter={() => (highlighted = i)}
        onclick={() => run(command)}
      >
        <span>{command.label}</span>
        {#if command.shortcut}
          <span class="text-xs" style="color: var(--text-tertiary)">{command.shortcut}</span>
        {/if}
      </button>
    {:else}
      <p class="px-3 py-6 text-center text-sm" style="color: var(--text-tertiary)">No matching commands.</p>
    {/each}
  </div>
</Modal>
