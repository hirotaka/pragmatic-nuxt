<script setup lang="ts">
import { useUser } from "~auth/app/composables/useUser";
import { useLogout } from "~auth/app/composables/useLogout";

const { user, isAuthenticated } = useUser();
const route = useRoute();
const router = useRouter();

const logout = useLogout({
  onSuccess: () => {
    router.push(`/auth/login?redirectTo=${encodeURIComponent(route.fullPath)}`);
  },
});

const handleLogout = () => {
  logout.mutate();
};
</script>

<template>
  <div
    v-if="isAuthenticated"
    class="flex items-center gap-4"
  >
    <div class="text-sm">
      <p class="font-medium">
        {{ user?.firstName }} {{ user?.lastName }}
      </p>
      <p class="text-gray-600">
        {{ user?.email }}
      </p>
    </div>
    <button
      :disabled="logout.isLoading.value"
      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      @click="handleLogout"
    >
      {{ logout.isLoading.value ? 'Logging out...' : 'Logout' }}
    </button>
  </div>
  <div
    v-else
    class="text-sm"
  >
    <NuxtLink
      to="/auth/login"
      class="text-blue-600 hover:underline"
    >Log In</NuxtLink>
  </div>
</template>
