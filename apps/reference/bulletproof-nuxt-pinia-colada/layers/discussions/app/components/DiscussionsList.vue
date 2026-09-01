<script setup lang="ts">
import { computed } from "vue";
import { useQuery, useQueryCache } from "@pinia/colada";
import AppSpinner from "~~/app/components/app/AppSpinner.vue";
import { Button } from "~~/app/components/ui/button";
import DataTable from "~~/app/components/app/DataTable.vue";
import { formatDate } from "#layers/base/app/utils/format";
import type { Discussion } from "~discussions/shared/types";
import type { TableColumn } from "~~/app/components/app/data-table";
import DeleteDiscussion from "./DeleteDiscussion.vue";
import { useUser } from "#layers/auth/app/composables/useUser";
import { discussionDetailQuery, discussionListQuery } from "~discussions/app/queries/discussions";

const route = useRoute();
const router = useRouter();
const limit = 10;
const queryCache = useQueryCache();
const currentPage = computed(() => Number(route.query.page || 1));
const { data, status, asyncStatus, refresh } = useQuery(() => discussionListQuery({
  page: currentPage.value,
  limit,
}));

const { isAdmin } = useUser();

const handlePageChange = (page: number) => {
  void router.push({
    query: {
      ...route.query,
      page: page === 1 ? undefined : String(page),
    },
  });
};

const handleDiscussionPointerDown = (id: string) => {
  const entry = queryCache.ensure(discussionDetailQuery({ id }));
  entry.ext.isPrefetch = true;
  void queryCache.refresh(entry).catch(() => undefined);
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
      v-if="data && asyncStatus === 'loading'"
      class="flex justify-end"
    >
      <AppSpinner label="Refreshing discussions" />
    </div>

    <AppSpinner
      v-if="status === 'pending' && !data"
      label="Loading discussions"
      class="flex justify-center p-8"
      size="lg"
    />

    <div
      v-else-if="status === 'error' && !data"
      aria-label="Discussions unavailable"
      class="flex flex-col items-center justify-center gap-3 p-8 text-center"
      role="alert"
    >
      <p>Discussions could not be loaded.</p>
      <Button
        variant="outline"
        @click="refresh()"
      >
        Retry
      </Button>
    </div>

    <template v-else>
      <DataTable
        title="Discussion queue"
        description="Track team conversations, moderation actions, and recent activity."
        :summary="`${data?.meta.total ?? 0} discussions`"
        :data="data?.data ?? []"
        :columns="columns"
        empty-title="No Entries Found"
        empty-description="Create a discussion to start the conversation."
        :pagination="{
          totalPages: data?.meta.totalPages ?? 0,
          currentPage: data?.meta.page ?? currentPage,
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
            @pointerdown="handleDiscussionPointerDown(entry.id)"
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
    </template>
  </div>
</template>
