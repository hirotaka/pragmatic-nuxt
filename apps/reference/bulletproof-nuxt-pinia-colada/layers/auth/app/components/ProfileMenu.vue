<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "~auth/app/composables/useUser";
import { useNotifications } from "#layers/base/app/composables/useNotifications";

const { user, isAuthenticated } = useUser();
const route = useRoute();
const router = useRouter();
const { addNotification } = useNotifications();

const { clear: clearSession } = useUserSession();
const isPending = ref(false);

const handleLogout = async () => {
  if (isPending.value) return;
  isPending.value = true;
  const currentPath = route.fullPath;

  try {
    await clearSession();
    addNotification({
      type: "success",
      title: "Logged Out",
    });
  }
  catch {
    addNotification({
      type: "error",
      title: "Logout Failed",
    });
    isPending.value = false;
    return;
  }

  try {
    await router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
  }
  catch {
    addNotification({
      type: "error",
      title: "Navigation Failed",
      message: "You are logged out, but the login page could not be opened.",
    });
  }
  finally {
    isPending.value = false;
  }
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
      :disabled="isPending"
      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      @click="handleLogout"
    >
      {{ isPending ? 'Logging out...' : 'Logout' }}
    </button>
  </div>
  <div
    v-else
    class="text-sm"
  >
    <NuxtLink
      to="/auth/login"
      class="text-blue-600 hover:underline"
    >
      Log In
    </NuxtLink>
  </div>
</template>
