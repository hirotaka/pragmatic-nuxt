<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

import { PaginationLink } from './'

defineProps<{
  href: string
}>()
</script>

<template>
  <PaginationLink :href="href" aria-label="Go to next page" size="default" class="gap-1 pr-2.5">
    <span>Next</span>
    <ChevronRight class="size-4" />
  </PaginationLink>
</template>
