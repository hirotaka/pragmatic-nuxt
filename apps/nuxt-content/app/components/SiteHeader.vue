<script setup lang="ts">
import { Button } from "~/components/ui/button";
</script>

<template>
  <header class="border-grid bg-background/80 sticky top-0 z-30 border-b backdrop-blur">
    <div class="container flex h-14 items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <AppLogo />
        <TemplateMenu class="hidden sm:block" />
      </div>

      <div class="flex items-center gap-2">
        <ModeSwitcher />
        <Button
          as="a"
          href="https://github.com/stackhacker-ui/saas"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="GitHub"
          variant="ghost"
          size="icon"
        >
          <Icon
            name="mdi:github"
            size="20"
            class="shrink-0"
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  </header>
</template>
