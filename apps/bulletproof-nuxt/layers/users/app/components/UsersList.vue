<script setup lang="ts">
import DataTable from "~~/app/components/app/DataTable.vue";
import { computed, onUnmounted, unref } from "vue";
import { Badge } from "~~/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~~/app/components/ui/card";
import { useUsers } from "~users/app/composables/useUsers";
import { formatDate } from "#layers/base/app/utils/format";
import type { User } from "~auth/shared/types";
import type { TableColumn } from "~~/app/components/app/data-table";
import DeleteUser from "./DeleteUser.vue";

const { data, refresh } = await useUsers();

const users = computed(() => unref(data));

const adminCount = computed(() => users.value?.filter(user => user.role === "ADMIN").length ?? 0);
const memberCount = computed(() => users.value?.filter(user => user.role !== "ADMIN").length ?? 0);
const latestUser = computed(() => users.value?.[0]);
let active = true;

onUnmounted(() => {
  active = false;
});

const columns: TableColumn<User>[] = [
  { title: "First Name", field: "firstName" },
  { title: "Last Name", field: "lastName" },
  { title: "Email", field: "email" },
  { title: "Role", field: "role" },
  { title: "Created At", field: "createdAt" },
  { title: "", field: "id", name: "delete" },
];

const refreshUsers = async () => {
  if (!active) {
    return;
  }
  await refresh();
};
</script>

<template>
  <div
    v-if="users"
    class="hidden md:block"
  >
    <DataTable
      title="User directory"
      description="Monitor team access, roles, and account creation activity."
      :summary="`${users.length} users`"
      :data="users"
      :columns="columns"
      empty-title="No users found"
      empty-description="Users will appear here after registration."
    >
      <template #actions>
        <div class="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
          <span>{{ adminCount }} admins</span>
          <span>{{ memberCount }} members</span>
        </div>
      </template>
      <template #cell-email="{ entry }">
        <div class="grid min-w-0 gap-0.5">
          <span class="break-all font-medium text-foreground">{{ entry.email }}</span>
          <span class="break-all text-xs text-muted-foreground">Team {{ entry.teamId }}</span>
        </div>
      </template>
      <template #cell-role="{ entry }">
        <Badge :variant="entry.role === 'ADMIN' ? 'default' : 'secondary'">
          {{ entry.role }}
        </Badge>
      </template>
      <template #cell-createdAt="{ entry }">
        {{ formatDate(entry.createdAt) }}
      </template>
      <template #cell-delete="{ entry }">
        <DeleteUser
          :id="entry.id"
          :refresh="refreshUsers"
        />
      </template>
    </DataTable>
  </div>

  <Card
    v-if="users"
    class="min-w-0 md:hidden"
  >
    <CardHeader class="border-b">
      <div class="flex min-w-0 items-start justify-between gap-3">
        <div class="grid min-w-0 gap-1">
          <CardTitle>User directory</CardTitle>
          <p class="break-words text-sm text-muted-foreground">
            Monitor team access, roles, and account creation activity.
          </p>
        </div>
        <p class="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {{ users.length }} users
        </p>
      </div>
    </CardHeader>
    <CardContent class="p-0">
      <div
        v-if="!users.length"
        class="p-6 text-sm text-muted-foreground"
      >
        No users found. Users will appear here after registration.
      </div>
      <ul
        v-else
        class="divide-y"
        aria-label="User directory cards"
      >
        <li
          v-for="entry in users"
          :key="entry.id"
          class="grid min-w-0 gap-4 p-4"
        >
          <div class="flex min-w-0 items-start justify-between gap-3">
            <div class="grid min-w-0 gap-1">
              <p class="break-words text-sm font-semibold text-foreground">
                {{ entry.firstName }} {{ entry.lastName }}
              </p>
              <p class="break-all text-sm text-muted-foreground">
                {{ entry.email }}
              </p>
            </div>
            <Badge
              class="shrink-0"
              :variant="entry.role === 'ADMIN' ? 'default' : 'secondary'"
            >
              {{ entry.role }}
            </Badge>
          </div>
          <dl class="grid min-w-0 gap-2 text-sm">
            <div class="grid min-w-0 gap-1">
              <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Team
              </dt>
              <dd class="break-all text-foreground">
                {{ entry.teamId }}
              </dd>
            </div>
            <div class="grid min-w-0 gap-1">
              <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </dt>
              <dd class="text-foreground">
                {{ formatDate(entry.createdAt) }}
              </dd>
            </div>
          </dl>
          <div class="flex justify-end">
            <DeleteUser
              :id="entry.id"
              :refresh="refreshUsers"
            />
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
  <div
    v-if="users"
    class="mt-4 grid gap-4 md:grid-cols-3"
  >
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">
          Administrators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-semibold">
          {{ adminCount }}
        </div>
        <p class="text-xs text-muted-foreground">
          Accounts with full management access
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">
          Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-semibold">
          {{ memberCount }}
        </div>
        <p class="text-xs text-muted-foreground">
          Standard discussion participants
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium text-muted-foreground">
          Latest account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="truncate text-sm font-medium">
          {{ latestUser ? `${latestUser.firstName} ${latestUser.lastName}` : 'No accounts yet' }}
        </div>
        <p class="text-xs text-muted-foreground">
          {{ latestUser ? latestUser.email : 'Invite users to populate this workspace' }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
