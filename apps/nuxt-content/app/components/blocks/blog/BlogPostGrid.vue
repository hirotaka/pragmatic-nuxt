<script setup lang="ts">
interface PostItem {
  path: string;
  title?: string;
  description?: string;
  date: string | Date;
  image?: { src?: string };
  badge?: { label?: string };
  authors?: Array<{ name: string; avatar?: { src?: string } }>;
}

defineProps<{ posts: PostItem[] }>();

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}
</script>

<template>
  <div class="grid gap-5 py-8 md:grid-cols-2 lg:grid-cols-3">
    <NuxtLink
      v-for="(post, index) in posts"
      :key="post.path"
      :to="post.path"
      class="group border-grid overflow-hidden rounded-2xl border bg-card/70 hover:bg-card"
      :class="index === 0 ? 'md:col-span-2 lg:col-span-3 md:grid md:grid-cols-2' : ''"
    >
      <div
        class="aspect-video overflow-hidden"
        :class="index === 0 ? 'md:h-full' : ''"
      >
        <img
          :src="post.image?.src"
          :alt="post.title"
          class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        >
      </div>
      <div class="p-6">
        <div class="flex items-center gap-2 text-sm">
          <span class="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{{ post.badge?.label }}</span>
          <span class="text-muted-foreground">{{ formatDate(post.date) }}</span>
        </div>
        <h2
          class="mt-4 text-xl font-semibold tracking-tight text-pretty group-hover:text-primary"
          :class="index === 0 ? 'md:text-3xl' : ''"
        >{{ post.title }}</h2>
        <p class="mt-3 line-clamp-2 text-sm/6 text-muted-foreground">{{ post.description }}</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <div
            v-for="author in post.authors"
            :key="author.name"
            class="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <img
              :src="author.avatar?.src"
              :alt="author.name"
              class="size-6 rounded-full"
            >
            <span class="text-foreground">{{ author.name }}</span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
