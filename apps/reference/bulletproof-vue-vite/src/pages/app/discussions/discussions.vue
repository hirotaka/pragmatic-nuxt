<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'

import { ContentLayout } from '@/components/layouts'
import { getInfiniteCommentsQueryOptions } from '@/features/comments/api/get-comments'
import { CreateDiscussion, DiscussionsList } from '@/features/discussions/components'

const queryClient = useQueryClient()

const handleDiscussionPrefetch = (id: string) => {
  // Prefetch the comments data when the user hovers over the link in the list
  queryClient.prefetchInfiniteQuery(getInfiniteCommentsQueryOptions(id))
}
</script>

<template>
  <ContentLayout title="Discussions">
    <div class="flex justify-end">
      <CreateDiscussion />
    </div>
    <div class="mt-4">
      <DiscussionsList :on-discussion-prefetch="handleDiscussionPrefetch" />
    </div>
  </ContentLayout>
</template>
