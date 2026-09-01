<script setup lang="ts">
import DataTable from "~~/app/components/app/DataTable.vue";
import { computed } from "vue";
import { useQuery } from "@pinia/colada";
import AppSpinner from "~~/app/components/app/AppSpinner.vue";
import { Button } from "~~/app/components/ui/button";
import { usersQuery } from "~users/app/queries/users";
import { useUser } from "#layers/auth/app/composables/useUser";
import { formatDate } from "#layers/base/app/utils/format";
import type { User } from "~users/shared/types";
import type { TableColumn } from "~~/app/components/app/data-table";

const { user } = useUser();
const { data, error, status, refresh } = useQuery(() => usersQuery());
const users = computed(() => data.value);

const columns: TableColumn<User>[] = [
  { title: "First Name", field: "firstName" },
  { title: "Last Name", field: "lastName" },
  { title: "Email", field: "email" },
  { title: "Role", field: "role" },
  { title: "Created At", field: "createdAt", class: "hidden sm:table-cell" },
  { title: "", field: "id", name: "delete" },
];
</script>

<template>
  <AppSpinner
    v-if="status === 'pending' && !data"
    label="Loading users"
    class="flex h-48 w-full items-center justify-center"
    size="lg"
  />
  <div
    v-else-if="error && !data"
    aria-label="Users unavailable"
    class="flex flex-col items-center justify-center gap-3 p-8 text-center"
    role="alert"
  >
    <p>Users could not be loaded.</p>
    <Button
      variant="outline"
      @click="refresh()"
    >
      Retry
    </Button>
  </div>
  <div v-else-if="users">
    <DataTable
      title="User directory"
      description="Monitor team access, roles, and account creation activity."
      :summary="`${users.length} users`"
      :data="users"
      :columns="columns"
      empty-title="No users found"
      empty-description="Users will appear here after registration."
    >
      <template #cell-email="{ entry }">
        <span class="break-all font-medium text-foreground">{{ entry.email }}</span>
      </template>
      <template #cell-createdAt="{ entry }">
        {{ formatDate(entry.createdAt) }}
      </template>
      <template #cell-delete="{ entry }">
        <div class="flex h-8 justify-end">
          <DeleteUser
            v-if="user?.id !== entry.id"
            :id="entry.id"
            as-menu-item
            :action-label="`Open user actions for ${entry.email}`"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>
