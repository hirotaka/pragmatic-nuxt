<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { inject } from "vue";
import { PanelLeft } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const sidebar = inject<{ toggle: () => void }>("sidebar");
</script>

<template>
  <Button
    type="button"
    variant="ghost"
    size="icon"
    :class="props.class"
    @click="sidebar?.toggle()"
  >
    <PanelLeft class="size-4" />
    <span class="sr-only">Toggle menu</span>
  </Button>
</template>
