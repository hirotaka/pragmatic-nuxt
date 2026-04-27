<script setup lang="ts">
import UsersList from "~users/app/components/UsersList.vue";
import ContentLayout from "#layers/base/app/components/layouts/ContentLayout.vue";
import { ROLES } from "#layers/auth/app/composables/useAuthorization";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useHead({
  title: "Users",
});
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
