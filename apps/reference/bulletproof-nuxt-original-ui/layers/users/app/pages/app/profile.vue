<script setup lang="ts">
import UpdateProfile from "~users/app/components/UpdateProfile.vue";
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
  <div
    v-if="user"
    class="py-6"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <h1 class="text-2xl font-semibold text-gray-900">
        Profile
      </h1>
    </div>
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      <div class="overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex justify-between">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              User Information
            </h3>
            <UpdateProfile />
          </div>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details of the user.
          </p>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt class="text-sm font-medium text-gray-500">
                First Name
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user.firstName }}
              </dd>
            </div>
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt class="text-sm font-medium text-gray-500">
                Last Name
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user.lastName }}
              </dd>
            </div>
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt class="text-sm font-medium text-gray-500">
                Email Address
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user.email }}
              </dd>
            </div>
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt class="text-sm font-medium text-gray-500">
                Role
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user.role }}
              </dd>
            </div>
            <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt class="text-sm font-medium text-gray-500">
                Bio
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user.bio }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
