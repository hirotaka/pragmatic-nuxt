<script setup lang="ts">
import { useDiscussion } from '../api/get-discussion'

import UpdateDiscussion from './update-discussion.vue'

import { MDPreview } from '@/components/ui/md-preview'
import { Spinner } from '@/components/ui/spinner'
import { formatDate } from '@/utils/format'

type DiscussionViewProps = {
  discussionId: string
}

const props = defineProps<DiscussionViewProps>()

const discussionQuery = useDiscussion({
  discussionId: props.discussionId,
})
</script>

<template>
  <div v-if="discussionQuery.isLoading.value" class="flex h-48 w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
  <div v-else-if="discussionQuery.data.value?.data">
    <span class="text-xs font-bold">
      {{ formatDate(discussionQuery.data.value.data.createdAt) }}
    </span>
    <span v-if="discussionQuery.data.value.data.author" class="ml-2 text-sm font-bold">
      by {{ discussionQuery.data.value.data.author.firstName }}
      {{ discussionQuery.data.value.data.author.lastName }}
    </span>
    <div class="mt-6 flex flex-col space-y-16">
      <div class="flex justify-end">
        <UpdateDiscussion :discussion-id="discussionId" />
      </div>
      <div>
        <div class="overflow-hidden bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <div class="mt-1 max-w-2xl text-sm text-gray-500">
              <MDPreview :value="discussionQuery.data.value.data.body" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
