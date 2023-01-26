<script setup lang="ts">
const { data: profile } = useProfile()
</script>

<template>
  <AppContentWrapper title="Dashboard">
    <h1 class="text-xl mt-2">
      Welcome <b>{{ profile?.firstName }} {{ profile?.lastName }}</b>
    </h1>
    <h4 class="my-3">
      Your role is : <b>{{ profile?.role }}</b>
    </h4>
    <p class="font-medium">In this application you can:</p>
    <ul v-if="profile?.role === ROLES.USER" class="my-4 list-inside list-disc">
      <li>Create comments in discussions</li>
      <li>Delete own comments</li>
    </ul>
    <ul v-if="profile?.role === ROLES.ADMIN" class="my-4 list-inside list-disc">
      <li>Create discussions</li>
      <li>Edit discussions</li>
      <li>Delete discussions</li>
      <li>Comment on discussions</li>
      <li>Delete all comments</li>
    </ul>
  </AppContentWrapper>
</template>
