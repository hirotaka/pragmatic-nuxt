<script setup lang="ts">
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

interface PricingPlan {
  title: string;
  description: string;
  price: { month: string; year: string };
  button: { label: string };
  features: string[];
  highlight?: boolean;
}

defineProps<{
  plans: PricingPlan[];
  yearly: boolean;
}>();
</script>

<template>
  <section class="py-12 md:py-16">
    <div class="container grid gap-4 lg:grid-cols-3">
      <Card
        v-for="plan in plans"
        :key="plan.title"
        class="border-grid relative flex rounded-2xl p-0"
        :class="plan.highlight ? 'border-primary/50 ring-1 ring-primary/30' : 'bg-card/70'"
      >
        <CardContent class="flex w-full flex-col p-6">
          <Badge
            v-if="plan.highlight"
            class="absolute right-4 top-4"
          >
            Popular
          </Badge>
          <h2 class="text-xl font-semibold">
            {{ plan.title }}
          </h2>
          <p class="mt-2 text-sm/6 text-muted-foreground">
            {{ plan.description }}
          </p>
          <div class="mt-6 flex items-end gap-1">
            <span class="text-4xl font-semibold tracking-tight">{{ yearly ? plan.price.year : plan.price.month }}</span>
            <span class="text-muted-foreground pb-1 text-sm">/{{ yearly ? 'year' : 'month' }}</span>
          </div>
          <Button
            as="a"
            href="/signup"
            class="mt-6"
            :variant="plan.highlight ? 'default' : 'outline'"
          >
            {{ plan.button.label }}
          </Button>
          <ul class="mt-6 space-y-3 text-sm/6">
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex gap-3"
            >
              <Icon
                name="i-lucide-check"
                class="mt-0.5 size-4 shrink-0 text-primary"
              />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </section>
</template>
