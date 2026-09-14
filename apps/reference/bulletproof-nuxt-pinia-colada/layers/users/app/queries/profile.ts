import { defineMutationOptions } from "@pinia/colada";
import { useRequiredUserSessionRefresh } from "~auth/app/composables/useRequiredUserSessionRefresh";
import type { UpdateProfileInput } from "~users/shared/schemas";

export const updateProfileMutation = defineMutationOptions(() => {
  const refreshRequiredSession = useRequiredUserSessionRefresh();

  return {
    mutation: async (input: UpdateProfileInput): Promise<void> => {
      const { $api } = useNuxtApp();
      await $api("/api/profile", {
        method: "PATCH",
        body: input,
      });
      await refreshRequiredSession();
    },
  };
});
