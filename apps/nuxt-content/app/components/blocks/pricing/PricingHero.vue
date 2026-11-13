<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
  yearly: boolean;
}>();

defineEmits<{
  "update:yearly": [value: boolean];
}>();
</script>

<template>
  <section class="border-grid border-b py-16 text-center md:py-24">
    <div class="container">
      <h1 class="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-pretty md:text-6xl">
        {{ title }}
      </h1>
      <p class="mx-auto mt-5 max-w-2xl text-lg/8 text-muted-foreground">
        {{ description }}
      </p>
      <div class="border-grid mx-auto mt-8 inline-flex rounded-full border bg-muted/30 p-1">
        <button
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="!yearly ? 'bg-background ring-1 ring-border/60' : 'text-muted-foreground'"
          @click="$emit('update:yearly', false)"
        >
          Monthly
        </button>
        <button
          class="rounded-full px-4 py-2 text-sm font-medium"
          :class="yearly ? 'bg-background ring-1 ring-border/60' : 'text-muted-foreground'"
          @click="$emit('update:yearly', true)"
        >
          Yearly
        </button>
      </div>
    </div>
  </section>
</template>
