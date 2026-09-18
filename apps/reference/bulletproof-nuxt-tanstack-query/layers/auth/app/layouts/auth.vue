<script setup lang="ts">
import { GalleryVerticalEnd } from "lucide-vue-next";
</script>

<template>
  <main class="flex min-h-svh flex-col items-center justify-center gap-4 bg-muted p-4 md:p-6">
    <div class="flex w-full max-w-sm flex-col gap-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 self-center font-medium"
        aria-label="Bulletproof Nuxt home"
      >
        <div class="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd class="size-4" />
        </div>
        Bulletproof Nuxt
      </NuxtLink>
      <slot />
    </div>
  </main>
</template>
