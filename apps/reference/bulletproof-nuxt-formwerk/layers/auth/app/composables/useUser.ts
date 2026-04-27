import { computed } from "vue";

export const useUser = () => {
  const { user, loggedIn, fetch } = useUserSession();

  const isAuthenticated = computed(() => loggedIn.value);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  return {
    user,
    isAuthenticated,
    isAdmin,
    refetch: fetch,
  };
};
