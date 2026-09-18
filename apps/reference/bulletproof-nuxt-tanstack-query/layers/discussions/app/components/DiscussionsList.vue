<script setup lang="ts">
import DataTable from "~~/app/components/app/DataTable.vue";
import { formatDate } from "#layers/base/app/utils/format";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import type { TableColumn } from "~~/app/components/app/data-table";
import DeleteDiscussion from "./DeleteDiscussion.vue";
import { useUser } from "#layers/auth/app/composables/useUser";

const emit = defineEmits<{
  discussionPrefetch: [id: string];
  pageChange: [page: number];
}>();

const props = defineProps<{
  discussions: PaginatedDiscussions;
  isPending: boolean;
}>();
const { isAdmin } = useUser();

const handlePageChange = (page: number) => {
  emit("pageChange", page);
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
    <p
      class="mb-3 min-h-5 text-sm text-muted-foreground"
      aria-live="polite"
    >
      {{ props.isPending ? "Refreshing discussions..." : "" }}
    </p>

    <DataTable
      title="Discussion queue"
      description="Track team conversations, moderation actions, and recent activity."
      :summary="`${props.discussions.meta.total} discussions`"
      :data="props.discussions.data"
      :columns="columns"
      empty-title="No Entries Found"
      empty-description="Create a discussion to start the conversation."
      :pagination="{
        totalPages: props.discussions.meta.totalPages,
        currentPage: props.discussions.meta.page,
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
