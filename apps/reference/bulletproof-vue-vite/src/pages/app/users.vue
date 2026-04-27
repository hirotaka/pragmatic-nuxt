<script setup lang="ts">
import { ContentLayout } from '@/components/layouts'
import { UsersList } from '@/features/users/components'
import { Authorization, ROLES } from '@/lib/authorization'
</script>

<template>
  <ContentLayout title="Users">
    <Authorization :allowed-roles="[ROLES.ADMIN]">
      <template #forbiddenFallback>
        <div>Only admin can view this.</div>
      </template>
      <UsersList />
    </Authorization>
  </ContentLayout>
</template>
