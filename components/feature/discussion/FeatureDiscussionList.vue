<script setup lang="tsx">
import FeatureDiscussionDelete from './FeatureDiscussionDelete.vue'
import BaseLink from '@/components/base/BaseLink.vue'

const { data, isLoading } = useDiscussions()

const columns = [
  {
    title: 'Title',
    field: 'title'
  },
  {
    title: 'Created At',
    field: 'createdAt',
    Cell({ entry: { createdAt } }: { entry: { createdAt: number } }) {
      return <span>{formatDate(createdAt)}</span>
    }
  },
  {
    title: '',
    field: 'id',
    Cell({ entry: { id } }: { entry: { id: string } }) {
      return <BaseLink to={`/app/discussions/${id}`}>View</BaseLink>
    }
  },
  {
    title: '',
    field: 'id',
    Cell({ entry: { id } }: { entry: { id: string } }) {
      return id ? <FeatureDiscussionDelete id={id} /> : null
    }
  }
]
</script>

<template>
  <AppSuspense :is-loading="isLoading">
    <template #fallback>
      <div class="w-full h-48 flex justify-center items-center">
        <BaseSpinner size="lg" />
      </div>
    </template>
    <BaseTable v-if="data" :data="data" :columns="columns" />
  </AppSuspense>
</template>
