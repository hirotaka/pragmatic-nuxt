<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import Button from "./Button.vue";

interface Props {
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 7,
});

const emit = defineEmits<{
  "update:currentPage": [page: number];
}>();

const pages = computed(() => {
  const total = props.totalPages;
  const current = props.currentPage;
  const max = props.maxVisible;

  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor(max / 2);
  let start = current - half;
  let end = current + half;

  if (start < 1) {
    start = 1;
    end = max;
  }

  if (end > total) {
    end = total;
    start = total - max + 1;
  }

  const result: (number | string)[] = [];

  if (start > 1) {
    result.push(1);
    if (start > 2) {
      result.push("...");
    }
  }

  for (let i = start; i <= end; i++) {
    result.push(i);
  }

  if (end < total) {
    if (end < total - 1) {
      result.push("...");
    }
    result.push(total);
  }

  return result;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("update:currentPage", page);
  }
};

const previousPage = () => {
  goToPage(props.currentPage - 1);
};

const nextPage = () => {
  goToPage(props.currentPage + 1);
};
</script>

<template>
  <nav class="flex items-center justify-center gap-1">
    <Button
      v-if="currentPage > 1"
      variant="outline"
      size="icon"
      @click="previousPage"
    >
      <ChevronLeft class="h-4 w-4" />
      <span class="sr-only">Previous page</span>
    </Button>

    <template
      v-for="(page, index) in pages"
      :key="index"
    >
      <Button
        v-if="typeof page === 'number'"
        :variant="page === currentPage ? 'outline' : 'ghost'"
        :class="{ 'bg-gray-200': page === currentPage }"
        size="icon"
        @click="goToPage(page)"
      >
        {{ page }}
      </Button>
      <span
        v-else
        class="px-2 text-sm text-muted-foreground"
      >{{ page }}</span>
    </template>

    <Button
      v-if="currentPage < totalPages"
      variant="outline"
      size="icon"
      @click="nextPage"
    >
      <ChevronRight class="h-4 w-4" />
      <span class="sr-only">Next page</span>
    </Button>
  </nav>
</template>
