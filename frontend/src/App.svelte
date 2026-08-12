<script lang="ts">
  import { onMount } from 'svelte';
  import { appState } from '$lib/stores/app.svelte';
  import { uiState, applyTheme } from '$lib/stores/ui.svelte';
  import AppShell from '$lib/components/app/AppShell.svelte';

  onMount(() => {
    applyTheme(uiState.theme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (uiState.theme === 'system') applyTheme('system');
    };
    media.addEventListener('change', onChange);

    // No vault-restoration command exists yet (see lib/tauri/vault.ts) — the
    // app always starts at the "no vault" screen for now.
    appState.isInitializing = false;

    return () => media.removeEventListener('change', onChange);
  });
</script>

<AppShell />
