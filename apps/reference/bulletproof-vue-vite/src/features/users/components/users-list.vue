<script setup lang="ts">
import { useUsers } from '../api/get-users'

import DeleteUser from './delete-user.vue'

import { Spinner } from '@/components/ui/spinner'
import { Table, type TableColumn } from '@/components/ui/table'
import type { User } from '@/types/api'
import { formatDate } from '@/utils/format'

const usersQuery = useUsers()

const columns: TableColumn<User>[] = [
  { title: 'First Name', field: 'firstName' },
  { title: 'Last Name', field: 'lastName' },
  { title: 'Email', field: 'email' },
  { title: 'Role', field: 'role' },
  { title: 'Created At', field: 'createdAt' },
  { title: '', field: 'id', name: 'delete' },
]
</script>

<template>
  <div v-if="usersQuery.isLoading.value" class="flex h-48 w-full items-center justify-center">
    <Spinner size="lg" />
  </div>
  <Table
    v-else-if="usersQuery.data.value?.data"
    :data="usersQuery.data.value.data"
    :columns="columns"
  >
    <template #cell-createdAt="{ entry }">
      {{ formatDate(entry.createdAt) }}
    </template>
    <template #cell-delete="{ entry }">
      <DeleteUser :id="entry.id" />
    </template>
  </Table>
</template>
