<script setup lang="ts">
import { MessageSquare, ShieldCheck, UserRoundCog } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const { user } = useUser();

const capabilities = computed(() => user.value?.role === "ADMIN"
  ? [
      "Create and update discussions",
      "Moderate discussions and comments",
      "Review registered users",
    ]
  : [
      "Read team discussions",
      "Create comments",
      "Delete your own comments",
    ]);

definePageMeta({
  middleware: "auth",
  layout: "dashboard",
});

useHead({
  title: "Dashboard",
});
</script>

<template>
  <LayoutsContentLayout
    title="Dashboard"
    description="Workspace overview for discussions, moderation, and team access."
  >
    <div
      v-if="!user"
      class="rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm"
    >
      Loading workspace...
    </div>
    <div
      v-else
      class="grid gap-6"
    >
      <Card class="overflow-hidden">
        <CardHeader class="border-b bg-muted/30">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Welcome back, {{ user.firstName }} {{ user.lastName }}</CardTitle>
              <CardDescription>{{ user.email }}</CardDescription>
            </div>
            <Badge>{{ user.role }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="grid gap-4 p-6 md:grid-cols-3">
          <div class="rounded-lg border bg-background p-4">
            <MessageSquare class="mb-3 size-5 text-primary" />
            <p class="font-medium">
              Discussion workflow
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              Keep team context in one searchable place.
            </p>
          </div>
          <div class="rounded-lg border bg-background p-4">
            <ShieldCheck class="mb-3 size-5 text-primary" />
            <p class="font-medium">
              Role-aware controls
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              Actions adapt to admin and member permissions.
            </p>
          </div>
          <div class="rounded-lg border bg-background p-4">
            <UserRoundCog class="mb-3 size-5 text-primary" />
            <p class="font-medium">
              Account management
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              Review profile and team access from the sidebar.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available actions</CardTitle>
          <CardDescription>What your current role can do in this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="grid gap-3 md:grid-cols-3">
            <li
              v-for="capability in capabilities"
              :key="capability"
              class="rounded-lg border bg-muted/30 p-3 text-sm"
            >
              {{ capability }}
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </LayoutsContentLayout>
</template>
