<script setup lang="tsx">
import { useUsers } from '@/composables/api/users/getUsers'
import { formatDate } from '@/utils/format'
import FeatureUserDelete from './FeatureUserDelete.vue'

const { data, isLoading } = useUsers()

const columns = [
  {
    title: 'First Name',
    field: 'firstName'
  },
  {
    title: 'Last Name',
    field: 'lastName'
  },
  {
    title: 'Email',
    field: 'email'
  },
  {
    title: 'Role',
    field: 'role'
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
      return <FeatureUserDelete id={id} />
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
