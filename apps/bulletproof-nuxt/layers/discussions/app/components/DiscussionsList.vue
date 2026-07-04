<script setup lang="ts">
import { onMounted, ref } from "vue";
import DataTable from "~~/components/app/DataTable.vue";
import { Spinner } from "@/components/ui/spinner";
import { useDiscussions } from "~discussions/app/composables/useDiscussions";
import { formatDate } from "#layers/base/app/utils/format";
import type { Discussion } from "~discussions/shared/types";
import type { TableColumn } from "@/components/app/data-table";
import DeleteDiscussion from "./DeleteDiscussion.vue";
import { useUser } from "#layers/auth/app/composables/useUser";

const emit = defineEmits<{
  discussionPrefetch: [id: string];
}>();

const currentPage = ref(1);
const limit = 10;
const { isAdmin } = useUser();

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
      <Spinner />
    </div>

    <DataTable
      v-else
      title="Discussion queue"
      description="Track team conversations, moderation actions, and recent activity."
      :summary="discussions.data.value.meta ? `${discussions.data.value.meta.total} discussions` : undefined"
      :data="discussions.data.value.data"
      :columns="columns"
      empty-title="No Entries Found"
      empty-description="Create a discussion to start the conversation."
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
          class="inline-flex h-8 items-center rounded-md px-3 text-sm font-medium text-primary transition hover:bg-primary/10"
          @mouseenter="handleDiscussionHover(entry.id)"
        >
          View
        </NuxtLink>
      </template>
      <template #cell-delete="{ entry }">
        <DeleteDiscussion
          v-if="isAdmin"
          :id="entry.id"
          as-menu-item
          :action-label="`Open discussion actions for ${entry.title}`"
        />
      </template>
    </DataTable>
  </div>
</template>
