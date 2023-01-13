<script setup lang="ts">
const { user } = useAuth();

definePageMeta({
  middleware: "auth",
});
</script>

<template>
  <AppContentWrapper v-if="user" title="Profile">
    <div class="mt-4">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex justify-between">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              User Information
            </h3>
            <FeatureUserUpdate />
          </div>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details of the user.
          </p>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <FeatureUserEntry label="First Name" :value="user.firstName" />
            <FeatureUserEntry label="Last Name" :value="user.lastName" />
            <FeatureUserEntry label="Email Address" :value="user.email" />
            <FeatureUserEntry label="Role" :value="user.role" />
            <FeatureUserEntry label="Bio" :value="user.bio" />
          </dl>
        </div>
      </div>
    </div>
  </AppContentWrapper>
</template>
