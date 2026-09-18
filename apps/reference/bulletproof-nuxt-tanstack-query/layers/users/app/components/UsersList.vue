<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, onServerPrefetch, onUnmounted, ref } from "vue";
import DataTable from "~~/app/components/app/DataTable.vue";
import ConfirmationDialog from "~~/app/components/app/ConfirmationDialog.vue";
import { Button } from "~~/app/components/ui/button";
import { Spinner } from "~~/app/components/ui/spinner";
import { Badge } from "~~/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~~/app/components/ui/card";
import {
  deleteUserMutation,
  invalidateUserLists,
  normalizeUserPage,
  userListQuery,
} from "~users/app/queries/users";
import { useNotifications } from "#layers/base/app/composables/useNotifications";
import { useUser } from "#layers/auth/app/composables/useUser";
import { formatDate } from "#layers/base/app/utils/format";
import type { User } from "~auth/shared/types";
import type { TableColumn } from "~~/app/components/app/data-table";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const { isQueryEnabled } = useServerStateQueryState();
const limit = 10;
const currentPage = computed(() => normalizeUserPage(route.query.page));
const query = computed(() => userListQuery({
  page: currentPage.value,
  limit,
  enabled: isQueryEnabled.value,
}));
const userList = useQuery(query);
const { isFetching, isRefetchError, status } = userList;

if (import.meta.server) {
  onServerPrefetch(() => userList.suspense());
}

const usersResult = computed(() => userList.data.value?.meta && Array.isArray(userList.data.value.data)
  ? userList.data.value
  : undefined);
const users = computed(() => usersResult.value?.data);
const { user } = useUser();
const { addNotification } = useNotifications();
const deleteUser = useMutation(deleteUserMutation());
const selectedUserId = ref<string>();
const isDeletePending = computed(() => deleteUser.isPending.value);
const selectedUser = computed(() => users.value?.find(entry => entry.id === selectedUserId.value));
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

const handlePageChange = (page: number) => {
  void router.push({
    query: {
      ...route.query,
      page: page === 1 ? undefined : String(page),
    },
  });
};

const retryUsers = async () => {
  await userList.refetch({ throwOnError: true });
};

const selectUserForDeletion = (id: string) => {
  if (!active || isDeletePending.value || user.value?.id === id) return;
  selectedUserId.value = id;
};

const handleDelete = async () => {
  const id = selectedUserId.value;
  if (!id || isDeletePending.value || user.value?.id === id) return;

  try {
    await deleteUser.mutateAsync(id);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "User Deleted",
  });

  if (!active || selectedUserId.value !== id) return;
  selectedUserId.value = undefined;
  void invalidateUserLists(queryClient).catch(() => undefined);
};
</script>

<template>
  <div
    v-if="status === 'pending' && !users"
    class="flex justify-center p-8"
    role="status"
  >
    <Spinner size="lg" />
    <span class="sr-only">Loading users</span>
  </div>
  <div
    v-else-if="status === 'error' && !users"
    class="flex flex-col items-center justify-center gap-3 p-8 text-center"
    role="alert"
  >
    <p>Users could not be loaded.</p>
    <Button
      variant="outline"
      @click="retryUsers"
    >
      Retry
    </Button>
  </div>
  <div
    v-else-if="users"
    class="hidden md:block"
  >
    <p
      class="mb-3 min-h-5 text-sm text-muted-foreground"
      aria-live="polite"
    >
      {{ isFetching ? "Refreshing users..." : "" }}
    </p>
    <p
      v-if="isRefetchError"
      class="mb-3 text-sm text-destructive"
      role="alert"
    >
      Users could not be refreshed.
      <Button
        variant="link"
        @click="retryUsers"
      >
        Retry
      </Button>
    </p>
    <DataTable
      title="User directory"
      description="Monitor team access, roles, and account creation activity."
      :summary="`${usersResult?.meta.total ?? 0} users`"
      :data="users"
      :columns="columns"
      empty-title="No users found"
      empty-description="Users will appear here after registration."
      :pagination="{
        totalPages: usersResult?.meta.totalPages ?? 0,
        currentPage: usersResult?.meta.page ?? currentPage,
      }"
      @page-change="handlePageChange"
    >
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
        <Button
          v-if="user?.id !== entry.id"
          variant="destructive"
          aria-label="Delete User"
          @click="selectUserForDeletion(entry.id)"
        >
          Delete
        </Button>
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
          {{ usersResult?.meta.total ?? 0 }} users
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
            <Button
              v-if="user?.id !== entry.id"
              variant="destructive"
              aria-label="Delete User"
              @click="selectUserForDeletion(entry.id)"
            >
              Delete
            </Button>
          </div>
        </li>
      </ul>
    </CardContent>
  </Card>
  <ConfirmationDialog
    :open="selectedUser !== undefined"
    :is-loading="isDeletePending"
    title="Delete User"
    :body="selectedUser ? `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}?` : undefined"
    confirm-text="Delete User"
    @confirm="handleDelete"
    @update:open="(open) => { if (!open && !isDeletePending) selectedUserId = undefined; }"
  />
</template>
