<script setup lang="ts">
import PaginationPrimitive from "~~/components/ui/pagination/Pagination.vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
}>();

const emit = defineEmits<{
  "update:currentPage": [page: number];
}>();
</script>

<template>
  <PaginationPrimitive
    v-bind="props"
    @update:current-page="emit('update:currentPage', $event)"
  />
</template>
