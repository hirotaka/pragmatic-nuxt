<script setup lang="ts">
import { parse } from "marked";

interface MDPreviewProps {
  value?: string;
}

withDefaults(defineProps<MDPreviewProps>(), {
  value: "",
});
</script>

<template>
  <div
    v-dompurify-html="parse(value)"
    class="prose prose-slate w-full p-2"
  />
</template>
