<script setup lang="ts">
import UpdateProfile from "~users/app/components/UpdateProfile.vue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~~/app/components/ui/card";
import { useUser } from "#layers/auth/app/composables/useUser";

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useHead({
  title: "Profile",
});

const { user } = useUser();
</script>

<template>
  <LayoutsContentLayout
    title="Profile"
    description="Manage the account details used across this workspace."
  >
    <template #actions>
      <UpdateProfile v-if="user" />
    </template>
    <Card>
      <CardHeader>
        <CardTitle>
          User Information
        </CardTitle>
        <CardDescription>
          Personal details for the current user.
        </CardDescription>
      </CardHeader>
      <CardContent v-if="user">
        <dl class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-lg border bg-muted/30 p-4">
            <dt class="text-sm font-medium text-muted-foreground">
              First Name
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ user.firstName }}
            </dd>
          </div>
          <div class="rounded-lg border bg-muted/30 p-4">
            <dt class="text-sm font-medium text-muted-foreground">
              Last Name
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ user.lastName }}
            </dd>
          </div>
          <div class="rounded-lg border bg-muted/30 p-4">
            <dt class="text-sm font-medium text-muted-foreground">
              Email Address
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ user.email }}
            </dd>
          </div>
          <div class="rounded-lg border bg-muted/30 p-4">
            <dt class="text-sm font-medium text-muted-foreground">
              Role
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ user?.role }}
            </dd>
          </div>
          <div class="rounded-lg border bg-muted/30 p-4 sm:col-span-2">
            <dt class="text-sm font-medium text-muted-foreground">
              Bio
            </dt>
            <dd class="mt-1 text-sm font-medium">
              {{ user.bio || "No bio added yet." }}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardContent v-else>
        <p class="text-sm text-muted-foreground">
          Profile information is currently unavailable.
        </p>
      </CardContent>
    </Card>
  </LayoutsContentLayout>
</template>
