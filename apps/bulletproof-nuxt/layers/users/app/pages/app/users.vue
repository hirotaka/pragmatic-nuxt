<script setup lang="ts">
import { ROLES } from "#layers/auth/app/composables/useAuthorization";

definePageMeta({
  middleware: "auth",
});

useHead({
  title: "Users",
});
</script>

<template>
  <PageContent
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
  </PageContent>
</template>
