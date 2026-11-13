<script setup lang="ts">
interface VersionItem {
  path?: string;
  title?: string;
  description?: string;
  date: string | Date;
  image?: string;
}

defineProps<{ versions: VersionItem[] }>();

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}
</script>

<template>
  <div class="relative mt-8 space-y-8 before:absolute before:bottom-0 before:left-4 before:top-2 before:w-px before:bg-border md:before:left-40">
    <article
      v-for="version in versions"
      :key="version.path"
      class="relative grid gap-5 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8"
    >
      <time class="pl-10 text-sm text-muted-foreground md:pl-0 md:pt-1">{{ formatDate(version.date) }}</time>
      <div class="border-grid rounded-2xl border bg-card/70 p-6">
        <span class="absolute left-2 top-2 size-4 rounded-full bg-primary ring-4 ring-background md:left-[9.5rem]" />
        <img
          v-if="version.image"
          :src="version.image"
          :alt="version.title"
          class="mb-5 aspect-video w-full rounded-xl border border-border/60 object-cover"
        >
        <h2 class="text-2xl font-semibold tracking-tight">
          {{ version.title }}
        </h2>
        <p class="mt-2 text-muted-foreground">
          {{ version.description }}
        </p>
        <ContentRenderer
          :value="version"
          class="prose-content mt-5"
        />
      </div>
    </article>
  </div>
</template>
