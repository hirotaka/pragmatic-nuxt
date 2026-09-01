<script setup lang="ts">
import { computed } from "vue";
import { useInfiniteQuery } from "@pinia/colada";
import { ArchiveX } from "lucide-vue-next";
import AppSpinner from "~~/app/components/app/AppSpinner.vue";
import MarkdownPreview from "~~/app/components/app/MarkdownPreview.vue";
import { Button } from "~~/app/components/ui/button";
import { formatDate } from "#layers/base/app/utils/format";
import { POLICIES } from "#layers/auth/app/composables/useAuthorization";
import { commentsQuery } from "~comments/app/queries/comments";

interface CommentsListProps {
  discussionId: string;
}

const props = defineProps<CommentsListProps>();
const {
  data,
  status,
  asyncStatus,
  hasNextPage,
  loadNextPage,
  refresh,
} = useInfiniteQuery(() => commentsQuery({ discussionId: props.discussionId }));
const comments = computed(() => data.value?.pages.flatMap(page => page.data) ?? []);

const { user } = useUser();
</script>

<template>
  <div class="mb-4 flex justify-end">
    <CreateComment
      :key="props.discussionId"
      :disabled="status === 'pending' && !data"
      :discussion-id="props.discussionId"
    />
  </div>

  <AppSpinner
    v-if="status === 'pending' && !data"
    label="Loading comments"
    class="flex h-48 w-full items-center justify-center"
    size="lg"
  />

  <div
    v-else-if="status === 'error' && !data"
    aria-label="Comments unavailable"
    class="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 text-muted-foreground"
    role="alert"
  >
    <p>Comments could not be loaded.</p>
    <Button
      variant="outline"
      @click="refresh()"
    >
      Retry
    </Button>
  </div>

  <div
    v-else-if="!comments.length"
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
        v-for="(comment, index) in comments"
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
              :discussion-id="props.discussionId"
              as-menu-item
              :action-label="`Open comment actions for comment ${index + 1}`"
            />
          </Authorization>
        </div>

        <MarkdownPreview :value="comment.body" />
      </li>
    </ul>

    <div
      v-if="hasNextPage"
      class="flex items-center justify-center py-4"
    >
      <Button
        variant="outline"
        @click="loadNextPage"
      >
        <AppSpinner
          v-if="asyncStatus === 'loading'"
          label="Loading more comments"
        />
        <template v-else>
          Load More Comments
        </template>
      </Button>
    </div>
  </template>
</template>
