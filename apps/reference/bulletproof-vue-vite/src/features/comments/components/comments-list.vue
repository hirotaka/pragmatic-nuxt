<script setup lang="ts">
import { ArchiveX } from 'lucide-vue-next'
import { computed } from 'vue'

import { useInfiniteComments } from '../api/get-comments'

import DeleteComment from './delete-comment.vue'

import { Button } from '@/components/ui/button'
import { MDPreview } from '@/components/ui/md-preview'
import { Spinner } from '@/components/ui/spinner'
import { Authorization } from '@/lib/authorization'
import { formatDate } from '@/utils/format'

type CommentsListProps = {
  discussionId: string
}

const props = defineProps<CommentsListProps>()

const commentsQuery = useInfiniteComments({ discussionId: props.discussionId })

const comments = computed(() => {
  return commentsQuery.data.value?.pages.flatMap((page) => page.data) ?? []
})
</script>

<template>
  <div v-if="commentsQuery.isLoading.value" class="flex h-48 w-full items-center justify-center">
    <Spinner size="lg" />
  </div>

  <div
    v-else-if="!comments.length"
    role="list"
    aria-label="comments"
    class="flex h-40 flex-col items-center justify-center bg-white text-gray-500"
  >
    <ArchiveX class="size-10" />
    <h4>No Comments Found</h4>
  </div>

  <template v-else>
    <ul aria-label="comments" class="flex flex-col space-y-3">
      <li
        v-for="(comment, index) in comments"
        :key="comment.id || index"
        :aria-label="`comment-${comment.body}-${index}`"
        class="w-full bg-white p-4 shadow-sm"
      >
        <Authorization policy-check="comment:delete" :data="comment">
          <div class="flex justify-between">
            <div>
              <span class="text-xs font-semibold">
                {{ formatDate(comment.createdAt) }}
              </span>
              <span v-if="comment.author" class="text-xs font-bold">
                by {{ comment.author.firstName }} {{ comment.author.lastName }}
              </span>
            </div>
            <DeleteComment :discussion-id="props.discussionId" :id="comment.id" />
          </div>
        </Authorization>

        <MDPreview :value="comment.body" />
      </li>
    </ul>

    <div v-if="commentsQuery.hasNextPage.value" class="flex items-center justify-center py-4">
      <Button @click="commentsQuery.fetchNextPage()">
        <Spinner v-if="commentsQuery.isFetchingNextPage.value" />
        <template v-else>Load More Comments</template>
      </Button>
    </div>
  </template>
</template>
