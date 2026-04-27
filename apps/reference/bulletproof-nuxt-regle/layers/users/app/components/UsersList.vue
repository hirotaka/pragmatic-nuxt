<script setup lang="ts">
import { useUsers } from "~users/app/composables/useUsers";
import { formatDate } from "#layers/base/app/utils/format";
import type { User } from "~auth/shared/types";
import type { TableColumn } from "#layers/base/app/components/ui/types";
import DeleteUser from "./DeleteUser.vue";

const { data, isPending } = useUsers();

const columns: TableColumn<User>[] = [
  { title: "First Name", field: "firstName" },
  { title: "Last Name", field: "lastName" },
  { title: "Email", field: "email" },
  { title: "Role", field: "role" },
  { title: "Created At", field: "createdAt" },
  { title: "", field: "id", name: "delete" },
];
</script>

<template>
  <div
    v-if="isPending"
    class="flex h-48 w-full items-center justify-center"
  >
    <USpinner size="lg" />
  </div>
  <UTable
    v-else-if="data?.data"
    :data="data.data"
    :columns="columns"
  >
    <template #cell-createdAt="{ entry }">
      {{ formatDate(entry.createdAt) }}
    </template>
    <template #cell-delete="{ entry }">
      <DeleteUser :id="entry.id" />
    </template>
  </UTable>
</template>
