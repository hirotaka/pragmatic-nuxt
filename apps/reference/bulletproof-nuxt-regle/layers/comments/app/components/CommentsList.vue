<script setup lang="ts">
import { ArchiveX } from "lucide-vue-next";
import { onMounted } from "vue";
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
    <USpinner size="lg" />
  </div>

  <div
    v-else-if="!comments.length"
    aria-label="comments"
    class="flex h-40 flex-col items-center justify-center bg-white text-gray-500"
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
        class="w-full bg-white p-4 shadow-sm"
      >
        <Authorization :policy-check="user ? POLICIES['comment:delete'](user, comment) : false">
          <div class="flex justify-between">
            <div>
              <span class="text-xs font-semibold">
                {{ formatDate(comment.createdAt) }}
              </span>
              <span
                v-if="comment.author"
                class="text-xs font-bold"
              >
                by {{ comment.author.firstName }} {{ comment.author.lastName }}
              </span>
            </div>
            <DeleteComment
              :comment-id="comment.id"
              @deleted="handleCommentDeleted"
            />
          </div>
        </Authorization>

        <UMDPreview :value="comment.body" />
      </li>
    </ul>

    <div
      v-if="hasMore"
      class="flex items-center justify-center py-4"
    >
      <UButton @click="loadMore">
        <USpinner v-if="isLoading && currentPage > 1" />
        <template v-else>
          Load More Comments
        </template>
      </UButton>
    </div>
  </template>
</template>
