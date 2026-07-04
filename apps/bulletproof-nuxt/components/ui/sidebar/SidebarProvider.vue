<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { provide, ref } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const open = ref(true);
const mobileOpen = ref(false);
const toggle = () => {
  if (import.meta.client && window.matchMedia?.("(min-width: 768px)").matches) {
    open.value = !open.value;
    return;
  }

  mobileOpen.value = !mobileOpen.value;
};
const setMobileOpen = (value: boolean) => {
  mobileOpen.value = value;
};

provide("sidebar", { open, mobileOpen, toggle, setMobileOpen });
</script>

<template>
  <div
    :data-sidebar-open="open ? 'true' : 'false'"
    :class="cn('group/sidebar-wrapper flex min-h-svh w-full bg-background text-foreground', props.class)"
  >
    <slot />
  </div>
</template>
