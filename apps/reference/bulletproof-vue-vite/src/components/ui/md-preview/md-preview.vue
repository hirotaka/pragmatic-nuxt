<script setup lang="ts">
import { parse } from 'marked'

type Props = {
  value?: string
}

withDefaults(defineProps<Props>(), {
  value: '',
})
</script>

<template>
  <div class="prose prose-slate w-full p-2" v-dompurify-html="parse(value)"></div>
</template>
