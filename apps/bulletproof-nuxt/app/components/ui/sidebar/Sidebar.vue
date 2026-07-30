<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { cn } from "@/lib/utils";

defineOptions({ name: "UiSidebar" });

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"];
  variant?: "sidebar" | "inset";
}>(), {
  class: undefined,
  variant: "sidebar",
});

const sidebar = inject<{ open: { value: boolean } }>("sidebar");
</script>

<template>
  <aside
    :class="cn(
      'app-sidebar fixed inset-y-0 left-0 z-30 hidden flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] md:flex',
      sidebar?.open.value === false && 'app-sidebar--collapsed',
      props.variant === 'inset' && 'm-2 h-[calc(100svh-1rem)] rounded-xl border shadow-sm',
      props.class,
    )"
  >
    <slot :collapsed="sidebar?.open.value === false" />
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 16rem;
}

.app-sidebar--collapsed {
  width: 4rem;
}
</style>
