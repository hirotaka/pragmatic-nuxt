<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref } from "vue";
import { Plus } from "lucide-vue-next";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Button } from "~~/app/components/ui/button";
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
  refreshFirstPage,
  loadMore,
} = await useComments(() => props.discussionId);

const isRetrying = ref(false);

const refreshComments = async () => {
  await refreshFirstPage().catch(() => undefined);
};

const handleCreateSuccess = async (close: () => void) => {
  await refreshComments();
  close();
};

const handleRetry = async () => {
  if (isRetrying.value) return;

  isRetrying.value = true;
  try {
    await refreshFirstPage();
  }
  finally {
    isRetrying.value = false;
  }
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
        <FormDrawer
          :key="props.discussionId"
          title="Create Comment"
        >
          <template #triggerButton>
            <Button
              :disabled="!isInitialReady"
              variant="outline"
              size="sm"
            >
              <template #icon>
                <Plus class="size-4" />
              </template>
              Create Comment
            </Button>
          </template>

          <template #default="{ close }">
            <CreateCommentForm
              :disabled="!isInitialReady"
              :discussion-id="props.discussionId"
              @success="handleCreateSuccess(close)"
            />
          </template>

          <template #submitButton>
            <Button
              :disabled="!isInitialReady"
              type="submit"
              form="create-comment"
              size="sm"
            >
              Submit
            </Button>
          </template>
        </FormDrawer>
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
        :is-retrying="isRetrying"
        @delete-success="refreshComments"
        @load-more="loadMore"
        @retry="handleRetry"
      />
    </CardContent>
  </Card>
</template>
