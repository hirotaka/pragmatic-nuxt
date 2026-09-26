<script setup lang="ts">
import type { ToasterProps } from "vue-sonner";
import { CircleCheck, Info, Loader2, OctagonX, TriangleAlert, X } from "lucide-vue-next";
import { Toaster as Sonner } from "vue-sonner";

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    v-bind="props"
    class="toaster group"
    :style="{
      '--normal-bg': 'var(--color-popover)',
      '--normal-text': 'var(--color-popover-foreground)',
      '--normal-border': 'var(--color-border)',
      '--border-radius': 'var(--radius-lg)',
    }"
  >
    <template #success-icon>
      <CircleCheck class="size-4" />
    </template>
    <template #info-icon>
      <Info class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlert class="size-4" />
    </template>
    <template #error-icon>
      <OctagonX class="size-4" />
    </template>
    <template #loading-icon>
      <Loader2 class="size-4 animate-spin" />
    </template>
    <template #close-icon>
      <X class="size-4" />
    </template>
  </Sonner>
</template>
