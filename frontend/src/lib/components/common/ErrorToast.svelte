<script lang="ts">
  import { Toast } from 'flowbite-svelte';
  import { fade } from 'svelte/transition';
  import { appState } from '$lib/stores/app.svelte';

  let visible = $derived(appState.error !== null);
</script>

{#if visible}
  <div class="pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
    <div class="pointer-events-auto">
      <Toast
        color="red"
        transition={fade}
        toastStatus={visible}
        onclose={() => appState.clearError()}
      >
        {appState.error?.message}
      </Toast>
    </div>
  </div>
{/if}
