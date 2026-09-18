<script setup lang="ts">
interface ContentLayoutProps {
  title?: string;
  description?: string;
}

const props = defineProps<ContentLayoutProps>();

const title = computed(() => props.title || "");
</script>

<template>
  <section class="grid min-w-0 gap-6">
    <div class="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="grid min-w-0 gap-1">
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="break-words text-sm text-muted-foreground"
        >
          {{ description }}
        </p>
      </div>
      <div
        v-if="$slots.actions"
        class="flex min-w-0 items-center gap-2"
      >
        <slot name="actions" />
      </div>
    </div>
    <div class="min-w-0">
      <slot />
    </div>
  </section>
</template>
