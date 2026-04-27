<script setup lang="ts">
import { ArchiveX } from "lucide-vue-next";
import { useComments } from "~comments/app/composables/useComments";
import { formatDate } from "#layers/base/app/utils/format";
import { POLICIES } from "#layers/auth/app/composables/useAuthorization";

interface CommentsListProps {
  discussionId: string;
}

const props = defineProps<CommentsListProps>();

const { user } = useUser();
const commentsQuery = useComments(() => props.discussionId);
</script>

<template>
  <div
    v-if="commentsQuery.isPending.value"
    class="flex h-48 w-full items-center justify-center"
  >
    <USpinner size="lg" />
  </div>

  <div
    v-else-if="!commentsQuery.comments.value.length"
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
        v-for="comment in commentsQuery.comments.value"
        :key="comment.id"
        :aria-label="`comment-${comment.body}`"
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
            <DeleteComment :comment-id="comment.id" />
          </div>
        </Authorization>

        <UMDPreview :value="comment.body" />
      </li>
    </ul>

    <div
      v-if="commentsQuery.hasNextPage.value"
      class="flex items-center justify-center py-4"
    >
      <UButton @click="commentsQuery.loadNextPage()">
        <USpinner v-if="commentsQuery.isFetchingNextPage.value" />
        <template v-else>
          Load More Comments
        </template>
      </UButton>
    </div>
  </template>
</template>
