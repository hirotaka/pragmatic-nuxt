<script setup lang="ts">
interface TocLink {
  id: string;
  text: string;
}

defineProps<{ links?: TocLink[] }>();
</script>

<template>
  <aside
    v-if="links?.length"
    class="hidden lg:block"
  >
    <div class="sticky top-24 space-y-1 border-l border-border/60 pl-4 text-sm">
      <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        On this page
      </p>
      <a
        v-for="link in links"
        :key="link.id"
        :href="`#${link.id}`"
        class="block rounded-sm py-1.5 text-muted-foreground hover:text-foreground"
      >
        {{ link.text }}
      </a>
    </div>
  </aside>
</template>
