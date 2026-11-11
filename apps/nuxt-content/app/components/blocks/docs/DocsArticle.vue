<script setup lang="ts">
interface DocsPage {
  title?: string;
  description?: string;
  body?: { toc?: { links?: Array<{ id: string; text: string }> } };
}

interface SurroundItem {
  path?: string;
  title?: string;
  description?: string;
}

defineProps<{
  page: DocsPage;
  surround?: SurroundItem[];
}>();
</script>

<template>
  <article class="grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="min-w-0">
      <header class="border-grid border-b pb-8 md:pb-10">
        <h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-pretty md:text-5xl">
          {{ page.title }}
        </h1>
        <p class="mt-4 max-w-2xl text-lg/8 text-muted-foreground">
          {{ page.description }}
        </p>
      </header>
      <ContentRenderer
        v-if="page.body"
        :value="page"
        class="prose-content py-8 md:py-10"
      />
      <DocsSurround
        :items="surround"
        previous-label="Read previous"
        next-label="Read next"
      />
    </div>
    <DocsToc :links="page.body?.toc?.links" />
  </article>
</template>
