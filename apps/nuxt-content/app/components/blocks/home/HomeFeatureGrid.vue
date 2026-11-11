<script setup lang="ts">
import { Card, CardContent } from "~/components/ui/card";

interface FeatureCard {
  title: string;
  description: string;
  icon: string;
}

defineProps<{
  title: string;
  description: string;
  items: FeatureCard[];
}>();
</script>

<template>
  <section class="border-grid border-b py-16 md:py-24">
    <div class="container">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-semibold tracking-tight md:text-4xl">
          {{ title }}
        </h2>
        <p class="text-muted-foreground mt-4">
          {{ description }}
        </p>
      </div>
      <div class="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="item in items"
          :key="item.title"
          class="border-grid bg-card/70"
        >
          <CardContent class="p-6">
            <div class="flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
              <Icon
                :name="item.icon"
                class="size-5"
              />
            </div>
            <h3 class="mt-4 font-semibold">
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
