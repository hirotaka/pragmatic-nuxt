<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const sidebar = inject<{ open: { value: boolean } }>("sidebar");
</script>

<template>
  <main
    :class="cn(
      'app-sidebar-inset flex min-h-svh flex-1 flex-col transition-[margin]',
      sidebar?.open.value === false && 'app-sidebar-inset--collapsed',
      props.class,
    )"
  >
    <slot />
  </main>
</template>

<style scoped>
@media (min-width: 768px) {
  .app-sidebar-inset {
    margin-left: 16rem;
  }

  .app-sidebar-inset--collapsed {
    margin-left: 4rem;
  }
}
</style>
