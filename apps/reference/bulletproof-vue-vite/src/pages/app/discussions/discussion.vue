<script setup lang="ts">
import { useRoute } from 'vue-router'

import { ContentLayout } from '@/components/layouts'
import { Spinner } from '@/components/ui/spinner'
import { Comments } from '@/features/comments/components'
import { useDiscussion } from '@/features/discussions/api/get-discussion'
import { DiscussionView } from '@/features/discussions/components'

const route = useRoute()
const discussionId = route.params.discussionId as string

const discussionQuery = useDiscussion({
  discussionId,
})
</script>

<template>
  <div v-if="discussionQuery.isLoading.value" class="flex h-48 w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
  <ContentLayout
    v-else-if="discussionQuery.data.value?.data"
    :title="discussionQuery.data.value.data.title"
  >
    <DiscussionView :discussion-id="discussionId" />
    <div class="mt-8">
      <Comments :discussion-id="discussionId" />
    </div>
  </ContentLayout>
</template>
