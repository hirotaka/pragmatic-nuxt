<script setup lang="ts">
import { ArchiveBoxIcon } from '@heroicons/vue/24/outline'
import type { User } from '~/types/user'

type CommentsListProps = {
  discussionId: string
}

const props = defineProps<CommentsListProps>()
const { discussionId } = props

const { data } = useSession()
const { user } = data.value as any

const { data: comments, isLoading } = useComments({
  discussionId
})
</script>

<template>
  <AppSuspense :is-loading="isLoading">
    <template #fallback>
      <div class="w-full h-48 flex justify-center items-center">
        <BaseSpinner size="lg" />
      </div>
    </template>
    <div
      v-if="!comments?.length"
      role="list"
      aria-label="comments"
      class="
        bg-white
        text-gray-500
        h-40
        flex
        justify-center
        items-center
        flex-col
      "
    >
      <ArchiveBoxIcon class="h-10 w-10" />
      <h4>No Comments Found</h4>
    </div>
    <ul v-else aria-label="comments" class="flex flex-col space-y-3">
      <li
        v-for="(comment, index) in comments"
        :key="comment.id"
        class="w-full bg-white shadow-sm p-4"
        :aria-label="`comment-${comment.body}-${index}`"
      >
        <div class="flex justify-between">
          <span class="text-xs font-semibold">
            {{ formatDate(comment.createdAt) }}
          </span>
          <AppAuthorizationProvider
            :policy-check="POLICIES['comment:delete'](user as User, comment)"
          >
            <FeatureCommentDelete
              v-if="comment.id"
              :id="comment.id"
              :discussion-id="comment.discussionId"
            />
          </AppAuthorizationProvider>
        </div>
        <BaseMDPreview :value="comment.body" />
      </li>
    </ul>
  </AppSuspense>
</template>
