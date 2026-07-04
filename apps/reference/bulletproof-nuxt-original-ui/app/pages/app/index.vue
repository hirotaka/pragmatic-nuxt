<script setup lang="ts">
const { user } = useUser();

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useHead({
  title: "Dashboard",
});
</script>

<template>
  <div class="py-6">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        Dashboard
      </h1>
    </div>
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      <div v-if="!user">
        Loading...
      </div>
      <div v-else>
        <h1 class="text-xl">
          Welcome <b>{{ user.firstName }} {{ user.lastName }}</b>
        </h1>
        <h4 class="my-3">
          Your role is : <b>{{ user.role }}</b>
        </h4>
      </div>
      <p class="font-medium">
        In this application you can:
      </p>
      <ul
        v-if="user?.role === 'USER'"
        class="my-4 list-inside list-disc"
      >
        <li>Create comments in discussions</li>
        <li>Delete own comments</li>
      </ul>
      <ul
        v-if="user?.role === 'ADMIN'"
        class="my-4 list-inside list-disc"
      >
        <li>Create discussions</li>
        <li>Edit discussions</li>
        <li>Delete discussions</li>
        <li>Comment on discussions</li>
        <li>Delete all comments</li>
      </ul>
    </div>
  </div>
</template>
