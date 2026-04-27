<script setup lang="ts">
import { ContentLayout } from '@/components/layouts'
import { UpdateProfile } from '@/features/users/components'
import { useUser } from '@/lib/auth'

const user = useUser()
</script>

<template>
  <ContentLayout v-if="user.data.value" title="Profile">
    <div class="overflow-hidden bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <div class="flex justify-between">
          <h3 class="text-lg font-medium leading-6 text-gray-900">User Information</h3>
          <UpdateProfile />
        </div>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details of the user.</p>
      </div>
      <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl class="sm:divide-y sm:divide-gray-200">
          <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">First Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ user.data.value.firstName }}
            </dd>
          </div>
          <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">Last Name</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ user.data.value.lastName }}
            </dd>
          </div>
          <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">Email Address</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ user.data.value.email }}
            </dd>
          </div>
          <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">Role</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ user.data.value.role }}
            </dd>
          </div>
          <div class="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
            <dt class="text-sm font-medium text-gray-500">Bio</dt>
            <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {{ user.data.value.bio }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </ContentLayout>
</template>
