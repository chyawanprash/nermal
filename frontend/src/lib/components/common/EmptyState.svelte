<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    description,
    action,
  }: {
    title: string;
    description?: string;
    action?: Snippet;
  } = $props();
</script>

<div class="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
  <p class="text-sm font-medium" style="color: var(--text-secondary)">{title}</p>
  {#if description}
    <p class="max-w-xs text-sm" style="color: var(--text-tertiary)">{description}</p>
  {/if}
  {#if action}
    <div class="mt-3">{@render action()}</div>
  {/if}
</div>
