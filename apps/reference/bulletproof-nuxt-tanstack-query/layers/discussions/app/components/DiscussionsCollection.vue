<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed, onServerPrefetch } from "vue";
import { Button } from "~~/app/components/ui/button";
import { Spinner } from "~~/app/components/ui/spinner";
import {
  discussionListQuery,
  normalizeDiscussionPage,
} from "~discussions/app/queries/discussions";

const route = useRoute();
const router = useRouter();
const { isQueryEnabled } = useServerStateQueryState();
const limit = 10;
const currentPage = computed(() => normalizeDiscussionPage(route.query.page));
const query = computed(() => discussionListQuery({
  page: currentPage.value,
  limit,
  enabled: isQueryEnabled.value,
}));
const discussionList = useQuery(query);

if (import.meta.server) {
  onServerPrefetch(() => discussionList.suspense());
}

const {
  data,
  isFetching,
  refetch,
  status,
} = discussionList;
const discussions = computed(() => data.value?.meta && Array.isArray(data.value.data)
  ? data.value
  : undefined);

const refresh = async (): Promise<void> => {
  await refetch({ throwOnError: true });
};

const retryRead = () => {
  void refresh().catch(() => undefined);
};

const handlePageChange = (page: number) => {
  void router.push({
    query: {
      ...route.query,
      page: page === 1 ? undefined : String(page),
    },
  });
};
</script>

<template>
  <LayoutsContentLayout
    title="Discussions"
    description="Create, update, and moderate team discussions."
  >
    <template #actions>
      <CreateDiscussion />
    </template>

    <div
      v-if="status === 'pending' && !discussions"
      class="flex justify-center p-8"
      role="status"
    >
      <Spinner size="lg" />
      <span class="sr-only">Loading discussions</span>
    </div>

    <div
      v-else-if="status === 'error' && !discussions"
      class="flex flex-col items-center justify-center gap-3 p-8 text-center"
      role="alert"
    >
      <p>Discussions could not be loaded.</p>
      <Button
        variant="outline"
        @click="retryRead"
      >
        Retry
      </Button>
    </div>

    <template v-else-if="discussions">
      <div
        v-if="status === 'error'"
        class="mb-4 flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
        role="alert"
      >
        <p>Discussions could not be refreshed.</p>
        <Button
          variant="outline"
          @click="retryRead"
        >
          Retry
        </Button>
      </div>
      <DiscussionsList
        :discussions="discussions"
        :is-pending="isFetching"
        @page-change="handlePageChange"
      />
    </template>
  </LayoutsContentLayout>
</template>
