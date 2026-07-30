<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/app/components/ui/card";
import { useComments } from "~comments/app/composables/useComments";

interface CommentsProps {
  discussionId: string;
}

const props = defineProps<CommentsProps>();
const {
  comments,
  currentPage,
  hasInitialError,
  hasMore,
  isInitialReady,
  isLoading,
  loadComments,
  loadMore,
} = await useComments(() => props.discussionId);

const refreshComments = () => loadComments(1);
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
          :disabled="!isInitialReady"
          :discussion-id="props.discussionId"
          :refresh="refreshComments"
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
        :is-initial-ready="isInitialReady"
        :is-loading="isLoading"
        :load-more="loadMore"
        :refresh="refreshComments"
      />
    </CardContent>
  </Card>
</template>
