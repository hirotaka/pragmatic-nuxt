<script setup lang="ts">
import { Button } from "~/components/ui/button";

interface LinkItem {
  label: string;
  to?: string;
  target?: string;
  icon?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const props = defineProps<{
  title: string;
  description?: string;
  links: LinkItem[];
}>();

const titleParts = computed(() => {
  const parts: Array<{ text: string; highlighted?: boolean }> = [];
  const pattern = /\[([^\]]+)\]\{[^}]*class="text-primary"[^}]*\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(props.title))) {
    if (match.index > lastIndex) {
      parts.push({ text: props.title.slice(lastIndex, match.index) });
    }

    parts.push({ text: match[1] || "", highlighted: true });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < props.title.length) {
    parts.push({ text: props.title.slice(lastIndex) });
  }

  return parts.length ? parts : [{ text: props.title }];
});
</script>

<template>
  <section class="relative overflow-hidden border-grid border-b py-18 md:py-28">
    <HeroBackground />
    <div class="container relative text-center">
      <h1 class="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-pretty md:text-7xl">
        <span
          v-for="(part, index) in titleParts"
          :key="index"
          :class="part.highlighted ? 'text-primary' : undefined"
        >{{ part.text }}</span>
      </h1>
      <p class="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg text-pretty md:text-xl">
        {{ description }}
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        <Button
          v-for="link in links"
          :key="link.label"
          as="a"
          :href="link.to"
          :target="link.target"
          :variant="link.variant || 'default'"
          size="lg"
        >
          <Icon
            v-if="link.icon"
            :name="link.icon"
            class="size-5"
          />
          {{ link.label }}
        </Button>
      </div>
      <PromotionalVideo />
    </div>
  </section>
</template>
