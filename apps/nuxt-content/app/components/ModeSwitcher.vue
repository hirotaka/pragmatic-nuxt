<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
import { Button } from "~/components/ui/button";

const colorMode = useColorMode();

function toggle() {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    type="button"
    title="Toggle theme"
    class="text-muted-foreground hover:text-foreground"
    @click="toggle"
  >
    <span class="sr-only">Toggle theme</span>
    <Moon
      class="size-4 dark:hidden"
      aria-hidden="true"
    />
    <Sun
      class="hidden size-4 dark:block"
      aria-hidden="true"
    />
  </Button>
</template>
