import { useMutation } from "@pinia/colada";

interface UseLogoutConfig {
  onSuccess?: () => void;
}

export const useLogout = (config?: UseLogoutConfig) => {
  const { $api } = useNuxtApp();
  const { clear } = useUserSession();

  const { mutate, isLoading, error } = useMutation({
    mutation: async (): Promise<void> => {
      await $api("/api/auth/logout", {
        method: "POST",
      });

      // Clear the local session
      await clear();
    },
    onSuccess: () => {
      config?.onSuccess?.();
    },
  });

  return {
    mutate,
    isLoading,
    error,
  };
};
