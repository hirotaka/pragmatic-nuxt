<script setup lang="ts">
import { ContentLayout } from '@/components/layouts'
import { useUser } from '@/lib/auth'
import { ROLES } from '@/lib/authorization'

const user = useUser()
</script>

<template>
  <ContentLayout title="Dashboard">
    <div v-if="user.isLoading.value">Loading...</div>
    <div v-else-if="user.isError.value">Error loading user</div>
    <div v-else>
      <h1 class="text-xl">
        Welcome <b>{{ user.data.value?.firstName }} {{ user.data.value?.lastName }}</b>
      </h1>
      <h4 class="my-3">
        Your role is : <b>{{ user.data.value?.role }}</b>
      </h4>
    </div>
    <p class="font-medium">In this application you can:</p>
    <ul v-if="user.data.value?.role === ROLES.USER" class="my-4 list-inside list-disc">
      <li>Create comments in discussions</li>
      <li>Delete own comments</li>
    </ul>
    <ul v-if="user.data.value?.role === ROLES.ADMIN" class="my-4 list-inside list-disc">
      <li>Create discussions</li>
      <li>Edit discussions</li>
      <li>Delete discussions</li>
      <li>Comment on discussions</li>
      <li>Delete all comments</li>
    </ul>
  </ContentLayout>
</template>
