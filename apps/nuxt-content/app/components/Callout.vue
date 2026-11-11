<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

defineProps<{ icon?: string; title?: string; to?: string }>();
</script>

<template>
  <Alert class="border-grid my-6 block rounded-xl bg-muted/30 px-4 py-4">
    <div class="flex gap-3.5">
      <Icon
        v-if="icon"
        :name="icon"
        class="mt-0.5 size-5 shrink-0 text-primary"
      />
      <div class="min-w-0 flex-1">
        <AlertTitle
          v-if="title"
          class="mb-1 font-medium"
        >
          {{ title }}
        </AlertTitle>
        <AlertDescription class="text-base/7 sm:text-sm/6 [&_p]:my-0 [&_p+p]:mt-3">
          <slot />
        </AlertDescription>
        <NuxtLink
          v-if="to"
          :to="to"
          class="mt-3 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >Learn more</NuxtLink>
      </div>
    </div>
  </Alert>
</template>
