import { computed } from "vue";
import type { User } from "~auth/shared/types";

export const useUser = () => {
  const { user: sessionUser, loggedIn, fetch } = useUserSession();
  const user = computed(() => sessionUser.value as User | null);

  const isAuthenticated = computed(() => loggedIn.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  return {
    user,
    isAuthenticated,
    isAdmin,
    refetch: fetch,
  };
};
