<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useInfiniteQuery } from "@tanstack/vue-query";
import { computed, onServerPrefetch } from "vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/app/components/ui/card";
import { commentsInfiniteQuery } from "~comments/app/queries/comments";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
const { isQueryEnabled } = useServerStateQueryState();
const query = computed(() => commentsInfiniteQuery({
  discussionId: props.discussionId,
  enabled: isQueryEnabled.value,
}));
const commentsQuery = useInfiniteQuery(query);

if (import.meta.server) {
  onServerPrefetch(() => commentsQuery.suspense());
}

const comments = computed(() => commentsQuery.data.value?.pages.flatMap(page => page.data) ?? []);
const currentPage = computed(() => commentsQuery.data.value?.pages.at(-1)?.meta.page ?? 1);
const hasInitialError = computed(() => commentsQuery.status.value === "error" && !commentsQuery.data.value);
const hasInitialData = computed(() => commentsQuery.data.value !== undefined);
const hasMore = computed(() => commentsQuery.hasNextPage.value);
const hasNextPageError = computed(() => commentsQuery.isFetchNextPageError.value);
const isLoadingMore = computed(() => commentsQuery.isFetchingNextPage.value);

const refreshFirstPage = async (): Promise<void> => {
  await commentsQuery.refetch();
};

const loadMore = async (): Promise<void> => {
  if (commentsQuery.isFetchingNextPage.value || !commentsQuery.hasNextPage.value) return;

  await commentsQuery.fetchNextPage();
};
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Comments</CardTitle>
          <CardDescription>Continue the discussion with your team.</CardDescription>
        </div>
        <CreateComment
          :key="props.discussionId"
          :disabled="!hasInitialData"
          :discussion-id="props.discussionId"
        />
      </div>
    </CardHeader>
    <CardContent>
      <CommentsList
        :key="props.discussionId"
        :comments="comments"
        :current-page="currentPage"
        :has-initial-error="hasInitialError"
        :has-more="hasMore"
        :has-next-page-error="hasNextPageError"
        :is-initial-ready="hasInitialData"
        :is-loading-more="isLoadingMore"
        :load-more="loadMore"
        :refresh="refreshFirstPage"
        :retry-load-more="loadMore"
      />
    </CardContent>
  </Card>
</template>
