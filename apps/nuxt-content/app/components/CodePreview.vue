<script setup lang="ts">
defineProps<{ class?: string; label?: string }>();
</script>

<template>
  <div class="border-grid my-6 overflow-hidden rounded-xl border bg-background text-card-foreground">
    <div
      v-if="label"
      class="border-grid border-b bg-muted/20 px-4 py-2 font-mono text-xs font-medium text-muted-foreground"
    >
      {{ label }}
    </div>
    <div
      class="bg-background p-4 sm:p-5 [&_.code-surface]:my-0 [&_>_:first-child]:mt-0 [&_>_:last-child]:mb-0"
      :class="$props.class"
    >
      <slot />
    </div>
    <div class="border-grid border-t bg-muted/20 p-0 [&_.code-surface]:my-0 [&_.code-surface]:rounded-none [&_.code-surface]:border-0 [&_.code-surface>div:first-child]:bg-transparent [&_pre]:my-0">
      <slot name="code" />
    </div>
  </div>
</template>
