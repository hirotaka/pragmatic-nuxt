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
  <ContentLayout
    title="Users"
    description="Review registered users and manage administrative access."
  >
    <Authorization :allowed-roles="[ROLES.ADMIN]">
      <template #forbiddenFallback>
        <div class="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Only admin can view this.
        </div>
      </template>
      <UsersList />
    </Authorization>
  </ContentLayout>
</template>
