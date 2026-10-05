<script setup lang="ts">
import { toast } from "vue-sonner";

const { user, isAuthenticated } = useUser();
const route = useRoute();
const router = useRouter();

const { clear: clearSession } = useUserSession();
const isPending = ref(false);

const handleLogout = async () => {
  if (isPending.value) return;
  isPending.value = true;
  const currentPath = route.fullPath;

  try {
    await clearSession();
    toast.success("Logged Out");
  }
  catch {
    toast.error("Logout Failed");
    isPending.value = false;
    return;
  }

  try {
    await router.push(`/auth/login?redirectTo=${encodeURIComponent(currentPath)}`);
  }
  catch {
    toast.error("Navigation Failed", {
      description: "You are logged out, but the login page could not be opened.",
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
      <p class="text-muted-foreground">
        {{ user?.email }}
      </p>
    </div>
    <Button
      variant="destructive"
      :disabled="isPending"
      @click="handleLogout"
    >
      {{ isPending ? 'Logging out...' : 'Logout' }}
    </Button>
  </div>
  <div
    v-else
    class="text-sm"
  >
    <NuxtLink
      to="/auth/login"
      class="text-primary hover:underline"
    >Log In</NuxtLink>
  </div>
</template>
