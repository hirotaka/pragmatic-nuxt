<script setup lang="ts">
import { computed } from "vue";
import DataTable from "~~/app/components/app/DataTable.vue";
import { formatDate } from "#layers/base/app/utils/format";
import type { Discussion } from "~discussions/shared/types";
import type { TableColumn } from "~~/app/components/app/data-table";
import DiscussionActionsMenu from "./DiscussionActionsMenu.vue";
import { useDiscussions } from "~discussions/app/composables/useDiscussions";
import { useUser } from "#layers/auth/app/composables/useUser";

const emit = defineEmits<{
  discussionPrefetch: [id: string];
}>();

const { isAdmin } = useUser();

const { currentPage, data, refreshAfterDelete, status } = await useDiscussions();

const discussions = computed(() => Array.isArray(data.value?.data) && data.value.meta
  ? data.value
  : undefined);

const handlePageChange = (page: number) => {
  currentPage.value = page;
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
  <div v-if="discussions">
    <p
      class="mb-3 min-h-5 text-sm text-muted-foreground"
      aria-live="polite"
    >
      {{ status === "pending" ? "Refreshing discussions..." : "" }}
    </p>

    <DataTable
      title="Discussion queue"
      description="Track team conversations, moderation actions, and recent activity."
      :summary="`${discussions.meta.total} discussions`"
      :data="discussions.data"
      :columns="columns"
      empty-title="No Entries Found"
      empty-description="Create a discussion to start the conversation."
      :pagination="{
        totalPages: discussions.meta.totalPages,
        currentPage: discussions.meta.page,
      }"
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
        <DiscussionActionsMenu
          v-if="isAdmin"
          :discussion="entry"
          :action-label="`Open discussion actions for ${entry.title}`"
          @success="refreshAfterDelete"
        />
      </template>
    </DataTable>
  </div>
</template>
