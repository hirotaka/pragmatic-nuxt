<script setup lang="ts">
import { Card as UiCard, CardContent } from "~/components/ui/card";

defineProps<{ title?: string; description?: string; icon?: string; to?: string }>();
</script>

<template>
  <component
    :is="to ? 'a' : 'div'"
    :href="to"
    class="prose-card my-4 block no-underline"
  >
    <UiCard class="border-grid h-full hover:bg-muted/30">
      <CardContent class="p-5">
        <Icon
          v-if="icon"
          :name="icon"
          class="mb-0 text-3xl text-primary"
        />
        <h3
          v-if="title"
          class="mt-0 text-base font-semibold"
        >
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="text-muted-foreground my-1 text-sm"
        >
          {{ description }}
        </p>
        <slot />
      </CardContent>
    </UiCard>
  </component>
</template>
