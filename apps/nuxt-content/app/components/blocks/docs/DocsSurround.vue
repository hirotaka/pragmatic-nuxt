<script setup lang="ts">
interface SurroundItem {
  path?: string;
  title?: string;
  description?: string;
}

const props = withDefaults(defineProps<{
  items?: SurroundItem[];
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
}>(), {
  label: "Documentation",
});

const visibleItems = computed(() => props.items
  ?.map((item, position) => ({ item, position }))
  .filter(({ item }) => item?.path && item?.title) || []);

function getLabel(position: number) {
  if (position === 0) return props.previousLabel || props.label;
  if (position === 1) return props.nextLabel || props.label;
  return props.label;
}

function getIcon(position: number) {
  return position === 0 ? "i-lucide-arrow-left" : "i-lucide-arrow-right";
}
</script>

<template>
  <nav
    v-if="visibleItems.length"
    class="border-grid mt-10 grid gap-3 border-t pt-8 md:grid-cols-2"
  >
    <NuxtLink
      v-for="{ item, position } in visibleItems"
      :key="item.path"
      :to="item.path"
      class="border-grid rounded-xl border p-4 hover:bg-muted/30"
      :class="position === 1 ? 'text-right md:col-start-2' : ''"
    >
      <span
        class="flex size-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground"
        :class="position === 1 ? 'ml-auto' : ''"
      >
        <Icon
          :name="getIcon(position)"
          class="size-4"
        />
        <span class="sr-only">{{ getLabel(position) }}</span>
      </span>
      <p class="mt-2 font-medium leading-6">{{ item.title }}</p>
      <p class="mt-1 line-clamp-2 text-sm/6 text-muted-foreground">{{ item.description }}</p>
    </NuxtLink>
  </nav>
</template>
