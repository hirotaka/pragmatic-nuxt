<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

export interface MDPreviewProps {
  value: string
}

const props = defineProps<MDPreviewProps>()

const html = computed(() => {
  return marked.parse(props.value)
})
</script>

<template>
  <div v-dompurify-html="html" class="p-2 w-full prose prose-indigo"></div>
</template>
