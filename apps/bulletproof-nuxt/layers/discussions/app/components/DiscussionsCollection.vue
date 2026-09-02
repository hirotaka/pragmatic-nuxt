<script setup lang="ts">
import { computed, ref } from "vue";
import { useDiscussions } from "~discussions/app/composables/useDiscussions";

const currentPage = ref(1);
const limit = 10;
const { data, status, refresh } = await useDiscussions({ page: currentPage, limit });
const discussions = computed(() => Array.isArray(data.value?.data) && data.value.meta
  ? data.value
  : undefined);

const handlePageChange = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <LayoutsContentLayout
    title="Discussions"
    description="Create, update, and moderate team discussions."
  >
    <template #actions>
      <CreateDiscussion
        :refresh="refresh"
      />
    </template>
    <DiscussionsList
      v-if="discussions"
      :discussions="discussions"
      :is-pending="status === 'pending'"
      :refresh="refresh"
      @page-change="handlePageChange"
    />
  </LayoutsContentLayout>
</template>
