<script setup lang="ts">
import { ArchiveX } from "lucide-vue-next";
import { onMounted } from "vue";
import MarkdownPreview from "~~/components/app/MarkdownPreview.vue";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useComments } from "~comments/app/composables/useComments";
import { formatDate } from "#layers/base/app/utils/format";
import { POLICIES } from "#layers/auth/app/composables/useAuthorization";

interface CommentsListProps {
  discussionId: string;
  refreshTrigger?: number;
}

const props = defineProps<CommentsListProps>();

const { user } = useUser();
const { comments, currentPage, hasMore, isLoading, loadComments, loadMore } = useComments(
  () => props.discussionId,
);

const handleCommentDeleted = async () => {
  await loadComments(1);
};

onMounted(async () => {
  await loadComments(1);
});

watch(
  () => props.refreshTrigger,
  async (val) => {
    if (val !== undefined) {
      await loadComments(1);
    }
  },
);
</script>

<template>
  <div
    v-if="isLoading && currentPage === 1"
    class="flex h-48 w-full items-center justify-center"
  >
    <Spinner size="lg" />
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
              as-menu-item
              :action-label="`Open comment actions for comment ${index + 1}`"
              @deleted="handleCommentDeleted"
            />
          </Authorization>
        </div>

        <MarkdownPreview :value="comment.body" />
      </li>
    </ul>

    <div
      v-if="hasMore"
      class="flex items-center justify-center py-4"
    >
      <Button
        variant="outline"
        @click="loadMore"
      >
        <Spinner v-if="isLoading && currentPage > 1" />
        <template v-else>
          Load More Comments
        </template>
      </Button>
    </div>
  </template>
</template>
