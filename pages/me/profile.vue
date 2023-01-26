<script setup lang="ts">
const { data: profile } = useProfile()
</script>

<template>
  <AppContentWrapper v-if="profile" title="Profile">
    <div class="mt-4">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex justify-between">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              User Information
            </h3>
            <FeatureProfileUpdate />
          </div>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details of the user.
          </p>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl class="sm:divide-y sm:divide-gray-200">
            <FeatureProfileEntry
              label="First Name"
              :value="profile.firstName"
            />
            <FeatureProfileEntry label="Last Name" :value="profile.lastName" />
            <FeatureProfileEntry label="Email Address" :value="profile.email" />
            <FeatureProfileEntry label="Role" :value="profile.role" />
            <FeatureProfileEntry label="Bio" :value="profile.bio" />
          </dl>
        </div>
      </div>
    </div>
  </AppContentWrapper>
</template>
