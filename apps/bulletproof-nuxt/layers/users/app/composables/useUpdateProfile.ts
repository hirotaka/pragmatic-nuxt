import type { UpdateProfileInput } from "~users/shared/schemas";

export const useUpdateProfile = () => {
  const { $api } = useNuxtApp();
  const { fetch: refreshSession } = useUserSession();

  return async (input: UpdateProfileInput) => {
    await $api("/api/profile", {
      method: "PATCH",
      body: input,
    });

    await refreshSession();
  };
};
