<script setup lang="ts">
defineProps<{ reverse?: boolean; card?: boolean }>();
</script>

<template>
  <div :class="card ? 'border-grid rounded-xl border bg-card p-4' : ''">
    <div class="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-3">
      <div :class="reverse ? 'md:order-2' : ''">
        <slot name="image" />
      </div>
      <div class="md:col-span-2">
        <slot />
      </div>
    </div>
  </div>
</template>
