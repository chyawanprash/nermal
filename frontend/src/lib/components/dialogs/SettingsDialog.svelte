<script lang="ts">
  import { Modal, Button, Toggle, Range, Helper } from 'flowbite-svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { vaultState } from '$lib/stores/vault.svelte';
  import { actions } from '$lib/actions';
  import type { Theme } from '$lib/types/app';
  import { SHORTCUTS } from '$lib/config/shortcuts';
  import { formatShortcut } from '$lib/utils/keyboard';

  const THEMES: { value: Theme; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  let exportStatus = $state<'idle' | 'done'>('idle');

  async function exportVault() {
    exportStatus = 'idle';
    const ok = await actions.exportVault();
    if (ok) {
      exportStatus = 'done';
      setTimeout(() => (exportStatus = 'idle'), 2500);
    }
  }

  function close() {
    uiState.closeDialog();
  }
</script>

<Modal
  bind:open={() => uiState.activeDialog === 'settings', (v) => !v && close()}
  size="md"
  title="Settings"
>
  <div class="flex max-h-[65vh] flex-col gap-7 overflow-y-auto py-0.5 pr-1">
    <section class="space-y-2.5">
      <h3 class="text-[11px] font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Appearance
      </h3>
      <div class="flex gap-1 rounded-lg p-1" style="background: var(--surface-sunken)">
        {#each THEMES as t (t.value)}
          <button
            type="button"
            class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style="
              color: {uiState.theme === t.value ? 'var(--text-primary)' : 'var(--text-tertiary)'};
              background: {uiState.theme === t.value ? 'var(--surface-panel)' : 'transparent'};
              box-shadow: {uiState.theme === t.value ? 'var(--shadow-panel)' : 'none'};
            "
            onclick={() => uiState.setTheme(t.value)}
          >
            {t.label}
          </button>
        {/each}
      </div>
    </section>

    <section class="space-y-2.5">
      <h3 class="text-[11px] font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Editor
      </h3>
      <div
        class="flex flex-col gap-4 rounded-lg border p-3.5"
        style="border-color: var(--border-subtle)"
      >
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-sm" style="color: var(--text-primary)">
            <span>Font size</span>
            <span class="tabular-nums" style="color: var(--text-tertiary)"
              >{uiState.editorPreferences.fontSize}px</span
            >
          </div>
          <Range
            min="13"
            max="22"
            value={uiState.editorPreferences.fontSize}
            style="accent-color: var(--color-accent-500)"
            onchange={(e: Event) =>
              uiState.setEditorPreferences({ fontSize: Number((e.target as HTMLInputElement).value) })}
          />
        </div>
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-sm" style="color: var(--text-primary)">
            <span>Line height</span>
            <span class="tabular-nums" style="color: var(--text-tertiary)"
              >{uiState.editorPreferences.lineHeight.toFixed(1)}</span
            >
          </div>
          <Range
            min="1.3"
            max="2.2"
            step="0.1"
            value={uiState.editorPreferences.lineHeight}
            style="accent-color: var(--color-accent-500)"
            onchange={(e: Event) =>
              uiState.setEditorPreferences({ lineHeight: Number((e.target as HTMLInputElement).value) })}
          />
        </div>
        <div class="flex items-center justify-between text-sm" style="color: var(--text-primary)">
          <span>Word wrap</span>
          <Toggle
            checked={uiState.editorPreferences.wordWrap}
            onchange={(e: Event) =>
              uiState.setEditorPreferences({ wordWrap: (e.target as HTMLInputElement).checked })}
          />
        </div>
      </div>
    </section>

    <section class="space-y-2.5">
      <h3 class="text-[11px] font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Vault
      </h3>
      <div class="rounded-lg border" style="border-color: var(--border-subtle)">
        <div class="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm">
          <span style="color: var(--text-primary)">Change password</span>
          <Button size="xs" color="alternative" onclick={() => uiState.openDialog('change-password')}>
            Change
          </Button>
        </div>
        <div
          class="flex items-center justify-between gap-3 border-t px-3.5 py-2.5 text-sm"
          style="border-color: var(--border-subtle)"
        >
          <div class="min-w-0">
            <span style="color: var(--text-primary)">Backup vault</span>
            {#if exportStatus === 'done'}
              <Helper class="text-xs" color="green">Vault exported.</Helper>
            {/if}
          </div>
          <Button size="xs" color="alternative" disabled={appState.isLoading} onclick={exportVault}>
            Export as .nermal
          </Button>
        </div>
        {#if vaultState.current}
          <p
            class="truncate border-t px-3.5 py-2 text-xs"
            style="border-color: var(--border-subtle); color: var(--text-tertiary)"
          >
            {vaultState.current.path}
          </p>
        {/if}
      </div>
    </section>

    <section class="space-y-2.5">
      <h3 class="text-[11px] font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Keyboard Shortcuts
      </h3>
      <div class="rounded-lg border" style="border-color: var(--border-subtle)">
        {#each SHORTCUTS as shortcut, i (shortcut.id)}
          <div
            class="flex items-center justify-between gap-3 px-3.5 py-2 text-sm"
            style={i > 0 ? 'border-top: 1px solid var(--border-subtle)' : ''}
          >
            <span style="color: var(--text-primary)">{shortcut.label}</span>
            <kbd
              class="rounded-sm px-1.5 py-0.5 font-mono text-xs"
              style="background: var(--surface-sunken); color: var(--text-secondary)"
              >{formatShortcut(shortcut.keys)}</kbd
            >
          </div>
        {/each}
      </div>
    </section>

    <section class="space-y-1.5 border-t pt-4" style="border-color: var(--border-subtle)">
      <h3 class="text-[11px] font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        About
      </h3>
      <p class="text-xs leading-relaxed" style="color: var(--text-tertiary)">
        nermal — a local-first, encrypted notes vault. Your notes never leave this device.
      </p>
    </section>
  </div>
</Modal>
