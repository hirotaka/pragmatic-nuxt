<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'

import { getDiscussionQueryOptions } from '../api/get-discussion'
import { useDiscussions } from '../api/get-discussions'

import DeleteDiscussion from './delete-discussion.vue'

import { Link } from '@/components/ui/link'
import { Spinner } from '@/components/ui/spinner'
import { Table, type TableColumn } from '@/components/ui/table'
import { paths } from '@/config/paths'
import type { Discussion } from '@/types/api'
import { formatDate } from '@/utils/format'

type DiscussionsListProps = {
  onDiscussionPrefetch?: (id: string) => void
}

const props = defineProps<DiscussionsListProps>()

const route = useRoute()
const queryClient = useQueryClient()

const page = +(route.query.page || 1)
const discussionsQuery = useDiscussions({ page })

const handleDiscussionHover = (id: string) => {
  // Prefetch the discussion data when the user hovers over the link
  queryClient.prefetchQuery(getDiscussionQueryOptions(id))
  props.onDiscussionPrefetch?.(id)
}

const columns: TableColumn<Discussion>[] = [
  { title: 'Title', field: 'title' },
  { title: 'Created At', field: 'createdAt' },
  { title: '', field: 'id', name: 'view' },
  { title: '', field: 'id', name: 'delete' },
]
</script>

<template>
  <div v-if="discussionsQuery.isLoading.value" class="flex h-48 w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
  <Table
    v-else-if="discussionsQuery.data.value?.data"
    :data="discussionsQuery.data.value.data"
    :columns="columns"
    :pagination="
      discussionsQuery.data.value?.meta
        ? {
            totalPages: discussionsQuery.data.value.meta.totalPages,
            currentPage: discussionsQuery.data.value.meta.page,
            rootUrl: '',
          }
        : undefined
    "
  >
    <template #cell-createdAt="{ entry }">
      {{ formatDate(entry.createdAt) }}
    </template>
    <template #cell-view="{ entry }">
      <Link
        :to="paths.app.discussion.getHref(entry.id)"
        @mouseenter="handleDiscussionHover(entry.id)"
      >
        View
      </Link>
    </template>
    <template #cell-delete="{ entry }">
      <DeleteDiscussion :id="entry.id" />
    </template>
  </Table>
</template>
