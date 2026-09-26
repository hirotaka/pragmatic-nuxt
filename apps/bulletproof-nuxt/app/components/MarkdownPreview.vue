<script setup lang="ts">
import { parse } from "marked";

defineProps<{
  value: string;
}>();
</script>

<template>
  <div
    v-dompurify-html="parse(value)"
    class="prose prose-slate w-full max-w-none rounded-lg border bg-card p-4 text-card-foreground"
  />
</template>
