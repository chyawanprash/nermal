<script lang="ts">
  import { Modal, Button, Toggle, Range } from 'flowbite-svelte';
  import { uiState } from '$lib/stores/ui.svelte';
  import { vaultState } from '$lib/stores/vault.svelte';
  import type { Theme } from '$lib/types/app';
  import { SHORTCUTS } from '$lib/config/shortcuts';
  import { formatShortcut } from '$lib/utils/keyboard';

  const THEMES: { value: Theme; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  function close() {
    uiState.closeDialog();
  }
</script>

<Modal
  bind:open={() => uiState.activeDialog === 'settings', (v) => !v && close()}
  size="md"
  title="Settings"
>
  <div class="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
    <section class="space-y-2">
      <h3 class="text-xs font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Appearance
      </h3>
      <div class="flex gap-2">
        {#each THEMES as t (t.value)}
          <button
            type="button"
            class="flex-1 rounded-md border px-3 py-1.5 text-sm"
            style="
              border-color: {uiState.theme === t.value ? 'var(--color-accent-500)' : 'var(--border-subtle)'};
              color: var(--text-primary);
              background: {uiState.theme === t.value ? 'var(--surface-selected)' : 'transparent'};
            "
            onclick={() => uiState.setTheme(t.value)}
          >
            {t.label}
          </button>
        {/each}
      </div>
    </section>

    <section class="space-y-3">
      <h3 class="text-xs font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Editor
      </h3>
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-sm" style="color: var(--text-primary)">
          <span>Font size</span>
          <span style="color: var(--text-tertiary)">{uiState.editorPreferences.fontSize}px</span>
        </div>
        <Range
          min="13"
          max="22"
          value={uiState.editorPreferences.fontSize}
          onchange={(e: Event) =>
            uiState.setEditorPreferences({ fontSize: Number((e.target as HTMLInputElement).value) })}
        />
      </div>
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-sm" style="color: var(--text-primary)">
          <span>Line height</span>
          <span style="color: var(--text-tertiary)">{uiState.editorPreferences.lineHeight.toFixed(1)}</span>
        </div>
        <Range
          min="1.3"
          max="2.2"
          step="0.1"
          value={uiState.editorPreferences.lineHeight}
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
    </section>

    <section class="space-y-2">
      <h3 class="text-xs font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Vault
      </h3>
      <div class="flex items-center justify-between text-sm">
        <span style="color: var(--text-primary)">Change password</span>
        <Button size="xs" color="alternative" onclick={() => uiState.openDialog('change-password')}>
          Change
        </Button>
      </div>
      {#if vaultState.current}
        <p class="truncate text-xs" style="color: var(--text-tertiary)">{vaultState.current.path}</p>
      {/if}
    </section>

    <section class="space-y-2">
      <h3 class="text-xs font-semibold tracking-wide uppercase" style="color: var(--text-tertiary)">
        Keyboard shortcuts
      </h3>
      <div class="space-y-1">
        {#each SHORTCUTS as shortcut (shortcut.id)}
          <div class="flex items-center justify-between text-sm">
            <span style="color: var(--text-primary)">{shortcut.label}</span>
            <span class="text-xs" style="color: var(--text-tertiary)">{formatShortcut(shortcut.keys)}</span>
          </div>
        {/each}
      </div>
    </section>

    <section class="space-y-1 border-t pt-3" style="border-color: var(--border-subtle)">
      <p class="text-xs" style="color: var(--text-tertiary)">
        nermal — a local-first, encrypted notes vault. Your notes never leave this device.
      </p>
    </section>
  </div>
</Modal>
