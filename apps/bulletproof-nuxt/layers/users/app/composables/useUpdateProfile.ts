import { useRequiredUserSessionRefresh } from "#layers/auth/app/composables/useRequiredUserSessionRefresh";

export const useUpdateProfile = () => {
  const { $api } = useNuxtApp();
  const refreshSession = useRequiredUserSessionRefresh();

  return async (input: UpdateProfileInput) => {
    await $api("/api/profile", {
      method: "PATCH",
      body: input,
    });

    await refreshSession();
  };
};
