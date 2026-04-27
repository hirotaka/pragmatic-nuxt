<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'

import { PaginationLink } from './'

defineProps<{
  href: string
}>()
</script>

<template>
  <PaginationLink
    :href="href"
    aria-label="Go to previous page"
    size="default"
    class="gap-1 pl-2.5"
  >
    <ChevronLeft class="size-4" />
    <span>Previous</span>
  </PaginationLink>
</template>
