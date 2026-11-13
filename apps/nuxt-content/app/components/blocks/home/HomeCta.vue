<script setup lang="ts">
import { Button } from "~/components/ui/button";

interface LinkItem {
  label: string;
  to?: string;
  target?: string;
  icon?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

defineProps<{
  title: string;
  description: string;
  links: LinkItem[];
}>();
</script>

<template>
  <section class="relative overflow-hidden py-20 text-center md:py-28">
    <StarsBg />
    <div class="container">
      <h2 class="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-pretty md:text-5xl">
        {{ title }}
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-muted-foreground">
        {{ description }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-2.5">
        <Button
          v-for="link in links"
          :key="link.label"
          as="a"
          :href="link.to"
          :target="link.target"
          :variant="link.variant || 'default'"
        >
          <Icon
            v-if="link.icon"
            :name="link.icon"
            class="size-5"
          />
          {{ link.label }}
        </Button>
      </div>
    </div>
  </section>
</template>
