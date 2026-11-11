<script setup lang="ts">
import { Button } from "~/components/ui/button";
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
    <HeroBackground />
    <Button
      as="a"
      href="/"
      variant="outline"
      size="icon"
      class="absolute left-6 top-6 z-10 rounded-full"
      aria-label="Back home"
    >
      <Icon
        name="i-lucide-chevron-left"
        class="size-5"
      />
    </Button>
    <div class="border-grid w-full max-w-sm rounded-2xl border bg-card/85 p-6 backdrop-blur md:p-7">
      <slot />
    </div>
  </main>
</template>
