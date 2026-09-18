<script setup lang="ts">
import { computed } from "vue";
import { Pen } from "lucide-vue-next";
import FormDrawer from "~~/app/components/app/FormDrawer.vue";
import { Button } from "~~/app/components/ui/button";
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
const profile = computed(() => ({
  email: user.value?.email ?? "",
  firstName: user.value?.firstName ?? "",
  lastName: user.value?.lastName ?? "",
  bio: user.value?.bio ?? "",
}));
</script>

<template>
  <LayoutsContentLayout
    v-if="user"
    title="Profile"
    description="Manage the account details used across this workspace."
  >
    <template #actions>
      <FormDrawer title="Update Profile">
        <template #triggerButton>
          <Button
            variant="outline"
            size="sm"
          >
            <template #icon>
              <Pen class="size-4" />
            </template>
            Update Profile
          </Button>
        </template>

        <template #default="{ close }">
          <UpdateProfile
            :profile="profile"
            @success="close"
          />
        </template>

        <template #submitButton>
          <Button
            type="submit"
            form="update-profile"
            size="sm"
          >
            Submit
          </Button>
        </template>
      </FormDrawer>
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
      <CardContent>
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
              {{ user.role }}
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
    </Card>
  </LayoutsContentLayout>
</template>
