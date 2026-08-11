<script lang="ts">
  import { Modal, Button } from 'flowbite-svelte';

  let {
    open = $bindable(false),
    title,
    body,
    confirmLabel = 'Confirm',
    danger = false,
    onconfirm,
  }: {
    open: boolean;
    title: string;
    body: string;
    confirmLabel?: string;
    danger?: boolean;
    onconfirm: () => void;
  } = $props();
</script>

<Modal bind:open size="xs" class="max-w-sm">
  <div class="space-y-3">
    <h3 class="text-base font-semibold" style="color: var(--text-primary)">{title}</h3>
    <p class="text-sm whitespace-pre-line" style="color: var(--text-secondary)">{body}</p>
    <div class="flex justify-end gap-2 pt-2">
      <Button color="alternative" size="sm" onclick={() => (open = false)}>Cancel</Button>
      <Button
        size="sm"
        color={danger ? 'red' : 'primary'}
        onclick={() => {
          open = false;
          onconfirm();
        }}
      >
        {confirmLabel}
      </Button>
    </div>
  </div>
</Modal>
