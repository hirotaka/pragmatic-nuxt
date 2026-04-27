<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useDiscussions } from "~discussions/app/composables/useDiscussions";
import { formatDate } from "#layers/base/app/utils/format";
import type { Discussion } from "~discussions/shared/types";
import type { TableColumn } from "#layers/base/app/components/ui/types";
import DeleteDiscussion from "./DeleteDiscussion.vue";

const emit = defineEmits<{
  discussionPrefetch: [id: string];
}>();

const currentPage = ref(1);
const limit = 10;

const discussions = useDiscussions({
  page: currentPage,
  limit,
});

const fetchDiscussions = async (page: number = 1) => {
  currentPage.value = page;
  await discussions.fetch();
};

onMounted(() => {
  fetchDiscussions();
});

const handlePageChange = (page: number) => {
  fetchDiscussions(page);
};

const handleDiscussionHover = (id: string) => {
  emit("discussionPrefetch", id);
};

const columns: TableColumn<Discussion>[] = [
  { title: "Title", field: "title" },
  { title: "Created At", field: "createdAt" },
  { title: "", field: "id", name: "view" },
  { title: "", field: "id", name: "delete" },
];
</script>

<template>
  <div>
    <div
      v-if="discussions.error.value"
      class="mb-4 text-sm text-destructive"
      role="alert"
    >
      {{ discussions.error.value.message }}
    </div>

    <div
      v-if="discussions.isPending.value"
      class="flex justify-center p-8"
    >
      <USpinner />
    </div>

    <UTable
      v-else
      :data="discussions.data.value.data"
      :columns="columns"
      :pagination="discussions.data.value.meta
        ? {
          totalPages: discussions.data.value.meta.totalPages,
          currentPage: discussions.data.value.meta.page,
        }
        : undefined
      "
      @page-change="handlePageChange"
    >
      <template #cell-createdAt="{ entry }">
        {{ formatDate(entry.createdAt) }}
      </template>
      <template #cell-view="{ entry }">
        <NuxtLink
          :to="`/app/discussions/${entry.id}`"
          class="text-slate-600 hover:text-slate-900"
          @mouseenter="handleDiscussionHover(entry.id)"
        >
          View
        </NuxtLink>
      </template>
      <template #cell-delete="{ entry }">
        <DeleteDiscussion :id="entry.id" />
      </template>
    </UTable>
  </div>
</template>
