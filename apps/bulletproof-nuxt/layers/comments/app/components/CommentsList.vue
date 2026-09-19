<script setup lang="ts">
import { ArchiveX } from "lucide-vue-next";
import MarkdownPreview from "~~/app/components/app/MarkdownPreview.vue";
import { Button } from "~~/app/components/ui/button";
import { Spinner } from "~~/app/components/ui/spinner";
import CommentActionsMenu from "./CommentActionsMenu.vue";
import { formatDate } from "#layers/base/app/utils/format";
import { POLICIES } from "#layers/auth/app/composables/useAuthorization";
import { useComments } from "~comments/app/composables/useComments";

interface CommentsListProps {
  discussionId: string;
}

const props = defineProps<CommentsListProps>();

const {
  comments,
  isLoading,
  loadMore,
  refreshAfterDelete,
} = await useComments(() => props.discussionId);
const { user } = useUser();
</script>

<template>
  <template v-if="comments">
    <div
      v-if="!comments.data.length"
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
          v-for="(comment, index) in comments.data"
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
              <CommentActionsMenu
                :action-label="`Open comment actions for comment ${index + 1}`"
                :comment-id="comment.id"
                @success="refreshAfterDelete"
              />
            </Authorization>
          </div>

          <MarkdownPreview :value="comment.body" />
        </li>
      </ul>

      <div
        v-if="comments.meta.hasMore"
        class="flex items-center justify-center py-4"
      >
        <Button
          variant="outline"
          @click="loadMore"
        >
          <Spinner v-if="isLoading && comments.meta.page > 1" />
          <template v-else>
            Load More Comments
          </template>
        </Button>
      </div>
    </template>
  </template>
</template>
