<script setup lang="ts">
import { Button } from "~/components/ui/button";
</script>

<template>
  <footer class="border-grid border-t">
    <div class="container flex h-14 items-center justify-between gap-4">
      <p class="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <span>Built with Stackhacker UI</span>
        <span aria-hidden="true">•</span>
        <span>© {{ new Date().getFullYear() }}</span>
      </p>
      <Button
        as="a"
        href="https://github.com/stackhacker-ui/saas"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        title="GitHub"
        variant="ghost"
        size="icon"
        class="text-muted-foreground hover:text-foreground"
      >
        <Icon
          name="mdi:github"
          size="20"
          class="shrink-0"
          aria-hidden="true"
        />
      </Button>
    </div>
  </footer>
</template>
