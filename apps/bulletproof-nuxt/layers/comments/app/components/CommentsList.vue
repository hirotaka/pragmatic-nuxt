<script setup lang="ts">
import { ref } from "vue";
import { ArchiveX, CircleAlert } from "lucide-vue-next";
import MarkdownPreview from "~~/app/components/app/MarkdownPreview.vue";
import { Button } from "~~/app/components/ui/button";
import { Spinner } from "~~/app/components/ui/spinner";
import { formatDate } from "#layers/base/app/utils/format";
import { POLICIES } from "#layers/auth/app/composables/useAuthorization";
import type { Comment } from "~comments/shared/types";

interface CommentsListProps {
  comments: Comment[];
  currentPage: number;
  hasInitialError: boolean;
  hasMore: boolean;
  isInitialReady: boolean;
  isLoading: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const props = defineProps<CommentsListProps>();

const { user } = useUser();
const isRetrying = ref(false);

const handleRetry = async () => {
  if (isRetrying.value) return;

  isRetrying.value = true;
  try {
    await props.refresh();
  }
  finally {
    isRetrying.value = false;
  }
};
</script>

<template>
  <div
    v-if="props.hasInitialError || isRetrying"
    class="flex h-40 items-center justify-center"
  >
    <div
      aria-label="Comments unavailable"
      class="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center"
      role="alert"
    >
      <CircleAlert class="size-8 text-destructive" />
      <div class="space-y-1">
        <h4 class="font-medium">
          Comments unavailable
        </h4>
        <p class="text-sm text-muted-foreground">
          We couldn't load comments. Try again.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        :disabled="isRetrying"
        @click="handleRetry"
      >
        <Spinner v-if="isRetrying" />
        Retry comments
      </Button>
    </div>
  </div>

  <div
    v-else-if="!props.isInitialReady"
    aria-label="Loading comments"
    class="flex h-48 w-full items-center justify-center"
    role="status"
  >
    <Spinner size="lg" />
    <span class="sr-only">Loading comments</span>
  </div>

  <div
    v-else-if="!props.comments.length"
    aria-label="comments"
    class="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground"
  >
    <ArchiveX class="size-10" />
    <h4>No Comments Found</h4>
  </div>

  <template v-else>
    <ul
      aria-label="comments"
      class="flex flex-col space-y-3"
    >
      <li
        v-for="(comment, index) in props.comments"
        :key="comment.id"
        :aria-label="`comment-${comment.body}-${index}`"
        class="w-full rounded-lg border bg-background p-4 shadow-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="text-xs font-semibold text-muted-foreground">
              {{ formatDate(comment.createdAt) }}
            </span>
            <span
              v-if="comment.author"
              class="ml-1 text-xs font-medium text-muted-foreground"
            >
              by {{ comment.author.firstName }} {{ comment.author.lastName }}
            </span>
          </div>
          <Authorization :policy-check="user ? POLICIES['comment:delete'](user, comment) : false">
            <DeleteComment
              :comment-id="comment.id"
              :refresh="props.refresh"
              as-menu-item
              :action-label="`Open comment actions for comment ${index + 1}`"
            />
          </Authorization>
        </div>

        <MarkdownPreview :value="comment.body" />
      </li>
    </ul>

    <div
      v-if="props.hasMore"
      class="flex items-center justify-center py-4"
    >
      <Button
        variant="outline"
        @click="props.loadMore"
      >
        <Spinner v-if="props.isLoading && props.currentPage > 1" />
        <template v-else>
          Load More Comments
        </template>
      </Button>
    </div>
  </template>
</template>
