<script setup lang="ts">
import { useHead } from '@unhead/vue'

export type HeadProps = {
  title?: string
  description?: string
}

const props = withDefaults(defineProps<HeadProps>(), {
  title: '',
  description: '',
})

useHead({
  title: props.title ? `${props.title} | Bulletproof Vue` : 'Bulletproof Vue',
  meta: [
    {
      name: 'description',
      content: props.description,
    },
  ],
})
</script>

<template>
  <div style="display: none"></div>
</template>
