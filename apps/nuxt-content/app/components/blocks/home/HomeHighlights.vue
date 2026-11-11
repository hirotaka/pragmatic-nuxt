<script setup lang="ts">
import { Card, CardContent } from "~/components/ui/card";

interface HighlightItem {
  title: string;
  description: string;
  icon: string;
}

defineProps<{
  headline?: string;
  title: string;
  description: string;
  items: HighlightItem[];
}>();
</script>

<template>
  <section
    id="highlights"
    class="border-grid border-b py-16 md:py-24"
  >
    <div class="container">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-sm font-medium text-primary">
          {{ headline }}
        </p>
        <h2 class="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          {{ title }}
        </h2>
        <p class="mt-4 text-muted-foreground">
          {{ description }}
        </p>
      </div>
      <div class="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card
          v-for="item in items"
          :key="item.title"
          class="border-grid bg-card/70"
        >
          <CardContent class="p-5">
            <div class="flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
              <Icon
                :name="item.icon"
                class="size-5"
              />
            </div>
            <h3 class="mt-5 text-sm font-semibold">
              {{ item.title }}
            </h3>
            <p class="mt-2 text-sm/6 text-muted-foreground">
              {{ item.description }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
