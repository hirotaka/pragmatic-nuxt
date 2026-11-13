<script setup lang="ts">
import { Button } from "~/components/ui/button";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";

interface PostArticle {
  title?: string;
  description?: string;
  date: string | Date;
  image?: { src?: string };
  badge?: { label?: string };
  authors?: Array<{ name: string; to?: string; avatar?: { src?: string } }>;
  body?: { toc?: { links?: Array<{ id: string; text: string }> } };
}

interface SurroundItem {
  path?: string;
  title?: string;
  description?: string;
}

defineProps<{
  post: PostArticle;
  surround?: SurroundItem[];
}>();

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });
}
</script>

<template>
  <article class="border-grid border-y">
    <div class="container py-12 md:py-16">
      <header class="max-w-3xl py-6 md:py-8">
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="secondary">
            {{ post.badge?.label }}
          </Badge>
          <span class="text-muted-foreground">·</span>
          <time class="text-muted-foreground">{{ formatDate(post.date) }}</time>
        </div>
        <h1 class="mt-5 text-4xl font-semibold tracking-tight text-pretty md:text-6xl">
          {{ post.title }}
        </h1>
        <p class="mt-5 text-lg/8 text-muted-foreground">
          {{ post.description }}
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <Button
            v-for="author in post.authors"
            :key="author.name"
            as="a"
            :href="author.to || '#'"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
          >
            <Avatar class="size-5">
              <AvatarImage
                :src="author.avatar?.src || ''"
                :alt="author.name"
              />
            </Avatar>
            {{ author.name }}
          </Button>
        </div>
      </header>
      <img
        v-if="post.image?.src"
        :src="post.image.src"
        :alt="post.title"
        class="mt-8 aspect-video w-full rounded-2xl border border-border/60 object-cover"
      >
      <div class="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div class="min-w-0">
          <ContentRenderer
            :value="post"
            class="prose-content"
          />
          <DocsSurround
            v-if="surround?.length"
            :items="surround"
            previous-label="Read previous"
            next-label="Read next"
          />
        </div>
        <DocsToc :links="post.body?.toc?.links" />
      </div>
    </div>
  </article>
</template>
