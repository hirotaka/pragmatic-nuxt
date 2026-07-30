<script setup lang="ts">
import type { Component } from "vue";
import { cn } from "~base/app/lib/utils";

type NavItem = {
  name: string;
  to: string;
  icon: Component;
  active?: boolean;
};

defineProps<{
  items: NavItem[];
  collapsed?: boolean;
}>();
</script>

<template>
  <nav
    aria-label="Primary navigation"
    class="grid gap-1 px-2"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.name"
      :to="item.to"
      :aria-current="item.active ? 'page' : undefined"
      :class="cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        item.active && 'bg-sidebar-accent text-sidebar-accent-foreground',
        collapsed && 'justify-center px-2',
      )"
    >
      <component
        :is="item.icon"
        class="size-4 shrink-0"
        aria-hidden="true"
      />
      <span
        v-if="!collapsed"
        class="truncate"
      >{{ item.name }}</span>
      <span
        v-else
        class="sr-only"
      >{{ item.name }}</span>
    </NuxtLink>
  </nav>
</template>
