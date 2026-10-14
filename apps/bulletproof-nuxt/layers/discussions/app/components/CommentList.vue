<script setup lang="ts">
import { ArchiveX } from "@lucide/vue";

interface CommentListProps {
  discussionId: string;
}

const props = defineProps<CommentListProps>();

const {
  data,
  isLoading,
  isLoadingMore,
  hasNextPage,
  loadMore,
  refresh,
} = await useCommentList(props.discussionId);
const { user } = useCurrentUser();

const comments = computed(() => data.value?.pages.flatMap(page => page.items));
</script>

<template>
  <template v-if="comments">
    <Empty
      v-if="!comments.length"
      aria-label="comments"
      class="min-h-40 border bg-muted/30 p-4"
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ArchiveX />
        </EmptyMedia>
        <EmptyTitle>
          <h4>No Comments Found</h4>
        </EmptyTitle>
      </EmptyHeader>
    </Empty>

    <template v-else>
      <ul
        aria-label="comments"
        class="flex flex-col gap-3"
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
              <CommentActionsMenu
                :action-label="`Open comment actions for comment ${index + 1}`"
                :comment-id="comment.id"
                :discussion-id="props.discussionId"
                @success="refresh"
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
          :disabled="isLoading"
          @click="loadMore"
        >
          <Spinner
            v-if="isLoadingMore"
            data-icon="inline-start"
            aria-hidden="true"
          />
          <template v-else>
            Load More Comments
          </template>
        </Button>
      </div>
    </template>
  </template>
</template>
